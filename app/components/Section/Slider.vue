<script setup lang="ts">
import type {SwiperOptions} from 'swiper/types'
import { computed } from 'vue'

const swiperElement = useTemplateRef('swiperElement')

const {options, xSpacing = 'auto', alwaysVisible = false} = defineProps<{
  options?: SwiperOptions
  xSpacing?: number | 'auto'
  mode?: 'normal' | 'expanded'
  alwaysVisible?: boolean
}>()

const cssVariables = computed(() => {
  return {
    x: xSpacing === 'auto' ? 'initial' : xSpacing + 'px',
  }
})

const spacing = computed(() => {
  return {
    x: xSpacing === 'auto' ? 'responsive-padding-x' : 'px-(--padding-x)',
  }
})

const {swiperOverflowVisible, swiperProgressbar} = useTwSwiper()


const swiperBaseOptions: SwiperOptions = {...options,}

function initSwiper() {
  const styles = [...(options?.injectStyles || []), swiperOverflowVisible()]

  const swiperOptions = {
    ...swiperBaseOptions,
    injectStyles: styles
  } satisfies SwiperOptions

  Object.assign(swiperElement.value!, swiperOptions);
}

const isLoaded = ref(false)


onMounted(() => {
  initSwiper()
  swiperElement.value!.addEventListener('swiperinit', (e: any) => {
    const swiper = e.detail[0]
    swiper.autoplay?.start()
  })
  swiperElement.value!.initialize();

  isLoaded.value = true;
});;
</script>

<template>
  <section> 
    <div :class="[spacing.x]" v-if="$slots.header">
      <div class="responsive-layout">
        <slot name="header"></slot>
      </div>
    </div>

    <div class="py-13" :class="[mode === 'normal' ? spacing.x : '', {'pt-12': $slots.header}]">
      <div class="reveal-fade-0 relative" :class="{
        'responsive-layout': mode === 'normal',
        'overflow-hidden': mode === 'normal' && !alwaysVisible,
        'opacity-0': !isLoaded
      }">
        <swiper-container ref="swiperElement" init="false">
          <slot></slot>
        </swiper-container>

      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  --padding-x: v-bind(cssVariables.x);
}

.swiper-button-lock {
  visibility: hidden;
  pointer-events: none;
  opacity: 0;
}
</style>