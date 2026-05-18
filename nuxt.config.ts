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
            "@dargmuesli/nuxt-cookie-control",
          ],
  
  runtimeConfig: {
    siteURL: process.env.NUXT_PUBLIC_SITE_URL,
    directusAdminToken: process.env.DIRECTUS_TOKEN,
    avatarFolder: process.env.AVATAR_FOLDER_ID,
    drawingFolder: process.env.DRAWINGS_FOLDER_ID,
    coverFolder: process.env.COVER_FOLDER_ID,
    recaptcha: {
      v3SecretKey: process.env.NUXT_RECAPTCHA_V3_SECRET_KEY
    },
    public: {
      publicUrl: process.env.NUXT_PUBLIC_SITE_URL,
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055',
      superAdminRoleId: process.env.NUXT_PUBLIC_SUPER_ADMIN_ROLE_ID,
      adminRoleId: process.env.NUXT_PUBLIC_ADMIN_ROLE_ID,
      moderatorRoleId: process.env.NUXT_PUBLIC_MODERATOR_ROLE_ID,
      userRoleId: process.env.NUXT_PUBLIC_USER_ROLE_ID,
      recaptcha: {
        v3SiteKey: process.env.NUXT_PUBLIC_RECAPTCHA_V3_SITE_KEY,
      }
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
        'vue-recaptcha-v3', // CJS
        'object-to-formdata', // CJS
        '@vee-validate/zod',
        'zod',
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
  
  cookieControl: {
    locales: ['fr'],
    barPosition: 'bottom-right',  
    isControlButtonEnabled: false,
    colors: {
      barBackground: 'var(--color-pure-white)',
      barButtonBackground: 'var(--color-rose-red)',
      barButtonColor: 'var(--color-pure-white)',
      barButtonHoverBackground: 'var(--color-dark-navy)',
      barButtonHoverColor: 'var(--color-pure-white)',
      barTextColor: 'var(--color-dark-navy)',
      controlButtonBackground: 'var(--color-rose-red)',
      controlButtonIconColor: 'var(--color-pure-white)',
      controlButtonIconHoverColor: 'var(--color-pure-white)',
      controlButtonHoverBackground: 'var(--color-dark-navy)',
      modalButtonBackground: 'var(--color-rose-red)',
      modalButtonColor: 'var(--color-pure-white)',
      modalButtonHoverBackground: 'var(--color-dark-navy)',
      modalButtonHoverColor: 'var(--color-pure-white)',
      modalOverlay: 'var(--color-dark-navy)',
      modalOverlayColor: 'var(--color-pure-white)',
      checkboxActiveBackground: 'var(--color-rose-red)',
      checkboxInactiveBackground: 'var(--color-skin-orange)',
      checkboxActiveCircleBackground: 'var(--color-pure-white)',
      checkboxInactiveCircleBackground: 'var(--color-pure-white)',
    },
    cookies: {
      necessary: [
        {
          id: 'auth',
          name: 'Authentification',
          description: 'Permet de vous maintenir connecté à votre compte Colotracker.',
          targetCookieIds: ['directus_session_token', 'directus_refresh_token']
        },
        {
          id: 'security',
          name: 'Sécurité',
          description: 'Protège le site contre les robots et les envois de formulaires abusifs.',
          targetCookieIds: ['_GRECAPTCHA']
        },
        {
          id: 'consent',
          name: 'Gestion du Consentement',
          description: 'Mémorise vos choix concernant les cookies pour ne pas vous les redemander.',
          targetCookieIds: ['ncc_c', 'ncc_e']
        },
      ],
      optional: []
    }
  },
}
)