import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import NotificationCenter from '@/Components/Dashboard/NotificationCenter.vue';

// Mock the icons
vi.mock('@/config/icons', () => ({
  getIcon: vi.fn((name) => {
    const iconMap = {
      'bell': 'BellIcon',
      'check': 'CheckIcon',
      'check-circle': 'CheckCircleIcon',
      'cog': 'CogIcon',
      'x-mark': 'XMarkIcon',
      'trash': 'TrashIcon',
      'loading': 'LoadingIcon',
      'refresh': 'RefreshIcon',
      'bell-slash': 'BellSlashIcon',
      'information-circle': 'InformationCircleIcon',
      'check-circle': 'CheckCircleIcon',
      'exclamation-triangle': 'ExclamationTriangleIcon',
      'x-circle': 'XCircleIcon',
      'at-symbol': 'AtSymbolIcon',
      'chat-bubble-left-right': 'ChatBubbleIcon',
      'arrow-up-circle': 'ArrowUpCircleIcon',
      'clock': 'ClockIcon'
    };
    return iconMap[name] || 'DefaultIcon';
  })
}));

describe('NotificationCenter', () => {
  let wrapper;

  const mockNotifications = [
    {
      id: 1,
      title: 'New Message',
      message: 'You have a new message from John',
      type: 'message',
      read: false,
      timestamp: new Date().toISOString(),
      category: 'Messages'
    },
    {
      id: 2,
      title: 'System Update',
      message: 'System maintenance scheduled',
      type: 'system',
      read: true,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      category: 'System',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Mention',
      message: 'You were mentioned in a comment',
      type: 'mention',
      read: false,
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      category: 'Social'
    }
  ];

  const defaultProps = {
    notifications: mockNotifications
  };

  beforeEach(() => {
    wrapper = mount(NotificationCenter, {
      props: defaultProps
    });
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component Rendering', () => {
    it('renders correctly with default props', () => {
      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find('.notification-center').exists()).toBe(true);
    });

    it('renders notification button', () => {
      expect(wrapper.find('.notification-button').exists()).toBe(true);
    });

    it('shows unread count badge', () => {
      expect(wrapper.find('.notification-badge').exists()).toBe(true);
      expect(wrapper.text()).toContain('2'); // 2 unread notifications
    });

    it('hides badge when no unread notifications', async () => {
      const readNotifications = mockNotifications.map(n => ({ ...n, read: true }));
      await wrapper.setProps({ notifications: readNotifications });
      expect(wrapper.find('.notification-badge').exists()).toBe(false);
    });
  });

  describe('Panel Toggle', () => {
    it('opens panel when button is clicked', async () => {
      expect(wrapper.find('.notification-panel').exists()).toBe(false);
      
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-panel').exists()).toBe(true);
      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('closes panel when close button is clicked', async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      await wrapper.find('.header-action-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-panel').exists()).toBe(false);
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('closes panel when backdrop is clicked', async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      const backdrop = wrapper.find('.notification-backdrop');
      if (backdrop.exists()) {
        await backdrop.trigger('click');
        await nextTick();
        
        expect(wrapper.vm.isOpen).toBe(false);
      }
    });
  });

  describe('Notification Display', () => {
    beforeEach(async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
    });

    it('displays all notifications', () => {
      const items = wrapper.findAll('.notification-item');
      expect(items).toHaveLength(3);
    });

    it('shows notification titles and messages', () => {
      expect(wrapper.text()).toContain('New Message');
      expect(wrapper.text()).toContain('You have a new message from John');
    });

    it('displays notification timestamps', () => {
      expect(wrapper.text()).toContain('ago');
    });

    it('shows unread indicators', () => {
      const unreadIndicators = wrapper.findAll('.unread-indicator');
      expect(unreadIndicators).toHaveLength(2); // 2 unread notifications
    });

    it('applies correct classes for unread notifications', () => {
      const unreadItems = wrapper.findAll('.notification-item--unread');
      expect(unreadItems).toHaveLength(2);
    });
  });

  describe('Notification Filtering', () => {
    beforeEach(async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
    });

    it('shows filter tabs when showFilters is true', () => {
      expect(wrapper.find('.notification-filters').exists()).toBe(true);
    });

    it('displays correct filter counts', () => {
      const filters = wrapper.findAll('.filter-button');
      expect(filters[0].text()).toContain('All');
      expect(filters[1].text()).toContain('Unread');
      expect(filters[1].text()).toContain('2'); // 2 unread
    });

    it('filters notifications by unread status', async () => {
      const unreadFilter = wrapper.findAll('.filter-button')[1];
      await unreadFilter.trigger('click');
      await nextTick();
      
      const items = wrapper.findAll('.notification-item');
      expect(items).toHaveLength(2); // Only unread notifications
    });

    it('filters notifications by importance', async () => {
      const importantFilter = wrapper.findAll('.filter-button')[2];
      await importantFilter.trigger('click');
      await nextTick();
      
      const items = wrapper.findAll('.notification-item');
      expect(items).toHaveLength(1); // Only important notifications
    });
  });

  describe('Notification Actions', () => {
    beforeEach(async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
    });

    it('emits mark-as-read when mark as read button is clicked', async () => {
      const actionButton = wrapper.find('.action-button');
      if (actionButton.exists()) {
        await actionButton.trigger('click');
        expect(wrapper.emitted('mark-as-read')).toBeTruthy();
      }
    });

    it('emits remove-notification when remove button is clicked', async () => {
      const removeButton = wrapper.find('.action-button--danger');
      if (removeButton.exists()) {
        await removeButton.trigger('click');
        expect(wrapper.emitted('remove-notification')).toBeTruthy();
      }
    });

    it('emits mark-all-as-read when mark all button is clicked', async () => {
      const markAllButton = wrapper.findAll('.header-action-button')[0];
      await markAllButton.trigger('click');
      expect(wrapper.emitted('mark-all-as-read')).toBeTruthy();
    });

    it('emits notification-click when notification is clicked', async () => {
      const notification = wrapper.find('.notification-item');
      await notification.trigger('click');
      expect(wrapper.emitted('notification-click')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when loading is true', async () => {
      await wrapper.setProps({ loading: true });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-loading').exists()).toBe(true);
      expect(wrapper.find('.notification-skeleton').exists()).toBe(true);
    });

    it('shows load more button when hasMore is true', async () => {
      const manyNotifications = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      }));
      
      await wrapper.setProps({ notifications: manyNotifications });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.load-more-button').exists()).toBe(true);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no notifications', async () => {
      await wrapper.setProps({ notifications: [] });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-empty').exists()).toBe(true);
    });

    it('displays custom empty message', async () => {
      const emptyMessage = 'No notifications available';
      await wrapper.setProps({ 
        notifications: [], 
        emptyMessage 
      });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.text()).toContain(emptyMessage);
    });
  });

  describe('Time Formatting', () => {
    it('formats recent times correctly', () => {
      const vm = wrapper.vm;
      const now = new Date();
      
      expect(vm.formatTime(now.toISOString())).toBe('Just now');
      
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      expect(vm.formatTime(fiveMinutesAgo.toISOString())).toBe('5m ago');
      
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(vm.formatTime(twoHoursAgo.toISOString())).toBe('2h ago');
    });

    it('formats older times as dates', () => {
      const vm = wrapper.vm;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const formatted = vm.formatTime(weekAgo.toISOString());
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Icon Mapping', () => {
    it('returns correct icons for notification types', () => {
      const vm = wrapper.vm;
      expect(vm.getNotificationIcon('info')).toBeDefined();
      expect(vm.getNotificationIcon('success')).toBeDefined();
      expect(vm.getNotificationIcon('warning')).toBeDefined();
      expect(vm.getNotificationIcon('error')).toBeDefined();
    });

    it('returns default icon for unknown types', () => {
      const vm = wrapper.vm;
      expect(vm.getNotificationIcon('unknown')).toBeDefined();
    });
  });

  describe('Positioning', () => {
    it('applies correct position classes', async () => {
      await wrapper.setProps({ position: 'bottom-left' });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-panel--bottom-left').exists()).toBe(true);
    });

    it('handles all position variants', async () => {
      const positions = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];
      
      for (const position of positions) {
        await wrapper.setProps({ position });
        await wrapper.find('.notification-button').trigger('click');
        await nextTick();
        
        expect(wrapper.find(`.notification-panel--${position}`).exists()).toBe(true);
        
        // Close panel for next iteration
        await wrapper.find('.notification-button').trigger('click');
        await nextTick();
      }
    });
  });

  describe('Size Variants', () => {
    it('applies correct size classes', async () => {
      await wrapper.setProps({ size: 'lg' });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      expect(wrapper.find('.notification-panel--lg').exists()).toBe(true);
    });

    it('handles all size variants', async () => {
      const sizes = ['sm', 'md', 'lg'];
      
      for (const size of sizes) {
        await wrapper.setProps({ size });
        await wrapper.find('.notification-button').trigger('click');
        await nextTick();
        
        expect(wrapper.find(`.notification-panel--${size}`).exists()).toBe(true);
        
        // Close panel for next iteration
        await wrapper.find('.notification-button').trigger('click');
        await nextTick();
      }
    });
  });

  describe('Auto-refresh', () => {
    it('sets up auto-refresh when enabled', () => {
      const wrapper = mount(NotificationCenter, {
        props: {
          ...defaultProps,
          autoRefresh: true,
          refreshInterval: 1000
        }
      });
      
      expect(wrapper.vm.refreshTimer).toBeDefined();
      wrapper.unmount();
    });

    it('clears auto-refresh when disabled', async () => {
      await wrapper.setProps({ autoRefresh: false });
      expect(wrapper.vm.refreshTimer).toBeNull();
    });
  });

  describe('Real-time Updates', () => {
    it('detects new notifications', async () => {
      const newNotifications = [
        ...mockNotifications,
        {
          id: 4,
          title: 'New Notification',
          message: 'This is a new notification',
          type: 'info',
          read: false,
          timestamp: new Date().toISOString()
        }
      ];
      
      await wrapper.setProps({ notifications: newNotifications });
      expect(wrapper.vm.hasNewNotifications).toBe(true);
    });

    it('shows pulse animation for new notifications', async () => {
      wrapper.vm.hasNewNotifications = true;
      await nextTick();
      
      expect(wrapper.find('.notification-badge--pulse').exists()).toBe(true);
      expect(wrapper.find('.notification-pulse').exists()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('calculates unread count correctly', () => {
      expect(wrapper.vm.unreadCount).toBe(2);
    });

    it('calculates important count correctly', () => {
      expect(wrapper.vm.importantCount).toBe(1);
    });

    it('calculates mention count correctly', () => {
      expect(wrapper.vm.mentionCount).toBe(1);
    });

    it('filters notifications correctly', () => {
      expect(wrapper.vm.filteredNotifications).toHaveLength(3);
      
      wrapper.vm.activeFilter = 'unread';
      expect(wrapper.vm.filteredNotifications).toHaveLength(2);
    });
  });

  describe('Event Handling', () => {
    it('handles click outside to close panel', async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      // Simulate click outside
      const event = new Event('click');
      Object.defineProperty(event, 'target', {
        value: document.body,
        enumerable: true
      });
      
      wrapper.vm.handleClickOutside(event);
      await nextTick();
      
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('does not close panel when clicking inside', async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      const panel = wrapper.find('.notification-panel');
      const event = new Event('click');
      Object.defineProperty(event, 'target', {
        value: panel.element,
        enumerable: true
      });
      
      wrapper.vm.handleClickOutside(event);
      await nextTick();
      
      expect(wrapper.vm.isOpen).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      const button = wrapper.find('.notification-button');
      expect(button.attributes('aria-expanded')).toBe('false');
      expect(button.attributes('aria-haspopup')).toBe('true');
      expect(button.attributes('aria-label')).toContain('Notifications');
    });

    it('updates ARIA attributes when panel opens', async () => {
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      const button = wrapper.find('.notification-button');
      expect(button.attributes('aria-expanded')).toBe('true');
    });

    it('includes unread count in aria-label', () => {
      const button = wrapper.find('.notification-button');
      expect(button.attributes('aria-label')).toContain('(2 unread)');
    });
  });

  describe('Performance', () => {
    it('handles large numbers of notifications efficiently', async () => {
      const largeNotificationSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        type: 'info',
        read: i % 2 === 0,
        timestamp: new Date(Date.now() - i * 1000).toISOString()
      }));
      
      const startTime = performance.now();
      await wrapper.setProps({ notifications: largeNotificationSet });
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('limits displayed notifications for performance', async () => {
      const manyNotifications = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message ${i + 1}`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      }));
      
      await wrapper.setProps({ notifications: manyNotifications, maxDisplayed: 10 });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      const items = wrapper.findAll('.notification-item');
      expect(items).toHaveLength(10);
    });
  });

  describe('Memory Management', () => {
    it('cleans up timers on unmount', () => {
      const wrapper = mount(NotificationCenter, {
        props: {
          ...defaultProps,
          autoRefresh: true,
          refreshInterval: 1000
        }
      });
      
      const timer = wrapper.vm.refreshTimer;
      wrapper.unmount();
      
      // Timer should be cleared
      expect(wrapper.vm.refreshTimer).toBeNull();
    });

    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      wrapper.unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('handles empty notification data gracefully', async () => {
      await wrapper.setProps({ notifications: null });
      expect(wrapper.vm.unreadCount).toBe(0);
    });

    it('handles malformed notification objects', async () => {
      const malformedNotifications = [
        { id: 1 }, // Missing required fields
        null,
        undefined,
        { id: 2, title: 'Valid', message: 'Valid', type: 'info', read: false, timestamp: new Date().toISOString() }
      ];
      
      await wrapper.setProps({ notifications: malformedNotifications });
      // Should not throw errors
      expect(wrapper.exists()).toBe(true);
    });

    it('handles invalid timestamps gracefully', async () => {
      const invalidTimestampNotifications = [{
        id: 1,
        title: 'Test',
        message: 'Test message',
        type: 'info',
        read: false,
        timestamp: 'invalid-date'
      }];
      
      await wrapper.setProps({ notifications: invalidTimestampNotifications });
      await wrapper.find('.notification-button').trigger('click');
      await nextTick();
      
      // Should still render without crashing
      expect(wrapper.find('.notification-item').exists()).toBe(true);
    });
  });
});