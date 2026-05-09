import { RokuseiStar } from './types'

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

export function calcRokuseiStar(birthdate: string): RokuseiStar {
  const date = new Date(birthdate)
  let year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 節分（2月4日）以前は前年で計算
  if (month === 1 || (month === 2 && day <= 3)) {
    year--
  }

  const starIndex = year % 6
  const starNames = ['天王星人', '木星人', '水星人', '土星人', '金星人', '火星人']
  const star = starNames[starIndex]
  const sign = year % 2 === 1 ? '（＋）' : '（−）'

  return `${star}${sign}` as RokuseiStar
}

export function calcLifePathNumber(birthdate: string): number {
  const digits = birthdate.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((acc, d) => acc + d, 0)

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0)
  }
  return sum
}

export function calcBiorhythm(birthdate: string, targetDate: string): {
  physical: number
  emotional: number
  intellectual: number
  physicalLabel: string
  emotionalLabel: string
  intellectualLabel: string
} {
  const birth = new Date(birthdate).getTime()
  const target = new Date(targetDate).getTime()
  const days = Math.floor((target - birth) / (1000 * 60 * 60 * 24))

  const physical = Math.sin((2 * Math.PI * days) / 23)
  const emotional = Math.sin((2 * Math.PI * days) / 28)
  const intellectual = Math.sin((2 * Math.PI * days) / 33)

  const label = (val: number) => {
    if (val > 0.5) return '高い'
    if (val > 0) return 'やや高い'
    if (val > -0.5) return 'やや低い'
    return '低い'
  }

  return {
    physical,
    emotional,
    intellectual,
    physicalLabel: label(physical),
    emotionalLabel: label(emotional),
    intellectualLabel: label(intellectual),
  }
}

export function calcAge(birthdate: string, referenceDate: string): number {
  const birth = new Date(birthdate)
  const ref = new Date(referenceDate)
  let age = ref.getFullYear() - birth.getFullYear()
  const m = ref.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) age--
  return age
}

export function formatDateJP(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日（${weekday}）`
}

export function getTodayString(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
