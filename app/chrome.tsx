import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./guide.module.css";
import { TorobMark } from "./torob-mark";

export function Mark() {
  return <TorobMark />;
}

export function Assistant({ children }: { children: ReactNode }) {
  return (
    <div className={styles.assistant}>
      <Mark />
      <div className={styles.message}>
        <span className={styles.speaker}>دستیار ترب</span>
        <div className={styles.bubble}>{children}</div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="بازگشت به صفحهٔ نخست"><Mark /><bdi data-entry-content>torob</bdi><span data-entry-content> / لپ‌تاپ</span></Link>
      <span className={styles.tagline} data-entry-content>خرید هوشمندانه‌تر لپ‌تاپ استوک</span>
      <Link className={styles.restart} data-entry-content href="/guide/usecase">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
        شروع دوباره
      </Link>
    </header>
  );
}
