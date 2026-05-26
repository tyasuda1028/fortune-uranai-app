import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ── 占い組み合わせパターン（7種・日付でローテーション）────────────────
const PATTERNS = [
  {
    title: '六星占術×星座×血液型',
    hashtags: '#六星占術 #総合占い',
    systemPrompt: `今日の「六星占術×星座×血液型」三重総合運気ランキング（ベスト10）を作成します。

【六星占術 12タイプ】土星人(+/-) 金星人(+/-) 火星人(+/-) 天王星人(+/-) 木星人(+/-) 水星人(+/-)
【12星座】♈おひつじ♉おうし♊ふたご♋かに♌しし♍おとめ♎てんびん♏さそり♐いて♑やぎ♒みずがめ♓うお
【血液型】A B O AB

1行フォーマット：「1位 金星人+×♏さそり座×A型」
ヘッダー：「✨今日の運気ベスト10✨」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '六星占術×星座×血液型 三重総合運気ランキング（ベスト10）',
  },
  {
    title: '六星占術×血液型',
    hashtags: '#六星占術 #血液型占い',
    systemPrompt: `今日の「六星占術×血液型」総合運気ランキング（ベスト10）を作成します。

【六星占術 12タイプ】土星人(+/-) 金星人(+/-) 火星人(+/-) 天王星人(+/-) 木星人(+/-) 水星人(+/-)
【血液型】A B O AB（合計48通り）

1行フォーマット：「1位 金星人+×A型」
ヘッダー：「🩸今日の六星×血液型ベスト10🩸」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '六星占術×血液型 総合運気ランキング（ベスト10）',
  },
  {
    title: '西洋占星術×数秘術',
    hashtags: '#星座占い #数秘術',
    systemPrompt: `今日の「西洋占星術×数秘術」総合運気ランキング（ベスト10）を作成します。

【12星座】♈おひつじ♉おうし♊ふたご♋かに♌しし♍おとめ♎てんびん♏さそり♐いて♑やぎ♒みずがめ♓うお
【数秘術ライフパスナンバー】1 2 3 4 5 6 7 8 9 11 22（合計132通り）

1行フォーマット：「1位 ♏さそり座×ナンバー7」
ヘッダー：「🔢今日の星座×数秘術ベスト10🔢」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '西洋占星術×数秘術 総合運気ランキング（ベスト10）',
  },
  {
    title: '六星占術×星座',
    hashtags: '#六星占術 #星座占い',
    systemPrompt: `今日の「六星占術×西洋占星術（星座）」総合運気ランキング（ベスト10）を作成します。

【六星占術 12タイプ】土星人(+/-) 金星人(+/-) 火星人(+/-) 天王星人(+/-) 木星人(+/-) 水星人(+/-)
【12星座】♈おひつじ♉おうし♊ふたご♋かに♌しし♍おとめ♎てんびん♏さそり♐いて♑やぎ♒みずがめ♓うお

1行フォーマット：「1位 金星人+×♏さそり座」
ヘッダー：「⭐今日の六星×星座ベスト10⭐」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '六星占術×西洋占星術 総合運気ランキング（ベスト10）',
  },
  {
    title: '星座×血液型×数秘術',
    hashtags: '#星座占い #数秘術',
    systemPrompt: `今日の「西洋占星術×血液型×数秘術」三重総合運気ランキング（ベスト10）を作成します。

【12星座】♈おひつじ♉おうし♊ふたご♋かに♌しし♍おとめ♎てんびん♏さそり♐いて♑やぎ♒みずがめ♓うお
【血液型】A B O AB
【数秘術ライフパスナンバー】1〜9

1行フォーマット：「1位 ♏さそり座×A型×3」
ヘッダー：「✨今日の星座×血液型×数秘ベスト10✨」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '西洋占星術×血液型×数秘術 三重総合運気ランキング（ベスト10）',
  },
  {
    title: '六星占術×数秘術',
    hashtags: '#六星占術 #数秘術',
    systemPrompt: `今日の「六星占術×数秘術」総合運気ランキング（ベスト10）を作成します。

【六星占術 12タイプ】土星人(+/-) 金星人(+/-) 火星人(+/-) 天王星人(+/-) 木星人(+/-) 水星人(+/-)
【数秘術ライフパスナンバー】1 2 3 4 5 6 7 8 9 11 22

1行フォーマット：「1位 金星人+×ナンバー7」
ヘッダー：「🔢今日の六星×数秘術ベスト10🔢」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '六星占術×数秘術 総合運気ランキング（ベスト10）',
  },
  {
    title: '星座×血液型',
    hashtags: '#星座占い #血液型占い',
    systemPrompt: `今日の「西洋占星術×血液型」総合運気ランキング（ベスト10）を作成します。

【12星座】♈おひつじ♉おうし♊ふたご♋かに♌しし♍おとめ♎てんびん♏さそり♐いて♑やぎ♒みずがめ♓うお
【血液型】A B O AB（合計48通り）

1行フォーマット：「1位 ♏さそり座×A型」
ヘッダー：「🌟今日の星座×血液型ベスト10🌟」
CTA：「あなたの組み合わせは何位？👇」`,
    userPrompt: '西洋占星術×血液型 総合運気ランキング（ベスト10）',
  },
]

