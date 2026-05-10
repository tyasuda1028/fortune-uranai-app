import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  getZodiacSign,
  calcLifePathNumber,
  calcBiorhythm,
  calcAge,
  calcShichuSuimei,
  formatDateJP,
  getWeekRange,
  getMonthRange,
} from '@/lib/calculations'
import { FortuneFormData } from '@/lib/types'

const SYSTEM_PROMPT = `あなたは六星占術・西洋占星術・数秘術・バイオリズム・四柱推命・血液型占いを組み合わせた日本の著名な総合占い師です。
複数の占術を統合し、「流れ・注意点・対策」の3点でわかりやすく鑑定を行います。

必ず以下のJSON形式のみで回答してください。他のテキストは一切含めないでください。
JSON以外の文字（前後の説明、マークダウンのコードブロック等）は絶対に含めないでください。

{
  "overall_rating": "◎または◯または△または×",
  "overall_flow": "総合運の流れ：この期間の運気の全体的な傾向と方向性（60文字程度）",
  "overall_caution": "総合的な注意点：特に気をつけるべき落とし穴や状況（50文字程度）",
  "overall_action": "総合的な対策：この期間に心がけると良い行動・姿勢（50文字程度）",
  "work_fortune": {
    "rating": "◎または◯または△または×",
    "flow": "仕事運の流れ（50文字程度）",
    "caution": "仕事面の注意点（40文字程度）",
    "action": "仕事面の対策・アドバイス（40文字程度）"
  },
  "money_fortune": {
    "rating": "◎または◯または△または×",
    "flow": "金運の流れ（50文字程度）",
    "caution": "金運の注意点（40文字程度）",
    "action": "金運の対策・アドバイス（40文字程度）"
  },
  "love_fortune": {
    "rating": "◎または◯または△または×",
    "flow": "恋愛・対人運の流れ（50文字程度）",
    "caution": "恋愛・対人面の注意点（40文字程度）",
    "action": "恋愛・対人面の対策・アドバイス（40文字程度）"
  },
  "health_fortune": {
    "rating": "◎または◯または△または×",
    "flow": "健康運の流れ（50文字程度）",
    "caution": "健康面の注意点（40文字程度）",
    "action": "健康面の対策・アドバイス（40文字程度）"
  },
  "lucky_color": "ラッキーカラーの日本語名",
  "lucky_color_hex": "#6桁16進数カラーコード",
  "todays_word": "「この期間を象徴する印象的で前向きな一言」",
  "advice": "占い師からの総合メッセージ（150文字程度、具体的かつ温かみのある言葉で）",
  "fortune_details": {
    "rokusei": "六星占術からの解説（60文字程度）",
    "zodiac": "西洋占星術からの解説（60文字程度）",
    "numerology": "数秘術からの解説（60文字程度）",
    "biorhythm": "バイオリズムからの解説（60文字程度）",
    "blood_type": "血液型占いからの解説（60文字程度）",
    "shichusuimei": "四柱推命からの解説（60文字程度）"
  }
}`

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。.env.localにGROQ_API_KEYを設定してください。' },
        { status: 500 }
      )
    }

    const body: FortuneFormData = await request.json()
    const { name, birthdate, bloodType, rokuseiStar, isReigoSeijin, question, fortuneDate, fortunePeriod } = body

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

${question ? `【ご質問・お悩み】\n${question}` : ''}

上記の情報をすべて考慮した上で、指定のJSON形式で${periodKind}の総合的な運勢鑑定を行ってください。
    `.trim()

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
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

    return NextResponse.json(fortuneData)
  } catch (error) {
    console.error('Fortune API error:', error)
    const message = error instanceof Error ? error.message : '占いの実行中にエラーが発生しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
