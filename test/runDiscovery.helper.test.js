const test = require("node:test");
const assert = require("node:assert/strict");

const { discoverRunDirectory } = require("../src/helpers/runDiscovery.helper");

test("returns the requested immediate Run directory", async () => {
  const result = await discoverRunDirectory(
    "bucket",
    "Feature/TC_1/",
    "Run3",
    async () => [
      { prefix: "Feature/TC_1/Run1/" },
      { prefix: "Feature/TC_1/Run3/" },
    ],
  );

  assert.deepEqual(result, { runPath: "Feature/TC_1/Run3/" });
});

test("throws when the requested Run directory is missing", async () => {
  await assert.rejects(
    () => discoverRunDirectory(
      "bucket",
      "Feature/",
      "Run2",
      async () => [{ prefix: "Feature/Run1/" }],
    ),
    /Run directory "Run2" does not exist under "Feature\/"/i,
  );
});

test("ignores files when locating the requested Run directory", async () => {
  await assert.rejects(
    () => discoverRunDirectory(
      "bucket",
      "Feature/",
      "Run2",
      async () => [
        { name: "Feature/Run2" },
        { name: "Feature/metadata.json" },
        { name: "Feature/README.md" },
      ],
    ),
    /Run directory "Run2" does not exist/i,
  );
});
