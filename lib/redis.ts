import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await client.connect();
  }

  return client;
}

export async function setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(key, ttl, JSON.stringify(value));
}

export async function getCache(key: string): Promise<any> {
  const redis = await getRedisClient();
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(key);
}