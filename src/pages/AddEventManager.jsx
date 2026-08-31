import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { validateEmail } from '../components/common/Validators';

import {
  DMSansTextAsterisk,
  InterText,
  OpenSansText,
} from "../components/common/customtTextFonts";
import { colors } from "../components/colors/colors";

const USER_SOURCE_OPTIONS = [
  { value: "registered", label: "Registered users" },
  { value: "visitor", label: "Visitor" },
];

const parseUsersResponse = (response) => {
  if (!response) return [];
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.users)) return response.data.users;
  return [];
};

const getUserDisplayName = (user) =>
  user?.fullName ||
  user?.name ||
  user?.email ||
  user?.phone ||
  `User ${user?.id ?? ""}`;

const isNameDisplay = (displayName) => {
  if (/^\d+$/.test(displayName)) return false;
  if (displayName.includes('@')) return false;
  if (displayName.toLowerCase().startsWith('user ')) return false;
  return /[a-zA-Z]/.test(displayName);
};

const sortUsersAlphabetically = (usersArray) => {
  return [...usersArray].sort((a, b) => {
    const nameA = getUserDisplayName(a);
    const nameB = getUserDisplayName(b);
    const isNameA = isNameDisplay(nameA);
    const isNameB = isNameDisplay(nameB);
    if (isNameA && !isNameB) return -1;
    if (!isNameA && isNameB) return 1;
    const lowerA = nameA.toLowerCase();
    const lowerB = nameB.toLowerCase();
    return lowerA.localeCompare(lowerB);
  });
};

const filterUsersBySearchTerm = (usersArray, term) => {
  if (!term.trim()) return usersArray;
  const lowercasedTerm = term.toLowerCase().trim();
  return usersArray.filter(user => {
    const displayName = getUserDisplayName(user).toLowerCase();
    const email = (user?.email || "").toLowerCase();
    const phone = (user?.phone || "").toLowerCase();
    return displayName.includes(lowercasedTerm) ||
      email.includes(lowercasedTerm) ||
      phone.includes(lowercasedTerm);
  });
};

const filterUsersBySource = (usersArray, source) => {
  if (source === "visitor") {
    return usersArray.filter((user) => user?.role == null);
  }
  return usersArray;
};

