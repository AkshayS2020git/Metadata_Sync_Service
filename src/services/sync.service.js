const { resolveBucket } = require("../resolvers/bucket.resolver");
const { resolveVersion } = require("../resolvers/version.resolver");
const {
    findInvalidPathSegment,
} = require("../helpers/pathValidation.helper");
const { normalizeCaseRefId } = require("../helpers/caseRef.helper");
const {
  TEST_PLAN_FOLDER,
  METADATA_FILE_NAME,
} = require("../constants/metadata.constants");

const {
  discoverRepositoryType,
} = require("../helpers/repositoryDiscovery.helper");
const {
  resolveRunParent,
} = require("../helpers/runParentDiscovery.helper");
const {
  discoverRunDirectory,
} = require("../helpers/runDiscovery.helper");
const {
  extractApModel,
} = require("../helpers/apModel.helper");

const {
  readMetadata,
  writeMetadata,
} = require("./metadata.service");

const {
  mergeMetadata,
} = require("../helpers/metadataMerge.helper");

const {
  buildExecutionMetadata,
} = require("../helpers/payload.helper");

exports.acceptSyncRequest = (body) => {
  if (body === undefined || body === null) {
    return {
      success: false,
      message: "JSON request body is required.",
    };
  }

  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return {
      success: false,
      message: "JSON request body is required.",
    };
  }

  const requiredFields = [
    "project",
    "testRun",
    "feature",
    "run",
    "test_case",
    "status",
    "executedBy",
    "executedAt",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        success: false,
        message: `${field} is required.`,
      };
    }
  }

  return { success: true };
};

/**
 * Resolves the target metadata.json before the merge/write phase.
 *
 * Integration Contract:
 * The AP Model is derived from the Test Run name using
 * extractApModel().
 *
 * Supported Test Run naming:
 *   R750
 *   R750_May4_May8
 *   R760_Regression
 *
 * Repository path:
 * Test_Plan/<Version>/<AP_MODEL>/<Feature>
 */
async function prepareMetadataSynchronization(payload, dependencies = {}) {
  const getBucket =
    dependencies.resolveBucket ?? resolveBucket;

  const getVersion =
    dependencies.resolveVersion ?? resolveVersion;

  console.log("[sync] Override Path:", payload.custom_minio_path);

  const getRepository =
    dependencies.discoverRepositoryType ??
    discoverRepositoryType;

  const getRunParent =
    dependencies.resolveRunParent ??
    resolveRunParent;

  const getRunDirectory =
    dependencies.discoverRunDirectory ??
    discoverRunDirectory;

  const getMetadata =
    dependencies.readMetadata ??
    readMetadata;

  const bucket = getBucket(payload.project);

  const version = await getVersion(
    bucket,
    payload.versionOverride
  );

  // Repository naming convention:
  // First token of the Test Run name represents the AP Model.
  const apModel = extractApModel(payload.testRun);

  const featureFolder = [
    TEST_PLAN_FOLDER,
    version,
    apModel,
    payload.feature,
  ].join("/");

  console.log("[sync] Bucket:", bucket);
console.log("[sync] Version:", version);
console.log("[sync] AP Model:", apModel);
console.log("[sync] Feature Folder:", featureFolder);

  const repositoryDiscovery =
    await getRepository(
      bucket,
      featureFolder
    );

    console.log("[sync] Repository Discovery:", repositoryDiscovery);

  const {
    runParentPath,
    repositoryType,
  } = getRunParent(
    repositoryDiscovery,
    featureFolder,
    payload.run,
    normalizeCaseRefId(
  payload.case_ref_id ?? payload.testCase ?? null),
      payload.test_case
  );

  console.log("[sync] Repository Type:", repositoryType);
console.log("[sync] Run Parent:", runParentPath);

  const { runPath } =
    await getRunDirectory(
      bucket,
      runParentPath,
      payload.run
    );

    console.log("[sync] Run Path:", runPath);

  let metadataPath = `${runPath}${METADATA_FILE_NAME}`;

if (payload.custom_minio_path) {
  const override = payload.custom_minio_path
    .trim()
    .replace(/[\\/]+$/, "");

  metadataPath = override.toLowerCase().endsWith("metadata.json")
    ? override
    : `${override}/${METADATA_FILE_NAME}`;
}

    console.log("[sync] Metadata Path:", metadataPath);

  let existingMetadata;

  try {
    console.log("[sync] Reading metadata.json...");
    existingMetadata =
      await getMetadata(
        bucket,
        metadataPath
      );
      console.log("[sync] Metadata loaded successfully.");
  } catch (error) {

    const invalid =
        await findInvalidPathSegment(
            bucket,
            metadataPath
        );

    const syncError = new Error("File not found. Please check the specified path.");

    syncError.code = "FILE_NOT_FOUND";
    syncError.metadataPath = metadataPath;

    if (invalid) {
        syncError.invalidSegment = invalid.invalidSegment;
        syncError.invalidPrefix = invalid.invalidPrefix;
    }

    throw syncError;
}


  return {
    bucket,
    version,
    repositoryType,
    metadataPath,
    caseRefId:
      payload.case_ref_id ??
      payload.testCase ??
      null,
    existingMetadata,
    executionMetadata:
      buildExecutionMetadata(payload),
  };
}

async function synchronizeMetadata(
  payload,
  dependencies = {}
) {
  const preparedMetadata =
    await prepareMetadataSynchronization(
      payload,
      dependencies
    );

  const merge =
    dependencies.mergeMetadata ??
    mergeMetadata;

  const write =
    dependencies.writeMetadata ??
    writeMetadata;

  
  console.log("[sync] Merging metadata...");
  const mergedMetadata = merge(
    preparedMetadata.existingMetadata,
    preparedMetadata.executionMetadata,
    preparedMetadata.repositoryType,
    preparedMetadata.caseRefId
  );
  console.log(
    "[sync] Merged Metadata:\n",
    JSON.stringify(mergedMetadata, null, 2)
);


  console.log("[sync] Writing metadata.json...");
  await write(
    preparedMetadata.bucket,
    preparedMetadata.metadataPath,
    mergedMetadata
  );

  console.log("[sync] Metadata written successfully.");
  console.log("[sync] Synchronization complete.");
  return {
    success: true,
    bucket: preparedMetadata.bucket,
    metadataPath:
      preparedMetadata.metadataPath,
    metadata: mergedMetadata,
  };
}

exports.synchronizeMetadata =
  synchronizeMetadata;

exports.prepareMetadataSynchronization =
  prepareMetadataSynchronization;