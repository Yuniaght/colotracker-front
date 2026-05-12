<script setup lang="ts">
import { triggerFlow } from '@directus/sdk';
interface DirectusFile {
  id: string;
  filename_download: string;
  title?: string | null;
}

interface PageActivity {
  type: 'page_done';
  id: number;
  date_added: string;
  page_number: number;
  image: DirectusFile | null;
  library_from: {
    book: {
      name: string;
    };
  };
}

interface BookActivity {
  type: 'new_book';
  id: number;
  date_added: string;
  book: {
    name: string;
    front_cover: DirectusFile | null;
  };
}

type UserActivity = PageActivity | BookActivity;

const { $directus, $readItems, $toast, $logout } = useNuxtApp()
const { isModalOpen, loading, suggestion, fetchRandomPage } = useRandomPage()
const user = useDirectusUser()
const userSlug = computed(() => user.value.userSlug)

const { data: userStats, error: statsError } = await useAsyncData(`${userSlug.value}-library-stats`, async () => {
  let completedPagesCount = 0
  let finishedBookCount = 0
  const libraryItems = await $directus.request(
    $readItems("library", {
      fields: [
        "id",
        { "book": ["page_count"] }, 
        { "completed_pages": [ "id" ] }
      ],
      filter: {
        user: { _eq: user.value.id }
      },
      limit: -1 
    })
  );
  const totalBooks = libraryItems.length;
  
  for (const item of libraryItems) {
    completedPagesCount += (item?.completed_pages?.length || 0) 
    if (item.book?.page_count === item.completed_pages?.length) finishedBookCount ++
  }

  return {
    totalBooks,
    completedPagesCount,
    finishedBookCount
  }
})

const { data: latestActivity, error: activityError } = await useAsyncData<UserActivity[]>(`${userSlug.value}-latest`, async () => {
  const [lastPages, lastBooks] = await Promise.all([
    $directus.request(
      $readItems("completed_pages", {
      fields: [
        "id", 
        "date_added",
        "page_number",
        {
          image: [
            "id",
            "filename_download",
            "title"
          ]
        },
        {
          library_from: [{
            book: [
              "name"
            ]
          }]
        }],
      filter: { library_from: { user: { _eq: user.value.id } } },
      sort: ["-date_added"],
      limit: 3
    })),
    $directus.request(
      $readItems("library", {
      fields: [
        "id", 
        "date_added", 
        { book: [
          "name",
          {
            front_cover: [
              "id",
              "filename_download",
              "title"
            ]
          }
        ]}], 
      filter: { user: { _eq: user.value.id } },
      sort: ["-date_added"],
      limit: 3
    }))
  ]);

  const taggedPages: PageActivity[] = lastPages.map(p => ({ ...p, type: 'page_done' }));
  const taggedBooks: BookActivity[] = lastBooks.map(b => ({ ...b, type: 'new_book' }));

  const combinedActivity: UserActivity[] = [...taggedPages, ...taggedBooks].sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime());

  return combinedActivity.slice(0, 3);
});

const requestAccountDeletion = async () => {
  try {
    await $directus.request(
      triggerFlow('POST', 'a6a887f3-c6c6-4bf0-9aba-6be7d3b74f4c')
    )

    $logout({name: 'goodbye'})

  } catch (error: any) {
    $toast.error(error.message)
  }
};

const hasError = computed(() => statsError.value || activityError.value)

