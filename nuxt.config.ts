// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

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
  "/directus/**": { proxy: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/**` } 
  },

  modules: [
            "@nuxt/image",
            "@vee-validate/nuxt",
          ],

  vite: {
    plugins: [tailwindcss()],
  },

  css: [
    '~/assets/css/tailwind.css',
  ],

  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets`,
    }
  },
}
)