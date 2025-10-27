export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 bg-slate-100 rounded-xl" />
        <div className="h-96 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}
