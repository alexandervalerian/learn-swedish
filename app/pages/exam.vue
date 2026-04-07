<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'

type ExamType = 'sv-de' | 'de-sv' | 'lueckentext'

interface Word {
  id: string
  swedish: string
  german: string
  example: string
  exampleTranslation: string
}

interface ExamQuestion {
  word: Word
  type: ExamType
  prompt: string
  accepted: string[]
  correctDisplay: string
}

interface QuestionResult {
  question: ExamQuestion
  userAnswer: string
  correct: boolean
}

import { type CefrLevel } from '~/stores/user'

const userStore = useUserStore()

const allLevels = [
  { data: a1, label: 'A1', pill: 'bg-emerald-100 text-emerald-700', activePill: 'bg-emerald-500 text-white' },
  { data: a2, label: 'A2', pill: 'bg-sky-100 text-sky-700', activePill: 'bg-sky-500 text-white' },
  { data: b1, label: 'B1', pill: 'bg-violet-100 text-violet-700', activePill: 'bg-violet-500 text-white' },
  { data: b2, label: 'B2', pill: 'bg-amber-100 text-amber-700', activePill: 'bg-amber-500 text-white' },
  { data: c1, label: 'C1', pill: 'bg-rose-100 text-rose-700', activePill: 'bg-rose-500 text-white' },
]

const visibleLevels = computed(() =>
  allLevels.filter(l => userStore.isLevelUnlocked(l.label as CefrLevel))
)

const typeLabel: Record<ExamType, string> = {
  'sv-de': 'SV → DE',
  'de-sv': 'DE → SV',
  'lueckentext': 'Lückentext',
}

// ---- Setup state ----
const phase = ref<'setup' | 'question' | 'results'>('setup')
const selectedLevel = ref<string>(userStore.startingLevel)
const selectedCount = ref<10 | 20 | 'all'>(10)
const selectedTypes = ref<ExamType[]>(['sv-de', 'de-sv', 'lueckentext'])
const canStart = computed(() => selectedTypes.value.length > 0)

// ---- Question state ----
const queue = ref<ExamQuestion[]>([])
const currentIndex = ref(0)
const results = ref<QuestionResult[]>([])
const userInput = ref('')
const submitted = ref(false)
const isCorrect = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// ---- Helpers ----
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeAnswer(raw: string): string[] {
  const stripped = raw.replace(/\s*\(.*?\)/g, '').trim()
  const noArticle = stripped.replace(/^(der|die|das)\s+/i, '')
  return noArticle.split(/\s*\/\s*/).map(p => p.toLowerCase().trim()).filter(Boolean)
}

function stripArticle(s: string): string {
  return s.replace(/\s*\(.*?\)/g, '').replace(/^(der|die|das)\s+/i, '').trim()
}

function canMakeLueckentext(word: Word): boolean {
  const bare = word.swedish.replace(/^att /, '')
  return word.example.toLowerCase().includes(bare.toLowerCase())
}

function buildQuestion(word: Word, type: ExamType): ExamQuestion {
  if (type === 'sv-de') {
    return { word, type, prompt: word.swedish, accepted: normalizeAnswer(word.german), correctDisplay: word.german }
  }
  if (type === 'de-sv') {
    return { word, type, prompt: stripArticle(word.german), accepted: [word.swedish.toLowerCase().trim()], correctDisplay: word.swedish }
  }
  // lueckentext
  const bare = word.swedish.replace(/^att /, '')
  const gapped = word.example.replace(new RegExp(escapeRegex(bare), 'i'), '___')
  return {
    word, type, prompt: gapped,
    accepted: [bare.toLowerCase().trim(), word.swedish.toLowerCase().trim()],
    correctDisplay: word.swedish,
  }
}

function calcGrade(correct: number, total: number): { note: number; label: string } {
  const pct = total === 0 ? 0 : correct / total
  if (pct >= 0.92) return { note: 1, label: 'Sehr gut' }
  if (pct >= 0.81) return { note: 2, label: 'Gut' }
  if (pct >= 0.67) return { note: 3, label: 'Befriedigend' }
  if (pct >= 0.50) return { note: 4, label: 'Ausreichend' }
  if (pct >= 0.30) return { note: 5, label: 'Mangelhaft' }
  return { note: 6, label: 'Ungenügend' }
}

