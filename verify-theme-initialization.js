/**
 * Theme System Initialization Verification
 * 
 * This script verifies that the theme system is properly initialized
 * and that theme classes are being applied to the document root.
 */

console.log('🔍 Theme System Initialization Verification');
console.log('='.repeat(50));

// Check if we're in a browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  
  // Function to check theme state
  const checkThemeState = () => {
    const root = document.documentElement;
    const hasLightClass = root.classList.contains('theme-light');
    const hasDarkClass = root.classList.contains('theme-dark');
    
    console.log('📊 Document Root Theme Classes:');
    console.log(`  • theme-light: ${hasLightClass ? '✅' : '❌'}`);
    console.log(`  • theme-dark: ${hasDarkClass ? '✅' : '❌'}`);
    
    // Check CSS custom properties
    const computedStyle = getComputedStyle(root);
    const neutralColor = computedStyle.getPropertyValue('--color-neutral-50').trim();
    const primaryColor = computedStyle.getPropertyValue('--color-primary-500').trim();
    
    console.log('🎨 CSS Custom Properties:');
    console.log(`  • --color-neutral-50: ${neutralColor || 'Not found'}`);
    console.log(`  • --color-primary-500: ${primaryColor || 'Not found'}`);
    
    // Determine current theme
    let currentTheme = 'unknown';
    if (hasLightClass && !hasDarkClass) {
      currentTheme = 'light';
    } else if (hasDarkClass && !hasLightClass) {
      currentTheme = 'dark';
    } else if (hasLightClass && hasDarkClass) {
      currentTheme = 'conflicted (both classes present)';
    }
    
    console.log(`🌟 Current Theme: ${currentTheme}`);
    
    return {
      hasLightClass,
      hasDarkClass,
      currentTheme,
      hasCustomProperties: !!(neutralColor && primaryColor)
    };
  };
  
  // Initial check
  console.log('⏰ Initial Theme State Check:');
  const initialState = checkThemeState();
  
  // Wait for potential theme initialization
  setTimeout(() => {
    console.log('\n⏰ After 1 Second (Post-Initialization):');
    const postInitState = checkThemeState();
    
    // Compare states
    console.log('\n📈 State Comparison:');
    if (initialState.currentTheme !== postInitState.currentTheme) {
      console.log(`  • Theme changed: ${initialState.currentTheme} → ${postInitState.currentTheme}`);
    } else {
      console.log(`  • Theme remained: ${postInitState.currentTheme}`);
    }
    
    // Verification results
    console.log('\n🎯 Verification Results:');
    
    if (postInitState.currentTheme === 'light') {
      console.log('✅ SUCCESS: Theme system is working correctly!');
      console.log('   • Light theme is properly applied');
      console.log('   • Document root has correct theme class');
    } else if (postInitState.currentTheme === 'dark') {
      console.log('⚠️  NOTICE: Dark theme is applied');
      console.log('   • This might be expected based on user preference');
      console.log('   • Theme system appears to be working');
    } else if (postInitState.currentTheme === 'conflicted (both classes present)') {
      console.log('❌ ISSUE: Multiple theme classes detected');
      console.log('   • Both theme-light and theme-dark are present');
      console.log('   • This indicates a cleanup issue');
    } else {
      console.log('❌ ISSUE: No theme classes found');
      console.log('   • Theme system may not be initialized');
      console.log('   • Check if initializeTheme() is being called');
    }
    
    if (postInitState.hasCustomProperties) {
      console.log('✅ CSS custom properties are available');
    } else {
      console.log('❌ CSS custom properties are missing');
    }
    
    // Additional diagnostics
    console.log('\n🔧 Additional Diagnostics:');
    
    // Check if body has theme-related classes
    const bodyClasses = Array.from(document.body.classList);
    const themeRelatedBodyClasses = bodyClasses.filter(cls => 
      cls.includes('theme') || cls.includes('dark') || cls.includes('light')
    );
    
    if (themeRelatedBodyClasses.length > 0) {
      console.log(`  • Body theme classes: ${themeRelatedBodyClasses.join(', ')}`);
    } else {
      console.log('  • No theme classes found on body element');
    }
    
    // Check for potential CSS conflicts
    const allRootClasses = Array.from(root.classList);
    console.log(`  • All root classes: ${allRootClasses.join(', ') || 'None'}`);
    
    // Final recommendation
    console.log('\n💡 Recommendations:');
    if (postInitState.currentTheme === 'light' && postInitState.hasCustomProperties) {
      console.log('   • Theme system is working correctly');
      console.log('   • Components should now inherit proper theme styling');
      console.log('   • The persistent dark theme issue should be resolved');
    } else {
      console.log('   • Theme system needs further investigation');
      console.log('   • Check AuthenticatedLayout.vue for proper initializeTheme() call');
      console.log('   • Verify useTheme composable is working correctly');
    }
    
  }, 1000);
  
} else {
  console.log('❌ Not in browser environment - cannot verify theme state');
}

console.log('\n📝 Note: This verification should be run in the browser console');
console.log('   after the application has loaded and mounted.');