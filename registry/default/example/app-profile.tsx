
import React, { useState, useRef, useEffect } from 'react';
import { motion, MotionConfig, AnimatePresence, Transition, useMotionValue, useSpring } from 'framer-motion';
import { Plus, User, Share2, ArrowLeft } from 'lucide-react';

/* ───────────────────────────── Avatar ───────────────────────────── */

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Dhruv Avatar',
  size = 48,
  className = '',
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return <MinimalFace size={size} className={className} />;
};

// Minimal face: two eyes that slowly follow the cursor and blink now and then
const MinimalFace: React.FC<{ size: number; className: string }> = ({ size, className }) => {
  const lookX = useSpring(useMotionValue(0), { stiffness: 40, damping: 16 });
  const lookY = useSpring(useMotionValue(0), { stiffness: 40, damping: 16 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      lookX.set((e.clientX / window.innerWidth - 0.5) * 6);
      lookY.set((e.clientY / window.innerHeight - 0.5) * 4);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [lookX, lookY]);

  const blink = {
    animate: { scaleY: [1, 1, 0.1, 1] },
    transition: { duration: 4.5, times: [0, 0.94, 0.97, 1], repeat: Infinity, ease: 'easeInOut' as const },
  };

  return (
    <div
      className={`relative rounded-full overflow-hidden select-none bg-[#f3efe6] ${className}`}
      style={{ width: size, height: size }}
      aria-label="Dhruv"
      role="img"
    >
      <motion.div className="absolute inset-0" style={{ x: lookX, y: lookY }}>
        <motion.span
          {...blink}
          className="absolute rounded-full bg-[#111]"
          style={{ width: size * 0.1, height: size * 0.17, left: '35%', top: '36%' }}
        />
        <motion.span
          {...blink}
          className="absolute rounded-full bg-[#111]"
          style={{ width: size * 0.1, height: size * 0.17, left: '55%', top: '36%' }}
        />
        <span
          className="absolute border-b-[1.5px] border-[#111] rounded-b-full"
          style={{ width: size * 0.16, height: size * 0.08, left: '42%', top: '60%' }}
        />
      </motion.div>
    </div>
  );
};

/* ─────────────────────────── Profile pill ─────────────────────────── */

export type PillMode = 'collapsed' | 'preview' | 'bio' | 'share';

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

export interface ProfilePillProps {
  name?: string;
  greeting?: string;
  bio?: string;
  avatarUrl?: string;
  socials?: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    threads?: string;
    email?: string;
    snapchat?: string;
  };
}

// Crisp SVGs in pure white
const GithubIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// Classic White Twitter Bird Logo
const TwitterIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-white stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0 0-2.92 1.46 1.46 0 0 0 0 2.92M7.86 18.5v-8.37H5.07v8.37z" />
  </svg>
);

const ThreadsIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-white stroke-[2.2]" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19.25 12.05C19.25 16.03 16.03 19.25 12.05 19.25C8.07 19.25 4.85 16.03 4.85 12.05C4.85 8.07 8.07 4.85 12.05 4.85C16.03 4.85 19.25 8.07 19.25 12.05Z" />
    <path d="M15.5 10.5C15.2 9.2 13.9 8.2 12.1 8.2C9.8 8.2 8.5 9.9 8.5 12.1C8.5 14.3 9.9 15.9 12.2 15.9C14.1 15.9 15.3 14.8 15.6 13.5C15.8 12.7 15.4 11.9 14.6 11.8C13.8 11.7 12.9 12.2 12.8 13.1C12.7 13.7 12.3 14.1 11.8 14.1C11.1 14.1 10.6 13.4 10.6 12.1C10.6 10.8 11.2 10.1 12.1 10.1C12.8 10.1 13.3 10.5 13.4 11.1" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-white stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SnapchatIcon = () => (
  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M12.002 2c-3.79 0-5.83 2.766-5.83 5.488 0 1.25.438 2.502.946 3.23.133.19.146.335.038.52-.162.277-.565.845-1.205 1.137-.39.178-.71.185-.953.195-.31.013-.483.2-.497.433-.016.27.184.544.593.682.808.272 1.488.082 2.054-.257.243-.146.45-.164.63-.057.447.266 1.41.83 2.148 1.05.358.107.69.176 1.056.2.02.001.04.002.06.002.04 0 .08 0 .12-.002.366-.024.698-.093 1.056-.2.738-.22 1.701-.784 2.148-1.05.18-.107.387-.09.63.057.566.34 1.246.53 2.054.257.409-.138.61-.412.593-.682-.014-.233-.187-.42-.497-.433-.243-.01-.563-.017-.953-.195-.64-.292-1.043-.86-1.205-1.137-.108-.185-.095-.33.038-.52.508-.728.946-1.98.946-3.23C17.832 4.766 15.792 2 12.002 2z" />
  </svg>
);

