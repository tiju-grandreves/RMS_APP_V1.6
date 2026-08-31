
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { API_BASE_URL } from '../../services/networkmodule';

// const PLACEHOLDER_IMAGE = '/icons/userimage-placeholder.svg';

// const getAccessToken = () => {
//   const userData = localStorage.getItem('userData');
//   if (!userData) return null;
//   try {
//     return JSON.parse(userData).accessToken || null;
//   } catch {
//     return null;
//   }
// };

// // Cache helpers
// const getCachedProfileImage = (userId) => {
//   if (!userId) return null;
//   const key = `profile_image_${userId}`;
//   return localStorage.getItem(key);
// };

// const setCachedProfileImage = (userId, base64DataUrl) => {
//   if (!userId) return;
//   const key = `profile_image_${userId}`;
//   if (base64DataUrl) {
//     localStorage.setItem(key, base64DataUrl);
//   } else {
//     localStorage.removeItem(key);
//   }
// };

// const ProfileImage = ({
//   userId,
//   name,
//   alt,
//   className = '',
//   fallbackClassName = '',
// }) => {
//   const [imageUrl, setImageUrl] = useState(null);
//   const [failed, setFailed] = useState(false);

//   useEffect(() => {
//     if (!userId) {
//       setImageUrl(null);
//       setFailed(true);
//       return;
//     }

//     // Try cache first
//     const cached = getCachedProfileImage(userId);
//     if (cached) {
//       setImageUrl(cached);
//       setFailed(false);
//       return;
//     }

//     setImageUrl(null);
//     setFailed(false);

//     let revoked = false;
//     let objectUrl = null;

//     const fetchImage = async () => {
//       try {
//         const token = getAccessToken();
//         const response = await axios.get(
//           `${API_BASE_URL}/images/user/${userId}/file`,
//           {
//             responseType: 'blob',
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           },
//         );

//         objectUrl = URL.createObjectURL(response.data);
//         if (!revoked) {
//           // Convert blob to base64 for caching
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const base64 = reader.result;
//             setCachedProfileImage(userId, base64);
//             if (!revoked) setImageUrl(base64);
//           };
//           reader.readAsDataURL(response.data);
//           // Also set the object URL for immediate display (faster)
//           setImageUrl(objectUrl);
//         }
//       } catch {
//         if (!revoked) {
//           setImageUrl(null);
//           setFailed(true);
//         }
//       }
//     };

//     fetchImage();

//     return () => {
//       revoked = true;
//       if (objectUrl) {
//         URL.revokeObjectURL(objectUrl);
//       }
//     };
//   }, [userId]);

//   if (imageUrl && !failed) {
//     return <img src={imageUrl} alt={alt || name || 'User'} className={className} />;
//   }

//   return (
//     <img
//       src={PLACEHOLDER_IMAGE}
//       alt={alt || name || 'User'}
//       className={fallbackClassName || className}
//     />
//   );
// };

// export default ProfileImage;



import React, { useEffect, useState } from 'react';

const SPEAKER_PLACEHOLDER = "/icons/Speaker-image-placeholder.svg";

const getCachedProfileImage = (userId) => {
  if (!userId) return null;
  const key = `profile_image_${userId}`;
  const cached = localStorage.getItem(key);
  const timestampKey = `profile_image_${userId}_ts`;
  const timestamp = localStorage.getItem(timestampKey);

  if (cached && timestamp) {
    const age = Date.now() - parseInt(timestamp, 10);
    if (age < 7 * 24 * 60 * 60 * 1000) { // 7 days TTL
      return cached;
    }
    localStorage.removeItem(key);
    localStorage.removeItem(timestampKey);
  }
  return null;
};

const setCachedProfileImage = (userId, base64DataUrl) => {
  if (!userId || !base64DataUrl) return;
  const key = `profile_image_${userId}`;
  const timestampKey = `profile_image_${userId}_ts`;
  localStorage.setItem(key, base64DataUrl);
  localStorage.setItem(timestampKey, Date.now().toString());
};

