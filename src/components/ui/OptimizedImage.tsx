
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  className?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  placeholder,
  className = '',
  lazy = true,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  // Optimiser l'URL de l'image
  const getOptimizedSrc = (originalSrc: string) => {
    // Si c'est une URL externe, on peut ajouter des paramètres d'optimisation
    if (originalSrc.startsWith('http')) {
      const url = new URL(originalSrc);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      if (quality) url.searchParams.set('q', quality.toString());
      return url.toString();
    }
    return originalSrc;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setError(true);
    onError?.(event.nativeEvent);
  };

  // Image de placeholder pendant le chargement
  const placeholderSrc = placeholder || `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        Chargement...
      </text>
    </svg>
  `)}`;

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {!isLoaded && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          style={{ width, height }}
        />
      )}
      
      {/* Image principale */}
      {isInView && (
        <img
          ref={imgRef}
          src={getOptimizedSrc(src)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width, height }}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {/* Indicateur de chargement */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 rounded w-6 h-6"></div>
        </div>
      )}
    </div>
  );
};

// Hook pour précharger les images
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (loadedImages.has(url)) {
        resolve();
        return;
      }

      setLoadingImages(prev => new Set(prev).add(url));

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(url));
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        resolve();
      };
      img.onerror = () => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }, [loadedImages]);

  const preloadAll = useCallback(async () => {
    const promises = urls.map(url => preloadImage(url).catch(console.error));
    await Promise.allSettled(promises);
  }, [urls, preloadImage]);

  useEffect(() => {
    preloadAll();
  }, [preloadAll]);

  return {
    loadedImages,
    loadingImages,
    preloadImage,
    isLoaded: (url: string) => loadedImages.has(url),
    isLoading: (url: string) => loadingImages.has(url)
  };
}
