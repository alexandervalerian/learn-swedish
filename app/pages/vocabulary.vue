<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { isMastered } from '~/composables/useSpacedRepetition'

type SortMode = 'relevance' | 'alpha'
type LevelFilter = 'ALL' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

interface VocabularyWord {
  id: string
  swedish: string
  german: string
  example: string
  exampleTranslation: string
  level: LevelFilter
  relevanceRank: number
}

const store = useProgressStore()
const userStore = useUserStore()
const { speak } = useSpeech()

const sortMode = ref<SortMode>('relevance')
const levelFilter = ref<LevelFilter>('ALL')

const levelSets = [
  { level: 'A1' as LevelFilter, words: a1.words },
  { level: 'A2' as LevelFilter, words: a2.words },
  { level: 'B1' as LevelFilter, words: b1.words },
  { level: 'B2' as LevelFilter, words: b2.words },
  { level: 'C1' as LevelFilter, words: c1.words }
]

const allWords = computed<VocabularyWord[]>(() => {
  let rank = 0
  return levelSets.flatMap(set =>
    set.words.map(word => ({
      ...word,
      level: set.level,
      relevanceRank: rank++
    }))
  )
})

const filteredWords = computed(() => {
  if (levelFilter.value === 'ALL') return allWords.value
  return allWords.value.filter(word => word.level === levelFilter.value)
})

const sortedWords = computed(() => {
  const words = [...filteredWords.value]
  if (sortMode.value === 'alpha') {
    return words.sort((a, b) => a.swedish.localeCompare(b.swedish, 'sv'))
  }
  return words.sort((a, b) => a.relevanceRank - b.relevanceRank)
})

const levels: LevelFilter[] = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1']
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 pt-6 pb-24">
    <!-- Header -->
    <div class="mb-6">
      <p class="section-label">Wortschatz</p>
      <h1 class="text-2xl font-bold text-ink-primary">Vokabelliste</h1>
      <p class="text-sm text-ink-tertiary mt-1">
        Sortierung nach Relevanz oder Alphabet.
      </p>
    </div>

    <!-- Filters -->
    <div class="card p-4 mb-5">
      <!-- Level filter pills -->
      <div class="flex gap-1.5 flex-wrap mb-3">
        <button
          v-for="l in levels"
          :key="l"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all"
          :class="levelFilter === l
            ? 'bg-brand text-white'
            : 'bg-surface-inset text-ink-secondary hover:bg-brand-subtle hover:text-brand'"
          @click="levelFilter = l"
        >
          {{ l }}
        </button>
      </div>
      <!-- Sort -->
      <div class="flex items-center gap-3">
        <span class="text-xs text-ink-tertiary flex-shrink-0">Sortierung</span>
        <select
          v-model="sortMode"
          class="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-ink-primary focus:border-brand focus:outline-none"
        >
          <option value="relevance">Relevanz (Häufigkeit)</option>
          <option value="alpha">Alphabetisch (Schwedisch)</option>
        </select>
        <span class="text-xs text-ink-tertiary flex-shrink-0">{{ sortedWords.length }} Wörter</span>
      </div>
    </div>

    <!-- Word list — single card with dividers -->
    <div class="card overflow-hidden divide-y divide-surface-inset">
      <div
        v-for="word in sortedWords"
        :key="word.id"
        class="px-4 py-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-bold text-ink-primary">{{ word.swedish }}</p>
            <p class="text-xs text-ink-secondary mt-0.5">{{ word.german }}</p>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-inset text-ink-tertiary hover:bg-brand-subtle hover:text-brand transition-all focus:outline-none flex-shrink-0"
              title="Aussprache anhören"
              @click.stop="speak(`${word.swedish}. ${word.example}`)"
            >
              🔊
            </button>
            <!-- Status dot -->
            <span
              v-if="isMastered(store.getCard(word.id))"
              class="w-2.5 h-2.5 rounded-full bg-correct"
              title="Gemeistert"
            />
            <span
              v-else-if="store.getCard(word.id).lastReviewed !== null"
              class="w-2.5 h-2.5 rounded-full bg-brand-mid"
              title="In Übung"
            />
            <span
              v-else
              class="w-2.5 h-2.5 rounded-full bg-ink-tertiary/30"
              title="Noch nicht gesehen"
            />
            <!-- Level badge -->
            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              :class="userStore.isLevelUnlocked(word.level as any) ? 'bg-surface-inset text-ink-secondary' : 'bg-surface-inset text-ink-tertiary'"
            >
              <svg v-if="!userStore.isLevelUnlocked(word.level as any)" class="w-2.5 h-2.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              {{ word.level }}
            </span>
          </div>
        </div>
        <p class="mt-1.5 text-xs text-ink-tertiary leading-relaxed">
          {{ word.example }}
        </p>
        <p class="text-xs text-ink-tertiary/60">
          {{ word.exampleTranslation }}
        </p>
      </div>
    </div>
  </div>
</template>
