<script setup lang="ts">
const store = useProgressStore()
onMounted(() => store.load())
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <main class="pb-20 min-h-screen">
      <NuxtPage />
    </main>
    <BottomNav />
  </div>
</template>
