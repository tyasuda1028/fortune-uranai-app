import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// 毎朝8時JST（23:00 UTC）に実行
export async function GET(request: NextRequest) {
  // Vercel Cron からのリクエストを認証
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const now = new Date()
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000)
    const dateStr = jstDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })

    // 3パターンのツイート案を生成
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `あなたは運勢占いアプリ「Sophie」の公式Xアカウント担当者です。
毎朝、フォロワーに向けて今日の運勢メッセージをツイートします。

3パターンのツイート案を作成してください。

各ツイートのルール：
- 必ず日本語で書く
- URL込みで280文字以内（URLは約25文字として計算）
- 絵文字を2〜3個使う
- 今日のラッキーカラーを1つ含める
- 前向きで温かみのあるメッセージにする
- ハッシュタグを2個含める（例: #今日の運勢 #占い）
- 末尾に「🔮 https://sophie1028.com」を追加すること

以下のJSON形式で返してください：
{
  "tweet1": "ツイート本文1（URL付き）",
  "tweet2": "ツイート本文2（URL付き）",
  "tweet3": "ツイート本文3（URL付き）"
}`,
        },
        {
          role: 'user',
          content: `${dateStr}の運勢ツイート案を3パターン作成してください。`,
        },
      ],
      temperature: 0.9,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content ?? '{}'
    const tweets = JSON.parse(content)

    // メール送信
    const resend = new Resend(process.env.RESEND_API_KEY)
    const toEmail = process.env.ADMIN_EMAILS ?? 'tyasuda83101028@gmail.com'

    const htmlBody = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f0f1a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #a78bfa; font-size: 20px; }
    .date { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .tweet-card { background: #1e1e2e; border: 1px solid #7c3aed44; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .tweet-num { color: #a78bfa; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
    .tweet-text { color: #e2e8f0; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
    .copy-hint { color: #64748b; font-size: 12px; margin-top: 8px; }
    .cta { background: #7c3aed; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; margin-top: 24px; }
    .footer { color: #475569; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔮 本日のツイート案</h1>
    <p class="date">${dateStr}</p>

    <div class="tweet-card">
      <div class="tweet-num">案 1</div>
      <div class="tweet-text">${tweets.tweet1 ?? ''}</div>
      <p class="copy-hint">↑ コピーしてXに投稿してください</p>
    </div>

    <div class="tweet-card">
      <div class="tweet-num">案 2</div>
      <div class="tweet-text">${tweets.tweet2 ?? ''}</div>
      <p class="copy-hint">↑ コピーしてXに投稿してください</p>
    </div>

    <div class="tweet-card">
      <div class="tweet-num">案 3</div>
      <div class="tweet-text">${tweets.tweet3 ?? ''}</div>
      <p class="copy-hint">↑ コピーしてXに投稿してください</p>
    </div>

    <a href="https://x.com/compose/tweet" class="cta">Xを開いて投稿する →</a>

    <p class="footer">Sophie 運勢占い | 自動生成 by Groq AI</p>
  </div>
</body>
</html>
    `.trim()

    await resend.emails.send({
      from: 'Sophie占い <onboarding@resend.dev>',
      to: [toEmail],
      subject: `🔮 ${dateStr}のツイート案が届きました`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true, date: dateStr })
  } catch (error) {
    console.error('Cron tweet error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
