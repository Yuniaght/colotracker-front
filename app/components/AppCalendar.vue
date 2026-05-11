<script setup lang="ts">
const props = defineProps<{
  completed_pages: {
    id: number,
    date_finished: string,
    image: {
      id: string,
      filename_download: string,
      title: string
    }
  }[]
}>()

import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, addMonths
} from 'date-fns';

import { fr } from 'date-fns/locale';

const weekDays = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']
const currentMonthDate = ref(new Date());

const calendarGrid = computed(() => {
  const firstDay = startOfWeek(startOfMonth(currentMonthDate.value), { weekStartsOn: 1 });
  const lastDay = endOfWeek(endOfMonth(currentMonthDate.value), { weekStartsOn: 1 });

  return eachDayOfInterval({ start: firstDay, end: lastDay });
});

const changeMonth = (amount: number) => {
  currentMonthDate.value = addMonths(currentMonthDate.value, amount);
};

const pagesByDate = computed(() => {
  if (!props.completed_pages) return {};

  const map: Record<string, typeof props.completed_pages> = {};

  props.completed_pages.forEach((page) => {
    if (!page.date_finished) return;

    const dateKey = format(new Date(page.date_finished), 'yyyy-MM-dd');

    if (!map[dateKey]) {
      map[dateKey] = [];
    }
    map[dateKey].push(page);
  });

  return map;
});

const getPagesForDay = (day: Date) => {
  return pagesByDate.value[format(day, 'yyyy-MM-dd')] || [];
};


</script>

<template>
  <div class="p-4 md:p-6 bg-white rounded-2xl shadow-sm">

    <div class="flex justify-between items-center mb-8">
      <button @click="changeMonth(-1)" class="p-2 hover:bg-dark-navy/10 rounded-full transition">
        &lt;
      </button>
      <h2 class="text-h2 text-dark-navy capitalize font-bold">
        {{ format(currentMonthDate, 'MMMM yyyy', { locale: fr }) }}
      </h2>
      <button @click="changeMonth(1)" class="p-2 hover:bg-dark-navy/10 rounded-full transition">
        &gt;
      </button>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center pt-4 mb-4">
      <div v-for="day in weekDays" :key="day" class="text-xs tracking-wider">
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 pb-10">
      <div v-for="day in calendarGrid" :key="day.toString()"
        class="relative flex flex-col items-center sm:items-start p-1 sm:p-2 md:p-3 transition-all" :class="[
          'rounded-2xl sm:rounded-xl md:rounded-2xl border',
          'aspect-square sm:aspect-auto sm:min-h-25 md:min-h-30',
          !isSameMonth(day, currentMonthDate) ? 'border-transparent bg-transparent opacity-0 pointer-events-none' : '',
          isToday(day) ? 'border-skin-orange ring-1 ring-skin-orange bg-skin-orange/10' : 'border-transparent hover:border-dark-navy/50',
          getPagesForDay(day).length > 0 ? 'border-emerald-blue ring-1 ring-emerald-blue bg-emerald-blue/10' : ''
        ]">
        <span v-if="isSameMonth(day, currentMonthDate)" class="text-xs sm:text-sm z-10" :class="[
          isToday(day) ? 'text-skin-orange' : 'text-dark-navy',
          day.getDay() === 0 ? 'text-rose-red' : ''
        ]">
          {{ format(day, 'd') }}
        </span>

        <div v-if="getPagesForDay(day).length > 0"
          class="mt-auto w-full relative flex items-center justify-center sm:block sm:h-16 group">

          <div
            class="sm:hidden flex items-center justify-center w-5 h-5 rounded-full bg-emerald-blue/10 text-emerald-blue text-xs">
            {{ getPagesForDay(day).length }}
          </div>

          <div class="hidden sm:block mx-auto max-w-15 max-h-15 aspect-square relative rounded-md sm:rounded-lg overflow-hidden border border-emerald-blue/20">
            <nuxt-picture v-if="getPagesForDay(day)[0]?.image" provider="directus"
              :src="`${getPagesForDay(day)[0]?.image.id}/${getPagesForDay(day)[0]?.image.filename_download}`"
              :title="getPagesForDay(day)[0]?.image.title" class="w-full h-full"
              img-class="absolute inset-0 block w-full h-full object-cover object-center" />
          </div>

          <div v-if="getPagesForDay(day).length > 1"
            class="hidden sm:block absolute -bottom-1 -right-1 bg-rose-red text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
            +{{ getPagesForDay(day).length - 1 }}
          </div>

        </div>
      </div>
    </div>

    <div class="flex justify-center pt-4 border-t border-gray-100 gap-6 sm:gap-8 text-xs sm:text-sm text-dark-navy/70">
      <div class="flex items-center gap-2">
        <div class="inline-block rounded-full border-skin-orange border-2 w-3 h-3 sm:w-4 sm:h-4"></div>
        <span>Aujourd'hui</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="inline-block rounded-sm border-emerald-blue border-2 w-3 h-3 sm:w-4 sm:h-4"></div>
        <span>Coloriage terminé</span>
      </div>
    </div>

  </div>
</template>