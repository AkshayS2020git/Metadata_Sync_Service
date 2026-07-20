const test = require("node:test");
const assert = require("node:assert/strict");

const { mergeMetadata } = require("../src/helpers/metadataMerge.helper");

const testData = {
  suite: "Regression",
  cases: [{ id: "TC_1", title: "Login" }],
};

test("appends FEATURE execution data without changing testData", () => {
  const result = mergeMetadata(
    { testData },
    { label: "Run", status: "passed", executedBy: "A", executedAt: "now" },
    "FEATURE",
    "TC_1",
  );

  assert.deepEqual(result.executionData, [{
    label: "Run", status: "passed", executedBy: "A", executedAt: "now", case_ref_id: "TC_1",
  }]);
  assert.strictEqual(result.testData, testData);
  assert.deepEqual(Object.keys(result), ["executionData", "testData"]);
});

test("updates only the matching FEATURE testcase execution", () => {
  const result = mergeMetadata(
    {
      executionData: [
        { case_ref_id: "TC_1", status: "failed" },
        { case_ref_id: "TC_2", status: "passed" },
      ],
      testData,
    },
    { label: "Retry", status: "passed", executedBy: "B", executedAt: "later" },
    "FEATURE",
    "TC_1",
  );

  assert.deepEqual(result.executionData, [
    { label: "Retry", status: "passed", executedBy: "B", executedAt: "later", case_ref_id: "TC_1" },
    { case_ref_id: "TC_2", status: "passed" },
  ]);
  assert.strictEqual(result.testData, testData);
});

test("replaces TESTCASE execution data while preserving testData", () => {
  const result = mergeMetadata(
    { executionData: { status: "failed" }, testData },
    { label: "Run", status: "passed", executedBy: "A", executedAt: "now" },
    "TESTCASE",
    "TC_1",
  );

  assert.deepEqual(result.executionData, {
    label: "Run", status: "passed", executedBy: "A", executedAt: "now", case_ref_id: "TC_1",
  });
  assert.strictEqual(result.testData, testData);
  assert.deepEqual(Object.keys(result), ["executionData", "testData"]);
});
