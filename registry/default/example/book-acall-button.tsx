import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  type Transition,
} from 'framer-motion';
import { Plus } from 'lucide-react';

export interface BookACallButtonProps {
  /** Text displayed at resting state */
  defaultText?: string;
  /** Text displayed in the final talk stage */
  hoverText?: string;
  /** Optional portrait URL — falls back to the illustrated avatar */
  avatarUrl?: string;
  /** Custom click handler */
  onClick?: () => void;
  /** Custom class names */
  className?: string;
}

type Stage = 'idle' | 'plus' | 'typing' | 'talk';

// Geometry (px). Every element is absolutely positioned so nothing reflows mid-animation.
const HEIGHT = 52;
const CIRCLE = 32;
const INSET = (HEIGHT - CIRCLE) / 2; // 10
const IDLE_PAD_X = 32;
const PLUS_SIZE = 14;
const GAP = 10;
const OVERLAP = 10;

const PLUS_X = INSET + CIRCLE + GAP; // 52
const YOU_X_PLUS = PLUS_X + PLUS_SIZE + GAP; // 76
const YOU_X_TALK = INSET + CIRCLE - OVERLAP; // 32
const TALK_TEXT_X = YOU_X_TALK + CIRCLE + 12; // 76
const PLUS_WIDTH = YOU_X_PLUS + CIRCLE + INSET; // 118

const DOTS_WIDTH = 24;

const MERGE_DELAY_MS = 420;
const TYPING_MS = 700;
const MAGNET_STRENGTH = { x: 0.12, y: 0.18 };

// Motion language: critically-damped glides for size/position, a hint of
// settle for things that "land", and long ease-out fades for text.
const easeOut = [0.22, 1, 0.36, 1] as const;
const glide: Transition = { type: 'spring', visualDuration: 0.5, bounce: 0 };
const settle: Transition = { type: 'spring', visualDuration: 0.45, bounce: 0.18 };
const fade: Transition = { duration: 0.4, ease: easeOut };
const magnetSpring = { stiffness: 150, damping: 15, mass: 0.4 };
const lightSpring = { stiffness: 300, damping: 30, mass: 0.3 };