useSeoMeta({
  title: () => `Mon Tableau de Bord - ${user.value?.user_name}`,
  ogTitle: 'Mon Espace Personnel',
  robots: 'noindex, nofollow',
})
</script>
<template>
  <section class="responsive-padding-x responsive-padding-y">
    <h1 class="text-h1 pb-8">Mon profil & Dashboard</h1>
    <div v-if="hasError" class="mb-6 p-4 bg-skin-orange text-rose-red rounded-xl border border-rose-red/50">
      <p>Certaines informations ne sont pas à jour suite à un problème de connexion avec le serveur.</p>
    </div>
    <div class="grid lg:grid-cols-[415px_minmax(0,1fr)] gap-8">
      <aside class="bg-pure-white p-8 shadow-sm rounded-xl min-w-0 w-full overflow-hidden lg:max-w-[415px]">
        <div class="w-32 h-32 rounded-full pb-1 border-2 mx-auto border-skin-orange overflow-clip">
          <nuxt-picture v-if="user?.avatar != null" provider="directus" :src="`${user?.avatar.id}/${user?.avatar.filename_download}`" :alt="user?.avatar.title" />
          <nuxt-picture v-else src="/img/defaultavatar.jpg" alt="avatar par défaut" />
        </div>
        <h2 class="text-h2 text-center pb-1">{{ user.user_name }}</h2>
        <p class="pb-1 text-center truncate" :title="user.email">{{ user.email }}</p>
        <div class="pt-7 text-center">
          <AppButton class="w-full mb-3" theme="emerald-blue" :to="{name: 'profile-mylibrary'}">Ma bibliothèque</AppButton>
          <AppButton class="w-full mb-3" theme="emerald-blue" :to="{name: 'profile-calendar'}">Mon calendrier</AppButton>
          <AppButton class="w-full mb-8" theme="skin-orange" @click="fetchRandomPage">Selecteur de page aléatoire</AppButton>
          <h3 class="text-h3 pb-2">Gestion du compte</h3>
          <AppButton class="w-full mb-3" theme="rose-red" :to="{name: 'profile-edit'}">Modifier mes informations</AppButton>
          <AppButton @click="requestAccountDeletion" class="w-full">Supprimer mon compte</AppButton>
        </div>  
      </aside>
      <div class="p-8 bg-pure-white shadow-sm rounded-xl">
        <h2 class="text-h2 w-full border-b-2 pb-4 mb-4 border-dark-navy/20">Mes statistiques</h2>
        <div class="grid md:grid-cols-3 gap-4 pb-4" v-if="userStats">
          <div class="bg-dim-white rounded-md p-4 md:inline-block">
            <p class="text-h1 font-bold text-emerald-blue">{{ userStats?.totalBooks }}</p>
            <p>Livre<span v-if="userStats?.totalBooks! > 1">s</span> dans ma bibliothèque</p>
          </div>
          <div class="bg-dim-white rounded-md p-4 md:inline-block">
            <p class="text-h1 font-bold text-rose-red">{{ userStats?.completedPagesCount }}</p>
            <p>Coloriage<span v-if="userStats?.completedPagesCount! > 1">s</span> terminé<span v-if="userStats?.completedPagesCount > 1">s</span></p>
          </div>
          <div class="bg-dim-white rounded-md p-4 md:inline-block">
            <p class="text-h1 font-bold text-skin-orange">{{ userStats?.finishedBookCount }}</p>
            <p>Livre<span v-if="userStats?.finishedBookCount! > 1">s</span> terminé<span v-if="userStats?.finishedBookCount > 1">s</span></p>
          </div>
        </div>
        <div v-else-if="statsError" class="p-4 bg-dim-white rounded-md text-sm italic">
          Statistiques indisponibles.
        </div>
        <h2 class="text-h2 pb-4">Activités récentes</h2>
        <div v-if="activityError" class="p-4 bg-dim-white rounded-md text-sm italic">
          Impossible de charger l'historique récent.
        </div>
        <div v-if="latestActivity?.length === 0">
          <p>Aucune activité n'a été enregistré pour ce compte</p>
        </div>
        <ul v-else v-for="activity in latestActivity" class="bg-dim-white rounded-md p-3 mb-4">
          <li v-if="activity.type == 'page_done'" class="flex gap-4">
            <div class="w-12 h-12 rounded-md overflow-hidden">
              <nuxt-picture 
                provider="directus"
                :src="`${activity.image?.id}/${activity.image?.filename_download}`"
                :alt="activity.image?.title"
                :img-attrs="{ class: 'w-full h-full object-cover' }" 
                width="48px"
              />
            </div>
            <div>
              <h3 class="text-h3 font-semibold">Page {{ activity.page_number }} terminée.</h3>
              <p>{{ activity.library_from.book.name }} - <nuxt-time relative :datetime="activity.date_added"/></p>
            </div>
          </li>
          <li v-if="activity.type == 'new_book'" class="flex gap-4">
            <div class="w-12 h-12 rounded-md overflow-hidden">
              <nuxt-picture 
                provider="directus"
                :src="`${activity.book.front_cover?.id}/${activity.book.front_cover?.filename_download}`"
                :alt="activity.book.front_cover?.title"
                :img-attrs="{ class: 'w-full h-full object-cover' }" 
                width="48px"
              />
            </div>
            <div>
              <h3 class="text-h3 font-semibold">Nouveau livre ajouté</h3>
              <p>{{ activity.book.name }} - <nuxt-time relative :datetime="activity.date_added"/></p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </section>
  <ModalRandomPage 
  :is-open="isModalOpen" 
  :suggestion="suggestion" 
  :loading="loading"
  @close="isModalOpen = false" 
  @reroll="fetchRandomPage"
/>
</template>