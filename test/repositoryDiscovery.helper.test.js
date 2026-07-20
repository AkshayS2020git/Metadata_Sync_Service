const test = require("node:test");
const assert = require("node:assert/strict");

const {
  discoverRepositoryType,
} = require("../src/helpers/repositoryDiscovery.helper");

test("discovers FEATURE from immediate Run directories and ignores files", async () => {
  const result = await discoverRepositoryType(
    "bucket",
    "Test_Plan/V1/Feature A",
    async () => [
      { prefix: "Test_Plan/V1/Feature A/Run1/" },
      { prefix: "Test_Plan/V1/Feature A/Run2/" },
      { name: "Test_Plan/V1/Feature A/README.md" },
      { name: "Test_Plan/V1/Feature A/metadata.json" },
      { prefix: "Test_Plan/V1/Feature A/Run1/artifacts/" },
    ],
  );

  assert.deepEqual(result, {
    type: "FEATURE",
    directories: ["Run1", "Run2"],
    runDirectories: ["Run1", "Run2"],
    testcaseDirectories: [],
  });
});

test("discovers TESTCASE only when no Run directory is present", async () => {
  const result = await discoverRepositoryType(
    "bucket",
    "feature",
    async () => [
      { prefix: "feature/TC_1/" },
      { prefix: "feature/TC_12/" },
      { prefix: "feature/TC_alpha/" },
    ],
  );

  assert.deepEqual(result, {
    type: "TESTCASE",
    directories: ["TC_1", "TC_12", "TC_alpha"],
    runDirectories: [],
    testcaseDirectories: ["TC_1", "TC_12"],
  });
});

test("returns UNKNOWN when no immediate child directory matches", async () => {
  const result = await discoverRepositoryType(
    "bucket",
    "feature",
    async () => [
      { prefix: "feature/evidence/" },
      { name: "feature/notes.txt" },
    ],
  );

  assert.deepEqual(result, {
    type: "UNKNOWN",
    directories: ["evidence"],
    runDirectories: [],
    testcaseDirectories: [],
  });
});

test("prefers FEATURE when both Run and testcase directories exist", async () => {
  const result = await discoverRepositoryType(
    "bucket",
    "feature",
    async () => [
      { prefix: "feature/TC_1/" },
      { prefix: "feature/Run3/" },
      { prefix: "feature/TC_2/" },
    ],
  );

  assert.deepEqual(result, {
    type: "FEATURE",
    directories: ["TC_1", "Run3", "TC_2"],
    runDirectories: ["Run3"],
    testcaseDirectories: ["TC_1", "TC_2"],
  });
});
