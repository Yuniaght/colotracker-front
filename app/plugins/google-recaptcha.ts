import {VueReCaptcha} from 'vue-recaptcha-v3';

export default defineNuxtPlugin({
    parallel: true, setup(nuxtApp) {
        const {public: {recaptcha}} = useRuntimeConfig();

        nuxtApp.vueApp.use(VueReCaptcha, {
            siteKey: recaptcha.v3SiteKey,
            loaderOptions: {
                autoHideBadge: true,
                explicitRenderParameters: {
                    badge: 'bottomleft',
                },
            },
        });
    }
});