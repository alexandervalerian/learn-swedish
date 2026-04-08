<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

const store = useProgressStore()
const userStore = useUserStore()

// ---- Name editing ----
const nameEdit = ref(userStore.name)
function saveName() {
  if (nameEdit.value.trim() && nameEdit.value.trim() !== userStore.name)
    userStore.changeName(nameEdit.value)
}

// ---- Learn mode ----
type LearnMode = 'sv-de' | 'de-sv' | 'listen'
const MODE_KEY = 'swedish_mode'
const learnMode = ref<LearnMode>(
  (['sv-de', 'de-sv', 'listen'] as LearnMode[]).includes(
    localStorage.getItem(MODE_KEY) as LearnMode
  )
    ? (localStorage.getItem(MODE_KEY) as LearnMode)
    : 'sv-de'
)
watch(learnMode, val => localStorage.setItem(MODE_KEY, val))

const learnModes: { value: LearnMode; label: string }[] = [
  { value: 'sv-de', label: 'SV → DE' },
  { value: 'de-sv', label: 'DE → SV' },
  { value: 'listen', label: '🔊 Hören' },
]

// ---- Level modal ----
const showLevelModal = ref(false)
const pendingLevel = ref<CefrLevel>(userStore.startingLevel)

const levelOptions: { label: CefrLevel; fullLabel: string; pill: string; activePill: string }[] = [
  { label: 'A1', fullLabel: '🌲 A1 – Anfänger', pill: 'bg-emerald-100 text-emerald-700', activePill: 'bg-emerald-500 text-white' },
  { label: 'A2', fullLabel: '⛵ A2 – Grundlagen', pill: 'bg-sky-100 text-sky-700', activePill: 'bg-sky-500 text-white' },
  { label: 'B1', fullLabel: '🏔️ B1 – Mittelstufe', pill: 'bg-violet-100 text-violet-700', activePill: 'bg-violet-500 text-white' },
  { label: 'B2', fullLabel: '❄️ B2 – Gute Mittelstufe', pill: 'bg-amber-100 text-amber-700', activePill: 'bg-amber-500 text-white' },
  { label: 'C1', fullLabel: '🦌 C1 – Fortgeschritten', pill: 'bg-rose-100 text-rose-700', activePill: 'bg-rose-500 text-white' },
]

const willLoseLevels = computed(() => {
  const newIdx = LEVEL_ORDER.indexOf(pendingLevel.value)
  const oldIdx = LEVEL_ORDER.indexOf(userStore.startingLevel)
  return newIdx < oldIdx ? LEVEL_ORDER.slice(newIdx + 1, oldIdx + 1) : []
})

function openLevelModal() {
  pendingLevel.value = userStore.startingLevel
  showLevelModal.value = true
}

function confirmLevelChange() {
  userStore.changeStartingLevel(pendingLevel.value)
  showLevelModal.value = false
}

// ---- Export / Import ----
const importInput = ref<HTMLInputElement | null>(null)
const dataStatus = ref<{ type: 'success' | 'error'; msg: string } | null>(null)

