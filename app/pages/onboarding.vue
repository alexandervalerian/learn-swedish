<script setup lang="ts">
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

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
  <div
    class="min-h-screen flex items-center justify-center p-4 font-sans antialiased"
    style="background: linear-gradient(160deg, var(--color-brand-dark) 0%, var(--color-brand) 65%, var(--color-brand-mid) 100%);"
  >
    <div class="w-full max-w-md">

      <!-- Swedish flag -->
      <div class="flex flex-col items-center mb-8">
        <svg viewBox="0 0 16 10" class="w-36 h-[90px] rounded-2xl mb-5" style="box-shadow: var(--shadow-float);">
          <rect width="16" height="10" fill="#006AA7"/>
          <rect x="5" width="2" height="10" fill="#FECC02"/>
          <rect y="4" width="16" height="2" fill="#FECC02"/>
        </svg>
        <div class="flex gap-2">
          <span
            v-for="e in ['🌲','⛵','🏔️','❄️','🦌']"
            :key="e"
            class="text-xl bg-white/15 rounded-xl px-2.5 py-1.5"
          >{{ e }}</span>
        </div>
      </div>

      <!-- Steps -->
      <Transition name="fade" mode="out-in">
        <!-- Step 1: Name -->
        <div v-if="step === 1" key="step1">
          <h1 class="text-3xl font-bold text-white text-center mb-2">Välkommen!</h1>
          <p class="text-center text-white/70 mb-8">Dein schwedisches Abenteuer beginnt 🌿</p>

          <div class="bg-white rounded-2xl p-6" style="box-shadow: var(--shadow-float);">
            <label class="block text-sm font-medium text-ink-secondary mb-2">Wie heißt du?</label>
            <input
              v-model="nameInput"
              type="text"
              maxlength="30"
              autofocus
              placeholder="Dein Name"
              class="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-brand transition-colors text-ink-primary"
              @keydown.enter="goToStep2"
            />
          </div>

          <button
            :disabled="!nameInput.trim()"
            class="mt-4 w-full py-4 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]"
            :class="nameInput.trim()
              ? 'bg-gold text-brand-deeper'
              : 'bg-white/30 text-white/50 cursor-not-allowed'"
            @click="goToStep2"
          >
            Weiter
          </button>
        </div>

        <!-- Step 2: Level picker -->
        <div v-else key="step2">
          <h1 class="text-2xl font-bold text-white text-center mb-1">
            Hej, {{ nameInput.trim() }}!
          </h1>
          <p class="text-center text-white/70 mb-6">Auf welchem Niveau bist du?</p>

          <div class="space-y-2">
            <button
              v-for="level in LEVEL_ORDER"
              :key="level"
              class="w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left"
              :class="selectedLevel === level
                ? 'border-gold bg-white'
                : 'border-white/25 bg-white/90'"
              :style="selectedLevel === level ? 'box-shadow: var(--shadow-raised);' : ''"
              @click="selectedLevel = level"
            >
              <span
                class="text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                :class="selectedLevel === level
                  ? LEVEL_META[level].activePill
                  : LEVEL_META[level].pill"
              >{{ LEVEL_META[level].emoji }} {{ level }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-ink-primary truncate">{{ levelInfo[level].description }}</p>
                <p class="text-xs text-ink-tertiary">{{ levelInfo[level].hint }}</p>
              </div>
              <svg v-if="selectedLevel === level" class="w-5 h-5 text-brand flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <button
            class="mt-6 w-full py-4 rounded-2xl font-bold text-brand-deeper text-lg bg-gold active:scale-[0.98] transition-all"
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
