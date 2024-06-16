// /src/utils/mongooseCache.ts
import { getCachedData, setCachedData, invalidateAndSetCache, updateArrayEntry, invalidateCache } from './cacheUtils';
import { setCachedArray } from './arrayCacheUtils';
import { CacheableMethods, CacheData } from '../types/Cache';
import { getMetadata } from './cacheMetadata';

export async function handleCache(method: CacheableMethods, url: string, data: CacheData | null = null) {
  let cachedValue: CacheData | null = null;
  try {
    switch (method) {
      case 'GET':
        cachedValue = await getCachedData(url);
        if (!cachedValue && data) {
          if (Array.isArray(data)) {
            await setCachedArray(url, data);
          }else{
            await setCachedData(url, data);
          }
        }
        break;
      case 'POST':
        data && await setCachedData(url, data);
        break;
      case 'PUT':
        if (data && data.id) {
          // Update the object itself
          await invalidateAndSetCache(`object:${data.id}`, data);
          // Update any arrays containing this object
          const arrayKeys = await getMetadata(data.id);
          for (const arrayKey of arrayKeys) {
            await updateArrayEntry(arrayKey, data);
          }
        }
        break;
      case 'DELETE':
        await invalidateCache(url);
        break;
      default:
        console.warn(`Unknown method: ${method}`);
        break;
    }
  } catch (error) {
    console.error(`Error handling cache for ${method} ${url}:`, error);
  }
  return cachedValue;
}
