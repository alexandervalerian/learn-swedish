<script setup lang="ts">
interface Tile {
  id: string
  text: string
}

const props = defineProps<{
  swedish: string
  german: string
  level: string
  distractorPool: string[]
}>()

const emit = defineEmits<{
  correct: []
  incorrect: []
  skip: []
}>()

let tileSeq = 0
function makeTile(text: string): Tile {
  return { id: `t_${tileSeq++}`, text }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zåäöA-ZÅÄÖ\s]/g, '').trim()
}

function tokenize(sentence: string): string[] {
  return sentence.split(' ').filter(Boolean)
}

function buildBank(): Tile[] {
  const correctTokens = tokenize(props.swedish)
  const normalizedTokens = new Set(correctTokens.map(t => normalize(t)))

  const distractors = props.distractorPool
    .filter(w => !normalizedTokens.has(normalize(w)))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)

  return [...correctTokens, ...distractors]
    .sort(() => Math.random() - 0.5)
    .map(makeTile)
}

const bank = ref<Tile[]>([])
const answer = ref<Tile[]>([])
const submitted = ref(false)
const isCorrect = ref(false)

function init() {
  bank.value = buildBank()
  answer.value = []
  submitted.value = false
  isCorrect.value = false
}

onMounted(init)
watch(() => props.swedish, init)

function pickTile(tile: Tile) {
  if (submitted.value) return
  bank.value = bank.value.filter(t => t.id !== tile.id)
  answer.value.push(tile)
}

function returnTile(tile: Tile) {
  if (submitted.value) return
  answer.value = answer.value.filter(t => t.id !== tile.id)
  bank.value.push(tile)
}

function submit() {
  if (!answer.value.length || submitted.value) return
  const userAnswer = answer.value.map(t => t.text).join(' ')
  isCorrect.value = normalize(userAnswer) === normalize(props.swedish)
  submitted.value = true
}

function next() {
  if (isCorrect.value) emit('correct')
  else emit('incorrect')
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full max-w-sm mx-auto">
    <!-- German prompt -->
    <div class="bg-surface-inset rounded-2xl p-4 text-center">
      <p class="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-1">Deutsch</p>
      <p class="text-lg font-medium text-ink-primary">{{ german }}</p>
    </div>

    <!-- Answer area -->
    <div
      class="min-h-[68px] border-2 border-dashed rounded-2xl p-3 flex flex-wrap gap-2 items-center transition-colors"
      :class="submitted
        ? isCorrect ? 'border-correct-border bg-correct-bg' : 'border-wrong-border bg-wrong-bg'
        : 'border-gray-200 bg-white'"
    >
      <span v-if="!answer.length" class="text-sm text-ink-tertiary/50 mx-auto select-none">
        Wörter hier eintippen...
      </span>
      <button
        v-for="tile in answer"
        :key="tile.id"
        class="px-3 py-1.5 rounded-xl text-sm font-medium border transition-all"
        :class="submitted
          ? isCorrect
            ? 'bg-correct text-white border-correct cursor-default'
            : 'bg-wrong text-white border-wrong cursor-default'
          : 'bg-brand text-white border-brand active:scale-95'"
        :disabled="submitted"
        @click="returnTile(tile)"
      >
        {{ tile.text }}
      </button>
    </div>

    <!-- Correct answer reveal -->
    <Transition name="slide-up">
      <div v-if="submitted && !isCorrect" class="bg-brand-subtle border border-brand-muted rounded-xl px-4 py-3">
        <p class="text-xs font-semibold text-brand mb-1">Richtige Antwort</p>
        <p class="text-sm font-medium text-ink-primary">{{ swedish }}</p>
      </div>
    </Transition>

    <!-- Word bank -->
    <div class="flex flex-wrap gap-2 justify-center min-h-[44px]">
      <button
        v-for="tile in bank"
        :key="tile.id"
        class="px-3 py-1.5 rounded-xl text-sm font-medium bg-white border transition-all"
        :class="submitted
          ? 'border-gray-100 text-ink-tertiary/40 cursor-default'
          : 'border-gray-200 text-ink-secondary hover:border-brand hover:text-brand hover:bg-brand-subtle active:scale-95'"
        :disabled="submitted"
        @click="pickTile(tile)"
      >
        {{ tile.text }}
      </button>
    </div>

    <!-- Actions -->
    <div class="flex gap-3 pt-1">
      <template v-if="!submitted">
        <button
          class="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all"
          :class="answer.length
            ? 'bg-brand text-white active:scale-[0.98]'
            : 'bg-surface-inset text-ink-tertiary cursor-not-allowed'"
          :disabled="!answer.length"
          @click="submit"
        >
          Prüfen
        </button>
        <button
          class="btn-ghost"
          @click="emit('skip')"
        >
          Überspringen
        </button>
      </template>

      <button
        v-else
        class="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-all active:scale-[0.98]"
        :class="isCorrect ? 'bg-correct' : 'bg-brand'"
        @click="next"
      >
        {{ isCorrect ? 'Weiter ✓' : 'Nächste →' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