export const DynamicProfilePill: React.FC<ProfilePillProps> = ({
  name = 'Dhruv',
  greeting = "Hello, I'm",
  bio = 'Mechatronics engineer integrating hardware and software to create applications in machine learning, robotics, and finance. Currently working at Innovatio Labs. Previously worked at Cridaa and Accelus Robotics.',
  avatarUrl,
  socials = {
    github: 'https://github.com/dhruvraghavani',
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com/in/dhruvraghavani',
    threads: 'https://threads.net',
    email: 'mailto:dhruvraghavani@gmail.com',
    snapchat: 'https://snapchat.com',
  },
}) => {
  const [mode, setMode] = useState<PillMode>('collapsed');
  const [hovered, setHovered] = useState<string | null>(null);
  const [time, setTime] = useState(() => formatTime());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHovered(null), [mode]);

  // Live local time (IST) for the caption
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Pill drifts a few pixels toward the cursor — slow and heavy
  const driftX = useSpring(useMotionValue(0), { stiffness: 30, damping: 18, mass: 1.4 });
  const driftY = useSpring(useMotionValue(0), { stiffness: 30, damping: 18, mass: 1.4 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      driftX.set((e.clientX / window.innerWidth - 0.5) * 14);
      driftY.set((e.clientY / window.innerHeight - 0.5) * 10);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [driftX, driftY]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (mode !== 'collapsed') {
          setMode('collapsed');
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode !== 'collapsed') {
        setMode('collapsed');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mode]);

  // Social icons list with classic white Twitter bird logo
  const socialItems: SocialLink[] = [
    { id: 'github', name: 'GitHub', url: socials.github || 'https://github.com', icon: <GithubIcon /> },
    { id: 'twitter', name: 'Twitter', url: socials.twitter || 'https://twitter.com', icon: <TwitterIcon /> },
    { id: 'instagram', name: 'Instagram', url: socials.instagram || 'https://instagram.com', icon: <InstagramIcon /> },
    { id: 'linkedin', name: 'LinkedIn', url: socials.linkedin || 'https://linkedin.com', icon: <LinkedinIcon /> },
    { id: 'threads', name: 'Threads', url: socials.threads || 'https://threads.net', icon: <ThreadsIcon /> },
    { id: 'email', name: 'Email', url: socials.email || 'mailto:dhruvraghavani@gmail.com', icon: <MailIcon /> },
    { id: 'snapchat', name: 'Snapchat', url: socials.snapchat || 'https://snapchat.com', icon: <SnapchatIcon /> },
  ];

  // Slow, soft spring — calm "slow-motion" feel without bounce
  const shellTransition: Transition = { type: 'spring', duration: 0.95, bounce: 0.12 };
  const softEase = [0.22, 1, 0.36, 1] as const;

  // Content gently un-blurs into place
  const fadeIn = {
    initial: { opacity: 0, filter: 'blur(6px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    transition: { duration: 0.7, ease: softEase, delay: 0.12 },
  };

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 6, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.7, ease: softEase, delay },
  });

  const words = bio.split(' ');

  // One quiet line under the pill that changes with each state
  const caption: { key: string; node: React.ReactNode } =
    mode === 'collapsed'
      ? { key: 'hint', node: 'tap to say hi' }
      : mode === 'preview'
        ? {
            key: 'time',
            node: (
              <span className="flex items-center gap-2">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#27c93f]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                available · {time} IST
              </span>
            ),
          }
        : mode === 'share'
          ? { key: hovered ?? 'find', node: hovered ? hovered.toLowerCase() : 'find me on' }
          : { key: 'back', node: 'tap card to go back' };

  return (
    <motion.div
      ref={containerRef}
      style={{ x: driftX, y: driftY }}
      className="relative select-none flex flex-col items-center justify-center"
    >
      <motion.div
        layout
        transition={shellTransition}
        className="relative bg-black text-white ring-1 ring-white/[0.06] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35),0_4px_14px_rgba(0,0,0,0.10)] overflow-hidden"
        style={{ borderRadius: mode === 'bio' ? 28 : 9999 }}
      >
        {/* Faint light that sweeps across now and then */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent skew-x-[-20deg]"
          animate={{ x: ['0%', '400%'] }}
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 6 }}
        />
        {/* 1. COLLAPSED PILL */}
        {mode === 'collapsed' && (
          <motion.div
            key="collapsed"
            layout="position"
            {...fadeIn}
            onClick={() => setMode('preview')}
            className="flex items-center gap-2 p-2 cursor-pointer"
          >
            <motion.div layoutId="avatar-pill" transition={shellTransition} className="w-[46px] h-[46px] rounded-full overflow-hidden flex-shrink-0">
              <Avatar src={avatarUrl} size={46} />
            </motion.div>

            <motion.button
              type="button"
              whileHover="hover"
              whileTap={{ scale: 0.94 }}
              onClick={(e) => {
                e.stopPropagation();
                setMode('preview');
              }}
              className="relative w-[46px] h-[46px] rounded-full bg-[#27c93f] flex items-center justify-center text-white focus:outline-none cursor-pointer"
              aria-label="Expand profile"
            >
              {/* Slow breathing ring */}
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[#27c93f]"
                animate={{ scale: [1, 1.35], opacity: [0.45, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', repeatDelay: 0.8 }}
              />
              <motion.span
                className="relative flex"
                variants={{ hover: { rotate: 90 } }}
                transition={{ duration: 0.6, ease: softEase }}
              >
                <Plus size={26} strokeWidth={2.8} />
              </motion.span>
            </motion.button>
          </motion.div>
        )}

        {/* 2. EXPANDED PREVIEW PILL */}
        {mode === 'preview' && (
          <motion.div
            key="preview"
            layout="position"
            className="flex items-center gap-3.5 p-2 pl-2 pr-2.5 min-w-[340px] sm:min-w-[370px]"
          >
            <motion.div
              layoutId="avatar-pill"
              transition={shellTransition}
              className="w-[46px] h-[46px] rounded-full overflow-hidden flex-shrink-0"
            >
              <Avatar src={avatarUrl} size={46} />
            </motion.div>

            <div className="flex flex-col justify-center flex-1 pr-2 select-none">
              <motion.span {...rise(0.15)} className="text-[13px] leading-tight text-[#8e8e93] font-normal tracking-wide">
                {greeting}
              </motion.span>
              <motion.span {...rise(0.25)} className="text-[17px] leading-tight font-bold text-white tracking-tight mt-0.5">
                {name}
              </motion.span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.8, bounce: 0.2, delay: 0.2 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMode('bio');
                }}
                className="w-[44px] h-[44px] rounded-full bg-[#ff9500] hover:bg-[#f08c00] flex items-center justify-center text-white transition-colors duration-300 focus:outline-none cursor-pointer"
                aria-label="View Info"
                title="View Info"
              >
                <User size={21} strokeWidth={2.4} />
              </motion.button>

              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', duration: 0.8, bounce: 0.2, delay: 0.3 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMode('share');
                }}
                className="w-[44px] h-[44px] rounded-full bg-[#007aff] hover:bg-[#0071eb] flex items-center justify-center text-white transition-colors duration-300 focus:outline-none cursor-pointer"
                aria-label="Share"
                title="Share"
              >
                <Share2 size={20} strokeWidth={2.4} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 3. SHARE / SOCIAL LINKS BAR */}
        {mode === 'share' && (
          <motion.div
            key="share"
            layout="position"
            className="flex items-center gap-4 sm:gap-5 p-2 pl-2 pr-4"
          >
            <motion.button
              type="button"
              {...rise(0.1)}
              whileHover={{ scale: 1.06, backgroundColor: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                setMode('preview');
              }}
              className="w-[44px] h-[44px] rounded-full bg-white/10 text-white flex items-center justify-center focus:outline-none flex-shrink-0 cursor-pointer"
              aria-label="Back to profile"
            >
              <ArrowLeft size={19} strokeWidth={2.4} />
            </motion.button>

            <div className="flex items-center gap-3.5 sm:gap-4">
              {socialItems.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...rise(0.18 + i * 0.07)}
                  onHoverStart={() => setHovered(item.name)}
                  onHoverEnd={() => setHovered(null)}
                  whileHover={{ y: -2, scale: 1.12, transition: { duration: 0.35, ease: softEase } }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-white opacity-80 hover:opacity-100 focus:outline-none flex items-center justify-center"
                  title={item.name}
                  aria-label={item.name}
                >
                  {item.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}

        {/* 4. EXPANDED BIO CARD — words drift in one by one */}
        {mode === 'bio' && (
          <motion.div
            key="bio"
            layout="position"
            onClick={() => setMode('preview')}
            className="w-[360px] sm:w-[410px] max-w-[92vw] p-6 cursor-pointer"
          >
            <p className="text-[15px] sm:text-[16px] leading-[1.6] text-[#f2f2f2] font-normal tracking-normal text-left">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block whitespace-pre"
                  {...rise(0.2 + i * 0.025)}
                >
                  {word + (i < words.length - 1 ? ' ' : '')}
                </motion.span>
              ))}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Caption under the pill */}
      <div className="absolute top-full mt-5 h-4 flex justify-center pointer-events-none">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={caption.key}
            initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: softEase }}
            className="font-['JetBrains_Mono',ui-monospace,monospace] text-[11px] tracking-[0.08em] text-black/40 whitespace-nowrap"
          >
            {caption.node}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function formatTime() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

/* ─────────────────────────────── Page ─────────────────────────────── */

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-screen w-full overflow-hidden bg-[#f4f4f4] flex items-center justify-center p-4 selection:bg-black selection:text-white">
        {/* Graph-paper dot grid that fades out toward the edges */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(0,0,0,0.13) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(ellipse 55% 50% at 50% 50%, black 10%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 55% 50% at 50% 50%, black 10%, transparent 75%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Pill enters slowly on first load */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <DynamicProfilePill
            name="Dhruv"
            greeting="Hello, I'm"
            bio="Mechatronics engineer integrating hardware and software to create applications in machine learning, robotics, and finance. Currently working at Innovatio Labs. Previously worked at Cridaa and Accelus Robotics."
            socials={{
              github: 'https://github.com/dhruvraghavani',
              twitter: 'https://twitter.com',
              instagram: 'https://instagram.com',
              linkedin: 'https://linkedin.com/in/dhruvraghavani',
              threads: 'https://threads.net',
              email: 'mailto:dhruvraghavani@gmail.com',
              snapchat: 'https://snapchat.com',
            }}
          />
        </motion.div>
      </main>
    </MotionConfig>
  );
}