// ---- Actions ----
function startExam() {
  const lvl = allLevels.find(l => l.label === selectedLevel.value)!
  const words: Word[] = [...(lvl.data.words as Word[])]
  const n = selectedCount.value === 'all' ? words.length : selectedCount.value
  const pool = words.sort(() => Math.random() - 0.5).slice(0, n)

  const questions: ExamQuestion[] = []
  for (let i = 0; i < pool.length; i++) {
    const word = pool[i]
    const typePool = selectedTypes.value.filter(t => t !== 'lueckentext' || canMakeLueckentext(word))
    if (typePool.length === 0) continue
    questions.push(buildQuestion(word, typePool[i % typePool.length]))
  }

  queue.value = questions
  currentIndex.value = 0
  results.value = []
  userInput.value = ''
  submitted.value = false
  isCorrect.value = false
  phase.value = 'question'
  nextTick(() => inputRef.value?.focus())
}

function submitAnswer() {
  if (!userInput.value.trim() || submitted.value) return
  const norm = userInput.value.toLowerCase().trim()
  isCorrect.value = current.value.accepted.some(a => a === norm)
  results.value.push({ question: current.value, userAnswer: userInput.value.trim(), correct: isCorrect.value })
  submitted.value = true
}

function advance() {
  if (currentIndex.value + 1 >= queue.value.length) {
    phase.value = 'results'
  } else {
    currentIndex.value++
    userInput.value = ''
    submitted.value = false
    isCorrect.value = false
    nextTick(() => inputRef.value?.focus())
  }
}

function handleEnter() {
  if (!submitted.value) submitAnswer()
  else advance()
}

// ---- Computed ----
const current = computed(() => queue.value[currentIndex.value])

const currentPromptParts = computed(() => {
  if (!current.value || current.value.type !== 'lueckentext') return null
  const idx = current.value.prompt.indexOf('___')
  if (idx === -1) return null
  return { before: current.value.prompt.slice(0, idx), after: current.value.prompt.slice(idx + 3) }
})

