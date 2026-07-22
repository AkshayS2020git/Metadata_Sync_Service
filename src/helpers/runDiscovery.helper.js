const { listObjects } = require("../clients/minio.client");

function normalizeFolderPath(folderPath) {
  return `${String(folderPath ?? "").replace(/\\/g, "/").replace(/\/+$/, "")}/`;
}

function entryPath(entry) {
  return entry?.prefix ?? entry?.name ?? entry?.Key ?? entry?.key ?? "";
}

/**
 * Extracts only immediate child directory names from a Run-parent listing.
 */
function extractImmediateRunDirectories(entries, runParentPath) {
  const parentPath = normalizeFolderPath(runParentPath);
  const directories = new Set();

  for (const entry of entries) {
    const rawPath = String(entryPath(entry)).replace(/\\/g, "/");
    const isDirectory = Boolean(entry?.prefix) || rawPath.endsWith("/");

    if (!isDirectory || !rawPath.startsWith(parentPath)) {
      continue;
    }

    const relativePath = rawPath.slice(parentPath.length).replace(/\/$/, "");

    if (relativePath && !relativePath.includes("/")) {
      directories.add(relativePath);
    }
  }

  return Array.from(directories);
}

/**
 * Locates a requested Run folder without reading its contents or metadata.
 */
async function discoverRunDirectory(bucketName, runParentPath, run, listObjectsFn = listObjects) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!runParentPath) {
    throw new Error("Run parent path is required.");
  }

  if (!run) {
    throw new Error("Run is required.");
  }

  const normalizedParentPath = normalizeFolderPath(runParentPath);
  const entries = await listObjectsFn(bucketName, normalizedParentPath);
  const directories = extractImmediateRunDirectories(entries, normalizedParentPath);

  if (!directories.includes(run)) {
    throw new Error(`Run directory "${run}" does not exist under "${normalizedParentPath}".`);
  }

  return {
    runPath: `${normalizedParentPath}${run}/`,
  };
}

async function discoverRuns(
  bucketName,
  runParentPath,
  listObjectsFn = listObjects
) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!runParentPath) {
    throw new Error("Run parent path is required.");
  }

  const normalizedParentPath = normalizeFolderPath(runParentPath);

  const entries = await listObjectsFn(
    bucketName,
    normalizedParentPath
  );

  const runs = extractImmediateRunDirectories(
    entries,
    normalizedParentPath
  );

  return runs.sort((a, b) => {
    const na = Number(a.replace(/^Run/i, ""));
    const nb = Number(b.replace(/^Run/i, ""));
    return na - nb;
  });
}


module.exports = {
  discoverRunDirectory,
  discoverRuns,
  extractImmediateRunDirectories,
};
