<script setup>
import { ref, computed } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    features: Array,   // [{ id, key, label, group, allowed_roles: [] }]
    roles: Array,      // ['HR', 'Manager', 'Employee']
});

// Build a reactive map: { featureId: { roleName: bool } }
const permMatrix = ref({});

props.features.forEach(f => {
    permMatrix.value[f.id] = {};
    props.roles.forEach(role => {
        permMatrix.value[f.id][role] = f.allowed_roles.includes(role);
    });
});

// Group features by their group label
const groupedFeatures = computed(() => {
    const groups = {};
    props.features.forEach(f => {
        const g = f.group || 'Other';
        if (!groups[g]) groups[g] = [];
        groups[g].push(f);
    });
    return groups;
});

const saving = ref(false);
const flash = ref(null);

// Toggle a single checkbox and auto-save via AJAX
const toggle = async (featureId, role) => {
    const enabled = permMatrix.value[featureId][role];
    try {
        await axios.post(route('admin.feature-permissions.toggle'), {
            feature_id: featureId,
            role_name:  role,
            enabled:    enabled,
        });
        flash.value = { type: 'success', message: 'Saved.' };
        setTimeout(() => flash.value = null, 2000);
    } catch (e) {
        // Revert on failure
        permMatrix.value[featureId][role] = !enabled;
        flash.value = { type: 'error', message: 'Failed to save. Please try again.' };
    }
};

// Select all / deselect all for a role column
const toggleAll = async (role, value) => {
    props.features.forEach(f => {
        permMatrix.value[f.id][role] = value;
    });
    // Save all via batch
    saving.value = true;
    try {
        const permissions = {};
        props.features.forEach(f => {
            permissions[f.id] = props.roles.filter(r => permMatrix.value[f.id][r]);
        });
        await axios.post(route('admin.feature-permissions.save'), { permissions });
        flash.value = { type: 'success', message: 'All permissions updated.' };
        setTimeout(() => flash.value = null, 2000);
    } catch (e) {
        flash.value = { type: 'error', message: 'Failed to save.' };
    } finally {
        saving.value = false;
    }
};

const roleColors = {
    HR:       'text-blue-600',
    Manager:  'text-purple-600',
    Employee: 'text-teal-600',
};

const groupIcons = {
    General:     '🌐',
    Management:  '🏢',
    Assessments: '📋',
    Other:       '⚙️',
};
</script>

<template>
    <Head title="Feature Permissions" />
    <AuthenticatedLayout>
        <div class="max-w-6xl mx-auto px-4 py-8">
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Feature Permissions</h1>
                <p class="text-sm text-slate-500 dark:text-gray-400 mt-1">
                    Control which roles can access each feature. Admin always has full access.
                </p>
            </div>

            <!-- Flash message -->
            <Transition name="fade">
                <div v-if="flash"
                    class="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
                    :class="flash.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'">
                    {{ flash.message }}
                </div>
            </Transition>

            <!-- Legend -->
            <div class="flex flex-wrap gap-4 mb-5 text-sm">
                <span v-for="role in roles" :key="role"
                    class="flex items-center gap-1.5 font-medium"
                    :class="roleColors[role] || 'text-slate-600'">
                    <span class="w-3 h-3 rounded-sm inline-block border-2"
                        :class="role === 'HR' ? 'bg-blue-500 border-blue-500'
                            : role === 'Manager' ? 'bg-purple-500 border-purple-500'
                            : 'bg-teal-500 border-teal-500'"></span>
                    {{ role }}
                </span>
                <span class="flex items-center gap-1.5 font-medium text-slate-400">
                    <span class="w-3 h-3 rounded-sm inline-block border-2 border-slate-300"></span>
                    No access
                </span>
            </div>

            <!-- Permission Matrix Table -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-100 dark:border-gray-700">
                            <th class="text-left px-5 py-3 font-semibold text-slate-700 dark:text-gray-200 w-1/2">Feature</th>
                            <th v-for="role in roles" :key="role"
                                class="text-center px-4 py-3 font-semibold min-w-[100px]"
                                :class="roleColors[role] || 'text-slate-600'">
                                <div>{{ role }}</div>
                                <div class="flex justify-center gap-1 mt-1">
                                    <button @click="toggleAll(role, true)"
                                        class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-slate-500 hover:bg-green-100 hover:text-green-700 transition-colors">
                                        All
                                    </button>
                                    <button @click="toggleAll(role, false)"
                                        class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                                        None
                                    </button>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(groupFeatures, groupName) in groupedFeatures" :key="groupName">
                            <!-- Group header row -->
                            <tr class="bg-slate-50 dark:bg-gray-700/50">
                                <td :colspan="roles.length + 1"
                                    class="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                                    {{ groupIcons[groupName] || '⚙️' }} {{ groupName }}
                                </td>
                            </tr>
                            <!-- Feature rows -->
                            <tr v-for="feature in groupFeatures" :key="feature.id"
                                class="border-t border-slate-50 dark:border-gray-700/50 hover:bg-slate-50/60 dark:hover:bg-gray-700/30 transition-colors">
                                <td class="px-5 py-3 text-slate-700 dark:text-gray-200">
                                    {{ feature.label }}
                                    <span class="ml-1.5 text-[10px] font-mono text-slate-400">({{ feature.key }})</span>
                                </td>
                                <td v-for="role in roles" :key="role" class="text-center px-4 py-3">
                                    <label class="inline-flex items-center justify-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            class="sr-only"
                                            v-model="permMatrix[feature.id][role]"
                                            @change="toggle(feature.id, role)"
                                        />
                                        <!-- Custom checkbox visual -->
                                        <span class="w-5 h-5 rounded flex items-center justify-center border-2 transition-all"
                                            :class="permMatrix[feature.id][role]
                                                ? (role === 'HR' ? 'bg-blue-500 border-blue-500'
                                                    : role === 'Manager' ? 'bg-purple-500 border-purple-500'
                                                    : 'bg-teal-500 border-teal-500')
                                                : 'border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800'">
                                            <svg v-if="permMatrix[feature.id][role]"
                                                class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                    </label>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Info note -->
            <p class="mt-4 text-xs text-slate-400 dark:text-gray-500">
                Changes are saved automatically on each toggle. The Admin role always has full access and is not listed here.
            </p>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
