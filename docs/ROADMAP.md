# Metadata Synchronization Service Roadmap

**Version:** 2.0

---

# Project Objective

Develop a standalone Metadata Synchronization Service that automatically synchronizes execution data from the Test Case Management (TCM) platform into MinIO by locating, validating, updating, and synchronizing the appropriate `metadata.json` files without requiring project-specific implementations.

The service acts as an independent middleware between TCM and MinIO, encapsulating all storage-specific logic while allowing TCM to remain agnostic of the underlying metadata structure.

---

# Overall Workflow

```
Tester

↓

Update Execution

↓

Submit

↓

TCM updates execution

↓

Synchronization Payload Generated

↓

POST /sync

↓

Metadata Sync Service

↓

Resolve Bucket

↓

Resolve Version

↓

Resolve Metadata Path

↓

Validate Path

↓

Download metadata.json

↓

Duplicate Detection

↓

Merge Execution Metadata

↓

Upload metadata.json

↓

Return Synchronization Result

↓

Update Metadata Sync Status
```

---

# Sprint 1 — Service Foundation

## Objective

Create the standalone Metadata Synchronization Service.

### Completed

- [x] Express application scaffold
- [x] Layered architecture
- [x] Configuration management
- [x] Health endpoint
- [x] Synchronization endpoint
- [x] Initial project structure
- [x] Basic service testing

### Outcome

A standalone service capable of receiving synchronization requests through REST APIs.

---

# Sprint 2 — MinIO Infrastructure Layer

## Objective

Establish communication between the Metadata Synchronization Service and MinIO.

### Completed

- [x] Installed MinIO SDK
- [x] Environment configuration
- [x] Singleton MinIO client
- [x] Connectivity verification
- [x] Bucket existence validation
- [x] Bucket enumeration
- [x] Health endpoint integration

### Outcome

Reliable authenticated communication with MinIO established.

---

# Sprint 3 — Metadata Discovery Engine

## Objective

Translate synchronization requests into the correct metadata location.

### Completed

- [x] Bucket Resolver
- [x] Version Resolver
- [x] Object Key Resolver
- [x] Metadata Discovery Service
- [x] Automatic latest version resolution
- [x] Feature-Level Metadata support
- [x] Test Case-Level Metadata support
- [x] Run-Level Metadata support
- [x] Auto-generated metadata path
- [x] Custom MinIO path support
- [x] Folder path support
- [x] Explicit metadata.json path support

### Outcome

The service can accurately locate metadata without project-specific implementations.

---

# Sprint 4 — Metadata Reader / Writer Infrastructure

## Objective

Read and write metadata within MinIO.

### Completed

- [x] Metadata download helper
- [x] Metadata upload helper
- [x] JSON serialization
- [x] JSON parsing
- [x] Read existing metadata.json
- [x] Update metadata.json
- [x] End-to-end read/write verification

### Outcome

Reliable metadata persistence implemented.

---

# Sprint 5 — Metadata Update Engine

## Objective

Merge execution information into metadata.

### Completed

- [x] Payload validation
- [x] Metadata discovery
- [x] Metadata reading
- [x] Metadata merge
- [x] Metadata writing
- [x] Execution metadata extraction
- [x] Metadata formatter
- [x] End-to-end synchronization

### Payload

#### Routing Fields

- project
- versionOverride
- testRun
- feature
- testCase
- run
- custom_minio_path

#### Metadata Fields

- case_ref_id
- status
- label
- executedBy
- executedAt
- firmware
- overwrite

### Outcome

Execution data is successfully merged into metadata before upload.

---

# Sprint 6 — Metadata Validation & Conflict Resolution

## Objective

Improve synchronization reliability through validation and duplicate handling.

### Completed

- [x] metadata.json existence validation
- [x] Invalid folder detection
- [x] Invalid path detection
- [x] Detailed validation errors
- [x] Duplicate case_ref_id detection
- [x] HTTP 409 duplicate response
- [x] Overwrite request support
- [x] Metadata replacement on overwrite

### Outcome

The service safely prevents accidental duplicate metadata while allowing controlled overwrites.

---

# Sprint 7 — TCM Integration

## Objective

Integrate Metadata Synchronization Service into TCM.

### Completed

- [x] Synchronization payload generation
- [x] Submit workflow integration
- [x] Metadata synchronization trigger
- [x] Synchronization response handling
- [x] Synchronization status tracking
- [x] Metadata sync error storage
- [x] Frontend overwrite confirmation
- [x] Retry synchronization with overwrite
- [x] Submit button state management
- [x] Error propagation to UI

### Outcome

Submitting an execution automatically synchronizes metadata while providing user feedback for conflicts and failures.

---

# Sprint 8 — Validation & Production Hardening

## Objective

Prepare the Metadata Synchronization Service for production deployment.

### Completed

- [x] End-to-end synchronization validation
- [x] Request validation
- [x] Error propagation
- [x] Synchronization logging
- [x] Production-ready API contract
- [x] Developer documentation
- [x] Integration playbook

### Remaining

- [ ] Performance benchmarking
- [ ] Load testing
- [ ] Automated integration tests
- [ ] Retry queue
- [ ] Audit logging

### Outcome

The Metadata Synchronization Service is functionally production-ready and documented for future maintenance.

---

# Future Enhancements

Potential future improvements include:

- [ ] Retry queue
- [ ] Metadata preview endpoint
- [ ] Synchronization history
- [ ] Bulk synchronization
- [ ] Metadata version history
- [ ] Rollback support
- [ ] Audit logging
- [ ] Metrics dashboard
- [ ] Webhook notifications
- [ ] Scheduled synchronization jobs
- [ ] Synchronization analytics

---

# Current Progress

| Sprint | Status |
|---------|--------|
| Sprint 1 — Service Foundation | ✅ Completed |
| Sprint 2 — MinIO Infrastructure Layer | ✅ Completed |
| Sprint 3 — Metadata Discovery Engine | ✅ Completed |
| Sprint 4 — Metadata Reader / Writer Infrastructure | ✅ Completed |
| Sprint 5 — Metadata Update Engine | ✅ Completed |
| Sprint 6 — Metadata Validation & Conflict Resolution | ✅ Completed |
| Sprint 7 — TCM Integration | ✅ Completed |
| Sprint 8 — Validation & Production Hardening | 🟡 Completed (Future enhancements pending) |

---

# Milestone Summary

## Milestone 1

✔ Standalone Metadata Synchronization Service operational.

## Milestone 2

✔ Secure communication established with MinIO.

## Milestone 3

✔ Automatic metadata discovery implemented.

## Milestone 4

✔ Automatic metadata synchronization implemented.

## Milestone 5

✔ Validation, duplicate detection, and overwrite workflow completed.

## Milestone 6

✔ Fully integrated Submit-based synchronization between TCM and MinIO.

## Final Milestone

🟡 Production-ready Metadata Synchronization Service with documented architecture, deployment standards, and future enhancement roadmap.