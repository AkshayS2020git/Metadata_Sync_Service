const { listObjects } = require("../clients/minio.client");

/**
 * Extracts unique version folder names from the objects returned by MinIO.
 */
function extractVersionFolders(entries) {
  const versionFolders = new Set();

  entries.forEach((entry) => {
    const rawName =
      entry?.name ??
      entry?.prefix ??
      entry?.Key ??
      entry?.key ??
      "";

    if (!rawName) {
      return;
    }

    const normalizedPath = rawName
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "");

    if (!normalizedPath.startsWith("Test_Plan/")) {
      return;
    }

    const relativePath = normalizedPath.replace(/^Test_Plan\//, "");
    const versionName = relativePath.split("/")[0];

    if (versionName) {
      versionFolders.add(versionName);
    }
  });

  return Array.from(versionFolders);
}

/**
 * Compares version folder names.
 * Example:
 * V7.2 < V7.10
 */
function compareVersions(left, right) {
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Resolves the version folder to use.
 *
 * Resolution priority:
 * 1. User override
 * 2. Latest available version
 */
async function resolveVersion(bucketName, versionOverride = null) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  // User explicitly selected a version
  if (versionOverride) {
    const overridePath = `Test_Plan/${versionOverride}/`;

    const entries = await listObjects(bucketName, overridePath);

    if (!entries.length) {
      throw new Error(
        `Version "${versionOverride}" does not exist in bucket "${bucketName}".`
      );
    }

    return versionOverride;
  }

  // Automatically discover latest version
  const entries = await listObjects(bucketName, "Test_Plan/");

  const versionFolders = extractVersionFolders(entries);

  if (!versionFolders.length) {
    throw new Error(
      `No version folders found in bucket "${bucketName}".`
    );
  }

  versionFolders.sort(compareVersions);

  return versionFolders[versionFolders.length - 1];
}

module.exports = {
  resolveVersion,
};