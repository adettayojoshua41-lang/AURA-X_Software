import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

const SPARKLE_COUNT = 26;

function seededSparkles() {
  return Array.from({ length: SPARKLE_COUNT }, (_, i) => ({
    id: i,
    top: `${(i * 37) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    delay: `${(i % 7) * 0.45}s`,
    duration: `${2.6 + (i % 5) * 0.5}s`,
    size: 2 + (i % 4),
  }));
}

const sparkles = seededSparkles();

export default function AnimatedBackground() {
  const { theme } = useTheme();
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (!glowRef.current) return;
      glowRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`;
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
      {/* Base wash */}
      <div className="absolute inset-0 bg-white dark:bg-nightbg transition-colors duration-500" />

      {/* Floating gradient blobs */}
      <div
        className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-60 dark:opacity-40 animate-float-slow"
        style={{ background: theme === "dark" ? "radial-gradient(circle, #6E56CF, transparent 70%)" : "radial-gradient(circle, #C8B6FF, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-50 dark:opacity-30 animate-float-slower"
        style={{ background: theme === "dark" ? "radial-gradient(circle, #2D4B8C, transparent 70%)" : "radial-gradient(circle, #FFD6E8, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-40 dark:opacity-25 animate-float-slow"
        style={{ background: theme === "dark" ? "radial-gradient(circle, #7CFFB2, transparent 70%)" : "radial-gradient(circle, #BDEFFF, transparent 70%)" }}
      />

      {/* Aurora glow band */}
      <div
        className="absolute inset-x-0 top-0 h-72 blur-2xl opacity-30 animate-float-slower"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(90deg, #6E56CF, #2D4B8C, #7CFFB2)"
              : "linear-gradient(90deg, #C8B6FF, #BDEFFF, #FFD6E8)",
        }}
      />

      {/* Sparkles */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full animate-twinkle"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: theme === "dark" ? "#EDE7FF" : "#C8B6FF",
            boxShadow: theme === "dark" ? "0 0 6px 1px rgba(237,231,255,0.5)" : "0 0 5px 1px rgba(200,182,255,0.4)",
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        />
      ))}

      {/* Mouse-follow glow */}
      <div
        ref={glowRef}
        className="hidden md:block absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.08] dark:opacity-[0.12] transition-transform duration-150 ease-out"
        style={{ background: theme === "dark" ? "#7CFFB2" : "#C8B6FF", top: 0, left: 0 }}
      />
    </div>
  );
}
