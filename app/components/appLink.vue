<template>
  <NuxtLink v-bind="$attrs" 
            :to="to" 
            :target="isExternal ? '_blank' : undefined"
            :rel="isExternal ? 'noopener noreferrer' : undefined" 
            active-class="text-skin-orange"
            class="hover:text-rose-red transition-colors ease-in-out duration-300">
    <slot />
  </NuxtLink>
</template>
<script setup lang="ts">
import type { NuxtLinkProps } from '#app'
interface Props extends NuxtLinkProps {
  variant?: 'primary' | 'secondary'
}
const props = defineProps<{ to: string | object }>()
const isExternal = computed(() =>
  typeof props.to === 'string' && props.to.startsWith('http')
)
</script>