<script setup lang="ts">
import a1Grammar from '~/data/grammar/a1.json'
import a2Grammar from '~/data/grammar/a2.json'
import b1Grammar from '~/data/grammar/b1.json'
import b2Grammar from '~/data/grammar/b2.json'
import c1Grammar from '~/data/grammar/c1.json'

// ---- Types ----
interface GrammarExample {
  swedish: string
  german: string
  highlight: string
}

interface GrammarExercise {
  prompt: string
  translation: string
  answer: string
  alternatives?: string[]
}

interface GrammarTopic {
  id: string
  title: string
  category: string
  explanation: string
  rule: string
  examples: GrammarExample[]
  exercises: GrammarExercise[]
}

interface GrammarLevel {
  level: string
  topics: GrammarTopic[]
}

// ---- Data ----
const allLevels = [
  { data: a1Grammar as GrammarLevel, label: 'A1', fullLabel: 'A1 – Anfänger',         ...LEVEL_META.A1, cardClass: LEVEL_META.A1.color },
  { data: a2Grammar as GrammarLevel, label: 'A2', fullLabel: 'A2 – Grundlagen',        ...LEVEL_META.A2, cardClass: LEVEL_META.A2.color },
  { data: b1Grammar as GrammarLevel, label: 'B1', fullLabel: 'B1 – Mittelstufe',       ...LEVEL_META.B1, cardClass: LEVEL_META.B1.color },
  { data: b2Grammar as GrammarLevel, label: 'B2', fullLabel: 'B2 – Gute Mittelstufe',  ...LEVEL_META.B2, cardClass: LEVEL_META.B2.color },
  { data: c1Grammar as GrammarLevel, label: 'C1', fullLabel: 'C1 – Fortgeschritten',   ...LEVEL_META.C1, cardClass: LEVEL_META.C1.color },
]

// ---- Progress ----
import { type CefrLevel } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

const userStore = useUserStore()

function markStudied(id: string) {
  userStore.markStudied(id)
}

function markPracticed(id: string) {
  userStore.markPracticed(id)
}

// ---- State machine ----
type Phase = 'picker' | 'list' | 'topic'
const route = useRoute()
const router = useRouter()
const phase = ref<Phase>('picker')
const selectedLevel = ref<string>(userStore.startingLevel)
const selectedTopic = ref<GrammarTopic | null>(null)
const activeTab = ref<'erklaerung' | 'uebungen'>('erklaerung')
const levelContext = computed(() => route.query.level as string | undefined)
const backTarget = computed(() =>
  levelContext.value ? `/level?level=${levelContext.value}` : '/'
)

function handleBack() {
  if (phase.value === 'topic') {
    phase.value = 'list'
    return
  }
  if (phase.value === 'list' && levelContext.value) {
    router.push(backTarget.value)
    return
  }
  if (phase.value === 'list') {
    phase.value = 'picker'
    return
  }
  router.push('/')
}

onMounted(() => {
  const lvl = route.query.level as string | undefined
  if (lvl && allLevels.some(l => l.label === lvl)) {
    selectedLevel.value = lvl
    phase.value = 'list'
  }
})

// ---- Unlocked levels filter ----
const visibleLevels = computed(() =>
  allLevels.filter(l => userStore.isLevelUnlocked(l.label as CefrLevel))
)

// ---- List phase ----
const currentLevelData = computed(() =>
  allLevels.find(l => l.label === selectedLevel.value)!
)

const topicsByCategory = computed(() => {
  const topics = currentLevelData.value.data.topics
  const map = new Map<string, GrammarTopic[]>()
  for (const t of topics) {
    if (!map.has(t.category)) map.set(t.category, [])
    map.get(t.category)!.push(t)
  }
  return map
})

function selectLevel(label: string) {
  selectedLevel.value = label
  phase.value = 'list'
}

function openTopic(topic: GrammarTopic) {
  selectedTopic.value = topic
  activeTab.value = 'erklaerung'
  phase.value = 'topic'
  nextTick(() => markStudied(topic.id))
}

