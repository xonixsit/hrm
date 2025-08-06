import { describe, it, expect } from 'vitest';

describe('Icons Configuration', () => {
  it('can import and use icon configuration', async () => {
    const { iconMap, getIcon } = await import('@/config/icons.js');
    
    expect(iconMap).toBeDefined();
    expect(typeof iconMap).toBe('object');
    
    expect(getIcon).toBeDefined();
    expect(typeof getIcon).toBe('function');
    
    // Test a few basic icons
    expect(iconMap.home).toBeDefined();
    expect(iconMap.user).toBeDefined();
    expect(iconMap.settings).toBeDefined();
    
    // Test getIcon function
    expect(getIcon('home')).toBe(iconMap.home);
    expect(getIcon('nonexistent')).toBeNull();
  });
});