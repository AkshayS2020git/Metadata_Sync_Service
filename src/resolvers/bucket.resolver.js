/**
 * Converts a TCM project name into the corresponding MinIO bucket name.
 * Example:
 * "Legacy Ruckus" -> "legacyruckus"
 */

function resolveBucket(projectName) {
  if (!projectName) {
    throw new Error("Project name is required.");
  }

  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

module.exports = {
  resolveBucket,
};