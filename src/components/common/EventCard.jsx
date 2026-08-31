import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrollableTitle from './ScrollableTitle';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState('');

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    };
  };

  const getEventStatus = useCallback(() => {
  const statusName =
    event?.eventStatus?.statusName?.toLowerCase();

  if (statusName === "cancelled") {
    return "Cancelled";
  }

  const now = new Date();

  const start = event?.startTime
    ? new Date(event.startTime)
    : new Date(event.startDate);

  const end = event?.endTime
    ? new Date(event.endTime)
    : new Date(event.endDate);

  if (now < start) {
    return "Upcoming";
  }

  if (now >= start && now <= end) {
    return "Live";
  }

  if (now > end) {
    return "Expired";
  }

  return "Upcoming";
}, [event?.eventStatus?.statusName, event?.startTime, event?.startDate, event?.endTime, event?.endDate]);

  // const getEventStatus = () => {
  //   const statusName =
  //     event?.eventStatus?.statusName?.toLowerCase();

  //   // Cancelled event
  //   if (statusName === "cancelled") {
  //     return "Cancelled";
  //   }
  //   const now = new Date();


  // const startDate = event?.startDate
  //   ? new Date(event.startDate)
  //   : null;

  // const endDate = event?.endDate
  //   ? new Date(event.endDate)
  //   : null;

  // const endTime = event?.endTime
  //   ? new Date(event.endTime)
  //   : null;

  // // Time expired
  // if (endTime && now > endTime) {
  //   return "Time Expired";
  // }

  // // Date expired
  // if (endDate && now > endDate) {
  //   return "Date Expired";
  // }

  //    if (
  //   startDate &&
  //   endDate &&
  //   now >= startDate &&
  //   now <= endDate
  // ) {
  //   return "Live";
  // }

  // // Upcoming
  // if (startDate && now < startDate) {
  //   return "Upcoming";
  // }

  // return "Past";

  // };

  // const calculateCountdown = () => {
  //   const now = new Date();
  //   const start = new Date(event.startDate);
  //   const diff = start - now;

  //   if (diff <= 0) return '';

  //   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  //   const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  //   const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  //   return `${days}day : ${hours.toString().padStart(2, '0')}hr : ${minutes.toString().padStart(2, '0')} min`;
  // };


  const calculateCountdown = useCallback(() => {
  const now = new Date();

  const start = event?.startTime
    ? new Date(event.startTime)
    : new Date(event.startDate);

  const diff = start - now;

  if (diff <= 0) return '';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (diff % (1000 * 60 * 60 * 24)) /
    (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (diff % (1000 * 60 * 60)) /
    (1000 * 60)
  );

  return `${days}day : ${hours
    .toString()
    .padStart(2, '0')}hr : ${minutes
    .toString()
    .padStart(2, '0')} min`;
}, [event?.startTime, event?.startDate]);

  useEffect(() => {
    const status = getEventStatus();
    if (status === 'Upcoming') {
      setCountdown(calculateCountdown());
      const timer = setInterval(() => {
        setCountdown(calculateCountdown());
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [getEventStatus, calculateCountdown]);

  const status = getEventStatus();
  const startDate = formatDate(event.startDate);
  const isEndingSoon = () => {
    const now = new Date();
    const end = new Date(event.endDate);
    const diff = end - now;

    const oneDay = 1000 * 60 * 60 * 24;
    return diff > 0 && diff <= oneDay;
  };

  const endingSoon = isEndingSoon();

  const isVirtual = event?.eventModeId === 2 || event?.eventMode === 'virtual' || String(event?.eventModeName || '').toLowerCase().includes('virtual') || String(event?.eventModeName || '').toLowerCase().includes('online');
  const hasVenue = event?.location && event?.location.trim() !== '' && event?.location !== 'Venue not specified';
  const showLocation = !(isVirtual && !hasVenue);

  return (
    <div
      onClick={() => navigate(`/event/${event.id}`)}
      className={`bg-white rounded-[8px] border border-border shadow-[0px_4px_20px_rgba(2,148,157,0.15)] hover:shadow-[0px_4px_20px_rgba(2,148,157,0.15)] hover:border-accent transition-all duration-300 cursor-pointer overflow-hidden group w-full  ${status === 'Live' && endingSoon ? 'opacity-60' : ''}`}
    >
      {/* Event Banner */}
      <div className="p-3">
        <div className="relative h-[222px] overflow-hidden rounded-[10px] bg-gradient-to-br from-accent to-primary">
          {(event.banner?.trim() || event.bannerUrl?.trim()) ? (
             <img
    src={event.banner || event.bannerUrl ||'/noimage.png' }
    alt={event.name}
    className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-500"
    loading="lazy"
    onError={(e) => {
      e.currentTarget.src = 'https://placehold.co/1200x400?text=No+Image+Available';
    }}
  />
            // <SecureImage
            //   src={event.banner || event.bannerUrl}
            //   alt={event.name}
            //   className="w-full h-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-500"
            //   showLoader={false}
            // />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-accent">
              <svg className="w-20 h-20 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Date Badge */}
          <div className="absolute top-[22px] right-[12px] w-[40px] h-[54px] bg-white/70 rounded-[4px] flex flex-col items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-text text-[14px] font-normal font-open-sans leading-[19px]">
              {startDate.month}
            </span>
            <span className="text-text text-[18px] font-bold font-open-sans leading-[22px]">
              {startDate.day}
            </span>
          </div>
        </div>
      </div>
      {/* Event Details */}
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <ScrollableTitle 
            title={event.name}
            className="text-[20px] font-medium text-[#1B1D21]"
          />

          {status === 'Live' && (
            <span className="text-[#16a34a] text-[16px] font-semibold text-green ">
              Live
            </span>
          )}

          {/* {status === 'Cancelled' && (
            <span className="text-[#FF6C0B] text-[16px] font-semibold font-dmsans">
              Cancelled
            </span>
          )} */}

          {status === 'Upcoming' && countdown && (
            <span className="text-[#FF6C0B] text-[16px] font-semibold font-dmsans">
              {countdown}
            </span>
          )}

       {status === "Expired" && (
  <span className="text-[#F04438] text-[16px] font-semibold whitespace-nowrap">
    Expired
  </span>
)}

{status === 'Past' && (
  <span className="text-[#98A2B3] text-[16px] font-semibold font-dmsans whitespace-nowrap">
    Ended
  </span>
)}

          {/* {status === 'Past' && (
            <span className="text-[#FF6C0B] text-[16px] font-semibold font-dmsans  whitespace-nowrap overflow-hidden text-ellipsis">
              Ended on{" "}
              {new Date(event.endDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )} */}
        </div>

        <p className="text-[14px] font-open-sans font-normal leading-[19px] text-text mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2.5">


          {showLocation && (
            <div className="flex items-start gap-2 text-[14px] text-[#1b1d21]">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16">
                <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12.6667 6.66667C12.6667 11.3333 8 14 8 14C8 14 3.33334 11.3333 3.33334 6.66667C3.33334 3.72115 5.72115 1.33334 8 1.33334C10.2789 1.33334 12.6667 3.72115 12.6667 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-open-sans font-normal leading-[19px] line-clamp-1">{event.location || 'Venue not specified'}</span>
            </div>
          )}
          {/* <div className="flex items-center gap-2 text-[14px] text-[#1b1d21]">

            <span className="font-open-sans font-normal leading-[19px]">
              {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div> */}
          <div className="flex items-center gap-2 text-[14px] text-[#1b1d21]">
            {status === "Cancelled" && (
              <span className="text-[#FF6C0B] font-open-sans font-semibold leading-[19px]">
                Cancelled
              </span>
            )}

            <span className="font-open-sans font-normal leading-[19px]">
              {new Date(event.startDate).toLocaleDateString("en-US", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Status Badge or Timer */}
      {/* <div className="px-3 pb-4"> */}
      {/* {status === 'Live' && (
          <div className="text-[#16a34a] text-[16px] font-open-sans font-normal leading-[21px]">
            Live
          </div>
        )} */}
      {/* {status === 'Upcoming' && countdown && (
          <div className="text-[#1b1d21] text-[16px] font-open-sans font-normal leading-[21px]">
            {countdown}
          </div>
        )}
        {status === 'Past' && (
          <div className="text-[#dc2626] text-[16px] font-open-sans font-normal leading-[21px]">
            Ended on {new Date(event.endDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        )}
        {event.status === 'Past' && (
          <div className="text-[#6b7280] text-[16px] font-open-sans font-normal leading-[21px]">
            Ended on {new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )} */}
      {/* </div> */}
    </div>

  );
};

export default EventCard;
