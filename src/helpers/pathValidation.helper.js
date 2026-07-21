const { listObjects } = require("../clients/minio.client");

async function findInvalidPathSegment(bucket, metadataPath) {
  const folders = metadataPath
    .replace(/metadata\.json$/i, "")
    .replace(/\/$/, "")
    .split("/");

  let currentPrefix = "";

  for (const folder of folders) {
    currentPrefix += `${folder}/`;

    const objects = await listObjects(bucket, currentPrefix);

    if (!objects.length) {
      return {
        invalidSegment: folder,
        invalidPrefix: currentPrefix,
      };
    }
  }

  return null;
}

module.exports = {
  findInvalidPathSegment,
};