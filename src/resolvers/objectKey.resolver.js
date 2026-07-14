const {
  TEST_PLAN_FOLDER,
  METADATA_FILE_NAME,
} = require("../constants/metadata.constants");

/**
 * Builds the expected MinIO object key.
 */
function buildObjectKey({
  version,
  testRun,
  feature,
  run,
  testCase = null,
}) {
  if (!version || !testRun || !feature || !run) {
    throw new Error(
      "Version, testRun, feature and run are required."
    );
  }

  const parts = [
    TEST_PLAN_FOLDER,
    version,
    testRun,
    feature,
  ];

  // Test-case level projects
  if (testCase) {
    parts.push(testCase);
  }

  // Every metadata file now lives inside a Run folder
  parts.push(run);

  parts.push(METADATA_FILE_NAME);

  return parts.join("/");
}

module.exports = {
  buildObjectKey,
};