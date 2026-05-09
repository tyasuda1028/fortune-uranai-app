export type Rating = '◎' | '◯' | '△' | '×'

export type BloodType = 'A' | 'B' | 'O' | 'AB'

export type RokuseiStar =
  | '木星人（＋）' | '木星人（−）'
  | '水星人（＋）' | '水星人（−）'
  | '土星人（＋）' | '土星人（−）'
  | '金星人（＋）' | '金星人（−）'
  | '火星人（＋）' | '火星人（−）'
  | '天王星人（＋）' | '天王星人（−）'

export interface FortuneFormData {
  name: string
  birthdate: string         // YYYY-MM-DD
  bloodType: BloodType
  rokuseiStar: RokuseiStar
  isReigoSeijin: boolean
  isHSP: boolean
  question: string
  fortuneDate: string       // YYYY-MM-DD
}

export interface FortuneCategoryResult {
  rating: Rating
  description: string
}

export interface FortuneResult {
  overall_rating: Rating
  overall_description: string
  work_fortune: FortuneCategoryResult
  money_fortune: FortuneCategoryResult
  love_fortune: FortuneCategoryResult
  health_fortune: FortuneCategoryResult
  lucky_color: string
  lucky_color_hex: string
  todays_word: string
  advice: string
  hsp_advice?: string
  fortune_details: {
    rokusei: string
    zodiac: string
    numerology: string
    biorhythm: string
    blood_type: string
  }
}
