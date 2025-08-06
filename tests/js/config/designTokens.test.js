import { describe, it, expect } from 'vitest';
import { 
  designTokens, 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  boxShadow, 
  animation,
  components,
  icons,
  zIndex
} from '@/config/designTokens';

describe('Design Tokens', () => {
  describe('Color System', () => {
    it('should have complete color scales', () => {
      const colorCategories = ['primary', 'secondary', 'accent', 'neutral', 'success', 'warning', 'error', 'info'];
      
      colorCategories.forEach(category => {
        expect(colors[category]).toBeDefined();
        expect(colors[category]).toHaveProperty('50');
        expect(colors[category]).toHaveProperty('500'); // Main color
        expect(colors[category]).toHaveProperty('900');
      });
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      Object.values(colors.primary).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });

    it('should have consistent color progression', () => {
      // Test that colors get darker as numbers increase
      const primary = colors.primary;
      
      // Convert hex to brightness value for comparison
      const getBrightness = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
      };
      
      const brightness50 = getBrightness(primary[50]);
      const brightness500 = getBrightness(primary[500]);
      const brightness900 = getBrightness(primary[900]);
      
      expect(brightness50).toBeGreaterThan(brightness500);
      expect(brightness500).toBeGreaterThan(brightness900);
    });

    it('should export individual color categories', () => {
      expect(colors).toBe(designTokens.colors);
      expect(colors.primary).toEqual(designTokens.colors.primary);
    });
  });

  describe('Typography System', () => {
    it('should have font family definitions', () => {
      expect(typography.fontFamily.sans).toBeDefined();
      expect(typography.fontFamily.mono).toBeDefined();
      expect(Array.isArray(typography.fontFamily.sans)).toBe(true);
      expect(typography.fontFamily.sans[0]).toBe('Inter');
    });

    it('should have complete font size scale', () => {
      const expectedSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
      
      expectedSizes.forEach(size => {
        expect(typography.fontSize[size]).toBeDefined();
        expect(Array.isArray(typography.fontSize[size])).toBe(true);
        expect(typography.fontSize[size]).toHaveLength(2);
        expect(typeof typography.fontSize[size][0]).toBe('string'); // Size value
        expect(typeof typography.fontSize[size][1]).toBe('object'); // Line height and weight
      });
    });

    it('should have font weight definitions', () => {
      const expectedWeights = ['normal', 'medium', 'semibold', 'bold'];
      
      expectedWeights.forEach(weight => {
        expect(typography.fontWeight[weight]).toBeDefined();
        expect(typeof typography.fontWeight[weight]).toBe('string');
      });
    });

    it('should have letter spacing definitions', () => {
      expect(typography.letterSpacing.tight).toBe('-0.025em');
      expect(typography.letterSpacing.normal).toBe('0em');
      expect(typography.letterSpacing.wide).toBe('0.025em');
    });
  });

  describe('Spacing System', () => {
    it('should follow 4px grid system', () => {
      const spacingValues = Object.values(spacing);
      
      spacingValues.forEach(value => {
        if (value !== '0px') {
          const numericValue = parseInt(value);
          expect(numericValue % 4).toBe(0); // Should be divisible by 4
        }
      });
    });

    it('should have consistent spacing progression', () => {
      expect(spacing[0]).toBe('0px');
      expect(spacing[1]).toBe('4px');
      expect(spacing[2]).toBe('8px');
      expect(spacing[4]).toBe('16px');
      expect(spacing[8]).toBe('32px');
    });

    it('should export spacing tokens', () => {
      expect(spacing).toBe(designTokens.spacing);
    });
  });

  describe('Border Radius System', () => {
    it('should have complete border radius scale', () => {
      const expectedRadii = ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'full'];
      
      expectedRadii.forEach(radius => {
        expect(borderRadius[radius]).toBeDefined();
        expect(typeof borderRadius[radius]).toBe('string');
      });
    });

    it('should have proper radius values', () => {
      expect(borderRadius.none).toBe('0px');
      expect(borderRadius.full).toBe('9999px');
      expect(borderRadius.base).toBe('8px');
    });
  });

  describe('Shadow System', () => {
    it('should have complete shadow scale', () => {
      const expectedShadows = ['sm', 'base', 'md', 'lg', 'xl', '2xl', 'inner'];
      
      expectedShadows.forEach(shadow => {
        expect(boxShadow[shadow]).toBeDefined();
        expect(typeof boxShadow[shadow]).toBe('string');
        expect(boxShadow[shadow]).toContain('rgb');
      });
    });

    it('should have valid CSS shadow values', () => {
      // Test that shadow values are valid CSS
      Object.values(boxShadow).forEach(shadow => {
        expect(shadow).toMatch(/^(inset\s+)?[\d\s\-\.]+px[\s\d\-\.px,]+rgb\(/);
      });
    });
  });

  describe('Animation System', () => {
    it('should have duration tokens', () => {
      expect(animation.duration.fast).toBe('150ms');
      expect(animation.duration.normal).toBe('200ms');
      expect(animation.duration.slow).toBe('300ms');
      expect(animation.duration.slower).toBe('500ms');
    });

    it('should have easing tokens', () => {
      expect(animation.easing.linear).toBe('linear');
      expect(animation.easing.ease).toBe('ease');
      expect(animation.easing.easeInOut).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });

    it('should have valid CSS timing functions', () => {
      Object.values(animation.easing).forEach(easing => {
        expect(typeof easing).toBe('string');
        expect(easing.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Tokens', () => {
    it('should have button component tokens', () => {
      expect(components.button.height).toBeDefined();
      expect(components.button.padding).toBeDefined();
      
      const expectedSizes = ['sm', 'md', 'lg', 'xl'];
      expectedSizes.forEach(size => {
        expect(components.button.height[size]).toBeDefined();
        expect(components.button.padding[size]).toBeDefined();
      });
    });

    it('should have input component tokens', () => {
      expect(components.input.height).toBeDefined();
      expect(components.input.padding).toBeDefined();
      
      const expectedSizes = ['sm', 'md', 'lg'];
      expectedSizes.forEach(size => {
        expect(components.input.height[size]).toBeDefined();
        expect(components.input.padding[size]).toBeDefined();
      });
    });

    it('should have card component tokens', () => {
      expect(components.card.padding).toBeDefined();
      
      const expectedSizes = ['sm', 'md', 'lg'];
      expectedSizes.forEach(size => {
        expect(components.card.padding[size]).toBeDefined();
      });
    });
  });

  describe('Icon System', () => {
    it('should have icon size tokens', () => {
      const expectedSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      
      expectedSizes.forEach(size => {
        expect(icons.size[size]).toBeDefined();
        expect(typeof icons.size[size]).toBe('string');
        expect(icons.size[size]).toMatch(/^\d+px$/);
      });
    });

    it('should have progressive icon sizes', () => {
      const sizes = icons.size;
      expect(parseInt(sizes.xs)).toBeLessThan(parseInt(sizes.sm));
      expect(parseInt(sizes.sm)).toBeLessThan(parseInt(sizes.md));
      expect(parseInt(sizes.md)).toBeLessThan(parseInt(sizes.lg));
    });
  });

  describe('Z-Index System', () => {
    it('should have complete z-index scale', () => {
      const expectedLayers = [
        'hide', 'auto', 'base', 'docked', 'dropdown', 'sticky', 
        'banner', 'overlay', 'modal', 'popover', 'skipLink', 'toast', 'tooltip'
      ];
      
      expectedLayers.forEach(layer => {
        expect(zIndex[layer]).toBeDefined();
      });
    });

    it('should have proper z-index hierarchy', () => {
      expect(zIndex.hide).toBe(-1);
      expect(zIndex.base).toBe(0);
      expect(zIndex.modal).toBeGreaterThan(zIndex.overlay);
      expect(zIndex.tooltip).toBeGreaterThan(zIndex.modal);
    });

    it('should have reasonable z-index values', () => {
      Object.entries(zIndex).forEach(([key, value]) => {
        if (key !== 'auto' && key !== 'hide') {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(10000); // Reasonable upper limit
        }
      });
    });
  });

  describe('Token Exports', () => {
    it('should export all token categories', () => {
      expect(colors).toBeDefined();
      expect(typography).toBeDefined();
      expect(spacing).toBeDefined();
      expect(borderRadius).toBeDefined();
      expect(boxShadow).toBeDefined();
      expect(animation).toBeDefined();
      expect(components).toBeDefined();
      expect(icons).toBeDefined();
      expect(zIndex).toBeDefined();
    });

    it('should export complete design tokens object', () => {
      expect(designTokens).toHaveProperty('colors');
      expect(designTokens).toHaveProperty('typography');
      expect(designTokens).toHaveProperty('spacing');
      expect(designTokens).toHaveProperty('borderRadius');
      expect(designTokens).toHaveProperty('boxShadow');
      expect(designTokens).toHaveProperty('animation');
      expect(designTokens).toHaveProperty('components');
      expect(designTokens).toHaveProperty('icons');
      expect(designTokens).toHaveProperty('zIndex');
    });

    it('should have consistent references', () => {
      expect(colors).toBe(designTokens.colors);
      expect(typography).toBe(designTokens.typography);
      expect(spacing).toBe(designTokens.spacing);
    });
  });

  describe('Token Consistency', () => {
    it('should use consistent naming conventions', () => {
      // Test that all color scales use the same numeric keys
      const colorScales = [colors.primary, colors.secondary, colors.neutral];
      const expectedKeys = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
      
      colorScales.forEach(scale => {
        expectedKeys.forEach(key => {
          expect(scale[key]).toBeDefined();
        });
      });
    });

    it('should have consistent component sizing', () => {
      // Test that components use consistent size naming
      const buttonSizes = Object.keys(components.button.height);
      const inputSizes = Object.keys(components.input.height);
      
      // Common sizes should exist in both
      ['sm', 'md', 'lg'].forEach(size => {
        expect(buttonSizes).toContain(size);
        expect(inputSizes).toContain(size);
      });
    });
  });
});