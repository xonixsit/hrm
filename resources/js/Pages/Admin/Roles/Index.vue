<template>
  <AuthenticatedLayout>
    <PageLayout 
      title="Role Management" 
      subtitle="Assign and manage user roles in the system"
      :breadcrumbs="breadcrumbs"
    >
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SimpleInfoCard
          v-for="role in roleStats"
          :key="role.name"
          :title="role.name"
          :value="role.count"
          :subtitle="`${role.count === 1 ? 'user' : 'users'} with this role`"
          :icon="role.icon"
          :color="role.color"
        />
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900">User Role Assignments</h3>
          <p class="text-sm text-neutral-600 mt-1">Manage roles for all employees in the system</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Employee
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Role Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-neutral-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span class="text-sm font-semibold text-primary-700">
                        {{ getInitials(user.name) }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-neutral-900">{{ user.name }}</div>
                      <div class="text-sm text-neutral-500">{{ user.email }}</div>
                      <div class="text-xs text-neutral-400">ID: {{ user.employee_code }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span 
                      v-if="user.roles.length === 0"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800"
                    >
                      No Role
                    </span>
                    <span 
                      v-for="role in user.roles" 
                      :key="role"
                      :class="getRoleBadgeClass(role)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ role }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {{ user.job_title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                  >
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex flex-col space-y-3 min-w-[160px]">
                    <!-- Role Assignment Dropdown -->
                    <div class="space-y-1">
                      <label class="block text-xs font-medium text-neutral-700">
                        Assign Role
                      </label>
                      <BaseSelect
                        :model-value="user.roles[0] || ''"
                        :options="roleOptions"
                        placeholder="Select role"
                        class="w-full"
                        @update:model-value="(role) => assignRole(user.id, role)"
                      />
                    </div>
                    
                    <!-- Remove Role Button -->
                    <div v-if="user.roles.length > 0" class="space-y-1">
                      <label class="block text-xs font-medium text-neutral-700">
                        Remove Role
                      </label>
                      <BaseButton
                        v-if="canRemoveRole(user)"
                        variant="outline"
                        size="sm"
                        @click="removeRole(user.id, user.roles[0])"
                        class="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full justify-center"
                      >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Remove {{ user.roles[0] }}
                      </BaseButton>
                      
                      <!-- Self-removal warning -->
                      <div 
                        v-else
                        class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2 text-center"
                      >
                        {{ getSelfRemovalMessage(user) }}
                      </div>
                    </div>
                    
                    <!-- No Role State -->
                    <div v-else class="space-y-1">
                      <div class="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md p-2 text-center">
                        No role assigned
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  </AuthenticatedLayout>
</template>

<script setup>
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import SimpleInfoCard from '@/Components/UI/SimpleInfoCard.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'
import BaseButton from '@/Components/Base/BaseButton.vue'

const props = defineProps({
  users: Array,
  availableRoles: Array,
  currentUserId: Number,
})

const breadcrumbs = [
  { label: 'Dashboard', href: route('dashboard'), icon: 'home' },
  { label: 'Administration', href: '#' },
  { label: 'Role Management', href: route('admin.roles.index'), current: true },
]

const roleOptions = computed(() => {
  return props.availableRoles.map(role => ({
    value: role,
    label: role
  }))
})

const roleStats = computed(() => {
  const stats = props.availableRoles.map(role => {
    const count = props.users.filter(user => user.roles.includes(role)).length
    return {
      name: role,
      count,
      icon: getRoleIcon(role),
      color: getRoleColor(role)
    }
  })
  
  // Add "No Role" stat
  const noRoleCount = props.users.filter(user => user.roles.length === 0).length
  if (noRoleCount > 0) {
    stats.push({
      name: 'No Role',
      count: noRoleCount,
      icon: 'UserIcon',
      color: 'neutral'
    })
  }
  
  return stats
})

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getRoleIcon(role) {
  const icons = {
    'Admin': 'ShieldCheckIcon',
    'HR': 'UserGroupIcon',
    'Manager': 'BriefcaseIcon',
    'Employee': 'UserIcon',
  }
  return icons[role] || 'UserIcon'
}

function getRoleColor(role) {
  const colors = {
    'Admin': 'red',
    'HR': 'blue',
    'Manager': 'green',
    'Employee': 'yellow',
  }
  return colors[role] || 'neutral'
}

function getRoleBadgeClass(role) {
  const classes = {
    'Admin': 'bg-red-100 text-red-800',
    'HR': 'bg-blue-100 text-blue-800',
    'Manager': 'bg-green-100 text-green-800',
    'Employee': 'bg-yellow-100 text-yellow-800',
  }
  return classes[role] || 'bg-neutral-100 text-neutral-800'
}

function canRemoveRole(user) {
  // Prevent admin from removing their own admin role
  if (user.id === props.currentUserId && user.roles.includes('Admin')) {
    return false
  }
  return true
}

function getSelfRemovalMessage(user) {
  if (user.id === props.currentUserId && user.roles.includes('Admin')) {
    return 'Cannot remove your own Admin role'
  }
  return ''
}

function assignRole(userId, role) {
  if (!role) return
  
  // Check if user is trying to remove their own admin role
  const user = props.users.find(u => u.id === userId)
  if (userId === props.currentUserId && user?.roles.includes('Admin') && role !== 'Admin') {
    alert('You cannot remove your own Admin role.')
    return
  }
  
  router.post(route('admin.roles.assign', userId), {
    role: role
  }, {
    preserveScroll: true,
    onSuccess: () => {
      // Success message will be handled by the backend
    },
    onError: (errors) => {
      console.error('Error assigning role:', errors)
    }
  })
}

function removeRole(userId, role) {
  if (!role) return
  
  // Check if user is trying to remove their own admin role
  if (userId === props.currentUserId && role === 'Admin') {
    alert('You cannot remove your own Admin role.')
    return
  }
  
  if (confirm(`Are you sure you want to remove the ${role} role from this user?`)) {
    router.post(route('admin.roles.remove', userId), {
      role: role
    }, {
      preserveScroll: true,
      onSuccess: () => {
        // Success message will be handled by the backend
      },
      onError: (errors) => {
        console.error('Error removing role:', errors)
      }
    })
  }
}
</script>