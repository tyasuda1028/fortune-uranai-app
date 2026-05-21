import { Rating, RokuseiStar } from './types'

// ── 星座 ─────────────────────────────────────────
export function getZodiacSign(birthdate: string): string {
  const date = new Date(birthdate)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '牡羊座'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '牡牛座'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座'
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '蟹座'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '獅子座'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '乙女座'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座'
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '蠍座'
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '山羊座'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座'
  return '魚座'
}

// ── 六星占術 ─────────────────────────────────────
// 参考: https://www.plus-a.net/uranai/unmeisu/
// 算出手順:
//   1. 基準点(1975年1月=44)から生まれ年月の運命数を計算
//   2. 星数 = 運命数 - 1 + 誕生日  (61以上なら-60)
//   3. 星数の範囲 → 星人 (0-10:土星人 11-20:金星人 21-30:火星人
//                         31-40:天王星人 41-50:木星人 51-60:水星人)
//   4. 陰陽 = 生まれ年(節分前は前年)の奇偶 (奇数=＋ 偶数=−)
export function calcRokuseiStar(birthdate: string): RokuseiStar {
  const date = new Date(birthdate)
  const year  = date.getFullYear()
  const month = date.getMonth() + 1
  const day   = date.getDate()

  // 節分前（1月・2月3日まで）は陰陽判定を前年で行う
  const signYear = (month === 1 || (month === 2 && day <= 3)) ? year - 1 : year

  // 運命数を算出 (基準: 1975年1月1日 = 44)
  // 各月1日までの経過日数(ローカル日付)で計算
  const refMs     = new Date(1975, 0, 1).getTime()
  const targetMs  = new Date(year, month - 1, 1).getTime()
  const days      = Math.round((targetMs - refMs) / 86400000)
  const unmei     = ((43 + days) % 60 + 60) % 60 + 1  // 1〜60

  // 星数 (1〜60)
  let starNum = unmei - 1 + day
  if (starNum > 60) starNum -= 60

  // 星人の決定
  let starName: string
  if      (starNum <= 10) starName = '土星人'
  else if (starNum <= 20) starName = '金星人'
  else if (starNum <= 30) starName = '火星人'
  else if (starNum <= 40) starName = '天王星人'
  else if (starNum <= 50) starName = '木星人'
  else                    starName = '水星人'

  // 陰陽 (偶数年=プラス 奇数年=マイナス)
  // 十干: 甲丙戊庚壬(陽/＋)=偶数年, 乙丁己辛癸(陰/－)=奇数年
  const sign = signYear % 2 === 0 ? '（＋）' : '（−）'

  return `${starName}${sign}` as RokuseiStar
}

// ── 数秘術 ────────────────────────────────────────
export function calcLifePathNumber(birthdate: string): number {
  const digits = birthdate.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((acc, d) => acc + d, 0)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0)
  }
  return sum
}

// ── バイオリズム ──────────────────────────────────
export function calcBiorhythm(birthdate: string, targetDate: string) {
  const birth = new Date(birthdate).getTime()
  const target = new Date(targetDate).getTime()
  const days = Math.floor((target - birth) / (1000 * 60 * 60 * 24))
  const physical = Math.sin((2 * Math.PI * days) / 23)
  const emotional = Math.sin((2 * Math.PI * days) / 28)
  const intellectual = Math.sin((2 * Math.PI * days) / 33)
  const label = (v: number) => v > 0.5 ? '高い' : v > 0 ? 'やや高い' : v > -0.5 ? 'やや低い' : '低い'
  return {
    physical, emotional, intellectual,
    physicalLabel: label(physical),
    emotionalLabel: label(emotional),
    intellectualLabel: label(intellectual),
  }
}

// ── 四柱推命 ──────────────────────────────────────
const STEMS  = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/** 年柱 */
export function calcYearPillar(birthdate: string): string {
  const date = new Date(birthdate)
  let year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  // 立春（2/4頃）以前は前年
  if (month === 1 || (month === 2 && day <= 3)) year--
  const stem   = ((year - 4) % 10 + 10) % 10
  const branch = ((year - 4) % 12 + 12) % 12
  return STEMS[stem] + BRANCHES[branch]
}

