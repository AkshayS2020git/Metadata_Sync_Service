# Metadata Synchronization Service

A standalone Node.js Express service responsible for synchronizing Test Case Management (TCM) execution metadata to MinIO storage.

## Features

- Metadata synchronization to MinIO
- Custom MinIO path support
- Metadata validation
- Duplicate `case_ref_id` detection
- Overwrite support
- Synchronization status tracking
- REST API integration with the Test Case Management (TCM) platform

## Tech Stack

- Node.js
- Express.js
- Express
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

Install the project dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file using `.env.example` and configure the required values.

Example:

```env
PORT=3000

MINIO_ENDPOINT=
MINIO_PORT=
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
```

## Local Development Configuration

This project was developed and tested locally alongside the Test Case Management (TCM) platform.

For local development:

- Configure the Metadata Synchronization Service to run on its local development port in the `.env` file.
- Update the corresponding `.env` file in the TCM platform so that the Metadata Synchronization Service URL points to the locally running service (for example, `http://localhost:<PORT>`).
- Ensure both the TCM platform and the Metadata Synchronization Service are running simultaneously before attempting metadata synchronization.

> **Note:** The current localhost configuration is intended only for local development. When deploying to another environment, replace the localhost URLs and ports with the appropriate server addresses and ports.

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

Additional project documentation is available in the `docs/` directory:

- Playbook
- Roadmap
- Architecture Decisions
- API Documentation (if applicable)

## Author

Developed as part of an internship project at **Alethea Communications Pvt. Ltd.**