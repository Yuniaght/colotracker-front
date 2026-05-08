import {
  createDirectus,
  rest,
  authentication,
  createUser,
  registerUser,
  refresh,
  readMe,
  readItems,
  readItem,
  readUsers,
  readUser,
} from '@directus/sdk';
import type { Schema } from '~~/shared/types/directus';

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const headers = useRequestHeaders(['cookie'])
  const user = useDirectusUser()
  const directus = createDirectus<Schema>(config.public.directusUrl || "http://localhost:8055")
    .with(authentication("session", { credentials: "include" }))
    .with(rest({
      onRequest: (options) => {
        if (headers.cookie) {
          options.headers = {
            ...options.headers,
            cookie: headers.cookie,
          };
        }
        options.credentials = 'include';
        options.cache = 'no-store';
        return options;
      }
    }));
  
  const sessionCookie = useCookie('directus_session_token');

  const fetchUser = async (forceRefresh = false) => {
    if (user.value && !forceRefresh) return user.value
    try {
      const me = await directus.request(readMe({
        fields: [
          "id",
          "user_name",
          "email",
          "role",
          "discord_pseudonym",
          "instagram_link",
          "moderated_count",
          "status",
          "slug",
          {
            avatar: [
              "id",
              "filename_download",
              "title"
            ]
          }
        ]
      }));
      user.value = me;
      return me;
    } catch (e) {
      user.value = null;
      return null;
    }
  };

  if (!user.value && sessionCookie.value) {
    await fetchUser()
  }

  const refreshToken = async () => {
    return directus.request(
      refresh({ mode: 'session' })
    );
  };

  const logout = async (routeToReturnAfter: {} = {name: "index", params: {}}) => {
    try {
      await directus.logout({ mode: "session" })
      user.value = null
    } catch (e) {}
    return navigateTo(routeToReturnAfter)
  }

  return {
    provide: {
      directus, registerUser, createUser, readMe, readItems, readItem, readUsers, readUser, fetchUser, refreshToken, logout
    }
  };
});