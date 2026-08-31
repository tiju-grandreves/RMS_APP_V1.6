import React, { useEffect, useState } from "react";
import ProfileImage from "../components/common/ProfileImage";
import { fetchBlobUrl } from "../components/common/SecureImage";

const SPEAKER_PLACEHOLDER = "/icons/Speaker-image-placeholder.svg";

const EventManagerRequestModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onContinue,
  loading,
  userRole,
}) => {
  const [speakers, setSpeakers] = useState([]);
  const [speakersLoading, setSpeakersLoading] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managerBlobs, setManagerBlobs] = useState({});
  const avatarRadius = 33;
  const avatarCircumference = 2 * Math.PI * avatarRadius;
  const avatarArcLength = avatarCircumference / 2;

  useEffect(() => {
    const fetchSpeakers = async () => {
      if (!request?.eventId) return;

      // RMS backend has no speakers module yet — disabled until it exists.
      setSpeakers([]);
      setSpeakersLoading(false);
    };

    fetchSpeakers();
  }, [request?.eventId]);

  useEffect(() => {
    const fetchAssignedManagers = async () => {
      if (!request?.assignedManagerId) {
        setAssignedManagers([]);
        return;
      }

      // RMS backend has no sea_users module yet — fall back to the data
      // already present on the request instead of fetching manager details.
      setManagersLoading(true);

      if (request.assignedManagerId) {
        setAssignedManagers([
          {
            id: request.assignedManagerId,
            fullName: request.assignedManagerName || "Event Manager",
            name: request.assignedManagerName || "Event Manager",
            email: request.assignedManagerEmail,
            phone: request.assignedManagerPhone,
            roleName: "Event Manager",
          },
        ]);
      } else {
        setAssignedManagers([]);
      }

      setManagersLoading(false);
    };

    fetchAssignedManagers();
    // request.assignedManager* fields are only used as fallback values when building the
    // manager object; they don't need to retrigger the fetch, which is keyed by assignedManagerId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.id, request?.status, request?.eventId, request?.assignedManagerId]);

  useEffect(() => {
    const loadManagerImages = async () => {
      if (!isOpen || !assignedManagers.length) {
        setManagerBlobs({});
        return;
      }

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
      3: "VIP Event",
    };
    return eventTypes[eventTypeId] || "-";
  };

  const getEventCategoryName = (eventCategoryId) => {
    const eventCategories = {
      1: "Controlled",
      2: "Public",
      3: "Invited",
    };
    return eventCategories[eventCategoryId] || "-";
  };

  const getEventModeName = (eventModeId) => {
    const eventModes = {
      1: "Physical location",
      2: "Online",
      3: "Hybrid",
    };
    return eventModes[eventModeId] || "-";
  };

 const formatDate = (dateString) => {
  if (!dateString) return "--";

  // Handles:
  // 2026-05-22T00:00:00
  // 2026-05-22T01:30:00.000
  // 2026-05-22T01:30:00.000Z
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (!match) return "--";

  const year = match[1];
  const month = match[2];
  const day = match[3];

  const monthName = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleString("en-GB", {
    month: "short",
  });

  return `${day} ${monthName} ${year}`;
};

const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "--:-- --";

  // Handles:
  // 2026-05-22T17:01:00
  // 2026-05-22T17:01:00.000
  // 2026-05-22T17:01:00.000Z
  const match = String(dateTimeString).match(/T(\d{2}):(\d{2})/);

  if (!match) return "--:-- --";

  let hours = Number(match[1]);
  const minutes = match[2];

  if (Number.isNaN(hours)) return "--:-- --";

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
};


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

    let cleanedPhone = phone.toString().replace(/^(\+971|00971)/, "");
    cleanedPhone = cleanedPhone.replace(/\D/g, "");

    if (cleanedPhone.startsWith("0")) {
      cleanedPhone = cleanedPhone.substring(1);
    }

    return `+971 ${cleanedPhone}`;
  };

  const speakersList =
    speakers.length > 0
      ? speakers
      : (request.speakerRequests || request.speakers || []).filter(
        (speaker) => !speaker.isDelete && speaker.eventId && !speaker.sessionId && speaker.fromSession === false
      );
  const isFacilityManager = userRole === "Facility manager";
  const isEventManager = userRole === "Event Manager";
  const showRejectAccept = isFacilityManager && request.status === "Pending";
  const showContinueForFacility =
    isFacilityManager && request.status === "Approved";
  const showContinueForEvent =
    isEventManager && request.status === "Approved";
  const showContinueButton = showContinueForFacility || showContinueForEvent;

  const renderRequestorContact = () => {
    const email = request.requestorEmail;
    const phone = request.requestorPhone;

    if (!email && !phone) return null;

    if (email && phone) {
      return (
        <p className="text-sm text-gray-600">
          {email} <span style={{ color: "#CACACA" }}>•</span>{" "}
          {formatPhoneNumber(phone)}
        </p>
      );
    }

    if (email) {
      return <p className="text-sm text-gray-600">{email}</p>;
    }

    if (phone) {
      return <p className="text-sm text-gray-600">{formatPhoneNumber(phone)}</p>;
    }

    return null;
  };

  const renderSpeakerContact = (speaker) => {
    const email = speaker.email;
    const phone = speaker.phone;

    if (!email && !phone) return null;

    if (email && phone) {
      return (
        <p className="text-sm text-gray-600">
          {email} <span style={{ color: "#CACACA" }}>•</span>{" "}
          {formatPhoneNumber(phone)}
        </p>
      );
    }

    if (email) {
      return <p className="text-sm text-gray-600">{email}</p>;
    }

    if (phone) {
      return <p className="text-sm text-gray-600">{formatPhoneNumber(phone)}</p>;
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0 bg-white">
          <h2 className="text-24px font-semibold text-[#02949D]">
            Event request details
          </h2>

          <button onClick={onClose}>
            <img
              src="/icons/ic_close.svg"
              alt="Close"
              className="w-4 h-4 cursor-pointer"
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <ProfileImage
                  userId={request.requestorId}
                  name={request.requestorName}
                  alt={request.requestorName || "User"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="font-semibold">
                  {request.requestorName || "Javani Jones"}
                </p>
                {renderRequestorContact()}
              </div>
            </div>

            <h3 className="text-2xl font-bold">
              {request.eventName || "Sharjah summit"}
            </h3>
            {request.branding ?(
 <img
  src={request.branding || "/noimage.png"}
  alt="Event"
  className="rounded-lg object-cover w-[845px] h-[222px] [&>div:last-child]:pt-8 [&>div:last-child]:pb-8"
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
            {/* <SecureImage
              src={request.branding}
              alt="Event"
              className="rounded-lg object-cover w-[845px] h-[222px] [&>div:last-child]:pt-8 [&>div:last-child]:pb-8"
              fallback="/noimage.png"
              showLoader={false}
            /> */}

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-gray-700">
                {request.description || "Event description not available."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border rounded-lg p-4">
              <div>
                <p className="font-semibold text-sm">Start Date</p>
                <p>{getStartDate()}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">Start Time</p>
                <p>{getStartTime()}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">End Date</p>
                <p>{getEndDate()}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">End Time</p>
                <p>{getEndTime()}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">Category</p>
                <p>{getEventCategoryName(request.eventCategoryId)}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">Type</p>
                <p>{getEventTypeName(request.eventTypeId)}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">Attendees</p>
                <p>{request.attendees || request.attendeeCount || "- -"}</p>
              </div>

              <div>
                <p className="font-semibold text-sm">Event Mode</p>
                <p>{getEventModeName(request.eventModeId) || "-"}</p>
              </div>
            </div>

            {!speakersLoading && speakersList.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Speaker details</h4>

                {speakersLoading ? (
                  <p className="text-gray-500">Loading speakers...</p>
                ) : speakersList.length === 0 ? (
                  <p className="text-gray-500">No speakers available</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-5">
                    {speakersList.map((speaker, idx) => {
                      const name = speaker.name || "Speaker Name";
                      const title =
                        speaker.title || speaker.role || speaker.designation || "";
                      const organization =
                        speaker.organization || speaker.company || "";
                      const photoUrl = speaker.photoUrl || speaker.avatar;

                      return (
                        <div
                          key={speaker.id || idx}
                          className="border rounded-xl p-4 flex gap-3 items-center shadow-sm"
                          style={{
                            border: "0.5px solid #D6DFDE",
                            boxShadow: "0px 0px 9.6px 0px #80CAD640",
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="relative w-20 h-20">
                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                                viewBox="0 0 80 80"
                                fill="none"
                                aria-hidden="true"
                                style={{ transform: "rotate(222deg)" }}
                              >
                                <circle
                                  cx="40"
                                  cy="40"
                                  r={avatarRadius}
                                  stroke="#2CC7D3"
                                  strokeWidth="6"
                                  strokeLinecap="round"
                                  strokeDasharray={`${avatarArcLength} ${avatarCircumference}`}
                                />
                              </svg>
                              <div className="absolute inset-[7px] rounded-full overflow-hidden border-2 border-white bg-white">
                                <div
                                  className={`w-full h-full rounded-full overflow-hidden ${photoUrl ? "bg-gray-200" : "bg-transparent"
                                    }`}
                                >
                                  {photoUrl ? (
  <img
    src={photoUrl}
    alt={name}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.src = SPEAKER_PLACEHOLDER;
    }}
  />
) : (
  <img
    src={SPEAKER_PLACEHOLDER}
    alt={name}
    className="w-full h-full object-contain"
  />
)}
                                  {/* {photoUrl ? (
                                    <SecureImage
                                      src={photoUrl}
                                      alt={name}
                                      className="w-full h-full object-cover"
                                      showLoader={false}
                                    />
                                  ) : (
                                    <img
                                      src={SPEAKER_PLACEHOLDER}
                                      alt={name}
                                      className="w-full h-full object-contain"
                                    />
                                  )} */}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold">{name}</h5>
                            <p className="text-sm text-[#02949D] mt-0.5">
                              {title || "Guest Speaker"}
                              {title && organization && (
                                <>
                                  {" "}
                                  <span style={{ color: "#CACACA" }}>•</span>{" "}
                                  {organization}
                                </>
                              )}
                              {!title && organization && organization}
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
                <h4 className="font-semibold mb-4">Event manager</h4>
                <div className="grid md:grid-cols-2 gap-5">
                  {assignedManagers.map((manager, idx) => {
                    const name = manager.fullName || manager.name || "Event Manager";
                    const title = manager.roleName || manager.role || "Event Manager";
                    const managerBlobUrl = managerBlobs[manager.id] || null;

                    return (
                      <div
                        key={manager.id || idx}
                        className="border rounded-xl p-4 flex gap-3 items-center shadow-sm"
                        style={{
                          border: "0.5px solid #D6DFDE",
                          boxShadow: "0px 0px 9.6px 0px #80CAD640",
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="relative w-20 h-20">
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none z-10"
                              viewBox="0 0 80 80"
                              fill="none"
                              aria-hidden="true"
                              style={{ transform: "rotate(222deg)" }}
                            >
                              <circle
                                cx="40"
                                cy="40"
                                r={avatarRadius}
                                stroke="#2CC7D3"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${avatarArcLength} ${avatarCircumference}`}
                              />
                            </svg>
                            <div className="absolute inset-[7px] rounded-full overflow-hidden border-2 border-white bg-white">
                              <div
                                className={`w-full h-full rounded-full overflow-hidden ${managerBlobUrl ? "bg-gray-200" : "bg-transparent"
                                  }`}
                              >
                                 {managerBlobUrl ? 
                                  (
                                  <ProfileImage
                                    userId={manager.id}
                                    name={name}
                                    alt={name}
                                    className="w-full h-full object-cover"
                                  />
                                ):( <img
    src={SPEAKER_PLACEHOLDER}
    alt={name}
    className="w-full h-full object-contain"
  />
                                ) }
                             {/* {managerBlobUrl ? (
  <img
    src={managerBlobUrl}
    alt={name}
    className="w-full h-full object-cover"
    onError={(e) => {
      e.currentTarget.src = SPEAKER_PLACEHOLDER;
    }}
  />
) : (
  <img
    src={SPEAKER_PLACEHOLDER}
    alt={name}
    className="w-full h-full object-contain"
  />
)} */}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold">{name}</h5>
                          <p className="text-sm text-[#02949D] mt-0.5">
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
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3 shrink-0 bg-white">
          {showRejectAccept && (
            <>
              <button
                onClick={() => onReject(request.id)}
                disabled={loading}
                className="w-[164px] h-[42px] flex items-center justify-center border rounded-lg text-[14px] font-inter font-normal text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reject
              </button>

              <button
                onClick={() => onApprove(request.id)}
                disabled={loading}
                className="w-[164px] h-[42px] flex items-center justify-center bg-[#395062] text-white rounded-lg hover:bg-[#2d3f4e] transition-colors text-[14px] font-inter font-normal"
              >
                Accept
              </button>
            </>
          )}

          {showContinueButton && (
            <button
              onClick={() => {
                console.log("Continue button clicked for request:", request.id);
                if (onContinue) {
                  onContinue(request.id);
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-[#395062] text-white rounded-lg hover:bg-[#2d3f4e] transition-colors font-medium"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventManagerRequestModal;
