"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./guide.module.css";
import { TorobMark } from "./torob-mark";
import SpecularButton from "./SpecularButton";

export default function HomePage() {
  const intro = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !intro.current) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline();
      timeline.from("[data-torob-mark] path", {
        opacity: 0, scale: 0.9, rotation: -8, transformOrigin: "50% 60%",
        duration: 1.65, stagger: 0.21, ease: "power3.out",
      }).from("[data-intro-title]", { opacity: 0, y: 12, duration: 0.4, ease: "power3.out" }, "-=0.9")
        .from("[data-intro-description]", { opacity: 0, y: 10, duration: 0.4, ease: "power3.out" }, "-=0.24")
        .from("[data-intro-action]", { opacity: 0, y: 12, scale: 0.95, duration: 0.45, ease: "power3.out" }, "-=0.22");
    }, intro);
    return () => context.revert();
  }, []);

  return (
    <main ref={intro} className={`${styles.guide} ${styles.intro}`}>
      <TorobMark intro />
      <h1 data-intro-title>ترب لپ‌تاپ <span className={styles.introQualifier}>(استوک)</span></h1>
      <p className={styles.introDescription} data-intro-description>لپ‌تاپ استوک مناسب خودتان را با چند انتخاب پیدا کنید.</p>
      <SpecularButton className={styles.start} data-intro-action href="/guide/usecase" radius={8} tint="#263441" tintOpacity={1} shineSize={23} shineFade={34} thickness={1.6} glow={0.8} autoAnimate followMouse={false} onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const logo = intro.current?.querySelector("[data-torob-mark]");
        if (!logo) return;
        const rect = (element: Element) => {
          const { left, top, width, height } = element.getBoundingClientRect();
          return { left, top, width, height };
        };
        try { sessionStorage.setItem("torob-intro-transition", JSON.stringify({ logo: rect(logo), button: rect(event.currentTarget), time: Date.now() })); } catch { /* Navigation still works without storage. */ }
      }}>شروع</SpecularButton>
    </main>
  );
}