const correctCount = computed(() => results.value.filter(r => r.correct).length)
const grade = computed(() => calcGrade(correctCount.value, results.value.length))
const gradeColor = computed(() => {
  const n = grade.value.note
  if (n <= 2) return 'text-green-500'
  if (n === 3) return 'text-swedish-blue'
  if (n === 4) return 'text-amber-500'
  return 'text-red-500'
})
const wrongAnswers = computed(() => results.value.filter(r => !r.correct))
const scorePercent = computed(() =>
  results.value.length ? Math.round(correctCount.value / results.value.length * 100) : 0
)
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-6 pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/" class="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-gray-900">Vokabelprüfung</h2>
        <p class="text-xs text-gray-400">
          <template v-if="phase === 'question'">Frage {{ currentIndex + 1 }} von {{ queue.length }}</template>
          <template v-else-if="phase === 'results'">{{ selectedLevel }} · Ergebnis</template>
          <template v-else>Einstellungen wählen</template>
        </p>
      </div>
    </div>

    <!-- ── SETUP ── -->
    <div v-if="phase === 'setup'" class="space-y-6">
      <!-- Level -->
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Niveau</p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="lvl in visibleLevels"
            :key="lvl.label"
            class="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors"
            :class="selectedLevel === lvl.label ? lvl.activePill : lvl.pill"
            @click="selectedLevel = lvl.label"
          >
            {{ lvl.label }}
          </button>
        </div>
      </div>

      <!-- Question count -->
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Anzahl der Fragen</p>
        <div class="flex gap-2">
          <button
            v-for="count in ([10, 20, 'all'] as const)"
            :key="count"
            class="px-4 py-2 rounded-full text-sm font-semibold border transition-colors"
            :class="selectedCount === count
              ? 'bg-swedish-blue text-white border-swedish-blue'
              : 'bg-white text-gray-600 border-gray-200 hover:border-swedish-blue'"
            @click="selectedCount = count"
          >
            {{ count === 'all' ? 'Alle' : count }}
          </button>
        </div>
      </div>

      <!-- Exam types -->
      <div>
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prüfungsarten</p>
        <div class="space-y-2">
          <label
            v-for="t in (['sv-de', 'de-sv', 'lueckentext'] as ExamType[])"
            :key="t"
            class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 cursor-pointer hover:border-swedish-blue transition-colors"
          >
            <input type="checkbox" v-model="selectedTypes" :value="t" class="accent-swedish-blue w-4 h-4" />
            <div>
              <p class="text-sm font-medium text-gray-800">{{ typeLabel[t] }}</p>
              <p class="text-xs text-gray-400">
                <template v-if="t === 'sv-de'">Schwedisches Wort sehen, deutsche Übersetzung eintippen</template>
                <template v-else-if="t === 'de-sv'">Deutsches Wort sehen, schwedische Übersetzung eintippen</template>
                <template v-else>Lücke im Beispielsatz auf Schwedisch ausfüllen</template>
              </p>
            </div>
          </label>
        </div>
      </div>

      <button
        class="w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
        style="background-color: #006AA7;"
        :disabled="!canStart"
        @click="startExam"
      >
        Prüfung starten
      </button>
    </div>

    <!-- ── QUESTION ── -->
    <template v-else-if="phase === 'question' && current">
      <!-- Progress bar -->
      <div class="mb-6 bg-gray-200 rounded-full h-1.5">
        <div
          class="h-1.5 rounded-full bg-swedish-blue transition-all duration-300"
          :style="{ width: `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
        />
      </div>

      <!-- Type badge -->
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
        {{ typeLabel[current.type] }}
      </p>

      <!-- Prompt -->
      <div class="min-h-20 mb-6">
        <template v-if="currentPromptParts">
          <p class="text-xl font-medium text-gray-800 leading-relaxed">
            {{ currentPromptParts.before }}<span class="underline decoration-2 text-swedish-blue font-bold">___</span>{{ currentPromptParts.after }}
          </p>
          <p class="text-xs text-gray-400 mt-2 italic">{{ current.word.exampleTranslation }}</p>
        </template>
        <p v-else class="text-4xl font-bold text-gray-900">{{ current.prompt }}</p>
      </div>

      <!-- Input -->
      <div class="space-y-3">
        <input
          ref="inputRef"
          v-model="userInput"
          type="text"
          placeholder="Antwort eintippen…"
          class="w-full px-4 py-3 rounded-xl border text-gray-900 text-lg outline-none transition-colors"
          :class="submitted
            ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
            : 'border-gray-200 focus:border-swedish-blue'"
          :readonly="submitted"
          @keydown.enter="handleEnter"
        />

        <button
          v-if="!submitted"
          class="w-full py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
          style="background-color: #006AA7;"
          :disabled="!userInput.trim()"
          @click="submitAnswer"
        >
          Prüfen
        </button>
      </div>

      <!-- Feedback -->
      <Transition name="slide-up">
        <div v-if="submitted" class="mt-4 rounded-xl px-4 py-3" :class="isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
          <div class="flex items-start gap-2">
            <span class="text-lg mt-0.5">{{ isCorrect ? '✓' : '✗' }}</span>
            <div class="flex-1">
              <p class="font-semibold text-sm" :class="isCorrect ? 'text-green-700' : 'text-red-700'">
                {{ isCorrect ? 'Richtig!' : 'Falsch' }}
              </p>
              <p v-if="!isCorrect" class="text-sm text-gray-700 mt-0.5">
                Richtig: <span class="font-semibold">{{ current.correctDisplay }}</span>
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="slide-up">
        <button
          v-if="submitted"
          class="w-full mt-3 py-3 rounded-xl font-semibold border border-gray-200 text-gray-700 hover:border-swedish-blue hover:text-swedish-blue transition-colors active:scale-[0.98]"
          @click="advance"
        >
          {{ currentIndex + 1 < queue.length ? 'Weiter →' : 'Ergebnis anzeigen →' }}
        </button>
      </Transition>
    </template>

    <!-- ── RESULTS ── -->
    <div v-else-if="phase === 'results'" class="text-center">
      <!-- Grade -->
      <div class="mb-6">
        <p class="text-8xl font-black mb-1" :class="gradeColor">{{ grade.note }}</p>
        <p class="text-xl font-bold text-gray-900">{{ grade.label }}</p>
        <p class="text-gray-400 text-sm mt-1">{{ scorePercent }}% · {{ correctCount }} / {{ results.length }} richtig</p>
      </div>

      <!-- Wrong answers -->
      <div v-if="wrongAnswers.length > 0" class="text-left mb-6">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Falsche Antworten ({{ wrongAnswers.length }})
        </p>
        <div class="space-y-2">
          <div
            v-for="(r, i) in wrongAnswers"
            :key="i"
            class="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-left"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs px-1.5 py-0.5 rounded bg-gray-200 text-gray-600 font-medium">{{ typeLabel[r.question.type] }}</span>
            </div>
            <p class="text-sm text-gray-700 mb-1 leading-snug">{{ r.question.prompt }}</p>
            <p class="text-sm"><span class="line-through text-red-400">{{ r.userAnswer }}</span></p>
            <p class="text-sm text-green-600 font-medium">{{ r.question.correctDisplay }}</p>
          </div>
        </div>
      </div>
      <div v-else class="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-4">
        <p class="text-green-700 font-semibold">Perfekt! Keine Fehler.</p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3">
        <button
          class="w-full py-3 rounded-xl text-white font-semibold active:scale-[0.98] transition-all"
          style="background-color: #006AA7;"
          @click="startExam"
        >
          Nochmal prüfen
        </button>
        <button
          class="w-full py-3 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:border-swedish-blue hover:text-swedish-blue transition-colors active:scale-[0.98]"
          @click="phase = 'setup'"
        >
          Einstellungen ändern
        </button>
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
