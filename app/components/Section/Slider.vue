<script setup lang="ts">
import type {SwiperOptions} from 'swiper/types'
import { computed } from 'vue'

const swiperElement = useTemplateRef('swiperElement')

const {options, pagination = false, navigation = false, xSpacing = 'auto', alwaysVisible = false} = defineProps<{
  options?: SwiperOptions
  pagination?: boolean
  navigation?: boolean
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

const {swiperPagination, swiperOverflowVisible, swiperProgressbar} = useTwSwiper()

const isProgressbar = computed(() => options?.pagination && (options.pagination as any).type === 'progressbar')

const swiperBaseOptions: SwiperOptions = {...options,}

const prevBtn = useTemplateRef('prevBtn')
const nextBtn = useTemplateRef('nextBtn')

function initSwiper() {
  const styles = [...(options?.injectStyles || []), swiperOverflowVisible()]

  const swiperOptions = {
    ...swiperBaseOptions,
    injectStyles: styles
  } satisfies SwiperOptions

  if(navigation) {
    swiperOptions.navigation = {
      prevEl: prevBtn.value,
      nextEl: nextBtn.value,
    }
  }

  if(pagination) {
    swiperOptions.injectStyles.push((isProgressbar.value ? swiperProgressbar() : swiperPagination()));

    swiperOptions.pagination = {
      clickable: true,
    }

    if(typeof options?.pagination === 'object') {
      swiperOptions.pagination = {
        ...swiperOptions.pagination,
        ...options?.pagination,
      }
    }
  }

  Object.assign(swiperElement.value!, swiperOptions);
}

const isLoaded = ref(false)


onMounted(() => {
  initSwiper()
  swiperElement.value!.initialize();

  isLoaded.value = true;
});
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
        <swiper-container :class="{'hidden': !isLoaded}" ref="swiperElement" init="false">
          <slot></slot>
        </swiper-container>

        <template v-if="navigation">
          <span class="z-10 absolute left-6 top-1/2 -translate-y-1/2 cursor-pointer rounded-full size-8 bg-gold-400 hover:scale-110 transition-all duration-300 flex justify-center items-center" ref="prevBtn" type="button" aria-label="Slide précédente">
            <i class="icon icon-arrow-left text-black" aria-hidden="true"></i>
          </span>

          <span class="z-10 absolute right-6 top-1/2 -translate-y-1/2 cursor-pointer rounded-full size-8 bg-gold-400 hover:scale-110 transition-all duration-300 flex justify-center items-center" ref="nextBtn" type="button" aria-label="Slide suivante">
            <i class="icon icon-arrow-left text-black rotate-180" aria-hidden="true"></i>
          </span>
        </template>

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