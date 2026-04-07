export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const userStore = useUserStore()
  userStore.load()

  const isOnboardingRoute = to.path === '/onboarding'

  if (!userStore.onboardingComplete && !isOnboardingRoute) {
    return navigateTo('/onboarding')
  }

  if (userStore.onboardingComplete && isOnboardingRoute) {
    return navigateTo('/')
  }
})
