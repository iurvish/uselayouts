import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useAnimationControls,
  type Transition,
} from 'framer-motion';

/*
 * Font: load "Plus Jakarta Sans" (Google Fonts, wght@400..800) in your app shell.
 * The component falls back to the system UI font.
 */

export interface InviteFriendCardProps {
  /** Send the invite. Return a promise to show "Sending…"; reject it to show the failure state. */
  onSendInvite?: (name: string, email: string, sendReminder: boolean) => void | Promise<void>;
  /** Called when the user turns the 5-day reminder off (or back on) after sending. */
  onReminderChange?: (email: string, enabled: boolean) => void;
  /** Shareable invite link. The "Copy invite link" button is hidden when omitted. */
  inviteLink?: string;
  defaultName?: string;
  defaultEmail?: string;
}

type Step = 1 | 2 | 3;

const MUTED = '#6b6f80'; // 5:1 on white, readable at small sizes
const DANGER = '#d23c42';

const LABELS: Record<Step, string> = { 1: 'Next', 2: 'Send invite', 3: 'Invite someone else' };
const DOMAINS = ['gmail.com', 'outlook.com', 'icloud.com', 'yahoo.com', 'hotmail.com', 'proton.me'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Springs with a little give, so things settle like physical objects rather than stopping dead.
const spring: Transition = { type: 'spring', duration: 0.5, bounce: 0.18 };
const press: Transition = { type: 'spring', stiffness: 700, damping: 30 };
const fade: Transition = { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] };

// Radii live in `style` (not classes) so layout animations can correct them while scaling.
const CARD_RADIUS = 18;
const PEEK_RADIUS = 15;
const PILL_RADIUS = 999;

// "leo@g" -> "mail.com"
const domainCompletion = (value: string) => {
  const at = value.indexOf('@');
  if (at < 1 || value.indexOf('@', at + 1) !== -1) return '';
  const typed = value.slice(at + 1).toLowerCase();
  const match = DOMAINS.find((d) => d.startsWith(typed) && d !== typed);
  return match ? match.slice(typed.length) : '';
};

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? '';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[rgba(10,10,20,0.28)]';

const cardClass =
  'relative z-10 bg-white border-[1.5px] border-[#e4e4e8] px-6 min-h-[60px] flex items-center overflow-hidden focus-within:border-[#c8c8d0] transition-[border-color] duration-200';

const fieldClass =
  'w-full bg-transparent border-0 outline-none p-0 text-[18px] font-medium tracking-[-0.01em] text-[#1c1d2b] placeholder:text-[#a3a5b3] placeholder:font-normal';

const linkClass =
  'text-[#1c1d2b] font-medium underline underline-offset-2 decoration-[#c8c8d0] hover:decoration-[#1c1d2b] cursor-pointer rounded-sm';

const quietButtonClass = `text-[15px] font-medium text-[#6b6f80] hover:text-[#1c1d2b] transition-colors cursor-pointer rounded-md ${focusRing}`;

const swap = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: fade,
};

const crossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: fade,
};

