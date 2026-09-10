import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

/**
 * Feature access composable.
 *
 * Usage:
 *   const { can, canAny } = useFeature()
 *   can('attendance')          → true/false
 *   canAny(['attendance', 'leave'])  → true if at least one allowed
 */
export function useFeature() {
    const page = usePage();

    const allowedFeatures = computed(
        () => page.props.auth?.user?.allowed_features ?? []
    );

    const isAdmin = computed(
        () => page.props.auth?.user?.is_admin === true
    );

    /**
     * Check if the current user can access a feature.
     * Admins always return true (server also sends all keys for them,
     * but this is an extra safety net for UI rendering).
     */
    const can = (featureKey) => {
        if (isAdmin.value) return true;
        return allowedFeatures.value.includes(featureKey);
    };

    /**
     * Check if the user can access at least one of the given features.
     */
    const canAny = (featureKeys) => {
        if (isAdmin.value) return true;
        return featureKeys.some(k => allowedFeatures.value.includes(k));
    };

    return { can, canAny, allowedFeatures, isAdmin };
}
