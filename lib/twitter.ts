import { TwitterApi } from 'twitter-api-v2'

function getClient() {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY!,
    appSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  })
  return client.readWrite
}

export async function postTweet(text: string): Promise<string> {
  const client = getClient()
  const tweet = await client.v2.tweet(text)
  return tweet.data.id
}
