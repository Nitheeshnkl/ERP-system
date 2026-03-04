# Monitoring Recommendations

## Render
- Configure health check endpoint to `/health`.
- Enable service alerts for deployment failures and downtime.
- Track response latency and restart frequency.

## Vercel
- Enable Vercel Analytics and Web Vitals monitoring.
- Add uptime checks against frontend public URL.
- Monitor client-side API error rates in browser logs.

## Application errors (Sentry)
- Add backend SDK using `SENTRY_DSN` env var (optional).
- Add frontend SDK in Vite app with release tagging.
- Configure alert routing (email/Slack/PagerDuty) for high-severity issues.

## Baseline operational checks
- Run `infra/scripts/prod-healthcheck.sh` after each deploy.
- Maintain simple smoke test checklist for login + core pages.
- Store incident runbook and rollback commands in your team docs.
