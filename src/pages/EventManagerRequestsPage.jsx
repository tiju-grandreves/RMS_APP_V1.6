import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import FilterTabs from '../components/common/FilterTabs';
import httpService from '../services/httpService';
import ConfirmModal from '../components/common/ConfirmModal';
import toast, { Toaster } from "react-hot-toast";
import { showEventToast } from "../components/common/toastHelper";
import AddEventManager from './AddEventManager';
import useEventRequestCount from '../services/requestCount';
import { useNavigate, useParams } from 'react-router-dom';
import EventManagerRequestModal from './EventManagerRequestModal';
import RequestCardSkeleton from '../components/common/RequestCardSkeleton';
import ProfileImage from '../components/common/ProfileImage';
import CustomToast from '../components/common/CustomToast';
import ScrollableTitle from '../components/common/ScrollableTitle';
import { isMockSession, MOCK_EVENT_MANAGER_REQUESTS } from '../services/mockData';

const getManagerLabel = (manager) =>
  manager?.fullName ||
  manager?.name ||
  manager?.email ||
  manager?.phone ||
  `User ${manager?.id ?? ''}`;

const sortManagersByLabel = (managerList) =>
  [...managerList].sort((a, b) =>
    getManagerLabel(a).localeCompare(getManagerLabel(b), undefined, {
      sensitivity: 'base',
    })
  );

const getSingleResponseItem = (response) => {
  const candidates = [
    response?.data?.data,
    response?.data,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate[0] || null;
    }
    if (candidate && typeof candidate === 'object') {
      return candidate;
    }
  }

  return null;
};

const getResponseItems = (response) => {
  const candidates = [
    response?.data?.data,
    response?.data?.items,
    response?.data,
    response,
  ];

  return candidates.find(Array.isArray) || [];
};

const parseApiDateTime = (dateValue, timeValue) => {
  const directTime = timeValue ? new Date(timeValue) : null;
  if (
    directTime &&
    !Number.isNaN(directTime.getTime()) &&
    String(timeValue).includes('T')
  ) {
    return directTime;
  }

  const dateMatch = String(dateValue || timeValue || '').match(
    /^(\d{4}-\d{2}-\d{2})/
  );
  const timeMatch = String(timeValue || '').match(
    /(?:T|\s|^)(\d{1,2}):(\d{2})/
  );

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const dateTime = new Date(
    `${dateMatch[1]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00`
  );
  return Number.isNaN(dateTime.getTime()) ? null : dateTime;
};

const extractMeetingUrls = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.data?.data,
    response?.result,
    response?.result?.data,
  ];

  for (const candidate of candidates) {
    const startLink = candidate?.startUrl || candidate?.start_url || '';
    const joinLink = candidate?.joinUrl || candidate?.join_url || '';
    if (startLink || joinLink) {
      return { startLink, joinLink };
    }
  }

  return { startLink: '', joinLink: '' };
};

const EventManagerRequestsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRequestId, setRejectRequestId] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userRoleId = userData.user?.role || 1;
  const currentUserId = userData.user?.profileId || userData.user?.id;
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Refs to prevent duplicate API calls
  const isFetching = useRef(false);
  const isPublishing = useRef(false);
  const abortController = useRef(null);

  const getRoleName = (roleId) => {
    const roleMap = {
      1: 'Facility manager',
      2: 'Event Manager',
      3: 'Admin',
      4: 'Super Admin'
    };
    return roleMap[roleId] || 'User';
  };

  const userRole = getRoleName(userRoleId);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedApproveRequestId, setSelectedApproveRequestId] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addManagerModal, setAddManagerModal] = useState(false);
  const [publishingRequestId, setPublishingRequestId] = useState(null);

  const eventManagerFilters = [
    { id: 'All', label: 'All' },
    { id: 'Assigned', label: 'Assigned' },
    { id: 'Created', label: 'Created' },
    { id: 'Drafts', label: 'Drafts' },
  ];

  const filters = eventManagerFilters;
  const { refetch: refetchPendingCount } = useEventRequestCount({
    enabled: false,
  });
  const { tab } = useParams();

  const mapTabToFilter = (tabName) => {
    if (!tabName) return 'All';

    switch (tabName.toLowerCase()) {
      case 'all':
        return 'All';
      case 'assigned':
        return 'Assigned';
      case 'created':
        return 'Created';
      case 'drafts':
        return 'Drafts';
      default:
        return 'All';
    }
  };

  const [activeFilter, setActiveFilter] = useState(() => mapTabToFilter(tab));

  const getEventStatusId = useCallback(() => {
    switch (activeFilter) {
      case 'Assigned':
        return 1;
      case 'Created':
        return 3;
      case 'Drafts':
        return 2;
      default:
        return undefined;
    }
  }, [activeFilter]);

  const sortByNewestCreatedDate = (items = []) =>
    [...items].sort((a, b) => {
      const aTime = a?.createdDate ? new Date(a.createdDate).getTime() : 0;
      const bTime = b?.createdDate ? new Date(b.createdDate).getTime() : 0;
      return bTime - aTime;
    });

  const fetchRequests = useCallback(async (pageNo = 1, reset = false) => {
    // RMS backend has no events module yet — disabled until it exists.
    setRequests(isMockSession() ? MOCK_EVENT_MANAGER_REQUESTS : []);
    setPage(1);
    setHasMore(false);
    setFetchLoading(false);
    setLoadMoreLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Reset and fetch when filter or search changes
    const delayDebounceFn = setTimeout(() => {
      // Cancel any ongoing request before starting a new one
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      setRequests([]);
      setPage(1);
      setHasMore(false);
      fetchRequests(1, true);
    }, searchTerm.trim() ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [activeFilter, searchTerm, fetchRequests]);

  const fetchManagers = useCallback(async () => {
    // RMS backend has no sea_users module yet — disabled until it exists.
    setManagers([]);
  }, []);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleApproveClick = (requestId) => {
    setSelectedApproveRequestId(requestId);
    setApproveModalOpen(true);
    setSelectedManager('');
  };

  const confirmApprove = async () => {
    if (!selectedManager) {
      showEventToast('error', 'Missing manager', 'Please select an Event Manager before confirming.');
      return;
    }

    // RMS backend has no events module yet — disabled until it exists.
    showEventToast("error", "Not available", "Assigning event managers is not available yet.");
  };

  const handleReject = (requestId) => {
    setRejectRequestId(requestId);
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectRequestId) {
      console.log("Reject ID missing");
      return;
    }

    // RMS backend has no events module yet — disabled until it exists.
    showEventToast("error", "Not available", "Rejecting event requests is not available yet.");
    setRejectModalOpen(false);
    setRejectReason("");
    setRejectRequestId(null);
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const formatDate = (date) => {
    if (!date) return "Date not set";

    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const parseTimeTo24Hour = (timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return null;

    const trimmedTime = timeValue.trim();
    const amPmMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
    if (amPmMatch) {
      let hours = parseInt(amPmMatch[1], 10);
      const minutes = parseInt(amPmMatch[2], 10);
      const period = amPmMatch[3].toUpperCase();

      if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      return { hours, minutes };
    }

    const militaryMatch = trimmedTime.match(/^(\d{1,2}):(\d{2})$/);
    if (militaryMatch) {
      const hours = parseInt(militaryMatch[1], 10);
      const minutes = parseInt(militaryMatch[2], 10);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

      return { hours, minutes };
    }

    return null;
  };

  const buildEventDateTime = (dateValue, timeValue, fallbackDateTimeValue) => {
    if (fallbackDateTimeValue) {
      const fallbackDate = new Date(fallbackDateTimeValue);
      if (!Number.isNaN(fallbackDate.getTime())) {
        return fallbackDate;
      }
    }

    if (!dateValue) return null;

    const baseDate = new Date(dateValue);
    if (Number.isNaN(baseDate.getTime())) return null;

    const parsedTime = parseTimeTo24Hour(timeValue);
    if (!parsedTime) {
      baseDate.setHours(23, 59, 59, 999);
      return baseDate;
    }

    baseDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    return baseDate;
  };

  const isEventExpired = (event) => {
    const eventEndDateTime = buildEventDateTime(
      event?.endDate,
      event?.endTime,
      event?.endTime || event?.endDate
    );

    if (!eventEndDateTime) {
      return false;
    }

    return new Date() > eventEndDateTime;
  };

  const getEventEndDateTimeText = (event) => {
    const eventEndDateTime = buildEventDateTime(
      event?.endDate,
      event?.endTime,
      event?.endTime || event?.endDate
    );

    if (!eventEndDateTime) {
      return 'the scheduled end date and time';
    }

    const formattedDate = eventEndDateTime.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = eventEndDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${formattedDate} at ${formattedTime}`;
  };

  const handleManagerAdded = async () => {
    await fetchManagers();
    setAddManagerModal(false);
  };

  const generateMeetingLinks = async ({
    name,
    description,
    startDate,
    startTime,
    endDate,
    endTime,
  }) => {
    const startDateTime = parseApiDateTime(startDate, startTime);
    const endDateTime = parseApiDateTime(endDate, endTime);

    if (!startDateTime || !endDateTime) {
      throw new Error(`Invalid date/time for ${name || 'meeting'}.`);
    }

    const duration = Math.max(
      1,
      Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000)
    );
    const response = await httpService.post('/events/create-meeting', {
      name: name?.trim() || 'Untitled Event',
      startDate: startDateTime.toISOString(),
      duration,
      description: description?.trim() || '',
    });
    const meetingLinks = extractMeetingUrls(response);

    if (!meetingLinks.startLink && !meetingLinks.joinLink) {
      throw new Error(
        `Meeting links were not returned for ${name || 'meeting'}.`
      );
    }

    return meetingLinks;
  };

  const getSpeakerIds = (session) => {
    const speakers = Array.isArray(session?.speakerIds)
      ? session.speakerIds
      : session?.speakers;

    if (!Array.isArray(speakers)) {
      return [];
    }

    return speakers
      .map((speaker) => Number(speaker?.id ?? speaker))
      .filter((speakerId) => !Number.isNaN(speakerId));
  };

  const handlePublish = async (e) => {
    e.stopPropagation();
    // RMS backend has no events module yet — disabled until it exists.
    showEventToast("error", "Not available", "Publishing events is not available yet.");
  };

  return (
    <Layout pageTitle="Requests" onSearch={setSearchTerm}>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="p-6 pt-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <FilterTabs
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              if (filter === activeFilter) return;
              setActiveFilter(filter);
            }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {fetchLoading && requests.length === 0 ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/40">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#02949D] rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-32 text-red-500">Error: {error}</div>
          ) : !requests || requests.length === 0 ? (
            <div className="text-center py-32 text-black-400 flex flex-col items-center justify-center">
              <img
                src="/icons/noeventfound.svg"
                alt="noeventfound"
                className="mb-4"
              />
              No Event Found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => {
                const isVirtual = request?.eventModeId === 2 || request?.eventMode === 'virtual' || String(request?.eventModeName || '').toLowerCase().includes('virtual') || String(request?.eventModeName || '').toLowerCase().includes('online');
                const hasVenue = request?.venue && request?.venue.trim() !== '' && request?.venue !== 'Venue not specified';
                const showLocation = !(isVirtual && !hasVenue);

                return (
                  <div
                    key={request.id}
                    onClick={() => {
                      if (activeFilter === 'Created') {
                        navigate(`/edit-event/${request.id}`);
                      } else {
                        openModal(request);
                      }
                    }}
                    className="bg-white rounded-lg border hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
                    style={{
                      border: '0.5px solid #D6DFDE',
                      boxShadow: '0px 0px 9.6px 0px #80CAD640',
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-[36px] h-[36px] rounded-full bg-[#E3E3E3] flex items-center justify-center">
                        <ProfileImage
                          imageUrl={request.requestorAvatar}
                          userId={request.requestorId}
                          name={request.requestorName}
                          alt={request.requestorName || 'User'}
                          className="w-full h-full rounded-full object-cover"
                          fallbackClassName="w-[24px] h-[24px] object-contain"
                        />
                      </div>
                      <span className="text-[#1B1D21] text-[14px] font-open-sans font-bold leading-[20px]">
                        {request.requestorName || 'Unknown User'}
                      </span>
                    </div>

                    {/* Event Banner */}
                    <div className="px-3">
                      <div className="relative h-[180px] bg-gray-100 rounded-xl">
                        {request.branding ? (
                          <img
                            src={request.branding}
                            alt={request.eventName}
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              e.currentTarget.src = "/noimage.png";
                            }}
                          />
                        ) : (
                          <img
                            src="/noimage.png"
                            alt="No event banner"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        )}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-3">
                      <ScrollableTitle 
                        title={request.eventName}
                        className="text-[24px] font-dm-sans font-semibold leading-[31px] text-[#060606] mb-2 line-clamp-1"
                      />
                      <p className="text-[14px] font-open-sans font-normal leading-[19px] text-[#1b1d21] mb-3 line-clamp-2">
                        {request.description || 'No description available'}
                      </p>

                      <div className="space-y-2">
                        {showLocation && (
                          <div className="flex items-center gap-2 text-[14px] text-[#1b1d21]">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                              <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M12.6667 6.66667C12.6667 11.3333 8 14 8 14C8 14 3.33334 11.3333 3.33334 6.66667C3.33334 3.72115 5.72115 1.33334 8 1.33334C10.2789 1.33334 12.6667 3.72115 12.6667 6.66667Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            <span className="font-open-sans font-normal leading-[19px] line-clamp-1 text-[#3C3C3C]">
                              {request.venue || 'Venue not specified'}
                            </span>
                          </div>
                        )}
                        <div className="text-[14px] font-open-sans font-normal leading-[19px] text-[#3C3C3C]">
                          {formatDate(request.startDate)}
                        </div>
                        {activeFilter === 'Created' && (
                          <button
                            onClick={(e) => handlePublish(e, request)}
                            disabled={publishingRequestId === request.id}
                            className={`mt-3 w-full py-2 rounded text-white text-[14px] font-inter font-medium transition-colors flex items-center justify-center gap-2 ${
                              publishingRequestId === request.id
                                ? 'bg-[#7A8A95] cursor-not-allowed'
                                : 'bg-primary hover:bg-primary-600'
                            }`}
                          >
                            {publishingRequestId === request.id && (
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            )}
                            {publishingRequestId === request.id ? 'Publishing...' : 'Publish now'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loadMoreLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <RequestCardSkeleton
                    key={`skeleton-${index}`}
                  />
                ))}
            </div>
          )}
        </div>
        {!fetchLoading &&
          !loadMoreLoading &&
          requests.length > 0 &&
          hasMore && (
            <div className="flex justify-center mt-8 w-full">
              <button
                onClick={() => fetchRequests(page + 1)}
                className="px-6 py-2 bg-[#02949D] text-white rounded-md hover:bg-[#027d85]"
              >
                Load More
              </button>
            </div>
          )}
      </div>

      <EventManagerRequestModal
        request={selectedRequest}
        isOpen={modalOpen}
        onClose={closeModal}
        onApprove={handleApproveClick}
        onReject={handleReject}
        onContinue={(requestId) => {
          console.log("Continue clicked for request:", requestId);
          closeModal();
          navigate(`/edit-event/${requestId}`);
        }}
        loading={loading}
        userRole={userRole}
      />

      <ConfirmModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Accept and Assign Event Manager?"
        description={"To finalize the acceptance of this event, please select an Event Manager below.\nBoth the requester and the assigned manager will be notified immediately upon confirmation."}
        showDropdown={true}
        showAddManager={true}
        onAddManagerClick={() => setAddManagerModal(true)}
        dropdownValue={selectedManager}
        onDropdownChange={setSelectedManager}
        dropdownOptions={managers.map(manager => getManagerLabel(manager))}
        confirmText="Accept"
        cancelText="Cancel"
        onConfirm={confirmApprove}
        loading={loading}
        confirmDisabled={!selectedManager}
      />

      <ConfirmModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Do you want to reject this event ?"
        description="Are you sure you want to reject this event request? Once rejected, the requester will be notified"
        showTextarea={true}
        textareaValue={rejectReason}
        onTextareaChange={setRejectReason}
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={confirmReject}
        loading={loading}
      />

      <AddEventManager
        isOpen={addManagerModal}
        onClose={() => setAddManagerModal(false)}
        onSuccess={handleManagerAdded}
      />
    </Layout>
  );
};

export default EventManagerRequestsPage;