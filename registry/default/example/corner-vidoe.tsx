"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "motion/react";

const VIDEO_SOURCES = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];

const POSTER =
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80";

const EASE = [0.23, 1, 0.32, 1] as const;

function formatTime(timeInSeconds: number) {
  if (Number.isNaN(timeInSeconds)) return "0:00";
  const mins = Math.floor(timeInSeconds / 60);
  const secs = Math.floor(timeInSeconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function CornerPlayer({
  title = "Watch studio tour",
  defaultMuted = true,
  autoPlay = true,
}: {
  title?: string;
  defaultMuted?: boolean;
  autoPlay?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [hasSource, setHasSource] = useState(true);
  const [, setIsPlaying] = useState(true);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBarHovered, setIsBarHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isOpen && autoPlay) el.play().catch(() => {});
  }, [autoPlay, isOpen]);

  const handleTimeUpdate = () => {
    if (!isScrubbing && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current?.duration) {
      setDuration(videoRef.current.duration);
      setHasSource(true);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.pause();
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleScrub = useCallback(
    (clientX: number) => {
      if (!progressTrackRef.current || !videoRef.current || duration <= 0) return;
      const rect = progressTrackRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetTime = pos * duration;
      setCurrentTime(targetTime);
      videoRef.current.currentTime = targetTime;
    },
    [duration],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsScrubbing(true);
    handleScrub(e.clientX);
    const onMove = (ev: MouseEvent) => handleScrub(ev.clientX);
    const onUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showControls = isHovered || isScrubbing;
  const openH = isEnlarged ? 498 : 320;
  const openW = isEnlarged ? 280 : 180;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* One continuous shell — video stays mounted so minimize never blanks */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: EASE }}
        animate={{
          width: isOpen ? openW : "auto",
          height: isOpen ? openH : 44,
          borderRadius: isOpen ? 16 : 999,
          backgroundColor: isOpen ? "#E0F2FE" : "#BAE6FD",
        }}
        className="relative overflow-hidden shadow-lg shadow-sky-200/50"
      >
        <motion.div
          aria-hidden={!isOpen}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className={`absolute inset-0 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsBarHovered(false);
          }}
        >
          {hasSource ? (
            <video
              ref={videoRef}
              poster={POSTER}
              autoPlay={autoPlay}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={() => setHasSource(false)}
              className="block h-full w-full cursor-pointer object-cover"
            >
              {VIDEO_SOURCES.map((src) => (
                <source key={src} src={src} />
              ))}
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#D8F0E8] text-sm text-teal-800">
              Preview unavailable
            </div>
          )}

          <div
            className={`absolute top-2 right-2 left-2 z-10 flex justify-between transition-opacity duration-200 ${
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sky-950"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEnlarged((v) => !v);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs text-sky-950"
                aria-label={isEnlarged ? "Shrink" : "Enlarge"}
              >
                {isEnlarged ? "↘" : "↗"}
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-sky-950"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div
            onMouseEnter={() => setIsBarHovered(true)}
            onMouseLeave={() => setIsBarHovered(false)}
            onMouseDown={handleMouseDown}
            className="absolute right-0 bottom-0 left-0 z-10 flex h-8 cursor-pointer touch-none flex-col justify-end"
          >
            <div
              className={`pointer-events-none absolute right-2.5 bottom-4 left-2.5 flex justify-between text-xs text-white tabular-nums transition-opacity ${
                isBarHovered || isScrubbing ? "opacity-100" : "opacity-0"
              }`}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              ref={progressTrackRef}
              className={`overflow-hidden bg-white/40 transition-all ${
                isBarHovered || isScrubbing ? "mx-2 mb-2 h-1.5 rounded-full" : "h-0.5"
              }`}
            >
              <div
                className="h-full bg-white"
                style={{
                  width: `${progressPercent}%`,
                  transition: isScrubbing ? "none" : "width 0.1s linear",
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          type="button"
          aria-hidden={isOpen}
          tabIndex={isOpen ? -1 : 0}
          onClick={handleOpen}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: 0.22, ease: EASE, delay: isOpen ? 0 : 0.12 }}
          className={`flex h-11 items-center gap-2 px-4 text-sm font-medium whitespace-nowrap text-sky-950 ${
            isOpen ? "pointer-events-none" : "cursor-pointer"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.90588 4.53682C6.50592 4.2998 6 4.58808 6 5.05299V18.947C6 19.4119 6.50592 19.7002 6.90588 19.4632L18.629 12.5162C19.0211 12.2838 19.0211 11.7162 18.629 11.4838L6.90588 4.53682Z" />
          </svg>
          <span>
            {title}
            {duration > 0 ? ` (${Math.round(duration)}s)` : ""}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function CornerVideoPlayer() {
  return (
    <section className="relative bg-[#F3F0FA] py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <p className="mb-3 text-sm font-medium tracking-widest text-violet-400 uppercase">
          Studio preview
        </p>
        <h2 className="mb-4 text-4xl font-semibold tracking-tight text-violet-950 sm:text-5xl">
          Corner player with a smooth morph
        </h2>
        <p className="max-w-xl text-lg text-violet-600/80">
          Close collapses into a pill without a blank flash. Hover for mute, enlarge, and scrub.
        </p>
      </div>
      <CornerPlayer />
    </section>
  );
}
