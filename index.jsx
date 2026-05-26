import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";

// ─── CONSTANTS & CONTENT ───────────────────────────────────────────────────────
const NAME = "[Abhi]";
const NICKNAME = "[NICKNAME]";
const AGE = "[AGE]";
const LETTER = `[PASTE LETTER HERE]

Every moment with you has been a chapter I never want to end. You are the kind of person who makes ordinary days feel like something out of a dream.

Happy Birthday, ${NAME}. Here's to you — all of you.`;

const MEMORIES = [
  { year: "Chapter I",   title: "The Beginning",        note: "The day everything changed. Some stories begin quietly — this one began with you.",       emoji: "✨" },
  { year: "Chapter II",  title: "Adventures Together",  note: "Every road trip, every late night, every inside joke. We built a world only we understand.", emoji: "🌙" },
  { year: "Chapter III", title: "Through the Hard Days", note: "You showed me what strength looks like. I was there. I saw it. I'm so proud of you.",     emoji: "🌿" },
  { year: "Chapter IV",  title: "The Golden Moments",   note: "Those moments where time slowed down and we both knew — this is it. This is life.",        emoji: "🌅" },
  { year: "Chapter V",   title: "Today & Always",        note: "Another year around the sun. And I'd follow you around a thousand more.",                  emoji: "💫" },
];

