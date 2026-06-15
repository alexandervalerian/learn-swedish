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

const nameEdit = ref(userStore.name)
function saveName() {
  if (nameEdit.value.trim() && nameEdit.value.trim() !== userStore.name)
    userStore.changeName(nameEdit.value)
}

type LearnMode = 'sv-de' | 'de-sv' | 'listen'
const MODE_KEY = 'swedish_mode'
const learnMode = ref<LearnMode>(
  (['sv-de', 'de-sv', 'listen'] as LearnMode[]).includes(
    localStorage.getItem(MODE_KEY) as LearnMode
  )
    ? (localStorage.getItem(MODE_KEY) as LearnMode)
    : 'de-sv'
)
watch(learnMode, val => localStorage.setItem(MODE_KEY, val))

const PREFIX_KEY = 'swedish_require_prefix'
const requirePrefix = ref<boolean>(localStorage.getItem(PREFIX_KEY) !== 'false')
watch(requirePrefix, v => localStorage.setItem(PREFIX_KEY, String(v)))

const PREVIEW_KEY = 'swedish_show_preview'
const showWordPreview = ref<boolean>(localStorage.getItem(PREVIEW_KEY) === 'true')
watch(showWordPreview, v => localStorage.setItem(PREVIEW_KEY, String(v)))

const learnModes: { value: LearnMode; label: string }[] = [
  { value: 'sv-de', label: 'SV → DE' },
  { value: 'de-sv', label: 'DE → SV' },
  { value: 'listen', label: '🔊 Hören' },
]

const showLevelModal = ref(false)
const pendingLevel = ref<CefrLevel>(userStore.startingLevel)

