<script setup>
import { useForm, Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
    setting: { type: Object, default: null },
});

// ── Map state ──────────────────────────────────────────────────────────────────
const mapLoaded   = ref(false);
const detectingGps = ref(false);

const form = useForm({
    name:             props.setting?.name             ?? 'Office',
    is_active:        props.setting?.is_active        ?? true,
    ip_enabled:       props.setting?.ip_enabled       ?? true,
    allowed_ips:      (props.setting?.allowed_ips ?? []).join('\n'),
    gps_enabled:      props.setting?.gps_enabled      ?? true,
    latitude:         props.setting?.latitude         ?? '',
    longitude:        props.setting?.longitude        ?? '',
    radius_meters:    props.setting?.radius_meters    ?? 300,
    bypass_for_admin: props.setting?.bypass_for_admin ?? true,
});

const save = () => {
    form.post(route('admin.geofence.save'));
};

// ── Detect current location ────────────────────────────────────────────────────
const detectLocation = () => {
    if (!navigator.geolocation) return;
    detectingGps.value = true;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            form.latitude  = pos.coords.latitude.toFixed(7);
            form.longitude = pos.coords.longitude.toFixed(7);
            detectingGps.value = false;
        },
        () => { detectingGps.value = false; },
        { timeout: 10000 }
    );
};

// ── Google Maps embed URL ──────────────────────────────────────────────────────
const mapEmbedUrl = computed(() => {
    if (!form.latitude || !form.longitude) return null;
    const lat = form.latitude;
    const lng = form.longitude;
    const r   = form.radius_meters;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
});

const mapsLink = computed(() => {
    if (!form.latitude || !form.longitude) return null;
    return `https://www.google.com/maps?q=${form.latitude},${form.longitude}`;
});
</script>

<template>
    <AuthenticatedLayout>
        <Head title="Geofence Settings" />

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

            <!-- Header -->
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </div>
                <div>
                    <h1 class="text-xl font-bold text-neutral-900">Geofence Settings</h1>
                    <p class="text-sm text-neutral-500">Restrict logins to the office network and location</p>
                </div>
            </div>

            <!-- Success flash -->
            <div v-if="$page.props.flash?.success" class="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                {{ $page.props.flash.success }}
            </div>

            <form @submit.prevent="save" class="space-y-6">

                <!-- General -->
                <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                    <h2 class="font-semibold text-neutral-900">General</h2>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-neutral-700 mb-1">Location Name</label>
                            <input v-model="form.name" type="text" class="w-full rounded-lg border-neutral-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" />
                        </div>
                        <div class="flex items-center gap-3 mt-6">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input v-model="form.is_active" type="checkbox" class="sr-only peer" />
                                <div class="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-teal-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                            <span class="text-sm font-medium text-neutral-700">Geofencing Active</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input v-model="form.bypass_for_admin" type="checkbox" class="sr-only peer" />
                            <div class="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-teal-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                        <span class="text-sm text-neutral-700">Admin accounts bypass geofence</span>
                    </div>
                </div>

                <!-- IP Whitelist -->
                <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-semibold text-neutral-900">IP Whitelist</h2>
                            <p class="text-xs text-neutral-500 mt-0.5">Allow logins only from these IP addresses</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input v-model="form.ip_enabled" type="checkbox" class="sr-only peer" />
                            <div class="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-teal-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                    </div>

                    <div :class="{ 'opacity-40 pointer-events-none': !form.ip_enabled }">
                        <label class="block text-sm font-medium text-neutral-700 mb-1">
                            Allowed IPs
                            <span class="font-normal text-neutral-400">(one per line or comma-separated)</span>
                        </label>
                        <textarea
                            v-model="form.allowed_ips"
                            rows="4"
                            placeholder="103.160.27.213&#10;103.160.27.245"
                            class="w-full rounded-lg border-neutral-300 border px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                        ></textarea>
                        <p v-if="form.errors.allowed_ips" class="text-xs text-red-600 mt-1">{{ form.errors.allowed_ips }}</p>
                    </div>
                </div>

                <!-- GPS Geofence -->
                <div class="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h2 class="font-semibold text-neutral-900">GPS Geofence</h2>
                            <p class="text-xs text-neutral-500 mt-0.5">Allow logins only from within the set radius of the office</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input v-model="form.gps_enabled" type="checkbox" class="sr-only peer" />
                            <div class="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-teal-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                    </div>

                    <div :class="{ 'opacity-40 pointer-events-none': !form.gps_enabled }" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-neutral-700 mb-1">Latitude</label>
                                <input v-model="form.latitude" type="number" step="any" placeholder="17.3850000" class="w-full rounded-lg border-neutral-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                <p v-if="form.errors.latitude" class="text-xs text-red-600 mt-1">{{ form.errors.latitude }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-neutral-700 mb-1">Longitude</label>
                                <input v-model="form.longitude" type="number" step="any" placeholder="78.4867000" class="w-full rounded-lg border-neutral-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                <p v-if="form.errors.longitude" class="text-xs text-red-600 mt-1">{{ form.errors.longitude }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-neutral-700 mb-1">Radius (metres)</label>
                                <input v-model="form.radius_meters" type="number" min="50" max="50000" class="w-full rounded-lg border-neutral-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                <p v-if="form.errors.radius_meters" class="text-xs text-red-600 mt-1">{{ form.errors.radius_meters }}</p>
                            </div>
                        </div>

                        <!-- Detect location button -->
                        <button
                            type="button"
                            @click="detectLocation"
                            :disabled="detectingGps"
                            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
                        >
                            <svg class="w-4 h-4" :class="{ 'animate-spin': detectingGps }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {{ detectingGps ? 'Detecting…' : 'Use my current location' }}
                        </button>

                        <!-- Map preview -->
                        <div v-if="mapEmbedUrl" class="rounded-lg overflow-hidden border border-neutral-200 h-56 relative">
                            <iframe
                                :src="mapEmbedUrl"
                                class="w-full h-full border-0"
                                allowfullscreen
                                loading="lazy"
                                referrerpolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <a
                                :href="mapsLink"
                                target="_blank"
                                class="absolute bottom-2 right-2 text-xs bg-white border border-neutral-300 rounded px-2 py-1 text-teal-700 hover:bg-neutral-50 shadow-sm"
                            >Open in Maps ↗</a>
                        </div>
                        <div v-else class="rounded-lg border border-dashed border-neutral-300 h-32 flex items-center justify-center text-sm text-neutral-400">
                            Enter coordinates or use "Detect location" to preview the map
                        </div>
                    </div>
                </div>

                <!-- Save -->
                <div class="flex justify-end">
                    <button
                        type="submit"
                        :disabled="form.processing"
                        class="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                        <svg v-if="form.processing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115 0M20 15a9 9 0 01-15 0"/>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Save Settings
                    </button>
                </div>

            </form>
        </div>
    </AuthenticatedLayout>
</template>