export const BookACallButton: React.FC<BookACallButtonProps> = ({
  defaultText = 'BOOK A CALL',
  hoverText = "Let's talk!",
  avatarUrl,
  onClick,
  className = '',
}) => {
  const [stage, setStage] = useState<Stage>('idle');
  const reduceMotion = useReducedMotion();

  const idleRef = useRef<HTMLSpanElement>(null);
  const talkRef = useRef<HTMLSpanElement>(null);
  const avatarFaceRef = useRef<HTMLDivElement>(null);
  const youFaceRef = useRef<HTMLDivElement>(null);
  const [textWidths, setTextWidths] = useState({ idle: 0, talk: 0 });
  const [ready, setReady] = useState(false);

  // Magnetic offset + cursor position for the light
  const magnetX = useSpring(0, magnetSpring);
  const magnetY = useSpring(0, magnetSpring);
  const lightX = useSpring(0, lightSpring);
  const lightY = useSpring(0, lightSpring);
  const light = useMotionTemplate`radial-gradient(120px circle at ${lightX}px ${lightY}px, rgba(255,255,255,0.11), transparent 70%)`;

  // Measure label widths so the pill can animate to exact sizes.
  // Transforms/clip-path don't affect offsetWidth, so this stays stable mid-animation.
  useLayoutEffect(() => {
    const measure = () =>
      setTextWidths({
        idle: idleRef.current?.offsetWidth ?? 0,
        talk: talkRef.current?.offsetWidth ?? 0,
      });
    measure();
    // Apply the first measured width instantly; only animate later changes.
    const raf = requestAnimationFrame(() => setReady(true));
    const ro = new ResizeObserver(measure);
    if (idleRef.current) ro.observe(idleRef.current);
    if (talkRef.current) ro.observe(talkRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  // Avatar + YOU sit apart briefly, merge, "type" for a moment, then the message lands.
  useEffect(() => {
    if (stage !== 'plus' && stage !== 'typing') return;
    const next: Stage = stage === 'plus' && !reduceMotion ? 'typing' : 'talk';
    const delay = reduceMotion ? 0 : stage === 'plus' ? MERGE_DELAY_MS : TYPING_MS;
    const t = setTimeout(() => setStage(next), delay);
    return () => clearTimeout(t);
  }, [stage, reduceMotion]);

  const open = () => setStage((s) => (s === 'idle' ? 'plus' : s));
  const close = () => setStage('idle');

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    lightX.set(localX);
    lightY.set(localY);
    if (reduceMotion || e.pointerType !== 'mouse') return;
    magnetX.set((localX - rect.width / 2) * MAGNET_STRENGTH.x);
    magnetY.set((localY - rect.height / 2) * MAGNET_STRENGTH.y);
  };

  const handlePointerLeave = () => {
    magnetX.set(0);
    magnetY.set(0);
    close();
  };

  // The two faces "clink" together on click.
  const handleClick = () => {
    if (!reduceMotion && avatarFaceRef.current && youFaceRef.current) {
      const clink = { duration: 0.6, times: [0, 0.3, 1], ease: easeOut };
      animate(avatarFaceRef.current, { x: [0, 3, 0], rotate: [0, 7, 0] }, clink);
      animate(youFaceRef.current, { x: [0, -4, 0], rotate: [0, -9, 0] }, clink);
    }
    setStage('talk');
    onClick?.();
  };

  const isIdle = stage === 'idle';
  const isTyping = stage === 'typing';
  const isTalk = stage === 'talk';
  const isMerged = isTyping || isTalk;

  const width =
    stage === 'idle'
      ? textWidths.idle + IDLE_PAD_X * 2
      : stage === 'plus'
        ? PLUS_WIDTH
        : stage === 'typing'
          ? TALK_TEXT_X + DOTS_WIDTH + 20
          : TALK_TEXT_X + textWidths.talk + 20;

  const t = (transition: Transition, delay = 0): Transition =>
    reduceMotion ? { duration: 0 } : { ...transition, delay };

  return (
    <motion.button
      type="button"
      aria-label={defaultText}
      onPointerEnter={open}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onFocus={open}
      onBlur={close}
      onClick={handleClick}
      initial={false}
      animate={{ width: width || 'auto' }}
      transition={ready ? t(glide) : { duration: 0 }}
      whileTap={{ scale: 0.97, transition: { type: 'spring', stiffness: 500, damping: 30 } }}
      className={`relative inline-block shrink-0 select-none cursor-pointer overflow-hidden rounded-full bg-[#111111] text-white border border-white/[0.06] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#e8e8ea] ${className}`}
      style={{ height: HEIGHT, x: magnetX, y: magnetY }}
    >
      {/* Cursor light */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{ opacity: isIdle ? 0 : 1 }}
        transition={t(fade)}
        className="pointer-events-none absolute inset-0"
        style={{ background: light }}
      />

      {/* Resting label */}
      <motion.span
        ref={idleRef}
        aria-hidden={!isIdle}
        initial={false}
        animate={
          isIdle
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : { opacity: 0, y: -8, filter: 'blur(2px)' }
        }
        transition={t(isIdle ? fade : { duration: 0.22, ease: easeOut }, isIdle ? 0.1 : 0)}
        className="absolute top-0 bottom-0 flex items-center whitespace-nowrap text-[13px] sm:text-[14px] font-bold tracking-[0.08em] uppercase"
        style={{ left: IDLE_PAD_X }}
      >
        {defaultText}
      </motion.span>

      {/* Host avatar */}
      <motion.div
        initial={false}
        animate={
          isIdle
            ? { opacity: 0, y: 10, scale: 0.85 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={t(isIdle ? glide : settle, isIdle ? 0 : 0.05)}
        className="absolute"
        style={{ left: INSET, top: INSET, width: CIRCLE, height: CIRCLE }}
      >
        <div
          ref={avatarFaceRef}
          className="h-full w-full rounded-full overflow-hidden bg-neutral-800 ring-1 ring-white/10"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              draggable={false}
              decoding="async"
              className="w-full h-full object-cover grayscale contrast-110"
            />
          ) : (
            <IllustratedAvatar glance={isMerged} smile={isTalk} still={!!reduceMotion} />
          )}
        </div>
      </motion.div>

      {/* Plus */}
      <motion.div
        initial={false}
        animate={
          stage === 'plus'
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0, scale: 0.4, rotate: isMerged ? 90 : -90 }
        }
        transition={t(stage === 'plus' ? settle : glide, stage === 'plus' ? 0.1 : 0)}
        className="absolute flex items-center justify-center"
        style={{ left: PLUS_X, top: (HEIGHT - PLUS_SIZE) / 2, width: PLUS_SIZE, height: PLUS_SIZE }}
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </motion.div>

      {/* YOU badge — slides over to overlap the avatar */}
      <motion.div
        initial={false}
        animate={
          isIdle
            ? { opacity: 0, x: YOU_X_PLUS, y: 10, scale: 0.85 }
            : { opacity: 1, x: isMerged ? YOU_X_TALK : YOU_X_PLUS, y: 0, scale: 1 }
        }
        transition={t(stage === 'plus' ? settle : glide, stage === 'plus' ? 0.12 : 0)}
        className="absolute left-0 z-10"
        style={{ top: INSET, width: CIRCLE, height: CIRCLE }}
      >
        <div
          ref={youFaceRef}
          className="flex h-full w-full items-center justify-center rounded-full bg-white text-black ring-2 ring-[#111111]"
        >
          <span className="text-[10px] font-extrabold tracking-tight uppercase leading-none">
            You
          </span>
        </div>
      </motion.div>

      {/* Typing indicator */}
      <motion.div
        aria-hidden
        initial={false}
        animate={isTyping ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={t(isTyping ? settle : { duration: 0.2, ease: easeOut }, isTyping ? 0.15 : 0)}
        className="absolute top-0 bottom-0 flex items-center gap-1"
        style={{ left: TALK_TEXT_X, width: DOTS_WIDTH, transformOrigin: 'left center' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-white/70"
            animate={isTyping && !reduceMotion ? { y: [0, -2.5, 0], opacity: [0.45, 1, 0.45] } : { y: 0, opacity: 0.45 }}
            transition={
              isTyping && !reduceMotion
                ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
                : fade
            }
          />
        ))}
      </motion.div>

      {/* Message — letters arrive one by one */}
      <span
        ref={talkRef}
        aria-hidden={!isTalk}
        className="absolute top-0 bottom-0 flex items-center whitespace-nowrap text-[14px] sm:text-[15px] font-bold"
        style={{ left: TALK_TEXT_X }}
      >
        {Array.from(hoverText).map((char, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={
              isTalk
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 5 }
            }
            transition={t(isTalk ? fade : { duration: 0.18, ease: easeOut }, isTalk ? 0.04 + i * 0.024 : 0)}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </motion.button>
  );
};

// Line-drawn face. Blinks now and then, glances at YOU as they meet, smiles when talking.
const MOUTH_NEUTRAL = 'M14.4 19 Q16 19.6 17.6 19';
const MOUTH_SMILE = 'M13.9 18.6 Q16 20.9 18.1 18.6';
const INK = '#f5f5f5';
const SKIN = '#2b2b2b';

const IllustratedAvatar: React.FC<{ glance: boolean; smile: boolean; still: boolean }> = ({
  glance,
  smile,
  still,
}) => (
  <svg viewBox="6.5 4.5 22 22" className="h-full w-full" aria-hidden>
    <rect x="0" y="0" width="34" height="34" fill={SKIN} />

    {/* Shoulders + neck */}
    <path
      d="M5.5 33 C6.5 26.2 10.5 24 16 24 C21.5 24 25.5 26.2 26.5 33"
      fill={SKIN}
      stroke={INK}
      strokeWidth="0.95"
    />
    <path d="M13.6 21 V24.2 M18.4 21 V24.2" stroke={INK} strokeWidth="0.95" strokeLinecap="round" />

    {/* Head */}
    <ellipse cx="16" cy="15" rx="6.2" ry="7" fill={SKIN} stroke={INK} strokeWidth="0.95" />

    {/* Hair */}
    <path
      d="M9.7 14 C9.3 8.6 12.4 6.8 16 6.9 C19.9 6.9 22.8 9.2 22.3 13.6 C20.6 11.6 18.3 10.9 15.4 11 C13.1 11.1 11 12 9.7 14 Z"
      fill={INK}
    />

    {/* Eyes */}
    <motion.g
      initial={false}
      animate={{ x: glance ? 0.7 : 0 }}
      transition={still ? { duration: 0 } : { type: 'spring', visualDuration: 0.4, bounce: 0 }}
    >
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={still ? undefined : { scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 0.22, times: [0, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 3.4 }}
      >
        <circle cx="13.6" cy="15.4" r="0.95" fill={INK} />
        <circle cx="18.4" cy="15.4" r="0.95" fill={INK} />
      </motion.g>
    </motion.g>

    {/* Mouth */}
    <motion.path
      initial={false}
      animate={{ d: smile ? MOUTH_SMILE : MOUTH_NEUTRAL }}
      transition={still ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      fill="none"
      stroke={INK}
      strokeWidth="0.9"
      strokeLinecap="round"
    />
  </svg>
);

export default BookACallButton;
