// import React, { createContext, useContext, useEffect } from 'react';
// import useEventRequestCount from '../services/requestCount';

// const EventCountContext = createContext();

// export const EventCountProvider = ({ children }) => {
//   const value = useEventRequestCount(  {
//   enabled: false,
// }
// );

//   return (
//     <EventCountContext.Provider value={value}>
//       {children}
//     </EventCountContext.Provider>
//   );
// };

// export const useEventCount = () => {
//   return useContext(EventCountContext);
// };



import React, {
  createContext,
  useContext,
  useEffect,
} from 'react';
import useEventRequestCount from '../services/requestCount';

const EventCountContext = createContext();
export const EventCountProvider = ({ children }) => {
  const value = useEventRequestCount({
    // enabled: false,
  });

  useEffect(() => {
    const handleLogin = () => {
      value.refetch();
    };

    window.addEventListener('userLoggedIn', handleLogin);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
    };
  }, [value]);

  return (
    <EventCountContext.Provider value={value}>
      {children}
    </EventCountContext.Provider>
  );
};
// export const EventCountProvider = ({ children }) => {
//   const value = useEventRequestCount({
//     enabled: false,
//   });

//   const fetchedRef = useRef(false);

//   useEffect(() => {
//     if (fetchedRef.current) return;

//     fetchedRef.current = true;
//     value.refetch();
//   }, []);

//   return (
//     <EventCountContext.Provider value={value}>
//       {children}
//     </EventCountContext.Provider>
//   );
// };

export const useEventCount = () => {
  const context = useContext(EventCountContext);
  if (!context) throw new Error('useEventCount must be used within EventCountProvider');
  return context;
};