/** 月柱 */
export function calcMonthPillar(birthdate: string): string {
  const date = new Date(birthdate)
  const year  = date.getFullYear()
  const month = date.getMonth() + 1
  const day   = date.getDate()

  // 節入り（簡易: 毎月6日頃）以前は前月
  let solarMonth = day < 6 ? month - 1 : month
  if (solarMonth <= 0) solarMonth += 12

  const branchIndex = (solarMonth + 1) % 12 // 寅月(2月)=2

  // 年干グループによる月干スタート
  const yearStem  = ((year - 4) % 10 + 10) % 10
  const starts    = [2, 4, 6, 8, 0] // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
  const startStem = starts[yearStem % 5]
  const monthsFromYin = (solarMonth - 2 + 12) % 12
  const stemIndex = (startStem + monthsFromYin) % 10

  return STEMS[stemIndex] + BRANCHES[branchIndex]
}

/** 日柱（甲戌日 = 1900/1/31 を基準） */
export function calcDayPillar(birthdate: string): string {
  const ref  = new Date('1900-01-31').getTime()
  const date = new Date(birthdate).getTime()
  const days = Math.floor((date - ref) / (1000 * 60 * 60 * 24))
  const stem   = ((days % 10) + 10) % 10
  const branch = (((days + 10) % 12) + 12) % 12
  return STEMS[stem] + BRANCHES[branch]
}

export function calcShichuSuimei(birthdate: string): {
  year: string; month: string; day: string; summary: string
} {
  const year  = calcYearPillar(birthdate)
  const month = calcMonthPillar(birthdate)
  const day   = calcDayPillar(birthdate)
  return {
    year, month, day,
    summary: `年柱:${year} 月柱:${month} 日柱:${day}`
  }
}

