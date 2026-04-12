<script setup lang="ts">
const props = defineProps<{
  percentage: number // 0–100
  size?: number
  strokeWidth?: number
  color?: string
}>()

const size = computed(() => props.size ?? 72)
const stroke = computed(() => props.strokeWidth ?? 7)
const radius = computed(() => (size.value - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(
  () => circumference.value - (circumference.value * Math.min(props.percentage, 100)) / 100
)
const center = computed(() => size.value / 2)
const ringColor = computed(() => props.color ?? '#006AA7')
</script>

<template>
  <svg :width="size" :height="size" class="rotate-[-90deg]">
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      stroke="#EEF2F7"
      :stroke-width="stroke"
    />
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      fill="none"
      :stroke="ringColor"
      :stroke-width="stroke"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="offset"
      class="transition-all duration-500"
    />
  </svg>
</template>
