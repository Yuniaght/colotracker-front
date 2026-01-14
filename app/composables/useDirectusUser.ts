export const useDirectusUser = () => {
    return useState<any | null>('directus-user', () => null);
}