import { NextRequest, NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { verifyPayPalWebhook } from '@/lib/paypal'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const headers: Record<string, string | null> = {
    'paypal-auth-algo': req.headers.get('paypal-auth-algo'),
    'paypal-cert-url': req.headers.get('paypal-cert-url'),
    'paypal-transmission-id': req.headers.get('paypal-transmission-id'),
    'paypal-transmission-sig': req.headers.get('paypal-transmission-sig'),
    'paypal-transmission-time': req.headers.get('paypal-transmission-time'),
  }

  const isValid = await verifyPayPalWebhook(headers, rawBody)
  if (!isValid) {
    console.error('[PayPal] Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  let event: { event_type: string; resource: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log('[PayPal] Webhook event:', event.event_type)

  try {
    const resource = event.resource
    const subscriptionId = resource.id as string
    const userId = resource.custom_id as string

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED': {
        if (!userId) break
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const meta = user.privateMetadata as Record<string, unknown>
        await client.users.updateUserMetadata(userId, {
          privateMetadata: { ...meta, plan: 'premium', subscriptionId },
        })
        break
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        if (!userId) break
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const meta = user.privateMetadata as Record<string, unknown>
        await client.users.updateUserMetadata(userId, {
          privateMetadata: { ...meta, plan: 'free', subscriptionId: null },
        })
        break
      }

      default:
        break
    }
  } catch (error) {
    console.error('[PayPal] Webhook handler error:', error)
    // Return 200 to prevent PayPal from retrying
  }

  return NextResponse.json({ received: true })
}
