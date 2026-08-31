import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../../pages/notification';
import httpService from '../../services/httpService';
import Breadcrumb from '../common/Breadcrumbs';

const apiCache = new Map();
const CACHE_TTL = 30000;

const getCached = (key) => {
  const entry = apiCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data;
  return null;
};

const setCache = (key, data) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = (keyPrefix) => {
  for (const key of apiCache.keys()) {
    if (key.startsWith(keyPrefix)) apiCache.delete(key);
  }
};

const ROLE_LABELS = {
  1: 'Admin',
  2: 'Manager',
  3: 'Receptionist',
  4: 'Accountant',
};

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="#395062"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="#395062"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Maps roleId → breadcrumb role key used in Breadcrumb component
const BREADCRUMB_ROLE_MAP = {
  1: 'admin',
  2: 'reception',
  3: 'service',
  4: 'account manager',
};

const Header = ({ title = '', showBack = false, breadcrumbs, onMobileMenuOpen }) => {
  const navigate = useNavigate();

  const [openNotification, setOpenNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const currentUser = JSON.parse(localStorage.getItem('userData'));
  const assignedManagerId = currentUser?.id;
  const roleId = Number(currentUser?.roleId || currentUser?.role);

  const markNotificationsAsRead = useCallback(async () => {
    if (!assignedManagerId) return;
    try {
      if (roleId === 2) {
        await httpService.patch(`/event-notifications/read-all/${assignedManagerId}`, { roleId });
        invalidateCache(`/event-notifications/${assignedManagerId}/2`);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [assignedManagerId, roleId]);

  const fetchNotificationCount = useCallback(async () => {
    if (!assignedManagerId) return;
    try {
      let data = [];
      if (roleId === 2) {
        const cacheKey = `/event-notifications/${assignedManagerId}/${roleId}`;
        let cached = getCached(cacheKey);
        if (!cached) {
          const response = await httpService.get(cacheKey);
          cached = response?.data?.data || response?.data || response || [];
          if (Array.isArray(cached)) setCache(cacheKey, cached);
        }
        data = Array.isArray(cached) ? cached.filter(n => n.isRead !== true) : [];
      }
      const unreadCount = Array.isArray(data) ? data.filter(n => !n.isRead).length : 0;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.error('Notification Count Error:', error);
      setNotificationCount(0);
    }
  }, [assignedManagerId, roleId]);

  useEffect(() => {
    fetchNotificationCount();
  }, [fetchNotificationCount]);

  const handleOpenNotification = () => {
    setOpenNotification(true);
    setNotificationCount(0);
    markNotificationsAsRead();
  };

  return (
    <>
    <div className="min-h-[56px] bg-white border-b border-border flex items-center justify-between pl-3 pr-4 py-2">
        {/* Left — mobile menu, back button, title + breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuOpen}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
            aria-label="Open navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="#395062" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-[#395062]" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div className="flex flex-col gap-1">
            <h1
              className="text-accent font-semibold"
              style={{ fontFamily: 'DM Sans', fontSize: '20px', lineHeight: '28px' }}
            >
              {title}
            </h1>
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="hidden sm:block">
                <Breadcrumb
                  items={breadcrumbs}
                  role={BREADCRUMB_ROLE_MAP[roleId] || 'admin'}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right — role badge + name + bell */}
        <div className="flex items-center gap-3">

          {/* Role badge */}
         

          {/* User name
          <span
            className="text-sm font-semibold"
            style={{ color: '#1a2e38' }}
          >
            {userName}
          </span> */}

          {/* Notification bell */}
          <button
            onClick={handleOpenNotification}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100"
          >
            <BellIcon />
            {notificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#e53e3e',
                  color: 'white',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: '18px',
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>
           {/* <span
            className="text-xs font-semibold px-3 py-1 rounded-full border"
            style={{
              color: '#3ab8c8',
              borderColor: '#3ab8c8',
              background: 'rgba(58,184,200,0.07)',
              letterSpacing: '0.3px',
            }}
          >
            {roleLabel}
          </span> */}
        </div>
      </div>

      {openNotification && (
        <NotificationPanel
          onClose={() => {
            setOpenNotification(false);
            fetchNotificationCount();
          }}
        />
      )}
    </>
  );
};

export default Header;