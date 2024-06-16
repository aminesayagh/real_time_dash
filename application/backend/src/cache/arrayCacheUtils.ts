import { client } from './redisClient';
import { CacheData } from '../types/Cache';
import { addMetadata, removeMetadata } from './cacheMetadata';
import { keyGenerator } from './cacheUtils';
import { CACHE_TTL } from '../types/Cache';

export async function setCachedArray(url: string, array: CacheData[]) {
  const arrayKey = keyGenerator('GET', url);
  try {
    await client.setEx(arrayKey, CACHE_TTL, JSON.stringify(array)); // Cache for 1 hour
    // Update metadata for each object in array
    for (const item of array) {
      if (item.id) {
        await addMetadata(item.id, arrayKey);
      }
    }
  } catch (error) {
    console.error(`Error setting cached array for ${arrayKey}:`, error);
  }
}
