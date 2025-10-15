<template>
  <AuthenticatedLayout>
    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 text-gray-900">
            <h1 class="text-2xl font-bold mb-6">My Assessments Debug Page</h1>
            
            <!-- Debug Information -->
            <div class="space-y-6">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Props Debug</h2>
                <pre class="text-sm bg-white p-2 rounded border overflow-auto">{{ JSON.stringify(props, null, 2) }}</pre>
              </div>
              
              <div class="bg-blue-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Assessments Data</h2>
                <p><strong>Total:</strong> {{ assessments?.total || 'N/A' }}</p>
                <p><strong>Count:</strong> {{ assessments?.data?.length || 0 }}</p>
                <p><strong>Current Page:</strong> {{ assessments?.current_page || 'N/A' }}</p>
                <p><strong>Per Page:</strong> {{ assessments?.per_page || 'N/A' }}</p>
              </div>
              
              <div class="bg-green-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Stats</h2>
                <p><strong>Total:</strong> {{ stats?.total || 'N/A' }}</p>
                <p><strong>Pending:</strong> {{ stats?.pending || 'N/A' }}</p>
                <p><strong>Completed:</strong> {{ stats?.completed || 'N/A' }}</p>
              </div>
              
              <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Individual Assessments</h2>
                <div v-if="assessments?.data && assessments.data.length > 0">
                  <div v-for="(assessment, index) in assessments.data" :key="assessment.id" class="mb-4 p-3 bg-white rounded border">
                    <h3 class="font-medium">Assessment {{ index + 1 }}</h3>
                    <p><strong>ID:</strong> {{ assessment.id }}</p>
                    <p><strong>Employee:</strong> {{ assessment.employee?.user?.name || 'Unknown' }}</p>
                    <p><strong>Competency:</strong> {{ assessment.competency?.name || 'Unknown' }}</p>
                    <p><strong>Type:</strong> {{ assessment.assessment_type }}</p>
                    <p><strong>Status:</strong> {{ assessment.status }}</p>
                    <p><strong>Assessor ID:</strong> {{ assessment.assessor_id }}</p>
                    <p><strong>Employee ID:</strong> {{ assessment.employee_id }}</p>
                  </div>
                </div>
                <div v-else class="text-gray-500">
                  No assessments data found
                </div>
              </div>
              
              <div class="bg-red-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Route Testing</h2>
                <p><strong>Route function available:</strong> {{ typeof route !== 'undefined' ? 'Yes' : 'No' }}</p>
                <div v-if="typeof route !== 'undefined'">
                  <p><strong>My Assessments Route:</strong> {{ safeRoute('competency-assessments.my-assessments') }}</p>
                  <p><strong>Index Route:</strong> {{ safeRoute('competency-assessments.index') }}</p>
                </div>
              </div>
              
              <div class="bg-purple-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-2">Actions</h2>
                <div class="space-x-4">
                  <Link 
                    :href="safeRoute('competency-assessments.my-assessments')"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Reload My Assessments
                  </Link>
                  <Link 
                    :href="safeRoute('competency-assessments.index')"
                    class="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Go to All Assessments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  assessments: Object,
  stats: Object,
  employees: Array,
  assessmentCycles: Array,
  statusOptions: Array,
  filters: Object
});

// Log everything to console for debugging
console.log('=== MY ASSESSMENTS DEBUG ===');
console.log('Props:', props);
console.log('Assessments:', props.assessments);
console.log('Stats:', props.stats);
console.log('Route function:', typeof route);

const safeRoute = (routeName, params = null) => {
  try {
    if (typeof route === 'undefined') {
      console.warn(`Route function not available for: ${routeName}`);
      return '#';
    }
    return route(routeName, params);
  } catch (error) {
    console.error(`Error generating route ${routeName}:`, error);
    return '#';
  }
};
</script>