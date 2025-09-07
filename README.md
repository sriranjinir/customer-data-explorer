# Customer Data Explorer

## Features
- Paginated customer list
- TypeScript + React + React Query
- AWS Lambda backend (Serverless framework)
- Unit tests (Vitest / Jest)
- Deploy to S3 + CloudFront and Lambda via Serverless

install:
backend: npm install -D serverless serverless-offline serverless-esbuild
frontend: npm install

## Local dev
1. Start backend: cd backend && npm ci && npx serverless offline
2. Start frontend: cd frontend && npm ci && npm run dev

## Tests
- Frontend: cd frontend && npm run test
- Backend: cd backend && npm run test

## Deploy
- Configure AWS creds in env/GitHub Secrets
- cd backend && npx serverless deploy
- cd frontend && npm run build && aws s3 sync dist/ s3://my-bucket


Considerations:
=================

1. I am developing CI/CD pipeline for this, may commit the code later
2. Filtering can be enabled in the Column header, which saves space in the page. 