function exportData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString().slice(0, 10),
    swedish_progress: localStorage.getItem('swedish_progress'),
    swedish_user: localStorage.getItem('swedish_user'),
    swedish_mode: localStorage.getItem('swedish_mode'),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `svenska-backup-${payload.exportedAt}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importInput.value?.click()
}

function onImportFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      if (!data.version || !data.swedish_progress || !data.swedish_user)
        throw new Error('Ungültige Backup-Datei')
      if (data.swedish_progress) localStorage.setItem('swedish_progress', data.swedish_progress)
      if (data.swedish_user) localStorage.setItem('swedish_user', data.swedish_user)
      if (data.swedish_mode) localStorage.setItem('swedish_mode', data.swedish_mode)
      dataStatus.value = { type: 'success', msg: 'Importiert! Seite wird neu geladen…' }
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      dataStatus.value = { type: 'error', msg: 'Fehler: Ungültige Datei' }
    }
  }
  reader.readAsText(file)
  // reset so same file can be re-selected
  ;(e.target as HTMLInputElement).value = ''
}

// ---- Stats ----
const levels = [
  { data: a1, ...LEVEL_META.A1 },
  { data: a2, ...LEVEL_META.A2 },
  { data: b1, ...LEVEL_META.B1 },
  { data: b2, ...LEVEL_META.B2 },
  { data: c1, ...LEVEL_META.C1 },
]

const totalStats = computed(() => {
  const all = [...a1.words, ...a2.words, ...b1.words, ...b2.words, ...c1.words]
  return store.statsForLevel(all.map(w => w.id))
})
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8 pb-8">
    <!-- Header -->
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Fortschritt</h1>

    <!-- Stats grid -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
        <p class="text-2xl font-bold text-gray-900">{{ store.streak.count }}</p>
        <p class="text-xs text-gray-500 mt-1">🔥 Streak</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
        <p class="text-2xl font-bold text-swedish-blue">{{ totalStats.seen }}</p>
        <p class="text-xs text-gray-500 mt-1">Gesehen</p>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
        <p class="text-2xl font-bold text-green-600">{{ totalStats.mastered }}</p>
        <p class="text-xs text-gray-500 mt-1">Gemeistert</p>
      </div>
    </div>

    <!-- Settings -->
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Einstellungen</p>
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

      <!-- Name row -->
      <div class="px-4 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-gray-800">Dein Name</p>
        <input
          v-model="nameEdit"
          type="text"
          maxlength="30"
          class="text-right text-sm text-gray-600 bg-transparent border-b border-transparent focus:border-swedish-blue focus:outline-none w-32 transition-colors"
          @blur="saveName"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </div>

      <!-- Niveau row -->
      <div
        class="px-4 py-4 border-b border-gray-50 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
        @click="openLevelModal"
      >
        <p class="text-sm font-medium text-gray-800">Startniveau</p>
        <div class="flex items-center gap-1.5 text-sm text-gray-600">
          <span>{{ LEVEL_META[userStore.startingLevel].emoji }} {{ userStore.startingLevel }}</span>
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Learn mode row -->
      <div class="px-4 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-gray-800">Lernmodus</p>
        <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            v-for="m in learnModes"
            :key="m.value"
            class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
            :class="learnMode === m.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'"
            @click="learnMode = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Export / Import row -->
      <div class="px-4 py-4">
        <p class="text-sm font-medium text-gray-800 mb-3">Daten</p>
        <div class="flex gap-2">
          <button
            class="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            @click="exportData"
          >
            Exportieren ↓
          </button>
          <button
            class="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-colors"
            @click="triggerImport"
          >
            Importieren ↑
          </button>
          <input ref="importInput" type="file" accept=".json" class="hidden" @change="onImportFile" />
        </div>
        <p v-if="dataStatus" class="mt-2 text-xs font-medium" :class="dataStatus.type === 'success' ? 'text-green-600' : 'text-red-500'">
          {{ dataStatus.msg }}
        </p>
      </div>
    </div>

    <!-- Per-level breakdown -->
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Nach Niveau</p>
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div
        v-for="(lvl, i) in levels"
        :key="lvl.data.level"
        class="px-4 py-4"
        :class="[
          i < levels.length - 1 ? 'border-b border-gray-50' : '',
          !userStore.isLevelUnlocked(lvl.data.level as CefrLevel) ? 'opacity-40' : ''
        ]"
      >
        <div class="flex items-center gap-4">
          <!-- Locked: padlock -->
          <div v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)" class="w-[52px] h-[52px] rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div v-else class="relative flex-shrink-0">
            <ProgressRing
              :percentage="Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100)"
              :size="52"
              :stroke-width="5"
            />
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {{ Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100) }}%
            </span>
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm" :class="lvl.textColor">{{ lvl.emoji }} {{ lvl.data.level }}</span>
                <span v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)" class="text-[10px] text-gray-400 font-medium">Gesperrt</span>
              </div>
              <span class="text-xs text-gray-400">{{ lvl.data.words.length }} Wörter</span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                class="h-full rounded-full bg-swedish-blue transition-all duration-500"
                :style="{ width: `${store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length * 100}%` }"
              />
            </div>
            <div class="flex gap-3 text-xs text-gray-500">
              <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).seen }} gesehen</span>
              <span class="text-green-600 font-medium">{{ store.statsForLevel(lvl.data.words.map(w => w.id)).mastered }} gemeistert</span>
              <span class="text-swedish-blue font-medium">{{ store.dueIds(lvl.data.words.map(w => w.id)).length }} fällig</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-gray-400 text-center mt-4">
      Gesehen = mindestens einmal gelernt · Gemeistert = Abstand ≥ 21 Tage
    </p>
  </div>

  <!-- Starting level modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showLevelModal"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/40" @click="showLevelModal = false" />
        <div class="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-8 shadow-xl">
          <h2 class="text-lg font-bold text-gray-900 mb-1">Startniveau ändern</h2>
          <p class="text-sm text-gray-500 mb-4">Wähle das Niveau, ab dem du lernen möchtest.</p>

          <div class="space-y-2 mb-4">
            <button
              v-for="opt in levelOptions"
              :key="opt.label"
              class="w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left"
              :class="pendingLevel === opt.label
                ? 'border-swedish-blue bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'"
              @click="pendingLevel = opt.label"
            >
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                :class="pendingLevel === opt.label ? opt.activePill : opt.pill"
              >{{ opt.label }}</span>
              <span class="text-sm text-gray-700">{{ opt.fullLabel }}</span>
              <svg v-if="pendingLevel === opt.label" class="w-4 h-4 text-swedish-blue ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          <div v-if="willLoseLevels.length > 0" class="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p class="text-xs text-amber-700 font-medium">
              Grammatikfortschritt für {{ willLoseLevels.join(', ') }} wird zurückgesetzt.
            </p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 transition-colors"
              @click="showLevelModal = false"
            >
              Abbrechen
            </button>
            <button
              class="flex-1 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
              style="background-color: #006AA7;"
              @click="confirmLevelChange"
            >
              Übernehmen
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: translateY(16px);
}
</style>
