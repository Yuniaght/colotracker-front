export const useRandomPage = () => {
  const { $directus, $readItems } = useNuxtApp()
  const user = useDirectusUser()

  const isModalOpen = ref(false)
  const loading = ref(false)
  const suggestion = ref<{ title: string; page: number; front_cover: {id: string, filename_download: string, title: string} } | null>(null)

  const fetchRandomPage = async () => {
    if (!user.value) return
    loading.value = true

    try {
      const response = await $directus.request(
        $readItems('library', {
          fields: [
            'id',
            { book: ['name', 'page_count', 
              { front_cover: ["id", "filename_download", "title"]}] },
            { completed_pages: ['page_number'] } 
          ],
          filter: { user: { _eq: user.value.id } }
        })
      )

      const available = response.filter((e: any) => e.completed_pages.length < e.book.page_count)

      if (available.length > 0) {
        const entry = available[Math.floor(Math.random() * available.length)]
        const finishedSet = new Set(entry.completed_pages.map((p: any) => p.page_number))
        
        const undone = []
        for (let i = 1; i <= entry.book.page_count; i++) {
          if (!finishedSet.has(i)) undone.push(i)
        }

        suggestion.value = {
          title: entry.book.name,
          front_cover: entry?.book?.front_cover,
          page: undone[Math.floor(Math.random() * undone.length)]
        }
        isModalOpen.value = true
      }
    } finally {
      loading.value = false
    }
  }

  return {
    isModalOpen,
    loading,
    suggestion,
    fetchRandomPage
  }
}