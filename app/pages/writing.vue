<script setup lang="ts">
import { LEVEL_ORDER, type CefrLevel } from '~/stores/user'
import { getTodayTopic } from '~/utils/topics'

const userStore = useUserStore()
const writingStore = useWritingStore()

const currentLevel = computed<CefrLevel>(() =>
  (LEVEL_ORDER as readonly CefrLevel[]).findLast(l => userStore.isLevelUnlocked(l)) ?? userStore.startingLevel
)

const todayTopic = getTodayTopic()
const task = computed(() => writingStore.getTodayTask(currentLevel.value, todayTopic))
const isTodayDone = computed(() => writingStore.isTodayDone(currentLevel.value, todayTopic))

const phase = ref<'write' | 'submitted'>(isTodayDone.value ? 'submitted' : 'write')
const copied = ref(false)

const wordCount = computed(() =>
  writingStore.draft.trim() === '' ? 0 : writingStore.draft.trim().split(/\s+/).length
)

const submittedText = computed(() => writingStore.getEntry(task.value.id)?.text ?? '')

function submit() {
  writingStore.submitEntry(task.value.id, writingStore.draft)
  phase.value = 'submitted'
}

async function copyFeedbackPrompt() {
  const text = submittedText.value
  const level = currentLevel.value
  const prompt = `Du bist ein hilfreicher Schwedischlehrer. Ich lerne Schwedisch auf Niveau ${level} (Gemeinsamer Europäischer Referenzrahmen).

## Aufgabe
${task.value.prompt}

## Mein Text
${text}

## Deine Aufgabe
Gib mir strukturiertes Feedback auf Deutsch. Halte dich genau an dieses Format:

### 1. Stärken
2–3 konkrete Dinge, die ich gut gemacht habe (Satzbau, Wortschatz, Ausdruck usw.).

### 2. Grammatikkorrekturen
Liste alle Grammatikfehler auf. Für jeden Fehler:
- Zeige den falschen Satz (oder Satzteil)
- Erkläre kurz die Regel auf Deutsch
- Gib die korrigierte Version

### 3. Vokabelvorschläge
Schlage 3–5 alternative oder ergänzende Vokabeln / Ausdrücke vor, die meinen Text auf Niveau ${level} bereichern würden. Für jedes Wort: schwedisch, deutsch, ein Beispielsatz.

### 4. Korrigierte Version
Schreibe meinen Text vollständig neu – mit allen Korrekturen, aber möglichst nah an meinem Original.

### 5. Nächste Schritte
Gib mir 1–2 konkrete Lernempfehlungen für das, was ich als nächstes üben sollte, basierend auf meinen Fehlern.`

  try {
    await navigator.clipboard.writeText(prompt)
    copied.value = true
  } catch {
    // Fallback: show a pre-selected textarea
    const ta = document.createElement('textarea')
    ta.value = prompt
    ta.style.position = 'fixed'
    ta.style.top = '0'
    ta.style.left = '0'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8 pb-24">
    <!-- Back -->
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-ink-tertiary hover:text-ink-secondary mb-8">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Start
    </NuxtLink>

    <!-- Header -->
    <div class="mb-7">
      <p class="text-[10px] font-bold tracking-[0.18em] uppercase text-brand/60 mb-2">Tagesaufgabe · Schreiben</p>
      <h1 class="text-3xl font-bold text-ink-primary leading-tight">{{ task.title }}</h1>
    </div>

    <!-- Write phase -->
    <template v-if="phase === 'write'">
      <!-- Task prompt — left-accent card -->
      <div class="relative rounded-2xl bg-white border border-gray-100 overflow-hidden mb-6" style="box-shadow: var(--shadow-card);">
        <div class="absolute left-0 top-0 bottom-0 w-[3px]" style="background: var(--color-brand);"></div>
        <div class="px-5 py-5">
          <p class="text-sm text-ink-secondary leading-relaxed">{{ task.prompt }}</p>
          <div class="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
            <svg class="w-3 h-3 text-brand/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p class="text-[11px] text-ink-tertiary">{{ task.minWords }}–{{ task.maxWords }} Wörter · auf Schwedisch</p>
          </div>
        </div>
      </div>

      <!-- Textarea -->
      <div class="mb-5">
        <textarea
          v-model="writingStore.draft"
          class="w-full min-h-52 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-ink-primary leading-relaxed resize-none focus:outline-none focus:border-brand placeholder:text-ink-tertiary transition-colors duration-200"
          placeholder="Skriv på svenska här…"
          style="box-shadow: var(--shadow-card);"
        />
        <!-- Word count progress -->
        <div class="flex items-center gap-3 mt-2 px-1">
          <div class="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="wordCount >= task.minWords ? 'bg-correct' : 'bg-brand'"
              :style="{ width: `${Math.min(100, wordCount > 0 ? (wordCount / task.minWords) * 100 : 0)}%` }"
            />
          </div>
          <p
            class="text-xs tabular-nums flex-shrink-0 transition-colors duration-200"
            :class="wordCount >= task.minWords ? 'text-correct font-semibold' : 'text-ink-tertiary'"
          >{{ wordCount }} / {{ task.minWords }}+</p>
        </div>
      </div>

      <!-- Submit button -->
      <button
        class="btn-primary"
        :disabled="wordCount < 3"
        @click="submit"
      >
        Abgeben
      </button>
    </template>

    <!-- Submitted phase -->
    <template v-else>
      <!-- Compact success row -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-9 h-9 rounded-full bg-correct flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-ink-primary">Aufgabe erledigt!</p>
          <p class="text-xs text-ink-tertiary">{{ task.title }}</p>
        </div>
      </div>

      <!-- Submitted text — journal-entry style -->
      <div class="relative rounded-2xl bg-white border border-gray-100 overflow-hidden mb-6" style="box-shadow: var(--shadow-card);">
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-correct/40"></div>
        <div class="px-5 py-5">
          <p class="text-[10px] font-bold tracking-[0.15em] uppercase text-ink-tertiary mb-3">Dein Text</p>
          <p class="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{{ submittedText }}</p>
        </div>
      </div>

      <!-- Copy feedback prompt -->
      <button
        class="btn-primary mb-3 flex items-center justify-center gap-2 transition-colors duration-300"
        :class="copied ? 'bg-correct' : ''"
        @click="copyFeedbackPrompt"
      >
        <Transition name="swap" mode="out-in">
          <span v-if="!copied" key="default" class="flex items-center gap-2">
            KI-Feedback holen
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </span>
          <span v-else key="copied" class="flex items-center gap-2">
            Prompt kopiert
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </Transition>
      </button>
      <Transition name="next-step">
        <div v-if="copied" class="mt-4">
          <p class="text-sm text-ink-secondary text-center mb-4">Jetzt in ChatGPT oder Claude einfügen und Feedback lesen.</p>
          <NuxtLink to="/learn?mode=daily" class="btn-secondary flex items-center justify-center gap-2">
            Weiter lernen
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.next-step-enter-active {
  animation: fadeSlideIn 0.3s ease-out both;
}

.swap-enter-active, .swap-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
