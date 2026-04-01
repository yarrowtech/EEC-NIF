# School Registration Security Observability Baseline

## Structured Log Fields
- `event`: `http_request_start`, `http_request_complete`, `school_registration_event`, `security_event`, `auth_event`
- `requestId`: cross-log request correlation
- `traceId`: cross-service correlation
- `action`: threat or business action (`school_registration.submit_attempt`, `security.rate_limit_triggered`)
- `outcome`: `success`, `failure`, `blocked`, `observed`
- `severity`: `low`, `medium`, `high`, `critical` (for `security_event`)
- `ip`, `remoteIp`, `ipSource`, `forwardedForChain`, `forwardedForCount`
- `userAgent`, `method`, `path`, `statusCode`
- `tokenHash`, `tokenId`, `tokenSubject` for replay telemetry events

## SIEM Detection Rules
1. `Distributed Brute Force`
- Condition: `event=auth_event` and `action=login` and `outcome=failure`
- Threshold: same `identifier` from `>= 5` distinct IPs in `10m`
- Severity: `high`

2. `Registration Payload Injection`
- Condition: `event=security_event` and `action=security.injection_payload_blocked`
- Threshold: `>= 3` occurrences per IP in `5m`
- Severity: `high`

3. `Rate Limit Attack`
- Condition: `event=security_event` and `action=security.rate_limit_triggered`
- Threshold: `>= 10` events per IP in `5m`
- Severity: `medium`

4. `Header Spoofing Pattern`
- Condition: `event=security_event` and `action=security.header_forwarding_suspicious`
- Threshold: any + known scanner UA keywords (`sqlmap`, `scanner`, `bot`)
- Severity: `medium`

5. `Malformed JSON Probe`
- Condition: `event=security_event` and `action=security.malformed_json_payload`
- Threshold: `>= 5` events per IP in `5m`
- Severity: `medium`

6. `Token Replay Suspected`
- Condition: `event=security_event` and `action=security.token_replay_suspected`
- Threshold: `>= 2` events per `tokenHash` in `5m`
- Severity: `critical`

## Alert Conditions (Pager/Slack)
1. `critical`: `Distributed Brute Force` OR `Registration Payload Injection` triggered.
2. `high`: `Rate Limit Attack` + `Header Spoofing Pattern` from same source within 10m.
3. `medium`: sustained malformed JSON from same IP over 15m.

## Suspicious Pattern Example
- Pattern: stealth distributed abuse
- Signal:
  - many `school_registration.submit_attempt` with `outcome=success` but high `validation_failed` or `blocked_dangerous_payload`
  - low volume per IP, high total unique IP count
- Query logic:
  - group by `path` over 15m
  - compute `unique(ip)`, `count(action=validation_failed)`, `count(action=blocked_dangerous_payload)`
  - alert if `unique(ip) >= 20` and combined failures `>= 50`

## Hardening Checklist
1. Keep request/trace IDs generated before body parsing middleware.
2. Set `TRUST_PROXY` to a known proxy depth or CIDR list in production.
3. Prefer trusted proxy chain parsing at ingress, avoid direct client trust of `x-forwarded-for`.
4. Keep rate limits keyed by multiple dimensions (`ip`, `path`, optional account fingerprint).
5. Maintain redaction in logs for credentials and sensitive fields.
6. Ship logs to SIEM with immutable retention and alert routing.
7. Run attack regression with `npm run security:suite` after auth/rate-limit changes.
