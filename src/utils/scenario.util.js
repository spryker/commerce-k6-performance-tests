export function createDefaultScenario(testConfiguration) {
  return {
    tags: {
      testId: testConfiguration.id,
      testGroup: testConfiguration.group,
    },
    executor: testConfiguration.executor,
    vus: testConfiguration.vus,
    iterations: testConfiguration.iterations,
  };
}
