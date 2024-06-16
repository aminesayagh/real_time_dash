export type CacheableMethods = 'GET' | 'POST' | 'PUT' | 'DELETE';
export interface CacheData {
  [key: string]: any;
}

export const CACHE_TTL = 3600;