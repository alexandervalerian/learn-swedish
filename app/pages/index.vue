<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { type CefrLevel, VOCAB_SEEN_THRESHOLD } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

const store = useProgressStore()
const userStore = useUserStore()

const levels = [
  { data: a1, ...LEVEL_META.A1 },
  { data: a2, ...LEVEL_META.A2 },
  { data: b1, ...LEVEL_META.B1 },
  { data: b2, ...LEVEL_META.B2 },
  { data: c1, ...LEVEL_META.C1 },
]

const unlockedLevelWordIdArrays = computed(() =>
  levels
    .filter(l => userStore.isLevelUnlocked(l.data.level as CefrLevel))
    .map(l => l.data.words.map(w => w.id))
)
const dailyRemaining = computed(() => store.dailyRemaining())
const dailyLearned = computed(() => store.dailyLearnedToday())
const dailyIds = computed(() => store.dailySessionIds(unlockedLevelWordIdArrays.value, dailyRemaining.value))
const dailyReviewCount = computed(() => dailyIds.value.filter(id => store.getCard(id).lastReviewed !== null).length)
const dailyNewCount = computed(() => dailyIds.value.filter(id => store.getCard(id).lastReviewed === null).length)

const totalSeenEver = computed(() =>
  levels.reduce((sum, l) => sum + store.statsForLevel(l.data.words.map(w => w.id)).seen, 0)
)

// Index of the highest currently-unlocked level (used to show unlock progress)
const highestUnlockedIndex = computed(() =>
  levels.reduce((hi, l, i) => userStore.isLevelUnlocked(l.data.level as CefrLevel) ? i : hi, -1)
)

function levelMasteredPercent(wordIds: string[]): number {
  const stats = store.statsForLevel(wordIds)
  if (stats.total === 0) return 0
  return Math.round((stats.mastered / stats.total) * 100)
}

// For a locked level, find the preceding (blocking) level and its seen %
function blockingLevelInfo(lockedLevelIdx: number): { label: string; seenPct: number } | null {
  const blockingIdx = lockedLevelIdx - 1
  if (blockingIdx < 0) return null
  const bl = levels[blockingIdx]
  const stats = store.statsForLevel(bl.data.words.map(w => w.id))
  const seenPct = stats.total === 0 ? 0 : Math.round((stats.seen / stats.total) * 100)
  return { label: bl.data.level, seenPct }
}
</script>

