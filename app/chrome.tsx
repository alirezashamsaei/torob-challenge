import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./guide.module.css";

export function Mark() {
  return <span className={styles.mark} aria-hidden="true">t</span>;
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
      <span className={styles.brand}><Mark /><bdi>torob</bdi><span> / لپ‌تاپ</span></span>
      <span className={styles.tagline}>خرید هوشمندانه‌تر لپ‌تاپ استوک</span>
      <Link className={`${styles.button} ${styles.link}`} href="/guide/usecase">
        <span aria-hidden="true">↻</span> شروع دوباره
      </Link>
    </header>
  );
}
