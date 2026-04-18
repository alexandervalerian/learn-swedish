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
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,700;0,900;1,400&family=Sora:wght@300;400;500;600;700;800&display=swap' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-surface-page font-sans antialiased">
    <main :class="userStore.onboardingComplete ? 'pb-20' : ''" class="min-h-screen">
      <NuxtPage />
    </main>
    <BottomNav v-if="userStore.onboardingComplete" />
  </div>
</template>
