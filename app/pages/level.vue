<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { type CefrLevel } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

const route = useRoute()
const router = useRouter()

const store = useProgressStore()
const userStore = useUserStore()

const levels = [
  { data: a1, ...LEVEL_META.A1 },
  { data: a2, ...LEVEL_META.A2 },
  { data: b1, ...LEVEL_META.B1 },
  { data: b2, ...LEVEL_META.B2 },
  { data: c1, ...LEVEL_META.C1 },
]

const levelParam = computed(() => (route.query.level as string) || 'A1')

const lvl = computed(() => levels.find(l => l.data.level === levelParam.value))

const wordIds = computed(() => lvl.value?.data.words.map(w => w.id) ?? [])
const stats = computed(() => store.statsForLevel(wordIds.value))
const dueCount = computed(() => store.dueIds(wordIds.value).length)
const grammarCompletion = computed(() => userStore.grammarCompletionForLevel(levelParam.value as CefrLevel))
const seenPercent = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.seen / stats.value.total) * 100)
})

onMounted(() => {
  if (!lvl.value) router.replace('/')
})
</script>

<template>
  <div v-if="lvl" class="max-w-lg mx-auto px-4 pt-8 pb-24">
    <!-- Back -->
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Start
    </NuxtLink>

    <!-- Level header -->
    <div class="rounded-2xl border p-5 mb-6" :class="lvl.color">
      <div class="flex items-center gap-3 mb-3">
        <div class="relative flex-shrink-0">
          <ProgressRing :percentage="seenPercent" :size="56" :stroke-width="6" />
          <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
            {{ seenPercent }}%
          </span>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base leading-none">{{ lvl.emoji }}</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">{{ lvl.data.level }}</span>
            <span class="text-xs font-medium text-gray-500">{{ lvl.name }}</span>
          </div>
          <p class="text-sm font-semibold text-gray-800">{{ lvl.data.description }}</p>
        </div>
      </div>
      <div class="flex gap-4 text-xs text-gray-500">
        <span>{{ stats.seen }}/{{ lvl.data.words.length }} gesehen</span>
        <span class="text-swedish-blue font-medium">{{ dueCount }} fällig</span>
        <span>Grammatik: {{ grammarCompletion.practiced }}/{{ grammarCompletion.total }}</span>
      </div>
    </div>

    <!-- Activities -->
    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Aktivitäten</p>
    <div class="space-y-3">

      <!-- Vokabeln lernen -->
      <NuxtLink
        :to="`/learn?level=${levelParam}`"
        class="flex items-center gap-4 rounded-2xl border bg-white border-gray-200 p-4 transition-all active:scale-[0.98] hover:shadow-sm"
      >
        <div class="bg-swedish-blue/10 rounded-xl p-3 flex-shrink-0">
          <svg class="w-6 h-6 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm">Vokabeln lernen</p>
          <p class="text-xs text-gray-500 mt-0.5">Karteikarten mit Spaced Repetition</p>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>

      <!-- Grammatik -->
      <NuxtLink
        :to="`/grammar?level=${levelParam}`"
        class="flex items-center gap-4 rounded-2xl border bg-white border-gray-200 p-4 transition-all active:scale-[0.98] hover:shadow-sm"
      >
        <div class="bg-swedish-blue/10 rounded-xl p-3 flex-shrink-0">
          <svg class="w-6 h-6 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm">Grammatik</p>
          <p class="text-xs text-gray-500 mt-0.5">Regeln verstehen und Übungen machen</p>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>

      <!-- Vokabelprüfung -->
      <NuxtLink
        :to="`/exam?level=${levelParam}`"
        class="flex items-center gap-4 rounded-2xl border bg-white border-gray-200 p-4 transition-all active:scale-[0.98] hover:shadow-sm"
      >
        <div class="bg-swedish-blue/10 rounded-xl p-3 flex-shrink-0">
          <svg class="w-6 h-6 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm">Vokabelprüfung</p>
          <p class="text-xs text-gray-500 mt-0.5">Wörter eintippen und Note erhalten</p>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>

      <!-- Satzübungen -->
      <NuxtLink
        :to="`/sentences?level=${levelParam}`"
        class="flex items-center gap-4 rounded-2xl border bg-white border-gray-200 p-4 transition-all active:scale-[0.98] hover:shadow-sm"
      >
        <div class="bg-swedish-blue/10 rounded-xl p-3 flex-shrink-0">
          <svg class="w-6 h-6 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 text-sm">Satzübungen</p>
          <p class="text-xs text-gray-500 mt-0.5">Sätze aktiv auf Schwedisch konstruieren</p>
        </div>
        <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </NuxtLink>

    </div>
  </div>
</template>
