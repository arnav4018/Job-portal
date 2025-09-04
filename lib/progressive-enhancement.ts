/**
 * Progressive Enhancement System
 * Provides feature detection and graceful degradation strategies
 */

export interface FeatureSupport {
  [key: string]: boolean;
}

export interface EnhancementLevel {
  level: 'basic' | 'enhanced' | 'premium';
  features: string[];
  requirements: string[];
}

export class ProgressiveEnhancement {
  private static instance: ProgressiveEnhancement;
  private featureSupport: FeatureSupport = {};
  private enhancementLevel: EnhancementLevel['level'] = 'basic';

  private constructor() {
    this.detectFeatures();
    this.determineEnhancementLevel();
  }

  static getInstance(): ProgressiveEnhancement {
    if (!ProgressiveEnhancement.instance) {
      ProgressiveEnhancement.instance = new ProgressiveEnhancement();
    }
    return ProgressiveEnhancement.instance;
  }

  /**
   * Detect browser and device capabilities
   */
  private detectFeatures(): void {
    if (typeof window === 'undefined') {
      // Server-side defaults
      this.featureSupport = {
        javascript: false,
        localStorage: false,
        sessionStorage: false,
        indexedDB: false,
        serviceWorker: false,
        webGL: false,
        canvas: false,
        geolocation: false,
        notifications: false,
        camera: false,
        microphone: false,
        bluetooth: false,
        nfc: false,
        vibration: false,
        battery: false,
        networkInformation: false,
        intersectionObserver: false,
        mutationObserver: false,
        resizeObserver: false,
        webAssembly: false,
        webRTC: false,
        webSockets: false,
        fetch: false,
        promises: false,
        asyncAwait: false,
        modules: false,
        css3: false,
        flexbox: false,
        grid: false,
        customProperties: false,
        touchEvents: false,
        pointerEvents: false,
        deviceMotion: false,
        deviceOrientation: false,
      };
      return;
    }

    this.featureSupport = {
      // Core JavaScript features
      javascript: true,
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      indexedDB: 'indexedDB' in window,
      
      // Service Worker and PWA features
      serviceWorker: 'serviceWorker' in navigator,
      
      // Graphics and media
      webGL: this.testWebGL(),
      canvas: this.testCanvas(),
      
      // Device APIs
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      camera: this.testCamera(),
      microphone: this.testMicrophone(),
      bluetooth: 'bluetooth' in navigator,
      nfc: 'nfc' in navigator,
      vibration: 'vibrate' in navigator,
      battery: 'getBattery' in navigator,
      
      // Network APIs
      networkInformation: 'connection' in navigator,
      
      // Observer APIs
      intersectionObserver: 'IntersectionObserver' in window,
      mutationObserver: 'MutationObserver' in window,
      resizeObserver: 'ResizeObserver' in window,
      
      // Modern web features
      webAssembly: 'WebAssembly' in window,
      webRTC: this.testWebRTC(),
      webSockets: 'WebSocket' in window,
      fetch: 'fetch' in window,
      promises: 'Promise' in window,
      asyncAwait: this.testAsyncAwait(),
      modules: this.testModules(),
      
      // CSS features
      css3: this.testCSS3(),
      flexbox: this.testFlexbox(),
      grid: this.testGrid(),
      customProperties: this.testCustomProperties(),
      
      // Input methods
      touchEvents: 'ontouchstart' in window,
      pointerEvents: 'onpointerdown' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      deviceOrientation: 'DeviceOrientationEvent' in window,
    };
  }

  /**
   * Determine the appropriate enhancement level based on capabilities
   */
  private determineEnhancementLevel(): void {
    const basicRequirements = ['javascript', 'localStorage'];
    const enhancedRequirements = [...basicRequirements, 'fetch', 'promises', 'intersectionObserver'];
    const premiumRequirements = [...enhancedRequirements, 'serviceWorker', 'webGL', 'webAssembly'];

    if (this.hasFeatures(premiumRequirements)) {
      this.enhancementLevel = 'premium';
    } else if (this.hasFeatures(enhancedRequirements)) {
      this.enhancementLevel = 'enhanced';
    } else {
      this.enhancementLevel = 'basic';
    }
  }

  /**
   * Check if all required features are supported
   */
  private hasFeatures(features: string[]): boolean {
    return features.every(feature => this.featureSupport[feature]);
  }

