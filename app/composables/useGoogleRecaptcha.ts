import {useReCaptcha} from 'vue-recaptcha-v3'

export type ActionType =
    'signup'
    | 'login'
    | 'password_reset'
    | 'get_price'
    | 'cart_add'
    | 'cart_view'
    | 'payment_add'
    | 'checkout'
    | 'transaction_confirmed'
    | 'play_song'
    | string

/**
 * The exported executeRecaptcha function allows
 * you to execute reCAPTCHA actions
 * and retrieve the reCAPTCHA token along with the header options
 * to be used in subsequent requests.
 */
export default () => {
    const recaptchaInstance = useReCaptcha();


    const executeRecaptcha = async (action: ActionType) => {
        /**
         * Wait for the recaptchaInstance to be loaded
         * by calling the recaptchaLoaded method.
         * This ensures that the reCAPTCHA library is fully loaded
         * and ready to execute reCAPTCHA actions.
         */
        await recaptchaInstance?.recaptchaLoaded()
        const token = await recaptchaInstance?.executeRecaptcha(action)

        return {token}
    };

    return {executeRecaptcha}
}
