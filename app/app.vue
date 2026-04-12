<script setup lang="ts">
const store = useProgressStore()
const userStore = useUserStore()
onMounted(() => {
  store.load()
  userStore.load()
})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-surface-page font-sans antialiased">
    <main class="pb-20 min-h-screen">
      <NuxtPage />
    </main>
    <BottomNav v-if="userStore.onboardingComplete" />
  </div>
</template>
