/**
 * Offline Mode Hook
 * Handles offline functionality and cached data management
 */

import { useState, useEffect, useCallback } from 'react';

export interface OfflineData<T = any> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface UseOfflineModeOptions {
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
  enableServiceWorker?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
}

export interface OfflineModeState {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  lastOnlineAt: Date | null;
  offlineDuration: number;
}

export function useOfflineMode(options: UseOfflineModeOptions = {}) {
  const {
    cacheKey = 'offline-cache',
    cacheDuration = 24 * 60 * 60 * 1000, // 24 hours
    enableServiceWorker = true,
    onOnline,
    onOffline,
  } = options;

  const [state, setState] = useState<OfflineModeState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: 'unknown',
    lastOnlineAt: null,
    offlineDuration: 0,
  });

  // Cache management
  const setCache = useCallback(<T>(key: string, data: T, customDuration?: number): void => {
    if (typeof window === 'undefined') return;
    
    const cacheData: OfflineData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (customDuration || cacheDuration),
    };
    
    try {
      localStorage.setItem(`${cacheKey}-${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [cacheKey, cacheDuration]);

  const getCache = useCallback(<T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(`${cacheKey}-${key}`);
      if (!cached) return null;
      
      const cacheData: OfflineData<T> = JSON.parse(cached);
      
      // Check if cache is expired
      if (cacheData.expiresAt && Date.now() > cacheData.expiresAt) {
        localStorage.removeItem(`${cacheKey}-${key}`);
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }, [cacheKey]);

  const clearCache = useCallback((key?: string): void => {
    if (typeof window === 'undefined') return;
    
    if (key) {
      localStorage.removeItem(`${cacheKey}-${key}`);
    } else {
      // Clear all cache entries with this prefix
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith(`${cacheKey}-`)) {
          localStorage.removeItem(k);
        }
      });
    }
  }, [cacheKey]);

  const getCacheAge = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(`${cacheKey}-${key}`);
      if (!cached) return null;
      
      const cacheData: OfflineData = JSON.parse(cached);
      const ageMs = Date.now() - cacheData.timestamp;
      
      if (ageMs < 60000) return 'just now';
      if (ageMs < 3600000) return `${Math.floor(ageMs / 60000)} minutes ago`;
      if (ageMs < 86400000) return `${Math.floor(ageMs / 3600000)} hours ago`;
      return `${Math.floor(ageMs / 86400000)} days ago`;
    } catch (error) {
      return null;
    }
  }, [cacheKey]);

  // Network status monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let offlineStartTime: number | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        setState(prev => ({
          ...prev,
          connectionType: connection.effectiveType || 'unknown',
          isSlowConnection: connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g',
        }));
      }
    };

    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
        offlineDuration: offlineStartTime ? Date.now() - offlineStartTime : 0,
      }));
      
      offlineStartTime = null;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      
      onOnline?.();
    };

    const handleOffline = () => {
      offlineStartTime = Date.now();
      setState(prev => ({
        ...prev,
        isOnline: false,
      }));
      
      // Update offline duration every second
      intervalId = setInterval(() => {
        if (offlineStartTime) {
          setState(prev => ({
            ...prev,
            offlineDuration: Date.now() - offlineStartTime!,
          }));
        }
      }, 1000);
      
      onOffline?.();
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateConnectionInfo);
        updateConnectionInfo(); // Initial check
      }
    }

    // Initial state
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      lastOnlineAt: navigator.onLine ? new Date() : null,
    }));

    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateConnectionInfo);
        }
      }
      
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onOnline, onOffline]);

  // Service Worker registration
  useEffect(() => {
    if (!enableServiceWorker || typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [enableServiceWorker]);

  // Utility functions
  const formatOfflineDuration = useCallback((duration: number): string => {
    if (duration < 60000) return 'less than a minute';
    if (duration < 3600000) return `${Math.floor(duration / 60000)} minutes`;
    if (duration < 86400000) return `${Math.floor(duration / 3600000)} hours`;
    return `${Math.floor(duration / 86400000)} days`;
  }, []);

  const syncWhenOnline = useCallback((callback: () => Promise<void>) => {
    if (state.isOnline) {
      callback();
    } else {
      const handleOnlineSync = () => {
        callback();
        window.removeEventListener('online', handleOnlineSync);
      };
      window.addEventListener('online', handleOnlineSync);
    }
  }, [state.isOnline]);

  return {
    ...state,
    setCache,
    getCache,
    clearCache,
    getCacheAge,
    formatOfflineDuration: () => formatOfflineDuration(state.offlineDuration),
    syncWhenOnline,
  };
}

/**
 * Hook for offline-first data fetching
 */
export function useOfflineData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseOfflineModeOptions & {
    refetchOnReconnect?: boolean;
    staleWhileRevalidate?: boolean;
  } = {}
) {
  const {
    refetchOnReconnect = true,
    staleWhileRevalidate = true,
    ...offlineOptions
  } = options;

  const offline = useOfflineMode(offlineOptions);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetchData = useCallback(async (useCache = true) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try cache first if offline or if stale-while-revalidate is enabled
      if (useCache && (!offline.isOnline || staleWhileRevalidate)) {
        const cached = offline.getCache<T>(key);
        if (cached) {
          setData(cached);
          setIsStale(staleWhileRevalidate && offline.isOnline);
        }
      }

      // Fetch fresh data if online
      if (offline.isOnline) {
        const freshData = await fetcher();
        setData(freshData);
        setIsStale(false);
        offline.setCache(key, freshData);
      } else if (!data) {
        // If offline and no cached data, throw error
        throw new Error('No cached data available while offline');
      }
    } catch (err) {
      setError(err as Error);
      
      // Try to use cached data as fallback
      if (!data) {
        const cached = offline.getCache<T>(key);
        if (cached) {
          setData(cached);
          setIsStale(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, offline, data, staleWhileRevalidate]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when coming back online
  useEffect(() => {
    if (offline.isOnline && refetchOnReconnect && data) {
      fetchData(false);
    }
  }, [offline.isOnline, refetchOnReconnect, data, fetchData]);

  return {
    data,
    isLoading,
    error,
    isStale,
    isOffline: !offline.isOnline,
    cacheAge: offline.getCacheAge(key),
    refetch: () => fetchData(false),
    ...offline,
  };
}