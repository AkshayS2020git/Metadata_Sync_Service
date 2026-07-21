# Metadata Synchronization Service

A standalone Node.js Express service responsible for synchronizing Test Case Management (TCM) execution metadata to MinIO storage.

## Features

- Metadata synchronization to MinIO
- Custom MinIO path support
- Metadata validation
- Duplicate `case_ref_id` detection
- Overwrite support
- Synchronization status tracking
- REST API integration with TCM

## Tech Stack

- Node.js
- Express.js
- MinIO SDK

## Project Structure

```
metadata-sync-service/
├── docs/
├── src/
├── package.json
├── .env.example
└── README.md
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file using `.env.example`.

Example:

```env
PORT=3000

MINIO_ENDPOINT=
MINIO_PORT=
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
```

## Running the Service

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## Documentation

Project documentation is available in the `docs/` folder:

- Playbook
- Roadmap
- Architecture Decisions
- API Documentation (if available)

## Author

Developed as part of an internship project at Alethea Communications Pvt. Ltd.