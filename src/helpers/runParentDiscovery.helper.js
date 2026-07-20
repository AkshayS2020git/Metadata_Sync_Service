function normalizeFolderPath(folderPath) {
  return `${String(folderPath).replace(/\\/g, "/").replace(/\/+$/, "")}/`;
}


/**
 * Temporary compatibility for legacy testcase repositories.
 *
 * Legacy repositories may use testcase labels as folder names instead of
 * case_ref_id (for example "Memory_Stability tests").
 *
 * TODO:
 * Remove this helper once all testcase repositories follow the Integration
 * Guidelines and are named using case_ref_id (TC_<id>).
 */
function resolveLegacyTestcaseDirectory(testcaseDirectories, testcaseLabel) {
  if (!testcaseLabel) {
    return null;
  }

  const normalizedLabel = testcaseLabel.trim();

  // Exact match
  let match = testcaseDirectories.find(
    (directory) => directory === normalizedLabel
  );

  if (match) {
    return match;
  }

  // Legacy naming:
  // MemoryStability tests -> Memory_Stability tests
  const legacyLabel = normalizedLabel.replace(
    /^([A-Za-z]+)([A-Z])/,
    "$1_$2"
  );

  match = testcaseDirectories.find(
    (directory) => directory === legacyLabel
  );

  return match ?? null;
}

/**
 * Resolves the directory that directly contains the requested Run folder.
 * This only uses repository-discovery output and never inspects metadata.
 */
function resolveRunParent(repositoryDiscovery, featureFolder, run, caseRefId = null, testcaseLabel = null) {
  if (!repositoryDiscovery) {
    throw new Error("Repository discovery result is required.");
  }

  if (!featureFolder) {
    throw new Error("Feature folder is required.");
  }

  const repositoryType = repositoryDiscovery.type;
  const featurePath = normalizeFolderPath(featureFolder);

  if (repositoryType === "FEATURE") {
    if (!repositoryDiscovery.runDirectories?.includes(run)) {
      throw new Error(`Run directory "${run}" does not exist in feature "${featureFolder}".`);
    }

    return {
      runParentPath: featurePath,
      repositoryType,
    };
  }

  if (repositoryType === "TESTCASE") {
    if (!caseRefId) {
      throw new Error("case_ref_id is required for TESTCASE repositories.");
    }

    let testcaseDirectory = caseRefId;

if (!repositoryDiscovery.testcaseDirectories?.includes(caseRefId)) {
  testcaseDirectory = resolveLegacyTestcaseDirectory(
    repositoryDiscovery.testcaseDirectories ?? [],
    testcaseLabel
  );

  if (!testcaseDirectory) {
    throw new Error(
      `Testcase directory "${caseRefId}" does not exist in feature "${featureFolder}".`
    );
  }

  console.warn(
    `[sync] Using legacy testcase directory "${testcaseDirectory}".`
  );
}

return {
  runParentPath: `${featurePath}${testcaseDirectory}/`,
  repositoryType,
};
  }

  throw new Error(
    `Unable to determine Run parent: repository type "${repositoryType ?? "UNKNOWN"}" is unsupported.`,
  );
}

module.exports = {
  resolveRunParent,
};
