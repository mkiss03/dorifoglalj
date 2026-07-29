export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded-full bg-panel" />
      <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-panel" />

      <div className="mt-8 space-y-4">
        <div className="h-40 rounded-3xl bg-panel" />
        <div className="h-64 rounded-3xl bg-panel" />
      </div>
    </div>
  );
}