function goToUebungen() {
  activeTab.value = 'uebungen'
  startExercises()
}

// ---- Exercise session ----
const exerciseIndex = ref(0)
const exerciseInput = ref('')
const exerciseSubmitted = ref(false)
const exerciseCorrect = ref(false)
const exerciseResults = ref<{ correct: boolean }[]>([])
const exerciseDone = ref(false)
const exerciseInputRef = ref<HTMLInputElement | null>(null)

function startExercises() {
  exerciseIndex.value = 0
  exerciseInput.value = ''
  exerciseSubmitted.value = false
  exerciseCorrect.value = false
  exerciseResults.value = []
  exerciseDone.value = false
  nextTick(() => exerciseInputRef.value?.focus())
}

const currentExercise = computed(() =>
  selectedTopic.value?.exercises[exerciseIndex.value] ?? null
)

const exerciseProgress = computed(() => {
  const total = selectedTopic.value?.exercises.length ?? 1
  return exerciseIndex.value / total
})

function submitExercise() {
  if (!exerciseInput.value.trim() || exerciseSubmitted.value || !currentExercise.value) return
  const norm = exerciseInput.value.toLowerCase().trim()
  const accepted = [
    currentExercise.value.answer,
    ...(currentExercise.value.alternatives ?? []),
  ]
  exerciseCorrect.value = accepted.some(a => a === norm)
  exerciseResults.value.push({ correct: exerciseCorrect.value })
  exerciseSubmitted.value = true
}

function advanceExercise() {
  const total = selectedTopic.value?.exercises.length ?? 0
  if (exerciseIndex.value + 1 >= total) {
    exerciseDone.value = true
    if (selectedTopic.value) markPracticed(selectedTopic.value.id)
  } else {
    exerciseIndex.value++
    exerciseInput.value = ''
    exerciseSubmitted.value = false
    exerciseCorrect.value = false
    nextTick(() => exerciseInputRef.value?.focus())
  }
}

function handleExerciseEnter() {
  if (!exerciseSubmitted.value) submitExercise()
  else if (!exerciseDone.value) advanceExercise()
}

const exerciseCorrectCount = computed(() => exerciseResults.value.filter(r => r.correct).length)