const levelOptions: { label: CefrLevel; fullLabel: string; pill: string; activePill: string }[] = [
  { label: 'A1', fullLabel: '🌲 A1 – Anfänger',          pill: 'bg-a1-border text-a1-ink', activePill: 'bg-a1-accent text-white' },
  { label: 'A2', fullLabel: '⛵ A2 – Grundlagen',         pill: 'bg-a2-border text-a2-ink', activePill: 'bg-a2-accent text-white' },
  { label: 'B1', fullLabel: '🏔️ B1 – Mittelstufe',        pill: 'bg-b1-border text-b1-ink', activePill: 'bg-b1-accent text-white' },
  { label: 'B2', fullLabel: '❄️ B2 – Gute Mittelstufe',   pill: 'bg-b2-border text-b2-ink', activePill: 'bg-b2-accent text-white' },
  { label: 'C1', fullLabel: '🦌 C1 – Fortgeschritten',    pill: 'bg-c1-border text-c1-ink', activePill: 'bg-c1-accent text-white' },
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

const importInput = ref<HTMLInputElement | null>(null)
const dataStatus = ref<{ type: 'success' | 'error'; msg: string } | null>(null)

function exportData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString().slice(0, 10),
    swedish_progress: localStorage.getItem('swedish_progress'),
    swedish_user: localStorage.getItem('swedish_user'),
    swedish_mode: localStorage.getItem('swedish_mode'),
    swedish_require_prefix: localStorage.getItem('swedish_require_prefix'),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `svenska-backup-${payload.exportedAt}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() { importInput.value?.click() }

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
      if (data.swedish_require_prefix != null) localStorage.setItem('swedish_require_prefix', data.swedish_require_prefix)
      dataStatus.value = { type: 'success', msg: 'Importiert! Seite wird neu geladen…' }
      setTimeout(() => window.location.reload(), 1000)
    } catch {
      dataStatus.value = { type: 'error', msg: 'Fehler: Ungültige Datei' }
    }
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

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
    <h1 class="text-2xl font-bold text-ink-primary mb-6">Fortschritt</h1>

    <!-- Stats — streak dominant, secondary stats stacked -->
    <div class="flex gap-3 mb-6">
      <div class="flex-1 rounded-2xl p-5 bg-gold-soft border border-amber-200/60 flex flex-col justify-between" style="box-shadow: var(--shadow-card); min-height: 96px;">
        <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-b2-ink/50">Streak</p>
        <div>
          <p class="text-4xl font-bold text-b2-ink leading-none">{{ store.streak.count }}</p>
          <p class="text-xs text-b2-ink/60 mt-1">🔥 Tage in Folge</p>
        </div>
      </div>
      <div class="flex flex-col gap-3 w-28">
        <div class="rounded-2xl px-3 py-3 bg-brand-subtle border border-brand-muted flex-1 flex flex-col justify-between" style="box-shadow: var(--shadow-card);">
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-brand/50">Gesehen</p>
          <p class="text-2xl font-bold text-brand leading-none">{{ totalStats.seen }}</p>
        </div>
        <div class="rounded-2xl px-3 py-3 bg-correct-bg border border-correct-border flex-1 flex flex-col justify-between" style="box-shadow: var(--shadow-card);">
          <p class="text-[10px] font-bold uppercase tracking-[0.1em] text-correct/50">Gemeistert</p>
          <p class="text-2xl font-bold text-correct leading-none">{{ totalStats.mastered }}</p>
        </div>
      </div>
    </div>

    <!-- Settings -->
    <p class="section-label">Einstellungen</p>
    <div class="card overflow-hidden divide-y divide-surface-inset mb-6">

      <!-- Name -->
      <div class="px-4 py-4 flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-ink-primary">Dein Name</p>
        <input
          v-model="nameEdit"
          type="text"
          maxlength="30"
          class="text-right text-sm text-ink-secondary bg-surface-inset rounded-lg px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-brand w-32 transition-all"
          @blur="saveName"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </div>

      <!-- Niveau -->
      <div
        class="px-4 py-4 flex items-center justify-between cursor-pointer active:bg-surface-inset transition-colors"
        @click="openLevelModal"
      >
        <p class="text-sm font-medium text-ink-primary">Startniveau</p>
        <div class="flex items-center gap-1.5 text-sm text-ink-secondary">
          <span>{{ LEVEL_META[userStore.startingLevel].emoji }} {{ userStore.startingLevel }}</span>
          <svg class="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <!-- Learn mode -->
      <div class="px-4 py-4 flex items-center justify-between gap-3">
        <p class="text-sm font-medium text-ink-primary">Lernmodus</p>
        <div class="flex gap-1 bg-surface-inset rounded-xl p-1">
          <button
            v-for="m in learnModes"
            :key="m.value"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
            :class="learnMode === m.value
              ? 'bg-white text-ink-primary shadow-sm'
              : 'text-ink-tertiary hover:text-ink-secondary'"
            @click="learnMode = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Präfix erforderlich -->
      <div class="px-4 py-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-ink-primary">Präfix erforderlich</p>
          <p class="text-xs text-ink-tertiary">z.B. „en man" statt nur „man"</p>
        </div>
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="requirePrefix ? 'bg-brand' : 'bg-surface-inset border border-surface-border'"
          @click="requirePrefix = !requirePrefix"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="requirePrefix ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <!-- Word preview -->
      <div class="px-4 py-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-ink-primary">Wörterliste vor dem Lernen</p>
          <p class="text-xs text-ink-tertiary">Alle Wörter der Session zuerst ansehen</p>
        </div>
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          :class="showWordPreview ? 'bg-brand' : 'bg-surface-inset border border-surface-border'"
          @click="showWordPreview = !showWordPreview"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
            :class="showWordPreview ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <!-- Export / Import -->
      <div class="px-4 py-4">
        <p class="text-sm font-medium text-ink-primary mb-3">Daten</p>
        <div class="flex gap-2">
          <button
            class="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-ink-secondary hover:border-brand hover:text-brand transition-colors"
            @click="exportData"
          >
            Exportieren ↓
          </button>
          <button
            class="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-ink-secondary hover:border-brand hover:text-brand transition-colors"
            @click="triggerImport"
          >
            Importieren ↑
          </button>
          <input ref="importInput" type="file" accept=".json" class="hidden" @change="onImportFile" />
        </div>
        <p v-if="dataStatus" class="mt-2 text-xs font-medium" :class="dataStatus.type === 'success' ? 'text-correct' : 'text-wrong'">
          {{ dataStatus.msg }}
        </p>
      </div>
    </div>

    <!-- Per-level breakdown -->
    <p class="section-label">Nach Niveau</p>
    <div class="card overflow-hidden divide-y divide-surface-inset">
      <div
        v-for="(lvl, i) in levels"
        :key="lvl.data.level"
        class="px-4 py-4"
        :class="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel) ? 'opacity-40' : ''"
      >
        <div class="flex items-center gap-4">
          <div v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)" class="w-[52px] h-[52px] rounded-full border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div v-else class="relative flex-shrink-0">
            <ProgressRing
              :percentage="Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100)"
              :size="52"
              :stroke-width="5"
              :color="lvl.ringColor"
            />
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink-secondary">
              {{ Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100) }}%
            </span>
          </div>

          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm" :class="lvl.textColor">{{ lvl.emoji }} {{ lvl.data.level }}</span>
                <span v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)" class="text-[10px] text-ink-tertiary font-medium">Gesperrt</span>
              </div>
              <span class="text-xs text-ink-tertiary">{{ lvl.data.words.length }} Wörter</span>
            </div>
            <div class="progress-track mb-2">
              <div
                class="progress-fill"
                :style="{ width: `${store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length * 100}%` }"
              />
            </div>
            <div class="flex gap-3 text-xs text-ink-tertiary">
              <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).seen }} gesehen</span>
              <span class="text-correct font-medium">{{ store.statsForLevel(lvl.data.words.map(w => w.id)).mastered }} gemeistert</span>
              <span class="text-brand font-medium">{{ store.dueIds(lvl.data.words.map(w => w.id)).length }} fällig</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="text-xs text-ink-tertiary text-center mt-4">
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
        <div class="absolute inset-0 bg-brand-deeper/25" @click="showLevelModal = false" />
        <div class="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-8" style="box-shadow: var(--shadow-float);">
          <h2 class="text-lg font-bold text-ink-primary mb-1">Startniveau ändern</h2>
          <p class="text-sm text-ink-tertiary mb-4">Wähle das Niveau, ab dem du lernen möchtest.</p>

          <div class="space-y-2 mb-4">
            <button
              v-for="opt in levelOptions"
              :key="opt.label"
              class="w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all text-left"
              :class="pendingLevel === opt.label
                ? 'border-brand bg-brand-subtle'
                : 'border-gray-200 hover:border-gray-300'"
              @click="pendingLevel = opt.label"
            >
              <span
                class="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                :class="pendingLevel === opt.label ? opt.activePill : opt.pill"
              >{{ opt.label }}</span>
              <span class="text-sm text-ink-secondary">{{ opt.fullLabel }}</span>
              <svg v-if="pendingLevel === opt.label" class="w-4 h-4 text-brand ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          <div v-if="willLoseLevels.length > 0" class="mb-4 rounded-xl bg-b2-bg border border-b2-border px-4 py-3">
            <p class="text-xs text-b2-ink font-medium">
              Grammatikfortschritt für {{ willLoseLevels.join(', ') }} wird zurückgesetzt.
            </p>
          </div>

          <div class="flex gap-3">
            <button class="btn-secondary flex-none w-auto px-5 py-3" style="width: auto;" @click="showLevelModal = false">
              Abbrechen
            </button>
            <button class="btn-primary flex-1" @click="confirmLevelChange">
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
