import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  type Transition,
  type Variants,
} from 'framer-motion';

export interface DockIconState {
  hovered: boolean;
  active: boolean;
}

export interface DockItem {
  id: string;
  label: string;
  /** Static node, or a render function to animate the icon from hover/active state */
  icon: React.ReactNode | ((state: DockIconState) => React.ReactNode);
  shortcut?: string[]; // e.g. ['⌘', 'K']
  hasNotification?: boolean;
  notificationColor?: string;
  onClick?: () => void;
}

export interface FloatingCapsuleDockProps {
  items?: DockItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

// Shared spring presets. Layout morphs use a single critically-tuned spring so
// every moving piece (hover pill, active pill, tooltip) travels in lockstep.
const morph: Transition = { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 };
const settle: Transition = { type: 'spring', bounce: 0.22, duration: 0.5 };
const snappy: Transition = { type: 'spring', bounce: 0.3, duration: 0.35 };
// Blur must never overshoot (negative blur is invalid), so it always uses a tween
const blurTween = { duration: 0.25, ease: 'easeOut' } as const;

const dockVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 24, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...settle, filter: blurTween, staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.3, y: 12, filter: 'blur(4px)' },
  show: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', transition: { ...snappy, filter: blurTween } },
};

// Tooltip label swap — slides in the direction the pointer travelled
const labelVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, y: dir * 10, filter: 'blur(3px)' }),
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, y: dir * -10, filter: 'blur(3px)' }),
};

