import Vue3Toastify, {toast, type ToastContainerOptions} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import type {App} from "vue";

export default defineNuxtPlugin({parallel: true, setup(nuxtApp) {
        const router = useRouter();

        function resolveGlobalComponents(instance: App<Element>) {
            instance.use(router);
        }

        nuxtApp.vueApp.use(
            Vue3Toastify,
            {
                useHandler: resolveGlobalComponents,
                autoClose: 7000,
                position: toast.POSITION.BOTTOM_RIGHT,
                limit: 2,
                clearOnUrlChange: false,
                theme: 'colored'
            } as ToastContainerOptions
        );

        return {
            provide: { toast },
        };
    }}
);
