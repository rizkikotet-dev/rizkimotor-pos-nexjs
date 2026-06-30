import { Skeleton } from "@/components/ui/Skeleton";

export default function PublicHomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero section skeleton */}
      <section className="border-b border-surface-outline-variant py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-14 w-96" />
              <Skeleton className="h-5 w-72" />
              <div className="flex gap-3 pt-4">
                <Skeleton className="h-10 w-36 rounded-xl" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-5">
              <Skeleton className="h-24 w-56 rounded-xl" />
              <Skeleton className="h-24 w-48 rounded-xl" />
              <Skeleton className="h-24 w-52 rounded-xl ml-16" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="py-6 border-b border-surface-outline-variant">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center gap-20">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-8 w-20 mx-auto" />
              <Skeleton className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </section>

      {/* Product grid skeleton */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
