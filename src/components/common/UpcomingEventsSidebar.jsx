import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpcomingEventTitle = ({ title }) => {
  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const checkOverflow = () => {
      if (!titleRef.current) return;
      const { scrollWidth, clientWidth } = titleRef.current;
      const overflowAmount = Math.max(scrollWidth - clientWidth, 0);

      setIsOverflowing(overflowAmount > 0);
      setScrollDistance(overflowAmount);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  return (
    <div
      className={`mb-2 upcoming-event-title${isOverflowing ? ' is-overflowing' : ''}`}
      style={{
        '--title-scroll-distance': `${scrollDistance}px`,
        '--title-scroll-duration': `${Math.max(scrollDistance / 35, 4)}s`
      }}
    >
      <h4
        ref={titleRef}
        className="upcoming-event-title-text text-[16px] font-open-sans font-semibold leading-[22px] text-[#000000]"
      >
        {title}
      </h4>
    </div>
  );
};

const UpcomingEventsSidebar = ({ events }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    };
  };

  const upcomingEvents = Array.isArray(events) ? events : [];

  if (upcomingEvents.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-[0px_0px_9.6px_0px_rgba(128,202,214,0.25)] border border-[#d6dfde]">      <div className="p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[24px] font-dm-sans font-semibold leading-[31px] text-black">
          Upcoming events
        </h3>
      </div>

      {/* Event List */}
      <div className="space-y-4 max-h-[calc(100vh-240px)] overflow-y-auto pr-2  custom-scrollbar">
        {upcomingEvents.map((event) => {
          const startDate = formatDate(event.startDate);
          return (
            <div
              key={event.id}
              onClick={() => navigate(`/event/${event.id}`)}
              className="flex gap-4 cursor-pointer hover:bg-gray-50 py-2 pr-2 pl-3 rounded-lg transition-colors duration-200 border-[0.5px] border-[#69B1B6] shadow-[0px_4px_14px_rgba(128,202,214,0.45)] hover:bg-[#F9FEFF]"
            >
              {/* Event Thumbnail */}
              <div className="relative flex-shrink-0 w-[65px] h-[72px] rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
                {/* {event.banner || event.bannerUrl ? (
                  <SecureImage
                    src={event.banner || event.bannerUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                    minHeight="100%"
                    showLoadingText={false}
                    showLoader={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#475569] to-[#0891b2]"></div>
                )} */}
                {event.banner || event.bannerUrl ? (
  <img
    src={event.banner || event.bannerUrl}
    alt={event.name}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.src = "/noimage.png";
    }}
  />
) : (
  <img
    src="/noimage.png"
    alt="No event banner"
    className="w-full h-full object-cover"
  />
)}
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <UpcomingEventTitle title={event.name} />

                {/* Location */}
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/icons/location.svg"
                    alt="Close"
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[12px] font-open-sans font-normal leading-[16px] text-[#3C3C3C] truncate">
                    {event.location || 'TBD'}
                  </span>
                </div>

                {/* Registered Count */}
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/people.svg"
                    alt="Close"
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[12px] font-open-sans font-normal leading-[16px] text-[#1b1d21]">
                    {event.attendeeCount || event.attendees || 2600} Registered
                  </span>
                </div>
              </div>

              {/* Date Badge */}
              <div className="self-end mb-2 flex-shrink-0 w-[40px] h-[54px] bg-[#CDECF4]  rounded-[10px] flex flex-col items-center justify-center">
                <span className="text-[#395062] text-[14px] font-normal font-open-sans leading-[19px]">
                  {startDate.month}
                </span>
                <span className="text-[#395062] text-[16px] font-semibold font-open-sans leading-[22px]">
                  {startDate.day}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
};

export default UpcomingEventsSidebar;