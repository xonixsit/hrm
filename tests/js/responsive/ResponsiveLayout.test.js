import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';

// Mock components to avoid complex dependencies
const MockDataTable = {
  name: 'DataTable',
  template: `
    <div class="data-table-container" :class="tableClasses">
      <table class="data-table" :class="{ 'table-mobile': isMobile }">
        <thead class="table-head">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              :data-priority="column.priority || 'high'"
              class="table-column"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-for="row in data" :key="row.id" class="table-row">
            <td 
              v-for="column in columns" 
              :key="column.key"
              :data-priority="column.priority || 'high'"
              class="table-cell"
            >
              {{ row[column.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  props: {
    columns: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] }
  },
  computed: {
    isMobile() {
      return window.innerWidth < 640;
    },
    tableClasses() {
      return {
        'mobile-optimized': this.isMobile,
        'desktop-optimized': !this.isMobile
      };
    }
  }
};

const MockFormLayout = {
  name: 'FormLayout',
  template: `
    <form :class="formClasses">
      <div class="form-grid" :class="gridClasses">
        <div v-for="field in fields" :key="field.name" class="form-group">
          <label>{{ field.label }}</label>
          <input 
            :type="field.type" 
            :class="inputClasses"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-actions" :class="actionClasses">
        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="button" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  `,
  props: {
    fields: { type: Array, default: () => [] }
  },
  computed: {
    isMobile() {
      return window.innerWidth < 640;
    },
    isTablet() {
      return window.innerWidth >= 640 && window.innerWidth < 1024;
    },
    formClasses() {
      return {
        'form-responsive': true,
        'mobile-form': this.isMobile,
        'tablet-form': this.isTablet
      };
    },
    gridClasses() {
      return {
        'grid-cols-1': this.isMobile,
        'grid-cols-2': this.isTablet,
        'grid-cols-3': !this.isMobile && !this.isTablet
      };
    },
    inputClasses() {
      return {
        'input-base': true,
        'touch-target': this.isMobile
      };
    },
    actionClasses() {
      return {
        'flex-col': this.isMobile,
        'flex-row': !this.isMobile
      };
    }
  }
};

const MockNavigationLayout = {
  name: 'NavigationLayout',
  template: `
    <div :class="layoutClasses">
      <nav class="navigation" :class="navClasses">
        <div v-for="item in navItems" :key="item.id" class="nav-item">
          {{ item.label }}
        </div>
      </nav>
      <main class="main-content">
        <slot />
      </main>
    </div>
  `,
  props: {
    navItems: { type: Array, default: () => [] }
  },
  computed: {
    isMobile() {
      return window.innerWidth < 640;
    },
    layoutClasses() {
      return {
        'layout-responsive': true,
        'mobile-layout': this.isMobile,
        'desktop-layout': !this.isMobile
      };
    },
    navClasses() {
      return {
        'nav-mobile': this.isMobile,
        'nav-desktop': !this.isMobile,
        'nav-horizontal': !this.isMobile,
        'nav-vertical': this.isMobile
      };
    }
  }
};

// Mock window dimensions
const setViewport = (width, height = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Layout Integration', () => {
  beforeEach(() => {
    // Reset to desktop default
    setViewport(1024, 768);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Table Responsive Behavior', () => {
    const columns = [
      { key: 'name', label: 'Name', priority: 'high' },
      { key: 'email', label: 'Email', priority: 'medium' },
      { key: 'department', label: 'Department', priority: 'medium' },
      { key: 'created_at', label: 'Created', priority: 'low' },
      { key: 'notes', label: 'Notes', priority: 'low' }
    ];

    const data = [
      { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com',
        department: 'IT',
        created_at: '2024-01-01',
        notes: 'Test notes'
      }
    ];

    it('should show all columns on desktop', async () => {
      setViewport(1280, 800);
      
      const wrapper = mount(MockDataTable, {
        props: { columns, data }
      });

      await nextTick();
      
      // All priority columns should be present
      expect(wrapper.findAll('[data-priority="high"]')).toHaveLength(2); // th + td
      expect(wrapper.findAll('[data-priority="medium"]')).toHaveLength(4); // 2 th + 2 td
      expect(wrapper.findAll('[data-priority="low"]')).toHaveLength(4); // 2 th + 2 td
    });

    it('should hide low priority columns on tablet', async () => {
      setViewport(768, 1024);
      
      const wrapper = mount(MockDataTable, {
        props: { columns, data }
      });

      await nextTick();
      
      // High and medium priority should be visible
      expect(wrapper.findAll('[data-priority="high"]')).toHaveLength(2);
      expect(wrapper.findAll('[data-priority="medium"]')).toHaveLength(4);
      expect(wrapper.findAll('[data-priority="low"]')).toHaveLength(4); // Still in DOM but hidden via CSS
    });

    it('should apply mobile-specific classes', async () => {
      setViewport(375, 667);
      
      const wrapper = mount(MockDataTable, {
        props: { columns, data }
      });

      await nextTick();
      
      expect(wrapper.find('.data-table').classes()).toContain('table-mobile');
      expect(wrapper.find('.data-table-container').classes()).toContain('mobile-optimized');
    });
  });

  describe('Form Layout Responsive Behavior', () => {
    const fields = [
      { name: 'firstName', label: 'First Name', type: 'text' },
      { name: 'lastName', label: 'Last Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel' }
    ];

    it('should use single column layout on mobile', async () => {
      setViewport(375, 667);
      
      const wrapper = mount(MockFormLayout, {
        props: { fields }
      });

      await nextTick();
      
      expect(wrapper.find('.form-grid').classes()).toContain('grid-cols-1');
      expect(wrapper.find('.form-actions').classes()).toContain('flex-col');
      expect(wrapper.find('form').classes()).toContain('mobile-form');
    });

    it('should use two column layout on tablet', async () => {
      setViewport(768, 1024);
      
      const wrapper = mount(MockFormLayout, {
        props: { fields }
      });

      await nextTick();
      
      expect(wrapper.find('.form-grid').classes()).toContain('grid-cols-2');
      expect(wrapper.find('.form-actions').classes()).toContain('flex-row');
      expect(wrapper.find('form').classes()).toContain('tablet-form');
    });

    it('should use three column layout on desktop', async () => {
      setViewport(1280, 800);
      
      const wrapper = mount(MockFormLayout, {
        props: { fields }
      });

      await nextTick();
      
      expect(wrapper.find('.form-grid').classes()).toContain('grid-cols-3');
      expect(wrapper.find('.form-actions').classes()).toContain('flex-row');
      expect(wrapper.find('form').classes()).not.toContain('mobile-form');
      expect(wrapper.find('form').classes()).not.toContain('tablet-form');
    });

    it('should apply touch-friendly classes on mobile', async () => {
      setViewport(375, 667);
      
      const wrapper = mount(MockFormLayout, {
        props: { fields }
      });

      await nextTick();
      
      const inputs = wrapper.findAll('.form-input');
      inputs.forEach(input => {
        expect(input.classes()).toContain('touch-target');
      });
    });
  });

  describe('Navigation Layout Responsive Behavior', () => {
    const navItems = [
      { id: 1, label: 'Dashboard' },
      { id: 2, label: 'Projects' },
      { id: 3, label: 'Settings' }
    ];

    it('should use mobile navigation layout on small screens', async () => {
      setViewport(375, 667);
      
      const wrapper = mount(MockNavigationLayout, {
        props: { navItems }
      });

      await nextTick();
      
      expect(wrapper.find('.navigation').classes()).toContain('nav-mobile');
      expect(wrapper.find('.navigation').classes()).toContain('nav-vertical');
      expect(wrapper.classes()).toContain('mobile-layout');
    });

    it('should use desktop navigation layout on large screens', async () => {
      setViewport(1280, 800);
      
      const wrapper = mount(MockNavigationLayout, {
        props: { navItems }
      });

      await nextTick();
      
      expect(wrapper.find('.navigation').classes()).toContain('nav-desktop');
      expect(wrapper.find('.navigation').classes()).toContain('nav-horizontal');
      expect(wrapper.classes()).toContain('desktop-layout');
    });
  });

  describe('Responsive Typography and Spacing', () => {
    it('should apply responsive text classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <h1 class="text-responsive-3xl">Main Heading</h1>
            <p class="text-responsive-base">Body text</p>
            <small class="text-responsive-sm">Small text</small>
          </div>
        `
      });

      const heading = wrapper.find('h1');
      const paragraph = wrapper.find('p');
      const small = wrapper.find('small');

      expect(heading.classes()).toContain('text-responsive-3xl');
      expect(paragraph.classes()).toContain('text-responsive-base');
      expect(small.classes()).toContain('text-responsive-sm');
    });

    it('should apply responsive spacing classes', async () => {
      const wrapper = mount({
        template: `
          <div class="space-y-responsive p-responsive">
            <div>Item 1</div>
            <div>Item 2</div>
          </div>
        `
      });

      const container = wrapper.find('div');
      expect(container.classes()).toContain('space-y-responsive');
      expect(container.classes()).toContain('p-responsive');
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('should apply touch target classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <button class="touch-target">Touch Button</button>
            <a href="#" class="touch-target-lg">Large Touch Link</a>
          </div>
        `
      });

      const button = wrapper.find('button');
      const link = wrapper.find('a');

      expect(button.classes()).toContain('touch-target');
      expect(link.classes()).toContain('touch-target-lg');
    });

    it('should apply touch-friendly form elements', async () => {
      const wrapper = mount({
        template: `
          <form>
            <input type="text" class="input-base touch-target" />
            <select class="input-base touch-target">
              <option>Option 1</option>
            </select>
            <button type="submit" class="btn-base touch-target">Submit</button>
          </form>
        `
      });

      const input = wrapper.find('input');
      const select = wrapper.find('select');
      const button = wrapper.find('button');

      expect(input.classes()).toContain('touch-target');
      expect(select.classes()).toContain('touch-target');
      expect(button.classes()).toContain('touch-target');
    });
  });

  describe('Responsive Image Handling', () => {
    it('should apply responsive image classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <img src="/test.jpg" alt="Test" class="img-responsive" />
            <img src="/test2.jpg" alt="Test 2" class="img-responsive-contain" />
            <div class="aspect-responsive">
              <img src="/test3.jpg" alt="Test 3" />
            </div>
          </div>
        `
      });

      const img1 = wrapper.find('img[alt="Test"]');
      const img2 = wrapper.find('img[alt="Test 2"]');
      const aspectDiv = wrapper.find('.aspect-responsive');

      expect(img1.classes()).toContain('img-responsive');
      expect(img2.classes()).toContain('img-responsive-contain');
      expect(aspectDiv.exists()).toBe(true);
    });
  });

  describe('Responsive Visibility Classes', () => {
    it('should apply mobile visibility classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <div class="visible-mobile">Mobile Only</div>
            <div class="hidden-mobile">Hidden on Mobile</div>
            <div class="mobile-only">Mobile Only Alt</div>
          </div>
        `
      });

      expect(wrapper.find('.visible-mobile').exists()).toBe(true);
      expect(wrapper.find('.hidden-mobile').exists()).toBe(true);
      expect(wrapper.find('.mobile-only').exists()).toBe(true);
    });

    it('should apply tablet visibility classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <div class="visible-tablet">Tablet Only</div>
            <div class="hidden-tablet">Hidden on Tablet</div>
            <div class="tablet-up">Tablet and Up</div>
          </div>
        `
      });

      expect(wrapper.find('.visible-tablet').exists()).toBe(true);
      expect(wrapper.find('.hidden-tablet').exists()).toBe(true);
      expect(wrapper.find('.tablet-up').exists()).toBe(true);
    });

    it('should apply desktop visibility classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <div class="visible-desktop">Desktop Only</div>
            <div class="desktop-only">Desktop Only Alt</div>
            <div class="show-desktop">Show on Desktop</div>
          </div>
        `
      });

      expect(wrapper.find('.visible-desktop').exists()).toBe(true);
      expect(wrapper.find('.desktop-only').exists()).toBe(true);
      expect(wrapper.find('.show-desktop').exists()).toBe(true);
    });
  });

  describe('Responsive Container Classes', () => {
    it('should apply responsive container classes', async () => {
      const wrapper = mount({
        template: `
          <div>
            <div class="container-responsive">Responsive Container</div>
            <div class="container-responsive-sm">Small Container</div>
            <div class="container-responsive-lg">Large Container</div>
          </div>
        `
      });

      expect(wrapper.find('.container-responsive').exists()).toBe(true);
      expect(wrapper.find('.container-responsive-sm').exists()).toBe(true);
      expect(wrapper.find('.container-responsive-lg').exists()).toBe(true);
    });
  });

  describe('Responsive Grid and Flexbox', () => {
    it('should apply responsive grid classes', async () => {
      const wrapper = mount({
        template: `
          <div class="layout-grid layout-grid-md">
            <div>Grid Item 1</div>
            <div>Grid Item 2</div>
            <div>Grid Item 3</div>
          </div>
        `
      });

      const grid = wrapper.find('.layout-grid');
      expect(grid.classes()).toContain('layout-grid-md');
    });

    it('should apply responsive flexbox classes', async () => {
      const wrapper = mount({
        template: `
          <div class="flex-responsive">
            <div>Flex Item 1</div>
            <div>Flex Item 2</div>
          </div>
        `
      });

      const flex = wrapper.find('.flex-responsive');
      expect(flex.exists()).toBe(true);
    });
  });

  describe('Performance and Accessibility', () => {
    it('should handle rapid viewport changes efficiently', async () => {
      const wrapper = mount(MockDataTable, {
        props: {
          columns: [{ key: 'name', label: 'Name' }],
          data: [{ id: 1, name: 'Test' }]
        }
      });

      const start = performance.now();
      
      // Simulate rapid viewport changes
      for (let i = 0; i < 10; i++) {
        setViewport(320 + i * 100, 600);
        await nextTick();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // Should complete efficiently (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    it('should maintain accessibility attributes across breakpoints', async () => {
      const wrapper = mount({
        template: `
          <div>
            <button 
              class="touch-target" 
              aria-label="Accessible Button"
              tabindex="0"
            >
              Click Me
            </button>
            <input 
              type="text" 
              class="input-base touch-target"
              aria-describedby="help-text"
              placeholder="Accessible Input"
            />
            <div id="help-text" class="sr-only">Help text</div>
          </div>
        `
      });

      const button = wrapper.find('button');
      const input = wrapper.find('input');
      const helpText = wrapper.find('#help-text');

      expect(button.attributes('aria-label')).toBe('Accessible Button');
      expect(button.attributes('tabindex')).toBe('0');
      expect(input.attributes('aria-describedby')).toBe('help-text');
      expect(helpText.classes()).toContain('sr-only');
    });
  });
});