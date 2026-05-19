import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createPayPalSubscription } from '@/lib/paypal'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const email =
      user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? ''

    const { approvalUrl } = await createPayPalSubscription(userId, email)
    return NextResponse.json({ url: approvalUrl })
  } catch (error) {
    console.error('[PayPal] create-subscription error:', error)
    return NextResponse.json(
      { error: 'サブスクリプションの作成に失敗しました。' },
      { status: 500 }
    )
  }
}
