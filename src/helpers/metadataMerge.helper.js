function mergeMetadata(existingMetadata, executionMetadata, repositoryType, caseRefId) {
  if (!existingMetadata || typeof existingMetadata !== "object" || Array.isArray(existingMetadata)) {
    throw new Error("Existing metadata object is required.");
  }

  const { executionData: existingExecutionData, ...preservedMetadata } = existingMetadata;
  let executionData;

  if (repositoryType === "FEATURE") {
    if (!caseRefId) {
      throw new Error("case_ref_id is required when merging FEATURE repository execution data.");
    }

    if (existingExecutionData !== undefined && !Array.isArray(existingExecutionData)) {
      throw new Error("FEATURE repository executionData must be an array.");
    }

    const executionEntry = { ...executionMetadata, case_ref_id: caseRefId };
    const existingEntries = existingExecutionData ?? [];
    const existingIndex = existingEntries.findIndex(
      (entry) => entry?.case_ref_id === caseRefId,
    );

    executionData = [...existingEntries];

    if (existingIndex === -1) {
      executionData.push(executionEntry);
    } else {
      executionData[existingIndex] = executionEntry;
    }
  } else if (repositoryType === "TESTCASE") {
    executionData = { ...executionMetadata, ...(caseRefId ? { case_ref_id: caseRefId } : {}) };
  } else {
    throw new Error(`Cannot merge execution data for repository type "${repositoryType}".`);
  }

  // executionData is deliberately first; all existing metadata, including
  // testData, is retained unchanged and follows in its original key order.
  return {
    executionData,
    ...preservedMetadata,
  };
}

module.exports = {
  mergeMetadata,
};
