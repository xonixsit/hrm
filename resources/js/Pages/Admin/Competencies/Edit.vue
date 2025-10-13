<script setup>
    import { ref, computed } from 'vue';
    import { useForm, Link } from '@inertiajs/vue3';
    import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
    import {
        PlusIcon,
        TrashIcon,
        EyeIcon,
        ArrowLeftIcon,
        InformationCircleIcon
    } from '@heroicons/vue/24/outline';

    const props = defineProps({
        competency: Object,
        departments: Array,
        categories: Array,
        defaultRatingGuidelines: Array
    });

    const form = useForm({
        name: props.competency.name || '',
        description: props.competency.description || '',
        category: props.competency.category || '',
        weight: props.competency.weight || 1.0,
        measurement_indicators: props.competency.measurement_indicators || [''],
        rating_guidelines: props.competency.rating_guidelines || props.defaultRatingGuidelines || [
            { rating: 1, description: 'Needs significant improvement' },
            { rating: 2, description: 'Below expectations' },
            { rating: 3, description: 'Meets expectations' },
            { rating: 4, description: 'Exceeds expectations' },
            { rating: 5, description: 'Outstanding performance' }
        ],
        department_id: props.competency.department_id || '',
        role_specific: props.competency.role_specific || false,
        is_active: props.competency.is_active !== undefined ? props.competency.is_active : true
    });

    const showPreview = ref(false);

    const addMeasurementIndicator = () => {
        form.measurement_indicators.push('');
    };

    const removeMeasurementIndicator = (index) => {
        if (form.measurement_indicators.length > 1) {
            form.measurement_indicators.splice(index, 1);
        }
    };

    const addRatingGuideline = () => {
        const nextRating = Math.max(...form.rating_guidelines.map(g => g.rating)) + 1;
        if (nextRating <= 5) {
            form.rating_guidelines.push({
                rating: nextRating,
                description: ''
            });
        }
    };

    const removeRatingGuideline = (index) => {
        if (form.rating_guidelines.length > 1) {
            form.rating_guidelines.splice(index, 1);
        }
    };

    const submit = () => {
        // Filter out empty measurement indicators
        form.measurement_indicators = form.measurement_indicators.filter(indicator => indicator.trim() !== '');

        // Sort rating guidelines by rating
        form.rating_guidelines.sort((a, b) => a.rating - b.rating);

        form.put(route('competencies.update', props.competency.id), {
            onSuccess: () => {
                // Redirect handled by controller
            }
        });
    };

    const previewCompetency = computed(() => {
        return {
            name: form.name || 'Competency Name',
            description: form.description || 'Competency description will appear here...',
            category: form.category || 'Category',
            weight: form.weight,
            measurement_indicators: form.measurement_indicators.filter(i => i.trim() !== ''),
            rating_guidelines: form.rating_guidelines.filter(g => g.description.trim() !== ''),
            department: props.departments.find(d => d.id == form.department_id)?.name || 'All Departments',
            role_specific: form.role_specific,
            is_active: form.is_active
        };
    });
</script>