// ── 年齢 ─────────────────────────────────────────
export function calcAge(birthdate: string, referenceDate: string): number {
  const birth = new Date(birthdate)
  const ref   = new Date(referenceDate)
  let age = ref.getFullYear() - birth.getFullYear()
  const m = ref.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

// ── 週の範囲（指定日から7日間） ──────────────────
export function getWeekRange(dateStr: string): { start: string; end: string; label: string } {
  const start = new Date(dateStr)
  const end   = new Date(dateStr)
  end.setDate(end.getDate() + 6)

  const fmt = (d: Date) => {
    const y  = d.getFullYear()
    const m  = d.getMonth() + 1
    const dd = d.getDate()
    return `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }
  const fmtJP = (d: Date) => `${d.getMonth()+1}月${d.getDate()}日`
  return {
    start: fmt(start),
    end:   fmt(end),
    label: `${fmtJP(start)}〜${fmtJP(end)}`,
  }
}

// ── 月の範囲（指定日から1ヶ月先） ────────────────
export function getMonthRange(dateStr: string): { start: string; end: string; label: string } {
  const start = new Date(dateStr)
  const end   = new Date(dateStr)
  end.setMonth(end.getMonth() + 1)

  const fmt = (d: Date) => {
    const y  = d.getFullYear()
    const m  = d.getMonth() + 1
    const dd = d.getDate()
    return `${y}-${String(m).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }
  const fmtJP = (d: Date) => `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`
  return {
    start: fmt(start),
    end:   fmt(end),
    label: `${fmtJP(start)}〜${fmtJP(end)}`,
  }
}

// ── 日付フォーマット ──────────────────────────────
export function formatDateJP(dateStr: string): string {
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = ['日','月','火','水','木','金','土'][date.getDay()]
  return `${y}年${m}月${d}日（${w}）`
}

export function formatMonthJP(dateStr: string): string {
  const [y, m] = dateStr.split('-')
  return `${y}年${parseInt(m)}月`
}

export function getTodayString(): string {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getTodayMonthString(): string {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// ── 運勢スコア算出（0〜100）────────────────────────
// レーティングをAIに委ねず、計算データから忠実に決定する
export interface FortuneScores {
  overall:  { score: number; rating: Rating }
  work:     { score: number; rating: Rating }
  money:    { score: number; rating: Rating }
  love:     { score: number; rating: Rating }
  health:   { score: number; rating: Rating }
}

function scoreToRating(score: number): Rating {
  if (score >= 73) return '◎'
  if (score >= 50) return '◯'
  if (score >= 28) return '△'
  return '×'
}

/** 数秘術: 今日の日数字を1桁に還元 */
function calcDayNumber(dateStr: string): number {
  let n = dateStr.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c), 0)
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = n.toString().split('').reduce((a, c) => a + parseInt(c), 0)
  }
  return n
}

/** 六星占術サイクル: 生年月日からの60日周期で運勢段階を算出 */
function calcRokuseiCycleScore(birthdate: string, targetDate: string): number {
  const birth  = new Date(birthdate).getTime()
  const target = new Date(targetDate).getTime()
  const days   = Math.floor((target - birth) / 86400000)
  const pos    = ((days % 60) + 60) % 60  // 0〜59
  // 六星占術の運気段階 (大安・中吉・小吉・注意・凶・大凶 を10日ずつ割り当て)
  if (pos < 10) return 90   // 大安
  if (pos < 20) return 68   // 中吉
  if (pos < 30) return 52   // 小吉
  if (pos < 40) return 38   // 注意
  if (pos < 50) return 22   // 凶
  return 12                  // 大凶
}

/** 数秘術相性スコア: ライフパスナンバーと今日の数字の距離 */
function calcNumerologyScore(lifePathNumber: number, dayNumber: number): number {
  const diff = Math.abs(lifePathNumber - dayNumber)
  if (diff === 0) return 88
  if (diff === 1) return 72
  if (diff === 2) return 58
  if (diff === 3) return 46
  if (diff <= 5)  return 34
  return 20
}

export function calcFortuneScores(
  biorhythm: { physical: number; emotional: number; intellectual: number },
  lifePathNumber: number,
  birthdate: string,
  targetDate: string,
  isReigoSeijin: boolean,
): FortuneScores {
  // 各バイオリズムを 0〜100 に変換 (-1〜+1 → 0〜100)
  const phys  = (biorhythm.physical      + 1) / 2 * 100
  const emo   = (biorhythm.emotional     + 1) / 2 * 100
  const intel = (biorhythm.intellectual  + 1) / 2 * 100

  const dayNum    = calcDayNumber(targetDate)
  const numScore  = calcNumerologyScore(lifePathNumber, dayNum)
  const cycScore  = calcRokuseiCycleScore(birthdate, targetDate)

  // ── カテゴリ別スコア（重みづけ）──
  const workScore   = intel * 0.50 + phys  * 0.25 + numScore * 0.15 + cycScore * 0.10
  const moneyScore  = intel * 0.25 + phys  * 0.25 + numScore * 0.25 + cycScore * 0.25
  const loveScore   = emo   * 0.55 + phys  * 0.20 + numScore * 0.15 + cycScore * 0.10
  const healthScore = phys  * 0.55 + emo   * 0.25 + intel    * 0.10 + cycScore * 0.10

  // ── 総合スコア ──
  const rawOverall = workScore * 0.25 + moneyScore * 0.25 + loveScore * 0.25 + healthScore * 0.25

  // 霊合星人補正: 偏差を1.25倍に増幅（良い時はより良く、悪い時はより悪く）
  const amplify = (score: number) =>
    isReigoSeijin ? Math.max(0, Math.min(100, 50 + (score - 50) * 1.25)) : score

  const overall = Math.round(amplify(rawOverall))
  const work    = Math.round(amplify(workScore))
  const money   = Math.round(amplify(moneyScore))
  const love    = Math.round(amplify(loveScore))
  const health  = Math.round(amplify(healthScore))

  return {
    overall: { score: overall, rating: scoreToRating(overall) },
    work:    { score: work,    rating: scoreToRating(work)    },
    money:   { score: money,   rating: scoreToRating(money)   },
    love:    { score: love,    rating: scoreToRating(love)    },
    health:  { score: health,  rating: scoreToRating(health)  },
  }
}
