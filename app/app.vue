<script setup lang="ts">
const store = useProgressStore()
const userStore = useUserStore()
onMounted(() => {
  store.load()
  userStore.load()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <main class="pb-20 min-h-screen">
      <NuxtPage />
    </main>
    <BottomNav v-if="userStore.onboardingComplete" />
  </div>
</template>
