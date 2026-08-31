import { useEffect, useState, useRef } from "react";
import httpService from "../services/httpService";
import { fetchBlobUrl } from "../components/common/SecureImage";
import ProfileImage from "../components/common/ProfileImage";
import { showEventToast } from "../components/common/toastHelper";

const SPEAKER_PLACEHOLDER = "/icons/Speaker-image-placeholder.svg";

const EventRequestModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onContinue,
  loading,
  userRole,
}) => {
  const avatarRadius = 23;
  const avatarCircumference = 2 * Math.PI * avatarRadius;
  const avatarArcLength = avatarCircumference / 2;
  const [, setSpeakers] = useState([]);
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [, setBrandingBlob] = useState(null);
  const [speakerBlobs, setSpeakerBlobs] = useState({});
  const [managerBlobs, setManagerBlobs] = useState({});
  const blobUrls = useRef([]);

  useEffect(() => {
    if (!isOpen || !request) return;

    const blobs = [];

    const loadImages = async () => {
      // Branding

      const brandingUrl = request.branding?.trim();

      if (brandingUrl) {
        const url = await fetchBlobUrl(brandingUrl);
        if (url) { blobs.push(url); setBrandingBlob(url); }
      }

      // Speaker photos
      const speakerList = request.speakerRequests || request.speakers || [];
      const blobMap = {};
      await Promise.all(
        speakerList.map(async (s) => {
          const photoUrl = s.photoUrl?.trim() || s.avatar?.trim();
          if (photoUrl) {
            const url = await fetchBlobUrl(photoUrl);
            if (url) { blobs.push(url); blobMap[s.id] = url; }
          }
        })
      );
      setSpeakerBlobs(blobMap);
    };

    loadImages();
    blobUrls.current = blobs;

    return () => {
      blobUrls.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrls.current = [];
      setBrandingBlob(null);
      setSpeakerBlobs({});
      setManagerBlobs({});
    };
    // Intentionally keyed by request?.id only, so a new (but equivalent) request
    // object reference from the parent doesn't retrigger blob loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, request?.id]);

  useEffect(() => {
    const fetchSpeakers = async () => {
      if (!request?.eventId) return;

      setSpeakersLoading(true);

      try {
        const response = await httpService.get(
          `/speakers?eventId=${request.eventId}`
        );

        if (response.success) {
          setSpeakers(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching speakers:", error);
      } finally {
        setSpeakersLoading(false);
      }
    };

    fetchSpeakers();
  }, [request?.eventId]);

  useEffect(() => {
    const fetchAssignedManagers = async () => {
      if (!request?.assignedManagerId) {
        setAssignedManagers([]);
        return;
      }

      setManagersLoading(true);

      try {
        const response = await httpService.get(`/sea_users/${request.assignedManagerId}`);
        const detail = Array.isArray(response?.data?.data)
          ? response.data.data[0]
          : response?.data?.data || response?.data || null;

        const managerFromDetail =
          detail?.assignedManager ||
          detail?.eventManager ||
          detail?.manager ||
          null;

        if (managerFromDetail) {
          setAssignedManagers([managerFromDetail]);
        } else if (detail?.id && (detail?.fullName || detail?.email)) {
          setAssignedManagers([{
            id: detail.id,
            fullName: detail.fullName,
            name: detail.fullName,
            email: detail.email,
            phone: detail.phone,
            roleName: detail.designation || "Event Manager",
            profileImageUrl: detail.profileImage || null,
          }]);
        } else if (detail?.assignedManagerId || request?.assignedManagerId) {
          setAssignedManagers([{
            id: detail?.assignedManagerId || request.assignedManagerId,
            fullName:
              detail?.assignedManagerName ||
              request.assignedManagerName ||
              "Event Manager",
            name:
              detail?.assignedManagerName ||
              request.assignedManagerName ||
              "Event Manager",
            email: detail?.assignedManagerEmail || request.assignedManagerEmail,
            phone: detail?.assignedManagerPhone || request.assignedManagerPhone,
            roleName: "Event Manager",
            profileImageUrl:
              detail?.assignedManagerProfileImageUrl ||
              detail?.assignedManagerImageUrl ||
              detail?.assignedManagerAvatar ||
              request?.assignedManagerProfileImageUrl ||
              request?.assignedManagerImageUrl,
          }]);
        }
      } catch (error) {
        console.error("Error fetching assigned managers:", error);

        if (request.assignedManagerId) {
          setAssignedManagers([{
            id: request.assignedManagerId,
            fullName: request.assignedManagerName || "Event Manager",
            name: request.assignedManagerName || "Event Manager",
            email: request.assignedManagerEmail,
            phone: request.assignedManagerPhone,
            roleName: "Event Manager",
          }]);
        } else {
          setAssignedManagers([]);
        }
      } finally {
        setManagersLoading(false);
      }
    };

    fetchAssignedManagers();
    // request.assignedManager* fields are only used as fallback values when building the
    // manager object; they don't need to retrigger the fetch, which is keyed by assignedManagerId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, request?.status, request?.eventId, request?.assignedManagerId]);

  useEffect(() => {
    const loadManagerImages = async () => {
      if (!isOpen || !assignedManagers.length) return;

      const blobMap = {};

      await Promise.all(
        assignedManagers.map(async (manager) => {
          const imageUrl =
            manager?.profileImageUrl ||
            manager?.imageUrl ||
            manager?.avatar ||
            manager?.photoUrl;

          if (!imageUrl) return;

          const blobUrl = await fetchBlobUrl(imageUrl);
          if (blobUrl) {
            blobMap[manager.id] = blobUrl;
            blobUrls.current.push(blobUrl);
          }
        })
      );

      setManagerBlobs(blobMap);
    };

    loadManagerImages();
  }, [isOpen, assignedManagers]);

  if (!isOpen || !request) return null;

  const getEventTypeName = (eventTypeId) => {
    const eventTypes = {
      1: "Conference",
      2: "Workshop",
      3: "VIP Event"
    };
    return eventTypes[eventTypeId] || "-";
  };

  const getEventCategoryName = (eventCategoryId) => {
    const eventCategories = {
      1: "Controlled",
      2: "Public",
      3: "Invited"
    };
    return eventCategories[eventCategoryId] || "-";
  };

  const getEventModeName = (eventModeId) => {
    const eventModes = {
      1: "Physical location",
      2: "Online",
      3: "Hybrid"
    };
    return eventModes[eventModeId] || "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";

    const datePart = dateString.split("T")[0]; // 2026-05-14
    const [year, month, day] = datePart.split("-");

    const monthName = new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleString("en-GB", { month: "short" });

    return `${day} ${monthName} ${year}`;
  };

  // const formatDate = (dateString) => {
  //   if (!dateString) return "--";

  //   const utcDate = new Date(dateString);
  //   if (isNaN(utcDate.getTime())) return "--";

  //   const offsetMs = 5.5 * 60 * 60 * 1000;
  //   const originalDate = new Date(utcDate.getTime() + offsetMs);

  //   const day = String(originalDate.getDate()).padStart(2, "0");
  //   const month = originalDate.toLocaleString("en-GB", { month: "short" });
  //   const year = originalDate.getFullYear();

  //   return `${day} ${month} ${year}`;
  // };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "--:-- --";

    const timePart = dateTimeString.split("T")[1];
    if (!timePart) return "--:-- --";

    const [hourString, minuteString] = timePart.split(":");
    let hours = Number(hourString);
    const minutes = minuteString;

    if (Number.isNaN(hours) || !minutes) return "--:-- --";

    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${ampm}`;
  };

  // const formatTime = (dateTimeString) => {
  //   if (!dateTimeString) return "--:-- --";

  //   const date = new Date(dateTimeString);
  //   if (isNaN(date.getTime())) return "--:-- --";

  //   let hours = date.getHours();
  //   const minutes = String(date.getMinutes()).padStart(2, "0");
  //   const ampm = hours >= 12 ? 'pm' : 'am';
  //   hours = hours % 12;
  //   hours = hours ? hours : 12;

  //   return `${hours}:${minutes} ${ampm}`;
  // };


  const getStartDate = () => {
    if (!request.startDate) return "--";
    return formatDate(request.startDate);
  };

  const getStartTime = () => {
    if (!request.startTime) return "--:-- --";
    return formatTime(request.startTime);
  };

  const getEndDate = () => {
    if (!request.endDate) return "--";
    return formatDate(request.endDate);
  };

  const getEndTime = () => {
    if (!request.endTime) return "--:-- --";
    return formatTime(request.endTime);
  };


  // const getStartDate = () => {
  //   if (!request.startDate) return "--";
  //   return formatDate(request.startDate);
  // };

  // const getStartTime = () => {
  //   if (!request.startDate) return "--:-- --";
  //   return formatTime(request.startTime);
  // };

  // const getEndDate = () => {
  //   if (!request.endDate) return "--";
  //   return formatDate(request.endDate);
  // };

  // const getEndTime = () => {
  //   if (!request.endDate) return "--:-- --";
  //   return formatTime(request.endTime);
  // };

  const formatPhoneNumber = (phone) => {
    if (!phone) return null;

    let cleanedPhone = phone.toString().replace(/^(\+971|00971)/, '');

    cleanedPhone = cleanedPhone.replace(/\D/g, '');

    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = cleanedPhone.substring(1);
    }
    return `+971 ${cleanedPhone}`;
  };

  const speakersList = request.speakerRequests || request.speakers || [];
  const isFacilityManager = userRole === "Facility manager";
  const isEventManager = userRole === "Event Manager";
  const showRejectAccept = isFacilityManager && request.status === "Pending";
  // const showContinueForFacility = isFacilityManager && request.status === "Approved";
  const showContinueForEvent = isEventManager && request.status === "Approved";
  // const showContinueButton = showContinueForFacility || showContinueForEvent;
  const showContinueButton = showContinueForEvent;

  const renderRequestorContact = () => {
    const email = request.requestorEmail;
    const phone = request.requestorPhone;

    if (!email && !phone) return null;

    if (email && phone) {
      return (
        <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">          {email} • {formatPhoneNumber(phone)}
        </p>
      );
    }

    if (email) {
      return <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">{email}</p>;
    }

    if (phone) {
      return <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">{formatPhoneNumber(phone)}</p>;
    }

    return null;
  };

  const renderSpeakerContact = (speaker) => {
    const email = speaker.email;
    const phone = speaker.phone;

    if (!email && !phone) return null;

    if (email && phone) {
      return (
        <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">
          {email} • {formatPhoneNumber(phone)}
        </p>
      );
    }

    if (email) {
      return <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">{email}</p>;
    }

    if (phone) {
      return <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#222020] mt-[10px]">{formatPhoneNumber(phone)}</p>;
    }

    return null;
  };

  const getEventStartDateTime = () => {
    const startDateValue = request.startDate;
    const startTimeValue = request.startTime || request.startDate;

    if (!startDateValue || !startTimeValue) return null;

    const datePart = startDateValue.split("T")[0];
    const timePart = startTimeValue.split("T")[1]?.split(".")[0];

    if (!datePart || !timePart) return null;

    return new Date(`${datePart}T${timePart}`);
  };

  const isApprovalTimeExpired = () => {
    const eventStartDateTime = getEventStartDateTime();

    if (!eventStartDateTime || isNaN(eventStartDateTime.getTime())) {
      return false;
    }

    return new Date() >= eventStartDateTime;
  };

  const validateApprovalTime = () => {
    if (isApprovalTimeExpired()) {
      showEventToast(
        "warning",
        "Time is up",
        "You can't approve or reject an event request after the event start date/time."
      );

      return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
        <div className="px-[32px] pt-[32px] flex-shrink-0">          <div className="pb-4 flex justify-between items-center border-b-[0.5px] border-[#969696]">            <h2 className="font-open-sans font-semibold text-[24px] leading-[28px] tracking-[-0.25%] text-[#02949D]">
          Event request details
        </h2>

          <button onClick={onClose}>
            <img
              src="/icons/ic_close.svg"
              alt="Close"
              className="w-[24px] h-[24px] cursor-pointer"
            />
          </button>
        </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-start gap-4">
            <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0">              <ProfileImage
              userId={request.requestorId}
              name={request.requestorName}
              alt={request.requestorName || "User"}
              className="w-full h-full object-cover"
            />
            </div>

            <div>
              <p className="font-open-sans font-bold text-[14px] leading-[20px] tracking-[0.1%] text-[#1B1D21]">
                {request.requestorName || "Javani Jones"}
              </p>
              {renderRequestorContact()}
            </div>
          </div>

          <h3 className="font-dmsans font-bold text-[24px] leading-[100%] tracking-[0%] text-[#060606]">
            {request.eventName || "Sharjah summit"}
          </h3>

          <div className="pr-80">
             {request.branding ?(
 <img
  src={request.branding || "/noimage.png"}
  alt="Event"
  className="rounded-lg object-cover w-[845px] h-[222px] [&>div:last-child]:pt-8 [&>div:last-child]:pb-8"
  onError={(e) => {
    e.currentTarget.src = "https://placehold.co/1200x400?text=No+Image+Available";
  }}
  />
  ) : (
  <img
    src="/noimage.png"
    alt="No event banner"
    className="w-full h-full object-cover"
  />
)}
           {/* {request.branding?.trim() ? (
  brandingBlob ? (
    <img
      src={brandingBlob}
      alt="Event"
      className="rounded-lg object-cover w-full h-[220px]"
    />
  ) : (
    <div className="rounded-lg w-full h-[220px] bg-gray-200 animate-pulse" />
  )
) : (
  <img
    src="/noimage.png"
    alt="No image"
    className="rounded-lg object-cover w-full h-[220px]"
  />
)} */}
          </div>

          <div>
            <h4 className="font-dmsans font-semibold text-[16px] leading-[100%] tracking-[0%] text-[#060606] mb-2">
              Description
            </h4>           <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#1B1D21]">
              {request.description || "Event description not available."}
            </p>
          </div>

          <div>
            <div className="w-[707px] min-h-[180px] rounded-[8px] border border-[#CDD6DC] p-[20px] grid grid-cols-1 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
              <div className="px-[8px]">
                <p className="font-semibold text-sm">Start date</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">
                  {getStartDate()}
                </p>              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">Start time</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">
                  {getStartTime()}
                </p>              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">End date</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">
                  {getEndDate()}
                </p>              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">End time</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">
                  {getEndTime()}
                </p>
              </div>

              <div className="hidden xl:block xl:col-span-4">
                <div className="w-[667px] border-t-[0.5px] border-[#969696] mx-auto"></div>
              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">Category</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">{getEventCategoryName(request.eventCategoryId)}</p>
              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">Type</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">{getEventTypeName(request.eventTypeId)}</p>
              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">No. of attendees</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">{request.attendees || request.attendeeCount || "- -"}</p>
              </div>

              <div className="px-[8px]">
                <p className="font-semibold text-sm">Event Mode</p>
                <p className="font-open-sans font-normal text-[14px] leading-[19px] tracking-[0%] text-[#000000] pt-[12px]">{getEventModeName(request.eventModeId) || "-"}</p>
              </div>
            </div>
          </div>

          {!speakersLoading && speakersList.length > 0 && (
            <div>
              <h4 className="font-dmsans font-semibold text-[16px] leading-[100%] tracking-[0%] text-[#060606] mb-4">
                Speaker details
              </h4>
              {speakersLoading ? (
                <p className="text-gray-500">Loading speakers...</p>
              ) : speakersList.length === 0 ? (
                <p className="text-gray-500">No speakers available</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-5">
                  {speakersList.map((speaker, idx) => {
                    const name = speaker.name || "Speaker Name";
                    const title =
                      speaker.title ||
                      speaker.role ||
                      speaker.designation ||
                      "Guest Speaker";
                    const organization = speaker.organization || speaker.company || "";

                    const speakerBlobUrl = speakerBlobs[speaker.id] || null;

                    return (
                      <div
                        key={speaker.id || idx}
                        className="w-[512px] h-[132px] rounded-[8px] border-[0.5px] border-[#D6DFDE] bg-[#FFFFFF] shadow-[0px_0px_9.6px_0px_#80CAD640] px-[20px] py-[18px] flex items-center gap-[16px]"                      >
                        <div className="relative w-[93px] h-[92px] flex-shrink-0">                          {/* Teal arc SVG — semi-circle on the right side, rounded linecap */}
                          <svg
                            className="absolute inset-0 h-full w-full pointer-events-none z-10"
                            viewBox="0 0 56 56"
                            fill="none"
                            aria-hidden="true"
                            style={{ transform: "rotate(222deg)" }}
                          >
                            <circle
                              cx="28"
                              cy="28"
                              r={avatarRadius}
                              stroke="#2CC7D3"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray={`${avatarArcLength} ${avatarCircumference}`}
                            />
                          </svg>

                          {/* Avatar circle */}
                          <div className={`absolute inset-[5px] rounded-full overflow-hidden border-2 border-white flex items-center justify-center ${speakerBlobUrl ? "bg-gray-200" : "bg-transparent"}`}>
                            {speakerBlobUrl ? (
                              <img
                                src={speakerBlobUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                  onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = SPEAKER_PLACEHOLDER;
      e.currentTarget.className = "w-full h-full object-contain";
    }}
                              />
                            ) : (
                              <img
                                src={SPEAKER_PLACEHOLDER}
                                alt={name}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-open-sans font-bold text-[18px] leading-[100%] tracking-[0%] text-[#252525]">
                            {name}
                          </h5>                          <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#02949D] mt-[10px]">
                            {title}
                            {organization && (
                              <>
                                {" "}
                                <span className="text-gray-600">&bull;</span>{" "}
                                {organization}
                              </>
                            )}
                          </p>
                          {renderSpeakerContact(speaker)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {!managersLoading && request?.assignedManagerId && assignedManagers.length > 0 && (
            <div>
              <h4 className="font-dmsans font-semibold text-[16px] leading-[100%] tracking-[0%] text-[#060606] mb-4">
                Event manager
              </h4>
              <div className="grid md:grid-cols-2 gap-5">
                {assignedManagers.map((manager, idx) => {
                  const name = manager.fullName || manager.name || "Event Manager";
                  const title = manager.roleName || manager.role || "Event Manager";
                  const managerBlobUrl = managerBlobs[manager.id] || null;

                  return (
                    <div
                      key={manager.id || idx}
                      className="w-[512px] h-[132px] rounded-[8px] border-[0.5px] border-[#D6DFDE] bg-[#FFFFFF] shadow-[0px_0px_9.6px_0px_#80CAD640] px-[20px] py-[18px] flex items-center gap-[16px]"
                    >
                      <div className="relative w-[93px] h-[92px] flex-shrink-0">
                        <svg
                          className="absolute inset-0 h-full w-full pointer-events-none z-10"
                          viewBox="0 0 56 56"
                          fill="none"
                          aria-hidden="true"
                          style={{ transform: "rotate(222deg)" }}
                        >
                          <circle
                            cx="28"
                            cy="28"
                            r={avatarRadius}
                            stroke="#2CC7D3"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${avatarArcLength} ${avatarCircumference}`}
                          />
                        </svg>

                        <div className={`absolute inset-[5px] rounded-full overflow-hidden border-2 border-white flex items-center justify-center ${managerBlobUrl ? "bg-gray-200" : "bg-transparent"}`}>
                          {managerBlobUrl ? (
                            <img
                              src={managerBlobUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ProfileImage
                              userId={manager.id}
                              name={name}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-open-sans font-bold text-[18px] leading-[100%] tracking-[0%] text-[#252525]">
                          {name}
                        </h5>
                        <p className="font-open-sans font-normal text-[14px] leading-[100%] tracking-[0%] text-[#02949D] mt-[10px]">
                          {title}
                        </p>
                        {renderSpeakerContact(manager)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {request.status === "Rejected" && request.rejectionReason && (
            <div>
              <h4 className="text-red-500 font-semibold">
                Reason for rejection
              </h4>
              <p>{request.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-8 pt-4 pb-[32px] flex justify-end gap-[24px]">
          {/* For Facility Manager: Show Reject and Accept buttons on Pending requests */}
          {showRejectAccept && (
            <>
              <button
                onClick={() => {
                  if (!validateApprovalTime()) return;
                  onReject(request.id);
                }}
                // onClick={() => onReject(request.id)}
                disabled={loading}
                className="w-[155px] h-[42px] rounded-[4px] border border-[#395062] px-[10px] flex items-center justify-center gap-[12px] text-[14px] font-inter font-normal text-[#395062] hover:bg-gray-50 transition-colors"
              >
                Reject
              </button>

              <button
                onClick={() => {
                  if (!validateApprovalTime()) return;
                  onApprove(request.id);
                }}
                // onClick={() => onApprove(request.id)}
                disabled={loading}
                className="w-[155px] h-[42px] rounded-[4px] bg-[#395062] px-[10px] flex items-center justify-center gap-[12px] text-white hover:bg-[#2d3f4e] transition-colors text-[14px] font-inter font-normal"
              >
                Approve
              </button>
            </>
          )}

          {/* Show Continue button only for Event Manager on Approved requests */}
          {showContinueButton && (
            <button
              onClick={() => {
                console.log("Continue button clicked for request:", request.id);
                if (onContinue) {
                  onContinue(request.id);
                }
              }}
              disabled={loading}
              className="w-[155px] h-[42px] rounded-[4px] bg-[#395062] px-[10px] flex items-center justify-center gap-[12px] text-white hover:bg-[#2d3f4e] transition-colors text-[14px] font-inter font-normal"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRequestModal;
