<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'

const route = useRoute()
const router = useRouter()

const allLevels = [
  { data: a1, label: 'A1', cardClass: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  { data: a2, label: 'A2', cardClass: 'bg-sky-50 border-sky-200', badge: 'bg-sky-100 text-sky-700' },
  { data: b1, label: 'B1', cardClass: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  { data: b2, label: 'B2', cardClass: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { data: c1, label: 'C1', cardClass: 'bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-700' },
]

const levelFilter = computed(() => route.query.level as string | undefined)
const showPicker = computed(() => !levelFilter.value)

const selectedLevel = computed(() =>
  allLevels.find(l => l.label === levelFilter.value) ?? null
)

const sentences = computed(() =>
  (selectedLevel.value?.data.words ?? []).map(w => ({
    swedish: w.example,
    german: w.exampleTranslation,
    level: selectedLevel.value!.label,
    sourceId: w.id
  }))
)

// Swedish base words for distractors (individual vocabulary words, not sentences)
const distractorPool = computed(() =>
  selectedLevel.value?.data.words.map(w => w.swedish) ?? []
)

const queue = ref<typeof sentences.value>([])
const currentIndex = ref(0)
const correct = ref(0)
const incorrect = ref(0)
const done = ref(false)

function startSession() {
  queue.value = [...sentences.value].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  correct.value = 0
  incorrect.value = 0
  done.value = false
}

watch(sentences, startSession, { immediate: true })

const current = computed(() => queue.value[currentIndex.value])

function advance() {
  if (currentIndex.value + 1 >= queue.value.length) {
    done.value = true
  } else {
    currentIndex.value++
  }
}

function onCorrect() { correct.value++; advance() }
function onIncorrect() { incorrect.value++; advance() }
function onSkip() { advance() }

function goToLevel(label: string) {
  router.push({ path: '/sentences', query: { level: label } })
}

const scorePercent = computed(() =>
  queue.value.length ? Math.round((correct.value / queue.value.length) * 100) : 0
)
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink
        :to="showPicker ? '/' : '/sentences'"
        class="text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-gray-900">Satzübungen</h2>
        <p class="text-xs text-gray-400">
          {{ showPicker
            ? 'Wähle ein Niveau'
            : `${levelFilter} · ${currentIndex + 1} / ${queue.length}`
          }}
        </p>
      </div>
    </div>

    <!-- Level picker -->
    <div v-if="showPicker" class="space-y-3">
      <button
        v-for="lvl in allLevels"
        :key="lvl.label"
        class="w-full flex items-center justify-between rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
        :class="lvl.cardClass"
        @click="goToLevel(lvl.label)"
      >
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">
            {{ lvl.label }}
          </span>
          <span class="text-sm font-medium text-gray-700">{{ lvl.data.words.length }} Sätze</span>
        </div>
        <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Session complete -->
    <div v-else-if="done" class="text-center py-14">
      <div class="text-5xl mb-4">{{ scorePercent >= 80 ? '🌟' : '💪' }}</div>
      <h3 class="text-xl font-bold text-gray-900 mb-1">Übung abgeschlossen!</h3>
      <p class="text-gray-400 text-sm mb-6">{{ scorePercent }}% richtig</p>

      <div class="flex justify-center gap-8 mb-8">
        <div class="text-center">
          <p class="text-3xl font-bold text-green-500">{{ correct }}</p>
          <p class="text-xs text-gray-400 mt-1">Richtig</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-red-400">{{ incorrect }}</p>
          <p class="text-xs text-gray-400 mt-1">Falsch</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold text-gray-300">{{ queue.length - correct - incorrect }}</p>
          <p class="text-xs text-gray-400 mt-1">Übersprungen</p>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <button
          class="px-6 py-3 rounded-xl text-white font-semibold bg-swedish-blue active:scale-[0.98] transition-all"
          @click="startSession"
        >
          Nochmal üben
        </button>
        <NuxtLink to="/sentences" class="text-sm text-gray-400 hover:text-gray-600 py-1">
          Anderes Niveau wählen
        </NuxtLink>
      </div>
    </div>

    <!-- Session in progress -->
    <template v-else-if="current">
      <!-- Progress bar -->
      <div class="mb-6 bg-gray-200 rounded-full h-1.5">
        <div
          class="h-1.5 rounded-full bg-swedish-blue transition-all duration-300"
          :style="{ width: `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
        />
      </div>

      <SentenceBuilder
        :key="current.sourceId"
        :swedish="current.swedish"
        :german="current.german"
        :level="current.level"
        :distractor-pool="distractorPool"
        @correct="onCorrect"
        @incorrect="onIncorrect"
        @skip="onSkip"
      />
    </template>
  </div>
</template>
