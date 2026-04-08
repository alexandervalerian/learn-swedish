<script setup lang="ts">
import { RATING_LABELS, RATING_COLORS, type Rating } from '~/composables/useSpacedRepetition'
import { LEVEL_META } from '~/utils/levels'
import type { CefrLevel } from '~/stores/user'

const props = defineProps<{
  swedish: string
  german: string
  example: string
  exampleTranslation: string
  level: string
  reverse?: boolean
  autoPlay?: boolean
  listenMode?: boolean
}>()

const emit = defineEmits<{
  rate: [rating: Rating]
}>()

const { speak, cancel, speaking } = useSpeech()

const levelEmoji = computed(() => LEVEL_META[props.level as CefrLevel]?.emoji ?? '')

const flipped = ref(false)

function speakWord() {
  speak(props.swedish)
}

function speakExample() {
  speak(`${props.swedish}. ${props.example}`, 0.8)
}

onMounted(() => {
  if (props.autoPlay) speakWord()
})

onUnmounted(() => {
  cancel()
})

function flip() {
  if (!flipped.value) {
    cancel()
    flipped.value = true
  }
}

function rate(rating: Rating) {
  flipped.value = false
  emit('rate', rating)
}

const ratings: Rating[] = [0, 1, 2, 3]
</script>

<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
    <!-- Card -->
    <div
      class="w-full [perspective:1000px] cursor-pointer select-none"
      style="height: 260px;"
      @click="flip"
    >
      <div class="card-inner w-full h-full" :class="{ flipped }">
        <!-- Front -->
        <div class="card-face absolute inset-0 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-6 border border-gray-100">
          <span class="text-xs font-semibold uppercase tracking-widest text-swedish-blue mb-4">{{ levelEmoji }} {{ level }}</span>

          <!-- Listen mode: large speaker, no text -->
          <template v-if="listenMode">
            <button
              class="w-20 h-20 flex items-center justify-center rounded-full text-5xl transition-colors focus:outline-none"
              :class="speaking ? 'animate-pulse bg-blue-100' : 'hover:bg-blue-50'"
              @click.stop="speakWord"
            >
              🔊
            </button>
            <p class="mt-4 text-sm text-gray-400">Tippen zum Anhören</p>
            <p v-if="!flipped" class="mt-1 text-xs text-gray-300">Dann Karte umdrehen</p>
          </template>

          <!-- Normal mode: word + speaker -->
          <template v-else>
            <p class="text-4xl font-bold text-gray-900 text-center leading-tight">
              {{ props.reverse ? german : swedish }}
            </p>
            <button
              class="mt-3 w-11 h-11 flex items-center justify-center rounded-full transition-colors focus:outline-none"
              :class="speaking ? 'text-swedish-blue bg-blue-50' : 'text-gray-300 hover:text-swedish-blue hover:bg-blue-50'"
              @click.stop="speakWord"
            >
              🔊
            </button>
            <p v-if="!flipped" class="mt-1 text-sm text-gray-400">Tippen zum Umdrehen</p>
          </template>
        </div>

        <!-- Back -->
        <div class="card-face card-back-face absolute inset-0 bg-swedish-blue rounded-2xl shadow-lg flex flex-col overflow-hidden">
          <div class="h-1 flex-shrink-0" style="background-color: #FECC02;"></div>
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            <p class="text-3xl font-bold text-white text-center leading-tight">
              {{ props.reverse ? swedish : german }}
            </p>
            <div class="mt-4 border-t border-white/20 pt-4 w-full text-center">
              <p class="text-sm text-white/90 italic">{{ example }}</p>
              <p class="text-xs text-white/60 mt-1">{{ exampleTranslation }}</p>
              <button
                class="mt-3 px-3 py-1.5 rounded-full text-xs transition-colors focus:outline-none flex items-center gap-1 mx-auto"
                :class="speaking ? 'bg-white/20 text-white animate-pulse' : 'text-white/40 hover:bg-white/20 hover:text-white'"
                @click.stop="speakExample"
              >
                🔊 Beispiel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rating buttons — only after flip -->
    <Transition name="fade">
      <div v-if="flipped" class="grid grid-cols-4 gap-2 w-full">
        <button
          v-for="r in ratings"
          :key="r"
          class="py-3 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
          :class="RATING_COLORS[r]"
          @click.stop="rate(r)"
        >
          {{ RATING_LABELS[r] }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