export const InviteFriendCard: React.FC<InviteFriendCardProps> = ({
  onSendInvite,
  onReminderChange,
  inviteLink,
  defaultName = '',
  defaultEmail = '',
}) => {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [reminder, setReminder] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [caretAtEnd, setCaretAtEnd] = useState(true);
  // Bumped for every new invite, so the name card's layoutId never matches the previous strip.
  const [round, setRound] = useState(0);
  const nameCardId = `invite-name-card-${round}`;

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const shake = useAnimationControls();

  const firstName = firstNameOf(name);
  const completion = step === 2 && caretAtEnd ? domainCompletion(email) : '';
  const label = sending ? 'Sending…' : LABELS[step];

  useEffect(() => {
    const target =
      step === 1 ? nameInputRef.current : step === 2 ? emailInputRef.current : actionButtonRef.current;
    // Keep keyboard flow going without flashing a focus ring on the button.
    const frame = requestAnimationFrame(() =>
      target?.focus({ preventScroll: true, focusVisible: false } as FocusOptions),
    );
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const goTo = (next: Step) => {
    setError('');
    setStep(next);
  };

  const fail = (message: string, input: HTMLInputElement | null) => {
    setError(message);
    // Wait for React to re-enable the input (it is disabled while sending) before focusing.
    setTimeout(() => input?.focus(), 0);
    shake.start({ x: [0, -9, 8, -6, 4, -2, 0], transition: { duration: 0.5, ease: 'easeOut' } });
  };

  const handleNext = async () => {
    if (sending) return;

    if (step === 1) {
      if (!name.trim()) return fail('Add a name to continue.', nameInputRef.current);
      setName(name.trim());
      goTo(2);
    } else if (step === 2) {
      const value = (email + completion).trim();
      if (!value) return fail(`Add ${firstName}'s email to send the invite.`, emailInputRef.current);
      if (!EMAIL_RE.test(value)) {
        return fail('Check the email address. It should look like name@example.com.', emailInputRef.current);
      }
      setEmail(value);
      setError('');
      setSending(true);
      try {
        await onSendInvite?.(name, value, true);
      } catch {
        setSending(false);
        return fail("Couldn't send the invite. Check your connection and try again.", emailInputRef.current);
      }
      setSending(false);
      setReminder(true);
      goTo(3);
    } else {
      setName('');
      setEmail('');
      setCaretAtEnd(true);
      setRound((r) => r + 1);
      goTo(1);
    }
  };

  const handleBack = () => {
    if (step === 2 && !sending) goTo(1);
  };

  const toggleReminder = () => {
    const enabled = !reminder;
    setReminder(enabled);
    onReminderChange?.(email, enabled);
  };

  // On phones, open the share sheet (WhatsApp, Messages…); elsewhere, copy to the clipboard.
  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

  const shareLink = async () => {
    if (!inviteLink) return;
    if (canShare) {
      try {
        await navigator.share({ title: 'Join me', url: inviteLink });
      } catch {
        // Closing the share sheet throws; nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      setError('');
      setCopied(true);
    } catch {
      setError(`Couldn't copy. Here's the link: ${inviteLink}`);
    }
  };

  const trackCaret = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { selectionEnd, value } = e.currentTarget;
    setCaretAtEnd(selectionEnd === null || selectionEnd === value.length);
  };

  const acceptCompletion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (completion && ((e.key === 'Tab' && !e.shiftKey) || e.key === 'ArrowRight')) {
      e.preventDefault();
      setEmail(email + completion);
    }
  };

  const noteKey = error ? `error:${error}` : step === 3 ? `reminder:${reminder}` : 'empty';

  return (
    <MotionConfig transition={spring} reducedMotion="user">
      <LayoutGroup id="invite-friend">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleBack();
          }}
          style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
          className="w-full max-w-[400px] text-[#1c1d2b] antialiased"
        >
          <h2 className="mb-7 px-1 text-[23px] font-bold tracking-[-0.02em] leading-none">Invite a friend</h2>
          <span className="sr-only" aria-live="polite">
            {step < 3 ? `Step ${step} of 2` : 'Invite sent'}
          </span>

          {/* Card stack. The name card is a single shared element (layoutId):
              it shrinks into the strip behind the email card, and grows back on "Back". */}
          <motion.div animate={shake} className="relative flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {step >= 2 && (
                <motion.button
                  key="name-peek"
                  layoutId={nameCardId}
                  type="button"
                  aria-label={step === 2 ? `Edit name, ${name}` : `Sent to ${email}`}
                  disabled={sending || step === 3}
                  onClick={handleBack}
                  exit={{ opacity: 0, y: 18, scale: 0.97 }}
                  whileHover={step === 2 && !sending ? { y: -2 } : undefined}
                  whileTap={step === 2 && !sending ? { y: 0, scale: 0.99 } : undefined}
                  style={{ borderRadius: PEEK_RADIUS }}
                  className={`relative z-0 mx-3 -mb-[18px] h-12 bg-[#fafafb] border-[1.5px] border-[#ececf0] px-5 pt-[6px] flex items-start justify-between gap-3 text-left text-[13px] font-medium text-[#6b6f80] transition-colors disabled:cursor-default ${
                    step === 2 ? 'hover:text-[#1c1d2b] cursor-pointer' : ''
                  } ${focusRing}`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={step === 2 ? 'name' : 'email'} layout="position" {...crossfade} className="truncate">
                      {step === 2 ? name : email}
                    </motion.span>
                  </AnimatePresence>
                  <motion.span
                    layout="position"
                    animate={{ opacity: step === 2 ? 1 : 0 }}
                    transition={fade}
                    className="underline underline-offset-2 decoration-[#dcdce2]"
                  >
                    Edit
                  </motion.span>
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout" initial={false}>
              {step === 1 ? (
                <motion.div
                  key="name-card"
                  layoutId={nameCardId}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ borderRadius: CARD_RADIUS, borderColor: error ? '#f0b4b7' : undefined }}
                  className={cardClass}
                >
                  <motion.div layout="position" className="w-full">
                    <input
                      ref={nameInputRef}
                      type="text"
                      aria-label="Friend's name"
                      aria-invalid={!!error}
                      placeholder="Friend's name"
                      autoComplete="off"
                      spellCheck={false}
                      enterKeyHint="next"
                      maxLength={60}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      className={fieldClass}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail-card"
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  style={{
                    borderRadius: CARD_RADIUS,
                    borderColor: error ? '#f0b4b7' : undefined,
                    boxShadow: '0 1px 2px rgba(20,20,40,0.04), 0 10px 24px -14px rgba(20,20,40,0.22)',
                  }}
                  className={cardClass}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {step === 2 ? (
                      <motion.div key="email" {...crossfade} className="relative w-full">
                        <input
                          ref={emailInputRef}
                          // type="text" (not "email") so the caret position is readable for the
                          // inline completion; inputMode still brings up the email keyboard.
                          type="text"
                          inputMode="email"
                          aria-label={`${firstName}'s email`}
                          aria-invalid={!!error}
                          placeholder={`${firstName}'s email`}
                          autoComplete="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          enterKeyHint="send"
                          disabled={sending}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          onSelect={trackCaret}
                          onKeyUp={trackCaret}
                          onMouseUp={trackCaret}
                          onKeyDown={acceptCompletion}
                          className={fieldClass}
                        />
                        {/* Inline domain completion */}
                        <div aria-hidden className={`${fieldClass} absolute inset-0 pointer-events-none whitespace-pre overflow-hidden flex items-center`}>
                          <span className="invisible">{completion ? email : ''}</span>
                          <span className="text-[#a3a5b3] font-normal">{completion}</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="sent" {...crossfade} className="w-full flex items-center gap-3 min-w-0">
                        <motion.span
                          aria-hidden
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', duration: 0.45, bounce: 0.4 }}
                          className="w-6 h-6 shrink-0 rounded-full bg-black text-white grid place-items-center"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                              d="M5 12.5l4.5 4.5L19 7.5"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 0.32, delay: 0.12, ease: [0.65, 0, 0.35, 1] }}
                            />
                          </svg>
                        </motion.span>
                        <p className="text-[18px] font-medium tracking-[-0.01em] truncate">Invite sent to {firstName}.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Everything below the stack follows it with `layout`, so nothing snaps. */}
          <motion.div layout="position">
            <div aria-live="polite" className="relative mt-2 px-1 min-h-[18px] text-[13px] leading-[18px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {noteKey !== 'empty' && (
                  <motion.p key={noteKey} {...crossfade} style={{ color: error ? DANGER : MUTED }}>
                    {error ||
                      (reminder ? (
                        <>
                          We'll remind {firstName} in 5 days.{' '}
                          <button type="button" onClick={toggleReminder} className={linkClass}>
                            Don't remind
                          </button>
                        </>
                      ) : (
                        <>
                          No reminder will be sent.{' '}
                          <button type="button" onClick={toggleReminder} className={linkClass}>
                            Undo
                          </button>
                        </>
                      ))}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-1 flex items-center justify-between px-0.5">
              <div className="relative h-14 flex items-center pl-0.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {step === 2 ? (
                    <motion.button
                      key="back"
                      type="button"
                      onClick={handleBack}
                      disabled={sending}
                      {...swap}
                      className={quietButtonClass}
                    >
                      Back
                    </motion.button>
                  ) : (
                    inviteLink && (
                      <motion.button
                        key="copy"
                        type="button"
                        layout
                        onClick={shareLink}
                        {...swap}
                        whileTap={{ scale: 0.95, transition: press }}
                        style={{ borderRadius: PILL_RADIUS }}
                        className={`-ml-3 h-10 pl-3 pr-3.5 inline-flex items-center gap-2 text-[15px] font-medium text-[#4a4d5e] hover:text-[#1c1d2b] hover:bg-[#f3f3f6] active:bg-[#ececf0] transition-colors cursor-pointer ${focusRing}`}
                      >
                        <span className="relative w-4 h-4 shrink-0">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.svg
                              key={copied ? 'check' : canShare ? 'share' : 'link'}
                              aria-hidden
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                              className="absolute inset-0 w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={copied ? 2.6 : 2.1}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {copied ? (
                                <polyline points="20 6 9 17 4 12" />
                              ) : canShare ? (
                                <>
                                  <path d="M12 3v12" />
                                  <polyline points="7 8 12 3 17 8" />
                                  <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
                                </>
                              ) : (
                                <>
                                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </>
                              )}
                            </motion.svg>
                          </AnimatePresence>
                        </span>
                        <span className="relative">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span key={String(copied)} layout="position" {...crossfade} className="inline-block whitespace-nowrap">
                              {copied ? 'Link copied' : canShare ? 'Share invite link' : 'Copy invite link'}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                      </motion.button>
                    )
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                ref={actionButtonRef}
                type="submit"
                layout
                aria-busy={sending}
                whileHover={sending ? undefined : { scale: 1.015 }}
                whileTap={sending ? undefined : { scale: 0.96, transition: press }}
                style={{ borderRadius: PILL_RADIUS }}
                className={`group h-14 px-7 inline-flex items-center gap-2.5 bg-black text-white text-[17px] font-semibold whitespace-nowrap overflow-hidden transition-opacity ${
                  sending ? 'opacity-70 cursor-progress' : 'hover:opacity-90 cursor-pointer'
                } ${focusRing}`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={label} layout="position" {...swap} className="inline-block">
                    {label}
                  </motion.span>
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {step === 1 && (
                    <motion.svg
                      key="arrow"
                      layout="position"
                      aria-hidden
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={fade}
                      className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </form>
      </LayoutGroup>
    </MotionConfig>
  );
};

export default InviteFriendCard;
