import { defineStore } from 'pinia'
import { useProgressStore } from '~/stores/progress'
import a1Vocab from '~/data/vocabulary/a1.json'
import a2Vocab from '~/data/vocabulary/a2.json'
import b1Vocab from '~/data/vocabulary/b1.json'
import b2Vocab from '~/data/vocabulary/b2.json'
import c1Vocab from '~/data/vocabulary/c1.json'
import a1Grammar from '~/data/grammar/a1.json'
import a2Grammar from '~/data/grammar/a2.json'
import b1Grammar from '~/data/grammar/b1.json'
import b2Grammar from '~/data/grammar/b2.json'
import c1Grammar from '~/data/grammar/c1.json'

const STORAGE_KEY = 'swedish_user'
const LEGACY_GRAMMAR_KEY = 'swedish_grammar_progress'

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export type CefrLevel = (typeof LEVEL_ORDER)[number]

export const VOCAB_SEEN_THRESHOLD = 0.90

const VOCAB_WORD_IDS: Record<CefrLevel, string[]> = {
  A1: a1Vocab.words.map(w => w.id),
  A2: a2Vocab.words.map(w => w.id),
  B1: b1Vocab.words.map(w => w.id),
  B2: b2Vocab.words.map(w => w.id),
  C1: c1Vocab.words.map(w => w.id)
}

export const GRAMMAR_TOPIC_IDS: Record<CefrLevel, string[]> = {
  A1: a1Grammar.topics.map(t => t.id),
  A2: a2Grammar.topics.map(t => t.id),
  B1: b1Grammar.topics.map(t => t.id),
  B2: b2Grammar.topics.map(t => t.id),
  C1: c1Grammar.topics.map(t => t.id)
}

interface GrammarProgress {
  studied: string[]
  practiced: string[]
}

interface StoredUserData {
  name: string
  startingLevel: CefrLevel
  onboardingComplete: boolean
  grammarProgress: GrammarProgress
}

export const useUserStore = defineStore('user', () => {
  const _loaded = ref(false)

  const name = ref('')
  const startingLevel = ref<CefrLevel>('A1')
  const onboardingComplete = ref(false)
  const grammarProgress = ref<GrammarProgress>({ studied: [], practiced: [] })

  function load() {
    if (_loaded.value) return
    _loaded.value = true

    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const data: StoredUserData = JSON.parse(raw)
        name.value = data.name ?? ''
        startingLevel.value = data.startingLevel ?? 'A1'
        onboardingComplete.value = data.onboardingComplete ?? false
        grammarProgress.value = data.grammarProgress ?? { studied: [], practiced: [] }
      } catch {
        // corrupted — start fresh with onboarding
      }
    } else {
      // Migrate legacy grammar progress if it exists
      const legacyRaw = localStorage.getItem(LEGACY_GRAMMAR_KEY)
      if (legacyRaw) {
        try {
          grammarProgress.value = JSON.parse(legacyRaw)
        } catch {
          // ignore corrupted legacy data
        }
      }
    }
  }

  function save() {
    const data: StoredUserData = {
      name: name.value,
      startingLevel: startingLevel.value,
      onboardingComplete: onboardingComplete.value,
      grammarProgress: grammarProgress.value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function completeOnboarding(userName: string, level: CefrLevel) {
    name.value = userName.trim()
    startingLevel.value = level
    onboardingComplete.value = true
    save()
  }

  function markStudied(topicId: string) {
    if (!grammarProgress.value.studied.includes(topicId)) {
      grammarProgress.value.studied.push(topicId)
      save()
    }
  }

  function markPracticed(topicId: string) {
    if (!grammarProgress.value.practiced.includes(topicId)) {
      grammarProgress.value.practiced.push(topicId)
      save()
    }
  }

  function _isLevelComplete(level: CefrLevel): boolean {
    const progressStore = useProgressStore()
    const wordIds = VOCAB_WORD_IDS[level]
    const stats = progressStore.statsForLevel(wordIds)
    if (stats.total === 0) return false
    const vocabDone = stats.seen / stats.total >= VOCAB_SEEN_THRESHOLD

    const topicIds = GRAMMAR_TOPIC_IDS[level]
    const grammarDone = topicIds.length === 0 || topicIds.every(id => grammarProgress.value.practiced.includes(id))

    return vocabDone && grammarDone
  }

  const unlockedLevels = computed<Set<CefrLevel>>(() => {
    const unlocked = new Set<CefrLevel>()
    const startIdx = LEVEL_ORDER.indexOf(startingLevel.value)

    // All levels at or below starting level are unlocked
    for (let i = 0; i <= startIdx; i++) {
      unlocked.add(LEVEL_ORDER[i])
    }

    // Walk upward: unlock next if current is complete
    for (let i = startIdx; i < LEVEL_ORDER.length - 1; i++) {
      if (_isLevelComplete(LEVEL_ORDER[i])) {
        unlocked.add(LEVEL_ORDER[i + 1])
      } else {
        break
      }
    }

    return unlocked
  })

  function isLevelUnlocked(level: CefrLevel): boolean {
    return unlockedLevels.value.has(level)
  }

  function isLevelComplete(level: CefrLevel): boolean {
    return _isLevelComplete(level)
  }

  function changeName(newName: string) {
    name.value = newName.trim()
    save()
  }

  function changeStartingLevel(newLevel: CefrLevel) {
    const newStartIdx = LEVEL_ORDER.indexOf(newLevel)
    const oldStartIdx = LEVEL_ORDER.indexOf(startingLevel.value)
    // If moving to a lower starting level, levels that were auto-unlocked become locked.
    // Reset their grammar practiced (and studied) entries so progress must be re-earned.
    if (newStartIdx < oldStartIdx) {
      const topicIdsToRemove = LEVEL_ORDER
        .slice(newStartIdx + 1, oldStartIdx + 1)
        .flatMap(l => GRAMMAR_TOPIC_IDS[l])
      grammarProgress.value.practiced = grammarProgress.value.practiced.filter(
        id => !topicIdsToRemove.includes(id)
      )
      grammarProgress.value.studied = grammarProgress.value.studied.filter(
        id => !topicIdsToRemove.includes(id)
      )
    }
    startingLevel.value = newLevel
    save()
  }

  function grammarCompletionForLevel(level: CefrLevel): { practiced: number; total: number; complete: boolean } {
    const topicIds = GRAMMAR_TOPIC_IDS[level]
    const total = topicIds.length
    const practiced = topicIds.filter(id => grammarProgress.value.practiced.includes(id)).length
    return { practiced, total, complete: total > 0 && practiced === total }
  }

  return {
    name,
    startingLevel,
    onboardingComplete,
    grammarProgress,
    load,
    save,
    completeOnboarding,
    changeName,
    markStudied,
    markPracticed,
    isLevelUnlocked,
    isLevelComplete,
    changeStartingLevel,
    grammarCompletionForLevel,
    unlockedLevels
  }
})
