// Client-side caching for navigation optimization

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  accessCount: number
  lastAccessed: number
}

interface CacheConfig {
  maxSize?: number
  defaultTTL?: number
  persistToStorage?: boolean
  storageKey?: string
}

class ClientCache {
  private cache = new Map<string, CacheEntry>()
  private config: Required<CacheConfig>
  private accessOrder: string[] = []

  constructor(config: CacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      persistToStorage: config.persistToStorage || false,
      storageKey: config.storageKey || 'navigation_cache'
    }

    if (this.config.persistToStorage && typeof window !== 'undefined') {
      this.loadFromStorage()
    }
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: now
    }

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, entry)
    this.updateAccessOrder(key)

    if (this.config.persistToStorage) {
      this.saveToStorage()
    }
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.removeFromAccessOrder(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    this.updateAccessOrder(key)

    return entry.data as T
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete cache entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.removeFromAccessOrder(key)
      if (this.config.persistToStorage) {
        this.saveToStorage()
      }
    }
    return deleted
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    if (this.config.persistToStorage) {
      this.saveToStorage()
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let totalSize = 0

    this.cache.forEach((entry) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++
      } else {
        validEntries++
      }
      totalSize += this.estimateEntrySize(entry)
    })

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      estimatedSize: totalSize,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessedEntries(5)
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let removedCount = 0

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        this.removeFromAccessOrder(key)
        removedCount++
      }
    })

    if (removedCount > 0 && this.config.persistToStorage) {
      this.saveToStorage()
    }

    return removedCount
  }

  // Preload data into cache
  async preload(key: string, dataLoader: () => Promise<any>, ttl?: number): Promise<void> {
    if (this.has(key)) {
      return // Already cached
    }

    try {
      const data = await dataLoader()
      this.set(key, data, ttl)
    } catch (error) {
      console.warn(`Failed to preload cache entry ${key}:`, error)
    }
  }

  // Batch operations
  setMany<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }

  getMany<T>(keys: string[]): Array<{ key: string; data: T | null }> {
    return keys.map(key => ({
      key,
      data: this.get<T>(key)
    }))
  }

  // Private methods
  private evictOldest(): void {
    if (this.accessOrder.length === 0) return

    const oldestKey = this.accessOrder[0]
    this.cache.delete(oldestKey)
    this.removeFromAccessOrder(oldestKey)
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key)
    this.accessOrder.push(key)
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private estimateEntrySize(entry: CacheEntry): number {
    try {
      return JSON.stringify(entry.data).length * 2 // Rough estimate
    } catch {
      return 1000 // Default estimate for non-serializable data
    }
  }

  private calculateHitRate(): number {
    let totalAccesses = 0
    this.cache.forEach(entry => {
      totalAccesses += entry.accessCount
    })
    return totalAccesses > 0 ? (this.cache.size / totalAccesses) * 100 : 0
  }

  private getMostAccessedEntries(limit: number) {
    return Array.from(this.cache.entries())
      .sort(([, a], [, b]) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed)
      }))
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const serializable = Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        ...entry
      }))
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(serializable))
    } catch (error) {
      console.warn('Failed to save cache to storage:', error)
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (!stored) return

      const entries = JSON.parse(stored)
      const now = Date.now()

      entries.forEach((entry: any) => {
        // Only load non-expired entries
        if (now - entry.timestamp < entry.ttl) {
          this.cache.set(entry.key, {
            data: entry.data,
            timestamp: entry.timestamp,
            ttl: entry.ttl,
            accessCount: entry.accessCount || 0,
            lastAccessed: entry.lastAccessed || entry.timestamp
          })
          this.accessOrder.push(entry.key)
        }
      })
    } catch (error) {
      console.warn('Failed to load cache from storage:', error)
    }
  }
}

// Specialized caches for different data types
export class RouteCache extends ClientCache {
  constructor() {
    super({
      maxSize: 50,
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      persistToStorage: true,
      storageKey: 'route_cache'
    })
  }

  cacheRouteData(route: string, data: any, ttl?: number): void {
    this.set(`route:${route}`, data, ttl)
  }

  getRouteData<T>(route: string): T | null {
    return this.get<T>(`route:${route}`)
  }

  preloadRoute(route: string, dataLoader: () => Promise<any>): Promise<void> {
    return this.preload(`route:${route}`, dataLoader)
  }
}

export class APICache extends ClientCache {
  constructor() {
    super({
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      persistToStorage: false, // API data shouldn't persist across sessions
      storageKey: 'api_cache'
    })
  }

  cacheAPIResponse(endpoint: string, params: any, response: any, ttl?: number): void {
    const key = this.generateAPIKey(endpoint, params)
    this.set(key, response, ttl)
  }

  getAPIResponse<T>(endpoint: string, params: any): T | null {
    const key = this.generateAPIKey(endpoint, params)
    return this.get<T>(key)
  }

  private generateAPIKey(endpoint: string, params: any): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `api:${endpoint}:${btoa(paramString)}`
  }
}

// Singleton instances
let routeCache: RouteCache | null = null
let apiCache: APICache | null = null

export function getRouteCache(): RouteCache {
  if (!routeCache) {
    routeCache = new RouteCache()
  }
  return routeCache
}

export function getAPICache(): APICache {
  if (!apiCache) {
    apiCache = new APICache()
  }
  return apiCache
}

// React hooks for cache usage
export function useRouteCache() {
  const cache = getRouteCache()

  return {
    cacheRouteData: (route: string, data: any, ttl?: number) => 
      cache.cacheRouteData(route, data, ttl),
    getRouteData: <T>(route: string) => cache.getRouteData<T>(route),
    preloadRoute: (route: string, dataLoader: () => Promise<any>) => 
      cache.preloadRoute(route, dataLoader),
    getStats: () => cache.getStats(),
    cleanup: () => cache.cleanup()
  }
}

export function useAPICache() {
  const cache = getAPICache()

  return {
    cacheResponse: (endpoint: string, params: any, response: any, ttl?: number) => 
      cache.cacheAPIResponse(endpoint, params, response, ttl),
    getResponse: <T>(endpoint: string, params: any) => 
      cache.getAPIResponse<T>(endpoint, params),
    getStats: () => cache.getStats(),
    cleanup: () => cache.cleanup()
  }
}

// Initialize caches and setup cleanup
export function initializeClientCache() {
  if (typeof window !== 'undefined') {
    const routeCache = getRouteCache()
    const apiCache = getAPICache()

    // Cleanup expired entries periodically
    const cleanupInterval = setInterval(() => {
      const routeRemoved = routeCache.cleanup()
      const apiRemoved = apiCache.cleanup()
      
      if (routeRemoved > 0 || apiRemoved > 0) {
        console.log(`Cache cleanup: removed ${routeRemoved} route entries, ${apiRemoved} API entries`)
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(cleanupInterval)
      routeCache.cleanup()
      apiCache.cleanup()
    })

    return () => {
      clearInterval(cleanupInterval)
    }
  }
}

export { ClientCache }
export type { CacheEntry, CacheConfig }