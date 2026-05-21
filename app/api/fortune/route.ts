import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getZodiacSign,
  calcLifePathNumber,
  calcBiorhythm,
  calcAge,
  calcShichuSuimei,
  calcFortuneScores,
  formatDateJP,
  getWeekRange,
  getMonthRange,
} from '@/lib/calculations'
import { FortuneFormData } from '@/lib/types'
import { getSubscriptionStatus, incrementUsage } from '@/lib/subscription'

const FREE_USAGE_LIMIT = 5

const SYSTEM_PROMPT_BASE = `You are a master fortune teller combining Six-Star Astrology, Western Astrology, Numerology, Biorhythm, Four Pillars of Destiny, Blood Type Astrology, and Tarot.
You integrate multiple divination methods and provide readings focusing on three points: Flow, Caution, and Action.

CRITICAL: The ratings (overall_rating, work_fortune.rating, money_fortune.rating, love_fortune.rating, health_fortune.rating) are PRE-CALCULATED from actual biorhythm, numerology, and Six-Star Astrology data and will be injected into your prompt. You MUST use EXACTLY those ratings — do not change them. Generate all text content to naturally explain and match those pre-calculated ratings.

Respond ONLY with valid JSON. Do not include any text, explanation, or markdown outside the JSON object.

{
  "overall_rating": "one of: ◎ or ◯ or △ or ×",
  "overall_reason": "reason for overall rating based on multiple methods (~80 chars)",
  "overall_flow": "overall fortune flow and trend for this period (~60 chars)",
  "overall_caution": "main caution or pitfall to watch out for (~50 chars)",
  "overall_action": "recommended action or mindset for this period (~50 chars)",
  "work_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "career/work fortune flow (~50 chars)",
    "caution": "caution for work (~40 chars)",
    "action": "advice for work (~40 chars)"
  },
  "money_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "financial fortune flow (~50 chars)",
    "caution": "caution for finances (~40 chars)",
    "action": "advice for finances (~40 chars)"
  },
  "love_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "love and relationship fortune flow (~50 chars)",
    "caution": "caution for relationships (~40 chars)",
    "action": "advice for relationships (~40 chars)"
  },
  "health_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "health fortune flow (~50 chars)",
    "caution": "caution for health (~40 chars)",
    "action": "advice for health (~40 chars)"
  },
  "tarot_reading": {
    "card1": {
      "name": "card name with both local name and English name, e.g. 愚者（The Fool）",
      "position": "Upright or Reversed (in output language)",
      "role": "Current Situation (in output language)",
      "meaning": "meaning and interpretation of this card (~50 chars)"
    },
    "card2": {
      "name": "card name with both local name and English name",
      "position": "Upright or Reversed (in output language)",
      "role": "Challenge / Obstacle (in output language)",
      "meaning": "meaning and interpretation of this card (~50 chars)"
    },
    "card3": {
      "name": "card name with both local name and English name",
      "position": "Upright or Reversed (in output language)",
      "role": "Advice (in output language)",
      "meaning": "meaning and interpretation of this card (~50 chars)"
    },
    "summary": "overall tarot message combining all 3 cards (~80 chars)"
  },
  "lucky_color": "lucky color name",
  "lucky_color_hex": "#6-digit hex color code",
  "todays_word": "an inspiring keyword or phrase representing this period",
  "advice": "comprehensive message from the fortune teller (~150 chars, warm and specific)",
  "fortune_details": {
    "rokusei": "Six-Star Astrology insight (~60 chars)",
    "zodiac": "Western Astrology insight (~60 chars)",
    "numerology": "Numerology insight (~60 chars)",
    "biorhythm": "Biorhythm insight (~60 chars)",
    "blood_type": "Blood Type insight (~60 chars)",
    "shichusuimei": "Four Pillars insight (~60 chars)"
  }
}`

const SYSTEM_PROMPT = SYSTEM_PROMPT_BASE

