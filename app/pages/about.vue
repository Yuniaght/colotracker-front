<script setup lang="ts">
import { readSingleton } from '@directus/sdk';
const { $directus } = useNuxtApp()

const {data} = await useAsyncData('about', () => {
  return $directus.request(
    readSingleton('about', {
      fields: [
        "id",
        "main_title",
        "sub_title",
        "hero_title",
        "Contenu",
        "mission_title",
        "mission_content",
        "how_to_title",
        "how_to_content",
        "faq_section_title",
        "faq_content",
        "CTA_title",
        "cta_content",
        "buttons"
      ]
    })
  )
},
{
  transform: (data) => {
    return {
      headings: {
        title: data.main_title,
        sub_title: data.sub_title,
      },
      hero_banner: {
          title: data.hero_title,
          content: data.Contenu,
      },
      mission: {
        title: data.mission_title,
        content: data.mission_content
      },
      how_to_start: {
        title: data.how_to_title,
        content: data.how_to_content,
      },
      faq: {
        title: data.faq_section_title,
        content: data.faq_content
      },
      cta: {
        title: data.CTA_title,
        content: data.cta_content,
        ctas: data.buttons
      }
    }
  }
})

const stepColors= ["light-green","skin-orange","rose-red"]

</script>
<template>
  <section class="text-center responsive-padding-y responsive-padding-x">
    <h1 class="text-h1 pb-4">{{ data?.headings.title }}</h1>
    <p class="text-h3 text-emerald-blue pb-4 max-w-170 mx-auto">{{ data?.headings.sub_title }}</p>
    <div class="w-full rounded-2xl bg-linear-0 py-12 px-3 md:px-12 from-skin-orange to-rose-red">
      <h2 class="text-h2 pb-4">{{ data?.hero_banner.title }}</h2>
      <p v-for="content in data?.hero_banner.content" class="max-w-208 mx-auto pb-4">{{ content.Texte }}</p>
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x">
    <h2 class="text-h2 pb-2 border-b-2 border-light-green w-fit mx-auto mb-8 text-center">{{ data?.mission.title }}</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div v-for="reason in data?.mission.content" class="bg-pure-white shadow-md p-6 rounded-xl">
        <h3 class="text-h3 pb-3 text-emerald-blue">{{ reason.title }}</h3>
        <p>{{ reason.content }}</p>
      </div>
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="py-8 px-2 md:px-8 bg-pure-white">
      <h2 class="text-h2 text-center pb-8">{{ data?.how_to_start.title }}</h2>
      <div class="grid md:grid-cols-3 gap-4">
        <div v-for="(step, index) in data?.how_to_start.content" class="text-center">
          <div class="w-16 h-16 rounded-full flex justify-center items-center text-h2 mx-auto" :class="`bg-${stepColors[index]}`">
            {{ index + 1 }}
          </div>
          <h3 class="text-h3 pb-2">{{ step.title }}</h3>
          <p>{{ step.content }}</p>
        </div>
      </div>
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x">
    <h2 class="text-h2 pb-6">{{ data?.faq.title }}</h2>
    <div v-for="question in data?.faq.content" class="rounded-md shadow-md bg-pure-white p-5 mb-4">
      <h3 class="text-h3 pb-8">{{ question.title }}</h3>
      <p class="max-w-250">{{ question.content }}</p>
    </div>
  </section>
  <section class="responsive-padding-y responsive-padding-x">
    <div class="bg-dark-navy p-8 flex flex-col md:flex-row justify-center items-center rounded-xl gap-8">
     <div class="w-24 h-26 bg-rose-red border-2 border-skin-orange flex justify-center items-center rounded-full shrink-0"><i class="icon icon-mail text-[40px] text-dim-white"/></div>
     <div class="text-center md:text-left">
      <h2 class="text-h2 text-skin-orange pb-2">{{ data?.cta.title }}</h2>
      <p class="text-dim-white pb-2">{{ data?.cta.content }}</p>
      <AppButton v-for="button in data?.cta.ctas" :key="button.button_name" :to="{name: button.button_location}" theme="rose-red" class="w-full md:w-fit">{{ button.button_name }}</AppButton>
     </div>
    </div> 
  </section>
</template>