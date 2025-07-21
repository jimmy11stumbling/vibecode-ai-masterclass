
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
  totalHeight: number;
  offsetY: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  config: VirtualScrollConfig
): VirtualScrollResult => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const result = useMemo(() => {
    const { itemHeight, containerHeight, overscan } = config;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleItems = items.slice(startIndex, endIndex + 1);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;
    
    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight,
      offsetY
    };
  }, [items, config, scrollTop]);
  
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);
  
  return {
    ...result,
    handleScroll
  };
};

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps);
};

export const useMemoizedValue = <T>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(factory, deps);
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());
  
  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, options]);
  
  return isIntersecting;
};

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0
  });
  
  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime
      }));
      
      console.log(`🔥 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
    };
  }, []);
  
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage
      }));
      
      console.log(`💾 Memory usage: ${memoryUsage.toFixed(2)}MB`);
    }
  }, []);
  
  return {
    metrics,
    measureRenderTime,
    measureMemoryUsage
  };
};
