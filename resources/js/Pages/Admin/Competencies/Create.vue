<script setup>
import { ref, computed } from 'vue';
import { useForm, Link, usePage } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
    departments: Array,
    categories: Array,
    defaultRatingGuidelines: Array
});

const form = useForm({
    name: '',
    description: '',
    category: '',
    weight: 1.0,
    measurement_indicators: [''],
    rating_guidelines: props.defaultRatingGuidelines || [
        { rating: 1, description: 'Needs significant improvement' },
        { rating: 2, description: 'Below expectations' },
        { rating: 3, description: 'Meets expectations' },
        { rating: 4, description: 'Exceeds expectations' },
        { rating: 5, description: 'Outstanding performance' }
    ],
    department_id: '',
    role_specific: false,
    is_active: true
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
    
    form.post(route('competencies.store'), {
        onSuccess: () => {
            // Show success notification
            if (window.notify) {
                window.notify.success('Competency created successfully!');
            }
        },
        onError: (errors) => {
            // Show error notification
            if (window.notify) {
                window.notify.error('Please check the form for errors.');
            }
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
        <template #header>Create Competency</template>
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="sm:flex sm:items-center">
                <div class="sm:flex-auto">
                    <h1 class="text-base font-semibold leading-6 text-gray-900">Create Competency</h1>
                    <p class="mt-2 text-sm text-gray-700">Create a new competency for your organization.</p>
                </div>
            </div>
            <div class="-mx-4 mt-8 sm:-mx-0">
                <form @submit.prevent="submit">
                    <div class="space-y-12">
                        <!-- Basic Information -->
                        <div class="border-b border-gray-900/10 pb-12">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Basic Information</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Define the core details of this competency.</p>

                            <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div class="sm:col-span-4">
                                    <label for="name" class="block text-sm font-medium leading-6 text-gray-900">Name *</label>
                                    <div class="mt-2">
                                        <input 
                                            type="text" 
                                            v-model="form.name" 
                                            id="name" 
                                            required
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                                            :class="{ 'ring-red-500': form.errors.name }"
                                        />
                                        <div v-if="form.errors.name" class="mt-2 text-sm text-red-600">{{ form.errors.name }}</div>
                                    </div>
                                </div>

                                <div class="sm:col-span-2">
                                    <label for="weight" class="block text-sm font-medium leading-6 text-gray-900">Weight *</label>
                                    <div class="mt-2">
                                        <input 
                                            type="number" 
                                            v-model.number="form.weight" 
                                            id="weight" 
                                            step="0.1"
                                            min="0.1"
                                            max="5.0"
                                            required
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                                            :class="{ 'ring-red-500': form.errors.weight }"
                                        />
                                        <div v-if="form.errors.weight" class="mt-2 text-sm text-red-600">{{ form.errors.weight }}</div>
                                    </div>
                                </div>

                                <div class="col-span-full">
                                    <label for="description" class="block text-sm font-medium leading-6 text-gray-900">Description</label>
                                    <div class="mt-2">
                                        <textarea 
                                            v-model="form.description" 
                                            id="description" 
                                            rows="3" 
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            :class="{ 'ring-red-500': form.errors.description }"
                                        ></textarea>
                                        <div v-if="form.errors.description" class="mt-2 text-sm text-red-600">{{ form.errors.description }}</div>
                                    </div>
                                </div>

                                <div class="sm:col-span-3">
                                    <label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category *</label>
                                    <div class="mt-2">
                                        <select 
                                            v-model="form.category" 
                                            id="category" 
                                            required
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            :class="{ 'ring-red-500': form.errors.category }"
                                        >
                                            <option value="">Select a category</option>
                                            <option v-for="category in categories" :key="category" :value="category">
                                                {{ category }}
                                            </option>
                                        </select>
                                        <div v-if="form.errors.category" class="mt-2 text-sm text-red-600">{{ form.errors.category }}</div>
                                    </div>
                                </div>

                                <div class="sm:col-span-3">
                                    <label for="department_id" class="block text-sm font-medium leading-6 text-gray-900">Department</label>
                                    <div class="mt-2">
                                        <select 
                                            v-model="form.department_id" 
                                            id="department_id" 
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            :class="{ 'ring-red-500': form.errors.department_id }"
                                        >
                                            <option value="">All Departments</option>
                                            <option v-for="department in departments" :key="department.id" :value="department.id">
                                                {{ department.name }}
                                            </option>
                                        </select>
                                        <div v-if="form.errors.department_id" class="mt-2 text-sm text-red-600">{{ form.errors.department_id }}</div>
                                    </div>
                                </div>

                                <div class="col-span-full">
                                    <div class="flex items-center space-x-6">
                                        <div class="flex items-center">
                                            <input 
                                                v-model="form.role_specific" 
                                                id="role_specific" 
                                                type="checkbox" 
                                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <label for="role_specific" class="ml-2 block text-sm text-gray-900">Role Specific</label>
                                        </div>
                                        <div class="flex items-center">
                                            <input 
                                                v-model="form.is_active" 
                                                id="is_active" 
                                                type="checkbox" 
                                                class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                            />
                                            <label for="is_active" class="ml-2 block text-sm text-gray-900">Active</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Measurement Indicators -->
                        <div class="border-b border-gray-900/10 pb-12">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Measurement Indicators</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Define specific indicators that will be used to measure this competency.</p>

                            <div class="mt-6 space-y-4">
                                <div v-for="(indicator, index) in form.measurement_indicators" :key="index" class="flex items-center space-x-3">
                                    <div class="flex-1">
                                        <input 
                                            type="text" 
                                            v-model="form.measurement_indicators[index]" 
                                            :placeholder="`Measurement indicator ${index + 1}`"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        @click="removeMeasurementIndicator(index)"
                                        :disabled="form.measurement_indicators.length === 1"
                                        class="inline-flex items-center p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </button>
                                </div>
                                <button 
                                    type="button" 
                                    @click="addMeasurementIndicator"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50"
                                >
                                    <PlusIcon class="h-4 w-4 mr-2" />
                                    Add Indicator
                                </button>
                            </div>
                        </div>

                        <!-- Rating Guidelines -->
                        <div class="border-b border-gray-900/10 pb-12">
                            <h2 class="text-base font-semibold leading-7 text-gray-900">Rating Guidelines</h2>
                            <p class="mt-1 text-sm leading-6 text-gray-600">Define what each rating level means for this competency.</p>

                            <div class="mt-6 space-y-4">
                                <div v-for="(guideline, index) in form.rating_guidelines" :key="index" class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-sm font-medium">
                                            {{ guideline.rating }}
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <textarea 
                                            v-model="form.rating_guidelines[index].description" 
                                            :placeholder="`Description for rating ${guideline.rating}`"
                                            rows="2"
                                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="button" 
                                        @click="removeRatingGuideline(index)"
                                        :disabled="form.rating_guidelines.length === 1"
                                        class="inline-flex items-center p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon class="h-4 w-4" />
                                    </button>
                                </div>
                                <button 
                                    type="button" 
                                    @click="addRatingGuideline"
                                    :disabled="form.rating_guidelines.length >= 5"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-300 rounded-md hover:bg-indigo-50 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                                >
                                    <PlusIcon class="h-4 w-4 mr-2" />
                                    Add Rating Level
                                </button>
                            </div>
                        </div>

                        <!-- Preview Section -->
                        <div class="pb-12">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-base font-semibold leading-7 text-gray-900">Preview</h2>
                                    <p class="mt-1 text-sm leading-6 text-gray-600">See how this competency will appear to users.</p>
                                </div>
                                <button 
                                    type="button" 
                                    @click="showPreview = !showPreview"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    <EyeIcon class="h-4 w-4 mr-2" />
                                    {{ showPreview ? 'Hide' : 'Show' }} Preview
                                </button>
                            </div>

                            <div v-if="showPreview" class="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <div class="space-y-4">
                                    <div>
                                        <h3 class="text-lg font-medium text-gray-900">{{ previewCompetency.name }}</h3>
                                        <div class="mt-2 flex items-center space-x-4">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {{ previewCompetency.category }}
                                            </span>
                                            <span class="text-sm text-gray-500">Weight: {{ previewCompetency.weight }}</span>
                                            <span class="text-sm text-gray-500">{{ previewCompetency.department }}</span>
                                        </div>
                                    </div>
                                    
                                    <div v-if="previewCompetency.description">
                                        <p class="text-sm text-gray-700">{{ previewCompetency.description }}</p>
                                    </div>

                                    <div v-if="previewCompetency.measurement_indicators.length > 0">
                                        <h4 class="text-sm font-medium text-gray-900">Measurement Indicators:</h4>
                                        <ul class="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                                            <li v-for="indicator in previewCompetency.measurement_indicators" :key="indicator">
                                                {{ indicator }}
                                            </li>
                                        </ul>
                                    </div>

                                    <div v-if="previewCompetency.rating_guidelines.length > 0">
                                        <h4 class="text-sm font-medium text-gray-900">Rating Guidelines:</h4>
                                        <div class="mt-2 space-y-2">
                                            <div v-for="guideline in previewCompetency.rating_guidelines" :key="guideline.rating" class="flex items-start space-x-3">
                                                <div class="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-medium">
                                                    {{ guideline.rating }}
                                                </div>
                                                <p class="text-sm text-gray-700">{{ guideline.description }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex items-center justify-between">
                        <Link 
                            :href="route('competencies.index')"
                            class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <ArrowLeftIcon class="h-4 w-4 mr-2" />
                            Back to Competencies
                        </Link>
                        <div class="flex items-center gap-x-6">
                            <Link 
                                :href="route('competencies.index')"
                                class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
                            >
                                Cancel
                            </Link>
                            <button 
                                type="submit" 
                                :disabled="form.processing"
                                class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span v-if="form.processing">Creating...</span>
                                <span v-else>Create Competency</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </AuthenticatedLayout>
</template>