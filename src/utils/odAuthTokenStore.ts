import Redis from 'ioredis'
import siteConfig from '../../config/site.config'

// Persistent key-value store is provided by Redis, hosted on Upstash
// https://vercel.com/integrations/upstash
const kv = new Redis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: null, // Disable retry limit to prevent MaxRetriesPerRequestError
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect in READONLY mode
    }
    return false;
  },
})

export async function getOdAuthTokens(): Promise<{ accessToken: unknown; refreshToken: unknown }> {
  const accessToken = await kv.get(`${siteConfig.kvPrefix}access_token`)
  const refreshToken = await kv.get(`${siteConfig.kvPrefix}refresh_token`)

  return {
    accessToken,
    refreshToken,
  }
}

export async function storeOdAuthTokens({
  accessToken,
  accessTokenExpiry,
  refreshToken,
}: {
  accessToken: string
  accessTokenExpiry: number
  refreshToken: string
}): Promise<void> {
  await kv.set(`${siteConfig.kvPrefix}access_token`, accessToken, 'EX', accessTokenExpiry)
  await kv.set(`${siteConfig.kvPrefix}refresh_token`, refreshToken)
}
