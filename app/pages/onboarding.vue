<script setup lang="ts">
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'

definePageMeta({ layout: false })

const userStore = useUserStore()

const step = ref<1 | 2>(1)
const nameInput = ref('')
const selectedLevel = ref<CefrLevel>('A1')

const levelInfo: Record<CefrLevel, { description: string; hint: string }> = {
  A1: { description: 'Grundläggande – Grundkenntnisse', hint: 'Absolute Anfänger' },
  A2: { description: 'Grundstufe – Grundkenntnisse (erweitert)', hint: 'Grundlegende Kenntnisse' },
  B1: { description: 'Mittelstufe – Selbstständige Sprachverwendung', hint: 'Mittelstufe' },
  B2: { description: 'Selbstständige Sprachverwendung', hint: 'Obere Mittelstufe' },
  C1: { description: 'Kompetente Sprachverwendung', hint: 'Fortgeschrittene' }
}

function goToStep2() {
  if (nameInput.value.trim()) step.value = 2
}

function finish() {
  userStore.completeOnboarding(nameInput.value, selectedLevel.value)
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- Swedish flag accent -->
      <div class="flex justify-center mb-8">
        <div class="w-16 h-16 bg-swedish-blue rounded-2xl flex items-center justify-center shadow-lg">
          <svg class="w-10 h-10 text-swedish-yellow" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>

      <!-- Step 1: Name -->
      <Transition name="fade" mode="out-in">
        <div v-if="step === 1" key="step1">
          <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">Välkommen!</h1>
          <p class="text-center text-gray-500 mb-8">Lär dig Svenska – Lerne Schwedisch</p>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Wie heißt du?</label>
            <input
              v-model="nameInput"
              type="text"
              maxlength="30"
              autofocus
              placeholder="Dein Name"
              class="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-swedish-blue focus:border-transparent"
              @keydown.enter="goToStep2"
            />
          </div>

          <button
            :disabled="!nameInput.trim()"
            class="mt-4 w-full py-4 rounded-2xl font-semibold text-white text-lg transition-all"
            :class="nameInput.trim()
              ? 'bg-swedish-blue active:scale-[0.98]'
              : 'bg-gray-300 cursor-not-allowed'"
            @click="goToStep2"
          >
            Weiter
          </button>
        </div>

        <!-- Step 2: Level picker -->
        <div v-else key="step2">
          <h1 class="text-2xl font-bold text-gray-900 text-center mb-1">
            Hej, {{ nameInput.trim() }}!
          </h1>
          <p class="text-center text-gray-500 mb-6">Auf welchem Niveau bist du?</p>

          <div class="space-y-3">
            <button
              v-for="level in LEVEL_ORDER"
              :key="level"
              class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
              :class="selectedLevel === level
                ? 'border-swedish-blue bg-swedish-blue-light'
                : 'border-gray-100 bg-white'"
              @click="selectedLevel = level"
            >
              <span
                class="text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                :class="selectedLevel === level
                  ? 'bg-swedish-blue text-white'
                  : 'bg-gray-100 text-gray-600'"
              >{{ level }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ levelInfo[level].description }}</p>
                <p class="text-xs text-gray-400">{{ levelInfo[level].hint }}</p>
              </div>
              <svg v-if="selectedLevel === level" class="w-5 h-5 text-swedish-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <button
            class="mt-6 w-full py-4 rounded-2xl font-semibold text-white text-lg bg-swedish-blue active:scale-[0.98] transition-all"
            @click="finish"
          >
            Lernen beginnen
          </button>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
