# Monitoring Recommendations

## Backend
- Use the `/health` endpoint for uptime checks.
- Track response latency and error rates.
- Alert on repeated restarts or failed deploys.

## Frontend
- Enable Web Vitals monitoring in Vercel.
- Add basic uptime checks on the public URL.
- Track client-side API error rates.

## Error Tracking
- Add Sentry (optional) to capture backend and frontend exceptions.
- Route alerts to email or chat for high-severity issues.

## Operational Routine
- Run `infra/scripts/prod-healthcheck.sh` after each deployment.
- Maintain a short smoke-test checklist for core flows.
