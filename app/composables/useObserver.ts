export function useObserver(callback: () => void) {
  const target = ref<HTMLElement | null>(null)

  onMounted(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) {
        callback()
      }
    }, { threshold: 0.1 })

    if (target.value) observer.observe(target.value)
  })

  return { target }
}