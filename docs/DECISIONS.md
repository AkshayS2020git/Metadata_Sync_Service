# Decision 001

## Title
Standalone Metadata Synchronization Service

## Decision

The Metadata Synchronization component will be implemented as a standalone Node.js service that receives synchronization requests from TCM via HTTP.

## Reason

- Decouples TCM from MinIO.
- Allows reuse by future systems.
- Keeps MinIO-specific logic isolated.
- Simplifies testing and maintenance.

## Status

Accepted


# Decision 002

## Title:
Feature-Centric Synchronization

## Decision:
The Metadata Sync Service receives execution results for an entire feature rather than a single test case.

## Reason:
Supports both feature-level and test-case-level metadata without changing the API contract.



# Decision 003

## Title

Metadata Resolution Strategy

---

## Status

Accepted

---

## Decision

The Metadata Synchronization Service shall automatically determine which `metadata.json` file to update based on the MinIO folder structure.

The resolution algorithm shall be:

1. Resolve the project bucket.
2. Resolve the version folder.
3. Mirror the TCM hierarchy until the selected feature.
4. Check whether a `metadata.json` file exists directly inside the feature folder.
5. If present, update the feature-level metadata.
6. If absent, navigate to the selected test case folder.
7. Check for `metadata.json`.
8. If present, update the test case-level metadata.
9. If neither file exists, return a metadata resolution error.

The service shall not require project-specific configuration to determine whether metadata is maintained at the feature level or test case level.

---

## Reason

Different projects maintain metadata using different strategies.

Example:

Feature-level metadata

```
Feature
│
├── metadata.json
├── TC-1
├── TC-2
└── TC-3
```

Example:

Test case-level metadata

```
Feature
│
├── TC-1
│     └── metadata.json
├── TC-2
│     └── metadata.json
└── TC-3
      └── metadata.json
```

Rather than storing configuration for each project, the Metadata Synchronization Service determines the metadata scope by inspecting the expected locations for `metadata.json`.

This keeps the implementation generic and allows future projects to integrate without requiring service code changes.

---

## Consequences

### Advantages

- No project-specific synchronization logic.
- Supports both feature-level and test case-level metadata.
- New projects only need to follow the MinIO Playbook.
- Simplifies onboarding of future projects.

### Limitations

- Projects must adhere to the prescribed MinIO folder hierarchy.
- `metadata.json` must exist in one of the supported locations.
- Arbitrary folder layouts are not supported.



# Decision 004

## Title
Single MinIO Instance

## Status
Accepted

## Decision

The Metadata Synchronization Service connects to a single MinIO server using one set of credentials. Each TCM project corresponds to a unique bucket within that MinIO instance.

## Reason

- Simplifies configuration.
- No project-specific credentials.
- Bucket resolution is deterministic.
- Easier maintenance and deployment.

# Decision 005 — Version Resolution Strategy

## Status

Accepted

## Context

Version information is not reliably available from the TCM payload. Although projects may use Labels, labels are project-specific metadata and cannot be treated as software version identifiers.

## Decision

The Metadata Synchronization Service shall determine the version folder using the following priority:

1. User-specified version override.
2. Latest available version under the project's `Test_Plan` directory.

The TCM Label field shall not be used for version resolution.

## Consequences

- Synchronization requests no longer require version information.
- Version management is centralized within the Metadata Synchronization Service.
- Future projects remain independent of TCM labeling conventions.