const GALLERY_ITEMS = [
  { id: 1, label: "Golden Hour",   color: "from-amber-900/60 to-orange-950/80",  rotate: "-2deg" },
  { id: 2, label: "Midnight Blue", color: "from-indigo-900/60 to-blue-950/80",   rotate: "1.5deg" },
  { id: 3, label: "Soft Dawn",     color: "from-rose-900/60 to-pink-950/80",     rotate: "-1deg" },
  { id: 4, label: "Emerald Dusk",  color: "from-emerald-900/60 to-teal-950/80",  rotate: "2deg" },
  { id: 5, label: "Velvet Night",  color: "from-purple-900/60 to-violet-950/80", rotate: "-1.5deg" },
  { id: 6, label: "Crimson Bloom", color: "from-red-900/60 to-rose-950/80",      rotate: "1deg" },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function randomBetween(a, b) { return Math.random() * (b - a) + a; }

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
function Particles({ count = 40, color = "255,255,255" }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      y: randomBetween(0, 100),
      size: randomBetween(1, 3.5),
      duration: randomBetween(8, 20),
      delay: randomBetween(0, 10),
      drift: randomBetween(-30, 30),
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(${color},0.6)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(${color},0.4)`,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, p.drift, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const move = (e) => setPos({ x: e.clientX, y: e.clientY });
    const over = (e) => setIsHover(!!e.target.closest("button,a,[data-cursor]"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        animate={{ x: pos.x - 6, y: pos.y - 6, scale: isHover ? 2.5 : 1 }}
        transition={{ type: "spring", stiffness: 800, damping: 40 }}
        style={{ width: 12, height: 12, borderRadius: "50%", background: "white" }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] border border-white/30 rounded-full"
        animate={{ x: pos.x - 20, y: pos.y - 20, scale: isHover ? 1.5 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        style={{ width: 40, height: 40 }}
      />
    </>
  );
}

// ─── SCROLL PROGRESS BAR ──────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
      style={{ scaleX, background: "linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6)" }}
    />
  );
}

// ─── SECTION WRAPPER (scroll reveal) ─────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── PRELOADER ────────────────────────────────────────────────────────────────
function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + randomBetween(0.5, 2.5);
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => setPhase(1), 400);
      setTimeout(() => onComplete(), 1800);
    }
  }, [progress, onComplete]);

  return (
    <AnimatePresence>
      {phase === 0 && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: "#030308" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <Particles count={30} color="251,191,36" />
          <div className="relative z-10 text-center px-6">
            <motion.p
              className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-8 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              A gift for someone special
            </motion.p>
            <motion.div
              className="text-white/90 font-serif italic text-3xl sm:text-4xl mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              "Some people arrive and make<br />
              <span className="text-amber-300">such a beautiful impact</span><br />
              on your life..."
            </motion.div>
            {/* Progress bar */}
            <div className="w-64 mx-auto">
              <div className="h-px bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#f59e0b,#ec4899)", width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <p className="text-white/20 text-xs mt-3 tracking-widest">
                {Math.min(100, Math.floor(progress))}%
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Layered cinematic background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, #1a0a2e 0%, #030308 70%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 40% 40% at 20% 80%, rgba(245,158,11,0.12) 0%, transparent 60%)",
        }} />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 40% 40% at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }} />
      </motion.div>

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${randomBetween(0, 100)}%`,
              top: `${randomBetween(0, 100)}%`,
              width: randomBetween(1, 2.5),
              height: randomBetween(1, 2.5),
              opacity: randomBetween(0.1, 0.6),
            }}
            animate={{ opacity: [randomBetween(0.1, 0.3), randomBetween(0.5, 0.9), randomBetween(0.1, 0.3)] }}
            transition={{ duration: randomBetween(2, 5), repeat: Infinity, delay: randomBetween(0, 4) }}
          />
        ))}
      </div>

      <Particles count={25} color="251,191,36" />

      {/* Content */}
      <motion.div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ opacity }}>
        <motion.p
          className="text-amber-400/70 tracking-[0.5em] text-xs uppercase mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          A cinematic birthday experience
        </motion.p>

        <motion.h1
          className="text-white font-serif leading-none mb-4"
          style={{ fontSize: "clamp(3rem, 10vw, 8rem)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Happy
          <br />
          <span style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b,#ec4899,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Birthday
          </span>
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-4 mt-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(90deg,transparent,rgba(251,191,36,0.5))" }} />
          <p className="text-white/50 tracking-[0.3em] text-sm font-light">
            {NAME} · {AGE}
          </p>
          <div className="h-px flex-1 max-w-24" style={{ background: "linear-gradient(90deg,rgba(251,191,36,0.5),transparent)" }} />
        </motion.div>

        <motion.p
          className="text-white/40 text-base sm:text-lg font-light italic tracking-wide max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          "This is your story. And it is beautiful."
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-[-120px] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-white/20 text-xs tracking-[0.3em] uppercase">Scroll</p>
          <motion.div
            className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── MEMORY TIMELINE ──────────────────────────────────────────────────────────
function Timeline() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />
      <div className="max-w-3xl mx-auto">
        <Reveal className="text-center mb-20">
          <p className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-4">The Story So Far</p>
          <h2 className="text-white font-serif text-4xl sm:text-5xl">Chapters of Us</h2>
        </Reveal>

        {/* Vertical line */}
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: "linear-gradient(180deg,transparent,rgba(251,191,36,0.3),transparent)" }} />

          {MEMORIES.map((m, i) => (
            <Reveal key={i} delay={i * 0.1} className={`flex gap-8 mb-16 items-start ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              {/* Card */}
              <div className={`flex-1 ${i % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                <div
                  className="inline-block p-6 rounded-2xl relative"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="text-3xl mb-3">{m.emoji}</div>
                  <p className="text-amber-400/60 text-xs tracking-widest uppercase mb-1">{m.year}</p>
                  <h3 className="text-white font-serif text-xl mb-3">{m.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-light">{m.note}</p>
                </div>
              </div>

              {/* Center dot */}
              <div className="relative flex-shrink-0 w-4 flex items-center justify-center mt-8">
                <div className="w-3 h-3 rounded-full relative"
                  style={{ background: "#f59e0b", boxShadow: "0 0 15px rgba(245,158,11,0.8)" }} />
              </div>

              <div className="flex-1" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TYPEWRITER ───────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 28 }) {
  const [displayed, setDisplayed] = useState("");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [inView, text, speed]);

  return <span ref={ref}>{displayed}<span className="animate-pulse text-amber-400">|</span></span>;
}

// ─── LETTER ───────────────────────────────────────────────────────────────────
function LetterSection() {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(236,72,153,0.05) 0%, transparent 70%)" }} />
      <div className="max-w-2xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-4">From the Heart</p>
          <h2 className="text-white font-serif text-4xl sm:text-5xl">A Letter For You</h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div
            className="relative p-10 sm:p-14 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Decorative corner */}
            <div className="absolute top-6 left-6 text-amber-400/20 text-5xl font-serif leading-none">"</div>
            <div className="absolute bottom-6 right-6 text-amber-400/20 text-5xl font-serif leading-none rotate-180">"</div>

            <p className="text-white/70 leading-loose text-base sm:text-lg font-light italic relative z-10">
              <Typewriter text={LETTER} speed={20} />
            </p>

            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
              <p className="text-white/30 text-xs tracking-widest uppercase">With all my love</p>
              <p className="text-amber-400/70 font-serif italic text-lg">Always ✦</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
function Gallery() {
  const [active, setActive] = useState(null);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-4">Captured Moments</p>
          <h2 className="text-white font-serif text-4xl sm:text-5xl">The Gallery</h2>
          <p className="text-white/30 mt-4 text-sm font-light">Replace placeholders with your photos</p>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {GALLERY_ITEMS.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.07}>
              <motion.div
                data-cursor
                className="relative cursor-pointer overflow-hidden rounded-2xl"
                style={{ transform: `rotate(${item.rotate})`, aspectRatio: "4/5" }}
                whileHover={{ scale: 1.05, rotate: "0deg", zIndex: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => setActive(item)}
              >
                {/* Photo placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-b ${item.color}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="text-white/20 text-4xl">📷</div>
                  <p className="text-white/30 text-xs tracking-wider">[PHOTO]</p>
                </div>
                {/* Overlay */}
                <motion.div
                  className="absolute inset-0 flex flex-col justify-end p-4"
                  style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 60%)" }}
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <p className="text-white font-serif italic text-sm">{item.label}</p>
                </motion.div>
                {/* Polaroid border */}
                <div className="absolute inset-0 border border-white/10 rounded-2xl" />
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
          >
            <motion.div
              className="relative w-full max-w-lg aspect-[4/5] rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, rgba(30,20,60,0.8), rgba(10,5,20,0.9))` }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${active.color}`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-white/20 text-6xl mb-4">📷</div>
                <p className="text-white/30 tracking-wider">[PHOTO PLACEHOLDER]</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8"
                style={{ background: "linear-gradient(0deg,rgba(0,0,0,0.8),transparent)" }}>
                <p className="text-white font-serif italic text-xl">{active.label}</p>
              </div>
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onClick={() => setActive(null)}
              >✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── MUSIC PLAYER ────────────────────────────────────────────────────────────
function MusicSection() {
  const [playing, setPlaying] = useState(false);
  const bars = Array.from({ length: 24 });

  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
      <div className="max-w-xl mx-auto text-center">
        <Reveal>
          <p className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-4">The Soundtrack</p>
          <h2 className="text-white font-serif text-4xl sm:text-5xl mb-6">Your Song</h2>
          <p className="text-white/30 text-sm mb-12 font-light">Add your song link to the SONG placeholder</p>
        </Reveal>

        <Reveal delay={0.2}>
          <div
            className="p-8 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(30px)",
            }}
          >
            {/* Visualizer */}
            <div className="flex items-end justify-center gap-1 h-16 mb-8">
              {bars.map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full"
                  style={{ background: "linear-gradient(0deg,#f59e0b,#ec4899)" }}
                  animate={playing ? {
                    height: [`${randomBetween(10, 60)}%`, `${randomBetween(20, 90)}%`, `${randomBetween(10, 60)}%`],
                  } : { height: "10%" }}
                  transition={{ duration: randomBetween(0.4, 0.8), repeat: Infinity, delay: i * 0.04 }}
                />
              ))}
            </div>

            <div className="mb-6">
              <p className="text-white font-serif italic text-xl mb-1">[SONG TITLE]</p>
              <p className="text-white/40 text-sm">[ARTIST]</p>
            </div>

            <motion.button
              data-cursor
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)", boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? "⏸" : "▶"}
            </motion.button>

            <p className="text-white/20 text-xs mt-4 tracking-wider">[SONG LINK]</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: randomBetween(10, 90),
      color: ["#fbbf24", "#ec4899", "#8b5cf6", "#34d399", "#60a5fa", "#f87171"][Math.floor(Math.random() * 6)],
      size: randomBetween(6, 14),
      duration: randomBetween(2, 4),
      delay: randomBetween(0, 1.5),
      spin: randomBetween(-360, 360),
    }))
  ).current;

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-sm"
              style={{ left: `${p.x}%`, top: -20, width: p.size, height: p.size * 0.4, background: p.color }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.spin }}
              transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── FINAL SURPRISE ───────────────────────────────────────────────────────────
