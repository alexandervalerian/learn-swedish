<script setup lang="ts">
const route = useRoute()

const tabs = [
  { path: '/', label: 'Start', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/vocabulary', label: 'Vokabeln', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  { path: '/progress', label: 'Fortschritt', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' }
]
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
    <!-- Swedish flag accent stripe -->
    <div class="h-0.5 flex">
      <div class="flex-1" style="background-color: #006AA7;"></div>
      <div class="w-10" style="background-color: #FECC02;"></div>
      <div class="flex-1" style="background-color: #006AA7;"></div>
    </div>
    <div class="flex">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors"
        :class="route.path === tab.path
          ? 'text-swedish-blue'
          : 'text-gray-400 hover:text-gray-600'"
      >
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
        </svg>
        {{ tab.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
