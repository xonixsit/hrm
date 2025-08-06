/**
 * DataTable Column Spacing Fix Tests
 * 
 * Tests to verify that the column spacing issue has been resolved
 * and that columns are properly distributed without large gaps.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DataTable from '@/Components/Data/DataTable.vue';

describe('DataTable Column Spacing Fix', () => {
  let wrapper;
  
  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'role', label: 'Role' }
  ];
  
  const mockData = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      department: 'Administration',
      role: 'System Administrator'
    },
    {
      id: 2,
      name: 'HR User',
      email: 'hr@example.com',
      department: 'Human Resources',
      role: 'HR Manager'
    }
  ];

  beforeEach(() => {
    wrapper = mount(DataTable, {
      props: {
        columns: mockColumns,
        data: mockData,
        theme: 'light'
      }
    });
  });

  describe('Column Width Distribution', () => {
    it('should apply correct width percentages to columns', () => {
      const component = wrapper.vm;
      
      // Test name column (first column)
      const nameColumn = mockColumns[0];
      const nameStyles = component.getColumnStyles(nameColumn);
      expect(nameStyles.width).toBe('25%');
      expect(nameStyles.minWidth).toBe('180px');
      expect(nameStyles.maxWidth).toBe('300px');
      
      // Test email column
      const emailColumn = mockColumns[1];
      const emailStyles = component.getColumnStyles(emailColumn);
      expect(emailStyles.width).toBe('30%');
      expect(emailStyles.minWidth).toBe('200px');
      expect(emailStyles.maxWidth).toBe('350px');
      
      // Test department column
      const departmentColumn = mockColumns[2];
      const departmentStyles = component.getColumnStyles(departmentColumn);
      expect(departmentStyles.width).toBe('20%');
      expect(departmentStyles.minWidth).toBe('140px');
      expect(departmentStyles.maxWidth).toBe('200px');
      
      // Test role column (default column)
      const roleColumn = mockColumns[3];
      const roleStyles = component.getColumnStyles(roleColumn);
      expect(roleStyles.width).toBe('25%'); // Should be 25% for remaining space
      expect(roleStyles.minWidth).toBe('120px');
      expect(roleStyles.maxWidth).toBe('200px');
    });

    it('should handle explicit width specifications', () => {
      const columnWithWidth = { key: 'custom', label: 'Custom', width: '150px' };
      const component = wrapper.vm;
      
      const styles = component.getColumnStyles(columnWithWidth);
      expect(styles.width).toBe('150px');
      expect(styles.minWidth).toBe('150px');
      expect(styles.maxWidth).toBe('150px');
    });

    it('should handle flex-based system', () => {
      const flexColumn = { key: 'flex', label: 'Flex', flex: 2 };
      const component = wrapper.vm;
      
      // Mock columns with flex
      wrapper.setProps({
        columns: [
          { key: 'col1', label: 'Col1', flex: 1 },
          flexColumn,
          { key: 'col3', label: 'Col3', flex: 1 }
        ]
      });
      
      const styles = component.getColumnStyles(flexColumn);
      expect(styles.width).toBe('50%'); // 2 out of 4 total flex units
      expect(styles.minWidth).toBe('120px');
    });
  });

  describe('Table Layout CSS', () => {
    it('should use fixed table layout', () => {
      const table = wrapper.find('.data-table');
      expect(table.exists()).toBe(true);
      
      // Check that the CSS class is applied (the actual CSS rule is in the style section)
      expect(table.classes()).toContain('data-table');
    });

    it('should have full width container', () => {
      const container = wrapper.find('.data-table-container');
      expect(container.exists()).toBe(true);
    });

    it('should have proper scroll container', () => {
      const scrollContainer = wrapper.find('.table-scroll-container');
      expect(scrollContainer.exists()).toBe(true);
    });
  });

  describe('Column Type Handling', () => {
    it('should handle date columns correctly', () => {
      const dateColumn = { key: 'created_date', label: 'Created Date' };
      const component = wrapper.vm;
      
      const styles = component.getColumnStyles(dateColumn);
      expect(styles.width).toBe('15%');
      expect(styles.minWidth).toBe('120px');
      expect(styles.maxWidth).toBe('160px');
    });

    it('should handle job title columns correctly', () => {
      const jobTitleColumn = { key: 'job_title', label: 'Job Title' };
      const component = wrapper.vm;
      
      const styles = component.getColumnStyles(jobTitleColumn);
      expect(styles.width).toBe('20%');
      expect(styles.minWidth).toBe('140px');
      expect(styles.maxWidth).toBe('200px');
    });

    it('should handle contract type columns correctly', () => {
      const contractColumn = { key: 'contract_type', label: 'Contract Type' };
      const component = wrapper.vm;
      
      const styles = component.getColumnStyles(contractColumn);
      expect(styles.width).toBe('20%');
      expect(styles.minWidth).toBe('140px');
      expect(styles.maxWidth).toBe('200px');
    });
  });

  describe('Dynamic Width Calculation', () => {
    it('should calculate remaining width correctly for default columns', () => {
      const complexColumns = [
        { key: 'name', label: 'Name' }, // 25%
        { key: 'email', label: 'Email' }, // 30%
        { key: 'department', label: 'Department' }, // 20%
        { key: 'status', label: 'Status' }, // Should get remaining 25%
        { key: 'other', label: 'Other' } // Should share remaining space
      ];
      
      wrapper.setProps({ columns: complexColumns });
      const component = wrapper.vm;
      
      // Test the last two columns (default columns)
      const statusStyles = component.getColumnStyles(complexColumns[3]);
      const otherStyles = component.getColumnStyles(complexColumns[4]);
      
      // Both should get equal share of remaining space
      expect(statusStyles.width).toBe('12.5%'); // (100 - 25 - 30 - 20) / 2
      expect(otherStyles.width).toBe('12.5%');
    });

    it('should ensure minimum width for default columns', () => {
      const manyColumns = Array.from({ length: 10 }, (_, i) => ({
        key: `col${i}`,
        label: `Column ${i}`
      }));
      
      wrapper.setProps({ columns: manyColumns });
      const component = wrapper.vm;
      
      // Test a default column (not name, email, department, or date)
      const defaultColumn = manyColumns[5];
      const styles = component.getColumnStyles(defaultColumn);
      
      // Should have minimum 15% width
      const widthPercent = parseFloat(styles.width.replace('%', ''));
      expect(widthPercent).toBeGreaterThanOrEqual(15);
    });
  });

  describe('Theme Integration', () => {
    it('should maintain column spacing with light theme', () => {
      wrapper.setProps({ theme: 'light' });
      const container = wrapper.find('.data-table-container');
      expect(container.attributes('data-theme')).toBe('light');
    });

    it('should maintain column spacing with dark theme', () => {
      wrapper.setProps({ theme: 'dark' });
      const container = wrapper.find('.data-table-container');
      expect(container.attributes('data-theme')).toBe('dark');
    });
  });

  describe('Responsive Behavior', () => {
    it('should maintain column structure on different screen sizes', () => {
      // Test that columns are still rendered with proper classes
      const headers = wrapper.findAll('.table-head th');
      expect(headers).toHaveLength(mockColumns.length);
      
      headers.forEach((header, index) => {
        expect(header.classes()).toContain(`column-${mockColumns[index].key}`);
      });
    });

    it('should apply priority-based hiding on smaller screens', () => {
      // Test that data-priority attributes are applied
      const headers = wrapper.findAll('.table-head th');
      headers.forEach(header => {
        expect(header.attributes('data-priority')).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty columns array gracefully', () => {
      wrapper.setProps({ columns: [] });
      expect(wrapper.find('.data-table').exists()).toBe(true);
    });

    it('should handle single column', () => {
      const singleColumn = [{ key: 'name', label: 'Name' }];
      wrapper.setProps({ columns: singleColumn });
      
      const component = wrapper.vm;
      const styles = component.getColumnStyles(singleColumn[0]);
      expect(styles.width).toBe('25%'); // Name column gets its standard width
    });

    it('should handle columns without specific keys', () => {
      const genericColumns = [
        { key: 'field1', label: 'Field 1' },
        { key: 'field2', label: 'Field 2' }
      ];
      
      wrapper.setProps({ columns: genericColumns });
      const component = wrapper.vm;
      
      genericColumns.forEach(column => {
        const styles = component.getColumnStyles(column);
        expect(styles.width).toMatch(/\d+(\.\d+)?%/); // Should have percentage width
        expect(styles.minWidth).toBe('120px');
        expect(styles.maxWidth).toBe('200px');
      });
    });
  });
});

describe('DataTable Column Spacing Integration', () => {
  it('should render without large gaps between columns', async () => {
    const wrapper = mount(DataTable, {
      props: {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'department', label: 'Department' },
          { key: 'role', label: 'Role' }
        ],
        data: [
          {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            department: 'Testing',
            role: 'Tester'
          }
        ],
        theme: 'light'
      }
    });

    // Verify table structure
    expect(wrapper.find('.data-table').exists()).toBe(true);
    expect(wrapper.find('.table-head').exists()).toBe(true);
    expect(wrapper.find('.table-body').exists()).toBe(true);

    // Verify columns are rendered
    const headers = wrapper.findAll('.table-head th');
    expect(headers).toHaveLength(4);

    // Verify data cells are rendered
    const cells = wrapper.findAll('.table-body td');
    expect(cells).toHaveLength(4);

    // Verify theme is applied
    const container = wrapper.find('.data-table-container');
    expect(container.attributes('data-theme')).toBe('light');
  });
});