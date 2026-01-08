import {
  createDirectus,
  rest,
  authentication,
  registerUser,
  refresh,
  readMe,
  type AuthenticationStorage
} from '@directus/sdk';
import type { Schema } from '~/../types/directus';

export default defineNuxtPlugin(() => {
  class NuxtCookieStorage {
    cookie = useCookie('directus-data')
    get() {
      return this.cookie.value
    }
    set(data: any) {
      this.cookie.value = data
    }
  }

  const storage = new NuxtCookieStorage() as AuthenticationStorage

  const config = useRuntimeConfig();
  const directus = createDirectus<Schema>('http://localhost:3000/directus')
    .with(authentication("cookie", { credentials: "include", storage }))
    .with(rest({ credentials: "include" }));

  const isAuthenticated = async () => {
    try {
      const me = await directus.request(readMe());
      return me;
    } catch (error) {
      return false;
    }
  };

  const refreshToken = async () => {
    return directus.request(
      refresh({ mode: 'cookie' })
    );
  };

  const logout = async () => {
    await directus.logout({mode: 'session'})
    return navigateTo('/')
  }

  return {
    provide: {
      directus, registerUser, readMe, isAuthenticated, refreshToken, logout
    }
  };
});