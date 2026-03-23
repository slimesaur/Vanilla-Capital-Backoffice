export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F6F0] dark:bg-[#1A2433]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent dark:border-secondary-300" />
      <p className="font-avenir text-sm text-ink dark:text-secondary-200">Carregando…</p>
    </div>
  );
}
