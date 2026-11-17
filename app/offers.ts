import type { DefectId, Severity, UseCase } from "./journey";

/** A defect the seller disclosed for this specific device. */
export type OfferDefect = {
  id: DefectId;
  label: string;
  /** "undisclosed" means the seller named the defect but not how bad it is. */
  severity: Severity | "undisclosed";
};

export type OfferConfiguration = {
  cpu: string;
  memory: string;
  graphics?: string;
};

/**
 * A specific seller offer, not a laptop model. Two offers can describe the same
 * model and still differ in seller, price, configuration and device condition.
 */
export type Offer = {
  id: string;
  model: string;
  seller: string;
  /** The seller's offer page, opened externally by the buyer. */
  url: string;
  /** When the offer was last reviewed at the source (ISO 8601, Tehran time). */
  observedAt: string;
  priceToman: number;
  /** null means the seller disclosed no shipping amount. */
  shippingToman: number | null;
  useCases: readonly UseCase[];
  configuration: OfferConfiguration;
  defects: readonly OfferDefect[];
  /** Fields the seller left unknown for this device. */
  undisclosed: readonly string[];
  /** Test period or return terms, when the seller states them. */
  testTerms?: string;
  /** The reason this offer surfaced, grounded in the fields above. */
  explanation: string;
  /** What the buyer gives up by choosing this offer. */
  tradeOff: string;
};

/**
 * Representative offers drawn from docs/stock-laptop-offer-sample.csv (observed
 * 2026-11-17). They exist so the results screens can be built and demonstrated
 * before stored offers and ranking rules land; every recorded field is copied
 * from the audit, and shipping stays unknown because the audit recorded no
 * shipping amounts. The array order is the representative display order.
 */
