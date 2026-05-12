// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0'
  },
  
  modules: [
            '@nuxtjs/seo',
            '@vueuse/nuxt',
            "@nuxt/image",
            "@vee-validate/nuxt",
          ],
  
  runtimeConfig: {
    siteURL: process.env.NUXT_PUBLIC_SITE_URL,
    directusAdminToken: process.env.DIRECTUS_TOKEN,
    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
      superAdminRoleId: process.env.NUXT_PUBLIC_SUPER_ADMIN_ROLE_ID,
      adminRoleId: process.env.NUXT_PUBLIC_ADMIN_ROLE_ID,
      moderatorRoleId: process.env.NUXT_PUBLIC_MODERATOR_ROLE_ID,
      userRoleId: process.env.NUXT_PUBLIC_USER_ROLE_ID,
    }
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'Colotracker',
    env: process.env.NUXT_SITE_ENV
  },

  routeRules: {
  "/directus/**": { proxy: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/**` } 
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'swiper/element/bundle',
        '@directus/sdk',
        'vue3-toastify',
        'date-fns',
        'date-fns/locale',
      ]
    }
  },

  css: [
    '~/assets/css/tailwind.css',
  ],

  image: {
    directus: {
      baseURL: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/assets`,
    }
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag: string) => tag.startsWith('swiper')
    },
  },

  ogImage: {
    enabled: false
  },
}
)