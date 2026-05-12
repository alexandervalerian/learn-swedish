import { defineStore } from 'pinia'
import {
  defaultCardState,
  updateCard,
  isDue,
  isMastered,
  today,
  type CardState,
  type Rating
} from '~/composables/useSpacedRepetition'

const STORAGE_KEY = 'swedish_progress'
export const DAILY_NEW_LIMIT = 10
export const DAILY_CARD_TARGET = 40

interface StoredData {
  cards: Record<string, CardState>
  streak: { lastDate: string | null; count: number }
  newToday: { date: string; count: number }
  dailyProgress: { date: string; remaining: number; learned: number; learnedIds: string[] }
  nochmalIds: string[]
}

export const useProgressStore = defineStore('progress', () => {
  const cards = ref<Record<string, CardState>>({})
  const streak = ref<{ lastDate: string | null; count: number }>({
    lastDate: null,
    count: 0
  })
  const newToday = ref<{ date: string; count: number }>({
    date: '',
    count: 0
  })
  const dailyProgress = ref<{ date: string; remaining: number; learned: number; learnedIds: string[] }>({
    date: today(),
    remaining: DAILY_CARD_TARGET,
    learned: 0,
    learnedIds: []
  })
  const nochmalIds = ref<string[]>([])

  function syncDailyProgressDate() {
    const todayStr = today()
    if (dailyProgress.value.date === todayStr) return
    dailyProgress.value = {
      date: todayStr,
      remaining: DAILY_CARD_TARGET,
      learned: 0,
      learnedIds: []
    }
  }

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data: StoredData = JSON.parse(raw)
      cards.value = data.cards ?? {}
      streak.value = data.streak ?? { lastDate: null, count: 0 }
      newToday.value = data.newToday ?? { date: '', count: 0 }
      dailyProgress.value = {
        date: data.dailyProgress?.date ?? today(),
        remaining: data.dailyProgress?.remaining ?? DAILY_CARD_TARGET,
        learned: data.dailyProgress?.learned ?? 0,
        learnedIds: data.dailyProgress?.learnedIds ?? []
      }
      nochmalIds.value = data.nochmalIds ?? []
      syncDailyProgressDate()
    } catch {
      // corrupted storage — start fresh
    }
  }

  function save() {
    const data: StoredData = {
      cards: cards.value,
      streak: streak.value,
      newToday: newToday.value,
      dailyProgress: dailyProgress.value,
      nochmalIds: nochmalIds.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function getCard(id: string): CardState {
    return cards.value[id] ?? defaultCardState()
  }

  function newCardsSeenToday(): number {
    return newToday.value.date === today() ? newToday.value.count : 0
  }

  function dailyRemaining(): number {
    syncDailyProgressDate()
    return dailyProgress.value.remaining
  }

  function dailyLearnedToday(): number {
    syncDailyProgressDate()
    return dailyProgress.value.learned
  }

  function dailyLearnedIds(): string[] {
    syncDailyProgressDate()
    return dailyProgress.value.learnedIds
  }

  function rateCard(id: string, rating: Rating, countDaily = true) {
    syncDailyProgressDate()
    const wasNew = getCard(id).lastReviewed === null
    cards.value[id] = updateCard(getCard(id), rating)
    if (rating === 0) {
      if (!nochmalIds.value.includes(id)) nochmalIds.value.push(id)
    } else {
      nochmalIds.value = nochmalIds.value.filter(x => x !== id)
    }
    if (countDaily) {
      dailyProgress.value.remaining = Math.max(0, dailyProgress.value.remaining - 1)
      dailyProgress.value.learned++
      if (!dailyProgress.value.learnedIds.includes(id)) {
        dailyProgress.value.learnedIds.push(id)
      }
    }
    if (wasNew) {
      if (newToday.value.date !== today()) {
        newToday.value = { date: today(), count: 1 }
      } else {
        newToday.value.count++
      }
    }
    updateStreak()
    save()
  }

  function updateStreak() {
    const todayStr = today()
    if (streak.value.lastDate === todayStr) return

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]!

    if (streak.value.lastDate === yesterdayStr) {
      streak.value.count++
    } else {
      streak.value.count = 1
    }
    streak.value.lastDate = todayStr
    save()
  }

  // Cards seen before that are now due again
  function reviewIds(wordIds: string[]): string[] {
    return wordIds.filter(id => {
      const card = getCard(id)
      return card.lastReviewed !== null && isDue(card)
    })
  }

  // Unseen cards, capped to the remaining daily new-card allowance
  function newIds(wordIds: string[], limit: number): string[] {
    if (limit <= 0) return []
    return wordIds
      .filter(id => getCard(id).lastReviewed === null)
      .slice(0, limit)
  }

  // Keep dueIds for backward compatibility (used by dashboard/progress stats)
  function dueIds(wordIds: string[]): string[] {
    return wordIds.filter(id => isDue(getCard(id)))
  }

  // Returns unmastered card IDs, working through levels in order.
  // Nochmal cards are always front-loaded; remaining slots filled with due reviews then new cards.
  // If `target` is provided, the result is capped to that size.
  function dailySessionIds(levelWordIds: string[][], target?: number): string[] {
    const cap = target ?? Infinity
    const allIds = levelWordIds.flat()

    const prioritized = nochmalIds.value.filter(id =>
      allIds.includes(id) && isDue(getCard(id)) && !isMastered(getCard(id))
    )

    const result: string[] = [...prioritized]
    const seen = new Set(prioritized)

    for (const ids of levelWordIds) {
      if (result.length >= cap) break
      const due = ids.filter(id => {
        const card = getCard(id)
        return !seen.has(id) && card.lastReviewed !== null && isDue(card) && !isMastered(card)
      })
      const newCards = ids.filter(id => !seen.has(id) && getCard(id).lastReviewed === null)
      for (const id of [...due, ...newCards]) {
        if (result.length >= cap) break
        result.push(id)
        seen.add(id)
      }
    }

    return result
  }

  function statsForLevel(wordIds: string[]) {
    const total = wordIds.length
    const seen = wordIds.filter(id => getCard(id).lastReviewed !== null).length
    const mastered = wordIds.filter(id => isMastered(getCard(id))).length
    const due = reviewIds(wordIds).length
    const newAvailable = Math.min(
      wordIds.filter(id => getCard(id).lastReviewed === null).length,
      Math.max(0, DAILY_NEW_LIMIT - newCardsSeenToday())
    )
    return { total, seen, mastered, due, newAvailable }
  }

  return {
    cards,
    streak,
    newToday,
    dailyProgress,
    load,
    getCard,
    rateCard,
    reviewIds,
    newIds,
    dueIds,
    newCardsSeenToday,
    dailyRemaining,
    dailyLearnedToday,
    dailyLearnedIds,
    statsForLevel,
    dailySessionIds,
    nochmalIds,
    DAILY_NEW_LIMIT
  }
})
