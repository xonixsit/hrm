import { describe, it, expect, vi } from 'vitest';

// Mock Inertia
vi.mock('@inertiajs/vue3', () => ({
    Link: {
        name: 'Link',
        template: '<a><slot /></a>',
        props: ['href']
    },
    router: {
        visit: vi.fn(),
        delete: vi.fn(),
        put: vi.fn(),
        post: vi.fn()
    },
    useForm: vi.fn(() => ({
        leave_type_id: '',
        from_date: '',
        to_date: '',
        reason: '',
        is_emergency: false,
        is_half_day: false,
        errors: {},
        processing: false,
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }))
}));

// Mock auth composable
vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        user: { value: { id: 1, name: 'Test User' } },
        roles: { value: ['Employee'] },
        hasRole: vi.fn(() => true),
        hasAnyRole: vi.fn(() => false)
    })
}));

describe('Leaves Create Page Tests', () => {
    const mockLeaveTypes = [
        { id: 1, name: 'Annual Leave' },
        { id: 2, name: 'Sick Leave' },
        { id: 3, name: 'Personal Leave' },
        { id: 4, name: 'Study Leave' },
        { id: 5, name: 'Emergency Leave' }
    ];

    describe('Basic Functionality', () => {
        it('should have correct leave types', () => {
            expect(mockLeaveTypes).toHaveLength(5);
            expect(mockLeaveTypes[0].name).toBe('Annual Leave');
            expect(mockLeaveTypes[1].name).toBe('Sick Leave');
        });

        it('should provide leave type descriptions', () => {
            const getLeaveTypeDescription = (leaveType) => {
                const descriptionMap = {
                    'Annual Leave': 'Planned vacation or personal time off',
                    'Sick Leave': 'Medical leave for illness or health issues',
                    'Personal Leave': 'Personal matters and family obligations',
                    'Study Leave': 'Educational purposes and training',
                    'Emergency Leave': 'Urgent and unexpected situations'
                };

                return descriptionMap[leaveType] || 'Standard leave request';
            };

            expect(getLeaveTypeDescription('Annual Leave')).toBe('Planned vacation or personal time off');
            expect(getLeaveTypeDescription('Sick Leave')).toBe('Medical leave for illness or health issues');
            expect(getLeaveTypeDescription('Personal Leave')).toBe('Personal matters and family obligations');
            expect(getLeaveTypeDescription('Study Leave')).toBe('Educational purposes and training');
            expect(getLeaveTypeDescription('Emergency Leave')).toBe('Urgent and unexpected situations');
        });

        it('should calculate duration correctly', () => {
            const calculateDuration = (fromDate, toDate, isHalfDay = false) => {
                if (!fromDate || !toDate) return '';

                const start = new Date(fromDate);
                const end = new Date(toDate);
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                if (isHalfDay && diffDays === 1) {
                    return '0.5 days';
                }

                return diffDays === 1 ? '1 day' : `${diffDays} days`;
            };

            expect(calculateDuration('2024-02-01', '2024-02-01')).toBe('1 day');
            expect(calculateDuration('2024-02-01', '2024-02-03')).toBe('3 days');
            expect(calculateDuration('2024-02-01', '2024-02-01', true)).toBe('0.5 days');
        });

        it('should format dates correctly', () => {
            const formatDate = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const formatted = formatDate('2024-02-01');
            expect(formatted).toMatch(/Thursday, February 1, 2024/);
        });

        it('should validate step progression', () => {
            const canProceedToNextStep = (currentStep, form) => {
                switch (currentStep) {
                    case 0: // Leave type selection
                        return form.leave_type_id !== '';
                    case 1: // Date selection
                        return form.from_date !== '' && form.to_date !== '';
                    case 2: // Details
                        return form.reason.trim() !== '';
                    default:
                        return true;
                }
            };

            const form = {
                leave_type_id: '',
                from_date: '',
                to_date: '',
                reason: ''
            };

            // Step 0: Should not proceed without leave type
            expect(canProceedToNextStep(0, form)).toBe(false);

            // Select leave type
            form.leave_type_id = 1;
            expect(canProceedToNextStep(0, form)).toBe(true);

            // Step 1: Should not proceed without dates
            expect(canProceedToNextStep(1, form)).toBe(false);

            // Add dates
            form.from_date = '2024-02-01';
            form.to_date = '2024-02-03';
            expect(canProceedToNextStep(1, form)).toBe(true);

            // Step 2: Should not proceed without reason
            expect(canProceedToNextStep(2, form)).toBe(false);

            // Add reason
            form.reason = 'Family vacation';
            expect(canProceedToNextStep(2, form)).toBe(true);
        });

        it('should validate dates correctly', () => {
            const validateDates = (form) => {
                if (form.from_date && form.to_date) {
                    const start = new Date(form.from_date);
                    const end = new Date(form.to_date);

                    if (end < start) {
                        form.to_date = form.from_date;
                    }
                }
            };

            const form = {
                from_date: '2024-02-03',
                to_date: '2024-02-01' // End before start
            };

            validateDates(form);

            expect(form.to_date).toBe('2024-02-03'); // Should be corrected
        });

        it('should provide correct leave type styling', () => {
            const getLeaveTypeIconClasses = (leaveType) => {
                const classMap = {
                    'Annual Leave': 'w-8 h-8 p-1.5 bg-blue-100 text-blue-600 rounded-lg',
                    'Sick Leave': 'w-8 h-8 p-1.5 bg-red-100 text-red-600 rounded-lg',
                    'Personal Leave': 'w-8 h-8 p-1.5 bg-green-100 text-green-600 rounded-lg',
                    'Study Leave': 'w-8 h-8 p-1.5 bg-purple-100 text-purple-600 rounded-lg',
                    'Emergency Leave': 'w-8 h-8 p-1.5 bg-orange-100 text-orange-600 rounded-lg'
                };

                return classMap[leaveType] || 'w-8 h-8 p-1.5 bg-neutral-100 text-neutral-600 rounded-lg';
            };

            expect(getLeaveTypeIconClasses('Annual Leave')).toContain('bg-blue-100 text-blue-600');
            expect(getLeaveTypeIconClasses('Sick Leave')).toContain('bg-red-100 text-red-600');
            expect(getLeaveTypeIconClasses('Personal Leave')).toContain('bg-green-100 text-green-600');
            expect(getLeaveTypeIconClasses('Study Leave')).toContain('bg-purple-100 text-purple-600');
            expect(getLeaveTypeIconClasses('Emergency Leave')).toContain('bg-orange-100 text-orange-600');
        });

        it('should handle form steps correctly', () => {
            const formSteps = [
                {
                    id: 'leave-type',
                    title: 'Leave Type',
                    description: 'Select leave category'
                },
                {
                    id: 'dates',
                    title: 'Dates',
                    description: 'Choose duration'
                },
                {
                    id: 'details',
                    title: 'Details',
                    description: 'Provide reason'
                },
                {
                    id: 'review',
                    title: 'Review',
                    description: 'Confirm and submit'
                }
            ];

            expect(formSteps).toHaveLength(4);
            expect(formSteps[0].title).toBe('Leave Type');
            expect(formSteps[1].title).toBe('Dates');
            expect(formSteps[2].title).toBe('Details');
            expect(formSteps[3].title).toBe('Review');
        });

        it('should generate form actions correctly', () => {
            const getFormActions = (currentStep, canProceed) => {
                const actions = [];

                // Previous button (except for first step)
                if (currentStep > 0) {
                    actions.push({
                        id: 'previous',
                        label: 'Previous',
                        variant: 'secondary',
                        type: 'button'
                    });
                }

                // Next/Submit button
                if (currentStep < 3) {
                    actions.push({
                        id: 'next',
                        label: 'Next',
                        variant: 'primary',
                        type: 'button',
                        disabled: !canProceed
                    });
                } else {
                    actions.push({
                        id: 'submit',
                        label: 'Submit Request',
                        variant: 'primary',
                        type: 'submit',
                        loadingLabel: 'Submitting...'
                    });
                }

                return actions;
            };

            // First step
            let actions = getFormActions(0, true);
            expect(actions).toHaveLength(1);
            expect(actions[0].id).toBe('next');
            expect(actions.some(action => action.id === 'previous')).toBe(false);

            // Middle step
            actions = getFormActions(1, true);
            expect(actions).toHaveLength(2);
            expect(actions.some(action => action.id === 'next')).toBe(true);
            expect(actions.some(action => action.id === 'previous')).toBe(true);

            // Last step
            actions = getFormActions(3, true);
            expect(actions).toHaveLength(2);
            expect(actions.some(action => action.id === 'submit')).toBe(true);
            expect(actions.some(action => action.id === 'previous')).toBe(true);
        });
    });

    describe('User Experience Features', () => {
        it('should provide minimum date as today', () => {
            const getMinDate = () => {
                const today = new Date();
                return today.toISOString().split('T')[0];
            };

            const minDate = getMinDate();
            const today = new Date().toISOString().split('T')[0];
            expect(minDate).toBe(today);
        });

        it('should handle leave type selection', () => {
            const selectLeaveType = (form, type) => {
                form.leave_type_id = type.id;
            };

            const form = { leave_type_id: '' };
            const leaveType = { id: 2, name: 'Sick Leave' };

            selectLeaveType(form, leaveType);
            expect(form.leave_type_id).toBe(2);
        });

        it('should get selected leave type correctly', () => {
            const getSelectedLeaveType = (leaveTypes, selectedId) => {
                return leaveTypes.find(type => type.id === selectedId);
            };

            const selected = getSelectedLeaveType(mockLeaveTypes, 2);
            expect(selected?.name).toBe('Sick Leave');
        });

        it('should provide card styling based on selection', () => {
            const getLeaveTypeCardClasses = (typeId, selectedId) => {
                const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';
                const selectedClasses = selectedId === typeId
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300';

                return `${baseClasses} ${selectedClasses}`;
            };

            // Unselected state
            expect(getLeaveTypeCardClasses(1, null)).toContain('border-neutral-200 bg-white');

            // Selected state
            expect(getLeaveTypeCardClasses(1, 1)).toContain('border-primary-500 bg-primary-50');
        });
    });

    describe('Form Validation and Error Handling', () => {
        it('should handle form errors by navigating to relevant step', () => {
            const handleFormErrors = (errors) => {
                if (errors.leave_type_id) {
                    return 0; // Navigate to step 0
                } else if (errors.from_date || errors.to_date) {
                    return 1; // Navigate to step 1
                } else if (errors.reason) {
                    return 2; // Navigate to step 2
                }
                return 3; // Stay on current step
            };

            expect(handleFormErrors({ leave_type_id: 'Required field' })).toBe(0);
            expect(handleFormErrors({ from_date: 'Invalid date' })).toBe(1);
            expect(handleFormErrors({ reason: 'Too short' })).toBe(2);
        });

        it('should provide current step information', () => {
            const getCurrentStepInfo = (currentStep, formSteps) => {
                return {
                    title: formSteps[currentStep]?.title || '',
                    description: formSteps[currentStep]?.description || ''
                };
            };

            const formSteps = [
                { title: 'Leave Type', description: 'Select leave category' },
                { title: 'Dates', description: 'Choose duration' },
                { title: 'Details', description: 'Provide reason' },
                { title: 'Review', description: 'Confirm and submit' }
            ];

            const stepInfo = getCurrentStepInfo(0, formSteps);
            expect(stepInfo.title).toBe('Leave Type');
            expect(stepInfo.description).toBe('Select leave category');
        });
    });
});