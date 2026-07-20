/**
 * TEMPORARY LEGACY COMPATIBILITY
 *
 * Some legacy repositories use different feature folder names than TCM.
 *
 * TODO:
 * Remove once all repositories follow the Integration Guidelines.
 */
function resolveLegacyFeatureName(featureName) {
  switch (featureName) {
    case "MemoryStability tests":
      return "Memory_Stability tests";

    default:
      return featureName;
  }
}

module.exports = {
  resolveLegacyFeatureName,
};