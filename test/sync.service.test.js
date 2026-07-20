const test = require("node:test");
const assert = require("node:assert/strict");

const {
  prepareMetadataSynchronization,
  synchronizeMetadata,
} = require("../src/services/sync.service");

test("chains discovery helpers and prepares metadata for merge without writing", async () => {
  const calls = [];
  const payload = {
    project: "Project",
    testRun: "TestRun",
    feature: "Feature",
    run: "Run2",
    case_ref_id: "TC_1",
    label: "Execution",
    status: "passed",
    executedBy: "tester",
    executedAt: "2026-07-16T00:00:00Z",
  };

  const result = await prepareMetadataSynchronization(payload, {
    resolveBucket: (project) => {
      calls.push(["bucket", project]);
      return "bucket";
    },
    resolveVersion: async () => "V1",
    discoverRepositoryType: async (bucket, featureFolder) => {
      calls.push(["repository", bucket, featureFolder]);
      return { type: "TESTCASE", runDirectories: [], testcaseDirectories: ["TC_1"] };
    },
    resolveRunParent: (repository, featureFolder, run, caseRefId) => {
      calls.push(["parent", repository.type, featureFolder, run, caseRefId]);
      return { runParentPath: "Test_Plan/V1/TestRun/Feature/TC_1/", repositoryType: "TESTCASE" };
    },
    discoverRunDirectory: async (bucket, parentPath, run) => {
      calls.push(["run", bucket, parentPath, run]);
      return { runPath: "Test_Plan/V1/TestRun/Feature/TC_1/Run2/" };
    },
    readMetadata: async (bucket, metadataPath) => {
      calls.push(["read", bucket, metadataPath]);
      return { executions: [] };
    },
  });

  assert.equal(result.metadataPath, "Test_Plan/V1/TestRun/Feature/TC_1/Run2/metadata.json");
  assert.deepEqual(result.existingMetadata, { executions: [] });
  assert.deepEqual(calls, [
    ["bucket", "Project"],
    ["repository", "bucket", "Test_Plan/V1/TestRun/Feature"],
    ["parent", "TESTCASE", "Test_Plan/V1/TestRun/Feature", "Run2", "TC_1"],
    ["run", "bucket", "Test_Plan/V1/TestRun/Feature/TC_1/", "Run2"],
    ["read", "bucket", "Test_Plan/V1/TestRun/Feature/TC_1/Run2/metadata.json"],
  ]);
});

test("returns a descriptive error when metadata cannot be read", async () => {
  await assert.rejects(
    () => prepareMetadataSynchronization(
      { project: "Project", testRun: "TestRun", feature: "Feature", run: "Run1" },
      {
        resolveBucket: () => "bucket",
        resolveVersion: async () => "V1",
        discoverRepositoryType: async () => ({ type: "FEATURE", runDirectories: ["Run1"] }),
        resolveRunParent: () => ({ runParentPath: "Test_Plan/V1/TestRun/Feature/", repositoryType: "FEATURE" }),
        discoverRunDirectory: async () => ({ runPath: "Test_Plan/V1/TestRun/Feature/Run1/" }),
        readMetadata: async () => { throw new Error("Object not found"); },
      },
    ),
    /Unable to read metadata\.json at "Test_Plan\/V1\/TestRun\/Feature\/Run1\/metadata\.json": Object not found/i,
  );
});

test("uses the AP model segment when constructing the feature folder", async () => {
  let discoveredFeatureFolder;

  await prepareMetadataSynchronization(
    { project: "Project", testRun: "R750_Regression", feature: "Feature", run: "Run1" },
    {
      resolveBucket: () => "bucket",
      resolveVersion: async () => "V1",
      discoverRepositoryType: async (_bucket, featureFolder) => {
        discoveredFeatureFolder = featureFolder;
        return { type: "FEATURE", runDirectories: ["Run1"] };
      },
      resolveRunParent: () => ({ runParentPath: "Test_Plan/V1/R750/Feature/", repositoryType: "FEATURE" }),
      discoverRunDirectory: async () => ({ runPath: "Test_Plan/V1/R750/Feature/Run1/" }),
      readMetadata: async () => ({}),
    },
  );

  assert.equal(discoveredFeatureFolder, "Test_Plan/V1/R750/Feature");
});

test("writes merged metadata after discovery and metadata preparation", async () => {
  let writeArguments;

  const result = await synchronizeMetadata(
    { project: "Project", testRun: "TestRun", feature: "Feature", run: "Run1", case_ref_id: "TC_1" },
    {
      resolveBucket: () => "bucket",
      resolveVersion: async () => "V1",
      discoverRepositoryType: async () => ({ type: "TESTCASE", testcaseDirectories: ["TC_1"] }),
      resolveRunParent: () => ({ runParentPath: "Feature/TC_1/", repositoryType: "TESTCASE" }),
      discoverRunDirectory: async () => ({ runPath: "Feature/TC_1/Run1/" }),
      readMetadata: async () => ({ testData: { id: "preserved" } }),
      mergeMetadata: () => ({ executionData: { status: "passed" }, testData: { id: "preserved" } }),
      writeMetadata: async (...args) => { writeArguments = args; },
    },
  );

  assert.deepEqual(writeArguments, [
    "bucket",
    "Feature/TC_1/Run1/metadata.json",
    { executionData: { status: "passed" }, testData: { id: "preserved" } },
  ]);
  assert.equal(result.success, true);
});
