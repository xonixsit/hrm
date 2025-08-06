import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PageTransition from '@/Components/Transitions/PageTransition.vue';
import ModalTransition from '@/Components/Transitions/ModalTransition.vue';
import DropdownTransition from '@/Components/Transitions/DropdownTransition.vue';
import ScrollReveal from '@/Components/Animations/ScrollReveal.vue';
import StaggerContainer from '@/Components/Animations/StaggerContainer.vue';
import ParallaxContainer from '@/Components/Animations/ParallaxContainer.vue';
import SmoothScroll from '@/Components/Animations/SmoothScroll.vue';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  callback
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = vi.fn(clearTimeout);

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Animation Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('PageTransition Component', () => {
    it('should render with default fade transition', () => {
      const wrapper = mount(PageTransition, {
        slots: {
          default: '<div>Test Content</div>'
        }
      });

      expect(wrapper.find('.fade-enter-active').exists()).toBe(false);
      expect(wrapper.text()).toContain('Test Content');
    });

    it('should apply custom transition name', () => {
      const wrapper = mount(PageTransition, {
        props: {
          name: 'slide-left'
        },
        slots: {
          default: '<div>Test Content</div>'
        }
      });

      const transition = wrapper.findComponent({ name: 'Transition' });
      expect(transition.props('name')).toBe('slide-left');
    });

    it('should disable transitions when reduced motion is preferred', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = mount(PageTransition, {
        props: {
          name: 'fade'
        },
        slots: {
          default: '<div>Test Content</div>'
        }
      });

      const transition = wrapper.findComponent({ name: 'Transition' });
      expect(transition.props('name')).toBe('no-transition');
    });

    it('should emit transition events', async () => {
      const wrapper = mount(PageTransition, {
        slots: {
          default: '<div>Test Content</div>'
        }
      });

      const transition = wrapper.findComponent({ name: 'Transition' });
      
      // Simulate transition events
      await transition.vm.$emit('before-enter', document.createElement('div'));
      await transition.vm.$emit('after-enter', document.createElement('div'));

      expect(wrapper.emitted('before-enter')).toBeTruthy();
      expect(wrapper.emitted('after-enter')).toBeTruthy();
    });
  });

  describe('ModalTransition Component', () => {
    it('should render modal when show is true', () => {
      const wrapper = mount(ModalTransition, {
        props: {
          show: true
        },
        slots: {
          default: '<div>Modal Content</div>'
        }
      });

      expect(wrapper.find('.modal-overlay').exists()).toBe(true);
      expect(wrapper.find('.modal-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Modal Content');
    });

    it('should not render modal when show is false', () => {
      const wrapper = mount(ModalTransition, {
        props: {
          show: false
        },
        slots: {
          default: '<div>Modal Content</div>'
        }
      });

      expect(wrapper.find('.modal-overlay').exists()).toBe(false);
    });

    it('should emit close event when overlay is clicked', async () => {
      const wrapper = mount(ModalTransition, {
        props: {
          show: true,
          closeOnOverlay: true
        },
        slots: {
          default: '<div>Modal Content</div>'
        }
      });

      await wrapper.find('.modal-overlay').trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('should not emit close event when closeOnOverlay is false', async () => {
      const wrapper = mount(ModalTransition, {
        props: {
          show: true,
          closeOnOverlay: false
        },
        slots: {
          default: '<div>Modal Content</div>'
        }
      });

      await wrapper.find('.modal-overlay').trigger('click');
      expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('should handle escape key press', async () => {
      const wrapper = mount(ModalTransition, {
        props: {
          show: true
        },
        slots: {
          default: '<div>Modal Content</div>'
        }
      });

      // Simulate escape key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      await flushPromises();
      expect(wrapper.emitted('close')).toBeTruthy();
    });
  });

  describe('DropdownTransition Component', () => {
    it('should render dropdown when show is true', () => {
      const wrapper = mount(DropdownTransition, {
        props: {
          show: true
        },
        slots: {
          default: '<div>Dropdown Content</div>'
        }
      });

      expect(wrapper.find('.dropdown-container').exists()).toBe(true);
      expect(wrapper.text()).toContain('Dropdown Content');
    });

    it('should apply correct position classes', () => {
      const wrapper = mount(DropdownTransition, {
        props: {
          show: true,
          position: 'top-right'
        },
        slots: {
          default: '<div>Dropdown Content</div>'
        }
      });

      expect(wrapper.find('.origin-bottom-right').exists()).toBe(true);
    });

    it('should apply correct size classes', () => {
      const wrapper = mount(DropdownTransition, {
        props: {
          show: true,
          size: 'lg'
        },
        slots: {
          default: '<div>Dropdown Content</div>'
        }
      });

      expect(wrapper.find('.w-64').exists()).toBe(true);
    });

    it('should emit opened and closed events', async () => {
      const wrapper = mount(DropdownTransition, {
        props: {
          show: true
        },
        slots: {
          default: '<div>Dropdown Content</div>'
        }
      });

      // Simulate transition events
      const transition = wrapper.findComponent({ name: 'Transition' });
      await transition.vm.$emit('after-enter');
      await transition.vm.$emit('after-leave');

      expect(wrapper.emitted('opened')).toBeTruthy();
      expect(wrapper.emitted('closed')).toBeTruthy();
    });
  });

  describe('ScrollReveal Component', () => {
    it('should render with correct animation classes', () => {
      const wrapper = mount(ScrollReveal, {
        props: {
          animation: 'fade-up'
        },
        slots: {
          default: '<div>Reveal Content</div>'
        }
      });

      expect(wrapper.find('.scroll-reveal-fade-up').exists()).toBe(true);
      expect(wrapper.text()).toContain('Reveal Content');
    });

    it('should be visible immediately when reduced motion is preferred', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = mount(ScrollReveal, {
        props: {
          animation: 'fade-up'
        },
        slots: {
          default: '<div>Reveal Content</div>'
        }
      });

      expect(wrapper.find('.scroll-reveal-no-motion').exists()).toBe(true);
    });

    it('should set up intersection observer', () => {
      mount(ScrollReveal, {
        props: {
          animation: 'fade-up'
        },
        slots: {
          default: '<div>Reveal Content</div>'
        }
      });

      expect(IntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('StaggerContainer Component', () => {
    it('should render with correct stagger classes', () => {
      const wrapper = mount(StaggerContainer, {
        props: {
          animation: 'fade-up'
        },
        slots: {
          default: '<div>Item 1</div><div>Item 2</div>'
        }
      });

      expect(wrapper.find('.stagger-container').exists()).toBe(true);
      expect(wrapper.find('.stagger-fade-up').exists()).toBe(true);
    });

    it('should expose animate method', () => {
      const wrapper = mount(StaggerContainer, {
        slots: {
          default: '<div>Item 1</div><div>Item 2</div>'
        }
      });

      expect(typeof wrapper.vm.animate).toBe('function');
    });

    it('should emit animation events', async () => {
      const wrapper = mount(StaggerContainer, {
        props: {
          autoPlay: false
        },
        slots: {
          default: '<div>Item 1</div><div>Item 2</div>'
        }
      });

      // Manually trigger animation
      wrapper.vm.animate();
      await flushPromises();

      expect(wrapper.emitted('animation-start')).toBeTruthy();
    });
  });

  describe('ParallaxContainer Component', () => {
    it('should render with parallax classes', () => {
      const wrapper = mount(ParallaxContainer, {
        props: {
          speed: 0.5
        },
        slots: {
          default: '<div>Parallax Content</div>'
        }
      });

      expect(wrapper.find('.parallax-container').exists()).toBe(true);
      expect(wrapper.text()).toContain('Parallax Content');
    });

    it('should disable parallax when reduced motion is preferred', () => {
      window.matchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const wrapper = mount(ParallaxContainer, {
        props: {
          speed: 0.5
        },
        slots: {
          default: '<div>Parallax Content</div>'
        }
      });

      expect(wrapper.find('.parallax-disabled').exists()).toBe(true);
    });

    it('should set up scroll event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      mount(ParallaxContainer, {
        props: {
          speed: 0.5
        },
        slots: {
          default: '<div>Parallax Content</div>'
        }
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });
    });
  });

  describe('SmoothScroll Component', () => {
    it('should render as button by default', () => {
      const wrapper = mount(SmoothScroll, {
        props: {
          target: '#test-target'
        },
        slots: {
          default: 'Scroll to Target'
        }
      });

      expect(wrapper.element.tagName).toBe('BUTTON');
      expect(wrapper.text()).toContain('Scroll to Target');
    });

    it('should render as anchor when href is provided', () => {
      const wrapper = mount(SmoothScroll, {
        props: {
          target: '#test-target',
          href: '#test-target',
          tag: 'a'
        },
        slots: {
          default: 'Scroll to Target'
        }
      });

      expect(wrapper.element.tagName).toBe('A');
      expect(wrapper.attributes('href')).toBe('#test-target');
    });

    it('should handle click events and emit scroll events', async () => {
      // Create target element
      const targetElement = document.createElement('div');
      targetElement.id = 'test-target';
      targetElement.offsetTop = 1000;
      document.body.appendChild(targetElement);

      const wrapper = mount(SmoothScroll, {
        props: {
          target: '#test-target'
        },
        slots: {
          default: 'Scroll to Target'
        }
      });

      await wrapper.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('scroll-start')).toBeTruthy();

      document.body.removeChild(targetElement);
    });

    it('should emit error when target is not found', async () => {
      const wrapper = mount(SmoothScroll, {
        props: {
          target: '#non-existent-target'
        },
        slots: {
          default: 'Scroll to Target'
        }
      });

      await wrapper.trigger('click');
      await flushPromises();

      expect(wrapper.emitted('scroll-error')).toBeTruthy();
    });
  });

  describe('Animation Performance Integration', () => {
    it('should handle multiple simultaneous animations', async () => {
      const wrapper1 = mount(PageTransition, {
        props: { name: 'fade' },
        slots: { default: '<div>Content 1</div>' }
      });

      const wrapper2 = mount(ModalTransition, {
        props: { show: true },
        slots: { default: '<div>Modal Content</div>' }
      });

      const wrapper3 = mount(ScrollReveal, {
        props: { animation: 'fade-up' },
        slots: { default: '<div>Reveal Content</div>' }
      });

      // All components should render without conflicts
      expect(wrapper1.text()).toContain('Content 1');
      expect(wrapper2.text()).toContain('Modal Content');
      expect(wrapper3.text()).toContain('Reveal Content');
    });

    it('should cleanup resources properly', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const wrapper = mount(ParallaxContainer, {
        props: { speed: 0.5 },
        slots: { default: '<div>Content</div>' }
      });

      wrapper.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});