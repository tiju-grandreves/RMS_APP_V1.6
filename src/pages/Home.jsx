
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showEventToast } from "../components/common/toastHelper";
import Layout from "../components/layout/Layout";
import FilterTabs from "../components/common/FilterTabs";
import EventCard from "../components/common/EventCard";
import UpcomingEventsSidebar from "../components/common/UpcomingEventsSidebar";
import httpService from "../services/httpService";
import EventCardSkeleton from "../components/common/EventCardSkeleton";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-32">
    <img
      src="/icons/noeventfound.svg"
      alt="noeventfound"
      className="w-[120px] h-[120px]"
    />
    <p className="text-[14px] font-open-sans font-normal text-black">No event found</p>
  </div>
);

const Home = () => {
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  // const userRole = userData?.role ?? userData?.user?.role;
  // const shouldShowPublishedOnly = userRole === 1 || userRole === 2;
  const userRole = Number(userData?.role ?? userData?.user?.role);
  const shouldShowPublishedOnly = userRole === 1 || userRole === 2;
  const filters = [
    { id: "all", label: "All" },
    { id: "live", label: "Live" },
    { id: "past", label: "Past" },
    { id: "cancel", label: "Cancelled" },
  ];

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 20;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const toastData = location.state?.toast;

    if (!toastData) return;

    showEventToast(
      toastData.type,
      toastData.title,
      toastData.message
    );

    navigate(location.pathname, {
      replace: true,
      state: {},
    });
  }, [location.state, location.pathname, navigate]);

  
// useEffect(() => {

//   fetchEvents(
//     1,
//     '',
//     true
//   );

// }, []);
// useEffect(() => {
//   setPage(1);

//   fetchEvents(
//     1,
//     searchQuery,
//     true
//   );
// }, [activeFilter]);


const fetchEvents = useCallback(async ( pageNumber = 1, search = '', reset = false ) => {
    if (isFetchingRef.current && reset) {
    return;
  }

  isFetchingRef.current = true;

  try { 
    
    if (reset) {
  setFetchLoading(true);
} else {
  setLoadMoreLoading(true);
} setError(null); 
  // const url = `/events?page=${pageNumber}` + `&take=${PAGE_SIZE}` + `${search ? `&search=${search}` : ''}`; 
  let url =
  `/events?page=${pageNumber}` +
  `&take=${PAGE_SIZE}`;

if (search) {
  url += `&search=${search}`;
}

if (activeFilter === "live") {
  url += "&status=live";
}

if (activeFilter === "past") {
  url += "&status=past";
}

if (activeFilter === "cancel") {
  url += "&status=cancelled";
}

console.log("API URL:", url);
  const response = await httpService.get(url); 
console.log('FULL RESPONSE', response);
console.log('response.data', response.data);
console.log('response.data.data', response.data?.data);
 const result = response?.data || {};  const fetchedEvents = result.data || []; 
 console.log('FETCHED EVENTS', fetchedEvents);
 console.log('Fetched events raw:', fetchedEvents);
console.log('FETCHED EVENTS LENGTH', fetchedEvents.length);
 setEvents((prev) => reset ? fetchedEvents : [...prev, ...fetchedEvents] ); setPage(result.page || 1); setTotalPages( result.totalPages || 1 ); console.log( 'Fetched events:', fetchedEvents.length );
 } catch (err) { 
  console.error( 'Error fetching events:', err );
   setError( 'Error loading events' ); 
  } finally {
        isFetchingRef.current = false;

if (reset) {
      setFetchLoading(false);
    } else {
      setLoadMoreLoading(false);
    }    } }, [activeFilter]);

  // useEffect(() => {
  //   fetchEvents();
  // }, []);
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     fetchEvents(searchQuery);
  //   }, 500);
  //   return () => clearTimeout(timer);
  // }, [searchQuery]);


  // useEffect(() => {

  //   const timer = setTimeout(() => {

  //     setPage(1); fetchEvents( 1, searchQuery, true );

  //   }, 500);

  //   return () => clearTimeout(timer);

  // }, [searchQuery]);


  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;

      fetchEvents(1, '', true);
      return;
    }

    setPage(1);

    const timer = setTimeout(() => {
      fetchEvents(
        1,
        searchQuery,
        true
      );
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(timer);
  }, [activeFilter, searchQuery, fetchEvents]);

  useEffect(() => {
    const handleRefresh = () => {
      if (activeFilter === "all" && searchQuery === "") {
        fetchEvents(1, "", true);
      } else {
        setActiveFilter("all");
        setSearchQuery("");
      }
    };
    window.addEventListener("refreshHome", handleRefresh);
    return () => {
      window.removeEventListener("refreshHome", handleRefresh);
    };
  }, [activeFilter, searchQuery, fetchEvents]);



  const loadMoreEvents = () => {

    if (page >= totalPages) return;

    fetchEvents(
      page + 1,
      searchQuery,
      false
    );
  };

