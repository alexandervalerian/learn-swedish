<script setup lang="ts">
import { RATING_LABELS, RATING_COLORS, type Rating } from '~/composables/useSpacedRepetition'

const props = defineProps<{
  swedish: string
  german: string
  example: string
  exampleTranslation: string
  level: string
  reverse?: boolean
}>()

const emit = defineEmits<{
  rate: [rating: Rating]
}>()

const flipped = ref(false)

function flip() {
  if (!flipped.value) flipped.value = true
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
          <span class="text-xs font-semibold uppercase tracking-widest text-swedish-blue mb-4">{{ level }}</span>
          <p class="text-4xl font-bold text-gray-900 text-center leading-tight">
            {{ props.reverse ? german : swedish }}
          </p>
          <p class="mt-6 text-sm text-gray-400">Tippen zum Umdrehen</p>
        </div>

        <!-- Back -->
        <div class="card-face card-back-face absolute inset-0 bg-swedish-blue rounded-2xl shadow-lg flex flex-col items-center justify-center p-6">
          <p class="text-3xl font-bold text-white text-center leading-tight">
            {{ props.reverse ? swedish : german }}
          </p>
          <div class="mt-4 border-t border-white/20 pt-4 w-full text-center">
            <p class="text-sm text-white/90 italic">{{ example }}</p>
            <p class="text-xs text-white/60 mt-1">{{ exampleTranslation }}</p>
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
