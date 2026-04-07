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

interface StoredData {
  cards: Record<string, CardState>
  streak: { lastDate: string | null; count: number }
}

export const useProgressStore = defineStore('progress', () => {
  const cards = ref<Record<string, CardState>>({})
  const streak = ref<{ lastDate: string | null; count: number }>({
    lastDate: null,
    count: 0
  })

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const data: StoredData = JSON.parse(raw)
      cards.value = data.cards ?? {}
      streak.value = data.streak ?? { lastDate: null, count: 0 }
    } catch {
      // corrupted storage — start fresh
    }
  }

  function save() {
    const data: StoredData = { cards: cards.value, streak: streak.value }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function getCard(id: string): CardState {
    return cards.value[id] ?? defaultCardState()
  }

  function rateCard(id: string, rating: Rating) {
    cards.value[id] = updateCard(getCard(id), rating)
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

  function dueIds(wordIds: string[]): string[] {
    return wordIds.filter(id => isDue(getCard(id)))
  }

  function statsForLevel(wordIds: string[]) {
    const total = wordIds.length
    const seen = wordIds.filter(id => getCard(id).lastReviewed !== null).length
    const mastered = wordIds.filter(id => isMastered(getCard(id))).length
    const due = dueIds(wordIds).length
    return { total, seen, mastered, due }
  }

  return { cards, streak, load, getCard, rateCard, dueIds, statsForLevel }
})
