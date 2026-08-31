import {
  useState,
  useEffect,
  useCallback,
} from 'react';

const useEventRequestCount = ({ enabled = true } = {}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const loading = false;

  const fetchPendingCount = useCallback(async () => {
    // RMS backend has no event-requests/events module yet — disabled until it exists.
    setPendingCount(0);
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchPendingCount();
    }
  }, [enabled, fetchPendingCount]);

  useEffect(() => {
    const handleStatusChange = () => {
      if (enabled) {
        fetchPendingCount();
      }
    };

    window.addEventListener('eventStatusChanged', handleStatusChange);

    return () => {
      window.removeEventListener('eventStatusChanged', handleStatusChange);
    };
  }, [enabled, fetchPendingCount]);

  return {
    pendingCount,
    loading,
    refetch: fetchPendingCount,
  };
};

export default useEventRequestCount;
