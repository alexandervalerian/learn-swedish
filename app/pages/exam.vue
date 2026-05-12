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

const route = useRoute()
const userStore = useUserStore()
const progressStore = useProgressStore()
const levelContext = computed(() => route.query.level as string | undefined)
const backTarget = computed(() =>
  levelContext.value ? `/level?level=${levelContext.value}` : '/'
)

const allLevels = [
  { data: a1, label: 'A1', pill: 'bg-a1-border text-a1-ink', activePill: 'bg-a1-accent text-white' },
  { data: a2, label: 'A2', pill: 'bg-a2-border text-a2-ink', activePill: 'bg-a2-accent text-white' },
  { data: b1, label: 'B1', pill: 'bg-b1-border text-b1-ink', activePill: 'bg-b1-accent text-white' },
  { data: b2, label: 'B2', pill: 'bg-b2-border text-b2-ink', activePill: 'bg-b2-accent text-white' },
  { data: c1, label: 'C1', pill: 'bg-c1-border text-c1-ink', activePill: 'bg-c1-accent text-white' },
]

const visibleLevels = computed(() =>
  allLevels.filter(l => userStore.isLevelUnlocked(l.label as CefrLevel))
)

const typeLabel: Record<ExamType, string> = {
  'sv-de': 'SV → DE',
  'de-sv': 'DE → SV',
  'lueckentext': 'Lückentext',
}

const phase = ref<'setup' | 'question' | 'results'>('setup')
const selectedLevel = ref<string>(userStore.startingLevel)
const selectedCount = ref<10 | 20 | 'all'>(10)
const selectedTypes = ref<ExamType[]>(['sv-de', 'de-sv', 'lueckentext'])
const canStart = computed(() => selectedTypes.value.length > 0)

const isDailyExam = computed(() => route.query.mode === 'daily')

const dailyPool = ref<Word[]>([])

onMounted(() => {
  if (isDailyExam.value) {
    progressStore.load()
    const allWords = allLevels.flatMap(l => l.data.words as Word[])
    const ids = new Set(progressStore.dailyLearnedIds())
    const pool = allWords.filter(w => ids.has(w.id))
    dailyPool.value = pool
    if (pool.length > 0) {
      selectedTypes.value = ['de-sv']
      startExam(pool)
    }
    return
  }
  const lvl = route.query.level as string | undefined
  if (lvl && allLevels.some(l => l.label === lvl)) {
    selectedLevel.value = lvl
  }
})

const requirePrefix = computed(() => localStorage.getItem('swedish_require_prefix') !== 'false')

const queue = ref<ExamQuestion[]>([])
const currentIndex = ref(0)
const results = ref<QuestionResult[]>([])
const userInput = ref('')
const submitted = ref(false)
const isCorrect = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

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
  const bare = word.swedish.replace(/^(att |en |ett )/, '')
  return word.example.toLowerCase().includes(bare.toLowerCase())
}

