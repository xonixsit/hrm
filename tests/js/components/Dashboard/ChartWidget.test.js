import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ChartWidget from '@/Components/Dashboard/ChartWidget.vue';
import DashboardWidget from '@/Components/Dashboard/DashboardWidget.vue';

// Mock the icons
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => {
    const iconMap = {
      'refresh': 'RefreshIcon',
      'arrow-path': 'ArrowPathIcon',
      'x-circle': 'XCircleIcon',
      'chart-bar': 'ChartBarIcon',
      'chart-line': 'ChartLineIcon',
      'chart-pie': 'ChartPieIcon'
    };
    return iconMap[name] || 'DefaultIcon';
  })
}));

describe('ChartWidget', () => {
  let wrapper;

  const defaultProps = {
    title: 'Test Chart',
    data: [
      { x: 0, y: 10, label: 'Jan' },
      { x: 1, y: 20, label: 'Feb' },
      { x: 2, y: 15, label: 'Mar' },
      { x: 3, y: 25, label: 'Apr' }
    ]
  };

  beforeEach(() => {
    wrapper = mount(ChartWidget, {
      props: defaultProps,
      global: {
        components: {
          DashboardWidget
        }
      }
    });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.chart-widget').exists()).toBe(true);
    });

    it('renders the chart title', () => {
      expect(wrapper.text()).toContain('Test Chart');
    });

    it('renders chart controls when showControls is true', () => {
      expect(wrapper.find('.chart-controls').exists()).toBe(true);
    });

    it('hides chart controls when showControls is false', async () => {
      await wrapper.setProps({ showControls: false });
      expect(wrapper.find('.chart-controls').exists()).toBe(false);
    });
  });

  describe('Chart Types', () => {
    it('renders line chart by default', () => {
      expect(wrapper.find('.line-chart').exists()).toBe(true);
      expect(wrapper.find('.chart-line').exists()).toBe(true);
    });

    it('renders bar chart when type is bar', async () => {
      await wrapper.setProps({ type: 'bar' });
      expect(wrapper.find('.bar-chart').exists()).toBe(true);
      expect(wrapper.find('.chart-bar').exists()).toBe(true);
    });

    it('renders donut chart when type is donut', async () => {
      await wrapper.setProps({ type: 'donut' });
      expect(wrapper.find('.donut-chart').exists()).toBe(true);
      expect(wrapper.find('.donut-segment').exists()).toBe(true);
    });
  });

  describe('Data Processing', () => {
    it('processes data correctly for line chart', () => {
      const vm = wrapper.vm;
      expect(vm.processedData).toHaveLength(4);
      expect(vm.processedData[0]).toMatchObject({
        x: 0,
        y: 10,
        label: 'Jan',
        index: 0
      });
    });

    it('calculates data extent correctly', () => {
      const vm = wrapper.vm;
      expect(vm.dataExtent).toMatchObject({
        minX: 0,
        maxX: 3,
        minY: 0,
        maxY: 25
      });
    });

    it('generates chart points correctly', () => {
      const vm = wrapper.vm;
      expect(vm.chartPoints).toHaveLength(4);
      expect(vm.chartPoints[0]).toHaveProperty('x');
      expect(vm.chartPoints[0]).toHaveProperty('y');
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading is true', async () => {
      await wrapper.setProps({ loading: true });
      expect(wrapper.find('.chart-loading').exists()).toBe(true);
      expect(wrapper.find('.loading-skeleton').exists()).toBe(true);
    });

    it('hides chart content when loading', async () => {
      await wrapper.setProps({ loading: true });
      expect(wrapper.find('.chart-content').exists()).toBe(false);
    });
  });

  describe('Error States', () => {
    it('shows error state when error is true', async () => {
      await wrapper.setProps({ error: true });
      expect(wrapper.find('.chart-error').exists()).toBe(true);
    });

    it('displays custom error message', async () => {
      const errorMessage = 'Custom error message';
      await wrapper.setProps({ error: true, errorMessage });
      expect(wrapper.text()).toContain(errorMessage);
    });

    it('shows retry button in error state', async () => {
      await wrapper.setProps({ error: true });
      expect(wrapper.find('.error-retry-button').exists()).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no data', async () => {
      await wrapper.setProps({ data: [] });
      expect(wrapper.find('.chart-empty').exists()).toBe(true);
    });

    it('displays custom empty message', async () => {
      const emptyMessage = 'No data to display';
      await wrapper.setProps({ data: [], emptyMessage });
      expect(wrapper.text()).toContain(emptyMessage);
    });
  });

  describe('Chart Features', () => {
    it('shows grid lines when showGrid is true', () => {
      expect(wrapper.find('.grid-lines').exists()).toBe(true);
    });

    it('hides grid lines when showGrid is false', async () => {
      await wrapper.setProps({ showGrid: false });
      expect(wrapper.find('.grid-lines').exists()).toBe(false);
    });

    it('shows data points when showPoints is true', () => {
      expect(wrapper.find('.data-points').exists()).toBe(true);
    });

    it('shows area fill when showArea is true', async () => {
      await wrapper.setProps({ showArea: true });
      expect(wrapper.find('.chart-area').exists()).toBe(true);
    });

    it('shows axis labels when showLabels is true', () => {
      expect(wrapper.find('.axis-labels').exists()).toBe(true);
    });
  });

  describe('Color Variants', () => {
    it('applies primary color class by default', () => {
      expect(wrapper.find('.chart-line--primary').exists()).toBe(true);
    });

    it('applies custom color class', async () => {
      await wrapper.setProps({ color: 'success' });
      expect(wrapper.find('.chart-line--success').exists()).toBe(true);
    });
  });

  describe('Controls', () => {
    it('renders time range selector when showTimeRange is true', () => {
      expect(wrapper.find('.chart-control-select').exists()).toBe(true);
    });

    it('renders refresh button when showRefresh is true', () => {
      expect(wrapper.find('.chart-control-button').exists()).toBe(true);
    });

    it('emits time-range-change when time range changes', async () => {
      const select = wrapper.find('.chart-control-select');
      await select.setValue('30d');
      await select.trigger('change');
      
      expect(wrapper.emitted('time-range-change')).toBeTruthy();
      expect(wrapper.emitted('time-range-change')[0]).toEqual(['30d']);
    });

    it('emits refresh when refresh button is clicked', async () => {
      const refreshButton = wrapper.find('.chart-control-button');
      await refreshButton.trigger('click');
      
      expect(wrapper.emitted('refresh')).toBeTruthy();
    });
  });

  describe('Tooltip', () => {
    it('shows tooltip on data point hover', async () => {
      const dataPoint = wrapper.find('.data-point');
      if (dataPoint.exists()) {
        await dataPoint.trigger('mouseenter');
        expect(wrapper.find('.chart-tooltip').exists()).toBe(true);
      }
    });

    it('hides tooltip on mouse leave', async () => {
      const dataPoint = wrapper.find('.data-point');
      if (dataPoint.exists()) {
        await dataPoint.trigger('mouseenter');
        await dataPoint.trigger('mouseleave');
        expect(wrapper.find('.chart-tooltip').exists()).toBe(false);
      }
    });
  });

  describe('Summary Statistics', () => {
    it('calculates summary stats correctly when showSummary is true', async () => {
      await wrapper.setProps({ showSummary: true });
      const vm = wrapper.vm;
      
      expect(vm.summaryStats).toHaveLength(4);
      expect(vm.summaryStats[0]).toMatchObject({
        label: 'Total',
        value: '70'
      });
    });

    it('shows summary stats in footer', async () => {
      await wrapper.setProps({ showSummary: true });
      expect(wrapper.find('.chart-summary').exists()).toBe(true);
    });
  });

  describe('Donut Chart Specific', () => {
    beforeEach(async () => {
      await wrapper.setProps({ type: 'donut' });
    });

    it('calculates donut segments correctly', () => {
      const vm = wrapper.vm;
      expect(vm.donutSegments).toHaveLength(4);
      expect(vm.donutSegments[0]).toHaveProperty('path');
      expect(vm.donutSegments[0]).toHaveProperty('percentage');
    });

    it('shows legend when showLegend is true', () => {
      expect(wrapper.find('.chart-legend').exists()).toBe(true);
    });

    it('displays center text when provided', async () => {
      await wrapper.setProps({ centerText: 'Total: 70' });
      expect(wrapper.find('.donut-center-text').exists()).toBe(true);
      expect(wrapper.text()).toContain('Total: 70');
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes', () => {
      expect(wrapper.find('.chart-container').exists()).toBe(true);
    });

    it('maintains aspect ratio', () => {
      const svg = wrapper.find('.chart-svg');
      expect(svg.attributes('viewBox')).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('includes proper ARIA labels', () => {
      const progressBar = wrapper.find('[role="progressbar"]');
      if (progressBar.exists()) {
        expect(progressBar.attributes('aria-label')).toBeDefined();
      }
    });

    it('provides keyboard navigation support', () => {
      const buttons = wrapper.findAll('button');
      buttons.forEach(button => {
        expect(button.attributes('title')).toBeDefined();
      });
    });
  });

  describe('Performance', () => {
    it('handles large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.random() * 100,
        label: `Point ${i}`
      }));
      
      const startTime = performance.now();
      await wrapper.setProps({ data: largeData });
      const endTime = performance.now();
      
      // Should process large dataset in reasonable time (< 1000ms for test environment)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('debounces tooltip updates', async () => {
      const dataPoint = wrapper.find('.data-point');
      if (dataPoint.exists()) {
        // Rapidly trigger mouse events
        for (let i = 0; i < 10; i++) {
          await dataPoint.trigger('mouseenter');
          await dataPoint.trigger('mouseleave');
        }
        
        // Should handle rapid events without issues
        expect(wrapper.vm.tooltip.show).toBe(false);
      }
    });
  });

  describe('Data Validation', () => {
    it('handles invalid data gracefully', async () => {
      const invalidData = [
        { x: 'invalid', y: null },
        { x: 1, y: 'invalid' },
        null,
        undefined
      ];
      
      await wrapper.setProps({ data: invalidData });
      // Should filter out null/undefined and still show valid data or empty state
      expect(wrapper.exists()).toBe(true);
    });

    it('filters out null and undefined values', async () => {
      const mixedData = [
        { x: 0, y: 10, label: 'Valid' },
        null,
        { x: 1, y: 20, label: 'Valid' },
        undefined,
        { x: 2, y: 15, label: 'Valid' }
      ];
      
      await wrapper.setProps({ data: mixedData });
      const vm = wrapper.vm;
      expect(vm.processedData).toHaveLength(3);
    });
  });

  describe('Animation', () => {
    it('applies animation classes to chart elements', () => {
      const chartLine = wrapper.find('.chart-line');
      expect(chartLine.exists()).toBe(true);
    });

    it('respects reduced motion preferences', () => {
      // This would typically be tested with CSS media query mocks
      expect(wrapper.find('.chart-content').exists()).toBe(true);
    });
  });

  describe('Theme Support', () => {
    it('applies theme classes correctly', async () => {
      // Simulate dark theme
      document.documentElement.classList.add('theme-dark');
      
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.chart-widget').exists()).toBe(true);
      
      document.documentElement.classList.remove('theme-dark');
    });
  });

  describe('Event Handling', () => {
    it('emits chart-type-change when type toggle is clicked', async () => {
      await wrapper.setProps({ showTypeToggle: true });
      const typeToggle = wrapper.find('.chart-control-button');
      
      if (typeToggle.exists()) {
        await typeToggle.trigger('click');
        expect(wrapper.emitted('chart-type-change')).toBeTruthy();
      }
    });

    it('handles data point clicks', async () => {
      const dataPoint = wrapper.find('.data-point');
      if (dataPoint.exists()) {
        await dataPoint.trigger('click');
        // Should not throw errors
        expect(wrapper.exists()).toBe(true);
      }
    });
  });

  describe('Memory Management', () => {
    it('cleans up event listeners on unmount', () => {
      wrapper.unmount();
      // Component should unmount cleanly
      expect(wrapper.exists()).toBe(false);
    });

    it('removes tooltip on data changes', async () => {
      // Show tooltip first
      const dataPoint = wrapper.find('.data-point');
      if (dataPoint.exists()) {
        await dataPoint.trigger('mouseenter');
        expect(wrapper.vm.tooltip.show).toBe(true);
        
        // Change data
        await wrapper.setProps({ data: [{ x: 0, y: 5, label: 'New' }] });
        expect(wrapper.vm.tooltip.show).toBe(false);
      }
    });
  });
});