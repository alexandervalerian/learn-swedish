export interface CardState {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: string // YYYY-MM-DD
  lastReviewed: string | null
}

// 0=Again, 1=Hard, 2=Good, 3=Easy
export type Rating = 0 | 1 | 2 | 3

export function today(): string {
  return new Date().toISOString().split('T')[0]!
}

export function defaultCardState(): CardState {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: today(),
    lastReviewed: null
  }
}

export function updateCard(card: CardState, rating: Rating): CardState {
  // Map ratings to SM-2 quality scores: Again→0, Hard→3, Good→4, Easy→5
  const quality = [0, 3, 4, 5][rating]!

  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    // Failed: restart
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)

    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    )
    repetitions++
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextDate.toISOString().split('T')[0]!,
    lastReviewed: today()
  }
}

export function isDue(card: CardState): boolean {
  return card.nextReview <= today()
}

export function isMastered(card: CardState): boolean {
  return card.interval >= 21 && card.repetitions > 0
}

export const RATING_LABELS: Record<Rating, string> = {
  0: 'Nochmal',
  1: 'Schwer',
  2: 'Gut',
  3: 'Leicht'
}

export const RATING_COLORS: Record<Rating, string> = {
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-orange-500 hover:bg-orange-600',
  2: 'bg-swedish-blue hover:bg-swedish-blue-dark',
  3: 'bg-green-500 hover:bg-green-600'
}
