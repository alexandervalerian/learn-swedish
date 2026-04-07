<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { type CefrLevel, LEVEL_ORDER } from '~/stores/user'

const store = useProgressStore()
const userStore = useUserStore()

const levels = [
  { data: a1, color: 'bg-emerald-50 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  { data: a2, color: 'bg-sky-50 border-sky-200', badge: 'bg-sky-100 text-sky-700' },
  { data: b1, color: 'bg-violet-50 border-violet-200', badge: 'bg-violet-100 text-violet-700' },
  { data: b2, color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { data: c1, color: 'bg-rose-50 border-rose-200', badge: 'bg-rose-100 text-rose-700' }
]

const unlockedLevelWordIdArrays = computed(() =>
  levels
    .filter(l => userStore.isLevelUnlocked(l.data.level as CefrLevel))
    .map(l => l.data.words.map(w => w.id))
)
const dailyRemaining = computed(() => store.dailyRemaining())
const dailyLearned = computed(() => store.dailyLearnedToday())
const streakDays = computed(() => store.streak.count)
const dailyIds = computed(() => store.dailySessionIds(unlockedLevelWordIdArrays.value, dailyRemaining.value))
const dailyReviewCount = computed(() => dailyIds.value.filter(id => store.getCard(id).lastReviewed !== null).length)
const dailyNewCount = computed(() => dailyIds.value.filter(id => store.getCard(id).lastReviewed === null).length)

function levelSeenPercent(wordIds: string[]): number {
  const stats = store.statsForLevel(wordIds)
  if (stats.total === 0) return 0
  return Math.round((stats.seen / stats.total) * 100)
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Hej, {{ userStore.name }}!</h1>
      <p class="text-gray-500 text-sm mt-1">Schwedisch für Deutschsprechende</p>
    </div>

    <!-- Daily session banner -->
    <NuxtLink
      to="/learn?mode=daily"
      class="block mb-6 rounded-2xl p-4 text-white shadow-md"
      style="background-color: #006AA7;"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-white/80">Heute lernen · Tagespensum</p>
          <p class="text-3xl font-bold">{{ dailyRemaining }} <span class="text-lg font-normal">Karten</span></p>
          <p class="text-xs text-white/70">verbleibend heute</p>
          <p class="text-xs text-white/60 mt-0.5">
            <span v-if="dailyReviewCount">{{ dailyReviewCount }} Wdh.</span>
            <span v-if="dailyReviewCount && dailyNewCount"> · </span>
            <span v-if="dailyNewCount">{{ dailyNewCount }} neu</span>
            <span v-if="dailyIds.length === 0">Alle Karten gelernt!</span>
          </p>
        </div>
        <div class="bg-white/20 rounded-xl p-3">
          <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </NuxtLink>

    <!-- Today recap -->
    <div class="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Heute</p>
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl bg-gray-50 px-3 py-2 text-center">
          <p class="text-lg font-bold text-gray-900">{{ dailyLearned }}</p>
          <p class="text-[11px] text-gray-500">gelernt</p>
        </div>
        <div class="rounded-xl bg-gray-50 px-3 py-2 text-center">
          <p class="text-lg font-bold text-swedish-blue">{{ dailyRemaining }}</p>
          <p class="text-[11px] text-gray-500">offen</p>
        </div>
        <div class="rounded-xl bg-gray-50 px-3 py-2 text-center">
          <p class="text-lg font-bold text-amber-600">{{ streakDays }}</p>
          <p class="text-[11px] text-gray-500">Streak</p>
        </div>
      </div>
    </div>

    <!-- Level cards -->
    <div class="space-y-3">
      <template v-for="lvl in levels" :key="lvl.data.level">
        <!-- Locked card -->
        <div
          v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)"
          class="flex items-center gap-4 rounded-2xl border p-4 opacity-50 cursor-not-allowed"
          :class="lvl.color"
        >
          <div class="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">{{ lvl.data.level }}</span>
              <span class="text-xs text-gray-500 truncate">{{ lvl.data.description }}</span>
            </div>
            <p class="text-xs text-gray-400">Noch gesperrt – schließe das vorherige Niveau ab</p>
          </div>
          <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <!-- Unlocked card -->
        <NuxtLink
          v-else
          :to="`/learn?level=${lvl.data.level}`"
          class="flex items-center gap-4 rounded-2xl border p-4 transition-all active:scale-[0.98]"
          :class="lvl.color"
        >
          <!-- Progress ring -->
          <div class="relative flex-shrink-0">
            <ProgressRing
              :percentage="levelSeenPercent(lvl.data.words.map(w => w.id))"
              :size="56"
              :stroke-width="6"
            />
            <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {{ levelSeenPercent(lvl.data.words.map(w => w.id)) }}%
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
            <div class="flex gap-2 text-xs text-gray-400 mt-0.5">
              <span>
                Grammatik: {{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced }}/{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total }} geübt
              </span>
              <span v-if="userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).complete" class="text-green-600 font-semibold">✓</span>
            </div>
          </div>

          <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </template>
    </div>

    <!-- Grammar entry -->
    <NuxtLink
      to="/grammar"
      class="mt-4 flex items-center gap-4 rounded-2xl border bg-gray-50 border-gray-200 p-4 transition-all active:scale-[0.98]"
    >
      <div class="bg-white rounded-xl p-3 border border-gray-100 flex-shrink-0">
        <svg class="w-6 h-6 text-swedish-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-gray-900 text-sm">Grammatik</p>
        <p class="text-xs text-gray-500 mt-0.5">Regeln verstehen und mit Übungen festigen</p>
      </div>
      <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </NuxtLink>

    <!-- Exam entry -->
    <NuxtLink
      to="/exam"
      class="mt-4 flex items-center gap-4 rounded-2xl border bg-gray-50 border-gray-200 p-4 transition-all active:scale-[0.98]"
    >
      <div class="bg-white rounded-xl p-3 border border-gray-100 flex-shrink-0">
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

    <!-- Sentence practice entry -->
    <NuxtLink
      to="/sentences"
      class="mt-4 flex items-center gap-4 rounded-2xl border bg-gray-50 border-gray-200 p-4 transition-all active:scale-[0.98]"
    >
      <div class="bg-white rounded-xl p-3 border border-gray-100 flex-shrink-0">
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
</template>
