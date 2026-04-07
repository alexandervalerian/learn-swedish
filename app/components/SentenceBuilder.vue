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

// Strip surrounding punctuation for comparison only
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-zåäöA-ZÅÄÖ\s]/g, '').trim()
}

function tokenize(sentence: string): string[] {
  return sentence.split(' ').filter(Boolean)
}

function buildBank(): Tile[] {
  const correctTokens = tokenize(props.swedish)
  const normalizedTokens = new Set(correctTokens.map(t => normalize(t)))

  // Sample up to 4 distractors not appearing in the sentence
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
    <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
      <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Deutsch</p>
      <p class="text-lg font-medium text-gray-800">{{ german }}</p>
    </div>

    <!-- Answer area -->
    <div
      class="min-h-[68px] border-2 border-dashed rounded-2xl p-3 flex flex-wrap gap-2 items-center transition-colors"
      :class="submitted
        ? isCorrect ? 'border-green-400 bg-green-50' : 'border-red-300 bg-red-50'
        : 'border-gray-200 bg-white'"
    >
      <span v-if="!answer.length" class="text-sm text-gray-300 mx-auto select-none">
        Wörter hier eintippen...
      </span>
      <button
        v-for="tile in answer"
        :key="tile.id"
        class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
        :class="submitted
          ? isCorrect
            ? 'bg-green-500 text-white border-green-500 cursor-default'
            : 'bg-red-400 text-white border-red-400 cursor-default'
          : 'bg-swedish-blue text-white border-swedish-blue active:scale-95'"
        :disabled="submitted"
        @click="returnTile(tile)"
      >
        {{ tile.text }}
      </button>
    </div>

    <!-- Correct answer reveal -->
    <Transition name="slide-up">
      <div v-if="submitted && !isCorrect" class="bg-swedish-blue-light rounded-xl px-4 py-3">
        <p class="text-xs font-semibold text-swedish-blue mb-1">Richtige Antwort</p>
        <p class="text-sm font-medium text-gray-900">{{ swedish }}</p>
      </div>
    </Transition>

    <!-- Word bank -->
    <div class="flex flex-wrap gap-2 justify-center min-h-[44px]">
      <button
        v-for="tile in bank"
        :key="tile.id"
        class="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border transition-all"
        :class="submitted
          ? 'border-gray-100 text-gray-300 cursor-default'
          : 'border-gray-200 text-gray-700 hover:border-swedish-blue hover:text-swedish-blue active:scale-95'"
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
          class="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
          :class="answer.length
            ? 'bg-swedish-blue text-white active:scale-[0.98]'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed'"
          :disabled="!answer.length"
          @click="submit"
        >
          Prüfen
        </button>
        <button
          class="px-5 py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors"
          @click="emit('skip')"
        >
          Überspringen
        </button>
      </template>

      <button
        v-else
        class="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.98]"
        :class="isCorrect ? 'bg-green-500' : 'bg-swedish-blue'"
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
