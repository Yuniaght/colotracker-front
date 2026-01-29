export const calculateProgress = (completedCount: number = 0, totalPages: number | null | undefined): string => {
  if (!totalPages || totalPages <= 0) {
    return "0%"
  }
  const percent = (completedCount / totalPages) * 100
  return percent.toFixed(2) + "%"
}