// Free plan: no tarot_reading and no fortune_details fields
const SYSTEM_PROMPT_FREE_BASE = `You are a master fortune teller combining Six-Star Astrology, Western Astrology, Numerology, Biorhythm, Four Pillars of Destiny, and Blood Type Astrology.
You integrate multiple divination methods and provide readings focusing on three points: Flow, Caution, and Action.

CRITICAL: The ratings (overall_rating, work_fortune.rating, money_fortune.rating, love_fortune.rating, health_fortune.rating) are PRE-CALCULATED from actual biorhythm, numerology, and Six-Star Astrology data and will be injected into your prompt. You MUST use EXACTLY those ratings — do not change them. Generate all text content to naturally explain and match those pre-calculated ratings.

Respond ONLY with valid JSON. Do not include any text, explanation, or markdown outside the JSON object.

{
  "overall_rating": "one of: ◎ or ◯ or △ or ×",
  "overall_reason": "reason for overall rating based on multiple methods (~80 chars)",
  "overall_flow": "overall fortune flow and trend for this period (~60 chars)",
  "overall_caution": "main caution or pitfall to watch out for (~50 chars)",
  "overall_action": "recommended action or mindset for this period (~50 chars)",
  "work_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "career/work fortune flow (~50 chars)",
    "caution": "caution for work (~40 chars)",
    "action": "advice for work (~40 chars)"
  },
  "money_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "financial fortune flow (~50 chars)",
    "caution": "caution for finances (~40 chars)",
    "action": "advice for finances (~40 chars)"
  },
  "love_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "love and relationship fortune flow (~50 chars)",
    "caution": "caution for relationships (~40 chars)",
    "action": "advice for relationships (~40 chars)"
  },
  "health_fortune": {
    "rating": "◎ or ◯ or △ or ×",
    "flow": "health fortune flow (~50 chars)",
    "caution": "caution for health (~40 chars)",
    "action": "advice for health (~40 chars)"
  },
  "lucky_color": "lucky color name",
  "lucky_color_hex": "#6-digit hex color code",
  "todays_word": "an inspiring keyword or phrase representing this period",
  "advice": "comprehensive message from the fortune teller (~150 chars, warm and specific)"
}`

