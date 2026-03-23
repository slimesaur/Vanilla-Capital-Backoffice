export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#1A2433]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      <p className="font-avenir text-sm text-secondary-200">Carregando…</p>
    </div>
  );
}
