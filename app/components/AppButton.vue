<script setup lang="ts">
import type {RouteLocationRaw} from "#vue-router";

const {theme, to, size, hover = true} = defineProps<{
  theme?: 'dark-navy' | 'emerald-blue' | 'rose-red'
  to?: RouteLocationRaw
  size?: 'small' | 'medium'
  hover?: boolean
}>()

const classes = computed(() => {
  const items = [];

  if(theme) {
    items.push(`btn--${theme}`)
  }

  if(size) {
    items.push(`btn--size-${size}`)
  }

  if(!hover) {
    items.push('btn--no-hover')
  }

  return items;
})

const componentType = computed(() => {
  if(to) {
    return resolveComponent('NuxtLink')
  }

  return 'button'
})

const vBindButton = computed(() => {
  if(to) {
    return {to}
  }

  return {}
})
</script>

<template>
  <component :is="componentType" class="btn" :class="classes" v-bind="vBindButton">
    <slot></slot>
  </component>
</template>

<style scoped>

</style>
