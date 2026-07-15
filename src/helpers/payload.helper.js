function buildExecutionMetadata(payload) {
  return {
    label: payload.label,
    status: payload.status,
    executedBy: payload.executedBy,
    executedAt: payload.executedAt,
  };
}

module.exports = {
  buildExecutionMetadata,
};