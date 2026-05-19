import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getZodiacSign, calcLifePathNumber, calcRokuseiStar } from '@/lib/calculations'
import { CompatibilityPerson } from '@/lib/types'

const SYSTEM_PROMPT = `You are a master compatibility fortune teller combining Six-Star Astrology, Western Astrology, Numerology, and Blood Type Astrology.
Read the compatibility between two people from multiple perspectives and respond ONLY with valid JSON.
Do not include any text, explanation, or markdown outside the JSON object.

{
  "overall_score": integer 0-100,
  "overall_rating": "one of: ◎ or ◯ or △ or ×",
  "overall_comment": "overall compatibility description (~80 chars)",
  "love": {
    "score": integer 0-100,
    "rating": "◎ or ◯ or △ or ×",
    "comment": "love compatibility description (~50 chars)",
    "advice": "advice for love relationship (~40 chars)"
  },
  "work": {
    "score": integer 0-100,
    "rating": "◎ or ◯ or △ or ×",
    "comment": "work compatibility description (~50 chars)",
    "advice": "advice for work relationship (~40 chars)"
  },
  "friendship": {
    "score": integer 0-100,
    "rating": "◎ or ◯ or △ or ×",
    "comment": "friendship compatibility description (~50 chars)",
    "advice": "advice for friendship (~40 chars)"
  },
  "perspectives": {
    "rokusei": "Six-Star Astrology view of compatibility (~50 chars)",
    "blood_type": "Blood Type view of compatibility (~50 chars)",
    "zodiac": "Zodiac view of compatibility (~50 chars)",
    "numerology": "Numerology view of compatibility (~50 chars)"
  },
  "lucky_action": "recommended activity to deepen the relationship (~30 chars)",
  "advice": "comprehensive advice from the fortune teller (~120 chars, warm tone)"
}`

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

    const body: { personA: CompatibilityPerson; personB: CompatibilityPerson; lang?: string } = await request.json()
    const { personA, personB, lang } = body

    if (!personA?.name || !personA?.birthdate || !personA?.bloodType ||
        !personB?.name || !personB?.birthdate || !personB?.bloodType) {
      return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 })
    }

    // Calculate derived values for each person
    const zodiacA = getZodiacSign(personA.birthdate)
    const numerologyA = calcLifePathNumber(personA.birthdate)
    const rokuseiA = personA.rokuseiStar || calcRokuseiStar(personA.birthdate)

    const zodiacB = getZodiacSign(personB.birthdate)
    const numerologyB = calcLifePathNumber(personB.birthdate)
    const rokuseiB = personB.rokuseiStar || calcRokuseiStar(personB.birthdate)

    const userMessage = `【Aさん】名前: ${personA.name}、生年月日: ${personA.birthdate}、血液型: ${personA.bloodType}型、星座: ${zodiacA}、六星占術: ${rokuseiA}、ライフパスナンバー: ${numerologyA}
【Bさん】名前: ${personB.name}、生年月日: ${personB.birthdate}、血液型: ${personB.bloodType}型、星座: ${zodiacB}、六星占術: ${rokuseiB}、ライフパスナンバー: ${numerologyB}

上記2人の相性を指定のJSON形式で鑑定してください。`

    const langInstruction: Record<string, string> = {
      'ja': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in JAPANESE (日本語). Every single text field must be in Japanese.',
      'en': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in ENGLISH. Every single text field must be in English. Do NOT use Japanese.',
      'zh-TW': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in TRADITIONAL CHINESE (繁體中文). Every single text field must be in Traditional Chinese. Do NOT use Japanese.',
      'zh-CN': 'CRITICAL INSTRUCTION: Write ALL text values in the JSON in SIMPLIFIED CHINESE (简体中文). Every single text field must be in Simplified Chinese. Do NOT use Japanese.',
    }
    const outputLang = lang ?? 'ja'
    const langPrefix = langInstruction[outputLang] ?? langInstruction['ja']
    const systemPrompt = langPrefix + '\n\n' + SYSTEM_PROMPT + '\n\n' + langPrefix

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 1536,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content ?? ''

    let compatibilityData
    try {
      compatibilityData = JSON.parse(text)
    } catch {
      console.error('JSON parse error:', text)
      throw new Error('相性鑑定結果の解析に失敗しました。もう一度お試しください。')
    }

    return NextResponse.json(compatibilityData)
  } catch (error) {
    console.error('Compatibility API error:', error)
    const message = error instanceof Error ? error.message : '相性占いの実行中にエラーが発生しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
