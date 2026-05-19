import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { cancelPayPalSubscription } from '@/lib/paypal'
import { getSubscriptionStatus } from '@/lib/subscription'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 })
    }

    const status = await getSubscriptionStatus()
    if (!status.subscriptionId) {
      return NextResponse.json(
        { error: '有効なサブスクリプションが見つかりません。' },
        { status: 400 }
      )
    }

    await cancelPayPalSubscription(status.subscriptionId)

    // Immediately update Clerk metadata
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const meta = user.privateMetadata as Record<string, unknown>
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { ...meta, plan: 'free', subscriptionId: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PayPal] cancel error:', error)
    return NextResponse.json({ error: 'キャンセルに失敗しました。' }, { status: 500 })
  }
}
