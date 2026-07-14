const { readMetadata } = require("../services/metadata.service");

async function readMetadata(bucketName, objectKey) {
    if (!bucketName) {
        throw new Error("Bucket name is required.");
    }

    if (!objectKey) {
        throw new Error("Object key is required.");
    }

    const metadata = await readMetadata(
        "legacyruckus",
        "Test_Plan/V7.3/R750/Client Isolation/Run1/metadata.json"
    );

    let metadata;

    try {
        metadata = JSON.parse(metadataContent);
    } catch (err) {
        throw new Error(
            `Invalid JSON in metadata file: ${objectKey}`
        );
    }

    return metadata;
}

module.exports = {
    readMetadata,
};