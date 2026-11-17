/* Throwaway issue #3 prototype. Three layouts on /?variant=A, B or C. */
"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./search-prototype.module.css";

const variants = ["A", "B", "C"] as const;
const names = { A: "کارت‌های جست‌وجو", B: "فهرست و فیلتر", C: "جدول مقایسه" };
const uses = ["همه", "روزمره و تحصیل", "کار اداری", "بازی", "کار گرافیکی"];
const laptops = [
  { maker: "Lenovo", model: "ThinkPad T480", cpu: "Core i5-8350U", ram: 16, disk: 256, price: 18900000, condition: "خط‌وخش روی بدنه", use: uses[2] },
  { maker: "Dell", model: "Latitude 5400", cpu: "Core i5-8365U", ram: 8, disk: 256, price: 16500000, condition: "وضعیت باتری نامشخص", use: uses[1] },
  { maker: "HP", model: "EliteBook 840 G6", cpu: "Core i5-8265U", ram: 16, disk: 512, price: 20400000, condition: "خط‌وخش جزئی", use: uses[2] },
  { maker: "Lenovo", model: "Legion Y540", cpu: "Core i7-9750H", ram: 16, disk: 512, price: 32500000, condition: "باتری ضعیف", use: uses[3] },
  { maker: "Dell", model: "Precision 5540", cpu: "Core i7-9850H", ram: 32, disk: 512, price: 36000000, condition: "وضعیت باتری نامشخص", use: uses[4] },
  { maker: "HP", model: "ProBook 440 G7", cpu: "Core i5-10210U", ram: 8, disk: 256, price: 17700000, condition: "خط‌وخش جزئی", use: uses[1] },
];
const fa = new Intl.NumberFormat("fa-IR");
type Laptop = (typeof laptops)[number];

function Model({ laptop }: { laptop: Laptop }) {
  return <><small>{laptop.maker}</small><strong><bdi>{laptop.model}</bdi></strong></>;
}

function Price({ laptop }: { laptop: Laptop }) {
  return <><strong>{fa.format(laptop.price)}</strong> <small>تومان</small></>;
}

function VariantA({ rows }: { rows: Laptop[] }) {
  return <div className={styles.cards}>{rows.map((laptop) => (
    <article key={laptop.model}>
      <div className={styles.cardTop}><span className={styles.laptop} aria-hidden="true" /><small>{laptop.use}</small></div>
      <div className={styles.cardBody}>
        <Model laptop={laptop} />
        <p className={styles.spec}><bdi>{laptop.cpu}</bdi> · {fa.format(laptop.ram)} گیگابایت رم</p>
        <p className={styles.condition}>{laptop.condition}</p>
        <div className={styles.price}><Price laptop={laptop} /></div>
      </div>
    </article>
  ))}</div>;
}

function VariantB({ rows }: { rows: Laptop[] }) {
  return <div className={styles.list}>{rows.map((laptop) => (
    <article key={laptop.model}>
      <div><Model laptop={laptop} /><small>{laptop.condition}</small></div>
      <p className={styles.spec}><bdi>{laptop.cpu}</bdi><br />{fa.format(laptop.ram)} گیگابایت رم · {fa.format(laptop.disk)} گیگابایت SSD</p>
      <div className={styles.price}><Price laptop={laptop} /></div>
    </article>
  ))}</div>;
}

function VariantC({ rows }: { rows: Laptop[] }) {
  return <div className={styles.table} data-scroll-region tabIndex={0} role="region" aria-label="جدول مشخصات لپ‌تاپ"><table>
    <thead><tr><th scope="col">مدل</th><th scope="col">پردازنده</th><th scope="col">رم</th><th scope="col">SSD</th><th scope="col">وضعیت دستگاه</th><th scope="col">قیمت</th></tr></thead>
    <tbody>{rows.map((laptop) => <tr key={laptop.model}>
      <th scope="row"><Model laptop={laptop} /></th><td><bdi>{laptop.cpu}</bdi></td><td>{fa.format(laptop.ram)} گیگابایت</td><td>{fa.format(laptop.disk)} گیگابایت</td><td>{laptop.condition}</td><td className={styles.price}><Price laptop={laptop} /></td>
    </tr>)}</tbody>
  </table></div>;
}

