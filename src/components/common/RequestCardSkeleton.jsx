const RequestCardSkeleton = () => (
  <div
    className="bg-white rounded-lg border p-3 animate-pulse"
    style={{
      border: '0.5px solid #D6DFDE',
      boxShadow: '0px 0px 9.6px 0px rgba(128, 202, 214, 0.25)',
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-gray-200"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>

    <div className="w-full h-[222px] bg-gray-200 rounded-[8px] mb-3"></div>

    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>

    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
  </div>
);
export default RequestCardSkeleton;