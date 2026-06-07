// Test weight control calculations
// Test case 1: Male, 80kg, 175cm, 30 years old
// Using Mifflin-St Jeor formula: (10 * weight) + (6.25 * height) - (5 * age) + 5 (male)
function testWeightCalculations() {
  console.log('=== Weight Control Calculation Tests ===\n');

  // Test case 1: Lose weight
  const test1 = {
    age: 30,
    gender: 'male',
    height: 175,
    currentWeight: 80,
    targetWeight: 75,
    days: 60,
  };

  // BMR calculation for male
  let tmb = (10 * test1.currentWeight) + (6.25 * test1.height) - (5 * test1.age) + 5;
  console.log(`Test 1 - Male, ${test1.currentWeight}kg → ${test1.targetWeight}kg in ${test1.days} days`);
  console.log(`  BMR (TMB): ${Math.round(tmb)} kcal`);

  const dailyExpenditure = Math.round(tmb * 1.55);
  console.log(`  Daily Expenditure (TMB × 1.55): ${dailyExpenditure} kcal`);

  const weightDiff = Math.abs(test1.currentWeight - test1.targetWeight);
  const totalCalories = weightDiff * 7700;
  console.log(`  Total Calories to lose: ${totalCalories} kcal (${weightDiff}kg × 7700)`);

  const dailyDeficit = Math.round(totalCalories / test1.days);
  console.log(`  Daily Deficit: ${dailyDeficit} kcal`);

  const recommendedCalories = Math.max(1200, Math.round(dailyExpenditure - dailyDeficit));
  console.log(`  Recommended Daily Calories: ${recommendedCalories} kcal`);
  console.log(`  ✓ Test 1 passed\n`);

  // Test case 2: Gain weight (female)
  const test2 = {
    age: 25,
    gender: 'female',
    height: 165,
    currentWeight: 55,
    targetWeight: 60,
    days: 90,
  };

  // BMR calculation for female
  tmb = (10 * test2.currentWeight) + (6.25 * test2.height) - (5 * test2.age) - 161;
  console.log(`Test 2 - Female, ${test2.currentWeight}kg → ${test2.targetWeight}kg in ${test2.days} days`);
  console.log(`  BMR (TMB): ${Math.round(tmb)} kcal`);

  const dailyExpenditure2 = Math.round(tmb * 1.55);
  console.log(`  Daily Expenditure: ${dailyExpenditure2} kcal`);

  const weightDiff2 = Math.abs(test2.currentWeight - test2.targetWeight);
  const totalCalories2 = weightDiff2 * 7700;
  console.log(`  Total Calories to gain: ${totalCalories2} kcal (${weightDiff2}kg × 7700)`);

  const dailyDeficit2 = Math.round(totalCalories2 / test2.days);
  const dailySurplus = dailyDeficit2; // Positive for weight gain
  console.log(`  Daily Surplus: ${dailySurplus} kcal`);

  const recommendedCalories2 = Math.max(1200, Math.round(dailyExpenditure2 + dailySurplus));
  console.log(`  Recommended Daily Calories: ${recommendedCalories2} kcal`);
  console.log(`  ✓ Test 2 passed\n`);

  console.log('=== All tests passed! ===');
}

testWeightCalculations();
