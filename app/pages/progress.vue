<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'

const store = useProgressStore()

const levels = [
  { data: a1, color: 'text-emerald-600' },
  { data: a2, color: 'text-sky-600' },
  { data: b1, color: 'text-violet-600' },
  { data: b2, color: 'text-amber-600' },
  { data: c1, color: 'text-rose-600' }
]

const totalStats = computed(() => {
  const all = [...a1.words, ...a2.words, ...b1.words, ...b2.words, ...c1.words]
  return store.statsForLevel(all.map(w => w.id))
})
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Fortschritt</h1>

    <!-- Streak + overall -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
        <p class="text-2xl font-bold text-gray-900">{{ store.streak.count }}</p>
        <p class="text-xs text-gray-500 mt-1">🔥 Tage-Streak</p>
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

    <!-- Per-level breakdown -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100">
        <h2 class="font-semibold text-gray-700 text-sm">Nach Niveau</h2>
      </div>

      <div
        v-for="(lvl, i) in levels"
        :key="lvl.data.level"
        class="px-4 py-4"
        :class="i < levels.length - 1 ? 'border-b border-gray-50' : ''"
      >
        <div class="flex items-center gap-4">
          <div class="relative flex-shrink-0">
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
              <span class="font-bold text-sm" :class="lvl.color">{{ lvl.data.level }}</span>
              <span class="text-xs text-gray-400">{{ lvl.data.words.length }} Wörter</span>
            </div>

            <!-- Mini progress bar -->
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

    <!-- Legend -->
    <p class="text-xs text-gray-400 text-center mt-4">
      Gemeistert = Wiederholungsabstand ≥ 21 Tage
    </p>
  </div>
</template>
