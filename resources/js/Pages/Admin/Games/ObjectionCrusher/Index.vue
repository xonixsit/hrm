<template>
  <AuthenticatedLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Objection Crusher - Content Management
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="text-sm text-gray-600">Total Objections</div>
            <div class="text-3xl font-bold text-gray-900">{{ stats.total }}</div>
          </div>
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="text-sm text-gray-600">Active</div>
            <div class="text-3xl font-bold text-green-600">{{ stats.active }}</div>
          </div>
          <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div class="text-sm text-gray-600">Categories</div>
            <div class="text-3xl font-bold text-blue-600">{{ stats.categories.length }}</div>
          </div>
        </div>

        <!-- AI Generator Card -->
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            🤖 AI Content Generator
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input
                v-model="generator.topic"
                type="text"
                placeholder="e.g., Tax Amendments, Price Objections"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                v-model="generator.difficulty"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Number of Pairs</label>
              <input
                v-model.number="generator.count"
                type="number"
                min="1"
                max="50"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            @click="generateContent"
            :disabled="generating"
            class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="generating">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating with AI...
            </span>
            <span v-else>
              🎯 Generate with AI
            </span>
          </button>
        </div>

        <!-- Generated Content Review -->
        <div v-if="generatedPairs.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Generated Pairs - Review & Approve
          </h3>

          <div class="space-y-4">
            <div
              v-for="(pair, index) in generatedPairs"
              :key="index"
              class="border border-gray-200 rounded-lg p-4"
              :class="{ 'opacity-50': pair.rejected }"
            >
              <div class="flex justify-between items-start mb-2">
                <span class="text-sm font-medium text-gray-500">Pair {{ index + 1 }}</span>
                <div class="flex space-x-2">
                  <button
                    v-if="!pair.approved && !pair.rejected"
                    @click="approvePair(index)"
                    class="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    ✓ Approve
                  </button>
                  <button
                    v-if="pair.approved"
                    @click="pair.approved = false"
                    class="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Undo
                  </button>
                  <button
                    @click="rejectPair(index)"
                    class="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Objection:</label>
                  <textarea
                    v-model="pair.objection"
                    rows="2"
                    class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Response:</label>
                  <textarea
                    v-model="pair.response"
                    rows="2"
                    class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Category:</label>
                    <input
                      v-model="pair.category"
                      type="text"
                      class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Difficulty:</label>
                    <select
                      v-model="pair.difficulty"
                      class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div v-if="pair.tips">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Tips:</label>
                  <textarea
                    v-model="pair.tips"
                    rows="1"
                    class="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              <div v-if="pair.approved" class="mt-2 text-sm text-green-600 font-medium">
                ✓ Approved
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <button
              @click="clearGenerated"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clear All
            </button>
            <button
              @click="saveApproved"
              :disabled="approvedCount === 0 || saving"
              class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>💾 Save {{ approvedCount }} Approved Pairs</span>
            </button>
          </div>
        </div>

        <!-- Existing Objections List -->
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Existing Objections
          </h3>

          <div class="space-y-3">
            <div
              v-for="objection in objections.data"
              :key="objection.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-medium text-gray-900 mb-1">
                    {{ objection.objection_text }}
                  </div>
                  <div class="text-sm text-gray-600 mb-2">
                    Response: {{ objection.responses[0]?.response_text }}
                  </div>
                  <div class="flex space-x-3 text-xs text-gray-500">
                    <span class="px-2 py-1 bg-gray-100 rounded">{{ objection.category }}</span>
                    <span class="px-2 py-1 bg-gray-100 rounded">{{ objection.difficulty }}</span>
                    <span class="px-2 py-1 bg-gray-100 rounded">Used: {{ objection.usage_count }} times</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    @click="toggleActive(objection)"
                    :class="objection.active ? 'text-green-600' : 'text-gray-400'"
                    class="hover:text-green-700"
                  >
                    {{ objection.active ? '✓ Active' : '○ Inactive' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="objections.links" class="mt-6 flex justify-center space-x-2">
            <Link
              v-for="link in objections.links"
              :key="link.label"
              :href="link.url"
              :class="[
                'px-4 py-2 border rounded-lg',
                link.active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              ]"
              v-html="link.label"
            />
          </div>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { router, Link } from '@inertiajs/vue3';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';

const props = defineProps({
  objections: Object,
  stats: Object
});

const generator = ref({
  topic: 'Tax Amendments',
  difficulty: 'medium',
  count: 10
});

const generating = ref(false);
const saving = ref(false);
const generatedPairs = ref([]);

const approvedCount = computed(() => {
  return generatedPairs.value.filter(p => p.approved && !p.rejected).length;
});

const generateContent = async () => {
  generating.value = true;
  
  try {
    const response = await axios.post(route('admin.games.objection-crusher.generate'), generator.value);
    
    if (response.data.success && response.data.data.pairs) {
      generatedPairs.value = response.data.data.pairs.map(pair => ({
        ...pair,
        approved: false,
        rejected: false
      }));
    }
  } catch (error) {
    console.error('Generation error:', error);
    alert('Failed to generate content. Please try again.');
  } finally {
    generating.value = false;
  }
};

const approvePair = (index) => {
  generatedPairs.value[index].approved = true;
  generatedPairs.value[index].rejected = false;
};

const rejectPair = (index) => {
  generatedPairs.value[index].rejected = true;
  generatedPairs.value[index].approved = false;
};

const clearGenerated = () => {
  if (confirm('Clear all generated pairs?')) {
    generatedPairs.value = [];
  }
};

const saveApproved = async () => {
  const approved = generatedPairs.value.filter(p => p.approved && !p.rejected);
  
  if (approved.length === 0) {
    alert('No pairs approved');
    return;
  }

  saving.value = true;

  try {
    const response = await axios.post(route('admin.games.objection-crusher.store'), {
      pairs: approved
    });

    if (response.data.success) {
      alert(`${approved.length} pairs saved successfully!`);
      generatedPairs.value = [];
      router.reload();
    }
  } catch (error) {
    console.error('Save error:', error);
    alert('Failed to save pairs. Please try again.');
  } finally {
    saving.value = false;
  }
};

const toggleActive = async (objection) => {
  try {
    await axios.put(route('admin.games.objection-crusher.update', objection.id), {
      ...objection,
      active: !objection.active
    });
    router.reload();
  } catch (error) {
    console.error('Update error:', error);
    alert('Failed to update objection.');
  }
};
</script>