const AddEventManager = ({ isOpen, onClose, onSuccess }) => {
  const USERS_PAGE_SIZE = 4130;

  const currentUser = JSON.parse(localStorage.getItem("userData"));
  const resolveRoleId = (roleValue) => {
    if (typeof roleValue === "number") return roleValue;

    const normalizedRole = String(roleValue || "").trim().toLowerCase();
    const roleMap = {
      "facility manager": 1,
      "event manager": 2,
      "admin": 3,
      "super admin": 4,
    };

    const mappedRole = roleMap[normalizedRole];
    if (mappedRole) return mappedRole;

    const numericRole = Number(roleValue);
    return Number.isNaN(numericRole) ? null : numericRole;
  };

  const currentUserRole = resolveRoleId(currentUser?.roleId ?? currentUser?.role);

  const [formData, setFormData] = useState({
    user: "",
    phone: "",
    email: "",
    password: "",
    role: "Event Manager",
    organization: "",
    designation: "",
  });

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPhoneLocked, setIsPhoneLocked] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [userSource, setUserSource] = useState("registered");
  const searchInputRef = useRef(null);
  const dropdownContainerRef = useRef(null);

  const showSuccessToast = (title, message) => {
    const toastId = toast.custom(
      (t) => (
        <div
          className={`${t.visible ? "animate-enter" : "animate-leave"
            } pointer-events-auto w-[380px] bg-white rounded-[8px] shadow-lg border border-[#E5E7EB]`}
        >
          <div className="flex items-start px-5 py-4">
            <div className="flex-shrink-0 mt-1">
              <img
                src="/icons/tick-circle.png"
                alt="success"
                className="w-6 h-6"
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-[14px] font-semibold text-black leading-[20px]">
                {title}
              </p>
              <p className="text-[14px] font-normal text-black leading-[20px]">
                {message}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.remove(toastId);
              }}
              className="ml-3 flex-shrink-0 text-[#6B7280] hover:text-black transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );
    return toastId;
  };

  const fetchUsers = useCallback(async (page = 1, source = userSource) => {
    // RMS backend has no sea_users module yet — disabled until it exists.
    setUsers([]);
    setHasMoreUsers(false);
    setUsersPage(page);
    if (page === 1) {
      setUsersLoaded(true);
    }
  }, [userSource]);

  const handleUserSourceChange = (source) => {
    if (source === userSource) return;
    setUserSource(source);
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        user: "",
        phone: "",
        email: "",
        password: "",
        role: "Event Manager",
        organization: "",
        designation: "",
      });
      if (userSource !== "registered") {
        setUserSource("registered");
      }
    }
    // Intentionally reset only when the modal opens, not on every userSource change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (currentUserRole !== 4 && currentUserRole !== 1 && userSource !== "registered") {
      setUserSource("registered");
      return;
    }

    setUsers([]);
    setFilteredUsers([]);
    setSearchTerm("");
    setUsersPage(1);
    setHasMoreUsers(true);
    setUserDropdownOpen(false);
    setIsPhoneLocked(false);
    setIsEmailLocked(false);
    setUsersLoaded(false);
    if (error) setError("");

    setFormData((prev) => ({
      ...prev,
      user: "",
      phone: "",
      email: "",
      password: "",
    }));

    fetchUsers(1, userSource);
    // 'error' omitted to avoid re-running this reset when an unrelated error is set;
    // 'fetchUsers' omitted because its identity changes with usersLoading, which would cause a refetch loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSource, currentUserRole, isOpen]);

  useEffect(() => {
    if (userDropdownOpen && usersLoaded) {
      const filtered = filterUsersBySearchTerm(users, searchTerm);
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, userDropdownOpen, usersLoaded]);

  useEffect(() => {
    if (userDropdownOpen && searchInputRef.current && usersLoaded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [userDropdownOpen, usersLoaded]);

  useEffect(() => {
    if (!userDropdownOpen) return;
    const handleFocusOut = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.relatedTarget)) {
        setUserDropdownOpen(false);
      }
    };
    const container = dropdownContainerRef.current;
    if (container) {
      container.addEventListener('focusout', handleFocusOut);
      return () => {
        container.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, [userDropdownOpen]);

  if (!isOpen) return null;

  const isEmpty = (value) => !value || value.trim() === "";
  const shouldShowPasswordError =
    formData.user &&
    formData.phone &&
    formData.email &&
    formData.organization &&
    formData.designation &&
    isEmpty(formData.password);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "").slice(0, 9);
      setFormData((prev) => ({
        ...prev,
        phone: onlyDigits,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (error) setError("");
  };

  const normalizeManualPhoneDigits = (phone) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("971")) {
      cleaned = cleaned.slice(3);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  const isValidPhone = (phone) => {
    const normalized = normalizeManualPhoneDigits(phone);
    return normalized.length === 9;
  };

  const formatPhoneForApi = (phone) => {
    const normalized = normalizeManualPhoneDigits(phone);
    return `+971${normalized}`;
  };
const isValidEmail = (email) => !validateEmail(email);

  // const isValidEmail = (email) =>
  //   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const getEmailErrorMessage = () => {
  if (!touched.email) return null;

  if (isEmpty(formData.email)) {
    return "Email is required";
  }

  return validateEmail(formData.email);
};

  const isManualPhone = !isPhoneLocked;
  const isManualEmail = !isEmailLocked;

  const isPhoneFieldValid = isManualPhone
    ? isValidPhone(formData.phone)
    : !isEmpty(formData.phone);

  const isEmailFieldValid = isManualEmail
    ? isValidEmail(formData.email)
    : !isEmpty(formData.email);

  const isFormValid =
    formData.user.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.password.trim() !== "" &&
    formData.role.trim() !== "" &&
    formData.organization.trim() !== "" &&
    formData.designation.trim() !== "" &&
    isPhoneFieldValid &&
    isEmailFieldValid;

  const handleUserChange = (selectedId) => {
    const selectedUser = users.find(
      (user) => user.id === Number(selectedId)
    );
    if (selectedUser) {
      const hasApiPhone = Boolean(selectedUser?.phone);
      const hasApiEmail = Boolean(selectedUser?.email);
      setIsPhoneLocked(hasApiPhone);
      setIsEmailLocked(hasApiEmail);
      setFormData((prev) => ({
        ...prev,
        user: selectedId,
        email: selectedUser?.email || "",
        phone: selectedUser?.phone
          ? selectedUser.phone.replace("+971", "")
          : "",
        password: "",
        role: "Event Manager",
      }));
    }
    setSearchTerm("");
    setUserDropdownOpen(false);
  };

  const handleUserListScroll = async (e) => {
    if (!searchTerm.trim()) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const reachedBottom = scrollHeight - scrollTop - clientHeight < 20;
      if (reachedBottom && hasMoreUsers && !usersLoading) {
        await fetchUsers(usersPage + 1);
      }
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    setError(null);
    setTouched((prev) => ({
  ...prev,
  email: true,
}));
const emailError = validateEmail(formData.email);

if (emailError) {
  setLoading(false);
  return;
}
    // RMS backend has no sea_users module yet — disabled until it exists.
    setError("Adding event managers is not available yet.");
    setLoading(false);
  };

  return createPortal(
    <div
      className="fixed inset-0"
      style={{
        zIndex: 999999,
        backgroundColor: "rgba(0,0,0,0.6)",
      }}
    >
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="absolute bg-white rounded-xl shadow-2xl"
        style={{
          width: "900px",
          maxHeight: "90vh",
          overflowY: "auto",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          padding: "32px",
          zIndex: 1000000,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <OpenSansText
            text="Add new user"
            fontSize={24}
            fontWeight={600}
            color={colors.tealColor}
          />
          <button
            onClick={onClose}
            className="text-gray-500 text-xl hover:text-black focus:outline-none"
          >
            ✕
          </button>
        </div>
        <div className="border-b border-gray-200 mb-6"></div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-md">
            <InterText
              text={error}
              fontSize={14}
              fontWeight={400}
              color={colors.bordererrorcolor}
            />
          </div>
        )}

        {(currentUserRole === 4 || currentUserRole === 1) && (
          <div className="flex items-center gap-6 mb-6">
            {USER_SOURCE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="userSource"
                  value={option.value}
                  checked={userSource === option.value}
                  onChange={() => handleUserSourceChange(option.value)}
                  className="h-4 w-4"
                  style={{ accentColor: "#395062" }}
                />
                <span
                  className={`text-[14px] font-medium ${userSource === option.value
                      ? "text-[#395062]"
                      : "text-[#4B5563]"
                    }`}
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* USER */}
          <div>
            <label className="text-[14px] font-dm-sans font-medium text-[#000000]">
              User<span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm bg-gray-50 text-left text-black flex justify-between items-center"
                disabled={!usersLoaded}
              >
                <span>
                  {formData.user
                    ? getUserDisplayName(
                      users.find((u) => u.id === Number(formData.user))
                    )
                    : usersLoaded ? "Select user" : "Loading users..."}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${userDropdownOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {userDropdownOpen && usersLoaded && (
                <div
                  ref={dropdownContainerRef}
                  className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg"
                >
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search users"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                        disabled={!usersLoaded}
                      />
                      {searchTerm && usersLoaded && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className="max-h-52 overflow-y-auto"
                    onScroll={handleUserListScroll}
                  >
                    {usersLoading && filteredUsers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        Loading users...
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserChange(String(user.id))}
                          className="block w-full px-3 py-2 text-center text-sm text-black hover:bg-gray-100"
                        >
                          {getUserDisplayName(user)}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500 text-center">
                        {usersLoading ? "Loading users..." : "No users found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PHONE */}
          <div>
            <DMSansTextAsterisk
              hasAsterisk
              text="Phone number"
              fontSize={14}
              fontWeight={500}
              color={colors.BlackColor}
            />

            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm">
                +971 -
              </span>

              <input
                name="phone"
                value={
                  formData.phone?.startsWith("971")
                    ? formData.phone.slice(3)
                    : formData.phone || ""
                }
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");

                  if (value.startsWith("971")) {
                    value = value.slice(3);
                  }

                  value = value.slice(0, 9);

                  handleChange({
                    target: {
                      name: "phone",
                      value,
                    },
                  });
                }}
                onBlur={handleBlur}
                autoComplete="off"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="Enter phone number"
                className="w-full border border-gray-300 pl-[68px] px-3 py-2 rounded-md text-sm bg-gray-50 text-black"
                disabled={isPhoneLocked && Boolean(formData.phone)}
              />
            </div>

            {formData.phone &&
              !(formData.phone.startsWith("5")
                ? formData.phone
                : formData.phone.startsWith("971")
                  ? formData.phone.slice(3)
                  : formData.phone
              ).startsWith("5") && (
                <p className="text-red-500 text-xs mt-1">
                  Phone number must start with 5
                </p>
              )}
          </div>

          {/* EMAIL */}
          <div>
            <DMSansTextAsterisk
              hasAsterisk
              text="Email"
              fontSize={14}
              fontWeight={500}
              color={colors.BlackColor}
            />
            <input
  name="email"
  value={formData.email}
  onChange={handleChange}
  onBlur={handleBlur}
  autoComplete="off"
  type="email"
  placeholder="Enter email"
  className="w-full mt-1 px-3 py-2 rounded-md text-sm bg-gray-50"
  style={{
    border: `1px solid ${
      getEmailErrorMessage()
        ? colors.bordererrorcolor
        : "#D1D5DB"
    }`,
  }}
  disabled={isEmailLocked && Boolean(formData.email)}
/>

<div className="min-h-[18px] mt-1">
  {getEmailErrorMessage() && (
    <InterText
      text={getEmailErrorMessage()}
      fontSize={12}
      fontWeight={400}
      color={colors.bordererrorcolor}
    />
  )}
</div>
            {/* <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              type="email"
              placeholder="Enter email"
              className="w-full border border-gray-300 mt-1 px-3 py-2 rounded-md text-sm bg-gray-50"
              disabled={isEmailLocked && Boolean(formData.email)}
            /> */}
          </div>

          {/* PASSWORD */}
          <div>
            <DMSansTextAsterisk hasAsterisk={true} text="Password" fontSize={14} fontWeight={500} color={colors.BlackColor} />
            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter password"
                className="w-full border mt-1 px-3 py-2 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-0 pr-10"
                style={{ borderColor: colors.lightBlueColorShade }}
              />
              {/* Custom eye icon – always visible, no extra icon */}
              <img
                src={showPassword ? "/icons/openeye.png" : "/icons/eyeclose.png"}
                alt="toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ width: "22.07px", height: "11.08px", cursor: "pointer" }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>
            {shouldShowPasswordError && (
              <InterText text="Password is required" fontSize={12} fontWeight={400} color={colors.bordererrorcolor} />
            )}
          </div>

          {/* Hide the browser's native password toggle icon (first icon) */}
          <style>{`
  input[type="password"]::-webkit-credentials-auto-fill-button,
  input[type="password"]::-webkit-reveal-button,
  input[type="password"]::-ms-reveal {
    display: none !important;
  }
`}</style>

          {/* ROLE */}
          <div>
            <label className="text-[14px] font-dm-sans font-medium text-[#000000]">
              Role type<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value="Event Manager"
              readOnly
              className="w-full border border-gray-300 mt-1 px-3 py-2 rounded-md text-sm bg-gray-100 text-black cursor-not-allowed"
            />
          </div>

          {/* ORGANIZATION */}
          <div>
            <DMSansTextAsterisk
              hasAsterisk
              text="Organization"
              fontSize={14}
              fontWeight={500}
              color={colors.BlackColor}
            />
            <input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              type="text"
              placeholder="Enter organization name"
              className="w-full border border-gray-300 mt-1 px-3 py-2 rounded-md text-sm bg-gray-50"
            />
          </div>

          {/* DESIGNATION */}
          <div>
            <DMSansTextAsterisk
              hasAsterisk
              text="Designation"
              fontSize={14}
              fontWeight={500}
              color={colors.BlackColor}
            />
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              type="text"
              placeholder="Enter designation"
              className="w-full border border-gray-300 mt-1 px-3 py-2 rounded-md text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="w-[155px] h-[42px] rounded-[4px] border px-[10px] flex items-center justify-center"
            style={{ borderColor: "#395062" }}
          >
            <InterText
              text="Cancel"
              fontSize={14}
              fontWeight={400}
              color="#395062"
            />
          </button>
          <button
            onClick={handleAddUser}
            disabled={!isFormValid || loading}
            className={`w-[164px] h-[42px] rounded-[4px] flex items-center justify-center ${isFormValid
                ? "bg-[#395062]"
                : "bg-[#CDD6DC] cursor-not-allowed"
              }`}
          >
            <InterText
              text={loading ? "Adding..." : "Save Changes"}
              fontSize={14}
              fontWeight={500}
              color={isFormValid ? "#FFFFFF" : "#7A8A96"}
            />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddEventManager;
