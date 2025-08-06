import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ProgressIndicator from '@/Components/Forms/ProgressIndicator.vue';

describe('ProgressIndicator', () => {
  let wrapper;
  
  const defaultSteps = [
    { id: 'step1', title: 'Step 1', description: 'First step' },
    { id: 'step2', title: 'Step 2', description: 'Second step' },
    { id: 'step3', title: 'Step 3', description: 'Third step' }
  ];

  const defaultProps = {
    steps: defaultSteps,
    currentStep: 1
  };

  beforeEach(() => {
    wrapper = mount(ProgressIndicator, {
      props: defaultProps
    });
  });

  describe('Steps Variant', () => {
    it('renders all steps', () => {
      const steps = wrapper.findAll('.progress-step');
      expect(steps).toHaveLength(3);
    });

    it('shows step titles', () => {
      expect(wrapper.text()).toContain('Step 1');
      expect(wrapper.text()).toContain('Step 2');
      expect(wrapper.text()).toContain('Step 3');
    });

    it('shows step descriptions when enabled', async () => {
      await wrapper.setProps({ showDescriptions: true });
      expect(wrapper.text()).toContain('First step');
      expect(wrapper.text()).toContain('Second step');
      expect(wrapper.text()).toContain('Third step');
    });

    it('hides step labels when showLabels is false', async () => {
      await wrapper.setProps({ showLabels: false });
      expect(wrapper.find('.step-label').exists()).toBe(false);
    });

    it('shows step numbers', () => {
      const stepNumbers = wrapper.findAll('.step-number');
      expect(stepNumbers[0].text()).toBe('1');
      expect(stepNumbers[1].text()).toBe('2');
      expect(stepNumbers[2].text()).toBe('3');
    });

    it('shows checkmark for completed steps', () => {
      const completedSteps = wrapper.findAll('.progress-step--completed');
      expect(completedSteps).toHaveLength(1); // Step 0 is completed when currentStep is 1
      
      const checkIcon = wrapper.find('.step-check');
      expect(checkIcon.exists()).toBe(true);
    });

    it('highlights current step', () => {
      const currentSteps = wrapper.findAll('.progress-step--current');
      expect(currentSteps).toHaveLength(1);
    });

    it('marks future steps appropriately', () => {
      const futureSteps = wrapper.findAll('.progress-step--future');
      expect(futureSteps).toHaveLength(1); // Step 2 is future when currentStep is 1
    });
  });

  describe('Bar Variant', () => {
    beforeEach(() => {
      wrapper = mount(ProgressIndicator, {
        props: {
          ...defaultProps,
          variant: 'bar'
        }
      });
    });

    it('renders progress bar', () => {
      expect(wrapper.find('.progress-bar').exists()).toBe(true);
    });

    it('shows correct progress percentage', () => {
      const progressFill = wrapper.find('.progress-fill');
      expect(progressFill.attributes('style')).toContain('width: 66.67%'); // (1+1)/3 * 100
    });

    it('shows progress text', () => {
      expect(wrapper.text()).toContain('2 of 3');
    });

    it('shows percentage when enabled', async () => {
      await wrapper.setProps({ showPercentage: true });
      expect(wrapper.text()).toContain('(67%)');
    });
  });

  describe('Breadcrumb Variant', () => {
    beforeEach(() => {
      wrapper = mount(ProgressIndicator, {
        props: {
          ...defaultProps,
          variant: 'breadcrumb'
        }
      });
    });

    it('renders breadcrumb navigation', () => {
      expect(wrapper.find('.progress-breadcrumb').exists()).toBe(true);
    });

    it('shows breadcrumb items', () => {
      const breadcrumbItems = wrapper.findAll('.breadcrumb-item');
      expect(breadcrumbItems).toHaveLength(3);
    });

    it('shows separators between items', () => {
      const separators = wrapper.findAll('.breadcrumb-separator');
      expect(separators).toHaveLength(2); // n-1 separators for n items
    });

    it('highlights current breadcrumb item', () => {
      const currentItems = wrapper.findAll('.breadcrumb-item--current');
      expect(currentItems).toHaveLength(1);
    });
  });

  describe('Click Navigation', () => {
    beforeEach(() => {
      wrapper = mount(ProgressIndicator, {
        props: {
          ...defaultProps,
          allowClickNavigation: true
        }
      });
    });

    it('makes clickable steps cursor pointer', () => {
      const clickableSteps = wrapper.findAll('.progress-step--clickable');
      expect(clickableSteps.length).toBeGreaterThan(0);
    });

    it('emits step-click event when step is clicked', async () => {
      const firstStep = wrapper.findAll('.progress-step')[0];
      await firstStep.trigger('click');
      
      expect(wrapper.emitted('step-click')).toBeTruthy();
      expect(wrapper.emitted('step-click')[0][0]).toEqual({
        step: defaultSteps[0],
        index: 0,
        stepId: 'step1'
      });
    });

    it('prevents clicking on future steps', async () => {
      const futureStep = wrapper.findAll('.progress-step')[2]; // Step 3 is future
      await futureStep.trigger('click');
      
      expect(wrapper.emitted('step-click')).toBeFalsy();
    });

    it('allows clicking on completed and current steps', async () => {
      // Click on completed step (step 0)
      const completedStep = wrapper.findAll('.progress-step')[0];
      await completedStep.trigger('click');
      expect(wrapper.emitted('step-click')).toBeTruthy();

      // Click on current step (step 1)
      const currentStep = wrapper.findAll('.progress-step')[1];
      await currentStep.trigger('click');
      expect(wrapper.emitted('step-click')).toBeTruthy();
    });

    it('prevents clicking on disabled steps', async () => {
      await wrapper.setProps({
        steps: [
          ...defaultSteps.slice(0, 1),
          { ...defaultSteps[1], disabled: true },
          ...defaultSteps.slice(2)
        ]
      });

      const disabledStep = wrapper.findAll('.progress-step')[1];
      await disabledStep.trigger('click');
      
      expect(wrapper.emitted('step-click')).toBeFalsy();
    });
  });

  describe('Size Variants', () => {
    it('applies small size classes', async () => {
      await wrapper.setProps({ size: 'sm' });
      expect(wrapper.find('.progress-indicator--sm').exists()).toBe(true);
    });

    it('applies large size classes', async () => {
      await wrapper.setProps({ size: 'lg' });
      expect(wrapper.find('.progress-indicator--lg').exists()).toBe(true);
    });
  });

  describe('Orientation', () => {
    it('applies horizontal orientation by default', () => {
      expect(wrapper.find('.progress-indicator--horizontal').exists()).toBe(true);
    });

    it('applies vertical orientation when specified', async () => {
      await wrapper.setProps({ orientation: 'vertical' });
      expect(wrapper.find('.progress-indicator--vertical').exists()).toBe(true);
    });
  });

  describe('Progress Calculation', () => {
    it('calculates correct progress percentage', async () => {
      // Test different current steps
      await wrapper.setProps({ currentStep: 0 });
      expect(wrapper.vm.progressPercentage).toBe(33.33333333333333); // (0+1)/3 * 100

      await wrapper.setProps({ currentStep: 1 });
      expect(wrapper.vm.progressPercentage).toBe(66.66666666666666); // (1+1)/3 * 100

      await wrapper.setProps({ currentStep: 2 });
      expect(wrapper.vm.progressPercentage).toBe(100); // (2+1)/3 * 100
    });

    it('handles empty steps array', async () => {
      await wrapper.setProps({ steps: [] });
      expect(wrapper.vm.progressPercentage).toBe(0);
    });
  });

  describe('Step State Detection', () => {
    it('correctly identifies completed steps', () => {
      expect(wrapper.vm.isStepCompleted(0)).toBe(true);
      expect(wrapper.vm.isStepCompleted(1)).toBe(false);
      expect(wrapper.vm.isStepCompleted(2)).toBe(false);
    });

    it('correctly identifies current step', () => {
      expect(wrapper.vm.isStepCurrent(0)).toBe(false);
      expect(wrapper.vm.isStepCurrent(1)).toBe(true);
      expect(wrapper.vm.isStepCurrent(2)).toBe(false);
    });

    it('correctly identifies clickable steps', async () => {
      await wrapper.setProps({ allowClickNavigation: true });
      
      expect(wrapper.vm.isStepClickable(0)).toBe(true); // Completed step
      expect(wrapper.vm.isStepClickable(1)).toBe(true); // Current step
      expect(wrapper.vm.isStepClickable(2)).toBe(false); // Future step
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for breadcrumb variant', async () => {
      await wrapper.setProps({ variant: 'breadcrumb' });
      const nav = wrapper.find('.progress-breadcrumb');
      expect(nav.attributes('aria-label')).toBe('Registration progress');
    });

    it('uses proper semantic markup', () => {
      // Steps should be in a logical structure
      expect(wrapper.find('.progress-steps').exists()).toBe(true);
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.progress-indicator').exists()).toBe(true);
    });
  });

  describe('Custom Classes', () => {
    it('applies custom classes', async () => {
      await wrapper.setProps({ class: 'custom-progress' });
      expect(wrapper.find('.custom-progress').exists()).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles single step', async () => {
      await wrapper.setProps({ 
        steps: [{ id: 'only', title: 'Only Step' }],
        currentStep: 0
      });
      
      expect(wrapper.vm.progressPercentage).toBe(100);
      expect(wrapper.findAll('.progress-step')).toHaveLength(1);
    });

    it('handles currentStep beyond steps length', async () => {
      await wrapper.setProps({ currentStep: 10 });
      
      // Should not break, all steps should be completed
      const completedSteps = wrapper.findAll('.progress-step--completed');
      expect(completedSteps).toHaveLength(3);
    });

    it('handles negative currentStep', async () => {
      await wrapper.setProps({ currentStep: -1 });
      
      // Should treat as 0 or handle gracefully
      expect(wrapper.vm.progressPercentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Step Connectors', () => {
    it('shows connectors between steps in horizontal layout', () => {
      const connectors = wrapper.findAll('.step-connector');
      expect(connectors).toHaveLength(2); // n-1 connectors for n steps
    });

    it('applies correct connector states', () => {
      const completedConnectors = wrapper.findAll('.step-connector--completed');
      const futureConnectors = wrapper.findAll('.step-connector--future');
      
      expect(completedConnectors.length + futureConnectors.length).toBe(2);
    });
  });
});