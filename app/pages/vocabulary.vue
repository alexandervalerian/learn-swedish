<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'

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
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 pt-6 pb-24">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Vokabelliste</h1>
      <p class="text-sm text-gray-500 mt-1">
        Alle Wörter mit Sortierung nach Relevanz oder Alphabet.
      </p>
    </div>

    <div class="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="text-xs text-gray-500">
          Sortierung
          <select
            v-model="sortMode"
            class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-swedish-blue focus:outline-none"
          >
            <option value="relevance">Relevanz (Haeufigkeit)</option>
            <option value="alpha">Alphabetisch (Schwedisch)</option>
          </select>
        </label>

        <label class="text-xs text-gray-500">
          Niveau
          <select
            v-model="levelFilter"
            class="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-swedish-blue focus:outline-none"
          >
            <option value="ALL">Alle</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>
        </label>
      </div>
      <p class="mt-3 text-xs text-gray-400">{{ sortedWords.length }} Woerter</p>
    </div>

    <div class="space-y-2">
      <div
        v-for="word in sortedWords"
        :key="word.id"
        class="rounded-xl border border-gray-200 bg-white p-3"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-base font-semibold text-gray-900">{{ word.swedish }}</p>
            <p class="text-sm text-gray-600">{{ word.german }}</p>
          </div>
          <span class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
            {{ word.level }}
          </span>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          {{ word.example }}
        </p>
        <p class="text-xs text-gray-400">
          {{ word.exampleTranslation }}
        </p>
      </div>
    </div>
  </div>
</template>
