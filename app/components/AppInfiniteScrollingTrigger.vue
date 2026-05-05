<script setup lang="ts">
const emit = defineEmits(['trigger'])
const { target } = useObserver(() => emit('trigger'))
</script>

<template>
  <div ref="target" class="h-20 w-full flex items-center justify-center">
    <span class="text-sm opacity-50">Chargement...</span>
  </div>
</template>