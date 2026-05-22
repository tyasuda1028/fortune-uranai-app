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

    // 六星占術×星座×血液型 総合運気ランキング ベスト5ツイート案を3パターン生成
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `あなたは運勢占いアプリ「Sophie」の公式Xアカウント担当者です。
毎朝、フォロワーに向けて「六星占術×星座×血液型」の三重総合運気ランキング（ベスト5）をツイートします。

【六星占術 12タイプ】
土星人(+) 土星人(-) 金星人(+) 金星人(-) 火星人(+) 火星人(-)
天王星人(+) 天王星人(-) 木星人(+) 木星人(-) 水星人(+) 水星人(-)

【12星座】
おひつじ座♈ おうし座♉ ふたご座♊ かに座♋ しし座♌ おとめ座♍
てんびん座♎ さそり座♏ いて座♐ やぎ座♑ みずがめ座♒ うお座♓

【血液型】A型 B型 O型 AB型

3パターンのツイート案を作成してください（パターンごとに完全に異なるランキングにすること）。

各ツイートのルール：
- 必ず日本語で書く
- URL込みで280文字以内（URLは約23文字として計算）
- 上位5位を「1位〜5位」の形式で、六星占術タイプ×星座×血液型の組み合わせで表示
- 各順位に絵文字と一言運勢コメント（5文字以内）を付ける
- 「あなたの組み合わせは何位？」などアプリへ誘導する文を入れる
- ハッシュタグを2個含める（例: #六星占術 #総合占い）
- 末尾に「🔮 https://sophie-uranai.vercel.app」を追加すること
- 改行を使い読みやすくすること

ツイート例（参考フォーマット・文字数の目安）：
🔮今日の総合運気ベスト5🔮
1位 金星人+×♏さそり座×A型 ✨最強
2位 木星人-×♈おひつじ座×O型 🌟絶好調
3位 火星人+×♊ふたご座×B型 ⭐急上昇
4位 土星人-×♋かに座×AB型 💫愛運◎
5位 水星人+×♒みずがめ座×A型 🌙金運↑

あなたの組み合わせは何位？
🔮 https://sophie-uranai.vercel.app
#六星占術 #総合占い

以下のJSON形式で返してください：
{
  "tweet1": "ツイート本文1（URL付き）",
  "tweet2": "ツイート本文2（URL付き）",
  "tweet3": "ツイート本文3（URL付き）"
}`,
        },
        {
          role: 'user',
          content: `${dateStr}の六星占術×星座×血液型 三重総合運気ランキング（ベスト5）ツイート案を3パターン作成してください。毎日異なる組み合わせになるよう、ランダムに選んでください。`,
        },
      ],
      temperature: 0.95,
      max_tokens: 900,
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
    <h1>🔮 本日の六星占術×星座×血液型 総合ランキング ベスト5</h1>
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
      subject: `🔮 ${dateStr}の三重総合ランキング ベスト5ツイート案`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true, date: dateStr })
  } catch (error) {
    console.error('Cron tweet error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
