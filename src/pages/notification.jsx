import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./notification.css";
import httpService from "../services/httpService";
import ProfileImage from "../components/common/ProfileImage";

const dataCache = new Map();
const pendingFetches = new Map();

const getCachedData = (key) => {
  const entry = dataCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.ttl) {
    return entry.data;
  }
  return null;
};

const setCachedData = (key, data, ttl = 5000) => {
  dataCache.set(key, { data, timestamp: Date.now(), ttl });
};

const invalidateCache = (key) => {
  dataCache.delete(key);
};

const getCacheKey = (roleId, managerId) => {
  return roleId === 2 ? `notifications_${roleId}_${managerId}` : "eventRequests_all_role1";
};

export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const userString = localStorage.getItem("userData");
  const currentUser = userString ? JSON.parse(userString) : null;
  const assignedManagerId = currentUser?.id;
  const roleId = Number(currentUser?.role);
  const isMounted = useRef(true);
  const initialFetchDone = useRef(false);
  const abortControllerRef = useRef(null);

  const getReadNotificationIds = useCallback(() => {
    const stored = localStorage.getItem("readEventRequestIds");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  }, []);
  const saveReadNotificationIds = (idsSet) => {
    localStorage.setItem("readEventRequestIds", JSON.stringify([...idsSet]));
  };
  const markNotificationAsRead = (id) => {
    if (roleId !== 1) return;
    const readSet = getReadNotificationIds();
    if (!readSet.has(id)) {
      readSet.add(id);
      saveReadNotificationIds(readSet);
    }
  };

  const getReadNotificationIdsForRole2 = useCallback(() => {
    const key = `readNotificationIds_role2_${assignedManagerId}`;
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  }, [assignedManagerId]);
  const saveReadNotificationIdsForRole2 = (idsSet) => {
    const key = `readNotificationIds_role2_${assignedManagerId}`;
    localStorage.setItem(key, JSON.stringify([...idsSet]));
  };
  const markNotificationAsReadForRole2 = async (id) => {
    if (roleId !== 2) return;
    try {
      await httpService.patch(`/event-notifications/read/${id}`);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
    const readSet = getReadNotificationIdsForRole2();
    if (!readSet.has(id)) {
      readSet.add(id);
      saveReadNotificationIdsForRole2(readSet);
    }
    const cacheKey = getCacheKey(roleId, assignedManagerId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      const updatedCache = cachedData.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
      setCachedData(cacheKey, updatedCache, 10000);
    }
  };
  const markAllAsReadForRole2 = async () => {
    if (roleId !== 2) return;
    try {
      await httpService.patch(`/event-notifications/read-all/${assignedManagerId}`);
      const readSet = getReadNotificationIdsForRole2();
      notifications.forEach((n) => {
        if (!readSet.has(n.id)) readSet.add(n.id);
      });
      saveReadNotificationIdsForRole2(readSet);
      const cacheKey = getCacheKey(roleId, assignedManagerId);
      invalidateCache(cacheKey);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Mark all read error:", error);
    }
  };

  const markAllAsReadForRole1 = () => {
    if (roleId !== 1) return;
    const readSet = getReadNotificationIds();
    notifications.forEach((n) => {
      if (!readSet.has(n.id)) readSet.add(n.id);
    });
    saveReadNotificationIds(readSet);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const cacheKey = getCacheKey(roleId, assignedManagerId);
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      const updatedCache = cachedData.map((n) => ({ ...n, isRead: true }));
      setCachedData(cacheKey, updatedCache, 10000);
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hrs ago`;
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  // FIXED: properly parse the date string as a local time (no arbitrary offset)
  const formatEventRequestTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString); // parse as given; assume backend sends correct ISO or local string
    if (isNaN(date.getTime())) return "Just now";
    return formatRelativeTime(date);
  };

  // FIXED: removed the 5.5-hour subtraction; just parse the date normally
  const formatNotificationTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Just now";
    return formatRelativeTime(date);
  };

  const processRawData = useCallback((rawData, role, managerId) => {
    if (role === 2) {
      let data = [];
      if (!Array.isArray(rawData)) data = [];
      else data = rawData;
      const readSet = getReadNotificationIdsForRole2();
      return data.map((n) => {
        const id = n.id || n._id || n.notificationId;
        return {
          ...n,
          id: id,
          source: 'notification',
          userId: n.approvedBy || n.requestorId || n.employeeId || n.personId || n.assignedManagerId || n.userId,
          title: n.approvedByName || n.requestorName || n.title || "Someone",
          message: "has assigned you a new event. Please review and complete the setup",
          eventId: n.eventId || n.event_id || null,
          requestId: n.requestId || n.request_id || null,
          createdDate: n.createdDate || n.createdAt || n.created_at,
          isRead: readSet.has(id),
        };
      }).filter(item => item.id);
    } else if (role === 1) {
      if (!Array.isArray(rawData)) return [];
      const filteredData = rawData.filter((request) => request.isDraft === false);
      return filteredData.sort((a,b) => new Date(b.createdDate || b.createdAt) - new Date(a.createdDate || a.createdAt))
        .map((request) => ({
          id: `event-${request.id}`,
          source: 'event-request',
          title: request.requestorName || "Someone",
          message: "has created a new event. Please review and complete the setup",
          createdDate: request.createdDate || request.createdAt,
          isRead: getReadNotificationIds().has(`event-${request.id}`),
          userId: request.requestorId || request.employeeId || request.personId || request.assignedManagerId || request.userId,
          eventId: request.eventId || null,
          requestId: request.id,
        }));
    }
    return [];
  }, [assignedManagerId]);

  const fetchRawData = useCallback(async (signal) => {
    if (roleId === 2) {
      const url = `/event-notifications/${assignedManagerId}/${roleId}`;
      console.log("Fetching role 2 notifications from:", url);
      const response = await httpService.get(url, { signal });
      console.log("Raw API response:", response);

      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        rawData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        rawData = response.data.data;
      } else if (response?.data?.notifications && Array.isArray(response.data.notifications)) {
        rawData = response.data.notifications;
      } else if (response?.data?.items && Array.isArray(response.data.items)) {
        rawData = response.data.items;
      } else if (response?.notifications && Array.isArray(response.notifications)) {
        rawData = response.notifications;
      } else {
        console.error("Unexpected response structure for role 2:", response);
      }
      return rawData;
    } else if (roleId === 1) {
      // RMS backend has no event-requests module yet — disabled until it exists.
      return [];
    }
    return [];
  }, [assignedManagerId, roleId]);

  const fetchNotifications = useCallback(async () => {
    if (!assignedManagerId) return;

    // Cancel any previous ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    const cacheKey = getCacheKey(roleId, assignedManagerId);
    
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      if (isMounted.current) {
        setNotifications(cachedData);
        setLoading(false);
      }
      return;
    }

    if (pendingFetches.has(cacheKey)) {
      try {
        await pendingFetches.get(cacheKey);
        const freshCache = getCachedData(cacheKey);
        if (freshCache && isMounted.current && !signal.aborted) {
          setNotifications(freshCache);
          setLoading(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err);
      }
      return;
    }

    setLoading(true);
    const fetchPromise = (async () => {
      try {
        const rawData = await fetchRawData(signal);
        if (signal.aborted) return;
        const processed = processRawData(rawData, roleId, assignedManagerId);
        if (signal.aborted) return;
        setCachedData(cacheKey, processed, 10000);
        if (isMounted.current && !signal.aborted) {
          setNotifications(processed);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Notification API error:", error);
          if (isMounted.current && !signal.aborted) {
            setNotifications([]);
          }
        }
      } finally {
        if (isMounted.current && !signal.aborted) {
          setLoading(false);
        }
      }
    })();

    pendingFetches.set(cacheKey, fetchPromise);
    try {
      await fetchPromise;
    } finally {
      pendingFetches.delete(cacheKey);
    }
  }, [assignedManagerId, roleId, fetchRawData, processRawData]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchNotifications();
    }
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    if (roleId === 2) {
      await markAllAsReadForRole2();
    } else if (roleId === 1) {
      markAllAsReadForRole1();
    }
  };

  const markSingleAsRead = async (id) => {
    if (roleId === 1) {
      markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      const cacheKey = getCacheKey(roleId, assignedManagerId);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        const updatedCache = cachedData.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        );
        setCachedData(cacheKey, updatedCache, 10000);
      }
    } else if (roleId === 2) {
      await markNotificationAsReadForRole2(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }
  };

  const handleTabChange = (value) => {
    setTab(value);
    if (value === "all") {
      markAllAsRead();
    }
  };

  // CRITICAL FIX: Absolutely no API calls on close
  const handleClose = () => {
    // Abort any ongoing fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Simply call the parent's onClose – no markAllAsRead, no cache invalidation
    onClose();
  };

  const filtered = tab === "unread" ? notifications.filter((n) => n.isRead !== true) : notifications;

  const handleNotificationClick = async (item) => {
    await markSingleAsRead(item.id);
    handleClose();

    let requestId = item.requestId;
    if (!requestId && item.eventId) {
      try {
        const res = await httpService.get("/event-requests?limit=1000");
        if (res.success && res.data) {
          const found = res.data.find(req => req.eventId === item.eventId);
          requestId = found?.id;
        }
      } catch (err) { console.error("Failed to find requestId", err); }
    }
    if (!requestId) return;

    try {
      const response = await httpService.get(`/event-requests/${requestId}`);
      if (response.success && response.data) {
        navigate("/requests", { state: { openRequestId: requestId, requestData: response.data } });
      } else {
        navigate("/requests", { state: { openRequestId: requestId } });
      }
    } catch (err) {
      console.error("Failed to fetch request details", err);
      navigate("/requests", { state: { openRequestId: requestId } });
    }
  };

  return (
    <>
      <div className="overlay" onClick={handleClose}></div>
      <div className="panel" style={{ width: "50vw", maxWidth: "50vw", height: "100vh", top: 0, right: 0, borderRadius: 0 }}>
        <div className="panel-header">
          <h2>Notifications</h2>
          <button onClick={handleClose} className="close-btn">✕</button>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === "all" ? "active" : ""}`} onClick={() => handleTabChange("all")}>All ({notifications.length})</button>
          <button className={`tab ${tab === "unread" ? "active" : ""}`} onClick={() => handleTabChange("unread")}>Unread ({notifications.filter(n => n.isRead !== true).length})</button>
        </div>
        <div className="notification-list" style={{ height: "calc(100vh - 120px)", overflowY: "auto" }}>
          {loading ? <p style={{ padding: "10px" }}>Loading...</p> : filtered.length === 0 ? <p style={{ padding: "10px" }}>No notifications</p> : filtered.map((item) => (
            <div key={item.id} className={`notification-item ${item.isRead !== true ? "unread" : ""}`} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px", cursor: "pointer" }} onClick={() => handleNotificationClick(item)}>
              <div className="w-[36px] h-[36px] rounded-full bg-[#E3E3E3] flex items-center justify-center overflow-hidden" style={{ minWidth: "36px", minHeight: "36px" }}>
                <ProfileImage userId={item.userId} name={item.title} alt={item.title} className="w-full h-full rounded-full object-cover" fallbackClassName="w-[24px] h-[24px] object-contain" />
              </div>
              <div className="text">
                <p><strong>{item.title}</strong> {item.message}</p>
                <span>
                  {item.source === 'notification' 
                    ? formatNotificationTime(item.createdDate)
                    : formatEventRequestTime(item.createdDate)
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}