function FinalSurprise() {
  const [revealed, setRevealed] = useState(false);
  const [showEaster, setShowEaster] = useState(false);
  const [heartClicks, setHeartClicks] = useState(0);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleHeartClick = () => {
    const next = heartClicks + 1;
    setHeartClicks(next);
    if (next >= 5) setShowEaster(true);
  };

  return (
    <section className="relative py-32 px-6 min-h-screen flex items-center">
      <Confetti active={revealed} />

      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,158,11,0.06) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
      }} />
      <Particles count={35} color="251,191,36" />

      <div className="max-w-2xl mx-auto text-center relative z-10 w-full">
        <Reveal>
          <p className="text-amber-400/60 tracking-[0.4em] text-xs uppercase mb-4">The Grand Finale</p>
          <h2 className="text-white font-serif text-4xl sm:text-5xl mb-6">One Last Thing...</h2>
        </Reveal>

        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div key="button" exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.4 }}>
              <Reveal delay={0.2}>
                <p className="text-white/40 font-light mb-10 text-lg italic">
                  There's a surprise waiting for you.<br />Are you ready?
                </p>
                <motion.button
                  data-cursor
                  className="px-12 py-5 rounded-full text-black font-semibold tracking-wider text-sm relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", boxShadow: "0 0 40px rgba(251,191,36,0.4)" }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(251,191,36,0.6)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReveal}
                >
                  ✨ Open Your Surprise
                </motion.button>
              </Reveal>
            </motion.div>
          ) : (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <div
                className="p-10 rounded-3xl relative"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  backdropFilter: "blur(30px)",
                  boxShadow: "0 0 80px rgba(245,158,11,0.1), 0 40px 80px rgba(0,0,0,0.4)",
                }}
              >
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1.2, 1.2, 1] }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  🎂
                </motion.div>

                <h3 className="text-white font-serif italic text-3xl sm:text-4xl mb-4">
                  Happy {AGE}th Birthday,
                </h3>
                <h3 style={{ background: "linear-gradient(135deg,#fbbf24,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                  className="font-serif italic text-4xl sm:text-5xl mb-6">
                  {NAME} 🌟
                </h3>

                <p className="text-white/60 font-light text-base sm:text-lg leading-relaxed italic">
                  "May this year be filled with everything your heart desires,<br />
                  every dream you dare to chase, and every joy you deserve.<br />
                  You are so deeply loved."
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  {["🌸", "✨", "🌙", "⭐", "💛", "🌈"].map((e, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl cursor-pointer"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Easter egg hint */}
              <p className="text-white/20 text-xs tracking-wider">
                💡 Psst... click the heart 5 times for a hidden surprise
              </p>
              <motion.button
                className="text-4xl cursor-pointer"
                onClick={handleHeartClick}
                whileTap={{ scale: 1.4 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                💖
              </motion.button>
              {heartClicks > 0 && heartClicks < 5 && (
                <p className="text-amber-400/50 text-xs">{5 - heartClicks} more...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Easter egg modal */}
        <AnimatePresence>
          {showEaster && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEaster(false)}
            >
              <motion.div
                className="text-center max-w-sm"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="text-7xl mb-6">🌟</div>
                <h3 className="text-white font-serif italic text-3xl mb-4">You Found It!</h3>
                <p className="text-white/60 font-light leading-relaxed">
                  This hidden message was always here, waiting for you — just like how I've always been here,<br />
                  and always will be.
                </p>
                <p className="text-amber-400 font-serif italic text-xl mt-6">I love you, {NICKNAME} 💛</p>
                <p className="text-white/20 text-xs mt-6">(tap anywhere to close)</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-16 px-6 text-center border-t border-white/5">
      <p className="text-white/20 text-xs tracking-[0.3em] uppercase mb-3">Made with ∞ love</p>
      <p className="text-white/10 text-xs font-light italic">This moment will last forever.</p>
    </footer>
  );
}

// ─── NAV DOTS ─────────────────────────────────────────────────────────────────
function NavDots({ sections, active }) {
  return (
    <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-3">
      {sections.map((s, i) => (
        <motion.button
          key={i}
          data-cursor
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ background: active === i ? "#f59e0b" : "rgba(255,255,255,0.2)", boxShadow: active === i ? "0 0 10px rgba(245,158,11,0.8)" : "none" }}
          whileHover={{ scale: 1.5 }}
        />
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: "hero" }, { id: "timeline" }, { id: "letter" },
    { id: "gallery" }, { id: "music" }, { id: "finale" },
  ];

  // Track active section
  useEffect(() => {
    if (!loaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const i = sections.findIndex((s) => s.id === entry.target.id);
            if (i !== -1) setActiveSection(i);
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div style={{ background: "#030308", minHeight: "100vh", fontFamily: "'Georgia', serif", overflowX: "hidden" }}>
      {/* Google Font imports via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,600&family=Jost:wght@200;300;400&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { cursor: none !important; }
        .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-light { font-family: 'Jost', sans-serif; font-weight: 300; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <AnimatePresence>
        {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <CustomCursor />
          <ScrollProgress />
          <NavDots sections={sections} active={activeSection} />

          <main>
            <div id="hero"><Hero /></div>
            <div id="timeline"><Timeline /></div>
            <div id="letter"><LetterSection /></div>
            <div id="gallery"><Gallery /></div>
            <div id="music"><MusicSection /></div>
            <div id="finale"><FinalSurprise /></div>
          </main>

          <Footer />
        </motion.div>
      )}
    </div>
  );
}
