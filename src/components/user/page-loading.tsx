export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-ink/60">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      <p className="text-sm">Memuat…</p>
    </div>
  );
}
