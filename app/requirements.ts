import type { UseCase } from "./journey";

export type Requirement = {
  id: string;
  label: string;
  latin: string;
};

export const gameCatalog: readonly Requirement[] = [
  { id: "cs2", label: "کانتر استریک ۲", latin: "Counter-Strike 2" },
  { id: "valorant", label: "والورانت", latin: "VALORANT" },
  { id: "lol", label: "لیگ آو لجندز", latin: "League of Legends" },
  { id: "dota2", label: "دوتا ۲", latin: "Dota 2" },
  { id: "gta5", label: "جی‌تی‌ای ۵", latin: "Grand Theft Auto V" },
  { id: "fortnite", label: "فورتنایت", latin: "Fortnite" },
  { id: "pubg", label: "پابجی", latin: "PUBG: BATTLEGROUNDS" },
  { id: "eafc", label: "ای‌ای اسپرت اف‌سی", latin: "EA SPORTS FC" },
  { id: "cod", label: "کال آو دیوتی وارزون", latin: "Call of Duty: Warzone" },
  { id: "minecraft", label: "ماینکرفت", latin: "Minecraft" },
  { id: "eldenring", label: "الدن رینگ", latin: "Elden Ring" },
  { id: "cyberpunk", label: "سایبرپانک ۲۰۷۷", latin: "Cyberpunk 2077" },
  { id: "rdr2", label: "رد دد ریدمپشن ۲", latin: "Red Dead Redemption 2" },
  { id: "apex", label: "ایپکس لجندز", latin: "Apex Legends" },
  { id: "rocketleague", label: "راکت لیگ", latin: "Rocket League" },
  { id: "witcher3", label: "ویچر ۳", latin: "The Witcher 3" },
  { id: "battlefield", label: "بتلفیلد ۲۰۴۲", latin: "Battlefield 2042" },
  { id: "r6", label: "رینبو سیکس سیج", latin: "Rainbow Six Siege" },
  { id: "forza", label: "فورزا هورایزن ۵", latin: "Forza Horizon 5" },
  { id: "hogwarts", label: "هاگوارتز لگسی", latin: "Hogwarts Legacy" },
];

export const softwareCatalog: readonly Requirement[] = [
  { id: "photoshop", label: "فتوشاپ", latin: "Adobe Photoshop" },
  { id: "illustrator", label: "ایلاستریتور", latin: "Adobe Illustrator" },
  { id: "premiere", label: "پریمیر پرو", latin: "Adobe Premiere Pro" },
  { id: "aftereffects", label: "افتر افکت", latin: "Adobe After Effects" },
  { id: "blender", label: "بلندر", latin: "Blender" },
  { id: "3dsmax", label: "تری‌دی‌اس مکس", latin: "Autodesk 3ds Max" },
  { id: "maya", label: "مایا", latin: "Autodesk Maya" },
  { id: "autocad", label: "اتوکد", latin: "AutoCAD" },
  { id: "sketchup", label: "اسکچاپ", latin: "SketchUp" },
  { id: "davinci", label: "داوینچی ریزالو", latin: "DaVinci Resolve" },
  { id: "figma", label: "فیگما", latin: "Figma" },
  { id: "coreldraw", label: "کورل دراو", latin: "CorelDRAW" },
  { id: "lightroom", label: "لایتروم", latin: "Adobe Lightroom" },
  { id: "indesign", label: "ایندیزاین", latin: "Adobe InDesign" },
  { id: "solidworks", label: "سالیدورکس", latin: "SolidWorks" },
  { id: "revit", label: "رویت", latin: "Autodesk Revit" },
  { id: "unity", label: "یونیتی", latin: "Unity" },
  { id: "unreal", label: "آنریل انجین", latin: "Unreal Engine" },
  { id: "zbrush", label: "زیبراش", latin: "ZBrush" },
  { id: "cinema4d", label: "سینما ۴دی", latin: "Cinema 4D" },
];

export function catalogFor(useCase: UseCase | undefined): readonly Requirement[] | undefined {
  if (useCase === "gaming") return gameCatalog;
  if (useCase === "graphics") return softwareCatalog;
  return undefined;
}

export function findRequirement(useCase: UseCase | undefined, id: string): Requirement | undefined {
  return catalogFor(useCase)?.find((item) => item.id === id);
}

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[أإآ]/g, "ا")
    .replace(/\u200c/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function searchRequirements(catalog: readonly Requirement[], query: string): readonly Requirement[] {
  const tokens = normalizeSearch(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return catalog;

  return catalog.filter((item) => {
    const haystack = normalizeSearch(`${item.label} ${item.latin} ${item.id}`);
    return tokens.every((token) => haystack.includes(token));
  });
}
