// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    directusAdminToken: process.env.DIRECTUS_TOKEN,
    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
      superAdminRoleId: process.env.NUXT_PUBLIC_SUPER_ADMIN_ROLE_ID,
      adminRoleId: process.env.NUXT_PUBLIC_ADMIN_ROLE_ID,
      moderatorRoleId: process.env.NUXT_PUBLIC_MODERATOR_ROLE_ID,
      userRoleId: process.env.NUXT_PUBLIC_USER_ROLE_ID,
    }
  },

  routeRules: {
  "/directus/**": { proxy: `${import.meta.env.NUXT_PUBLIC_DIRECTUS_URL}/**`
    } 
  },

  modules: ["@nuxtjs/tailwindcss", 
            "@nuxt/image",
            "@vee-validate/nuxt",
          ],

  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets`,
    }
  },
}
)