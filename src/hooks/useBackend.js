import httpService from '../services/httpService';
import { useState, useEffect, useCallback, useMemo,useRef } from 'react';
/**
 * Custom hook for backend data fetching with CRUD operations
 * @param {string} endpoint - API endpoint URL
 * @param {object} options - Configuration options
 * @returns {object} - { rows, row, loading, error, refresh, create, update, remove, setFilter, setSort, setLimit }
 */
const useBackend = (endpoint, options = {}) => {
//   const {
//     autoFetch = true,
//     initialLimit = 10,
//     initialPage = 1,
//     initialFilters = {},
//     initialSort = {},
//     allowRawResponse = false,
//     refreshAfterMutation = autoFetch,
//   } = options;

//   const [rows, setRows] = useState([]);


const {
  autoFetch = true,
  initialLimit = 10,
  initialPage = 1,
  initialFilters = {},
  initialSort = {},
  allowRawResponse = false,
  refreshAfterMutation = autoFetch,
} = options;

const memoizedFilters = useMemo(
  () => JSON.stringify(initialFilters || {}),
  [initialFilters]
);

const memoizedSort = useMemo(
  () => JSON.stringify(initialSort || {}),
  [initialSort]
);

const [rows, setRows] = useState([]);

const fetchedEndpointsRef = useRef(new Set());
const isFetchingRef = useRef(false);

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [filters, setFilters] = useState(initialFilters);
  // const [sort, setSort] = useState(initialSort);

  const [filters, setFilters] = useState(
  JSON.parse(memoizedFilters)
);

const [sort, setSort] = useState(
  JSON.parse(memoizedSort)
);

  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });

  useEffect(() => {
  setFilters(JSON.parse(memoizedFilters));
}, [memoizedFilters]);

