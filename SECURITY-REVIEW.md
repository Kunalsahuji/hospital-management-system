# Security Review

## Scope

Reviewed the hospital management system's frontend, backend, API routes and
controllers, authentication and authorization, Mongoose models, configuration,
and deployment-related settings.

## Findings

### HIGH — Authenticated users can access all patient records

- **Location:** `backend/src/routes/userRoutes.js:9`,
  `backend/src/controllers/userController.js:44-55`
- **Confidence:** 10/10
- **Issue:** `GET /api/users/patients` is protected only by authentication. Any
  authenticated account can retrieve every patient record. The response omits
  passwords but includes sensitive personal information such as email, phone,
  date of birth, gender, and address.
- **Contributing issue:** Public registration accepts `role: "doctor"` at
  `backend/src/validators/userValidator.js:21` and
  `backend/src/routes/authRoutes.js:6`. Therefore, adding a doctor-role check
  alone would not ensure that an account belongs to a verified clinician.
- **Recommended remediation:** Restrict patient-list access to verified,
  authorized clinicians; scope returned patients to an appropriate care
  relationship; and return only the minimum fields needed for that workflow.
  Doctor privileges should be granted through a trusted verification process,
  not solely through public self-registration.

No other evidence-backed vulnerabilities were identified during this review.
