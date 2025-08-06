import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import { designTokens } from './resources/js/config/designTokens.js';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.vue',
    ],

    theme: {
        extend: {
            // Typography
            fontFamily: {
                sans: designTokens.typography.fontFamily.sans,
                mono: designTokens.typography.fontFamily.mono,
            },
            fontSize: designTokens.typography.fontSize,
            fontWeight: designTokens.typography.fontWeight,
            letterSpacing: designTokens.typography.letterSpacing,
            
            // Colors
            colors: {
                primary: designTokens.colors.primary,
                secondary: designTokens.colors.secondary,
                accent: designTokens.colors.accent,
                neutral: designTokens.colors.neutral,
                success: designTokens.colors.success,
                warning: designTokens.colors.warning,
                error: designTokens.colors.error,
                info: designTokens.colors.info,
            },
            
            // Spacing
            spacing: designTokens.spacing,
            
            // Border Radius
            borderRadius: designTokens.borderRadius,
            
            // Box Shadow
            boxShadow: designTokens.boxShadow,
            
            // Animation
            transitionDuration: designTokens.animation.duration,
            transitionTimingFunction: designTokens.animation.easing,
            
            // Z-index
            zIndex: designTokens.zIndex,
        },
    },

    plugins: [forms],
};
