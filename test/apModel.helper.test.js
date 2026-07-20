const test = require("node:test");
const assert = require("node:assert/strict");

const { extractApModel } = require("../src/helpers/apModel.helper");

test("extracts the AP model from an underscore-delimited test run name", () => {
  assert.equal(extractApModel("R750_Regression_2026"), "R750");
});

test("uses the entire test run name when it has no underscore", () => {
  assert.equal(extractApModel("R750"), "R750");
});
