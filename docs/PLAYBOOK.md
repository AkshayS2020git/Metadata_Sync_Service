# TCM ↔ MinIO Metadata Synchronization Playbook

**Version:** 1.0 (Draft)

---

# 1. Purpose

This document defines the standards, folder hierarchy, naming conventions, metadata resolution strategy, and integration requirements required for the Metadata Synchronization Service.

Any project following this standard will be compatible with the Metadata Synchronization Service without requiring project-specific code.

---

# 2. Objective

The Metadata Synchronization Service automatically synchronizes execution data from the Test Case Management (TCM) platform into the appropriate `metadata.json` file stored in MinIO.

The tester should never manually edit metadata files.

Workflow:

```
Tester
    │
Execute Test
    │
Update Status / Label / Date
    │
Click Submit
    │
TCM updates database
    │
Metadata Sync Service receives request
    │
Metadata updated inside MinIO
```

---

# 3. Guiding Principles

- TCM is the source of truth for execution data.
- MinIO stores metadata.
- Metadata Sync Service performs all synchronization.
- TCM must not contain MinIO-specific logic.
- Metadata Sync Service must not contain project-specific logic.
- Folder conventions should eliminate the need for project-specific implementations.

---

# 4. Bucket Naming Convention

Each project must have exactly one MinIO bucket.

Rules:

- Lowercase only
- No spaces
- No special characters where possible
- Bucket name should be a normalized version of the TCM project name

Examples

| TCM Project | Bucket |
|------------|--------|
| Legacy Ruckus | legacyruckus |
| Enterprise AP | enterpriseap |
| WiFi Controller | wificontroller |

---

# 5. Root Folder Structure

Every bucket must begin with:

```
<Project Bucket>

Test_Plan
```

`Test_Plan` is mandatory.

---

# 6. Version Folder

Immediately below `Test_Plan` should exist one or more customer/version folders.

Example

```
legacyruckus

Test_Plan
    V73
    V74
    V75
```

The Metadata Sync Service will automatically resolve the latest version unless the user explicitly overrides it.

---

# 7. Hierarchy Mirroring

Everything after the Version folder must mirror the hierarchy displayed within TCM.

Example

TCM

```
Run

R750

BSS COLORING

Verify BSS Color Advertisement
```

MinIO

```
legacyruckus

Test_Plan

V73

R750

BSS COLORING

Verify BSS Color Advertisement
```

Folder names should match exactly.

---

# 8. Metadata File Naming

Every metadata file must be named

```
metadata.json
```

Invalid

```
Metadata.json

metadata_v2.json

feature.json
```

Valid

```
metadata.json
```

---

# 9. Metadata Scope

The Metadata Sync Service supports two metadata storage strategies.

## Feature-Level Metadata

One metadata file represents the entire feature.

Example

```
BSS COLORING

metadata.json

TC-1

TC-2

TC-3
```

All executions update the same metadata file.

Example project:

Legacy Ruckus

---

## Test Case-Level Metadata

Each test case owns its own metadata.

Example

```
AP Testing

Connect 802.3af
    metadata.json

Client Connectivity
    metadata.json

Roaming
    metadata.json
```

Each execution updates only its corresponding metadata file.

---

# 10. Metadata Resolution Algorithm

The Metadata Sync Service shall use the following deterministic algorithm.

## Step 1

Resolve

```
Bucket

↓

Test_Plan

↓

Version

↓

Feature Folder
```

---

## Step 2

Check

```
Feature/metadata.json
```

Exists?

YES

↓

Update feature metadata.

STOP.

---

NO

↓

Continue.

---

## Step 3

Navigate into the selected test case.

Check

```
Feature/TestCase/metadata.json
```

Exists?

YES

↓

Update test case metadata.

STOP.

---

NO

↓

Return

```
Metadata file not found.
```

The service should never recursively search the bucket.

---

# 11. Metadata Sync Service Architecture

The Metadata Synchronization Service is implemented as a standalone application.

Responsibilities

- Receive synchronization requests
- Resolve metadata location
- Read metadata
- Update metadata
- Upload metadata
- Return synchronization result

The service communicates with TCM through REST APIs.

---

# 12. Payload Overview

TCM submits execution information for an entire feature.

The Metadata Sync Service decides whether the data should update

- Feature metadata
- Test case metadata

This decision is based solely on where `metadata.json` exists.

TCM should not contain any metadata resolution logic.

---

# 13. Version Resolution

Default

The Metadata Sync Service automatically resolves the latest version.

Override

If a tester specifies another version, that version should be used instead.

---

# 14. Adding a New Project

When onboarding a new project:

- Create project bucket
- Create Test_Plan folder
- Create version folders
- Mirror the TCM hierarchy
- Decide metadata scope
- Name every metadata file `metadata.json`

No service code changes should be required.

---

# 15. Compatibility Checklist

Before enabling synchronization verify

- Bucket naming convention followed
- Test_Plan exists
- Version folder exists
- Hierarchy mirrors TCM
- metadata.json naming correct
- Metadata scope selected
- Folder names match TCM
- Metadata path resolvable

---

# 16. Future-Proofing Guidelines

- Do not rename buckets.
- Do not rename metadata.json.
- Do not change folder hierarchy after Version.
- Keep TCM hierarchy synchronized with MinIO.
- Avoid project-specific implementations inside Metadata Sync Service.

---

# 17. Breaking Changes

The following changes require review before deployment.

## Bucket Renaming

Changing

```
legacyruckus
```

to

```
legacy_ruckus
```

breaks synchronization.

---

## Test_Plan Renaming

Changing

```
Test_Plan
```

to

```
Plans
```

breaks synchronization.

---

## Version Placement

Additional folders between

```
Test_Plan

↓

Version
```

are unsupported.

---

## Folder Renaming

Folder names must continue mirroring TCM.

---

## metadata.json Renaming

Only

```
metadata.json
```

is supported.

---

## Metadata Relocation

Only supported locations

Feature level

```
Feature

metadata.json
```

or

Test case level

```
Feature

Test Case

metadata.json
```

---

## Payload Contract Changes

Changes to the payload exchanged between TCM and Metadata Sync Service must be coordinated.

---

## Metadata Schema Changes

Changes to metadata.json schema may require updates to the Metadata Formatter.

---

# 18. Metadata Sync Service Modules

The service consists of the following logical components.

- Receiver
- MinIO Client
- Bucket Resolver
- Version Resolver
- Metadata Path Resolver
- Metadata Reader
- Metadata Writer
- Metadata Formatter
- Synchronization Orchestrator

Each module should have a single responsibility.

---

# 19. Compliance Requirement

Any project wishing to integrate with the Metadata Synchronization Service must comply with this standard.

Projects intentionally deviating from these conventions require documented exceptions and corresponding updates to the Metadata Synchronization Service before synchronization is enabled.