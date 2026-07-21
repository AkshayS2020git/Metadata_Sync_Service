# TCM ↔ MinIO Metadata Synchronization Playbook

**Version:** 2.0  
**Author:** Akshay Sujesh

> This document defines the standards, folder hierarchy, metadata resolution strategy,
> synchronization workflow, overwrite handling, validation, and integration requirements
> for the Metadata Synchronization Service.

---

# 1. Purpose

This playbook defines the standards required for integrating the Test Case Management (TCM) platform with the Metadata Synchronization Service and MinIO.

Projects adhering to this standard can integrate without requiring project-specific code changes.

---

# 2. Objective

The Metadata Synchronization Service automatically synchronizes execution metadata from TCM into the appropriate `metadata.json` stored in MinIO.

The tester should never manually edit metadata files.

```
Tester
   │
Execute Test
   │
Update Status / Label / Date / Run
   │
Click Submit
   │
Execution saved in TCM
   │
Metadata Sync Service invoked
   │
Validation
   │
Duplicate Detection
   │
Merge Metadata
   │
Upload metadata.json
   │
Synchronization Status returned to TCM
```

---

# 3. Guiding Principles

- TCM is the source of truth for execution data.
- MinIO stores metadata.
- Metadata Sync Service owns all MinIO operations.
- TCM must not contain MinIO-specific logic.
- Metadata Sync Service must remain project agnostic.
- Folder conventions should eliminate project-specific implementations.
- Synchronization failures must **not** prevent execution persistence.

---

# 4. Bucket Naming Convention

Each project owns exactly one MinIO bucket.

Rules:

- Lowercase
- No spaces
- Prefer alphanumeric names

Example:

| TCM Project | Bucket |
|-------------|--------|
| Legacy Ruckus | legacyruckus |
| Enterprise AP | enterpriseap |
| WiFi Controller | wificontroller |

---

# 5. Root Folder Structure

```
Bucket/
└── Test_Plan/
```

`Test_Plan` is mandatory.

---

# 6. Version Folder

```
Bucket/
└── Test_Plan/
    ├── V73/
    ├── V74/
    └── V75/
```

Latest version is selected automatically unless explicitly overridden.

---

# 7. Hierarchy Mirroring

Everything after the Version folder mirrors the hierarchy inside TCM.

```
Bucket/
└── Test_Plan/
    └── Version/
        └── AP Model/
            └── Feature/
                └── Run/
```

Folder names should match TCM exactly.

---

# 8. Metadata File Naming

Only the following filename is supported:

```
metadata.json
```

---

# 9. Supported Metadata Structures

## Feature-Level

```
Bucket/
└── Test_Plan/
    └── Version/
        └── AP Model/
            └── Feature/
                └── Run/
                    └── metadata.json
```

One metadata file stores all executions for the feature/run.

---

## Test Case-Level

```
Bucket/
└── Test_Plan/
    └── Version/
        └── AP Model/
            └── Feature/
                └── TestCase/
                    └── Run/
                        └── metadata.json
```

Each test case maintains its own metadata.

---

# 10. Metadata Resolution Algorithm

1. Resolve bucket.
2. Resolve `Test_Plan`.
3. Resolve version.
4. Resolve AP Model.
5. Resolve Feature.
6. Resolve Run.
7. Check for `metadata.json`.
8. If not found, check supported test-case location.
9. If still not found, return:

```
404 FILE_NOT_FOUND
```

The service never performs recursive searching.

---

# 11. Synchronization Workflow

```
Execution Saved
        │
        ▼
Payload Built
        │
        ▼
Metadata Sync Service
        │
        ▼
Resolve Path
        │
        ▼
Validate metadata.json
        │
        ▼
Duplicate Detection
        │
        ▼
Merge Metadata
        │
        ▼
Upload metadata.json
        │
        ▼
SUCCESS / FAILED
```

---

# 12. Duplicate Detection & Overwrite

Duplicate key:

```
case_ref_id
```

If duplicate exists:

```
409
CASE_REF_ALREADY_EXISTS
```

Frontend prompts:

```
Metadata already exists.

Overwrite?
```

If confirmed:

```
overwrite=true
```

Existing metadata entry is replaced.

---

# 13. Validation

The service validates:

- Bucket
- Version
- Folder path
- metadata.json existence
- JSON validity
- Duplicate Case Ref IDs

Returned error details may include:

- metadataPath
- invalidSegment
- invalidPrefix

---

# 14. Payload Overview

Payload contains:

- case_ref_id
- status
- executed_at
- firmware
- run
- custom_minio_path
- overwrite

The Metadata Sync Service decides where metadata should be written.

---

# 15. Synchronization States

Supported states:

- PENDING
- SUCCESS
- FAILED

Synchronization failures are stored separately and do not rollback execution updates.

---

# 16. Compatibility Checklist

Before enabling synchronization:

- Bucket exists
- Test_Plan exists
- Version exists
- Folder hierarchy mirrors TCM
- metadata.json naming is correct
- Supported metadata layout
- Paths resolve correctly

---

# 17. Breaking Changes

The following require review:

- Bucket rename
- Test_Plan rename
- Version relocation
- Folder rename
- metadata.json rename
- Payload contract changes
- Metadata schema changes

---

# 18. Service Modules

- API Receiver
- Bucket Resolver
- Version Resolver
- Metadata Path Resolver
- MinIO Client
- Metadata Reader
- Metadata Writer
- Duplicate Detector
- Metadata Formatter
- Synchronization Orchestrator

---

# 19. Logging

Recommended production logs:

```
[SYNC] Request received
[SYNC] Path resolved
[SYNC] Metadata downloaded
[SYNC] Duplicate detected
[SYNC] Merge complete
[SYNC] Upload successful
```

Avoid development-only debug logging in production.

---

# 20. Future Enhancements

- Background retry queue
- Version history
- Rollback
- Audit logs
- Bulk synchronization
- Metrics dashboard
- Notifications

---

# 21. Compliance

Projects integrating with the Metadata Synchronization Service must comply with this standard.

Projects deviating from these conventions require documented exceptions and service updates before synchronization is enabled.
