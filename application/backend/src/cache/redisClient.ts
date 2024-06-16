import { createClient, RedisClientType } from 'redis';
import { REDIS_URI } from '../env';

const redisUrl = REDIS_URI || 'redis://localhost:6379';
export const client: RedisClientType = createClient({ url: redisUrl });

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

client.on('error', (err) => {
  console.error('Redis error:', err);
});
