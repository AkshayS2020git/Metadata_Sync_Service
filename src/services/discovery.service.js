const { resolveBucket } = require("../resolvers/bucket.resolver");
const { resolveVersion } = require("../resolvers/version.resolver");
const { buildObjectKey } = require("../resolvers/objectKey.resolver");

async function discoverMetadata(payload) {
  const bucket = resolveBucket(payload.project);

  const version = await resolveVersion(
    bucket,
    payload.versionOverride
  );

  const objectKey = buildObjectKey({
    version,
    testRun: payload.testRun,
    feature: payload.feature,
    run: payload.run,
    testCase: payload.testCase,
  });

  return {
    bucket,
    version,
    objectKey,
  };
}

module.exports = {
  discoverMetadata,
};