const COMMON_RULES = `
各ツイートの共通ルール：
- 必ず日本語で書く
- Twitterの文字カウントルール：日本語1文字=1、英数字1文字=1、URLは23文字、絵文字は2文字
- 合計280文字以内に収めること（厳守）
- 上位10位を「1位〜10位」の形式で表示（コメントなし・余分な絵文字なし）
- 末尾に「🔮 https://sophie-uranai.vercel.app」を追加すること
- 3パターンとも完全に異なるランキングにすること

以下のJSON形式で返してください：
{
  "tweet1": "ツイート本文1（URL付き）",
  "tweet2": "ツイート本文2（URL付き）",
  "tweet3": "ツイート本文3（URL付き）"
}`

// 毎朝6時JST（21:00 UTC）に実行
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

    // 日付ベースでパターンをローテーション（7日周期）
    const dayIndex = Math.floor(jstDate.getTime() / (1000 * 60 * 60 * 24))
    const pattern = PATTERNS[dayIndex % PATTERNS.length]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `あなたは運勢占いアプリ「Sophie」の公式Xアカウント担当者です。
${pattern.systemPrompt}
${COMMON_RULES}`,
        },
        {
          role: 'user',
          content: `${dateStr}の${pattern.userPrompt}ツイート案を3パターン作成してください。毎日異なる組み合わせになるよう、ランダムに順位を決めてください。ハッシュタグは「${pattern.hashtags}」を使ってください。`,
        },
      ],
      temperature: 0.95,
      max_tokens: 1000,
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
    .pattern-badge { display: inline-block; background: #7c3aed33; border: 1px solid #7c3aed66; color: #a78bfa; font-size: 12px; padding: 3px 10px; border-radius: 20px; margin-bottom: 8px; }
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
    <h1>🔮 本日のランキングツイート案</h1>
    <div class="pattern-badge">✨ 今日のパターン：${pattern.title}</div>
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

    <p class="footer">Sophie 運勢占い | 自動生成 by Groq AI｜パターン ${(dayIndex % PATTERNS.length) + 1}/7</p>
  </div>
</body>
</html>
    `.trim()

    await resend.emails.send({
      from: 'Sophie占い <onboarding@resend.dev>',
      to: [toEmail],
      subject: `🔮 ${dateStr}【${pattern.title}】ベスト10ツイート案`,
      html: htmlBody,
    })

    return NextResponse.json({ success: true, date: dateStr, pattern: pattern.title })
  } catch (error) {
    console.error('Cron tweet error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
