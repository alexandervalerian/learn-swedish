<script setup lang="ts">
import a1 from '~/data/vocabulary/a1.json'
import a2 from '~/data/vocabulary/a2.json'
import b1 from '~/data/vocabulary/b1.json'
import b2 from '~/data/vocabulary/b2.json'
import c1 from '~/data/vocabulary/c1.json'
import { type CefrLevel, LEVEL_ORDER, VOCAB_SEEN_THRESHOLD } from '~/stores/user'
import { LEVEL_META } from '~/utils/levels'

const store = useProgressStore()
const userStore = useUserStore()
const writingStore = useWritingStore()

const currentWritingLevel = computed<CefrLevel>(() =>
  (LEVEL_ORDER as readonly CefrLevel[]).findLast(l => userStore.isLevelUnlocked(l)) ?? userStore.startingLevel
)
const todayWritingTask = computed(() => writingStore.getTodayTask(currentWritingLevel.value))
const writingDone = computed(() => writingStore.isTodayDone(currentWritingLevel.value))

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

const highestUnlockedIndex = computed(() =>
  levels.reduce((hi, l, i) => userStore.isLevelUnlocked(l.data.level as CefrLevel) ? i : hi, -1)
)

function levelMasteredPercent(wordIds: string[]): number {
  const stats = store.statsForLevel(wordIds)
  if (stats.total === 0) return 0
  return Math.round((stats.mastered / stats.total) * 100)
}

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
  <div class="max-w-lg mx-auto px-4 pt-8 pb-6">
    <!-- Header -->
    <div class="mb-7">
      <p class="text-[11px] font-bold tracking-[0.12em] uppercase text-brand mb-1">Lern-Dashboard</p>
      <h1 class="text-2xl font-bold text-ink-primary leading-snug">
        Hej, {{ userStore.name }}! 🇸🇪
      </h1>
      <p class="text-sm text-ink-tertiary mt-1">Entdecke Schweden Wort für Wort</p>
    </div>

    <!-- Daily session banner -->
    <NuxtLink
      to="/learn?mode=daily"
      class="block mb-6 rounded-2xl p-5 text-white relative overflow-hidden"
      style="background: var(--color-brand); box-shadow: var(--shadow-raised);"
    >

      <!-- First-use state -->
      <template v-if="totalSeenEver === 0">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-white/80">🌲 Dein Abenteuer beginnt!</p>
            <p class="text-xl font-bold mt-0.5">Erste Lektion starten →</p>
            <p class="text-xs text-white/60 mt-1">Lerne deine ersten schwedischen Wörter</p>
          </div>
          <div class="bg-white/15 rounded-xl p-3 flex-shrink-0">
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
          <div class="bg-white/15 rounded-xl p-3 flex-shrink-0">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
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

    <!-- Writing task card -->
    <NuxtLink
      to="/writing"
      class="block mb-6 rounded-2xl p-5 text-white relative overflow-hidden transition-all active:scale-[0.98]"
      :style="writingDone ? 'background: var(--color-correct); box-shadow: var(--shadow-raised);' : 'background: #5C5F6E; box-shadow: var(--shadow-raised);'"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-white/80">Tagesaufgabe · Schreiben</p>
          <p class="text-xl font-bold mt-0.5">{{ todayWritingTask.title }}</p>
          <p class="text-xs text-white/60 mt-1">
            <template v-if="!writingDone">{{ todayWritingTask.minWords }}–{{ todayWritingTask.maxWords }} Wörter · auf Schwedisch</template>
            <template v-else>Erledigt ✓</template>
          </p>
        </div>
        <div class="bg-white/15 rounded-xl p-3 flex-shrink-0">
          <svg v-if="!writingDone" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <svg v-else class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </NuxtLink>

    <!-- Level cards -->
    <div class="space-y-3">
      <template v-for="(lvl, i) in levels" :key="lvl.data.level">

        <!-- Locked card -->
        <div
          v-if="!userStore.isLevelUnlocked(lvl.data.level as CefrLevel)"
          class="flex items-center gap-4 rounded-2xl border p-4 opacity-35 cursor-not-allowed"
          :class="lvl.color"
          :style="{ animation: `fadeSlideIn 0.35s ease-out ${i * 55}ms both` }"
        >
          <div class="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-sm leading-none">{{ lvl.emoji }}</span>
              <span class="text-xs font-bold">{{ lvl.data.level }}</span>
              <span class="text-xs text-gray-500">{{ lvl.name }}</span>
            </div>
            <p v-if="blockingLevelInfo(i)" class="text-xs text-gray-400">
              Entsperre {{ blockingLevelInfo(i)!.label }} zuerst
              ({{ blockingLevelInfo(i)!.seenPct }}% gesehen)
            </p>
            <p v-else class="text-xs text-gray-400">Noch gesperrt</p>
          </div>
        </div>

        <!-- Unlocked card -->
        <NuxtLink
          v-else
          :to="`/level?level=${lvl.data.level}`"
          class="rounded-2xl border transition-all active:scale-[0.98] block"
          :class="[lvl.color, i === highestUnlockedIndex ? 'p-5' : 'p-4']"
          :style="{ animation: `fadeSlideIn 0.35s ease-out ${i * 55}ms both` }"
        >
          <div class="flex items-center gap-4">
            <!-- Progress ring -->
            <div class="relative flex-shrink-0">
              <ProgressRing
                :percentage="levelMasteredPercent(lvl.data.words.map(w => w.id))"
                :size="i === highestUnlockedIndex ? 64 : 56"
                :stroke-width="i === highestUnlockedIndex ? 7 : 6"
                :color="lvl.ringColor"
              />
              <span class="absolute inset-0 flex items-center justify-center font-bold text-ink-secondary" :class="i === highestUnlockedIndex ? 'text-sm' : 'text-xs'">
                {{ levelMasteredPercent(lvl.data.words.map(w => w.id)) }}%
              </span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span :class="i === highestUnlockedIndex ? 'text-lg' : 'text-base'" class="leading-none">{{ lvl.emoji }}</span>
                <span class="font-bold px-2 py-0.5 rounded-full" :class="[lvl.badge, i === highestUnlockedIndex ? 'text-sm' : 'text-xs']">{{ lvl.data.level }}</span>
                <span class="text-xs text-ink-tertiary truncate">{{ lvl.name }}<template v-if="i === highestUnlockedIndex"> · {{ lvl.data.description }}</template></span>
              </div>
              <div class="flex items-center gap-3 text-xs text-ink-tertiary flex-wrap">
                <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).seen }}/{{ lvl.data.words.length }} gesehen</span>
                <span>{{ store.statsForLevel(lvl.data.words.map(w => w.id)).mastered }} gemeistert</span>
                <span
                  v-if="store.dueIds(lvl.data.words.map(w => w.id)).length > 0"
                  class="bg-gold-soft text-b2-ink text-[10px] font-bold px-2 py-0.5 rounded-full"
                >
                  {{ store.dueIds(lvl.data.words.map(w => w.id)).length }} fällig
                </span>
              </div>
              <div class="text-xs text-ink-tertiary mt-0.5">
                <span>Gr. {{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced }}/{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total }}</span>
                <span v-if="userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).complete" class="text-correct font-semibold ml-1">✓</span>
              </div>
            </div>

            <svg class="w-5 h-5 text-ink-tertiary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Unlock progress -->
          <template v-if="i === highestUnlockedIndex && highestUnlockedIndex < levels.length - 1">
            <div class="mt-3 pt-3 border-t border-black/5">
              <p class="text-[11px] text-ink-tertiary font-medium mb-2">Nächstes Niveau freischalten</p>
              <div class="flex gap-4">
                <div class="flex-1">
                  <div class="flex justify-between text-[11px] text-ink-tertiary mb-1">
                    <span>Vokabeln</span>
                    <span>{{ Math.round((store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length) * 100) }}% / {{ Math.round(VOCAB_SEEN_THRESHOLD * 100) }}%</span>
                  </div>
                  <div class="progress-track">
                    <div
                      class="progress-fill"
                      :style="{ width: `${Math.min(100, (store.statsForLevel(lvl.data.words.map(w => w.id)).seen / lvl.data.words.length) / VOCAB_SEEN_THRESHOLD * 100)}%` }"
                    />
                  </div>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between text-[11px] text-ink-tertiary mb-1">
                    <span>Grammatik</span>
                    <span>{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).practiced }}/{{ userStore.grammarCompletionForLevel(lvl.data.level as CefrLevel).total }}</span>
                  </div>
                  <div class="progress-track">
                    <div
                      class="progress-fill"
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
