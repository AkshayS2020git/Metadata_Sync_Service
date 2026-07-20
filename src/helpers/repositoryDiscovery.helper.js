const { listObjects } = require("../clients/minio.client");

const RUN_DIRECTORY_PATTERN = /^Run\d+$/;
const TEST_CASE_DIRECTORY_PATTERN = /^TC_\d+$/;

function normalizePrefix(prefix) {
  return String(prefix ?? "")
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "");
}

function entryPath(entry) {
  return entry?.prefix ?? entry?.name ?? entry?.Key ?? entry?.key ?? "";
}

/**
 * Extracts immediate child directory names from a non-recursive MinIO listing.
 * Files and nested paths are deliberately ignored.
 */
function extractImmediateDirectories(entries, featureFolder) {
  const prefix = normalizePrefix(featureFolder);
  const directoryPrefix = `${prefix}/`;
  const directories = new Set();

  for (const entry of entries) {
    const rawPath = String(entryPath(entry)).replace(/\\/g, "/");
    const isDirectory = Boolean(entry?.prefix) || rawPath.endsWith("/");

    if (!isDirectory || !rawPath.startsWith(directoryPrefix)) {
      continue;
    }

    const relativePath = rawPath.slice(directoryPrefix.length).replace(/\/$/, "");

    // A directory is immediate only when no further path segments remain.
    if (relativePath && !relativePath.includes("/")) {
      directories.add(relativePath);
    }
  }

  return Array.from(directories);
}

function classifyDirectories(directories) {
  if (directories.some((directory) => RUN_DIRECTORY_PATTERN.test(directory))) {
    return "FEATURE";
  }

  if (directories.some((directory) => TEST_CASE_DIRECTORY_PATTERN.test(directory))) {
    return "TESTCASE";
  }

  return "UNKNOWN";
}

function findMetadataDirectories(directories) {
  return {
    runDirectories: directories.filter((directory) =>
      RUN_DIRECTORY_PATTERN.test(directory),
    ),
    testcaseDirectories: directories.filter((directory) =>
      TEST_CASE_DIRECTORY_PATTERN.test(directory),
    ),
  };
}

/**
 * Determines repository metadata scope from immediate feature-folder directories.
 * The listing is intentionally non-recursive and never reads or writes metadata.
 */
async function discoverRepositoryType(bucketName, featureFolder, listObjectsFn = listObjects) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!featureFolder) {
    throw new Error("Feature folder is required.");
  }

  const prefix = `${normalizePrefix(featureFolder)}/`;
  const entries = await listObjectsFn(bucketName, prefix);
  const directories = extractImmediateDirectories(entries, prefix);
  console.debug("[repository-discovery] immediate directories", {
    bucketName,
    featureFolder,
    directories,
  });
  const type = classifyDirectories(directories);
  const { runDirectories, testcaseDirectories } = findMetadataDirectories(directories);

  console.debug("[repository-discovery] repository type", { type });

  return {
    type,
    directories,
    runDirectories,
    testcaseDirectories,
  };
}

module.exports = {
  discoverRepositoryType,
  extractImmediateDirectories,
  classifyDirectories,
  findMetadataDirectories,
};
