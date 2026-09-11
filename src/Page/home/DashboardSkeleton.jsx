import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 bg-muted/80" />
                <Skeleton className="h-8 w-16 bg-muted/80" />
                <Skeleton className="h-3 w-20 bg-muted/80" />
              </div>

              <Skeleton className="h-12 w-12 rounded-lg bg-muted/80" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= QUICK ACTION ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-6 w-40 mb-6 bg-muted/80" />

          <div className="space-y-4">
            <Skeleton className="h-11 w-full rounded-lg bg-muted/80" />
            <Skeleton className="h-11 w-full rounded-lg bg-muted/80" />
            <Skeleton className="h-11 w-full rounded-lg bg-muted/80" />
            <Skeleton className="h-11 w-full rounded-lg bg-muted/80" />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton className="h-6 w-36 mb-6 bg-muted/80" />

          <Skeleton className="h-[250px] w-full rounded-xl bg-muted/80" />
        </div>
      </div>

      {/* ================= DEVICE STATUS ================= */}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-40 bg-muted/80" />
          <Skeleton className="h-9 w-28 rounded-md bg-muted/80" />
        </div>

        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between py-4 border-b last:border-none"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full bg-muted/80" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-44 bg-muted/80" />
                <Skeleton className="h-3 w-28 bg-muted/80" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20 rounded-md bg-muted/80" />
              <Skeleton className="h-8 w-8 rounded-md bg-muted/80" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= RECENT ALERTS ================= */}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-6 w-40 mb-6 bg-muted/80" />

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center justify-between py-5 border-b last:border-none"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full bg-muted/80" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-56 bg-muted/80" />
                <Skeleton className="h-3 w-40 bg-muted/80" />
              </div>
            </div>

            <Skeleton className="h-4 w-16 bg-muted/80" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
