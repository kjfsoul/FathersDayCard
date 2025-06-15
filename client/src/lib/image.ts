// client/src/lib/image.ts

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY_PLACEHOLDER'; // Replace with actual key
const DEFAULT_STATIC_IMAGE = 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max'; // A generic fallback image
const DEFAULT_LOTTIE_ANIMATION = 'https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json'; // A generic fallback Lottie

interface ImageCacheItem {
  imageUrl: string;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches a static image URL from Unsplash based on a query.
 * Caches the result in localStorage to reduce API calls.
 * Includes a fallback image.
 */
export async function fetchStaticImage(query: string): Promise<string> {
  const cacheKey = `static_image_${query.toLowerCase().replace(/\s+/g, '_')}`;
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const parsedItem: ImageCacheItem = JSON.parse(cachedItem);
      if (Date.now() - parsedItem.timestamp < CACHE_DURATION) {
        console.log(`Serving cached image for query: ${query}`);
        return parsedItem.imageUrl;
      } else {
        localStorage.removeItem(cacheKey); // Cache expired
      }
    }

    if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY_PLACEHOLDER') {
      console.warn('Unsplash Access Key is a placeholder. Using fallback image.');
      return DEFAULT_STATIC_IMAGE;
    }

    const response = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`);
    if (!response.ok) {
      console.error('Failed to fetch image from Unsplash:', response.status, await response.text());
      return DEFAULT_STATIC_IMAGE;
    }

    const data = await response.json();
    const imageUrl = data.urls?.regular || DEFAULT_STATIC_IMAGE;

    const newCacheItem: ImageCacheItem = { imageUrl, timestamp: Date.now() };
    localStorage.setItem(cacheKey, JSON.stringify(newCacheItem));

    return imageUrl;
  } catch (error) {
    console.error('Error fetching static image:', error);
    return DEFAULT_STATIC_IMAGE;
  }
}

/**
 * Returns a Lottie animation URL.
 * In a real app, this might involve fetching from a list or a dedicated service.
 * For now, it returns a predefined animation or a fallback.
 */
export function getLottieAnimationUrl(animationName?: string): string {
  // This is a placeholder. A real implementation might have a map:
  // const lottieAnimations: { [key: string]: string } = {
  //   "fatherPlaying": "https://assetsX.lottiefiles.com/packages/lf20_someanimation.json",
  //   "celebration": "https://assetsY.lottiefiles.com/packages/lf20_anotherone.json",
  // };
  // if (animationName && lottieAnimations[animationName]) {
  //   return lottieAnimations[animationName];
  // }
  console.log(`Requested Lottie animation: ${animationName || 'default'}. Returning default/placeholder.`);
  return DEFAULT_LOTTIE_ANIMATION;
}

/**
 * Clears all cached images and Lottie URLs from localStorage.
 * Could be called on user logout or to respect the "50 images per user" limit
 * in a more direct (though still client-side) way by clearing caches periodically.
 */
export function clearImageCache(): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('static_image_') || key.startsWith('lottie_anim_')) { // Assuming lottie might be cached too
      localStorage.removeItem(key);
    }
  });
  console.log('Image and Lottie cache cleared.');
}

// Example usage (optional, for testing):
// (async () => {
//   const dadImage = await fetchStaticImage('father son bonding');
//   console.log('Dad Image URL:', dadImage);
//   const celebrationLottie = getLottieAnimationUrl('celebration');
//   console.log('Celebration Lottie URL:', celebrationLottie);
// })();
