export default function Loading() {
  return (
    <div className="pt-20 px-6 max-w-[1600px] mx-auto space-y-4">
      <div className="h-12 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 h-[60vh]">
        <div className="bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
        <div className="bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
