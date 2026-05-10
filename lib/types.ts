export type Rating = '◎' | '◯' | '△' | '×'
export type BloodType = 'A' | 'B' | 'O' | 'AB'
export type FortunePeriod = 'day' | 'week' | 'month'

export type RokuseiStar =
  | '木星人（＋）' | '木星人（−）'
  | '水星人（＋）' | '水星人（−）'
  | '土星人（＋）' | '土星人（−）'
  | '金星人（＋）' | '金星人（−）'
  | '火星人（＋）' | '火星人（−）'
  | '天王星人（＋）' | '天王星人（−）'

export interface FortuneFormData {
  name: string
  birthdate: string
  bloodType: BloodType
  rokuseiStar: RokuseiStar | ''
  isReigoSeijin: boolean
  question: string
  fortuneDate: string      // YYYY-MM-DD
  fortunePeriod: FortunePeriod
}

export interface FortuneCategoryResult {
  rating: Rating
  flow: string      // 流れ
  caution: string   // 注意点
  action: string    // 対策
}

export interface FortuneResult {
  overall_rating: Rating
  overall_flow: string      // 総合の流れ
  overall_caution: string   // 総合の注意点
  overall_action: string    // 総合の対策
  work_fortune: FortuneCategoryResult
  money_fortune: FortuneCategoryResult
  love_fortune: FortuneCategoryResult
  health_fortune: FortuneCategoryResult
  lucky_color: string
  lucky_color_hex: string
  todays_word: string
  advice: string
  fortune_details: {
    rokusei: string
    zodiac: string
    numerology: string
    biorhythm: string
    blood_type: string
    shichusuimei: string
  }
}
