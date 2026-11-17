import SearchPrototype from "./search-prototype";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ variant?: string }>;
}) {
  if (process.env.NODE_ENV !== "production") {
    const { variant } = await searchParams;
    if (variant === "A" || variant === "B" || variant === "C") {
      return <SearchPrototype initialVariant={variant} />;
    }
  }

  return (
    <main>
      <h1>راهنمای انتخاب لپ‌تاپ استوک</h1>
    </main>
  );
}
