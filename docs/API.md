# Metadata Synchronization Service API

**Version:** 1.0 (Draft)

---

# Purpose

The Metadata Synchronization Service exposes REST APIs that allow external applications to synchronize execution metadata into MinIO.

Currently the only intended client is the Test Case Management (TCM) platform.

---

# Base URL

Development

```
http://localhost:3002
```

Production

```
Configured during deployment.
```

---

# Authentication

Authentication is currently not implemented.

Future versions may support:

- API Keys
- JWT Authentication
- Internal Service Authentication

---

# Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | /health | Verify service availability |
| POST | /sync | Submit a synchronization request |

Future endpoints

| Method | Endpoint |
|---------|----------|
| GET | /versions |
| GET | /buckets |
| POST | /resolve-path |
| POST | /validate |
| POST | /preview |

---

# GET /health

## Purpose

Returns the health status of the Metadata Synchronization Service.

---

## Request

```
GET /health
```

---

## Response

HTTP 200

```json
{
    "status": "healthy",
    "service": "Metadata Synchronization Service"
}
```

---

# POST /sync

## Purpose

Receives execution information from TCM and synchronizes the appropriate metadata.json file within MinIO.

The Metadata Synchronization Service is responsible for:

- Resolving bucket
- Resolving version
- Resolving metadata location
- Reading metadata
- Updating metadata
- Uploading metadata

TCM should not perform any MinIO-specific operations.

---

# Request Payload

⚠ **Draft**

The payload contract is currently under review and may evolve during implementation.

```json
{
    "project": {
        "id": 1,
        "name": "Legacy Ruckus"
    },

    "run": {
        "id": 12,
        "name": "Regression Run"
    },

    "version": null,

    "feature": {
        "id": 27,
        "name": "BSS COLORING"
    },

    "changedExecutionId": 901,

    "executionResults": [
        {
            "executionId": 901,

            "testCase": {
                "id": 102,
                "code": "TC_01",
                "name": "Verify BSS Color Advertisement"
            },

            "status": "PASS",

            "label": "7.3.00.xxx",

            "executionDate": "2026-07-10",

            "assignedTo": "Jane Tester",

            "comment": ""
        }
    ]
}
```

---

# Payload Description

## project

Contains project information.

---

## run

Contains execution run information.

---

## version

Customer version.

If null:

Metadata Synchronization Service automatically resolves the latest version.

If supplied:

The supplied version is used.

---

## feature

Represents the feature (suite) currently being synchronized.

---

## changedExecutionId

Identifies which execution triggered the synchronization.

Useful for:

- Logging
- Debugging
- Partial updates

---

## executionResults

Contains the execution state for the feature.

Each execution object represents one test case.

---

# Successful Response

HTTP 200

```json
{
    "status": "accepted",
    "message": "Synchronization request accepted."
}
```

---

# Validation Errors

HTTP 400

```json
{
    "status": "error",
    "message": "Invalid request payload."
}
```

Examples

- Missing project
- Missing executionResults
- Invalid JSON
- Empty request body

---

# Metadata Resolution Errors

HTTP 404

```json
{
    "status": "error",
    "message": "metadata.json could not be resolved."
}
```

Possible causes

- Bucket missing
- Version missing
- metadata.json missing

---

# Synchronization Errors

HTTP 500

```json
{
    "status": "error",
    "message": "Metadata synchronization failed."
}
```

Examples

- MinIO unavailable
- Metadata parsing failure
- Upload failure

---

# Metadata Resolution Flow

The Metadata Synchronization Service performs the following operations.

```
Receive Request

↓

Resolve Bucket

↓

Resolve Version

↓

Mirror TCM Hierarchy

↓

Check

Feature/metadata.json

↓

Exists?

YES

↓

Update Feature Metadata

↓

NO

↓

Check

Feature/TestCase/metadata.json

↓

Exists?

YES

↓

Update Test Case Metadata

↓

NO

↓

Return Error
```

---

# Responsibilities

## TCM

Responsible for

- Execution status
- Labels
- Dates
- Comments
- Feature execution data

Not responsible for

- Buckets
- MinIO
- metadata.json
- Metadata location

---

## Metadata Synchronization Service

Responsible for

- Bucket resolution
- Version resolution
- Metadata resolution
- Metadata reading
- Metadata writing
- Metadata formatting
- MinIO communication

---

# Future Enhancements

Potential future endpoints

```
GET /versions

Returns available versions for a project.
```

---

```
POST /resolve-path

Returns the resolved metadata path without modifying metadata.
```

---

```
POST /preview

Returns the metadata that would be generated without uploading it.
```

---

```
POST /validate

Validates incoming payload before synchronization.
```

---

# Versioning

Future API versions should use endpoint versioning.

Example

```
/api/v1/sync

/api/v2/sync
```

to maintain backwards compatibility.

---

# Notes

- Metadata Synchronization Service should remain storage-agnostic except for MinIO integration.
- TCM should never require changes when introducing new metadata storage strategies.
- The Metadata Synchronization Service should determine whether metadata is feature-level or test-case-level based solely on the existence of metadata.json.
- No project-specific synchronization logic should be introduced.