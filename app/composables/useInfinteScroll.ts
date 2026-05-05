export function useInfiniteScroll<T>(
  dataSource: Ref<T[] | null>,
  isPending: Ref<boolean>,
  options: { pageSize: number }
) {
  const { pageSize } = options
  const page = ref(1)
  const items = ref<T[]>([]) as Ref<T[]>

  const hasMore = computed(() => {
    if (!dataSource.value) return false
    return dataSource.value.length === pageSize
  })

  watch(dataSource, (newItems) => {
    if (!newItems) return
    if (page.value === 1) {
      items.value = [...newItems]
    } else {
      items.value.push(...newItems)
    }
  }, { immediate: true })

  const handleLoadMore = () => {
    if (isPending.value || !hasMore.value) return
    page.value++
  }

  const resetPagination = () => {
    page.value = 1
  }

  return {
    page,
    items,
    hasMore, 
    handleLoadMore,
    resetPagination,
    pageSize
  }
}