function buildQuestion(word: Word, type: ExamType): ExamQuestion {
  if (type === 'sv-de') {
    return { word, type, prompt: word.swedish, accepted: normalizeAnswer(word.german), correctDisplay: word.german }
  }
  if (type === 'de-sv') {
    const bare = word.swedish.replace(/^(att |en |ett )/, '').toLowerCase().trim()
    const accepted = requirePrefix.value
      ? [word.swedish.toLowerCase().trim()]
      : [word.swedish.toLowerCase().trim(), bare]
    return { word, type, prompt: stripArticle(word.german), accepted, correctDisplay: word.swedish }
  }
  const bare = word.swedish.replace(/^(att |en |ett )/, '')
  const gapped = word.example.replace(new RegExp(escapeRegex(bare), 'i'), '___')
  const accepted = requirePrefix.value
    ? [word.swedish.toLowerCase().trim()]
    : [bare.toLowerCase().trim(), word.swedish.toLowerCase().trim()]
  return {
    word, type, prompt: gapped,
    accepted,
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

function startExam(wordOverride?: Word[]) {
  let pool: Word[]
  if (wordOverride) {
    pool = wordOverride
  } else {
    const lvl = allLevels.find(l => l.label === selectedLevel.value)!
    const words: Word[] = [...(lvl.data.words as Word[])]
    const n = selectedCount.value === 'all' ? words.length : selectedCount.value
    pool = words.sort(() => Math.random() - 0.5).slice(0, n)
  }

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
  if (!isCorrect.value) {
    progressStore.rateCard(current.value.word.id, 0, false)
  }
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
  if (n <= 2) return 'text-correct'
  if (n === 3) return 'text-brand'
  if (n === 4) return 'text-b2-ink'
  return 'text-wrong'
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
      <NuxtLink :to="backTarget" class="page-back-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </NuxtLink>
      <div class="flex-1 min-w-0">
        <h2 class="font-bold text-ink-primary">Vokabelprüfung</h2>
        <p class="text-xs text-ink-tertiary">
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
        <p class="section-label">Niveau</p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="lvl in visibleLevels"
            :key="lvl.label"
            class="px-3 py-1.5 rounded-full text-sm font-semibold transition-all"
            :class="selectedLevel === lvl.label ? lvl.activePill : lvl.pill"
            @click="selectedLevel = lvl.label"
          >
            {{ lvl.label }}
          </button>
        </div>
      </div>

      <!-- Question count -->
      <div>
        <p class="section-label">Anzahl der Fragen</p>
        <div class="flex gap-2">
          <button
            v-for="count in ([10, 20, 'all'] as const)"
            :key="count"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            :class="selectedCount === count
              ? 'bg-brand text-white'
              : 'bg-surface-inset text-ink-secondary hover:bg-brand-subtle hover:text-brand'"
            @click="selectedCount = count"
          >
            {{ count === 'all' ? 'Alle' : count }}
          </button>
        </div>
      </div>

      <!-- Exam types -->
      <div>
        <p class="section-label">Prüfungsarten</p>
        <div class="card overflow-hidden divide-y divide-surface-inset">
          <label
            v-for="t in (['sv-de', 'de-sv', 'lueckentext'] as ExamType[])"
            :key="t"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-inset/50 transition-colors"
          >
            <input type="checkbox" v-model="selectedTypes" :value="t" class="accent-brand w-4 h-4" />
            <div>
              <p class="text-sm font-medium text-ink-primary">{{ typeLabel[t] }}</p>
              <p class="text-xs text-ink-tertiary">
                <template v-if="t === 'sv-de'">Schwedisches Wort sehen, deutsche Übersetzung eintippen</template>
                <template v-else-if="t === 'de-sv'">Deutsches Wort sehen, schwedische Übersetzung eintippen</template>
                <template v-else>Lücke im Beispielsatz auf Schwedisch ausfüllen</template>
              </p>
            </div>
          </label>
        </div>
      </div>

      <button class="btn-primary" :disabled="!canStart" @click="() => startExam()">
        Prüfung starten
      </button>
    </div>

    <!-- ── QUESTION ── -->
    <template v-else-if="phase === 'question' && current">
      <div class="progress-track mb-6">
        <div
          class="progress-fill"
          :style="{ width: `${(currentIndex / Math.max(queue.length, 1)) * 100}%` }"
        />
      </div>

      <p class="section-label">{{ typeLabel[current.type] }}</p>

      <!-- Prompt -->
      <div class="min-h-20 mb-6 my-6">
        <template v-if="currentPromptParts">
          <p class="text-xl font-medium text-ink-primary leading-relaxed">
            {{ currentPromptParts.before }}<span class="text-brand font-bold border-b-2 border-brand">___</span>{{ currentPromptParts.after }}
          </p>
          <p class="text-xs text-ink-tertiary mt-2 italic">{{ current.word.exampleTranslation }}</p>
        </template>
        <p v-else class="text-4xl font-bold text-ink-primary">{{ current.prompt }}</p>
      </div>

      <!-- Input -->
      <div class="space-y-3">
        <input
          ref="inputRef"
          v-model="userInput"
          type="text"
          placeholder="Antwort eintippen…"
          class="w-full px-4 py-3 rounded-2xl border-2 text-ink-primary text-lg outline-none transition-colors"
          :class="submitted
            ? isCorrect ? 'border-correct-border bg-correct-bg' : 'border-wrong-border bg-wrong-bg'
            : 'border-gray-200 focus:border-brand'"
          :readonly="submitted"
          @keydown.enter="handleEnter"
        />

        <button
          v-if="!submitted"
          class="btn-primary"
          :disabled="!userInput.trim()"
          @click="submitAnswer"
        >
          Prüfen
        </button>
      </div>

      <Transition name="slide-up">
        <div v-if="submitted" class="mt-4 rounded-xl px-4 py-3" :class="isCorrect ? 'bg-correct-bg border border-correct-border' : 'bg-wrong-bg border border-wrong-border'">
          <div class="flex items-start gap-2">
            <span class="text-lg mt-0.5">{{ isCorrect ? '✓' : '✗' }}</span>
            <div class="flex-1">
              <p class="font-semibold text-sm" :class="isCorrect ? 'text-correct' : 'text-wrong'">
                {{ isCorrect ? 'Richtig!' : 'Falsch' }}
              </p>
              <p v-if="!isCorrect" class="text-sm text-ink-secondary mt-0.5">
                Richtig: <span class="font-semibold">{{ current.correctDisplay }}</span>
              </p>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="slide-up">
        <button
          v-if="submitted"
          class="btn-secondary mt-3"
          @click="advance"
        >
          {{ currentIndex + 1 < queue.length ? 'Weiter →' : 'Ergebnis anzeigen →' }}
        </button>
      </Transition>
    </template>

    <!-- ── RESULTS ── -->
    <div v-else-if="phase === 'results'" class="text-center">
      <div class="mb-6">
        <p class="text-8xl font-black mb-1" :class="gradeColor">{{ grade.note }}</p>
        <p class="text-xl font-bold text-ink-primary">{{ grade.label }}</p>
        <p class="text-ink-tertiary text-sm mt-1">{{ scorePercent }}% · {{ correctCount }} / {{ results.length }} richtig</p>
        <p class="text-[11px] text-ink-tertiary/50 mt-2">1 Sehr gut ≥92% · 2 Gut ≥81% · 3 Befriedigend ≥67% · 4 Ausreichend ≥50%</p>
      </div>

      <!-- Wrong answers -->
      <div v-if="wrongAnswers.length > 0" class="text-left mb-6">
        <p class="section-label">Falsche Antworten ({{ wrongAnswers.length }})</p>
        <div class="card overflow-hidden divide-y divide-surface-inset">
          <div
            v-for="(r, i) in wrongAnswers"
            :key="i"
            class="px-4 py-3 text-left"
          >
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-surface-inset text-ink-secondary font-medium">{{ typeLabel[r.question.type] }}</span>
            <p class="text-sm text-ink-secondary mt-1 mb-0.5 leading-snug">{{ r.question.prompt }}</p>
            <p class="text-sm"><span class="line-through text-wrong/70">{{ r.userAnswer }}</span></p>
            <p class="text-sm text-correct font-medium">{{ r.question.correctDisplay }}</p>
          </div>
        </div>
      </div>
      <div v-else class="mb-6 rounded-xl bg-correct-bg border border-correct-border px-4 py-4">
        <p class="text-correct font-semibold">Perfekt! Keine Fehler.</p>
      </div>

      <div class="flex flex-col gap-3">
        <button class="btn-primary" @click="isDailyExam ? startExam([...dailyPool.value].sort(() => Math.random() - 0.5)) : startExam()">Nochmal prüfen</button>
        <button class="btn-secondary" @click="phase = 'setup'">Einstellungen ändern</button>
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
