const PAYPAL_API =
  process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

export async function getPayPalToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function getOrCreatePlanId(): Promise<string> {
  if (process.env.PAYPAL_PLAN_ID) return process.env.PAYPAL_PLAN_ID

  const token = await getPayPalToken()

  // 1. Create Product (idempotency key prevents duplicates)
  const productRes = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': 'fortune-product-v1',
    },
    body: JSON.stringify({
      name: '運勢占いプレミアムプラン',
      description: '月額500円 プレミアムサブスクリプション',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  })

  let productId: string
  if (productRes.status === 409) {
    // Already exists — list and find it
    const listRes = await fetch(
      `${PAYPAL_API}/v1/catalogs/products?page_size=20&total_required=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const list = await listRes.json()
    const found = (list.products as Array<{ name: string; id: string }>)?.find(
      (p) => p.name === '運勢占いプレミアムプラン'
    )
    if (!found) throw new Error('PayPal product not found after 409')
    productId = found.id
  } else if (!productRes.ok) {
    throw new Error(`PayPal product creation failed: ${await productRes.text()}`)
  } else {
    const product = await productRes.json()
    productId = product.id as string
  }

  // 2. Create Plan
  const planRes = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': 'fortune-plan-500jpy-v1',
    },
    body: JSON.stringify({
      product_id: productId,
      name: '運勢占いプレミアム 月額500円',
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: '500', currency_code: 'JPY' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: { value: '0', currency_code: 'JPY' },
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  })

  if (!planRes.ok) {
    throw new Error(`PayPal plan creation failed: ${await planRes.text()}`)
  }

  const plan = await planRes.json()
  console.log('[PayPal] Created plan ID:', plan.id, '→ Set PAYPAL_PLAN_ID env var to this value')
  return plan.id as string
}

export async function createPayPalSubscription(
  userId: string,
  userEmail: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const token = await getPayPalToken()
  const planId = await getOrCreatePlanId()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sophie1028.com'

  const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': `sub-${userId}-${Date.now()}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      subscriber: { email_address: userEmail },
      custom_id: userId,
      application_context: {
        brand_name: '総合占い 安田哲也',
        locale: 'ja-JP',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: `${appUrl}/paypal/return`,
        cancel_url: `${appUrl}/paypal/cancel`,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`PayPal subscription creation failed: ${JSON.stringify(err)}`)
  }

  const data = await res.json()
  const approvalUrl = (data.links as Array<{ rel: string; href: string }>)?.find(
    (l) => l.rel === 'approve'
  )?.href

  if (!approvalUrl) throw new Error('No approval URL returned by PayPal')

  return { subscriptionId: data.id as string, approvalUrl }
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalToken()
  const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to get PayPal subscription')
  return res.json()
}

export async function cancelPayPalSubscription(subscriptionId: string): Promise<void> {
  const token = await getPayPalToken()
  const res = await fetch(
    `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: 'ユーザーによるキャンセル' }),
    }
  )
  if (!res.ok && res.status !== 204) {
    throw new Error(`PayPal cancel failed: ${await res.text()}`)
  }
}

export async function verifyPayPalWebhook(
  headers: Record<string, string | null>,
  rawBody: string
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[PayPal] PAYPAL_WEBHOOK_ID not set — skipping signature verification')
    return true
  }

  try {
    const token = await getPayPalToken()
    const res = await fetch(
      `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return data.verification_status === 'SUCCESS'
  } catch (e) {
    console.error('[PayPal] Webhook verification error:', e)
    return false
  }
}
