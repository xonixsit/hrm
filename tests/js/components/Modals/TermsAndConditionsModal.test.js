import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import TermsAndConditionsModal from '@/Components/Modals/TermsAndConditionsModal.vue';
import BaseButton from '@/Components/Base/BaseButton.vue';

// Mock BaseButton component
vi.mock('@/Components/Base/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    template: '<button :disabled="disabled"><slot /></button>',
    props: ['variant', 'disabled', 'loading']
  }
}));

// Mock Teleport
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return {
    ...actual,
    Teleport: {
      name: 'Teleport',
      template: '<div><slot /></div>',
      props: ['to']
    }
  };
});

describe('TermsAndConditionsModal', () => {
  let wrapper;
  
  const defaultTermsSections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: '<p>By using our services, you agree to these terms.</p>'
    },
    {
      id: 'usage',
      title: '2. Usage Guidelines',
      items: [
        'Use the service responsibly',
        'Do not violate any laws',
        'Respect other users'
      ]
    }
  ];

  const defaultProps = {
    isOpen: true,
    termsSections: defaultTermsSections
  };

  beforeEach(() => {
    // Mock document.body.style
    Object.defineProperty(document.body, 'style', {
      value: { overflow: '' },
      writable: true
    });
    
    wrapper = mount(TermsAndConditionsModal, {
      props: defaultProps,
      attachTo: document.body
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Modal Visibility', () => {
    it('renders when isOpen is true', () => {
      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    });

    it('does not render when isOpen is false', async () => {
      await wrapper.setProps({ isOpen: false });
      expect(wrapper.find('.modal-overlay').exists()).toBe(false);
    });

    it('sets body overflow to hidden when opened', () => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('resets body overflow when closed', async () => {
      await wrapper.setProps({ isOpen: false });
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Modal Content', () => {
    it('renders modal title', () => {
      expect(wrapper.find('.modal-title').text()).toBe('Terms and Conditions');
    });

    it('renders custom title', async () => {
      await wrapper.setProps({ title: 'Custom Terms' });
      expect(wrapper.find('.modal-title').text()).toBe('Custom Terms');
    });

    it('renders subtitle when provided', async () => {
      await wrapper.setProps({ subtitle: 'Please read carefully' });
      expect(wrapper.find('.modal-subtitle').text()).toBe('Please read carefully');
    });

    it('renders terms sections', () => {
      expect(wrapper.text()).toContain('1. Acceptance of Terms');
      expect(wrapper.text()).toContain('2. Usage Guidelines');
    });

    it('renders HTML content in sections', () => {
      const htmlContent = wrapper.find('.prose');
      expect(htmlContent.exists()).toBe(true);
    });

    it('renders list items for sections with items', () => {
      const listItems = wrapper.findAll('.terms-list-item');
      expect(listItems).toHaveLength(3);
      expect(listItems[0].text()).toBe('Use the service responsibly');
    });

    it('renders last updated date when provided', async () => {
      const lastUpdated = new Date('2024-01-01');
      await wrapper.setProps({ lastUpdated });
      expect(wrapper.text()).toContain('Last updated: January 1, 2024');
    });

    it('renders contact information when provided', async () => {
      const contactInfo = {
        email: 'legal@company.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business St'
      };
      await wrapper.setProps({ contactInfo });
      
      expect(wrapper.text()).toContain('Contact Information');
      expect(wrapper.text()).toContain('legal@company.com');
      expect(wrapper.text()).toContain('+1 (555) 123-4567');
      expect(wrapper.text()).toContain('123 Business St');
    });
  });

  describe('Agreement Functionality', () => {
    it('shows agreement checkbox when requiresAgreement is true', () => {
      expect(wrapper.find('.agreement-checkbox').exists()).toBe(true);
    });

    it('hides agreement checkbox when requiresAgreement is false', async () => {
      await wrapper.setProps({ requiresAgreement: false });
      expect(wrapper.find('.agreement-checkbox').exists()).toBe(false);
    });

    it('shows custom agreement text', async () => {
      await wrapper.setProps({ agreementText: 'I agree to custom terms' });
      expect(wrapper.text()).toContain('I agree to custom terms');
    });

    it('disables accept button when not agreed', () => {
      const acceptButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Accept')
      );
      expect(acceptButton.props('disabled')).toBe(true);
    });

    it('enables accept button when agreed', async () => {
      const checkbox = wrapper.find('.agreement-checkbox');
      await checkbox.setChecked(true);
      
      const acceptButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Accept')
      );
      expect(acceptButton.props('disabled')).toBe(false);
    });
  });

  describe('Button Actions', () => {
    it('shows accept and cancel buttons by default', () => {
      const buttons = wrapper.findAllComponents(BaseButton);
      const buttonTexts = buttons.map(btn => btn.text());
      
      expect(buttonTexts).toContain('Accept and Continue');
      expect(buttonTexts).toContain('Cancel');
    });

    it('shows close button when requiresAgreement is false', async () => {
      await wrapper.setProps({ requiresAgreement: false });
      const buttons = wrapper.findAllComponents(BaseButton);
      const buttonTexts = buttons.map(btn => btn.text());
      
      expect(buttonTexts).toContain('Close');
    });

    it('uses custom button text', async () => {
      await wrapper.setProps({
        acceptButtonText: 'I Agree',
        cancelButtonText: 'Go Back',
        closeButtonText: 'Done'
      });
      
      expect(wrapper.text()).toContain('I Agree');
      expect(wrapper.text()).toContain('Go Back');
    });

    it('emits close event when cancel button is clicked', async () => {
      const cancelButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Cancel')
      );
      
      await cancelButton.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits accept event when accept button is clicked', async () => {
      const checkbox = wrapper.find('.agreement-checkbox');
      await checkbox.setChecked(true);
      
      const acceptButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Accept')
      );
      
      await acceptButton.trigger('click');
      expect(wrapper.emitted('accept')).toBeTruthy();
    });

    it('emits close event when close button is clicked (no agreement)', async () => {
      await wrapper.setProps({ requiresAgreement: false });
      
      const closeButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Close')
      );
      
      await closeButton.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('Close Functionality', () => {
    it('emits close event when X button is clicked', async () => {
      const closeButton = wrapper.find('.close-button');
      await closeButton.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits close event when overlay is clicked and closeOnOverlayClick is true', async () => {
      await wrapper.setProps({ closeOnOverlayClick: true });
      const overlay = wrapper.find('.modal-overlay');
      await overlay.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not emit close event when overlay is clicked and closeOnOverlayClick is false', async () => {
      await wrapper.setProps({ closeOnOverlayClick: false });
      const overlay = wrapper.find('.modal-overlay');
      await overlay.trigger('click');
      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('does not close when clicking inside modal container', async () => {
      const container = wrapper.find('.modal-container');
      await container.trigger('click');
      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Mock addEventListener and removeEventListener
      vi.spyOn(document, 'addEventListener');
      vi.spyOn(document, 'removeEventListener');
    });

    it('adds keyboard event listeners on mount', () => {
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('removes keyboard event listeners on unmount', () => {
      wrapper.unmount();
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('closes modal on Escape key when closeOnEscape is true', async () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('does not close modal on Escape key when closeOnEscape is false', async () => {
      await wrapper.setProps({ closeOnEscape: false });
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted('close')).toBeFalsy();
    });
  });

  describe('Processing State', () => {
    it('disables buttons when processing', async () => {
      await wrapper.setProps({ isProcessing: true });
      
      const buttons = wrapper.findAllComponents(BaseButton);
      buttons.forEach(button => {
        expect(button.props('disabled')).toBe(true);
      });
    });

    it('disables checkbox when processing', async () => {
      await wrapper.setProps({ isProcessing: true });
      
      const checkbox = wrapper.find('.agreement-checkbox');
      expect(checkbox.attributes('disabled')).toBeDefined();
    });

    it('shows loading state on accept button when processing', async () => {
      await wrapper.setProps({ isProcessing: true });
      
      const acceptButton = wrapper.findAllComponents(BaseButton).find(btn => 
        btn.text().includes('Accept')
      );
      expect(acceptButton.props('loading')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const overlay = wrapper.find('.modal-overlay');
      expect(overlay.attributes('role')).toBe('dialog');
      expect(overlay.attributes('aria-modal')).toBe('true');
      expect(overlay.attributes('aria-labelledby')).toBeDefined();
      expect(overlay.attributes('aria-describedby')).toBeDefined();
    });

    it('has proper close button label', () => {
      const closeButton = wrapper.find('.close-button');
      expect(closeButton.attributes('aria-label')).toBe('Close modal');
    });

    it('focuses modal on open', async () => {
      const focusSpy = vi.spyOn(wrapper.vm, 'focusModal');
      await wrapper.setProps({ isOpen: false });
      await wrapper.setProps({ isOpen: true });
      
      await wrapper.vm.$nextTick();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('Date Formatting', () => {
    it('formats string dates correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-01-01');
      expect(formatted).toBe('January 1, 2024');
    });

    it('formats Date objects correctly', () => {
      const date = new Date('2024-01-01');
      const formatted = wrapper.vm.formatDate(date);
      expect(formatted).toBe('January 1, 2024');
    });

    it('handles null dates', () => {
      const formatted = wrapper.vm.formatDate(null);
      expect(formatted).toBe('');
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.modal-container').exists()).toBe(true);
    });
  });

  describe('Scrolling', () => {
    it('has scrollable content area', () => {
      const content = wrapper.find('.modal-content');
      expect(content.classes()).toContain('overflow-y-auto');
    });
  });

  describe('Email Links', () => {
    it('creates mailto links for email addresses', async () => {
      const contactInfo = { email: 'legal@company.com' };
      await wrapper.setProps({ contactInfo });
      
      const emailLink = wrapper.find('a[href="mailto:legal@company.com"]');
      expect(emailLink.exists()).toBe(true);
    });
  });
});