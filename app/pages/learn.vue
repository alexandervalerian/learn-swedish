<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import type { Rating } from '~/composables/useSpacedRepetition'
import { DAILY_CARD_TARGET } from '~/stores/progress'
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'
import { getTodayTopic } from '~/utils/topics'

const store = useProgressStore()
const userStore = useUserStore()
const route = useRoute()

const allWords = [...a1.words, ...a2.words, ...b1.words, ...b2.words, ...c1.words]

const levelFilter = computed(() => route.query.level as string | undefined)
const isDailyMode = computed(() => route.query.mode === 'daily')
const topicParam = computed(() => route.query.topic as string | undefined)
const topicWordIds = computed(() =>
  topicParam.value
    ? allWords.filter(w => w.topic === topicParam.value).map(w => w.id)
    : []
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

const PREVIEW_KEY = 'swedish_show_preview'
const previewEnabled = ref(false)
const inPreview = ref(false)

type LearnMode = 'sv-de' | 'de-sv' | 'listen'
const MODE_KEY = 'swedish_mode'
const mode = ref<LearnMode>('de-sv')
const reverse = computed(() => mode.value === 'de-sv')
const listenMode = computed(() => mode.value === 'listen')
const autoPlay = computed(() => mode.value === 'listen')

const queue = ref<typeof allWords>([])
const sortedQueue = computed(() => [...queue.value].sort((a, b) => a.german.localeCompare(b.german)))
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
    const ids = store.dailySessionIds([userStore.focusLevelWordIds], store.dailyRemaining(), topicWordIds.value)
    const words = resolveIds(ids)
    sessionReviewCount.value = ids.filter(id => store.getCard(id).lastReviewed !== null).length
    sessionNewCount.value = ids.filter(id => store.getCard(id).lastReviewed === null).length
    queue.value = words.sort(() => Math.random() - 0.5)
    currentIndex.value = 0
    reviewedCount.value = 0
    done.value = words.length === 0 || store.dailyRemaining() <= 0
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
  inPreview.value = previewEnabled.value && queue.value.length > 0 && !done.value
}

onMounted(() => {
  previewEnabled.value = localStorage.getItem(PREVIEW_KEY) !== 'false'
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
const highestUnlockedLevel = computed(() =>
  [...LEVEL_ORDER].reverse().find(l => userStore.isLevelUnlocked(l)) ?? LEVEL_ORDER[0]
)

function levelForId(id: string): string {
  return id.split('_')[0]!.toUpperCase()
}

// Nochmal (0) in daily mode and Schwer (1) in non-daily mode don't count toward daily quota
const dailyRatings: Rating[] = [0, 2, 3]
const learnRatings: Rating[] = [1, 2, 3]
const cardRatings = computed<Rating[]>(() => isDailyMode.value ? dailyRatings : learnRatings)

function onRate(rating: Rating) {
  if (!current.value) return
  const skipCount = !isDailyMode.value || rating === 0
  store.rateCard(current.value.id, rating, !skipCount)
  reviewedCount.value++

  if (rating === 0) {
    if (isDailyMode.value) {
      // Insert within the remaining daily slots so it's shown before the goal is reached
      const remaining = dailyRemainingToday.value
      const insertAt = currentIndex.value + 1 + Math.floor(Math.random() * remaining)
      queue.value.splice(Math.min(insertAt, queue.value.length), 0, current.value)
    } else {
      queue.value.push(current.value)
    }
  }

  if (isDailyMode.value && dailyGoalReached.value) {
    done.value = true
    return
  }

  if (currentIndex.value + 1 >= queue.value.length) {
    if (isDailyMode.value) done.value = true
    else startSession()
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
          {{ isDailyMode
              ? `Tagespensum · ${userStore.focusLevel}`
              : (levelFilter ? `Niveau ${levelFilter}` : 'Alle Niveau') }}
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
        :style="{ width: isDailyMode ? `${Math.min((store.dailyLearnedToday() / DAILY_CARD_TARGET) * 100, 100)}%` : `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
      />
    </div>

    <!-- Done state (daily) -->
    <div
      v-if="done && isDailyMode"
      class="rounded-2xl p-8 text-center"
      style="background: linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%); box-shadow: var(--shadow-raised);"
    >
      <div class="text-5xl mb-4">🎉</div>
      <h3 class="text-xl font-bold text-white mb-2">Bra jobbat! 🇸🇪</h3>
      <p class="text-white/80 mb-2">{{ doneCount }} Karten heute gelernt.</p>
      <p v-if="store.streak.count > 1" class="text-white font-semibold mb-6">
        <span class="text-gold">🔥</span> {{ store.streak.count }} Tage in Folge!
      </p>
      <p class="text-white/70 text-sm mb-4">Was möchtest du als nächstes üben?</p>
      <div class="flex flex-col gap-3 mb-6">
        <NuxtLink
          to="/exam?mode=daily"
          class="inline-block px-6 py-3 rounded-xl bg-white text-brand font-semibold transition-all active:scale-[0.98] hover:bg-gold-soft"
        >
          Vokabeltest
        </NuxtLink>
        <NuxtLink
          :to="`/grammar?level=${highestUnlockedLevel}`"
          class="inline-block px-6 py-3 rounded-xl bg-white/20 text-white font-semibold transition-all active:scale-[0.98] hover:bg-white/30"
        >
          Grammatik üben
        </NuxtLink>
        <NuxtLink
          :to="`/sentences?level=${highestUnlockedLevel}`"
          class="inline-block px-6 py-3 rounded-xl bg-white/20 text-white font-semibold transition-all active:scale-[0.98] hover:bg-white/30"
        >
          Sätze bilden
        </NuxtLink>
      </div>
      <NuxtLink to="/" class="text-sm text-white/60 hover:text-white">
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

    <!-- Word preview table -->
    <div v-else-if="inPreview" class="flex flex-col" style="min-height: calc(100dvh - 180px)">
      <p class="text-sm text-ink-secondary mb-4">{{ queue.length }} Wörter in dieser Session:</p>
      <div class="card overflow-hidden divide-y divide-surface-inset flex-1 overflow-y-auto mb-4">
        <div
          v-for="word in sortedQueue"
          :key="word.id"
          class="px-4 py-3 flex items-center justify-between gap-3"
        >
          <span class="font-semibold text-ink-primary">{{ word.german }}</span>
          <span class="text-ink-secondary text-sm">{{ word.swedish }}</span>
        </div>
      </div>
      <button class="btn-primary w-full" @click="inPreview = false">
        Los geht's
      </button>
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
      :available-ratings="cardRatings"
      @rate="onRate"
    />
  </div>
</template>
