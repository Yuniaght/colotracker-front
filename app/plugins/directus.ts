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
  const headers = useRequestHeaders(['cookie'])
  const user = useDirectusUser()
  const directus = createDirectus<Schema>('http://localhost:8055')
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

  const fetchUser = async () => {
    if (user.value) return user.value
    try {
      const me = await directus.request(readMe({
        fields: [
          "user_name",
          "email",
          "role",
          "discord_pseudonym",
          "instagram_link",
          "moderated_count",
          "status",
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

  if (!user.value) {
    await fetchUser()
  }

  const refreshToken = async () => {
    return directus.request(
      refresh({ mode: 'session' })
    );
  };

  const logout = async () => {
    try {
      await directus.logout({ mode: "session" })
      user.value = null
    } catch (e) { }
    return navigateTo('/')
  }

  return {
    provide: {
      directus, registerUser, createUser, readMe, readItems, readItem, readUsers, readUser, fetchUser, refreshToken, logout
    }
  };
});