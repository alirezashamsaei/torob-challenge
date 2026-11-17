"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";

type Box = { left: number; top: number; width: number; height: number };

export function IntroTransition() {
  useLayoutEffect(() => {
    let saved: { logo: Box; button: Box; time: number };
    try {
      const value = sessionStorage.getItem("torob-intro-transition");
      if (!value) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.removeItem("torob-intro-transition");
        return;
      }
      saved = JSON.parse(value);
    } catch { return; }
    if (Date.now() - saved.time > 5000) {
      try { sessionStorage.removeItem("torob-intro-transition"); } catch { /* Storage is optional. */ }
      return;
    }
    const logo = document.querySelector<SVGElement>("header [data-torob-mark]");
    const composer = document.querySelector<HTMLElement>("form[data-composer]");
    if (!logo || !composer) return;

    const fromBox = (element: Element, from: Box) => {
      const to = element.getBoundingClientRect();
      return { x: from.left - to.left, y: from.top - to.top, scaleX: from.width / to.width, scaleY: from.height / to.height, transformOrigin: "top left" };
    };
    const context = gsap.context(() => {
      const message = document.querySelector<HTMLElement>("[data-entry-message]");
      const choices = document.querySelectorAll<HTMLElement>("[data-entry-choices] > button");
      gsap.set([message, ...choices].filter(Boolean), { animation: "none" });
      const timeline = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3.inOut" },
        onComplete: () => {
          try { sessionStorage.removeItem("torob-intro-transition"); } catch { /* Storage is optional. */ }
        },
      });
      timeline.from(logo, fromBox(logo, saved.logo), 0)
        .from(composer, { ...fromBox(composer, saved.button), backgroundColor: "#263441", borderRadius: "8px" }, 0)
        .from(composer.children, { opacity: 0, duration: 0.2, ease: "power2.out" }, 0.48)
        .from("[data-entry-content]", { opacity: 0, duration: 0.25, ease: "power2.out" }, 0.62)
        .from("[data-entry-transcript]", { opacity: 0, duration: 0.15 }, 0.65)
        .from(message, { opacity: 0, scale: 0.9, y: 14, transformOrigin: "top right", duration: 0.5, ease: "power3.out" }, 0.65)
        .from(choices, { opacity: 0, y: 12, scale: 0.9, duration: 0.45, stagger: 0.09, ease: "power3.out" }, 0.85);
    });
    return () => context.revert();
  }, []);
  return null;
}


