import Link from "next/link";
import styles from "./guide.module.css";

export default function HomePage() {
  return (
    <main className={`${styles.guide} ${styles.intro}`}>
      <span className={styles.introMark} aria-hidden="true" />
      <h1>ترب لپ‌تاپ (استوک)</h1>
      <Link className={styles.start} href="/guide/usecase">شروع</Link>
    </main>
  );
}
