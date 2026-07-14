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