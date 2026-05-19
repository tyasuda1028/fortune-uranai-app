import { auth, clerkClient } from '@clerk/nextjs/server'

export type Plan = 'free' | 'premium'

export interface SubscriptionStatus {
  plan: Plan
  usageCount: number
  subscriptionId?: string
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { userId } = await auth()
  if (!userId) return { plan: 'free', usageCount: 0 }

  const client = await clerkClient()
  const user = await client.users.getUser(userId)

  // 開発者メールは常にプレミアム
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress
  if (isAdminEmail(primaryEmail)) {
    return { plan: 'premium', usageCount: 0 }
  }

  const meta = user.privateMetadata as Record<string, unknown>

  return {
    plan: (meta.plan as Plan) ?? 'free',
    usageCount: (meta.usageCount as number) ?? 0,
    subscriptionId: meta.subscriptionId as string | undefined,
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = user.privateMetadata as Record<string, unknown>
  const current = (meta.usageCount as number) ?? 0
  await client.users.updateUserMetadata(userId, {
    privateMetadata: { ...meta, usageCount: current + 1 },
  })
}
