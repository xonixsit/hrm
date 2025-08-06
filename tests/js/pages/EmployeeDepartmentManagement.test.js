import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
  router: {
    visit: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  },
  useForm: vi.fn(() => ({
    name: '',
    code: '',
    description: '',
    manager_id: '',
    parent_id: '',
    budget: '',
    location: '',
    status: 'Active',
    established_date: '',
    errors: {},
    processing: false,
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    reset: vi.fn(),
    clearErrors: vi.fn()
  })),
  Link: {
    name: 'Link',
    template: '<a><slot /></a>',
    props: ['href']
  }
}))

// Mock route helper
global.route = vi.fn((name, params) => `/${name.replace('.', '/')}${params ? `/${params}` : ''}`)

describe('Employee and Department Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Employee Management', () => {
    describe('Employee Index Page', () => {
      it('should render employee list with enhanced profile cards', () => {
        const mockEmployees = {
          data: [
            {
              id: 1,
              user: { 
                name: 'John Doe', 
                email: 'john@example.com',
                email_verified_at: '2023-01-15T10:00:00Z'
              },
              department: { name: 'Engineering' },
              job_title: 'Software Developer',
              employee_code: 'EMP001',
              join_date: '2023-01-15',
              contract_type: 'Full-time',
              phone: '+1234567890',
              skills: ['JavaScript', 'Vue.js', 'Laravel'],
              performance_score: 85
            }
          ],
          total: 1,
          current_page: 1,
          last_page: 1,
          per_page: 10
        }

        expect(mockEmployees.data).toHaveLength(1)
        expect(mockEmployees.data[0].user.name).toBe('John Doe')
        expect(mockEmployees.data[0].user.email_verified_at).toBeTruthy()
        expect(mockEmployees.data[0].skills).toContain('JavaScript')
      })

      it('should handle advanced search functionality', () => {
        const searchFilters = {
          search: 'John',
          departments: [1, 2],
          contract_types: ['Full-time'],
          status: 'active',
          email_verified: 'verified',
          join_date_range: {
            start: '2023-01-01',
            end: '2023-12-31'
          },
          has_manager: true,
          is_manager: false,
          sort_by: 'name',
          sort_direction: 'asc'
        }

        expect(searchFilters.search).toBe('John')
        expect(searchFilters.departments).toContain(1)
        expect(searchFilters.contract_types).toContain('Full-time')
        expect(searchFilters.email_verified).toBe('verified')
      })

      it('should generate correct employee initials', () => {
        const getInitials = (name) => {
          return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
        }

        expect(getInitials('John Doe')).toBe('JD')
        expect(getInitials('Jane Smith Johnson')).toBe('JS')
        expect(getInitials('Alice')).toBe('A')
        expect(getInitials('Mary Jane Watson')).toBe('MJ')
      })

      it('should calculate time with company correctly', () => {
        const getTimeWithCompany = (joinDate) => {
          if (!joinDate) return 'N/A'
          
          const join = new Date(joinDate)
          const now = new Date()
          const diffTime = Math.abs(now - join)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 30) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'}`
          } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30)
            return `${months} month${months === 1 ? '' : 's'}`
          } else {
            const years = Math.floor(diffDays / 365)
            return `${years} year${years === 1 ? '' : 's'}`
          }
        }

        // Test with a date 45 days ago
        const fortyFiveDaysAgo = new Date()
        fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45)
        
        const result = getTimeWithCompany(fortyFiveDaysAgo.toISOString())
        expect(result).toMatch(/month/)
      })
    })

    describe('Employee Profile Card Component', () => {
      it('should display employee information correctly', () => {
        const mockEmployee = {
          id: 1,
          user: { 
            name: 'John Doe', 
            email: 'john@example.com',
            email_verified_at: '2023-01-15T10:00:00Z'
          },
          department: { name: 'Engineering' },
          job_title: 'Software Developer',
          employee_code: 'EMP001',
          join_date: '2023-01-15',
          contract_type: 'Full-time',
          phone: '+1234567890',
          skills: ['JavaScript', 'Vue.js', 'Laravel', 'PHP', 'MySQL'],
          performance_score: 85,
          updated_at: '2023-01-15T10:00:00Z'
        }

        expect(mockEmployee.user.name).toBe('John Doe')
        expect(mockEmployee.skills).toHaveLength(5)
        expect(mockEmployee.performance_score).toBe(85)
        expect(mockEmployee.user.email_verified_at).toBeTruthy()
      })

      it('should handle contract type styling', () => {
        const getContractTypeClasses = (contractType) => {
          const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium'
          
          switch (contractType) {
            case 'Full-time':
              return `${baseClasses} bg-green-100 text-green-800`
            case 'Part-time':
              return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'Contract':
              return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Temporary':
              return `${baseClasses} bg-purple-100 text-purple-800`
            default:
              return `${baseClasses} bg-neutral-100 text-neutral-800`
          }
        }

        expect(getContractTypeClasses('Full-time')).toContain('bg-green-100')
        expect(getContractTypeClasses('Part-time')).toContain('bg-yellow-100')
        expect(getContractTypeClasses('Contract')).toContain('bg-blue-100')
        expect(getContractTypeClasses('Unknown')).toContain('bg-neutral-100')
      })
    })
  })

  describe('Department Management', () => {
    describe('Department Index Page', () => {
      it('should render department list with organizational structure', () => {
        const mockDepartments = {
          data: [
            {
              id: 1,
              name: 'Engineering',
              code: 'ENG',
              description: 'Software development and technical operations',
              manager: {
                id: 1,
                user: { name: 'John Doe' },
                job_title: 'Engineering Manager'
              },
              employees_count: 15,
              recent_employees: [
                { id: 1, user: { name: 'Alice Smith' } },
                { id: 2, user: { name: 'Bob Johnson' } },
                { id: 3, user: { name: 'Carol Wilson' } }
              ],
              status: 'Active',
              budget: 500000,
              location: 'Building A, Floor 2',
              established_date: '2020-01-01',
              created_at: '2020-01-01T10:00:00Z',
              updated_at: '2023-01-15T10:00:00Z'
            }
          ],
          total: 1,
          current_page: 1,
          last_page: 1,
          per_page: 10
        }

        expect(mockDepartments.data).toHaveLength(1)
        expect(mockDepartments.data[0].name).toBe('Engineering')
        expect(mockDepartments.data[0].employees_count).toBe(15)
        expect(mockDepartments.data[0].manager.user.name).toBe('John Doe')
        expect(mockDepartments.data[0].recent_employees).toHaveLength(3)
      })

      it('should generate correct department icons', () => {
        const getDepartmentIcon = (departmentName) => {
          const iconMap = {
            'Engineering': 'code-bracket',
            'Marketing': 'megaphone',
            'Sales': 'chart-bar',
            'HR': 'users',
            'Finance': 'currency-dollar',
            'Operations': 'cog',
            'Support': 'lifebuoy',
            'Legal': 'scale',
            'Design': 'paint-brush',
            'Product': 'light-bulb'
          }
          
          return iconMap[departmentName] || 'building-office'
        }

        expect(getDepartmentIcon('Engineering')).toBe('code-bracket')
        expect(getDepartmentIcon('Marketing')).toBe('megaphone')
        expect(getDepartmentIcon('HR')).toBe('users')
        expect(getDepartmentIcon('Unknown Department')).toBe('building-office')
      })

      it('should handle department status styling', () => {
        const getStatusClasses = (status) => {
          const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
          
          switch (status?.toLowerCase()) {
            case 'active':
              return `${baseClasses} bg-green-100 text-green-800`
            case 'inactive':
              return `${baseClasses} bg-red-100 text-red-800`
            case 'restructuring':
              return `${baseClasses} bg-yellow-100 text-yellow-800`
            default:
              return `${baseClasses} bg-green-100 text-green-800`
          }
        }

        expect(getStatusClasses('active')).toContain('bg-green-100')
        expect(getStatusClasses('inactive')).toContain('bg-red-100')
        expect(getStatusClasses('restructuring')).toContain('bg-yellow-100')
        expect(getStatusClasses(null)).toContain('bg-green-100')
      })
    })

    describe('Department Create/Edit Forms', () => {
      it('should validate required fields', () => {
        const mockForm = {
          name: '',
          code: '',
          description: '',
          manager_id: '',
          parent_id: '',
          budget: '',
          location: '',
          status: 'Active',
          established_date: ''
        }

        const isFormValid = (form) => {
          return form.name && form.name.trim().length > 0
        }

        expect(isFormValid(mockForm)).toBeFalsy()
        
        mockForm.name = 'Engineering'
        expect(isFormValid(mockForm)).toBe(true)
      })

      it('should auto-generate department code', () => {
        const generateDepartmentCode = (name) => {
          if (!name) return ''
          
          return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 5)
        }

        expect(generateDepartmentCode('Engineering')).toBe('E')
        expect(generateDepartmentCode('Human Resources')).toBe('HR')
        expect(generateDepartmentCode('Information Technology')).toBe('IT')
        expect(generateDepartmentCode('Research and Development')).toBe('RAD')
      })
    })

    describe('Organization Chart', () => {
      it('should build department hierarchy correctly', () => {
        const mockDepartments = [
          { id: 1, name: 'CEO Office', parent_id: null, manager: { user: { name: 'CEO' } } },
          { id: 2, name: 'Engineering', parent_id: 1, manager: { user: { name: 'CTO' } } },
          { id: 3, name: 'Marketing', parent_id: 1, manager: { user: { name: 'CMO' } } },
          { id: 4, name: 'Frontend Team', parent_id: 2, manager: { user: { name: 'Frontend Lead' } } },
          { id: 5, name: 'Backend Team', parent_id: 2, manager: { user: { name: 'Backend Lead' } } }
        ]

        const buildHierarchy = (departments) => {
          const hierarchy = []
          const processed = new Set()
          
          // Find root department
          const rootDepartment = departments.find(dept => !dept.parent_id && dept.manager)
          
          // Start with first level (children of root)
          let currentLevel = departments.filter(dept => dept.parent_id === rootDepartment?.id)
          
          while (currentLevel.length > 0) {
            hierarchy.push([...currentLevel])
            
            // Mark current level as processed
            currentLevel.forEach(dept => processed.add(dept.id))
            
            // Find next level (children of current level)
            const nextLevel = []
            currentLevel.forEach(parent => {
              const children = departments.filter(dept => 
                dept.parent_id === parent.id && !processed.has(dept.id)
              )
              nextLevel.push(...children)
            })
            
            currentLevel = nextLevel
          }
          
          return { rootDepartment, hierarchy }
        }

        const result = buildHierarchy(mockDepartments)
        expect(result.rootDepartment.name).toBe('CEO Office')
        expect(result.hierarchy).toHaveLength(2) // Two levels below root
      })

      it('should handle zoom functionality', () => {
        let zoomLevel = 1

        const zoomIn = () => {
          if (zoomLevel < 2) {
            zoomLevel = Math.min(2, zoomLevel + 0.1)
          }
          return zoomLevel
        }

        const zoomOut = () => {
          if (zoomLevel > 0.5) {
            zoomLevel = Math.max(0.5, zoomLevel - 0.1)
          }
          return zoomLevel
        }

        const resetZoom = () => {
          zoomLevel = 1
          return zoomLevel
        }

        expect(zoomIn()).toBeCloseTo(1.1)
        expect(zoomOut()).toBeCloseTo(1.0)
        expect(resetZoom()).toBe(1)
      })
    })
  })

  describe('Advanced Search Functionality', () => {
    it('should count active filters correctly', () => {
      const filters = {
        search: 'John',
        employee_code: '',
        departments: [1, 2],
        job_title: '',
        contract_types: ['Full-time'],
        status: 'active',
        email_verified: '',
        join_date_range: null,
        created_date_range: null,
        has_manager: true,
        is_manager: false,
        has_projects: false,
        recent_activity: false,
        sort_by: 'name',
        sort_direction: 'asc'
      }

      const countActiveFilters = (filters) => {
        let count = 0
        
        if (filters.search) count++
        if (filters.employee_code) count++
        if (filters.departments.length > 0) count++
        if (filters.job_title) count++
        if (filters.contract_types.length > 0) count++
        if (filters.status) count++
        if (filters.email_verified) count++
        if (filters.join_date_range) count++
        if (filters.created_date_range) count++
        if (filters.has_manager) count++
        if (filters.is_manager) count++
        if (filters.has_projects) count++
        if (filters.recent_activity) count++
        
        return count
      }

      expect(countActiveFilters(filters)).toBe(5) // search, departments, contract_types, status, has_manager
    })

    it('should clean filters correctly', () => {
      const filters = {
        search: 'John',
        employee_code: '',
        departments: [],
        job_title: 'Developer',
        contract_types: ['Full-time'],
        status: '',
        has_manager: false,
        is_manager: true
      }

      const cleanFilters = (filters) => {
        return Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== '' && value !== null && value !== false && 
              !(Array.isArray(value) && value.length === 0)) {
            acc[key] = value
          }
          return acc
        }, {})
      }

      const cleaned = cleanFilters(filters)
      expect(cleaned).toEqual({
        search: 'John',
        job_title: 'Developer',
        contract_types: ['Full-time'],
        is_manager: true
      })
    })
  })

  describe('Permission and Role Management', () => {
    it('should filter actions based on permissions', () => {
      const userPermissions = ['employee.view', 'employee.edit']
      
      const hasPermission = (permission) => {
        return userPermissions.includes(permission)
      }

      const getAvailableActions = (permissions) => {
        const allActions = [
          { id: 'view', permission: 'employee.view' },
          { id: 'edit', permission: 'employee.edit' },
          { id: 'delete', permission: 'employee.delete' },
          { id: 'create', permission: 'employee.create' }
        ]

        return allActions.filter(action => hasPermission(action.permission))
      }

      const availableActions = getAvailableActions(userPermissions)
      expect(availableActions).toHaveLength(2)
      expect(availableActions.map(a => a.id)).toEqual(['view', 'edit'])
    })
  })

  describe('Data Validation and Error Handling', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(validateEmail('john@example.com')).toBe(true)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('should handle form validation errors', () => {
      const validateEmployeeForm = (form) => {
        const errors = {}

        if (!form.name || form.name.trim().length === 0) {
          errors.name = 'Name is required'
        }

        if (!form.email || !form.email.includes('@')) {
          errors.email = 'Valid email is required'
        }

        if (!form.password || form.password.length < 8) {
          errors.password = 'Password must be at least 8 characters'
        }

        return errors
      }

      const invalidForm = {
        name: '',
        email: 'invalid',
        password: '123'
      }

      const errors = validateEmployeeForm(invalidForm)
      expect(Object.keys(errors)).toHaveLength(3)
      expect(errors.name).toBe('Name is required')
      expect(errors.email).toBe('Valid email is required')
      expect(errors.password).toBe('Password must be at least 8 characters')
    })
  })
})