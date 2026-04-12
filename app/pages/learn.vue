<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import type { Rating } from '~/composables/useSpacedRepetition'
import { DAILY_CARD_TARGET } from '~/stores/progress'
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'

const store = useProgressStore()
const userStore = useUserStore()
const route = useRoute()

const allWords = [...a1.words, ...a2.words, ...b1.words, ...b2.words, ...c1.words]

const allLevelWordIdArrays = [
  a1.words.map(w => w.id),
  a2.words.map(w => w.id),
  b1.words.map(w => w.id),
  b2.words.map(w => w.id),
  c1.words.map(w => w.id),
]

const levelFilter = computed(() => route.query.level as string | undefined)
const isDailyMode = computed(() => route.query.mode === 'daily')

const unlockedLevelWordIdArrays = computed(() =>
  allLevelWordIdArrays.filter((_, i) => userStore.isLevelUnlocked(LEVEL_ORDER[i]))
)

const filteredWords = computed(() =>
  levelFilter.value
    ? allWords.filter(w => w.id.startsWith(levelFilter.value!.toLowerCase()))
    : allWords
)

const wordIds = computed(() => filteredWords.value.map(w => w.id))

function resolveIds(ids: string[]) {
  return ids.map(id => filteredWords.value.find(w => w.id === id)!).filter(Boolean)
}

type LearnMode = 'sv-de' | 'de-sv' | 'listen'
const MODE_KEY = 'swedish_mode'
const mode = ref<LearnMode>('sv-de')
const reverse = computed(() => mode.value === 'de-sv')
const listenMode = computed(() => mode.value === 'listen')
const autoPlay = computed(() => mode.value === 'listen')

const queue = ref<typeof allWords>([])
const currentIndex = ref(0)
const reviewedCount = ref(0)
const done = ref(false)
const sessionReviewCount = ref(0)
const sessionNewCount = ref(0)

function startSession() {
  if (levelFilter.value && !userStore.isLevelUnlocked(levelFilter.value as CefrLevel)) {
    navigateTo('/')
    return
  }

  if (isDailyMode.value) {
    const ids = store.dailySessionIds(unlockedLevelWordIdArrays.value)
    const words = resolveIds(ids)
    sessionReviewCount.value = ids.filter(id => store.getCard(id).lastReviewed !== null).length
    sessionNewCount.value = ids.filter(id => store.getCard(id).lastReviewed === null).length
    queue.value = words.sort(() => Math.random() - 0.5)
    currentIndex.value = 0
    reviewedCount.value = 0
    done.value = words.length === 0
  } else {
    const reviews = resolveIds(store.reviewIds(wordIds.value))
    const newCards = resolveIds(store.newIds(wordIds.value, wordIds.value.length))
    sessionReviewCount.value = reviews.length
    sessionNewCount.value = newCards.length
    const combined = [...reviews, ...newCards].sort(() => Math.random() - 0.5)
    queue.value = combined
    currentIndex.value = 0
    reviewedCount.value = 0
    done.value = combined.length === 0
  }
}

onMounted(() => {
  const saved = localStorage.getItem(MODE_KEY)
  if (saved === 'de-sv' || saved === 'listen') mode.value = saved
  startSession()
})

const current = computed(() => queue.value[currentIndex.value])
const doneCount = computed(() =>
  isDailyMode.value ? store.dailyLearnedToday() : reviewedCount.value
)
const dailyGoalToday = DAILY_CARD_TARGET
const dailyLearnedToday = computed(() => store.dailyLearnedToday())
const dailyRemainingToday = computed(() => store.dailyRemaining())
const dailyGoalReached = computed(() =>
  isDailyMode.value && dailyRemainingToday.value <= 0
)

function levelForId(id: string): string {
  return id.split('_')[0]!.toUpperCase()
}

