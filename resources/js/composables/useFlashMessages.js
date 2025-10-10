import { watch } from 'vue'
import { usePage } from '@inertiajs/vue3'

export function useFlashMessages() {
    const page = usePage()

    // Watch for flash messages and show notifications
    watch(
        () => page.props.flash,
        (flash) => {
            if (!flash || !window.notify) return

            // Handle success messages
            if (flash.success) {
                window.notify.success(flash.success)
            }

            // Handle error messages
            if (flash.error) {
                window.notify.error(flash.error)
            }

            // Handle warning messages
            if (flash.warning) {
                window.notify.warning(flash.warning)
            }

            // Handle info messages
            if (flash.info) {
                window.notify.info(flash.info)
            }
        },
        { immediate: true, deep: true }
    )

    return {
        flash: page.props.flash
    }
}