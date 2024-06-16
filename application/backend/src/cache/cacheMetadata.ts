// /src/utils/cacheMetadata.ts
import { client } from './redisClient';

export async function addMetadata(objectId: string, arrayKey: string) {
  const metadataKey = `metadata:${objectId}`;
  try {
    await client.sAdd(metadataKey, arrayKey);
  } catch (error) {
    console.error(`Error adding metadata for ${metadataKey}:`, error);
  }
}

export async function getMetadata(objectId: string): Promise<string[]> {
  const metadataKey = `metadata:${objectId}`;
  try {
    return await client.sMembers(metadataKey);
  } catch (error) {
    console.error(`Error getting metadata for ${metadataKey}:`, error);
    return [];
  }
}

export async function removeMetadata(objectId: string, arrayKey: string) {
  const metadataKey = `metadata:${objectId}`;
  try {
    await client.sRem(metadataKey, arrayKey);
  } catch (error) {
    console.error(`Error removing metadata for ${metadataKey}:`, error);
  }
}
