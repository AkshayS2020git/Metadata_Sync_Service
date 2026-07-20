const test = require("node:test");
const assert = require("node:assert/strict");

const { resolveRunParent } = require("../src/helpers/runParentDiscovery.helper");

test("returns the feature folder for FEATURE repositories with a valid Run", () => {
  const result = resolveRunParent(
    { type: "FEATURE", runDirectories: ["Run1", "Run2"], testcaseDirectories: [] },
    "Feature",
    "Run2",
  );

  assert.deepEqual(result, {
    runParentPath: "Feature/",
    repositoryType: "FEATURE",
  });
});

test("returns the testcase folder for TESTCASE repositories", () => {
  const result = resolveRunParent(
    { type: "TESTCASE", runDirectories: [], testcaseDirectories: ["TC_1", "TC_2"] },
    "Feature/",
    "Run1",
    "TC_2",
  );

  assert.deepEqual(result, {
    runParentPath: "Feature/TC_2/",
    repositoryType: "TESTCASE",
  });
});

test("rejects UNKNOWN repositories", () => {
  assert.throws(
    () => resolveRunParent({ type: "UNKNOWN" }, "Feature", "Run1"),
    /repository type "UNKNOWN" is unsupported/i,
  );
});

test("requires case_ref_id for TESTCASE repositories", () => {
  assert.throws(
    () => resolveRunParent(
      { type: "TESTCASE", testcaseDirectories: ["TC_1"] },
      "Feature",
      "Run1",
    ),
    /case_ref_id is required/i,
  );
});

test("rejects a testcase directory not returned by discovery", () => {
  assert.throws(
    () => resolveRunParent(
      { type: "TESTCASE", testcaseDirectories: ["TC_1"] },
      "Feature",
      "Run1",
      "TC_2",
    ),
    /Testcase directory "TC_2" does not exist/i,
  );
});