export const representativeOffers: readonly Offer[] = [
  {
    id: "digistore-probook-440-g5",
    model: "HP ProBook 440 G5",
    seller: "Digi Store",
    url: "https://digistores.ir/products/hp-probook-440-g5/",
    observedAt: "2026-11-17T15:32:00+03:30",
    priceToman: 42_235_100,
    shippingToman: null,
    useCases: ["office"],
    configuration: {
      cpu: "Core i5-8250U",
      memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "Intel UHD 620",
    },
    defects: [],
    undisclosed: ["وضعیت باتری", "وضعیت نمایشگر", "وضعیت بدنه"],
    testTerms: "۷ روز مرجوعی",
    explanation:
      "ارزان‌ترین پیشنهاد اداری فهرست: پردازندهٔ i5 نسل ۸ و ۷ روز مرجوعی، با اختلاف زیاد از گران‌ترین گزینه‌ها.",
    tradeOff:
      "وضعیت باتری، نمایشگر و بدنه اعلام نشده؛ فروشنده برچسب استوک و ریفربیش را با هم به کار برده است.",
  },
  {
    id: "digistore-latitude-5490",
    model: "Dell Latitude 5490",
    seller: "Digi Store",
    url: "https://digistores.ir/products/dell-latitude-5490-intel-core-i5-8250u/",
    observedAt: "2026-11-17T15:34:00+03:30",
    priceToman: 45_440_000,
    shippingToman: null,
    useCases: ["office"],
    configuration: {
      cpu: "Core i5-8250U",
      memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "Intel UHD 620",
    },
    defects: [],
    undisclosed: ["وضعیت باتری", "وضعیت نمایشگر"],
    testTerms: "۷ روز مرجوعی",
    explanation:
      "حدود ۲۹ میلیون تومان ارزان‌تر از Latitude 5410، با همان رم و حافظه و ۷ روز مرجوعی.",
    tradeOff:
      "وضعیت باتری و نمایشگر اعلام نشده؛ پردازندهٔ نسل ۸ کندتر از i7 نسل ۱۰ در Latitude 5410 است.",
  },
  {
    id: "stockland-latitude-5410",
    model: "Dell Latitude 5410",
    seller: "Stockland",
    url: "https://stockland.ir/products/dell-latitude-5410",
    observedAt: "2026-11-17T15:40:00+03:30",
    priceToman: 74_000_000,
    shippingToman: null,
    useCases: ["office"],
    configuration: {
      cpu: "Core i7-10610U",
      memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت نمایشگر", "وضعیت بدنه"],
    testTerms: "۷ روز مرجوعی طبق شرایط فروشنده",
    explanation:
      "پردازندهٔ i7 نسل ۱۰، ۸ گیگابایت رم و ۷ روز فرصت مرجوعی؛ حدود ۲۹ میلیون تومان گران‌تر از ارزان‌ترین پیشنهاد اداری.",
    tradeOff:
      "فروشنده هیچ اطلاعاتی از سلامت باتری، نمایشگر و بدنه نداده است؛ وضعیت دستگاه نامشخص می‌ماند.",
  },
  {
    id: "radin-probook-645-g10",
    model: "HP ProBook 645 G10",
    seller: "Radin Computer",
    url: "https://radincomputer.com/product/hp-probook-645-g10-ryzen-5-7530u-8gb-256gb-stock/",
    observedAt: "2026-11-17T15:42:00+03:30",
    priceToman: 83_970_000,
    shippingToman: null,
    useCases: ["office"],
    configuration: {
      cpu: "Ryzen 5 7530U",
      memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "Radeon مجتمع",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت نمایشگر"],
    testTerms: "۷ روز تست",
    explanation:
      "پردازندهٔ نسل جدید Ryzen 5، گرید ظاهری A+ و ۷ روز تست؛ گران‌ترین پیشنهاد اداری این فهرست است.",
    tradeOff:
      "گران‌تر از Latitude 5410 است و گرید A+ فقط ظاهر دستگاه را توصیف می‌کند، نه سلامت باتری را.",
  },
  {
    id: "digistore-probook-645-g1",
    model: "HP ProBook 645 G1",
    seller: "Digi Store",
    url: "https://digistores.ir/products/hp-probook-645-g1/",
    observedAt: "2026-11-17T15:44:00+03:30",
    priceToman: 20_389_850,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "AMD A8-5550M",
      memory: "رم ۴ گیگابایت، SSD ۱۲۸ گیگابایت",
      graphics: "Radeon HD 8550G",
    },
    defects: [],
    undisclosed: ["وضعیت باتری", "وضعیت نمایشگر", "وضعیت بدنه"],
    testTerms: "۷ روز مرجوعی",
    explanation:
      "ارزان‌ترین پیشنهاد فهرست: زیر ۲۱ میلیون تومان با ۷ روز مرجوعی، برای کارهای سبک روزمره.",
    tradeOff:
      "رم ۴ گیگابایت و پردازندهٔ قدیمی دارد؛ برای چند برنامهٔ هم‌زمان کافی نیست.",
  },
  {
    id: "jeystock-elitebook-8470p",
    model: "HP EliteBook 8470p",
    seller: "Jey Stock",
    url: "https://jeystock.com/product/لپ-تاپ-استوک-اچ-پی-مدل-hp-elitebook-8470p-با-پردازنده-i5-ن/",
    observedAt: "2026-11-17T15:46:00+03:30",
    priceToman: 24_500_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "Core i5 نسل سوم",
      memory: "رم ۸ گیگابایت",
    },
    defects: [],
    undisclosed: ["ظرفیت حافظه", "وضعیت باتری", "وضعیت نمایشگر"],
    testTerms: "۴۵ روز گارانتی برنزی",
    explanation:
      "زیر ۲۵ میلیون تومان با ۸ گیگابایت رم و ۴۵ روز گارانتی برنزی؛ گزینهٔ کم‌هزینهٔ کارهای سبک.",
    tradeOff:
      "پردازندهٔ نسل سوم و ظرفیت حافظهٔ نامشخص دارد؛ برای کارهای سنگین مناسب نیست.",
  },
  {
    id: "itjonoob-latitude-e5450",
    model: "Dell Latitude E5450",
    seller: "ITjonoob",
    url: "https://itjonoob.com/product/dell-latitude-e5450/",
    observedAt: "2026-11-17T15:48:00+03:30",
    priceToman: 38_000_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "Core i5 (نسل اعلام نشده)",
      memory: "رم ۸ گیگابایت، SSD ۵۱۲ گیگابایت، نمایشگر Full HD",
    },
    defects: [],
    undisclosed: ["نسل دقیق پردازنده", "وضعیت باتری", "شرایط تست و مرجوعی"],
    explanation:
      "دقیقاً زیر ۴۰ میلیون تومان با ۸ گیگابایت رم، ۵۱۲ گیگابایت SSD و نمایشگر Full HD.",
    tradeOff:
      "فروشنده نسل دقیق پردازنده، وضعیت باتری و شرایط مرجوعی را اعلام نکرده است.",
  },
  {
    id: "stock-iran-latitude-5480",
    model: "Dell Latitude 5480",
    seller: "Stock Iran",
    url: "https://stockirshop.com/product/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-%D8%A7%D8%B3%D8%AA%D9%88%DA%A9-dell-latitude-5480/",
    observedAt: "2026-11-17T15:50:00+03:30",
    priceToman: 63_790_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "Core i7-7600U",
      memory: "رم ۸ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "GeForce 930MX",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت بدنه"],
    testTerms: "۷ روز تست سخت‌افزار یا تعویض؛ گزارش ظاهری تا ۲۴ ساعت",
    explanation:
      "ارزان‌ترین پیشنهاد روزمره با کارت گرافیک مجزا و ۷ روز تست سخت‌افزار.",
    tradeOff:
      "سلامت باتری و وضعیت بدنه اعلام نشده؛ شرایط تست خوب است اما وضعیت دستگاه نامشخص می‌ماند.",
  },
  {
    id: "radin-latitude-5480",
    model: "Dell Latitude 5480",
    seller: "Radin Computer",
    url: "https://radincomputer.com/product/dell-latitude-5480-core-i7-7500u-8gb-512gb-stock/",
    observedAt: "2026-11-17T15:52:00+03:30",
    priceToman: 67_570_000,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "Core i7-7500U",
      memory: "رم ۸ گیگابایت، SSD ۵۱۲ گیگابایت",
      graphics: "MX130",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت نمایشگر"],
    testTerms: "۷ روز تست",
    explanation:
      "همین مدل با دو برابر حافظهٔ SSD و کارت گرافیک MX130، با ۷ روز تست.",
    tradeOff:
      "حدود ۴ میلیون تومان گران‌تر از همان مدل در Stock Iran؛ گرید A++ فقط ظاهر را می‌گوید و باتری نامشخص است.",
  },
  {
    id: "technolife-thinkpad-e14",
    model: "Lenovo ThinkPad E14",
    seller: "ArkaDigi در Technolife",
    url: "https://www.technolife.com/product-596292/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-%D8%A7%D8%B3%D8%AA%D9%88%DA%A9-%D9%84%D9%86%D9%88%D9%88-14-%D8%A7%DB%8C%D9%86%DA%86%DB%8C-%D9%85%D8%AF%D9%84-thinkpad-e14-i3-10110u-16gb-120gb---%D9%85%D8%B4%DA%A9%DB%8C",
    observedAt: "2026-11-17T15:54:00+03:30",
    priceToman: 86_791_800,
    shippingToman: null,
    useCases: ["everyday"],
    configuration: {
      cpu: "Core i3-10110U",
      memory: "رم ۱۶ گیگابایت، حافظهٔ ۱۲۰ گیگابایت",
    },
    defects: [
      {
        id: "chassisScratch",
        label: "خط‌وخش یا شکستگی سطح بدنه؛ محل و شدت اعلام نشده",
        severity: "undisclosed",
      },
    ],
    undisclosed: ["محل و شدت خط‌وخش بدنه", "وضعیت نمایشگر"],
    testTerms: "۱۴ روز ضمانت مرجوعی",
    explanation:
      "۱۶ گیگابایت رم و ۱۴ روز ضمانت مرجوعی، با قیمتی نزدیک به گزینه‌های بدون ایراد.",
    tradeOff:
      "فروشنده خط‌وخش یا شکستگی بدنه را پذیرفته اما محل و شدت آن را نگفته است؛ حافظه هم ۱۲۰ گیگابایت است.",
  },
  {
    id: "radin-zbook-15-g3",
    model: "HP ZBook 15 G3",
    seller: "Radin Computer",
    url: "https://radincomputer.com/product/hp-zbook-15-g3-core-i7-6820hq-16gb-256gb-stock/",
    observedAt: "2026-11-17T15:56:00+03:30",
    priceToman: 80_620_000,
    shippingToman: null,
    useCases: ["graphics"],
    configuration: {
      cpu: "Core i7-6820HQ",
      memory: "رم ۱۶ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "کارت گرافیک مجزای AMD با ۲ گیگابایت حافظه؛ مدل دقیق اعلام نشده",
    },
    defects: [],
    undisclosed: ["مدل دقیق کارت گرافیک", "سلامت باتری"],
    testTerms: "۷ روز تست",
    explanation:
      "ارزان‌ترین پیشنهاد گرافیکی این فهرست با کارت گرافیک مجزا، ۱۶ گیگابایت رم و ۷ روز تست.",
    tradeOff:
      "مدل دقیق کارت گرافیک و سلامت باتری اعلام نشده؛ برای رندر سنگین باید با فروشنده بررسی شود.",
  },
  {
    id: "stock-iran-precision-3510",
    model: "Dell Precision 3510",
    seller: "Stock Iran",
    url: "https://stockirshop.com/product/%D9%84%D9%BE-%D8%AA%D8%A7%D9%BE-%D8%A7%D8%B3%D8%AA%D9%88%DA%A9-%D8%AF%D9%84-dell-precision-3510/",
    observedAt: "2026-11-17T15:58:00+03:30",
    priceToman: 83_970_000,
    shippingToman: null,
    useCases: ["graphics"],
    configuration: {
      cpu: "Core i7-6820HQ",
      memory: "رم ۱۶ گیگابایت، SSD ۲۵۶ گیگابایت",
      graphics: "Radeon R9 M360",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت نمایشگر"],
    testTerms: "۷ روز تست سخت‌افزار یا تعویض؛ گزارش ظاهری تا ۲۴ ساعت",
    explanation:
      "کارت گرافیک مجزای Radeon R9 M360 و شرایط تست سخت‌افزار هفت‌روزه، با اختلاف قیمت کم از ZBook.",
    tradeOff:
      "سلامت باتری و نمایشگر اعلام نشده؛ پیش از رندرهای سنگین وضعیت دستگاه را با فروشنده بررسی کنید.",
  },
  {
    id: "radin-precision-7540",
    model: "Dell Precision 7540",
    seller: "Radin Computer",
    url: "https://radincomputer.com/product/dell-precision-7540-core-i7-9850h-16gb-512gb-stock/",
    observedAt: "2026-11-17T16:00:00+03:30",
    priceToman: 130_700_000,
    shippingToman: null,
    useCases: ["graphics"],
    configuration: {
      cpu: "Core i7-9850H",
      memory: "رم ۱۶ گیگابایت، SSD ۵۱۲ گیگابایت",
      graphics: "Quadro T1000",
    },
    defects: [],
    undisclosed: ["سلامت باتری"],
    testTerms: "۷ روز تست",
    explanation:
      "پرقدرت‌ترین گزینهٔ گرافیکی فهرست: پردازندهٔ H، Quadro T1000 و ۵۱۲ گیگابایت حافظه با ۷ روز تست.",
    tradeOff:
      "گران‌ترین پیشنهاد فهرست است؛ حدود ۵۰ میلیون تومان بالاتر از ارزان‌ترین گزینهٔ گرافیکی و سلامت باتری هم اعلام نشده.",
  },
  {
    id: "qeshmoff-victus-15",
    model: "HP Victus 15-fa1128TX",
    seller: "Fars Pardazesh در Qeshmoff",
    url: "https://qeshmoff.com/shop/hp-victus-15-fa1128tx-i5-13420h-16gb-512gb",
    observedAt: "2026-11-17T16:02:00+03:30",
    priceToman: 210_000_000,
    shippingToman: null,
    useCases: ["gaming"],
    configuration: {
      cpu: "Core i5-13420H",
      memory: "رم ۱۶ گیگابایت، SSD ۵۱۲ گیگابایت",
      graphics: "RTX 2050",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "وضعیت نمایشگر", "شرایط تست و مرجوعی"],
    explanation:
      "ارزان‌ترین پیشنهاد بازی فهرست: RTX 2050 و ۱۶ گیگابایت رم با پردازندهٔ نسل ۱۳.",
    tradeOff:
      "RTX 2050 برای بازی‌های سنگین محدود است و فروشنده شرایط تست و مرجوعی را اعلام نکرده.",
  },
  {
    id: "pcccenter-loq-15irh8",
    model: "Lenovo LOQ 15IRH8",
    seller: "PCC Center",
    url: "https://pcccenter.com/product/لپ-تاپ-15-6-اینچی-گیمینگ-لنوو-notebook-lenovo-loq-15irh8-i5-13420h-16gb-ddr5-1tb-ssd-rtx3050-15-6/",
    observedAt: "2026-11-17T16:04:00+03:30",
    priceToman: 245_000_000,
    shippingToman: null,
    useCases: ["gaming"],
    configuration: {
      cpu: "Core i5-13420H",
      memory: "رم ۱۶ گیگابایت، SSD ۱ ترابایت",
      graphics: "RTX 3050",
    },
    defects: [],
    undisclosed: ["سلامت باتری", "شرایط تست و مرجوعی"],
    explanation:
      "RTX 3050 و یک ترابایت حافظه با همان پردازندهٔ Victus؛ توان گرافیکی بیشتر برای بازی‌های سنگین‌تر.",
    tradeOff:
      "۳۵ میلیون تومان گران‌تر از Victus است و شرایط مرجوعی و سلامت باتری اعلام نشده.",
  },
];
