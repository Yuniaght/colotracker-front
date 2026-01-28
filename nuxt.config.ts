// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      directusUrl: '',
      superAdminRoleId: '',
      adminRoleId: '',
      moderatorRoleId: '',
      userRoleId: '',
    }
  },

  routeRules: {
  "/directus/**": { proxy: `${import.meta.env.NUXT_PUBLIC_DIRECTUS_URL}/**`
    } 
  },

  modules: ["@nuxtjs/tailwindcss", "@nuxt/image"],

  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets`,
    }
  },
}
)