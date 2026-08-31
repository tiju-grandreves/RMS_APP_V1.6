import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, RequestsIcon, UsersIcon, ReportsIcon, SettingsIcon } from '../common/Icons';
import ProfileImage from '../common/ProfileImage';
import { useEventCount } from '../../services/EventCountContext';
import { getShopLoginPath } from '../../services/authRedirect';


const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingCount } = useEventCount();
  const userString = localStorage.getItem('userData');
  const user = userString ? JSON.parse(userString) : null;
  const userRole = Number(user?.roleId ?? user?.role);
  const userRoleName = user?.roleName || '';
  const SPEAKER_PLACEHOLDER = "/icons/Speaker-image-placeholder.svg";

  const userId = user?.employeeId || user?.personId || user?.id;
  const userName = user?.name || 'User';
  const roleLabel = user?.roleName || 'User';

  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const userMenuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRequestsPath = () => {
    if (userRole === 1) return '/RequestListing';
    return '/RequestListing';
  };

  const getHomePath = () => {
    if (userRoleName === 'Service Officer') return '/ServiceOfficerHome';
    if (userRoleName === 'Account Manager') return '/AccountantHome';
    if (userRoleName === 'Receptionist') return '/ReceptionistHome';
    return '/AdminDashboard';
  };

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      badge: null,
      path: getHomePath(),
      activePaths: ['/AdminDashboard', '/ReceptionistHome', '/ServiceOfficerHome', '/AccountantHome'],
      roles: ['Admin', 'Service Officer', 'Receptionist', 'Account Manager'],
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: RequestsIcon,
      badge: pendingCount,
      activePaths: ['/RequestListing'],
      roles: ['Admin', 'Receptionist', 'Service Officer'],
    },
    {
      id: 'Users',
      label: 'Users',
      icon: UsersIcon,
      badge: null,
      path: '/users',
      activePaths: ['/users'],
      roles: ['Admin'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: ReportsIcon,
      badge: null,
      path: '/AdminReports',
      activePaths: ['/AdminReports'],
      roles: ['Admin'],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      badge: null,
      path: '/WorkflowConfig',
      activePaths: ['/WorkflowConfig'],
      roles: ['Admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRoleName));

const getActiveItem = () => {
  const currentPath = location.pathname;

  // Profile page isn't part of the main menu — nothing should highlight
  if (currentPath === '/ProfileView' || currentPath.startsWith('/ProfileView/')) {
    return null;
  }

  const activeMenuItem = menuItems.find(item =>
    item.activePaths.some(activePath => {
      if (activePath === currentPath) return true;
      if (currentPath.startsWith(`${activePath}/`)) return true;
      if (item.id === 'settings' && currentPath.startsWith('/settings')) return true;
      if (
        item.id === 'requests' &&
        (
          currentPath === '/requests' ||
          currentPath === '/RequestListing'
        )
      ) return true;
      return false;
    })
  );
  return activeMenuItem?.id || 'home';
};

  const activeItem = getActiveItem();

  const handleNavigation = (item) => {
    if (item.id === 'requests') {
      navigate(getRequestsPath());
    } else if (item.id === 'home') {
      navigate(getHomePath());
    } else {
      navigate(item.path);
    }
    onClose();
  };

  const handleLogout = () => {
    const loginPath = getShopLoginPath();
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    navigate(loginPath);
  };

  const handleViewProfile = () => {
    setShowUserMenu(false);
    navigate('/ProfileView');
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-border flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-[260px] md:w-[102px]`}
      >
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <img
              src="/icons/sea_sidebar_logo.svg"
              alt="RMS Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="text-sm font-semibold text-[#395062]">Menu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
            aria-label="Close navigation menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="#395062" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="pt-4 pb-10 flex justify-center md:px-0 px-4">
          <button
            type="button"
            onClick={() => {
              const homePath = getHomePath();
              if (location.pathname === homePath) {
                window.dispatchEvent(new Event('refreshHome'));
              } else {
                navigate(homePath);
              }
            }}
            className="flex items-center justify-center"
            aria-label="Go to home page"
          >
            <img
              src="/icons/sea_sidebar_logo.svg"
              alt="RMS Logo"
              className="w-[58px] h-[58px] object-contain cursor-pointer"
            />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 flex flex-col gap-6">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.id;

            return (
              <div key={item.id} className="relative flex flex-col items-center px-[22px]">
                <button
                  onClick={() => handleNavigation(item)}
                  className="flex flex-col items-center w-full group transition-all"
                >
                  <div
                    className={`w-[42px] h-[42px] rounded-[4px] flex items-center justify-center mb-2 transition-all ${
                      isActive ? 'bg-primary' : 'bg-white group-hover:bg-bg-light'
                    }`}
                  >
                    <IconComponent isActive={isActive} />
                  </div>
                  <span
                    className={`text-[14px] font-open-sans leading-[20px] ${
                      isActive ? 'font-bold text-text' : 'text-text group-hover:text-accent'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>

                {item.badge !== null && item.badge > 0 && (
                  <div className="absolute top-[-6px] right-[14px] min-w-[20px] h-[20px] px-[6px] bg-badge-red rounded-full flex items-center justify-center z-10">
                    <span className="text-white text-[10px] font-medium">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Avatar + Dropdown */}
        <div ref={userMenuRef} className="relative flex justify-center pb-8">
          <div
            onClick={() => setShowUserMenu(prev => !prev)}
            className="h-[46px] w-[46px] cursor-pointer overflow-hidden rounded-full border border-[#E5E7EB] bg-bg-light transition-all hover:ring-2 hover:ring-accent flex items-center justify-center"
            title={userName}
          >
            <ProfileImage
              userId={userId}
              name={userName}
              alt={userName}
              className="w-full h-full object-cover rounded-full flex items-center justify-center"
              fallbackClassName={SPEAKER_PLACEHOLDER}
            />
          </div>

          {showUserMenu && (
            <div
              className="fixed z-[9999]"
              style={{ bottom: '24px', left: '110px', width: '200px' }}
            >
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(26,46,56,0.18)',
                  border: '1px solid rgba(58,184,200,0.15)',
                }}
              >
                {/* User info - click to view profile */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile();
                  }}
                  className="w-full text-left px-4 pt-4 pb-3 hover:bg-bg-light transition-colors"
                  style={{ borderBottom: '1px solid #f0f4f8' }}
                >
                  <p className="font-bold text-sm" style={{ color: '#1a2e38' }}>{userName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{roleLabel}</p>
                </button>

                {/* Sign out */}
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-red-50"
                    style={{ color: '#e53e3e' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="16 17 21 12 16 7" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>

              {/* Left arrow */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-6px',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '6px solid white',
                  filter: 'drop-shadow(-1px 0 0 rgba(58,184,200,0.15))',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(26, 46, 56, 0.45)', backdropFilter: 'blur(3px)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl flex flex-col items-center"
            style={{ width: '340px', padding: '36px 32px 28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'rgba(229,62,62,0.08)' }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                  stroke="#e53e3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 17 21 12 16 7"
                  stroke="#e53e3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="21" y1="12" x2="9" y2="12"
                  stroke="#e53e3e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="font-bold text-base mb-1" style={{ color: '#1a2e38' }}>
              Are you sure you want to logout?
            </p>

            <div className="mt-2 flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-gray-50"
                style={{ color: '#395062', borderColor: '#d1d5db' }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #e53e3e, #c53030)' }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Sidebar);