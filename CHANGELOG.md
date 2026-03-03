# Changelog

All notable project-level updates are listed here.

## 2026-03-03
### Fixed
- Sales Order and Purchase Order create/update mode confusion in frontend save handlers.
- `Invalid order id` trigger during create flow by ensuring update is only selected when a non-empty order id exists.
- Form reset behavior after dialog close/save to clear create form state without carrying stale ids.

### Added
- Temporary debug logs for troubleshooting order saves:
  - Frontend: `SAVE MODE: CREATE|UPDATE`
  - Backend: `[DEBUG CREATE] body` and `[DEBUG UPDATE] id`

### Confirmed Behavior
- Create flows use `POST /sales-orders` and `POST /purchase-orders` without requiring order id.
- Update flows use `PUT /sales-orders/:id` and `PUT /purchase-orders/:id` with id validation.

## 2026-03-02
### Improved
- Multi-line item handling for Sales Orders and Purchase Orders in frontend and backend payload normalization.

## 2026-03-01
### Fixed
- Boolean mode-check bug in order save flow by replacing truthy checks with explicit non-empty id checks.
