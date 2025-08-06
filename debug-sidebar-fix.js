// Emergency sidebar fix - run this in browser console
console.log('🔧 Starting emergency sidebar cleanup...');

// Find all possible sidebar elements
const selectors = [
  '[data-debug="sidebar-navigation-component"]',
  '.sidebar-navigation',
  'nav[aria-label="Main navigation"]',
  'nav[role="navigation"]',
  '.fixed.left-0.top-0.z-40',
  '.flex.flex-col.h-screen.fixed.left-0.top-0'
];

let totalFound = 0;
let totalRemoved = 0;

selectors.forEach((selector, index) => {
  const elements = document.querySelectorAll(selector);
  console.log(`Selector ${index + 1} (${selector}): Found ${elements.length} elements`);
  
  totalFound += elements.length;
  
  // Keep only the first element, remove the rest
  elements.forEach((element, elementIndex) => {
    if (elementIndex > 0) {
      console.log(`  Removing duplicate ${elementIndex}:`, element);
      element.remove();
      totalRemoved++;
    } else {
      console.log(`  Keeping first element:`, element);
    }
  });
});

console.log(`✅ Cleanup complete: Found ${totalFound} elements, removed ${totalRemoved} duplicates`);

// Double-check for any remaining duplicates
setTimeout(() => {
  const remaining = document.querySelectorAll('[data-debug="sidebar-navigation-component"]');
  console.log(`🔍 Final check: ${remaining.length} sidebar(s) remaining`);
  
  if (remaining.length > 1) {
    console.warn('⚠️ Still multiple sidebars detected, applying nuclear option...');
    remaining.forEach((sidebar, index) => {
      if (index > 0) {
        sidebar.style.display = 'none !important';
        sidebar.style.visibility = 'hidden !important';
        sidebar.style.opacity = '0 !important';
        console.log(`Hidden duplicate sidebar ${index}`);
      }
    });
  } else {
    console.log('🎉 Success! Only one sidebar remaining.');
  }
}, 500);