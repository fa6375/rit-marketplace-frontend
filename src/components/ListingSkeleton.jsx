export const ListingSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export const ListingSkeletonGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ListingSkeleton key={i} />
    ))}
  </div>
);
