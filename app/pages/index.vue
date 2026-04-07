<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'

const store = useProgressStore()

const levels = [
  { data: a1, color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  { data: a2, color: 'bg-sky-50 border-sky-200', badge: 'bg-sky-100 text-sky-700' },
  { data: b1, color: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  { data: b2, color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { data: c1, color: 'bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-700' }
]

const totalDue = computed(() =>
  levels.reduce((sum, l) => sum + store.dueIds(l.data.words.map(w => w.id)).length, 0)
)
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Lär dig Svenska</h1>
      <p class="text-gray-500 text-sm mt-1">Schwedisch für Deutschsprechende</p>
    </div>

    <!-- Due cards banner -->
    <NuxtLink
      to="/learn"
      class="block mb-6 rounded-2xl p-4 text-white shadow-md"
      style="background-color: #006AA7;"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-white/80">Heute fällig</p>
          <p class="text-3xl font-bold">{{ totalDue }} <span class="text-lg font-normal">Karten</span></p>
        </div>
        <div class="bg-white/20 rounded-xl p-3">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </NuxtLink>

    <!-- Level cards -->
    <div class="space-y-3">
      <NuxtLink
        v-for="lvl in levels"
        :key="lvl.data.level"
        :to="`/learn?level=${lvl.data.level}`"
        class="flex items-center gap-4 rounded-2xl border p-4 transition-all active:scale-[0.98]"
        :class="lvl.color"
      >
        <!-- Progress ring -->
        <div class="relative flex-shrink-0">
          <ProgressRing
            :percentage="Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100)"
            :size="56"
            :stroke-width="6"
          />
          <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {{ Math.round(store.statsForLevel(lvl.data.words.map(w => w.id)).mastered / lvl.data.words.length * 100) }}%
          </span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">{{ lvl.data.level }}</span>
            <span class="text-xs text-gray-500 truncate">{{ lvl.data.description }}</span>
          </div>
          <div class="flex gap-3 text-xs text-gray-500">
            <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).seen }}/{{ lvl.data.words.length }} gesehen</span>
            <span class="text-swedish-blue font-medium">{{ store.dueIds(lvl.data.words.map(w => w.id)).length }} fällig</span>
          </div>
        </div>

        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </div>
</template>