export default function SearchPrototype({ initialVariant }: { initialVariant: string }) {
  const [variant, setVariant] = useState(variants.find((key) => key === initialVariant) ?? "A");
  const [query, setQuery] = useState("");
  const [use, setUse] = useState(uses[0]);
  const [budget, setBudget] = useState("");
  const [sort, setSort] = useState("sample");

  const cycle = useCallback((step: number) => {
    const next = variants[(variants.indexOf(variant) + step + variants.length) % variants.length];
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.replaceState(null, "", url);
    setVariant(next);
  }, [variant]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.target as HTMLElement).closest("input, textarea, select, [contenteditable], [data-scroll-region]")) return;
      if (event.key === "ArrowLeft") cycle(-1);
      if (event.key === "ArrowRight") cycle(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle]);

  const rows = laptops.filter((laptop) =>
    `${laptop.maker} ${laptop.model} ${laptop.cpu}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (use === uses[0] || laptop.use === use) &&
    (!budget || laptop.price <= Number(budget)),
  );
  if (sort === "price") rows.sort((first, second) => first.price - second.price);
  if (sort === "ram") rows.sort((first, second) => second.ram - first.ram);

  const filters = <div className={styles.filters}>
    <label>کاربری<select value={use} onChange={(event) => setUse(event.target.value)}>{uses.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label>سقف بودجه<select value={budget} onChange={(event) => setBudget(event.target.value)}>
      <option value="">بدون محدودیت</option>
      {[18000000, 22000000, 35000000].map((amount) => <option key={amount} value={amount}>{fa.format(amount)} تومان</option>)}
    </select></label>
    <button type="button" onClick={() => { setQuery(""); setUse(uses[0]); setBudget(""); setSort("sample"); }}>پاک کردن فیلترها</button>
  </div>;

  return <div className={`${styles.shell} ${styles[variant]}`}>
    <header className={styles.header}><div className={styles.wrap}>
      <span className={styles.brand}><span className={styles.laptop} aria-hidden="true" />راهنمای لپ‌تاپ استوک</span>
      <span className={styles.demo}>نمونهٔ طراحی</span>
    </div></header>
    <main className={styles.wrap}>
      <div className={styles.intro}>
        <h1>{variant === "C" ? "مقایسه لپ‌تاپ‌های استوک" : "جست‌وجوی لپ‌تاپ استوک"}</h1>
        <label className={styles.search}>نام مدل یا پردازنده<input type="search" dir="auto" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مثلاً ThinkPad T480" /></label>
      </div>
      <div className={styles.workspace}>
        {variant === "B" ? <aside>{filters}</aside> : filters}
        <section aria-labelledby="results-title">
          <div className={styles.results}>
            <h2 id="results-title" aria-live="polite">{fa.format(rows.length)} نتیجه از داده‌های نمونه</h2>
            <label>ترتیب <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="sample">پیش‌فرض</option><option value="price">کمترین قیمت</option><option value="ram">بیشترین رم</option></select></label>
          </div>
          {rows.length === 0 ? <p className={styles.empty}>مدلی با این فیلترها پیدا نشد.</p> : variant === "A" ? <VariantA rows={rows} /> : variant === "B" ? <VariantB rows={rows} /> : <VariantC rows={rows} />}
        </section>
      </div>
    </main>
    <nav dir="ltr" className={styles.switcher} aria-label="گزینه‌های طراحی">
      <button type="button" aria-label="طرح قبلی" onClick={() => cycle(-1)}>←</button>
      <span>{variant} <span dir="rtl">· {names[variant]}</span></span>
      <button type="button" aria-label="طرح بعدی" onClick={() => cycle(1)}>→</button>
    </nav>
  </div>;
}

