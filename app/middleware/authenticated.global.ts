export default defineNuxtRouteMiddleware(async (to, from) => {
    const { $fetchUser, $directus } = useNuxtApp();
    const user = useDirectusUser();

    // Login and register pages are not protected
    if (to.path.startsWith("/login") || to.path.startsWith("/register") || to.path.endsWith("/")) {
        return;
    }

    if (!user.value) {
        await $fetchUser();
    }

    if (!user.value) {
        return navigateTo("/login");
    }
    return;
});
