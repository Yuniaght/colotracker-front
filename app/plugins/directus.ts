import {
  createDirectus,
  rest,
  authentication,
  registerUser,
  refresh,
  readMe,
} from '@directus/sdk';
import type { Schema } from '~/../types/directus';

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
      const me = await directus.request(readMe());
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
      directus, registerUser, readMe, fetchUser, refreshToken, logout
    }
  };
});