const EventCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <div className="h-40 bg-gray-200 rounded-md mb-4"></div>

    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>

    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>

    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

export default EventCardSkeleton;