function onRate(rating: Rating) {
  if (!current.value) return
  store.rateCard(current.value.id, rating)
  reviewedCount.value++

  if (rating === 0) {
    queue.value.push(current.value)
  }

  if (currentIndex.value + 1 >= queue.value.length) {
    if (isDailyMode.value) {
      done.value = true
    } else {
      startSession()
    }
  } else {
    currentIndex.value++
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/" class="page-back-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1">
        <h2 class="font-bold text-ink-primary">
          {{ isDailyMode ? 'Tagespensum' : (levelFilter ? `Niveau ${levelFilter}` : 'Alle Niveau') }}
        </h2>
        <p v-if="!done && queue.length > 0" class="text-xs text-ink-tertiary mt-0.5">
          <template v-if="isDailyMode">
            {{ dailyLearnedToday }} / {{ dailyGoalToday }} heute ·
            <span v-if="dailyRemainingToday > 0">{{ dailyRemainingToday }} offen</span>
            <span v-else class="text-brand font-semibold">Ziel erreicht</span>
          </template>
          <template v-else>
            {{ currentIndex + 1 }} / {{ queue.length }} ·
            <span v-if="sessionReviewCount">{{ sessionReviewCount }} Wdh.</span>
            <span v-if="sessionReviewCount && sessionNewCount"> · </span>
            <span v-if="sessionNewCount" class="text-brand font-semibold">{{ sessionNewCount }} neu</span>
          </template>
        </p>
      </div>
    </div>

    <!-- Progress bar -->
    <div v-if="!done && queue.length > 0" class="mb-8 progress-track">
      <div
        class="progress-fill"
        :style="{ width: `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
      />
    </div>

    <!-- Daily goal reached banner -->
    <div v-if="dailyGoalReached && !done && queue.length > 0" class="mb-4 rounded-xl bg-brand-subtle border border-brand-muted px-4 py-2 text-xs text-brand">
      Tagesziel erreicht – du kannst mit extra Karten weitermachen.
    </div>

    <!-- Done state -->
    <div
      v-if="done && isDailyMode && queue.length > 0"
      class="rounded-2xl p-8 text-center"
      style="background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%); box-shadow: var(--shadow-raised);"
    >
      <div class="text-5xl mb-4">🎉</div>
      <h3 class="text-xl font-bold text-white mb-2">Bra jobbat! 🇸🇪</h3>
      <p class="text-white/80 mb-2">Du hast {{ doneCount }} Karten wiederholt.</p>
      <p v-if="isDailyMode" class="text-xs text-white/60 mb-2">Tagesziel: {{ dailyGoalToday }} Karten</p>
      <p v-if="store.streak.count > 1" class="text-white font-semibold mb-8">
        <span class="text-gold">🔥</span> {{ store.streak.count }} Tage in Folge!
      </p>
      <NuxtLink
        to="/"
        class="inline-block px-6 py-3 rounded-xl bg-white text-brand font-semibold transition-all active:scale-[0.98] hover:bg-gold-soft"
      >
        Zurück zur Übersicht
      </NuxtLink>
    </div>

    <!-- No cards due -->
    <div v-else-if="queue.length === 0" class="text-center py-16">
      <div class="text-5xl mb-4">🌲</div>
      <h3 class="text-xl font-bold text-ink-primary mb-2">Alles erledigt!</h3>
      <p class="text-ink-secondary mb-2">Keine Karten für heute fällig.</p>
      <p class="text-xs text-ink-tertiary mb-8">Keine neuen oder fälligen Karten für dieses Niveau.</p>
      <div class="flex flex-col gap-3 items-center">
        <NuxtLink
          to="/sentences"
          class="btn-primary inline-block max-w-xs"
        >
          Satzübungen starten
        </NuxtLink>
        <NuxtLink
          to="/grammar"
          class="btn-secondary inline-block max-w-xs"
        >
          Grammatik üben
        </NuxtLink>
        <NuxtLink to="/" class="text-sm text-ink-tertiary hover:text-ink-secondary mt-1">
          Zurück zur Übersicht
        </NuxtLink>
      </div>
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
      :listen-mode="listenMode"
      :auto-play="autoPlay"
      @rate="onRate"
    />
  </div>
</template>