<template>
    <AuthenticatedLayout>
        <div class="min-h-screen bg-gray-50">
            <!-- Page Header -->
            <div class="bg-white border-b border-gray-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="py-6">
                        <!-- Breadcrumbs -->
                        <nav class="flex mb-4" aria-label="Breadcrumb">
                            <ol class="flex items-center space-x-2 text-sm">
                                <li>
                                    <Link :href="route('dashboard')"
                                        class="text-gray-500 hover:text-gray-700 transition-colors">
                                    Dashboard
                                    </Link>
                                </li>
                                <li class="flex items-center">
                                    <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <Link :href="route('competencies.index')"
                                        class="text-gray-500 hover:text-gray-700 transition-colors">
                                    Competencies
                                    </Link>
                                </li>
                                <li class="flex items-center">
                                    <svg class="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    <span class="text-gray-900 font-medium">Edit Competency</span>
                                </li>
                            </ol>
                        </nav>

                        <!-- Page Title and Actions -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div class="mb-4 sm:mb-0">
                                <h1 class="text-2xl font-bold text-gray-900">Edit Competency</h1>
                                <p class="mt-1 text-sm text-gray-600">Update the competency details for your
                                    organization</p>
                            </div>
                            <div class="flex items-center space-x-3">
                                <Link :href="route('competencies.show', competency.id)"
                                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <EyeIcon class="w-4 h-4 mr-2" />
                                View Details
                                </Link>
                                <Link :href="route('competencies.index')"
                                    class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <ArrowLeftIcon class="w-4 h-4 mr-2" />
                                Back to List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                        <form @submit.prevent="submit" class="space-y-8">
                            <!-- Basic Information -->
                            <div class="form-section">
                                <div class="section-header">
                                    <h2 class="section-title">Basic Information</h2>
                                    <p class="section-subtitle">Update the core details of this competency</p>
                                </div>

                                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    <!-- Name Field -->
                                    <div class="lg:col-span-2">
                                        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                            Competency Name *
                                        </label>
                                        <input type="text" v-model="form.name" id="name" required
                                            placeholder="Enter competency name"
                                            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': form.errors.name }" />
                                        <div v-if="form.errors.name" class="mt-2 text-sm text-red-600">{{
                                            form.errors.name }}</div>
                                    </div>

                                    <!-- Weight Field -->
                                    <div>
                                        <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
                                            Weight *
                                        </label>
                                        <input type="number" v-model.number="form.weight" id="weight" step="0.1"
                                            min="0.1" max="5.0" required placeholder="1.0"
                                            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': form.errors.weight }" />
                                        <div v-if="form.errors.weight" class="mt-2 text-sm text-red-600">{{
                                            form.errors.weight }}</div>
                                        <p class="mt-1 text-xs text-gray-500">Higher weight = more important (1.0 - 5.0)
                                        </p>
                                    </div>

                                    <!-- Category Field -->
                                    <div>
                                        <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        <select v-model="form.category" id="category" required
                                            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': form.errors.category }">
                                            <option value="">Select a category</option>
                                            <option v-for="category in categories" :key="category" :value="category">
                                                {{ category }}
                                            </option>
                                        </select>
                                        <div v-if="form.errors.category" class="mt-2 text-sm text-red-600">{{
                                            form.errors.category }}</div>
                                    </div>

                                    <!-- Department Field -->
                                    <div>
                                        <label for="department_id" class="block text-sm font-medium text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <select v-model="form.department_id" id="department_id"
                                            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': form.errors.department_id }">
                                            <option value="">All Departments</option>
                                            <option v-for="department in departments" :key="department.id"
                                                :value="department.id">
                                                {{ department.name }}
                                            </option>
                                        </select>
                                        <div v-if="form.errors.department_id" class="mt-2 text-sm text-red-600">{{
                                            form.errors.department_id }}</div>
                                    </div>

                                    <!-- Description Field -->
                                    <div class="lg:col-span-3">
                                        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea v-model="form.description" id="description" rows="4"
                                            placeholder="Describe what this competency measures and why it's important..."
                                            class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            :class="{ 'border-red-500 focus:ring-red-500 focus:border-red-500': form.errors.description }"></textarea>
                                        <div v-if="form.errors.description" class="mt-2 text-sm text-red-600">{{
                                            form.errors.description }}</div>
                                    </div>

                                    <!-- Settings -->
                                    <div class="lg:col-span-3">
                                        <label class="block text-sm font-medium text-gray-700 mb-4">Settings</label>
                                        <div class="space-y-4">
                                            <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                                                <input v-model="form.role_specific" id="role_specific" type="checkbox"
                                                    class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <div class="ml-3">
                                                    <label for="role_specific"
                                                        class="text-sm font-medium text-gray-900">Role Specific</label>
                                                    <p class="text-xs text-gray-500">This competency applies to specific
                                                        roles only</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center p-4 bg-gray-50 rounded-lg">
                                                <input v-model="form.is_active" id="is_active" type="checkbox"
                                                    class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <div class="ml-3">
                                                    <label for="is_active"
                                                        class="text-sm font-medium text-gray-900">Active</label>
                                                    <p class="text-xs text-gray-500">Available for assessments and
                                                        evaluations</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                    <!-- Measurement Indicators -->
                    <div class="form-section">
                        <div class="section-header">
                            <h2 class="section-title">Measurement Indicators</h2>
                            <p class="section-subtitle">Define specific indicators that will be used to measure this
                                competency</p>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(indicator, index) in form.measurement_indicators" :key="index"
                                class="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div
                                    class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                    {{ index + 1 }}
                                </div>
                                <div class="flex-1">
                                    <input type="text" v-model="form.measurement_indicators[index]"
                                        :placeholder="`Enter measurement indicator ${index + 1}`"
                                        class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" />
                                </div>
                                <button type="button" @click="removeMeasurementIndicator(index)"
                                    :disabled="form.measurement_indicators.length === 1"
                                    class="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                                    <TrashIcon class="h-5 w-5" />
                                </button>
                            </div>
                            <button type="button" @click="addMeasurementIndicator"
                                class="inline-flex items-center px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                <PlusIcon class="h-5 w-5 mr-2" />
                                Add Measurement Indicator
                            </button>
                        </div>
                    </div>

                <!-- Rating Guidelines -->
                <div class="form-section">
                    <div class="section-header">
                        <h2 class="section-title">Rating Guidelines</h2>
                        <p class="section-subtitle">Define what each rating level means for this competency (1 = Poor to
                            5 = Outstanding)</p>
                    </div>

                    <div class="space-y-4">
                        <div v-for="(guideline, index) in form.rating_guidelines" :key="index"
                            class="flex items-start space-x-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    :class="{
                                                     'bg-red-500': guideline.rating === 1,
                                                     'bg-orange-500': guideline.rating === 2,
                                                     'bg-yellow-500': guideline.rating === 3,
                                                     'bg-green-500': guideline.rating === 4,
                                                     'bg-blue-500': guideline.rating === 5
                                                 }">
                                    {{ guideline.rating }}
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="mb-2">
                                    <span class="text-sm font-medium text-gray-700">
                                        Rating {{ guideline.rating }} -
                                        <span :class="{
                                                        'text-red-600': guideline.rating === 1,
                                                        'text-orange-600': guideline.rating === 2,
                                                        'text-yellow-600': guideline.rating === 3,
                                                        'text-green-600': guideline.rating === 4,
                                                        'text-blue-600': guideline.rating === 5
                                                    }">
                                            {{ guideline.rating === 1 ? 'Poor' :
                                            guideline.rating === 2 ? 'Needs Improvement' :
                                            guideline.rating === 3 ? 'Meets Expectations' :
                                            guideline.rating === 4 ? 'Exceeds Expectations' : 'Outstanding' }}
                                        </span>
                                    </span>
                                </div>
                                <textarea v-model="form.rating_guidelines[index].description"
                                    :placeholder="`Describe what constitutes a rating of ${guideline.rating} for this competency...`"
                                    rows="3"
                                    class="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"></textarea>
                            </div>
                            <button type="button" @click="removeRatingGuideline(index)"
                                :disabled="form.rating_guidelines.length === 1"
                                class="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                                <TrashIcon class="h-5 w-5" />
                            </button>
                        </div>
                        <button type="button" @click="addRatingGuideline" :disabled="form.rating_guidelines.length >= 5"
                            class="inline-flex items-center px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed disabled:hover:bg-blue-50">
                            <PlusIcon class="h-5 w-5 mr-2" />
                            Add Rating Level
                        </button>
                    </div>
                </div>

            <!-- Preview Section -->
            <div class="form-section">
                <div class="flex items-center justify-between mb-6">
                    <div class="section-header">
                        <h2 class="section-title">Preview</h2>
                        <p class="section-subtitle">See how this competency will appear to users</p>
                    </div>
                    <button type="button" @click="showPreview = !showPreview"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <EyeIcon class="h-5 w-5 mr-2" />
                        {{ showPreview ? 'Hide' : 'Show' }} Preview
                    </button>
                </div>

                <div v-if="showPreview"
                    class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8">
                    <div class="space-y-6">
                        <!-- Header -->
                        <div class="text-center">
                            <h3 class="text-2xl font-bold text-gray-900">{{ previewCompetency.name }}</h3>
                            <div class="mt-3 flex items-center justify-center space-x-4">
                                <span
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {{ previewCompetency.category }}
                                </span>
                                <span
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    Weight: {{ previewCompetency.weight }}
                                </span>
                                <span
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    {{ previewCompetency.department }}
                                </span>
                            </div>
                        </div>

                        <!-- Description -->
                        <div v-if="previewCompetency.description"
                            class="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 class="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                            <p class="text-sm text-gray-700 leading-relaxed">{{ previewCompetency.description }}</p>
                        </div>

                        <!-- Measurement Indicators -->
                        <div v-if="previewCompetency.measurement_indicators.length > 0"
                            class="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3">Measurement Indicators</h4>
                            <ul class="space-y-2">
                                <li v-for="(indicator, index) in previewCompetency.measurement_indicators"
                                    :key="indicator" class="flex items-start space-x-3">
                                    <div
                                        class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                        {{ index + 1 }}
                                    </div>
                                    <span class="text-sm text-gray-700">{{ indicator }}</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Rating Guidelines -->
                        <div v-if="previewCompetency.rating_guidelines.length > 0"
                            class="bg-white rounded-lg p-4 border border-blue-200">
                            <h4 class="text-sm font-semibold text-gray-900 mb-3">Rating Guidelines</h4>
                            <div class="space-y-3">
                                <div v-for="guideline in previewCompetency.rating_guidelines" :key="guideline.rating"
                                    class="flex items-start space-x-3 p-3 rounded-lg" :class="{
                                                         'bg-red-50 border border-red-200': guideline.rating === 1,
                                                         'bg-orange-50 border border-orange-200': guideline.rating === 2,
                                                         'bg-yellow-50 border border-yellow-200': guideline.rating === 3,
                                                         'bg-green-50 border border-green-200': guideline.rating === 4,
                                                         'bg-blue-50 border border-blue-200': guideline.rating === 5
                                                     }">
                                    <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                        :class="{
                                                             'bg-red-500': guideline.rating === 1,
                                                             'bg-orange-500': guideline.rating === 2,
                                                             'bg-yellow-500': guideline.rating === 3,
                                                             'bg-green-500': guideline.rating === 4,
                                                             'bg-blue-500': guideline.rating === 5
                                                         }">
                                        {{ guideline.rating }}
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-sm font-medium mb-1" :class="{
                                                                 'text-red-800': guideline.rating === 1,
                                                                 'text-orange-800': guideline.rating === 2,
                                                                 'text-yellow-800': guideline.rating === 3,
                                                                 'text-green-800': guideline.rating === 4,
                                                                 'text-blue-800': guideline.rating === 5
                                                             }">
                                            {{ guideline.rating === 1 ? 'Poor' :
                                            guideline.rating === 2 ? 'Needs Improvement' :
                                            guideline.rating === 3 ? 'Meets Expectations' :
                                            guideline.rating === 4 ? 'Exceeds Expectations' : 'Outstanding' }}
                                        </div>
                                        <p class="text-sm text-gray-700">{{ guideline.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between pt-8 border-t border-gray-200">
                <div class="flex items-center space-x-4">
                    <Link :href="route('competencies.index')"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <ArrowLeftIcon class="h-4 w-4 mr-2" />
                    Back to List
                    </Link>
                    <Link :href="route('competencies.show', competency.id)"
                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                    </Link>
                </div>
                <button type="submit" :disabled="form.processing"
                    class="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <span v-if="form.processing" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Updating...
                    </span>
                    <span v-else>Update Competency</span>
                </button>
            </div>
            </form>
        </div>
        </div>
        </div>
    </AuthenticatedLayout>
</template>

<style scoped>
    .form-section {
        @apply space-y-6;
    }

    .section-header {
        @apply mb-6;
    }

    .section-title {
        @apply text-lg font-semibold text-gray-900;
    }

    .section-subtitle {
        @apply mt-1 text-sm text-gray-600;
    }

    /* Form field focus states */
    input:focus,
    select:focus,
    textarea:focus {
        @apply ring-2 ring-blue-500 border-blue-500;
    }

    /* Checkbox styling */
    input[type="checkbox"]:checked {
        @apply bg-blue-600 border-blue-600;
    }

    /* Button hover effects */
    button:hover:not(:disabled) {
        @apply transform scale-105;
    }

    /* Smooth transitions */
    * {
        @apply transition-all duration-200;
    }

    /* Loading spinner animation */
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>