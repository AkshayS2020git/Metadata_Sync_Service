function hasDuplicateExecution(
  existingMetadata,
  repositoryType,
  caseRefId
) {
  if (!existingMetadata || typeof existingMetadata !== "object") {
    return false;
  }

  if (repositoryType === "FEATURE") {
    const executionEntries = existingMetadata.executionData ?? [];

    if (!Array.isArray(executionEntries)) {
      return false;
    }

    return executionEntries.some(
      (entry) => entry?.case_ref_id === caseRefId
    );
  }

  if (repositoryType === "TESTCASE") {
    return (
      existingMetadata.executionData?.case_ref_id === caseRefId
    );
  }

  return false;
}

module.exports = {
  hasDuplicateExecution,
};