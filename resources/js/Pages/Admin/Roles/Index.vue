<template>
  <AuthenticatedLayout>
    <PageLayout title="Role Management" subtitle="Assign and manage user roles in the system"
      :breadcrumbs="breadcrumbs">

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SimpleInfoCard v-for="role in roleStats" :key="role.name" :title="role.name" :value="role.count"
          :subtitle="`${role.count === 1 ? 'user' : 'users'} with this role`" :icon="role.icon" :color="role.color" />
      </div>

      <!-- Roles Management Panel -->
      <div class="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
        <div class="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-neutral-900">Roles</h3>
            <p class="text-sm text-neutral-500 mt-0.5">System roles cannot be renamed or deleted.</p>
          </div>
          <!-- Create Role Button -->
          <button @click="showCreateModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style="background: linear-gradient(135deg, #006970, #00a9b4)">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Role
          </button>
        </div>

        <div class="px-6 py-4 flex flex-wrap gap-3">
          <div v-for="role in availableRoles" :key="role.name"
            class="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium"
            :class="role.is_system
              ? 'bg-slate-50 border-slate-200 text-slate-600'
              : 'bg-teal-50 border-teal-200 text-teal-700'">

            <!-- System role: locked icon -->
            <svg v-if="role.is_system" class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>

            <!-- Custom role: editable name -->
            <template v-if="!role.is_system && renamingRole === role.name">
              <input
                v-model="renameValue"
                @keyup.enter="submitRename(role.name)"
                @keyup.escape="renamingRole = null"
                class="w-28 text-sm border border-teal-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400"
                autofocus
              />
              <button @click="submitRename(role.name)" class="text-teal-600 hover:text-teal-800">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
              <button @click="renamingRole = null" class="text-slate-400 hover:text-slate-600">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </template>

            <template v-else>
              <span>{{ role.name }}</span>
              <!-- Custom role actions -->
              <template v-if="!role.is_system">
                <button @click="startRename(role.name)" title="Rename"
                  class="text-teal-400 hover:text-teal-700 transition-colors ml-0.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
                <button @click="confirmDelete(role.name)" title="Delete"
                  class="text-red-400 hover:text-red-600 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </template>
            </template>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div class="px-6 py-4 border-b border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900">User Role Assignments</h3>
          <p class="text-sm text-neutral-600 mt-1">Manage roles for all employees in the system</p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-neutral-200 role-management-table">
            <thead class="bg-neutral-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Current Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Job Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-48">Assign Role</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-neutral-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-neutral-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-semibold text-teal-700">{{ getInitials(user.name) }}</span>
                    </div>
                    <div class="ml-4 min-w-0">
                      <div class="text-sm font-medium text-neutral-900 truncate">{{ user.name }}</div>
                      <div class="text-sm text-neutral-500 truncate">{{ user.email }}</div>
                      <div class="text-xs text-neutral-400">ID: {{ user.employee_code }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="user.roles.length === 0"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                      No Role
                    </span>
                    <span v-for="r in user.roles" :key="r"
                      :class="getRoleBadgeClass(r)"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {{ r }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {{ user.job_title || 'Not specified' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                    {{ user.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium">
                  <BaseSelect
                    :model-value="user.roles[0] || ''"
                    :options="roleOptions"
                    placeholder="Select role"
                    size="sm"
                    class="w-44"
                    @update:model-value="(r) => assignRole(user.id, r)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>

    <!-- ── Create Role Modal ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCreateModal"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click.self="showCreateModal = false">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-1">Create New Role</h2>
            <p class="text-sm text-slate-500 mb-4">Enter a name for the new role. You can assign feature permissions to it afterwards.</p>

            <label class="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
            <input
              v-model="newRoleName"
              @keyup.enter="submitCreate"
              placeholder="e.g. Supervisor"
              class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              :class="createError ? 'border-red-400' : ''"
            />
            <p v-if="createError" class="text-xs text-red-500 mt-1">{{ createError }}</p>

            <div class="flex justify-end gap-3 mt-5">
              <button @click="showCreateModal = false; newRoleName = ''; createError = null"
                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button @click="submitCreate" :disabled="creating"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
                :class="creating ? 'opacity-60 cursor-not-allowed' : ''"
                style="background: linear-gradient(135deg, #006970, #00a9b4)">
                {{ creating ? 'Creating…' : 'Create Role' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingRole"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          @click.self="deletingRole = null">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-lg font-bold text-slate-800">Delete "{{ deletingRole }}"?</h2>
            </div>
            <p class="text-sm text-slate-500 mb-5">
              Users with only this role will be reassigned to <strong>Employee</strong>. This cannot be undone.
            </p>
            <div class="flex justify-end gap-3">
              <button @click="deletingRole = null"
                class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button @click="submitDelete" :disabled="deleting"
                class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
                :class="deleting ? 'opacity-60 cursor-not-allowed' : ''">
                {{ deleting ? 'Deleting…' : 'Delete Role' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </AuthenticatedLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from '@inertiajs/vue3'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import PageLayout from '@/Components/Layout/PageLayout.vue'
import SimpleInfoCard from '@/Components/UI/SimpleInfoCard.vue'
import BaseSelect from '@/Components/Base/BaseSelect.vue'

const props = defineProps({
  users:          Array,   // [{ id, name, email, employee_code, job_title, roles, status }]
  availableRoles: Array,   // [{ name, is_system }]
  currentUserId:  Number,
})

const breadcrumbs = [
  { label: 'Dashboard',       href: route('dashboard'),         icon: 'home' },
  { label: 'Administration',  href: '#' },
  { label: 'Role Management', href: route('admin.roles.index'), current: true },
]

// ── Role options for the assign dropdown ──────────────────────────────────
const roleOptions = computed(() =>
  props.availableRoles.map(r => ({ value: r.name, label: r.name }))
)

// ── Stats cards ───────────────────────────────────────────────────────────
const roleStats = computed(() => {
  const stats = props.availableRoles.map(r => ({
    name:  r.name,
    count: props.users.filter(u => u.roles.includes(r.name)).length,
    icon:  getRoleIcon(r.name),
    color: getRoleColor(r.name),
  }))
  const noRole = props.users.filter(u => u.roles.length === 0).length
  if (noRole > 0) stats.push({ name: 'No Role', count: noRole, icon: 'UserIcon', color: 'neutral' })
  return stats
})

// ── Create Role ───────────────────────────────────────────────────────────
const showCreateModal = ref(false)
const newRoleName     = ref('')
const createError     = ref(null)
const creating        = ref(false)

function submitCreate() {
  const name = newRoleName.value.trim()
  if (!name) { createError.value = 'Role name is required.'; return }
  creating.value = true
  createError.value = null
  router.post(route('admin.roles.create'), { name }, {
    preserveScroll: true,
    onSuccess: () => {
      showCreateModal.value = false
      newRoleName.value = ''
    },
    onError: (errors) => {
      createError.value = errors.name || 'Failed to create role.'
    },
    onFinish: () => { creating.value = false },
  })
}

// ── Rename Role ───────────────────────────────────────────────────────────
const renamingRole = ref(null)
const renameValue  = ref('')

function startRename(name) {
  renamingRole.value = name
  renameValue.value  = name
}

function submitRename(oldName) {
  const newName = renameValue.value.trim()
  if (!newName || newName === oldName) { renamingRole.value = null; return }
  router.patch(route('admin.roles.rename', { role: oldName }), { name: newName }, {
    preserveScroll: true,
    onSuccess: () => { renamingRole.value = null },
    onError:   (e) => { alert(e.name || 'Failed to rename role.') },
  })
}

// ── Delete Role ───────────────────────────────────────────────────────────
const deletingRole = ref(null)
const deleting     = ref(false)

function confirmDelete(name) {
  deletingRole.value = name
}

function submitDelete() {
  deleting.value = true
  router.delete(route('admin.roles.delete', { role: deletingRole.value }), {
    preserveScroll: true,
    onSuccess: () => { deletingRole.value = null },
    onError:   (e) => { alert(e.role || 'Failed to delete role.') },
    onFinish:  () => { deleting.value = false },
  })
}

// ── Assign Role ───────────────────────────────────────────────────────────
function assignRole(userId, role) {
  if (!role) return
  const user = props.users.find(u => u.id === userId)
  if (userId === props.currentUserId && user?.roles.includes('Admin') && role !== 'Admin') {
    alert('You cannot remove your own Admin role.')
    return
  }
  if (user?.roles.includes(role)) return
  router.post(route('admin.roles.assign', userId), { role }, {
    preserveScroll: true,
    onError: (errors) => alert(errors.role || errors.message || 'Failed to assign role.'),
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Deterministic pastel colour from role name hash for custom roles
function getRoleColor(role) {
  const map = { Admin: 'red', HR: 'blue', Manager: 'green', Employee: 'yellow' }
  return map[role] ?? 'teal'
}

function getRoleIcon(role) {
  const map = { Admin: 'ShieldCheckIcon', HR: 'UserGroupIcon', Manager: 'BriefcaseIcon', Employee: 'UserIcon' }
  return map[role] ?? 'UserCircleIcon'
}

const BADGE_PALETTE = [
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-lime-100 text-lime-800',
  'bg-cyan-100 text-cyan-800',
]

function getRoleBadgeClass(role) {
  const fixed = {
    Admin:    'bg-red-100 text-red-800',
    HR:       'bg-teal-100 text-teal-800',
    Manager:  'bg-green-100 text-green-800',
    Employee: 'bg-yellow-100 text-yellow-800',
  }
  if (fixed[role]) return fixed[role]
  // Deterministic colour for custom roles based on name char sum
  const idx = [...role].reduce((s, c) => s + c.charCodeAt(0), 0) % BADGE_PALETTE.length
  return BADGE_PALETTE[idx]
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
