// /src/utils/cacheUtils.ts
import { client } from './redisClient';
import { CacheableMethods, CacheData } from '../types/Cache';
import { getMetadata, addMetadata, removeMetadata } from './cacheMetadata';
import { CACHE_TTL } from '../types/Cache';

export async function getCachedData(method: CacheableMethods, url: string, options:any=null): Promise<CacheData | null> {
  const key = keyGenerator(method, url, options);
  try {
    const cacheValue = await client.get(key);
    return cacheValue ? JSON.parse(cacheValue) : null;
  } catch (error) {
    console.error(`Error getting cached data for ${key}:`, error);
    return null;
  }
}

export async function setCachedData(method: CacheableMethods, url: string, data: CacheData) {
  const key = keyGenerator(method, url);
  try {
    await client.setEx(key, CACHE_TTL, JSON.stringify(data)); // Cache for 1 hour
    if (data.id) {
      const metadataKeys = await getMetadata(data.id);
      for (const arrayKey of metadataKeys) {
        await updateArrayEntry(arrayKey, data);
      }
    }
  } catch (error) {
    console.error(`Error setting cached data for ${key}:`, error);
  }
}

export async function invalidateCache(method: CacheableMethods, url: string) {
  const key = keyGenerator(method, url);
  try {
    const keys = await client.keys(key);
    if (keys.length) {
      await client.del(keys);
    }
  } catch (error) {
    console.error(`Error invalidating cache for ${key}:`, error);
  }
}

export async function invalidateAndSetCache(method: CacheableMethods, url: string, data: CacheData) {
  try {
    await invalidateCache(method, url); // Invalidate cache first
    await setCachedData(method, url, data); // Set new data
  } catch (error) {
    console.error(`Error updating cached data for GET:${url}:`, error);
  }
}

export async function updateArrayEntry(arrayKey: string, updatedObject: CacheData) {
  try {
    const arrayCache = await client.get(arrayKey);
    if (arrayCache) {
      const arrayData = JSON.parse(arrayCache);
      const updatedArray = arrayData.map((item: CacheData) => 
        item.id === updatedObject.id ? updatedObject : item
      );
      await client.setEx(arrayKey, CACHE_TTL, JSON.stringify(updatedArray));
    }
  } catch (error) {
    console.error(`Error updating array entry for ${arrayKey}:`, error);
  }
}

export function keyGenerator(method: CacheableMethods, url: string, options: any = null): string {
    const keyObject = {
      method: method,
      url: url,
      version: 'v1',
      options: options
    }
    return JSON.stringify(keyObject);
  }