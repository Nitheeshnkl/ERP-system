# Security Self-Audit

## 1. NoSQL Injection
**Mitigation:** We use Mongoose schemas with strict typing which naturally sanitizes inputs and prevents operators like `$ne` from being passed directly as query objects when using standard queries.

## 2. Cross-Site Request Forgery (CSRF)
**Mitigation:** The application uses JWTs stored in `httpOnly` and `sameSite: strict` cookies, preventing the browser from sending the token with cross-site requests. Additionally, CORS is configured to only allow requests from the trusted `CLIENT_URL`.

## 3. Cross-Site Scripting (XSS)
**Mitigation:** We use `helmet` to set secure HTTP headers to mitigate risks.

## 4. Password Handling
**Mitigation:** Passwords are never stored in plaintext. They are hashed using `bcrypt` with a configurable number of salt rounds in a Mongoose `pre-save` hook before being persisted to the database.