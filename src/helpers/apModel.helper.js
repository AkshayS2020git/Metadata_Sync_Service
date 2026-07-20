/**
 * Integration Guideline
 *
 * Metadata Sync derives the AP Model from the Test Run name.
 *
 * Supported Test Run naming conventions:
 *
 *   <AP_MODEL>
 *   <AP_MODEL>_<DESCRIPTION>
 *
 * Examples:
 *   R750
 *   R750_May4_May8
 *   R760_Regression
 *   H550_InternalIssues
 *
 * Resolution Rule:
 * - If the Test Run name contains "_", the first underscore-delimited
 *   token is treated as the AP Model.
 * - Otherwise, the entire Test Run name is treated as the AP Model.
 *
 * The resolved AP Model is used to construct the repository path:
 *
 *   Test_Plan/<Version>/<AP_MODEL>/<Feature>
 *
 * This forms part of the integration contract between
 * TCM and the Metadata Sync Service.
 */
function extractApModel(testRunName) {
  const value = String(testRunName ?? "").trim();

  if (!value) {
    return "";
  }

  const separatorIndex = value.indexOf("_");

  return separatorIndex === -1
    ? value
    : value.slice(0, separatorIndex);
}

module.exports = {
  extractApModel,
};