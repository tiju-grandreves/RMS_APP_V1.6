// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { API_BASE_URL } from '../../services/networkmodule';

// export const fetchBlobUrl = async (url) => {
//   if (!url) return null;
//   try {
//     const userData = localStorage.getItem('userData');
//     let token = null;
//     if (userData) {
//       try { token = JSON.parse(userData).accessToken; } catch {}
//     }
//     const response = await axios.get(
//       `${API_BASE_URL}/event-requests/get-filecontent?url=${encodeURIComponent(url)}`,
//       { responseType: 'blob', headers: token ? { Authorization: `Bearer ${token}` } : {} }
//     );
//     return URL.createObjectURL(response.data);
//   } catch {
//     return null;
//   }
// };

// const SecureImage = ({
//   src,
//   alt,
//   className,
//   fallback = '/noimage.png',
//   minHeight = '180px',
//   showLoadingText = true
// }) => {
//   const [objectUrl, setObjectUrl] = useState(null);
//   const [failed, setFailed] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!src) {
//       setFailed(true);
//       setIsLoading(false);
//       return;
//     }

//     let revoked = false;
//     let blobUrl = null;
//     setIsLoading(true);
//     setFailed(false);

//     const fetchImage = async () => {
//       try {
//         const userData = localStorage.getItem('userData');
//         let token = null;
//         if (userData) {
//           try {
//             token = JSON.parse(userData).accessToken;
//           } catch {}
//         }

//         const response = await axios.get(`${API_BASE_URL}/event-requests/get-filecontent`, {
//           params: { url: src },
//           responseType: 'blob',
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         });

//         blobUrl = URL.createObjectURL(response.data);
//         if (!revoked) {
//           setObjectUrl(blobUrl);
//           setIsLoading(false);
//         }
//       } catch (error) {
//         console.error('Failed to load image:', error);
//         if (!revoked) {
//           setFailed(true);
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchImage();

//     return () => {
//       revoked = true;
//       if (blobUrl) URL.revokeObjectURL(blobUrl);
//     };
//   }, [src]);

//   if (isLoading) {
//     const hasExplicitDimensions = className?.includes('w-') && className?.includes('h-');
    
//     return (
//       <div 
//         className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
//         style={!hasExplicitDimensions ? { minHeight: minHeight } : {}}
//       >
//         <div className="flex flex-col items-center gap-2">
//           <svg 
//             className={showLoadingText ? "w-8 h-8 text-gray-400 animate-spin" : "w-4 h-4 text-gray-400 animate-spin"}
//             fill="none" 
//             stroke="currentColor" 
//             viewBox="0 0 24 24"
//           >
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//           </svg>
//           {showLoadingText && !hasExplicitDimensions && (
//             <span className="text-sm text-gray-500">Loading image...</span>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (failed || (!objectUrl && !src)) {
//     if (!fallback) return null;
//     return (
//       <img 
//         src={fallback} 
//         alt={alt} 
//         className={className}
//         style={{ objectFit: 'cover' }}
//       />
//     );
//   }

//   return <img src={objectUrl} alt={alt} className={className} />;
// };

// export default SecureImage;










import React, { useState, useEffect, memo } from 'react';

export const fetchBlobUrl = async (url) => {
  // RMS backend has no file-content/images module yet — disabled until it exists.
  return null;
};

const SecureImage = ({
  src,
  alt,
  className,
  fallback = '/noimage.png',
  minHeight = '180px',
  showLoadingText = true,
  showLoader = true,
}) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
const [apiError, setApiError] = useState(false);
  useEffect(() => {
    if (!src || src.trim() === '') {
    setObjectUrl(null);
        setApiError(false);

    setIsLoading(false);
    return;
  }
    let mounted = true;

    setIsLoading(true);
  setApiError(false);

    const loadImage = async () => {
    const blobUrl = await fetchBlobUrl(src);

    if (!mounted) return;

if (blobUrl === 'NO_IMAGE') {
  setObjectUrl('/noimage.png');
} else if (blobUrl) {
  setObjectUrl(blobUrl);
} else {
  setApiError(true);
}

      setIsLoading(false);
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src]);

  if (isLoading) {
    const hasExplicitDimensions = className?.includes('w-') && className?.includes('h-');
    
    return (
      <div 
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        style={!hasExplicitDimensions ? { minHeight: minHeight } : {}}
      >
        {showLoader && (
          <div className="flex flex-col items-center gap-2">
            <svg 
              className={showLoadingText ? "w-8 h-8 text-gray-400 animate-spin" : "w-4 h-4 text-gray-400 animate-spin"}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {showLoadingText && !hasExplicitDimensions && (
              <span className="text-sm text-gray-500">Loading image...</span>
            )}
          </div>
        )}
      </div>
    );
  }
// No image attached
if (!src || src.trim() === '') {
  return (
    <img
      src="/noimage.png"
      alt={alt}
      className={className}
      style={{ objectFit: 'cover' }}
    />
  );
}

// API failed
if (apiError) {
  return (
    <img
      src="https://placehold.co/1200x400?text=No+Image+Available"
      alt={alt}
      className={className}
    />
  );
}

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
};

export default memo(SecureImage);

