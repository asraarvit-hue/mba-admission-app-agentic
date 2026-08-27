import { calculateEligibility } from "./eligibilityAgent";

function runTests() {
  const tests = [
    { class10: 5, class12: 60, expected: false },
    { class10: 60, class12: 59.99, expected: false },
    { class10: 60, class12: 60, expected: true },
    { class10: 100, class12: 100, expected: true },
    { class10: 78, class12: 82, expected: true },
    { class10: null, class12: 80, expected: false },
  ];

  console.log("Running Eligibility Agent Tests...\n");
  let passed = 0;

  tests.forEach((t, i) => {
    const result = calculateEligibility({
      class10Percentage: t.class10,
      class12Percentage: t.class12,
    });

    const isPass = result.isEligible === t.expected;
    if (isPass) passed++;

    console.log(`Test ${i + 1}: ${t.class10} / ${t.class12}`);
    console.log(`Expected: ${t.expected} | Got: ${result.isEligible}`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Result: ${isPass ? "✅ PASS" : "❌ FAIL"}\n`);
  });

  console.log(`\nPassed ${passed} / ${tests.length} tests.`);
}

runTests();
