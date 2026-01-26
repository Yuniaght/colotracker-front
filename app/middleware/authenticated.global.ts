export default defineNuxtRouteMiddleware(async (to, from) => {
    const { $fetchUser, $directus } = useNuxtApp();
    const user = useDirectusUser();

    // Login and register pages are not protected
    if (to.path.startsWith("/profile")) {
        if (!user.value) {
            await $fetchUser();
        }
        if (!user.value) {
            return navigateTo("/login");
        }
    }
    return;
});