useEffect(() => {
  setSort(JSON.parse(memoizedSort));
}, [memoizedSort]);


  const canAccessFeedback = useCallback((event) => {
    if (!event?.startDate) return false;

    try {
      // Convert event date
      const eventDate = new Date(event.startDate);

      // Current date
      const now = new Date();

      // Remove time part from event date
      const eventOnlyDate = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );

      // Remove time part from current date
      const todayOnlyDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      // Allow today and past dates only
      return eventOnlyDate <= todayOnlyDate;
    } catch (error) {
      console.error('Feedback date validation error:', error);
      return false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
  if (isFetchingRef.current) {
    return;
  }
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        ...sort,
      };

      const response = await httpService.get(endpoint, params);

      if (response.success) {
        const data = response.data;

        // ================================
        // ARRAY RESPONSE
        // ================================
        if (Array.isArray(data)) {
          const updatedRows = data.map((item) => ({
            ...item,
            canAccessFeedback: canAccessFeedback(item),
          }));

          setRows(updatedRows);

          setPagination((prev) => ({
            ...prev,
            total: updatedRows.length,
          }));
        }

        // ================================
        // ITEMS RESPONSE
        // ================================
        else if (Array.isArray(data?.items)) {
          const updatedRows = data.items.map((item) => ({
            ...item,
            canAccessFeedback: canAccessFeedback(item),
          }));

          setRows(updatedRows);

          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || updatedRows.length,
          }));
        }

        // ================================
        // NESTED DATA RESPONSE
        // ================================
        else if (Array.isArray(data?.data)) {
          const updatedRows = data.data.map((item) => ({
            ...item,
            canAccessFeedback: canAccessFeedback(item),
          }));

          setRows(updatedRows);

          setPagination((prev) => ({
            ...prev,
            total: updatedRows.length,
          }));
        }

        // ================================
        // SINGLE OBJECT RESPONSE
        // ================================
        else if (data) {
          setRow({
            ...data,
            canAccessFeedback: canAccessFeedback(data),
          });
        }
      }
    } catch (err) {
      console.error('useBackend fetch error:', err);

      setError(
        err?.response?.data?.message ||
        err.message ||
        'Failed to fetch data'
      );
    } finally {
          isFetchingRef.current = false;

      setLoading(false);
    }
  }, [
    endpoint,
    // pagination.page,
    // pagination.limit,
//     memoizedFilters,
// memoizedSort,
    canAccessFeedback,
  ]);

  // Auto-fetch on mount and when dependencies change
 useEffect(() => {
  if (!autoFetch || !endpoint) return;
  const requestKey =
    `${endpoint}-${pagination.page}-${pagination.limit}`;

  if (fetchedEndpointsRef.current.has(requestKey)) {
    return;
  }

  fetchedEndpointsRef.current.add(requestKey);

    fetchData();

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  endpoint,
  pagination.page,
  pagination.limit,
  memoizedFilters,
  memoizedSort,
]);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Create record (POST)
  const create = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await httpService.post(endpoint, data);

        const isRawSuccess =
          allowRawResponse &&
          response &&
          typeof response === 'object' &&
          !Object.prototype.hasOwnProperty.call(response, 'success');

        const isSuccess = response?.success || isRawSuccess;

        const responseData = response?.success
          ? response.data
          : response;

        if (isSuccess) {
          setRows((prevRows) => [
            {
              ...responseData,
              canAccessFeedback: canAccessFeedback(responseData),
            },
            ...prevRows,
          ]);

          if (refreshAfterMutation) {
            refresh();
          }

          return response;
        } else {
          setError(response.message || 'Failed to create data');
          throw new Error(response.message);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'An error occurred'
        );

        console.error('useBackend create error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      allowRawResponse,
      endpoint,
      refresh,
      refreshAfterMutation,
      canAccessFeedback,
    ]
  );

  // Update record (POST/PUT)
  const update = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (data.id) {
          response = await httpService.put(
            `${endpoint}/${data.id}`,
            data
          );
        } else {
          response = await httpService.post(endpoint, data);
        }

        const isRawSuccess =
          allowRawResponse &&
          response &&
          typeof response === 'object' &&
          !Object.prototype.hasOwnProperty.call(response, 'success');

        const isSuccess = response?.success || isRawSuccess;

        const responseData = response?.success
          ? response.data
          : response;

        if (isSuccess) {
          if (data.id) {
            setRows((prevRows) =>
              prevRows.map((item) =>
                item.id === data.id
                  ? {
                      ...responseData,
                      canAccessFeedback:
                        canAccessFeedback(responseData),
                    }
                  : item
              )
            );
          } else {
            setRows((prevRows) => [
              {
                ...responseData,
                canAccessFeedback:
                  canAccessFeedback(responseData),
              },
              ...prevRows,
            ]);
          }

          if (refreshAfterMutation) {
            refresh();
          }

          return response;
        } else {
          setError(response.message || 'Failed to update data');
          throw new Error(response.message);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'An error occurred'
        );

        console.error('useBackend update error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      allowRawResponse,
      endpoint,
      refresh,
      refreshAfterMutation,
      canAccessFeedback,
    ]
  );

  // Delete record (DELETE)
  const remove = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const response = await httpService.remove(
          `${endpoint}/${id}`
        );

        if (response && response.success === true) {
          // Update local state optimistically
          setRows((prevRows) =>
            prevRows.filter((item) => item.id !== id)
          );

          return response;
        } else {
          setError(response?.message || 'Failed to delete data');

          throw new Error(
            response?.message || 'Failed to delete data'
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'An error occurred'
        );

        console.error('useBackend remove error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  // Update local state without API call
  const updateLocal = useCallback((updatedRow) => {
    setRows((prevRows) =>
      prevRows.map((item) =>
        item.id === updatedRow.id
          ? {
              ...updatedRow,
              canAccessFeedback:
                canAccessFeedback(updatedRow),
            }
          : item
      )
    );
  }, [canAccessFeedback]);

  // Set filters
  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, []);

  // Set sorting
  const setOrderBy = useCallback((field, order = 'asc') => {
    setSort({
      sortBy: field,
      sortOrder: order,
    });
  }, []);

  // Set pagination limit
  const setLimit = useCallback((newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  }, []);

  // Set pagination page
  const setPage = useCallback((newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  return {
    rows,
    row,
    loading,
    error,
    pagination,
    refresh,
    create,
    update,
    remove,
    updateLocal,
    setFilter,
    setOrderBy,
    setLimit,
    setPage,
    canAccessFeedback,
  };
};

export default useBackend;