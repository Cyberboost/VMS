export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div>
        <div className="h-9 w-64 bg-muted rounded animate-pulse" />
        <div className="h-5 w-96 bg-muted rounded animate-pulse mt-2" />
      </div>

      {/* KPI Grid Skeleton - 4 cards in a row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse mb-2" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Bottom Section Skeleton - Two-column responsive grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: Recent Incidents Table Skeleton (spans 3 cols) */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-4 flex-1 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                    <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions Skeleton (spans 2 cols) */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-6">
              <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="p-6 pt-0 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-full bg-muted rounded-md animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
