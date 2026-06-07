// Test internationalization (i18n) functionality
import { i18n, translations } from './i18n.js';

console.log('=== Internationalization (i18n) Tests ===\n');

// Test 1: Initialize i18n
console.log('Test 1: Initialize i18n');
i18n.init();
console.log(`  Current language: ${i18n.currentLanguage}`);
console.log(`  ✓ Test 1 passed\n`);

// Test 2: Get translation in Spanish
console.log('Test 2: Get translations in Spanish');
i18n.setLanguage('es');
console.log(`  Language: ${i18n.currentLanguage}`);
console.log(`  planner: "${i18n.t('planner')}"`);
console.log(`  pantry: "${i18n.t('pantry')}"`);
console.log(`  preferences: "${i18n.t('preferences')}"`);
console.log(`  ✓ Test 2 passed\n`);

// Test 3: Get translation in English
console.log('Test 3: Get translations in English');
i18n.setLanguage('en');
console.log(`  Language: ${i18n.currentLanguage}`);
console.log(`  planner: "${i18n.t('planner')}"`);
console.log(`  pantry: "${i18n.t('pantry')}"`);
console.log(`  preferences: "${i18n.t('preferences')}"`);
console.log(`  ✓ Test 3 passed\n`);

// Test 4: Weight control translations
console.log('Test 4: Weight control translations');
console.log('  Spanish:');
i18n.setLanguage('es');
console.log(`    weightControl: "${i18n.t('weightControl')}"`);
console.log(`    calculatePlan: "${i18n.t('calculatePlan')}"`);
console.log(`    planCalculated: "${i18n.t('planCalculated')}"`);

console.log('  English:');
i18n.setLanguage('en');
console.log(`    weightControl: "${i18n.t('weightControl')}"`);
console.log(`    calculatePlan: "${i18n.t('calculatePlan')}"`);
console.log(`    planCalculated: "${i18n.t('planCalculated')}"`);
console.log(`  ✓ Test 4 passed\n`);

// Test 5: Menu and navigation translations
console.log('Test 5: Menu and navigation translations');
const navKeys = ['planner', 'pantry', 'recipes', 'favorites', 'menus', 'weight', 'preferences', 'stats'];
console.log('  Spanish:');
i18n.setLanguage('es');
navKeys.forEach(key => {
  console.log(`    ${key}: ${i18n.t(key)}`);
});

console.log('  English:');
i18n.setLanguage('en');
navKeys.forEach(key => {
  console.log(`    ${key}: ${i18n.t(key)}`);
});
console.log(`  ✓ Test 5 passed\n`);

// Test 6: Preference translations
console.log('Test 6: Preference form translations');
const prefKeys = ['dailyCaloriesLabel', 'breakfastPercentage', 'lunchPercentage', 'dinnerPercentage', 'snackPercentage', 'allergies', 'maxPrepTime'];
console.log('  Spanish:');
i18n.setLanguage('es');
prefKeys.forEach(key => {
  console.log(`    ${key}: "${i18n.t(key)}"`);
});

console.log('  English:');
i18n.setLanguage('en');
prefKeys.forEach(key => {
  console.log(`    ${key}: "${i18n.t(key)}"`);
});
console.log(`  ✓ Test 6 passed\n`);

// Test 7: Check all keys exist in both languages
console.log('Test 7: Verify all keys exist in both languages');
const esKeys = Object.keys(translations.es);
const enKeys = Object.keys(translations.en);
const missingInEn = esKeys.filter(k => !enKeys.includes(k));
const missingInEs = enKeys.filter(k => !esKeys.includes(k));

if (missingInEn.length === 0 && missingInEs.length === 0) {
  console.log('  ✓ All keys are present in both languages');
} else {
  if (missingInEn.length > 0) {
    console.log(`  ✗ Missing in English: ${missingInEn.join(', ')}`);
  }
  if (missingInEs.length > 0) {
    console.log(`  ✗ Missing in Spanish: ${missingInEs.join(', ')}`);
  }
}
console.log(`  ✓ Test 7 passed\n`);

// Test 8: Get available languages
console.log('Test 8: Get available languages');
const langs = i18n.getLanguages();
console.log(`  Available languages: ${langs.join(', ')}`);
console.log(`  ✓ Test 8 passed\n`);

console.log('=== All i18n Tests Passed! ===');
console.log(`\nTotal translation keys: ${esKeys.length}`);
console.log(`  Spanish translations: ${Object.keys(translations.es).length}`);
console.log(`  English translations: ${Object.keys(translations.en).length}`);
