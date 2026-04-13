<script setup lang="ts">
import { RATING_LABELS, type Rating } from '~/composables/useSpacedRepetition'
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
  availableRatings?: Rating[]
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

const ratings = computed<Rating[]>(() => props.availableRatings ?? [0, 1, 2, 3])

const ratingClass: Record<Rating, string> = {
  0: 'bg-wrong-bg text-wrong border border-wrong-border rounded-2xl hover:bg-red-100',
  1: 'bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl hover:bg-amber-100',
  2: 'bg-brand-subtle text-brand border border-brand-muted rounded-2xl hover:bg-blue-100',
  3: 'bg-correct-bg text-correct border border-correct-border rounded-2xl hover:bg-green-100',
}
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
        <div class="card-face absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center p-6" style="box-shadow: var(--shadow-raised);">
          <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-mid mb-4">{{ levelEmoji }} {{ level }}</span>

          <!-- Listen mode -->
          <template v-if="listenMode">
            <button
              class="w-20 h-20 flex items-center justify-center rounded-full text-5xl transition-colors focus:outline-none"
              :class="speaking ? 'animate-pulse bg-brand-subtle' : 'hover:bg-brand-subtle'"
              @click.stop="speakWord"
            >
              🔊
            </button>
            <p class="mt-4 text-sm text-ink-tertiary">Tippen zum Anhören</p>
            <p v-if="!flipped" class="mt-1 text-xs text-ink-tertiary/60">Dann Karte umdrehen</p>
          </template>

          <!-- Normal mode -->
          <template v-else>
            <p class="text-[2.75rem] font-bold text-ink-primary text-center leading-tight">
              {{ props.reverse ? german : swedish }}
            </p>
            <button
              class="mt-3 w-11 h-11 flex items-center justify-center rounded-full transition-all focus:outline-none"
              :class="speaking ? 'bg-brand-subtle text-brand animate-pulse' : 'bg-surface-inset text-ink-tertiary hover:bg-brand-subtle hover:text-brand'"
              @click.stop="speakWord"
            >
              🔊
            </button>
            <p v-if="!flipped" class="mt-2 text-xs text-ink-tertiary/70">Tippen zum Umdrehen</p>
          </template>
        </div>

        <!-- Back -->
        <div
          class="card-face card-back-face absolute inset-0 rounded-2xl shadow-lg flex flex-col overflow-hidden"
          style="background: radial-gradient(ellipse at 30% 0%, rgba(254,204,2,0.15) 0%, transparent 60%), var(--color-brand);"
        >
          <!-- Centered gold dash -->
          <div class="w-8 h-0.5 bg-gold mx-auto mt-4 mb-0 rounded-full flex-shrink-0"></div>
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            <p class="text-2xl font-bold text-white text-center leading-tight">
              {{ props.reverse ? swedish : german }}
            </p>
            <div class="mt-4 bg-white/10 rounded-xl px-4 py-3 w-full text-center">
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

    <!-- Rating buttons -->
    <Transition name="fade">
      <div v-if="flipped" class="grid gap-2 w-full" :class="ratings.length === 3 ? 'grid-cols-3' : 'grid-cols-4'">
        <button
          v-for="r in ratings"
          :key="r"
          class="py-3 text-sm font-bold transition-all active:scale-95"
          :class="ratingClass[r]"
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