const getEventStatus = (event) => {
  const statusName =
    event?.eventStatus?.statusName?.toLowerCase();

  if (statusName === "cancelled") {
    return "Cancelled";
  }

  const now = new Date();

  const start = event.startTime
    ? new Date(event.startTime)
    : new Date(event.startDate);

  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(event.endDate || event.startDate);

  if (Number.isNaN(start.getTime())) {
    return "Past";
  }

  if (now < start) {
    return "Upcoming";
  }

  if (now >= start && now <= end) {
    return "Live";
  }

  return "Past";
};


  // const getEventStatus = (event) => {
  //   const statusName =
  //     event?.eventStatus?.statusName?.toLowerCase();

  //   // Cancelled event
  //   if (statusName === "cancelled") {
  //     return "Cancelled";
  //   }
  //   const now = new Date();
  //   const start = new Date(event.startDate);
  //   const end = new Date(event.endDate || event.startDate);

  //   if (Number.isNaN(start.getTime())) {
  //     return "Past";
  //   }

  //   if (now < start) {
  //     return "Upcoming";
  //   }

  //   if (now >= start && now <= end) {
  //     return "Live";
  //   }

  //   return "Past";
  // };


  const filteredEvents=events;
  //  = events.filter((event) => {
  //   const status = getEventStatus(event);

  //   if (shouldShowPublishedOnly && activeFilter !== "all") {
  //     const isCancelled =
  //       event.eventStatus?.statusName?.toLowerCase() === "cancelled";

  //     if (activeFilter === "cancel") {
  //       return isCancelled;
  //     }

  //     if (!isCancelled && event.eventStatusId !== 4) {
  //       return false;
  //     }
  //   }

  //   // if (shouldShowPublishedOnly) {
  //   //   if (activeFilter === "cancel") {
  //   //     return status === "Cancelled";
  //   //   }

  //   //   if (event.eventStatusId !== 4) {
  //   //     return false;
  //   //   }
  //   // }



  //   if (activeFilter === "all") return true;
  //   if (activeFilter === "live") return status === "Live";
  //   if (activeFilter === "past") return status === "Past";
  //   if (activeFilter === "cancel")
  //     return event.eventStatus?.statusName?.toLowerCase() === "cancelled";
  //   return true;
  // });

  const upcomingEvents = events
    .filter((event) => !shouldShowPublishedOnly || event.eventStatusId === 4)
    .filter((event) => getEventStatus(event) === "Upcoming")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const hasUpcomingEvents = upcomingEvents.length > 0;

  return (
    <Layout pageTitle="Home" onSearch={setSearchQuery}>
      {/* <Toaster position="top-right" reverseOrder={false} /> */}

      {/* <div className="p-6 pt-6 pr-[450px]">


        <div className="mb-6">
          <FilterTabs
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>


        <div className="flex-1 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
          {fetchLoading ? (
            <div className="text-center py-32 text-gray-500">
              Loading events...
            </div>
          ) : error ? (
            <div className="text-center py-32 text-red-500">
              {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>


        {/* <RecentlyUsed /> */}
      {/* </div>  */}
      <div className="flex flex-col xl:flex-row items-start gap-6 p-6">

        {/* LEFT CONTENT */}
        <div className="flex-1 min-w-0 w-full">

          {/* FILTER */}
          <div className="mb-6">
            <FilterTabs
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* EVENTS */}
          <div className="max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
           {fetchLoading && page === 1 && events.length === 0 ? (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-[#02949D] rounded-full animate-spin"></div>
  </div>

            ) : error ? (
              <div className="text-center py-32 text-red-500">
                {error}
              </div>
            ) : filteredEvents.length === 0 ? (
              <EmptyState />
            ) : (

              <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
  {filteredEvents.map((event) => (
    <EventCard
      key={event.id}
      event={event}
    />
  ))}

  {loadMoreLoading &&
    Array.from({ length: 4 }).map((_, index) => (
      <EventCardSkeleton
        key={`skeleton-${index}`}
      />
    ))}
</div>

                {page < totalPages  && !loadMoreLoading && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreEvents}
                      disabled={loadMoreLoading}
                      className="
          px-6 py-3
          rounded-lg
          bg-[#02949D]
          text-white
          hover:bg-[#027b82]
          transition-colors
        "
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>


            )}
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        {hasUpcomingEvents && (
          <div className="w-full xl:w-[340px] xl:shrink-0 xl:sticky xl:top-[80px] self-start">
            <UpcomingEventsSidebar events={upcomingEvents} />
          </div>
        )}

      </div>

    </Layout >
  );
};

export default Home;
