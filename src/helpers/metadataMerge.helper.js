function mergeMetadata(existingMetadata, executionMetadata) {
  const merged = { ...existingMetadata };

  for (const key of Object.keys(executionMetadata)) {
    delete merged[key];
  }

  return {
    ...executionMetadata,
    ...merged,
  };
}

module.exports = {
  mergeMetadata,
};