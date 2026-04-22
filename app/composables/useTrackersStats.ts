export const useTrackersStats = (userID: string, userSlug: string) => {
  const { $directus, $readItems } = useNuxtApp()

  const userVar = computed(() => userSlug)
  const userVarId = computed(() => userID)

  return useLazyAsyncData(`${userVar.value}-stats`, async () => {
    const libraryItems = await $directus.request(
      $readItems('library', {
        fields: [
          'id', 
          'book.page_count', 
          'completed_pages.id'], 
        filter: {
          user: {
            _eq: userVarId.value
          }
        }
      })
    )
    const stats = libraryItems.reduce((acc, item) => {
      acc.bookCount += item.book ? 1 : 0;
      acc.totalPages += item.book?.page_count || 0;
      acc.completedPagesCount += item.completed_pages?.length || 0; 
      
      return acc;
    }, {
      bookCount: 0,
      totalPages: 0,
      completedPagesCount: 0
    });

    return stats;
  },
    {
      watch: [userVar]
    }
  )
}