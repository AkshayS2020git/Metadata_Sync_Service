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


# Decision 006

## Title

Submit-Based Metadata Synchronization

## Status

Accepted

## Context

Execution data within TCM may undergo multiple edits before it is finalized. Synchronizing metadata after every field modification would generate unnecessary MinIO operations and increase the likelihood of inconsistent metadata.

## Decision

Metadata synchronization shall only occur when the user explicitly submits an execution.

Editing execution details shall update only the local execution state within TCM. Metadata synchronization is triggered exclusively through the Submit action.

## Reason

- Reduces unnecessary synchronization requests.
- Prevents partially completed execution data from being written.
- Keeps synchronization aligned with finalized execution state.
- Improves user experience.

## Consequences

### Advantages

- Fewer synchronization requests.
- Better data consistency.
- Lower MinIO traffic.

### Limitations

- Metadata is not updated until the user submits the execution.

---

# Decision 007

## Title

Execution Persistence Independent of Metadata Synchronization

## Status

Accepted

## Context

Metadata synchronization depends on external infrastructure including MinIO and the Metadata Synchronization Service.

Temporary failures should not prevent execution results from being stored within TCM.

## Decision

Execution updates shall always be committed to the TCM database before metadata synchronization begins.

Synchronization failures shall be recorded independently without rolling back execution updates.

## Reason

- Prevents data loss.
- Allows synchronization retry.
- Decouples execution persistence from external dependencies.

## Consequences

### Advantages

- Execution history remains intact.
- Metadata synchronization failures become recoverable.

### Limitations

- Temporary inconsistency may exist until synchronization succeeds.

---

# Decision 008

## Title

Synchronization Status Tracking

## Status

Accepted

## Context

Users require visibility into whether metadata synchronization succeeded or failed.

## Decision

Each execution shall maintain an independent metadata synchronization status.

Supported states:

- PENDING
- SUCCESS
- FAILED

Synchronization errors shall also be stored.

## Reason

Provides visibility into synchronization health without requiring log inspection.

## Consequences

### Advantages

- Easier troubleshooting.
- Supports future retry mechanisms.
- Improves user feedback.

---

# Decision 009

## Title

Duplicate Metadata Detection

## Status

Accepted

## Context

Repeated synchronization of the same Case Reference ID may unintentionally create duplicate metadata entries.

## Decision

The Metadata Synchronization Service shall treat `case_ref_id` as the unique execution identifier.

If a duplicate exists, synchronization shall terminate with:

```
409 CASE_REF_ALREADY_EXISTS
```

## Reason

Prevents accidental duplication while allowing explicit overwrite.

## Consequences

### Advantages

- Preserves metadata integrity.
- Prevents duplicate execution entries.

### Limitations

- Requires user intervention before replacement.

---

# Decision 010

## Title

Explicit Overwrite Workflow

## Status

Accepted

## Context

Legitimate execution updates may require replacing existing metadata.

Automatically overwriting metadata risks accidental data loss.

## Decision

Duplicate metadata shall never be overwritten automatically.

If a duplicate exists:

1. Return HTTP 409.
2. Prompt the user.
3. Retry synchronization using:

```
overwrite = true
```

Only then shall the existing metadata be replaced.

## Reason

Balances data protection with operational flexibility.

## Consequences

### Advantages

- Prevents accidental overwrites.
- Makes destructive operations explicit.

### Limitations

- Requires an additional synchronization request.

---

# Decision 011

## Title

Flexible Custom Metadata Paths

## Status

Accepted

## Context

Projects occasionally require metadata synchronization to locations that differ from the automatically generated hierarchy.

## Decision

The Metadata Synchronization Service shall support both:

- Folder paths
- Explicit metadata.json paths

Examples:

```
Feature/Run/
```

or

```
Feature/Run/metadata.json
```

If omitted, automatic path generation shall be used.

## Reason

Provides flexibility while preserving standard behaviour.

## Consequences

### Advantages

- Supports non-standard repository layouts.
- Backwards compatible.

---

# Decision 012

## Title

Detailed Path Validation

## Status

Accepted

## Context

Returning only "File Not Found" provides insufficient information when diagnosing synchronization failures.

## Decision

Path validation errors shall include diagnostic information such as:

- metadataPath
- invalidSegment
- invalidPrefix

## Reason

Improves troubleshooting without requiring server log access.

## Consequences

### Advantages

- Faster debugging.
- Better frontend error reporting.
- Simplifies operational support.

---

# Decision 013

## Title

Stateless Synchronization Requests

## Status

Accepted

## Context

The Metadata Synchronization Service should remain horizontally scalable.

## Decision

Every synchronization request shall contain all information required to perform synchronization.

The service shall not maintain synchronization session state.

## Reason

Enables stateless deployment behind load balancers and simplifies scaling.

## Consequences

### Advantages

- Easier horizontal scaling.
- Simpler deployments.
- No shared session storage.

---

# Decision 014

## Title

Layered Service Architecture

## Status

Accepted

## Context

The Metadata Synchronization Service performs validation, path resolution, metadata processing, and MinIO interaction.

## Decision

The service shall follow a layered architecture comprising:

- Controllers
- Services
- Resolvers
- MinIO Client
- Utilities

Each component shall have a single responsibility.

## Reason

Improves maintainability, testing, and extensibility.

## Consequences

### Advantages

- Easier unit testing.
- Clear separation of concerns.
- Simplified future enhancements.