let pendingUserIds = new Set();
let batchTimeout = null;
let subscribers = new Map(); 

const notifySubscribers = (userId, base64DataUrl) => {
  const callbacks = subscribers.get(userId);
  if (callbacks) {
    callbacks.forEach(cb => cb(base64DataUrl));
    subscribers.delete(userId);
  }
};

const fetchBatch = async () => {
  if (pendingUserIds.size === 0) return;

  const idsToFetch = Array.from(pendingUserIds);
  pendingUserIds.clear();

  // RMS backend has no images module yet — disabled until it exists.
  idsToFetch.forEach(id => {
    setCachedProfileImage(id, 'NO_IMAGE');
    notifySubscribers(id, null);
  });
};

const requestImage = (userId, callback) => {
  // 1. Check cache immediately
  const cached = getCachedProfileImage(userId);
  if (cached) {
    callback(cached === 'NO_IMAGE' ? null : cached);
    return () => {};
  }

  // 2. Register subscriber for this userId
  if (!subscribers.has(userId)) {
    subscribers.set(userId, new Set());
  }
  subscribers.get(userId).add(callback);

  // 3. Add userId to batch queue
  pendingUserIds.add(userId);

  // 4. Schedule batch request (debounced)
  if (batchTimeout) clearTimeout(batchTimeout);
  batchTimeout = setTimeout(() => fetchBatch(), 50); // 50ms window for collecting IDs

  // Return unsubscribe function
  return () => {
    const subs = subscribers.get(userId);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) subscribers.delete(userId);
    }
    // Remove from pending if not yet fetched (optional)
    pendingUserIds.delete(userId);
  };
};

// ---------- PROFILE IMAGE COMPONENT ----------
const ProfileImage = ({
  userId,
  name,
  alt,
  className = '',
  fallbackClassName = '',
  loadingClassName = '',
}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!userId) {
      setImageUrl(null);
      setLoading(false);
      setFailed(true);
      return;
    }

    // Check cache immediately (synchronous)
    const cached = getCachedProfileImage(userId);
    if (cached) {
      if (cached === 'NO_IMAGE') {
        setImageUrl(null);
        setLoading(false);
        setFailed(true);
      } else {
        setImageUrl(cached);
        setLoading(false);
        setFailed(false);
      }
      return;
    }

    // Not cached – start loading state and request via batch
    setLoading(true);
    setFailed(false);
    setImageUrl(null);

    const handleImageLoaded = (base64DataUrl) => {
      setImageUrl(base64DataUrl);
      setLoading(false);
      setFailed(!base64DataUrl);
    };

    const unsubscribe = requestImage(userId, handleImageLoaded);

    return () => {
      unsubscribe();
    };
  }, [userId]);

  if (loading) {
    if (loadingClassName) {
      return <div className={loadingClassName} />;
    }
    return (
      <img
        src={SPEAKER_PLACEHOLDER}
        alt={alt || name || 'User'}
        className={fallbackClassName || className}
        style={{ opacity: 0.6 }}
      />
    );
  }

  if (imageUrl && !failed) {
  return (
    <img
      src={imageUrl}
      alt={alt || name || 'User'}
      className={className}
      onError={() => {
        setImageUrl(null);
        setFailed(true);

        if (userId) {
          localStorage.setItem(`profile_image_${userId}`, 'NO_IMAGE');
        }
      }}
    />
  );
}

  // if (imageUrl && !failed) {
  //   return (
  //     <img
  //       src={imageUrl}
  //       alt={alt || name || 'User'}
  //       className={className}
  //     />
  //   );
  // }

  return (
    <img
      src={SPEAKER_PLACEHOLDER}
      alt={alt || name || 'User'}
    className={fallbackClassName || className}
     onError={(e) => {
      e.currentTarget.src = '/noimage.png';
    }}
    />
  );
};

export default ProfileImage;