/**
 * Enhanced Component Wrapper
 * Provides progressive enhancement and graceful degradation
 */

'use client';

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-pages/error-boundary';
import { FallbackUI, SkeletonFallback, ReducedModeFallback } from '@/components/fallback/fallback-ui';
import { useProgressiveEnhancement } from '@/lib/progressive-enhancement';
import { useOfflineMode } from '@/hooks/use-offline-mode';

export interface EnhancedComponentProps {
  children: ReactNode;
  
  // Feature requirements
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  
  // Component variants
  basicComponent?: ComponentType<any>;
  enhancedComponent?: ComponentType<any>;
  premiumComponent?: ComponentType<any>;
  
  // Fallback options
  fallbackComponent?: ComponentType<any>;
  loadingComponent?: ComponentType<any>;
  errorComponent?: ComponentType<any>;
  
  // Progressive enhancement options
  enableProgressiveLoading?: boolean;
  enableOfflineMode?: boolean;
  enableErrorBoundary?: boolean;
  
  // Component props to pass through
  componentProps?: Record<string, any>;
  
  // Callbacks
  onFeatureMissing?: (missingFeatures: string[]) => void;
  onError?: (error: Error) => void;
  onOffline?: () => void;
}

export function EnhancedComponent({
  children,
  requiredFeatures = [],
  optionalFeatures = [],
  basicComponent: BasicComponent,
  enhancedComponent: EnhancedComponent,
  premiumComponent: PremiumComponent,
  fallbackComponent: FallbackComponent,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  enableProgressiveLoading = true,
  enableOfflineMode = true,
  enableErrorBoundary = true,
  componentProps = {},
  onFeatureMissing,
  onError,
  onOffline,
}: EnhancedComponentProps) {
  const { 
    hasFeature, 
    getEnhancementLevel, 
    canUseFeature,
    featureSupport 
  } = useProgressiveEnhancement();
  
  const { isOnline } = useOfflineMode({
    onOffline,
  });

  // Check feature requirements
  const missingRequired = requiredFeatures.filter(feature => !hasFeature(feature));
  const missingOptional = optionalFeatures.filter(feature => !hasFeature(feature));
  const hasAllRequired = missingRequired.length === 0;

  // Notify about missing features
  React.useEffect(() => {
    if (missingRequired.length > 0) {
      onFeatureMissing?.(missingRequired);
    }
  }, [missingRequired, onFeatureMissing]);

  // Determine which component to render
  const getComponentToRender = (): ComponentType<any> | null => {
    if (!hasAllRequired) {
      return FallbackComponent || null;
    }

    const level = getEnhancementLevel();
    
    switch (level) {
      case 'premium':
        return PremiumComponent || EnhancedComponent || BasicComponent || null;
      case 'enhanced':
        return EnhancedComponent || BasicComponent || null;
      case 'basic':
      default:
        return BasicComponent || null;
    }
  };

  const ComponentToRender = getComponentToRender();

  // Handle missing required features
  if (!hasAllRequired) {
    if (FallbackComponent) {
      return (
        <FallbackComponent 
          {...componentProps}
          missingFeatures={missingRequired}
        />
      );
    }

    return (
      <ReducedModeFallback
        missingFeatures={missingRequired}
        availableFeatures={Object.keys(featureSupport).filter(f => featureSupport[f])}
      />
    );
  }

  // Handle offline mode
  if (enableOfflineMode && !isOnline) {
    // Try to render a simpler version when offline
    const OfflineComponent = BasicComponent || FallbackComponent;
    if (OfflineComponent) {
      return (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              You're offline - showing simplified version
            </div>
          </div>
          <OfflineComponent {...componentProps} />
        </div>
      );
    }
  }

  // Render the appropriate component
  const renderComponent = () => {
    if (!ComponentToRender) {
      return children;
    }

    if (enableProgressiveLoading) {
      const LazyComponent = lazy(() => Promise.resolve({ default: ComponentToRender }));
      
      return (
        <Suspense fallback={LoadingComponent ? <LoadingComponent /> : <SkeletonFallback />}>
          <LazyComponent {...componentProps} />
        </Suspense>
      );
    }

    return <ComponentToRender {...componentProps} />;
  };

  // Wrap with error boundary if enabled
  if (enableErrorBoundary) {
    return (
      <ErrorBoundary
        onError={onError}
        fallback={
          ErrorComponent ? (
            <ErrorComponent {...componentProps} />
          ) : (
            <FallbackUI
              componentName="Enhanced Component"
              error={new Error('Component failed to render')}
            />
          )
        }
      >
        {renderComponent()}
      </ErrorBoundary>
    );
  }

  return renderComponent();
}

/**
 * HOC for creating enhanced components
 */
export function withEnhancement<P extends object>(
  BasicComponent: ComponentType<P>,
  options: Omit<EnhancedComponentProps, 'children' | 'basicComponent'> = {}
) {
  const EnhancedWrapper = (props: P) => (
    <EnhancedComponent
      basicComponent={BasicComponent}
      componentProps={props}
      {...options}
    >
      <BasicComponent {...props} />
    </EnhancedComponent>
  );

  EnhancedWrapper.displayName = `withEnhancement(${BasicComponent.displayName || BasicComponent.name})`;
  
  return EnhancedWrapper;
}

/**
 * Feature gate component - only renders children if features are available
 */
export interface FeatureGateProps {
  children: ReactNode;
  requires?: string[];
  fallback?: ReactNode;
  onMissingFeatures?: (missing: string[]) => void;
}

export function FeatureGate({ 
  children, 
  requires = [], 
  fallback,
  onMissingFeatures 
}: FeatureGateProps) {
  const { hasFeature } = useProgressiveEnhancement();
  
  const missing = requires.filter(feature => !hasFeature(feature));
  const hasAllFeatures = missing.length === 0;

  React.useEffect(() => {
    if (missing.length > 0) {
      onMissingFeatures?.(missing);
    }
  }, [missing, onMissingFeatures]);

  if (!hasAllFeatures) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Conditional enhancement component
 */
export interface ConditionalEnhancementProps {
  feature: string;
  enhanced: ReactNode;
  basic: ReactNode;
  loading?: ReactNode;
}

export function ConditionalEnhancement({ 
  feature, 
  enhanced, 
  basic, 
  loading 
}: ConditionalEnhancementProps) {
  const { hasFeature, canUseFeature } = useProgressiveEnhancement();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Simulate feature detection delay
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking && loading) {
    return <>{loading}</>;
  }

  return canUseFeature(feature) ? <>{enhanced}</> : <>{basic}</>;
}