# Metadata Synchronization Service Roadmap

**Version:** 1.0

---

# Project Objective

Develop a standalone Metadata Synchronization Service that automatically synchronizes execution data from the Test Case Management (TCM) platform into MinIO by locating and updating the appropriate `metadata.json` files without requiring project-specific implementations.

---

# Overall Workflow

```
Tester

↓

Update Execution

↓

Submit

↓

TCM

↓

POST /sync

↓

Metadata Sync Service

↓

Resolve Bucket

↓

Resolve Version

↓

Discover metadata.json

↓

Read metadata

↓

Update metadata

↓

Write metadata

↓

Success Response
```

---

# Sprint 1 — Service Foundation

## Objective

Create the standalone Metadata Synchronization Service.

### Deliverables

- [x] Express application scaffold
- [x] Layered architecture
- [x] Configuration management
- [x] Health endpoint
- [x] Synchronization endpoint
- [x] Initial project structure
- [x] Unit tests

### Outcome

A standalone service capable of receiving synchronization requests.

---

# Sprint 2 — MinIO Infrastructure Layer

## Objective

Establish communication between the Metadata Synchronization Service and MinIO.

### Deliverables

- [x] Install MinIO SDK
- [x] Environment configuration
- [x] Singleton MinIO client
- [x] MinIO connectivity verification
- [x] Bucket enumeration
- [x] Bucket existence verification
- [x] Health endpoint integration
- [x] Temporary bucket discovery endpoint

### Outcome

Successfully established authenticated communication with the MinIO server.

---

# Sprint 3 — Metadata Discovery Engine

## Objective

Translate synchronization requests into the corresponding MinIO metadata location through a modular resolver pipeline.

### Completed

- [x] Bucket Resolver
- [x] Version Resolver
- [x] Object Key Resolver
- [x] Metadata Service
- [x] Discovery Service
- [x] Support Feature-Level metadata
- [x] Support Test-Case-Level metadata
- [x] Support Run-level metadata
- [x] Automatic latest version discovery
### Outcome

The service can automatically resolve the project bucket, determine the latest available version, construct the expected MinIO object key, and prepare metadata discovery.

---

# Sprint 4 — Metadata Reader/Write Infrastructure 

## Objective

Read metadata from MinIO.

### Completed

- [x] Implemented MinIO putObject helper
- [x] Added writeMetadata service
- [x] Implemented JSON serialization for metadata updates
- [x] Verified end-to-end metadata read/write
- [x] Successfully updated existing metadata.json in MinIO

### Outcome

Metadata can be safely retrieved from MinIO.

---

# Sprint 5 — Metadata Update Engine

## Objective

Update metadata with execution information.

### Deliverables

- [ ] Metadata Formatter
- [ ] Merge execution data
- [ ] Feature-level updates
- [ ] Test case-level updates
- [ ] Metadata validation

### Finalized Payload

#### Routing Fields
- project
- versionOverride (optional)
- testRun
- feature
- testCase (optional)
- run

#### Metadata Fields
- label
- status
- executedBy
- executedAt

### Outcome

Execution data is merged into metadata before upload.

---

# Sprint 6 — Metadata Writer

## Objective

Persist updated metadata into MinIO.

### Deliverables

- [ ] Upload metadata.json
- [ ] Object overwrite
- [ ] Upload validation
- [ ] Error handling
- [ ] Rollback strategy (if required)

### Outcome

Updated metadata is written back to MinIO.

---

# Sprint 7 — TCM Integration

## Objective

Integrate the Metadata Synchronization Service with TCM.

### Deliverables

- [ ] Build final synchronization payload
- [ ] Trigger synchronization from Submit
- [ ] Handle synchronization responses
- [ ] Logging
- [ ] Failure handling

### Outcome

Submitting execution data in TCM automatically synchronizes metadata.

---

# Sprint 8 — Validation & Production Hardening

## Objective

Prepare the service for production deployment.

### Deliverables

- [ ] End-to-end testing
- [ ] Integration testing
- [ ] Logging improvements
- [ ] Configuration review
- [ ] Documentation updates
- [ ] Performance validation
- [ ] Security review

### Outcome

Production-ready Metadata Synchronization Service.

---

# Future Enhancements

Potential future improvements include:

- [ ] Metadata preview endpoint
- [ ] Path resolution endpoint
- [ ] Version browsing endpoint
- [ ] Manual synchronization endpoint
- [ ] Retry queue
- [ ] Synchronization history
- [ ] Audit logging
- [ ] Parallel synchronization
- [ ] Webhook notifications

---

# Current Progress

| Sprint | Status |
|---------|--------|
| Sprint 1 — Service Foundation | ✅ Completed |
| Sprint 2 — MinIO Infrastructure Layer | ✅ Completed |
| Sprint 3 — Metadata Discovery Engine | ⏳ Planned |
| Sprint 4 — Metadata Reader | ⏳ Planned |
| Sprint 5 — Metadata Update Engine | ⏳ Planned |
| Sprint 6 — Metadata Writer | ⏳ Planned |
| Sprint 7 — TCM Integration | ⏳ Planned |
| Sprint 8 — Validation & Production Hardening | ⏳ Planned |

---

# Milestone Summary

## Milestone 1

✔ Standalone Metadata Synchronization Service operational.

## Milestone 2

✔ Authenticated communication established with MinIO.

## Milestone 3

⬜ Automatic metadata discovery.

## Milestone 4

⬜ Automatic metadata synchronization.

## Final Milestone

⬜ Fully integrated TCM ↔ MinIO Metadata Synchronization Service.