<template>
  <div class="max-w-lg mx-auto px-4 pt-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Hej, {{ userStore.name }}! 🇸🇪</h1>
      <p class="text-gray-500 text-sm mt-1">Entdecke Schweden Wort für Wort</p>
    </div>

    <!-- Daily session banner / first-use nudge -->
    <NuxtLink
      to="/learn?mode=daily"
      class="block mb-6 rounded-2xl p-4 text-white shadow-md"
      style="background-color: #006AA7;"
    >
      <!-- First-use state: no cards seen yet -->
      <template v-if="totalSeenEver === 0">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white/80">🌲 Dein Abenteuer beginnt!</p>
            <p class="text-xl font-bold mt-0.5">Erste Lektion starten →</p>
            <p class="text-xs text-white/60 mt-1">Lerne deine ersten schwedischen Wörter</p>
          </div>
          <div class="bg-white/20 rounded-xl p-3 flex-shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </template>

      <!-- Normal daily banner -->
      <template v-else>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white/80">Heute lernen · Tagespensum</p>
            <p class="text-3xl font-bold">{{ dailyRemaining }} <span class="text-lg font-normal">Karten</span></p>
            <p class="text-xs text-white/70">verbleibend heute</p>
            <p class="text-xs text-white/60 mt-0.5">
              <template v-if="dailyIds.length === 0">Alle Karten gelernt!</template>
              <template v-else-if="dailyReviewCount > 0 && dailyNewCount > 0">{{ dailyReviewCount }} Wdh. · {{ dailyNewCount }} neu</template>
              <template v-else-if="dailyReviewCount > 0">{{ dailyReviewCount }} Wiederholungen</template>
              <template v-else-if="dailyNewCount > 0">{{ dailyNewCount }} neue Karten</template>
            </p>
          </div>
          <div class="bg-white/20 rounded-xl p-3 flex-shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <!-- Daily progress bar -->
        <div class="mt-3 bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div
            class="h-full bg-white/80 rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(100, (dailyLearned / 40) * 100)}%` }"
          />
        </div>
        <div class="flex justify-between text-[11px] text-white/60 mt-1">
          <span>{{ dailyLearned }} gelernt</span>
          <span>Ziel: 40</span>
        </div>
      </template>
    </NuxtLink>

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
              <span class="text-base leading-none">{{ lvl.emoji }}</span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">{{ lvl.data.level }}</span>
              <span class="text-xs text-gray-500 truncate">{{ lvl.name }} · {{ lvl.data.description }}</span>
            </div>
            <template v-if="blockingLevelInfo(levels.indexOf(lvl))">
              <p class="text-xs text-gray-400">
                Entsperre {{ blockingLevelInfo(levels.indexOf(lvl))!.label }} zuerst
                ({{ blockingLevelInfo(levels.indexOf(lvl))!.seenPct }}% gesehen)
              </p>
            </template>
            <p v-else class="text-xs text-gray-400">Noch gesperrt</p>
          </div>
          <svg class="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <!-- Unlocked card -->
        <NuxtLink
          v-else
          :to="`/level?level=${lvl.data.level}`"
          class="rounded-2xl border p-4 transition-all active:scale-[0.98] block"
          :class="lvl.color"
        >
          <div class="flex items-center gap-4">
            <!-- Progress ring (mastered %) -->
            <div class="relative flex-shrink-0">
              <ProgressRing
                :percentage="levelMasteredPercent(lvl.data.words.map(w => w.id))"
                :size="56"
                :stroke-width="6"
              />
              <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                {{ levelMasteredPercent(lvl.data.words.map(w => w.id)) }}%
              </span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-base leading-none">{{ lvl.emoji }}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="lvl.badge">{{ lvl.data.level }}</span>
                <span class="text-xs text-gray-500 truncate">{{ lvl.name }} · {{ lvl.data.description }}</span>
              </div>
              <div class="flex gap-3 text-xs text-gray-500">
                <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).seen }}/{{ lvl.data.words.length }} gesehen</span>
                <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).mastered }}/{{ lvl.data.words.length }} gemeistert</span>
              </div>
              <div class="flex gap-2 text-xs text-gray-400 mt-0.5">
                <span class="text-swedish-blue font-medium">{{ store.dueIds(lvl.data.words.map(w => w.id)).length }} fällig</span>
                <span>·</span>
                <span>Gr. {{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced }}/{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total }}</span>
                <span v-if="userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).complete" class="text-green-600 font-semibold">✓</span>
              </div>
            </div>

            <svg class="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Unlock progress (only on highest unlocked level if next level exists) -->
          <template v-if="levels.indexOf(lvl) === highestUnlockedIndex && highestUnlockedIndex < levels.length - 1">
            <div class="mt-3 pt-3 border-t border-black/5">
              <p class="text-[11px] text-gray-400 font-medium mb-1.5">Nächstes Niveau freischalten</p>
              <div class="flex gap-4">
                <div class="flex-1">
                  <div class="flex justify-between text-[11px] text-gray-400 mb-0.5">
                    <span>Vokabeln</span>
                    <span>{{ Math.round((store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length) * 100) }}% / {{ Math.round(VOCAB_SEEN_THRESHOLD * 100) }}%</span>
                  </div>
                  <div class="bg-black/10 rounded-full h-1 overflow-hidden">
                    <div
                      class="h-full bg-swedish-blue rounded-full transition-all"
                      :style="{ width: `${Math.min(100, (store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length) / VOCAB_SEEN_THRESHOLD * 100)}%` }"
                    />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between text-[11px] text-gray-400 mb-0.5">
                    <span>Grammatik</span>
                    <span>{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced }}/{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total }}</span>
                  </div>
                  <div class="bg-black/10 rounded-full h-1 overflow-hidden">
                    <div
                      class="h-full bg-swedish-blue rounded-full transition-all"
                      :style="{ width: userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total > 0 ? `${(userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced / userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total) * 100}%` : '0%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </NuxtLink>
      </template>
    </div>

  </div>
</template>
