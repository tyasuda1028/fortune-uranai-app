import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  getZodiacSign,
  calcLifePathNumber,
  calcBiorhythm,
  calcAge,
  formatDateJP,
} from '@/lib/calculations'
import { FortuneFormData } from '@/lib/types'

const client = new Anthropic()

const SYSTEM_PROMPT = `あなたは日本の著名な占い師です。以下の複数の占術を組み合わせて、詳細な運勢鑑定を行います。

使用する占術：
1. 六星占術（細木数子式）- 提供された星人タイプを使用
2. 西洋占星術 - 星座に基づく運勢
3. 数秘術 - ライフパスナンバーに基づく運勢
4. バイオリズム - 身体・感情・知性の波
5. 宿曜占星術 - 生年月日から割り出した本命宿
6. 血液型占い - 血液型の傾向

必ず以下のJSON形式のみで回答してください。他のテキストは一切含めないでください。
JSON以外の文字（前後の説明、マークダウンのコードブロック等）は絶対に含めないでください。

{
  "overall_rating": "◎または◯または△または×",
  "overall_description": "総合運の説明（100文字程度）",
  "work_fortune": {
    "rating": "◎または◯または△または×",
    "description": "仕事運の詳細（80文字程度）"
  },
  "money_fortune": {
    "rating": "◎または◯または△または×",
    "description": "金運の詳細（80文字程度）"
  },
  "love_fortune": {
    "rating": "◎または◯または△または×",
    "description": "恋愛・対人運の詳細（80文字程度）"
  },
  "health_fortune": {
    "rating": "◎または◯または△または×",
    "description": "健康運の詳細（80文字程度）"
  },
  "lucky_color": "ラッキーカラーの日本語名",
  "lucky_color_hex": "#6桁16進数カラーコード",
  "todays_word": "「今日のひと言（印象的で前向きな一言）」",
  "advice": "今日の総合アドバイス（120文字程度、具体的に）",
  "hsp_advice": "HSS型HSP向け特別アドバイス（isHSPがtrueの場合のみ記述、falseの場合は空文字）",
  "fortune_details": {
    "rokusei": "六星占術の観点からの解説（60文字程度）",
    "zodiac": "西洋占星術の観点からの解説（60文字程度）",
    "numerology": "数秘術の観点からの解説（60文字程度）",
    "biorhythm": "バイオリズムの観点からの解説（60文字程度）",
    "blood_type": "血液型占いの観点からの解説（60文字程度）"
  }
}`

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。.env.localにANTHROPIC_API_KEYを設定してください。' },
        { status: 500 }
      )
    }

    const body: FortuneFormData = await request.json()
    const { name, birthdate, bloodType, rokuseiStar, isReigoSeijin, isHSP, question, fortuneDate } = body

    if (!name || !birthdate || !bloodType || !rokuseiStar || !fortuneDate) {
      return NextResponse.json({ error: '必須項目が不足しています。' }, { status: 400 })
    }

    const zodiac = getZodiacSign(birthdate)
    const lifePathNumber = calcLifePathNumber(birthdate)
    const biorhythm = calcBiorhythm(birthdate, fortuneDate)
    const age = calcAge(birthdate, fortuneDate)
    const formattedDate = formatDateJP(fortuneDate)
    const formattedBirthdate = formatDateJP(birthdate)

    const userMessage = `
以下の方の${formattedDate}の運勢を占ってください。

【基本情報】
- お名前: ${name}さん
- 生年月日: ${formattedBirthdate}（${age}歳）
- 血液型: ${bloodType}型
- 星座: ${zodiac}
- 六星占術: ${rokuseiStar}${isReigoSeijin ? '・霊合星人' : ''}
- HSS型HSP: ${isHSP ? 'はい（繊細かつ刺激を求めるタイプ）' : 'いいえ'}

【算出データ】
- ライフパスナンバー（数秘術）: ${lifePathNumber}
- バイオリズム（${formattedDate}）:
  - 身体リズム: ${biorhythm.physicalLabel}（${(biorhythm.physical * 100).toFixed(0)}%）
  - 感情リズム: ${biorhythm.emotionalLabel}（${(biorhythm.emotional * 100).toFixed(0)}%）
  - 知性リズム: ${biorhythm.intellectualLabel}（${(biorhythm.intellectual * 100).toFixed(0)}%）

${question ? `【今日のご質問・お悩み】\n${question}` : ''}

上記の情報をすべて考慮した上で、指定のJSON形式で総合的な運勢鑑定を行ってください。
    `.trim()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('予期しないレスポンス形式です。')
    }

    let fortuneData
    try {
      // Strip any markdown code blocks if present
      const text = content.text.replace(/```json\n?|\n?```/g, '').trim()
      fortuneData = JSON.parse(text)
    } catch {
      console.error('JSON parse error:', content.text)
      throw new Error('占い結果の解析に失敗しました。もう一度お試しください。')
    }

    return NextResponse.json(fortuneData)
  } catch (error) {
    console.error('Fortune API error:', error)
    const message = error instanceof Error ? error.message : '占いの実行中にエラーが発生しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
