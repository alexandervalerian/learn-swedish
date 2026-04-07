<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import type { Rating } from '~/composables/useSpacedRepetition'

const store = useProgressStore()
const route = useRoute()

const allWords = [...a1.words, ...a2.words, ...b1.words, ...b2.words, ...c1.words]

const levelFilter = computed(() => route.query.level as string | undefined)

const filteredWords = computed(() =>
  levelFilter.value
    ? allWords.filter(w => w.id.startsWith(levelFilter.value!.toLowerCase()))
    : allWords
)

const dueWords = computed(() =>
  store.dueIds(filteredWords.value.map(w => w.id))
    .map(id => filteredWords.value.find(w => w.id === id)!)
    .filter(Boolean)
)

const MODE_KEY = 'swedish_mode'
const reverse = ref(false)

const queue = ref<typeof allWords>([])
const currentIndex = ref(0)
const reviewedCount = ref(0)
const done = ref(false)

function startSession() {
  queue.value = [...dueWords.value]
  currentIndex.value = 0
  reviewedCount.value = 0
  done.value = queue.value.length === 0
}

function toggleMode() {
  reverse.value = !reverse.value
  localStorage.setItem(MODE_KEY, reverse.value ? '1' : '0')
  startSession()
}

onMounted(() => {
  reverse.value = localStorage.getItem(MODE_KEY) === '1'
  startSession()
})

const current = computed(() => queue.value[currentIndex.value])

function levelForId(id: string): string {
  return id.split('_')[0]!.toUpperCase()
}

function onRate(rating: Rating) {
  if (!current.value) return
  store.rateCard(current.value.id, rating)
  reviewedCount.value++

  // If "Again", push to end of queue
  if (rating === 0) {
    queue.value.push(current.value)
  }

  if (currentIndex.value + 1 >= queue.value.length) {
    done.value = true
  } else {
    currentIndex.value++
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/" class="text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1">
        <h2 class="font-bold text-gray-900">
          {{ levelFilter ? `Niveau ${levelFilter}` : 'Alle Niveau' }}
        </h2>
        <p v-if="!done" class="text-xs text-gray-400">
          {{ currentIndex + 1 }} / {{ queue.length }} Karten
        </p>
      </div>

      <!-- Mode toggle -->
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
        :class="reverse
          ? 'bg-swedish-blue text-white border-swedish-blue'
          : 'bg-white text-gray-600 border-gray-200 hover:border-swedish-blue hover:text-swedish-blue'"
        @click="toggleMode"
      >
        <span>{{ reverse ? 'DE → SV' : 'SV → DE' }}</span>
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </button>
    </div>

    <!-- Progress bar -->
    <div v-if="!done" class="mb-8 bg-gray-200 rounded-full h-1.5">
      <div
        class="h-1.5 rounded-full bg-swedish-blue transition-all duration-300"
        :style="{ width: `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
      />
    </div>

    <!-- Done state -->
    <div v-if="done" class="text-center py-16">
      <div class="text-5xl mb-4">🎉</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Gut gemacht!</h3>
      <p class="text-gray-500 mb-2">Du hast {{ reviewedCount }} Karten wiederholt.</p>
      <p v-if="store.streak.count > 1" class="text-swedish-blue font-semibold mb-8">
        🔥 {{ store.streak.count }} Tage in Folge!
      </p>
      <NuxtLink
        to="/"
        class="inline-block px-6 py-3 rounded-xl text-white font-semibold"
        style="background-color: #006AA7;"
      >
        Zurück zur Übersicht
      </NuxtLink>
    </div>

    <!-- No cards due -->
    <div v-else-if="queue.length === 0" class="text-center py-16">
      <div class="text-5xl mb-4">✅</div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Alles erledigt!</h3>
      <p class="text-gray-500 mb-8">Keine Karten für heute fällig.</p>
      <NuxtLink
        to="/"
        class="inline-block px-6 py-3 rounded-xl text-white font-semibold"
        style="background-color: #006AA7;"
      >
        Zurück
      </NuxtLink>
    </div>

    <!-- Flash card -->
    <FlashCard
      v-else-if="current"
      :key="current.id"
      :swedish="current.swedish"
      :german="current.german"
      :example="current.example"
      :example-translation="current.exampleTranslation"
      :level="levelForId(current.id)"
      :reverse="reverse"
      @rate="onRate"
    />
  </div>
</template>
