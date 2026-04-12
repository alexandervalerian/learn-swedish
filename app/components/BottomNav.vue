<script setup lang="ts">
const route = useRoute()

const tabs = [
  { path: '/', label: 'Start', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/vocabulary', label: 'Vokabeln', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { path: '/progress', label: 'Fortschritt', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 safe-area-inset-bottom" style="box-shadow: 0 -1px 0 0 rgb(0 0 0 / 0.04);">
    <div class="flex">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors"
        :class="route.path === tab.path ? 'text-brand' : 'text-ink-tertiary'"
      >
        <span
          class="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
          :class="route.path === tab.path ? 'bg-brand-subtle' : ''"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
          </svg>
          <span class="text-[10px] font-semibold tracking-wide">{{ tab.label }}</span>
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>
