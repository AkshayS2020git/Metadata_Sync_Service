/**
 * TEMPORARY LEGACY COMPATIBILITY
 *
 * Legacy TCM repositories may send testcase identifiers in different formats
 * (e.g. Test_2). Metadata repositories use TC_<number>.
 *
 * TODO:
 * Remove once TCM stores case_ref_id using the Integration Guidelines.
 */
function normalizeCaseRefId(caseRefId) {
  if (!caseRefId) {
    return caseRefId;
  }

  const match = String(caseRefId).match(/(\d+)$/);

  if (!match) {
    return caseRefId;
  }

  return `TC_${match[1]}`;
}

module.exports = {
  normalizeCaseRefId,
};