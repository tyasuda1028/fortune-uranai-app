import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getPayPalSubscription } from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です。' }, { status: 401 })
    }

    const { subscriptionId } = await req.json()
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId が必要です。' }, { status: 400 })
    }

    const sub = await getPayPalSubscription(subscriptionId)

    // Verify this subscription belongs to the logged-in user
    if (sub.custom_id !== userId) {
      return NextResponse.json({ error: '不正なサブスクリプションです。' }, { status: 403 })
    }

    if (sub.status === 'ACTIVE' || sub.status === 'APPROVED') {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const meta = user.privateMetadata as Record<string, unknown>
      await client.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...meta,
          plan: 'premium',
          subscriptionId,
        },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: `サブスクリプション状態が無効です: ${sub.status}` },
      { status: 400 }
    )
  } catch (error) {
    console.error('[PayPal] activate error:', error)
    return NextResponse.json({ error: '有効化に失敗しました。' }, { status: 500 })
  }
}