const SYSTEM_PROMPT_FREE = SYSTEM_PROMPT_FREE_BASE

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。.env.localにGROQ_API_KEYを設定してください。' },
        { status: 500 }
      )
    }

    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'ログインしてから占いをお試しください。', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Subscription / usage check
    const subStatus = await getSubscriptionStatus()
    const isPremium = subStatus.plan === 'premium'

    if (!isPremium && subStatus.usageCount >= FREE_USAGE_LIMIT) {
      return NextResponse.json(
        { error: '無料枠を使い切りました。プレミアムプランにアップグレードして無制限でご利用ください。', code: 'USAGE_LIMIT' },
        { status: 403 }
      )
    }

    const body: FortuneFormData = await request.json()
    const { name, birthdate, bloodType, rokuseiStar, isReigoSeijin, question, fortuneDate, fortunePeriod, lang } = body

    if (!name || !birthdate || !bloodType || !rokuseiStar || !fortuneDate) {
      return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 })
    }

    const period = fortunePeriod ?? 'day'
    const refDate = period === 'month' ? `${fortuneDate}-01` : fortuneDate

    const zodiac = getZodiacSign(birthdate)
    const lifePathNumber = calcLifePathNumber(birthdate)
    const biorhythm = calcBiorhythm(birthdate, refDate)
    const age = calcAge(birthdate, refDate)
    const shichusuimei = calcShichuSuimei(birthdate)
    const formattedBirthdate = formatDateJP(birthdate)

    // ── 運勢スコアをコードで算出（AIに委ねない）──
    const fortuneScores = calcFortuneScores(
      biorhythm,
      lifePathNumber,
      birthdate,
      refDate,
      isReigoSeijin ?? false,
    )

    // Period-specific label
    let periodLabel: string
    let periodKind: string
    if (period === 'week') {
      const weekRange = getWeekRange(fortuneDate)
      periodLabel = `${weekRange.label}（7日間）`
      periodKind = '週運'
    } else if (period === 'month') {
      const monthRange = getMonthRange(fortuneDate)
      periodLabel = `${monthRange.label}（1ヶ月）`
      periodKind = '月運'
    } else {
      periodLabel = formatDateJP(fortuneDate)
      periodKind = '日運'
    }

    const userMessage = `
以下の方の【${periodKind}】を占ってください。対象期間：${periodLabel}

【基本情報】
- お名前: ${name}さん
- 生年月日: ${formattedBirthdate}（${age}歳）
- 血液型: ${bloodType}型
- 星座: ${zodiac}
- 六星占術: ${rokuseiStar}${isReigoSeijin ? '・霊合星人' : ''}

【算出データ】
- ライフパスナンバー（数秘術）: ${lifePathNumber}
- 四柱推命: ${shichusuimei.summary}
- バイオリズム（${periodLabel}）:
  - 身体リズム: ${biorhythm.physicalLabel}（${(biorhythm.physical * 100).toFixed(0)}%）
  - 感情リズム: ${biorhythm.emotionalLabel}（${(biorhythm.emotional * 100).toFixed(0)}%）
  - 知性リズム: ${biorhythm.intellectualLabel}（${(biorhythm.intellectual * 100).toFixed(0)}%）

【計算済みレーティング（変更禁止・必ずこの値を使用すること）】
- overall_rating: "${fortuneScores.overall.rating}"  （総合スコア: ${fortuneScores.overall.score}/100）
- work_fortune.rating: "${fortuneScores.work.rating}"  （仕事スコア: ${fortuneScores.work.score}/100）
- money_fortune.rating: "${fortuneScores.money.rating}"  （金運スコア: ${fortuneScores.money.score}/100）
- love_fortune.rating: "${fortuneScores.love.rating}"  （恋愛スコア: ${fortuneScores.love.score}/100）
- health_fortune.rating: "${fortuneScores.health.rating}"  （健康スコア: ${fortuneScores.health.score}/100）

${question ? `【ご質問・お悩み】\n${question}` : ''}

上記の計算済みレーティングをJSONにそのまま使用し、各レーティングに合った${periodKind}の鑑定文を生成してください。
    `.trim()

    const langInstruction: Record<string, string> = {
      'ja': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in JAPANESE (日本語). Every single text field must be in Japanese.',
      'en': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in ENGLISH. Every single text field must be in English. Do NOT use Japanese or any other language.',
      'zh-TW': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in TRADITIONAL CHINESE (繁體中文). Every single text field must be in Traditional Chinese. Do NOT use Japanese.',
      'zh-CN': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in SIMPLIFIED CHINESE (简体中文). Every single text field must be in Simplified Chinese. Do NOT use Japanese.',
    }
    const outputLang = lang ?? 'ja'
    const langPrefix = langInstruction[outputLang] ?? langInstruction['ja']
    const basePrompt = isPremium ? SYSTEM_PROMPT : SYSTEM_PROMPT_FREE
    const systemPrompt = langPrefix + '\n\n' + basePrompt + '\n\n' + langPrefix

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? ''

    let fortuneData
    try {
      fortuneData = JSON.parse(text)
    } catch {
      console.error('JSON parse error:', text)
      throw new Error('占い結果の解析に失敗しました。もう一度お試しください。')
    }

    // Increment usage for non-premium users
    if (!isPremium) {
      await incrementUsage(userId)
    }

    const newUsageCount = isPremium ? subStatus.usageCount : subStatus.usageCount + 1
    const usageRemaining = isPremium ? null : Math.max(0, FREE_USAGE_LIMIT - newUsageCount)

    return NextResponse.json({
      ...fortuneData,
      plan: subStatus.plan,
      usageCount: newUsageCount,
      usageRemaining,
    })
  } catch (error) {
    console.error('Fortune API error:', error)
    const message = error instanceof Error ? error.message : '占いの実行中にエラーが発生しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
