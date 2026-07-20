function buildExecutionMetadata(payload) {
  return {
    test_case: payload.test_case,
    status: payload.status,
    executedBy: payload.executedBy,
    executedAt: payload.executedAt,
  };
}

module.exports = {
  buildExecutionMetadata,
};