  // Feature detection methods
  private testLocalStorage(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private testWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private testCanvas(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  }

  private testCamera(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private testMicrophone(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  private testWebRTC(): boolean {
    return !!(window.RTCPeerConnection);
  }

  private testAsyncAwait(): boolean {
    try {
      return (async () => {})().constructor === Promise;
    } catch {
      return false;
    }
  }

  private testModules(): boolean {
    const script = document.createElement('script');
    return 'noModule' in script;
  }

  private testCSS3(): boolean {
    const div = document.createElement('div');
    return 'borderRadius' in div.style;
  }

  private testFlexbox(): boolean {
    const div = document.createElement('div');
    return 'flexBasis' in div.style;
  }

  private testGrid(): boolean {
    const div = document.createElement('div');
    return 'gridTemplateColumns' in div.style;
  }

  private testCustomProperties(): boolean {
    return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
  }

  // Public API
  public getFeatureSupport(): FeatureSupport {
    return { ...this.featureSupport };
  }

  public hasFeature(feature: string): boolean {
    return !!this.featureSupport[feature];
  }

  public getEnhancementLevel(): EnhancementLevel['level'] {
    return this.enhancementLevel;
  }

  public getAvailableFeatures(): string[] {
    return Object.keys(this.featureSupport).filter(key => this.featureSupport[key]);
  }

  public getMissingFeatures(required: string[]): string[] {
    return required.filter(feature => !this.featureSupport[feature]);
  }

  public canUseFeature(feature: string, fallback?: () => boolean): boolean {
    if (this.hasFeature(feature)) {
      return true;
    }
    return fallback ? fallback() : false;
  }

  /**
   * Get recommended component variants based on capabilities
   */
  public getComponentVariant(component: string): string {
    const variants = {
      dataTable: {
        basic: 'simple-table',
        enhanced: 'interactive-table',
        premium: 'virtual-table',
      },
      navigation: {
        basic: 'simple-nav',
        enhanced: 'animated-nav',
        premium: 'smart-nav',
      },
      form: {
        basic: 'basic-form',
        enhanced: 'validated-form',
        premium: 'smart-form',
      },
      chart: {
        basic: 'table-chart',
        enhanced: 'svg-chart',
        premium: 'canvas-chart',
      },
    };

    return variants[component as keyof typeof variants]?.[this.enhancementLevel] || 'basic';
  }

  /**
   * Execute code based on feature availability
   */
  public withFeature<T>(
    feature: string,
    callback: () => T,
    fallback?: () => T
  ): T | undefined {
    if (this.hasFeature(feature)) {
      return callback();
    } else if (fallback) {
      return fallback();
    }
    return undefined;
  }

  /**
   * Load polyfills for missing features
   */
  public async loadPolyfills(features: string[]): Promise<void> {
    const missing = this.getMissingFeatures(features);
    const polyfills: Promise<void>[] = [];

    for (const feature of missing) {
      switch (feature) {
        case 'fetch':
          polyfills.push(this.loadPolyfill('https://polyfill.io/v3/polyfill.min.js?features=fetch'));
          break;
        case 'intersectionObserver':
          polyfills.push(this.loadPolyfill('https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver'));
          break;
        case 'resizeObserver':
          polyfills.push(this.loadPolyfill('https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver'));
          break;
        // Add more polyfills as needed
      }
    }

    await Promise.all(polyfills);
    
    // Re-detect features after loading polyfills
    this.detectFeatures();
    this.determineEnhancementLevel();
  }

  private loadPolyfill(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load polyfill: ${url}`));
      document.head.appendChild(script);
    });
  }
}

// Export singleton instance
export const progressiveEnhancement = ProgressiveEnhancement.getInstance();

// React hook for using progressive enhancement
export function useProgressiveEnhancement() {
  return {
    hasFeature: progressiveEnhancement.hasFeature.bind(progressiveEnhancement),
    getEnhancementLevel: progressiveEnhancement.getEnhancementLevel.bind(progressiveEnhancement),
    getComponentVariant: progressiveEnhancement.getComponentVariant.bind(progressiveEnhancement),
    withFeature: progressiveEnhancement.withFeature.bind(progressiveEnhancement),
    canUseFeature: progressiveEnhancement.canUseFeature.bind(progressiveEnhancement),
    loadPolyfills: progressiveEnhancement.loadPolyfills.bind(progressiveEnhancement),
    featureSupport: progressiveEnhancement.getFeatureSupport(),
  };
}