// ---- Highlight helper ----
function highlightSentence(swedish: string, highlight: string): { before: string; highlighted: string; after: string } | null {
  if (!highlight) return null
  const idx = swedish.indexOf(highlight)
  if (idx === -1) return null
  return {
    before: swedish.slice(0, idx),
    highlighted: highlight,
    after: swedish.slice(idx + highlight.length),
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-6 pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        class="text-gray-400 hover:text-gray-600 flex-shrink-0"
        @click="handleBack"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-gray-900">Grammatik</h2>
        <!-- Breadcrumb -->
        <p class="text-xs text-gray-400 mt-0.5 truncate">
          <template v-if="phase === 'picker'">Niveau wählen</template>
          <template v-else-if="phase === 'list'">
            <button class="hover:text-swedish-blue transition-colors" @click="phase = 'picker'">Grammatik</button>
            <span class="mx-1">›</span>
            <span class="text-gray-600">{{ allLevels.find(l => l.label === selectedLevel)?.emoji }} {{ allLevels.find(l => l.label === selectedLevel)?.fullLabel }}</span>
          </template>
          <template v-else>
            <button class="hover:text-swedish-blue transition-colors" @click="phase = 'picker'">Grammatik</button>
            <span class="mx-1">›</span>
            <button class="hover:text-swedish-blue transition-colors" @click="phase = 'list'">{{ allLevels.find(l => l.label === selectedLevel)?.emoji }} {{ allLevels.find(l => l.label === selectedLevel)?.fullLabel }}</button>
            <span class="mx-1">›</span>
            <span class="text-gray-600 truncate">{{ selectedTopic?.title }}</span>
          </template>
        </p>
      </div>
    </div>

    <!-- ── PICKER ── -->
    <div v-if="phase === 'picker'">
      <p class="text-sm text-gray-500 mb-6">Lerne Schwedische Grammatik Schritt für Schritt – von den Grundlagen bis zum fortgeschrittenen Niveau.</p>
      <div class="space-y-3">
        <button
          v-for="lvl in visibleLevels"
          :key="lvl.label"
          class="w-full flex items-center justify-between rounded-2xl border px-4 py-4 transition-all active:scale-[0.98]"
          :class="lvl.cardClass"
          @click="selectLevel(lvl.label)"
        >
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.pill">{{ lvl.emoji }} {{ lvl.label }}</span>
            <span class="text-sm font-medium text-gray-700">{{ lvl.data.topics.length }} Grammatikthemen</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">
              {{ userStore.grammarProgress.practiced.filter(id => id.startsWith(lvl.label.toLowerCase())).length }}/{{ lvl.data.topics.length }} geübt
            </span>
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>

    <!-- ── LIST ── -->
    <div v-else-if="phase === 'list'">
      <div v-for="[category, topics] in topicsByCategory" :key="category" class="mb-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{{ category }}</p>
        <div class="space-y-2">
          <button
            v-for="topic in topics"
            :key="topic.id"
            class="w-full flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-left transition-all active:scale-[0.99] hover:border-gray-200 shadow-sm"
            @click="openTopic(topic)"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ topic.title }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ topic.exercises.length }} Übungen</p>
            </div>
            <!-- Status badges -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span
                v-if="userStore.grammarProgress.practiced.includes(topic.id)"
                class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"
                title="Geübt"
              >
                <svg class="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span
                v-else-if="userStore.grammarProgress.studied.includes(topic.id)"
                class="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center"
                title="Gelesen"
              >
                <svg class="w-3 h-3 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── TOPIC ── -->
    <div v-else-if="phase === 'topic' && selectedTopic">
      <h3 class="text-lg font-bold text-gray-900 mb-4">{{ selectedTopic.title }}</h3>

      <!-- Tabs -->
      <div class="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          :class="activeTab === 'erklaerung' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          @click="activeTab = 'erklaerung'"
        >
          Erklärung
        </button>
        <button
          class="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
          :class="activeTab === 'uebungen' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          @click="goToUebungen"
        >
          Übungen
        </button>
      </div>

      <!-- ── ERKLÄRUNG TAB ── -->
      <div v-if="activeTab === 'erklaerung'">
        <!-- Rule box -->
        <div class="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 mb-4">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Regel</p>
          <pre class="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{{ selectedTopic.rule }}</pre>
        </div>

        <!-- Explanation -->
        <p class="text-sm text-gray-700 leading-relaxed mb-6">{{ selectedTopic.explanation }}</p>

        <!-- Examples -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Beispiele</p>
          <div class="space-y-3">
            <div
              v-for="(ex, i) in selectedTopic.examples"
              :key="i"
              class="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
            >
              <p class="text-base font-medium text-gray-900 mb-1">
                <template v-if="highlightSentence(ex.swedish, ex.highlight)">
                  <span>{{ highlightSentence(ex.swedish, ex.highlight)!.before }}</span>
                  <span class="text-swedish-blue font-bold">{{ highlightSentence(ex.swedish, ex.highlight)!.highlighted }}</span>
                  <span>{{ highlightSentence(ex.swedish, ex.highlight)!.after }}</span>
                </template>
                <template v-else>{{ ex.swedish }}</template>
              </p>
              <p class="text-sm text-gray-400 italic">{{ ex.german }}</p>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <button
          class="w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-[0.98]"
          style="background-color: #006AA7;"
          @click="goToUebungen"
        >
          Übungen starten →
        </button>
      </div>

      <!-- ── ÜBUNGEN TAB ── -->
      <div v-else-if="activeTab === 'uebungen'">
        <!-- Done state -->
        <div v-if="exerciseDone" class="text-center py-8">
          <p class="text-5xl font-black mb-2" :class="exerciseCorrectCount === exerciseResults.length ? 'text-green-500' : 'text-swedish-blue'">
            {{ exerciseCorrectCount }}/{{ exerciseResults.length }}
          </p>
          <p class="text-gray-500 text-sm mb-6">
            {{ exerciseCorrectCount === exerciseResults.length ? 'Perfekt – keine Fehler!' : `${exerciseResults.length - exerciseCorrectCount} Fehler` }}
          </p>
          <div class="flex flex-col gap-3">
            <button
              class="w-full py-3 rounded-xl text-white font-semibold active:scale-[0.98] transition-all"
              style="background-color: #006AA7;"
              @click="startExercises"
            >
              Nochmal üben
            </button>
            <button
              class="w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:border-swedish-blue hover:text-swedish-blue transition-colors active:scale-[0.98]"
              @click="activeTab = 'erklaerung'"
            >
              Zurück zur Erklärung
            </button>
          </div>
        </div>

        <!-- Active exercise -->
        <template v-else-if="currentExercise">
          <!-- Progress bar -->
          <div class="mb-5 bg-gray-200 rounded-full h-1.5">
            <div
              class="h-1.5 rounded-full bg-swedish-blue transition-all duration-300"
              :style="{ width: `${exerciseProgress * 100}%` }"
            />
          </div>

          <p class="text-xs text-gray-400 mb-4">Übung {{ exerciseIndex + 1 }} von {{ selectedTopic.exercises.length }}</p>

          <!-- Prompt -->
          <p class="text-lg font-medium text-gray-900 mb-2 leading-relaxed">{{ currentExercise.prompt }}</p>
          <p class="text-sm text-gray-400 italic mb-5">{{ currentExercise.translation }}</p>

          <!-- Input -->
          <div class="space-y-3">
            <input
              ref="exerciseInputRef"
              v-model="exerciseInput"
              type="text"
              placeholder="Antwort eintippen…"
              class="w-full px-4 py-3 rounded-xl border text-gray-900 text-base outline-none transition-colors"
              :class="exerciseSubmitted
                ? exerciseCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
                : 'border-gray-200 focus:border-swedish-blue'"
              :readonly="exerciseSubmitted"
              @keydown.enter="handleExerciseEnter"
            />

            <button
              v-if="!exerciseSubmitted"
              class="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
              style="background-color: #006AA7;"
              :disabled="!exerciseInput.trim()"
              @click="submitExercise"
            >
              Prüfen
            </button>
          </div>

          <!-- Feedback -->
          <Transition name="slide-up">
            <div
              v-if="exerciseSubmitted"
              class="mt-4 rounded-xl px-4 py-3"
              :class="exerciseCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
            >
              <div class="flex items-start gap-2">
                <span class="text-lg mt-0.5">{{ exerciseCorrect ? '✓' : '✗' }}</span>
                <div>
                  <p class="font-semibold text-sm" :class="exerciseCorrect ? 'text-green-700' : 'text-red-700'">
                    {{ exerciseCorrect ? 'Richtig!' : 'Falsch' }}
                  </p>
                  <p v-if="!exerciseCorrect" class="text-sm text-gray-700 mt-0.5">
                    Richtig: <span class="font-semibold">{{ currentExercise.answer }}</span>
                  </p>
                </div>
              </div>
            </div>
          </Transition>

          <Transition name="slide-up">
            <button
              v-if="exerciseSubmitted"
              class="w-full mt-3 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:border-swedish-blue hover:text-swedish-blue transition-colors active:scale-[0.98]"
              @click="advanceExercise"
            >
              {{ exerciseIndex + 1 < (selectedTopic?.exercises.length ?? 0) ? 'Weiter →' : 'Ergebnis anzeigen →' }}
            </button>
          </Transition>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.2s ease-out;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
</style>