const iconProps = {
  className: 'w-[21px] h-[21px] overflow-visible',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ChatIcon = ({ hovered }: DockIconState) => (
  <motion.svg
    {...iconProps}
    strokeWidth="1.9"
    style={{ originX: 0.15, originY: 0.85 }}
    animate={{ rotate: hovered ? [0, -14, 10, -6, 3, 0] : 0 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    {/* Typing dots appear on hover */}
    {[8.5, 12, 15.5].map((cx, i) => (
      <motion.circle
        key={cx}
        cx={cx}
        cy={11.5}
        r={0.9}
        fill="currentColor"
        stroke="none"
        initial={false}
        animate={
          hovered
            ? { opacity: [0.3, 1, 0.3], y: [0, -1.2, 0] }
            : { opacity: 0, y: 0 }
        }
        transition={
          hovered
            ? { duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }
            : { duration: 0.15 }
        }
      />
    ))}
  </motion.svg>
);

const ShareIcon = ({ hovered }: DockIconState) => (
  <svg {...iconProps} strokeWidth="1.9">
    <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    <motion.g
      initial={false}
      animate={{ y: hovered ? -2.5 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 14 }}
    >
      <polyline points="16 8 12 4 8 8" />
      <line x1="12" y1="4" x2="12" y2="15" />
    </motion.g>
  </svg>
);

const MenuIcon = ({ hovered }: DockIconState) => {
  const widths = hovered ? [20, 20, 20] : [15, 20, 14];
  return (
    <svg {...iconProps} strokeWidth="2.1">
      {[7, 12, 17].map((y, i) => (
        <motion.line
          key={y}
          x1={4}
          y1={y}
          y2={y}
          initial={false}
          animate={{ x2: widths[i] }}
          transition={{ type: 'spring', stiffness: 420, damping: 18, delay: i * 0.04 }}
        />
      ))}
    </svg>
  );
};

const defaultItems: DockItem[] = [
  { id: 'chat', label: 'Chat', shortcut: ['⌘', 'J'], icon: ChatIcon },
  { id: 'share', label: 'Share', shortcut: ['⌘', 'E'], icon: ShareIcon },
  {
    id: 'menu',
    label: 'Menu',
    shortcut: ['⌘', 'K'],
    hasNotification: true,
    notificationColor: '#0095ff',
    icon: MenuIcon,
  },
];

const shortcutKeys: Record<string, string> = { k: 'menu', j: 'chat', e: 'share' };

interface DockButtonProps {
  item: DockItem;
  isHovered: boolean;
  isActive: boolean;
  hasIndicator: boolean;
  isPressed: boolean;
  pulse: number;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onHover: (id: string | null) => void;
  onClick: () => void;
}

const DockButton: React.FC<DockButtonProps> = ({
  item,
  isHovered,
  isActive,
  hasIndicator,
  isPressed,
  pulse,
  registerRef,
  onHover,
  onClick,
}) => {
  const color = item.notificationColor || '#0095ff';
  const icon =
    typeof item.icon === 'function'
      ? item.icon({ hovered: isHovered, active: isActive })
      : item.icon;

  return (
    <motion.div
      ref={(el) => registerRef(item.id, el)}
      variants={itemVariants}
      className="relative flex items-center justify-center"
      onMouseEnter={() => onHover(item.id)}
    >
      {/* Indicator bar — follows the cursor, then slides back to the selected item */}
      {hasIndicator && (
        <motion.span
          layoutId="dock-active"
          transition={settle}
          style={{ borderRadius: 9999 }}
          className="absolute -left-[5px] top-1/2 -mt-2 h-4 w-[3px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] pointer-events-none"
        />
      )}

      <motion.button
        type="button"
        onClick={onClick}
        onFocus={() => onHover(item.id)}
        onBlur={() => onHover(null)}
        animate={{ scale: isPressed ? 0.86 : 1 }}
        whileTap={{ scale: 0.86 }}
        transition={snappy}
        aria-label={item.label}
        aria-pressed={isActive}
        className="relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        {/* Click ripple */}
        {pulse > 0 && (
          <motion.span
            key={pulse}
            initial={{ scale: 0.5, opacity: 0.45 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 rounded-full border border-white/40 pointer-events-none"
          />
        )}

        {/* Notification dot with soft pulse */}
        {item.hasNotification && (
          <span className="absolute top-2.5 right-2.5 z-20 w-[7px] h-[7px]">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 2.6], opacity: [0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-[#0a0a0c]"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...snappy, delay: 0.55 }}
            />
          </span>
        )}

        {/* Icon */}
        <motion.span
          className="relative z-10 flex"
          initial={false}
          animate={{
            color: isActive || isHovered ? '#ffffff' : '#a3a3a3',
            scale: isHovered ? 1.1 : 1,
          }}
          transition={snappy}
        >
          {icon}
        </motion.span>
      </motion.button>
    </motion.div>
  );
};

export const FloatingCapsuleDock: React.FC<FloatingCapsuleDockProps> = ({
  items,
  activeId: controlledActiveId,
  onSelect,
  className = '',
}) => {
  const [hover, setHover] = useState<{ id: string | null; dir: number }>({ id: null, dir: 1 });
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [pulses, setPulses] = useState<Record<string, number>>({});
  const [internalActiveId, setInternalActiveId] = useState<string>('menu');

  const currentActiveId = controlledActiveId ?? internalActiveId;
  const dockItems = items || defaultItems;
  const hoveredItem = dockItems.find((i) => i.id === hover.id) ?? null;

  // Item wrappers, used to place the shared hover pill + tooltip
  const itemEls = useRef<Record<string, HTMLDivElement | null>>({});
  const registerRef = (id: string, el: HTMLDivElement | null) => {
    itemEls.current[id] = el;
  };
  const hoveredEl = hover.id ? itemEls.current[hover.id] : null;
  const hoverBox = hoveredEl && {
    top: hoveredEl.offsetTop,
    left: hoveredEl.offsetLeft,
    width: hoveredEl.offsetWidth,
    height: hoveredEl.offsetHeight,
  };

  const handleHover = (id: string | null) => {
    setHover((prev) => {
      if (prev.id === id) return prev;
      const ids = dockItems.map((i) => i.id);
      const dir = id && prev.id ? Math.sign(ids.indexOf(id) - ids.indexOf(prev.id)) || 1 : 1;
      return { id, dir };
    });
  };

  // Cursor-following spotlight
  const localY = useMotionValue(0);
  const spotlightOpacity = useSpring(0, { stiffness: 200, damping: 30 });
  const spotlight = useMotionTemplate`radial-gradient(90px circle at 50% ${localY}px, rgba(255,255,255,0.1), transparent 70%)`;

  const handleItemClick = (item: DockItem) => {
    setInternalActiveId(item.id);
    setPulses((p) => ({ ...p, [item.id]: (p[item.id] ?? 0) + 1 }));
    onSelect?.(item.id);
    item.onClick?.();
  };

  // Keep latest handler in a ref so the key listener never goes stale
  const clickRef = useRef(handleItemClick);
  clickRef.current = handleItemClick;
  const itemsRef = useRef(dockItems);
  itemsRef.current = dockItems;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const targetId = shortcutKeys[e.key.toLowerCase()];
      if (!modifier || !targetId) return;

      const item = itemsRef.current.find((i) => i.id === targetId);
      if (!item) return;
      e.preventDefault();
      // Flash the press state so keyboard use feels as tactile as clicking
      setPressedId(item.id);
      window.setTimeout(() => setPressedId(null), 160);
      clickRef.current(item);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
        <LayoutGroup id="capsule-dock">
          <motion.div
            variants={dockVariants}
            initial="hidden"
            animate="show"
            onMouseMove={(e) => {
              localY.set(e.clientY - e.currentTarget.getBoundingClientRect().top);
              spotlightOpacity.set(1);
            }}
            onMouseLeave={() => {
              spotlightOpacity.set(0);
              handleHover(null);
            }}
            className="relative flex flex-col items-center p-2 gap-1.5 bg-[#0a0a0c] text-white rounded-[32px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.15)]"
          >
            {/* Cursor-following spotlight */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{ background: spotlight, opacity: spotlightOpacity }}
            />

            {/* Hover pill — ONE persistent element; moving between items is a layout morph, not a remount */}
            <AnimatePresence>
              {hoverBox && (
                <motion.span
                  key="dock-hover"
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={morph}
                  style={{ ...hoverBox, borderRadius: 9999 }}
                  className="absolute bg-white/[0.07] pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Tooltip — ONE persistent element that glides + resizes; label swaps with popLayout */}
            <AnimatePresence>
              {hoverBox && hoveredItem && (
                <motion.div
                  key="dock-tooltip"
                  layout="position"
                  initial={{ opacity: 0, x: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 8, filter: 'blur(6px)' }}
                  transition={{ ...morph, filter: blurTween }}
                  style={{ top: hoverBox.top + hoverBox.height / 2 }}
                  className="absolute right-full mr-3.5 w-0 h-0 flex items-center justify-end pointer-events-none z-50"
                >
                  <motion.div
                    layout
                    transition={morph}
                    style={{ borderRadius: 16 }}
                    className="relative shrink-0 overflow-hidden bg-[#18181b] border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.5)] whitespace-nowrap"
                  >
                    <AnimatePresence mode="popLayout" initial={false} custom={hover.dir}>
                      <motion.div
                        key={hoveredItem.id}
                        layout="position"
                        custom={hover.dir}
                        variants={labelVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ ...morph, filter: blurTween }}
                        className="flex items-center gap-2.5 px-3 py-1.5"
                      >
                        <span className="text-[13px] font-medium tracking-tight text-white/95">
                          {hoveredItem.label}
                        </span>

                        {hoveredItem.shortcut && hoveredItem.shortcut.length > 0 && (
                          <div className="flex items-center gap-1">
                            {hoveredItem.shortcut.map((key, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-semibold text-neutral-300 bg-[#27272a] border border-white/15 rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                              >
                                {key}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {dockItems.map((item) => (
              <DockButton
                key={item.id}
                item={item}
                isHovered={hover.id === item.id}
                isActive={currentActiveId === item.id}
                hasIndicator={(hover.id ?? currentActiveId) === item.id}
                isPressed={pressedId === item.id}
                pulse={pulses[item.id] ?? 0}
                registerRef={registerRef}
                onHover={handleHover}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </MotionConfig>
  );
};

export default FloatingCapsuleDock;
