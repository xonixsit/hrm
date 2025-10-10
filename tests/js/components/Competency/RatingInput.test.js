import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RatingInput from '@/Components/Competency/RatingInput.vue';

describe('RatingInput', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(RatingInput);
      
      expect(wrapper.find('.rating-input-wrapper').exists()).toBe(true);
      expect(wrapper.find('.rating-scale').exists()).toBe(true);
      expect(wrapper.findAll('.rating-option')).toHaveLength(5); // Default 5-point scale
    });

    it('renders with label', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          label: 'Rate Performance'
        }
      });
      
      const label = wrapper.find('label');
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain('Rate Performance');
    });

    it('shows required asterisk when required', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          label: 'Required Rating',
          required: true
        }
      });
      
      expect(wrapper.find('label').text()).toContain('*');
    });

    it('renders rating guidelines when provided', () => {
      const guidelines = {
        1: { label: 'Poor', description: 'Below expectations' },
        2: { label: 'Fair', description: 'Needs improvement' },
        3: { label: 'Good', description: 'Meets expectations' },
        4: { label: 'Very Good', description: 'Exceeds expectations' },
        5: { label: 'Excellent', description: 'Outstanding performance' }
      };

      const wrapper = mount(RatingInput, {
        props: { 
          guidelines,
          showGuidelines: true
        }
      });
      
      expect(wrapper.find('.rating-guidelines').exists()).toBe(true);
      expect(wrapper.text()).toContain('Rating Guidelines');
      expect(wrapper.text()).toContain('Poor');
      expect(wrapper.text()).toContain('Excellent');
    });
  });

  describe('Rating Scale', () => {
    it('renders 5 rating options by default', () => {
      const wrapper = mount(RatingInput);
      
      const options = wrapper.findAll('.rating-option');
      expect(options).toHaveLength(5);
      
      const inputs = wrapper.findAll('input[type="radio"]');
      expect(inputs).toHaveLength(5);
    });

    it('displays correct rating labels', () => {
      const wrapper = mount(RatingInput);
      
      expect(wrapper.text()).toContain('Poor');
      expect(wrapper.text()).toContain('Needs Improvement');
      expect(wrapper.text()).toContain('Meets Expectations');
      expect(wrapper.text()).toContain('Exceeds Expectations');
      expect(wrapper.text()).toContain('Outstanding');
    });

    it('renders stars by default', () => {
      const wrapper = mount(RatingInput, {
        props: { displayType: 'stars' }
      });
      
      const stars = wrapper.findAll('.rating-icon');
      expect(stars).toHaveLength(5);
    });

    it('renders numbers when displayType is numbers', () => {
      const wrapper = mount(RatingInput, {
        props: { displayType: 'numbers' }
      });
      
      const numbers = wrapper.findAll('.rating-number');
      expect(numbers).toHaveLength(5);
      
      expect(wrapper.text()).toContain('1');
      expect(wrapper.text()).toContain('2');
      expect(wrapper.text()).toContain('3');
      expect(wrapper.text()).toContain('4');
      expect(wrapper.text()).toContain('5');
    });
  });

  describe('Rating Selection', () => {
    it('shows selected rating correctly', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 3
        }
      });
      
      const selectedOption = wrapper.find('.rating-option--selected');
      expect(selectedOption.exists()).toBe(true);
      
      const selectedInput = wrapper.find('input[value="3"]');
      expect(selectedInput.element.checked).toBe(true);
    });

    it('emits update:modelValue when rating is selected', async () => {
      const wrapper = mount(RatingInput);
      
      const ratingInput = wrapper.find('input[value="4"]');
      await ratingInput.setChecked(true);
      
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([4]);
      expect(wrapper.emitted('change')).toHaveLength(1);
    });

    it('shows selected rating display when enabled', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 4,
          showSelectedRating: true
        }
      });
      
      const selectedDisplay = wrapper.find('.selected-rating-display');
      expect(selectedDisplay.exists()).toBe(true);
      expect(selectedDisplay.text()).toContain('Selected: 4 - Exceeds Expectations');
    });
  });

  describe('Comments Requirement', () => {
    it('shows comments notice for low ratings', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 2,
          requireCommentsForExtremes: true
        }
      });
      
      const commentsNotice = wrapper.find('.comments-notice');
      expect(commentsNotice.exists()).toBe(true);
      expect(commentsNotice.text()).toContain('Comments Required');
      expect(commentsNotice.text()).toContain('areas for improvement');
    });

    it('shows comments notice for high ratings', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 5,
          requireCommentsForExtremes: true
        }
      });
      
      const commentsNotice = wrapper.find('.comments-notice');
      expect(commentsNotice.exists()).toBe(true);
      expect(commentsNotice.text()).toContain('Comments Required');
      expect(commentsNotice.text()).toContain('exceptional performance');
    });

    it('does not show comments notice for middle ratings', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 3,
          requireCommentsForExtremes: true
        }
      });
      
      const commentsNotice = wrapper.find('.comments-notice');
      expect(commentsNotice.exists()).toBe(false);
    });

    it('exposes requiresComments computed property', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 1,
          requireCommentsForExtremes: true
        }
      });
      
      expect(wrapper.vm.requiresComments).toBe(true);
    });
  });

  describe('Sizes and Variants', () => {
    it('applies size classes correctly', () => {
      const wrapper = mount(RatingInput, {
        props: { size: 'lg' }
      });
      
      expect(wrapper.classes()).toContain('rating-input--lg');
    });

    it('applies orientation classes correctly', () => {
      const wrapper = mount(RatingInput, {
        props: { orientation: 'vertical' }
      });
      
      expect(wrapper.classes()).toContain('rating-input--vertical');
      expect(wrapper.find('.rating-scale--vertical').exists()).toBe(true);
    });
  });

  describe('States', () => {
    it('applies disabled state correctly', () => {
      const wrapper = mount(RatingInput, {
        props: { disabled: true }
      });
      
      expect(wrapper.classes()).toContain('rating-input--disabled');
      
      const inputs = wrapper.findAll('input');
      inputs.forEach(input => {
        expect(input.attributes('disabled')).toBeDefined();
      });
    });

    it('shows error message', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          errorMessage: 'Please select a rating'
        }
      });
      
      const errorElement = wrapper.find('[role="alert"]');
      expect(errorElement.exists()).toBe(true);
      expect(errorElement.text()).toBe('Please select a rating');
      expect(wrapper.classes()).toContain('rating-input--error');
    });

    it('shows help text', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          helpText: 'Select a rating from 1 to 5'
        }
      });
      
      expect(wrapper.text()).toContain('Select a rating from 1 to 5');
    });
  });

  describe('Custom Rating Options', () => {
    it('uses custom rating options when provided', () => {
      const customOptions = [
        { value: 1, label: 'Terrible' },
        { value: 2, label: 'Bad' },
        { value: 3, label: 'Okay' }
      ];

      const wrapper = mount(RatingInput, {
        props: { 
          customRatingOptions: customOptions
        }
      });
      
      expect(wrapper.findAll('.rating-option')).toHaveLength(3);
      expect(wrapper.text()).toContain('Terrible');
      expect(wrapper.text()).toContain('Bad');
      expect(wrapper.text()).toContain('Okay');
    });
  });

  describe('Event Handling', () => {
    it('emits hover events', async () => {
      const wrapper = mount(RatingInput);
      
      const ratingButton = wrapper.find('.rating-button');
      await ratingButton.trigger('mouseenter');
      
      expect(wrapper.emitted('hover')).toHaveLength(1);
      expect(wrapper.emitted('hover')[0]).toEqual([1]);
    });

    it('emits focus and blur events', async () => {
      const wrapper = mount(RatingInput);
      
      const input = wrapper.find('input');
      await input.trigger('focus');
      await input.trigger('blur');
      
      expect(wrapper.emitted('focus')).toHaveLength(1);
      expect(wrapper.emitted('blur')).toHaveLength(1);
    });

    it('does not emit events when disabled', async () => {
      const wrapper = mount(RatingInput, {
        props: { disabled: true }
      });
      
      const input = wrapper.find('input');
      await input.trigger('change');
      
      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('generates unique IDs for inputs', () => {
      const wrapper1 = mount(RatingInput);
      const wrapper2 = mount(RatingInput);
      
      const id1 = wrapper1.find('input').attributes('id');
      const id2 = wrapper2.find('input').attributes('id');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('has proper ARIA attributes', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          errorMessage: 'Error message',
          required: true
        }
      });
      
      const input = wrapper.find('input');
      expect(input.attributes('aria-invalid')).toBe('true');
      expect(input.attributes('aria-required')).toBe('true');
      expect(input.attributes('aria-describedby')).toBeDefined();
    });

    it('associates error message with input', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          errorMessage: 'Error message'
        }
      });
      
      const input = wrapper.find('input');
      const errorElement = wrapper.find('[role="alert"]');
      
      expect(input.attributes('aria-describedby')).toContain(errorElement.attributes('id'));
    });
  });

  describe('Public Methods', () => {
    it('exposes focus method', () => {
      const wrapper = mount(RatingInput);
      
      expect(wrapper.vm.focus).toBeDefined();
      expect(typeof wrapper.vm.focus).toBe('function');
    });

    it('exposes blur method', () => {
      const wrapper = mount(RatingInput);
      
      expect(wrapper.vm.blur).toBeDefined();
      expect(typeof wrapper.vm.blur).toBe('function');
    });

    it('exposes requiresComments property', () => {
      const wrapper = mount(RatingInput, {
        props: { 
          modelValue: 1,
          requireCommentsForExtremes: true
        }
      });
      
      expect(wrapper.vm.requiresComments).toBe(true);
    });
  });
});