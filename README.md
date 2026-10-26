# SATYAPAN (सत्यापन) — SIH 2026 Official Technical Submission

> **AICTE Enrolment Integrity & APAAR Continuous Verification System**  
> Problem Statement: Elimination of Ghost Admissions, Intake Ceilings Compliance & DPDP Act 2023 Gated Verification.

---

## 🚀 Live Demo & Quick Launch

The production server is currently built and running locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

### Key Portals
- **Landing / Unified Command Center**: [http://localhost:3000](http://localhost:3000)
- **AICTE Central Control Tower**: [http://localhost:3000/aicte](http://localhost:3000/aicte)
- **Institution Seat Ledger & Roster**: [http://localhost:3000/institution](http://localhost:3000/institution)
- **Bulk CSV Data Ingestion**: [http://localhost:3000/institution/upload](http://localhost:3000/institution/upload)
- **Consent-Gated QR Verification**: [http://localhost:3000/verify](http://localhost:3000/verify)
- **Tamper-Evident Security & Audit Trail**: [http://localhost:3000/audit](http://localhost:3000/audit)

---

## 🛡️ Hackathon Evaluation Quick Test Tokens

| Token / Roll | Scenario Demonstrated | What to Observe |
| :--- | :--- | :--- |
| `SATYA-2026-TCS` | Employer Background Check | DPDP Act consent gate. Candidate details withheld until student grants digital consent. |
| `STU-10` | Invalid APAAR ID | 5-digit identifier (`12345`) triggers `INVALID_APAAR` high flag. |
| `STU-20` | Multi-College Double Admission | Student enrolled simultaneously at Sunrise Institute and Nova Engineering College triggers `CROSS_INSTITUTION_OVERLAP` critical flag. |
| `STU-30` | Late Admission Cutoff Breach | Admission date (`2026-12-01`) recorded past October 15 reporting deadline triggers `LATE_ADMISSION`. |
| `STU-40` | Nationality Discrepancy | NRI status without category documentation triggers `NATIONALITY_INCONSISTENCY`. |

---

## ⚡ Zero-Crash Architecture: Dual-Engine Design

1. **Live Supabase Mode**:
   When `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided in `.env.local`, the platform queries live Supabase tables and triggers the PostgreSQL stored procedure `run_integrity_checks()`.
2. **Resilient Local Simulation Mode (Offline Hackathon Mode)**:
   If keys are not configured or if the venue Wi-Fi drops, Satyapan automatically falls back to its built-in in-memory engine pre-seeded with 5 accredited institutions, 301 students, and the exact demo anomalies. **The platform never crashes with a 500 connection refused.**

---

## 🔒 Cybersecurity & Regulatory Compliance (DPDP Act 2023)

- **CWE-1236 CSV Formula Injection Defense**: All uploaded spreadsheet inputs are sanitized by neutralizing spreadsheet formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`).
- **APAAR 12-Digit Masking**: Full APAAR numbers are masked as `XXXX-XXXX-1234` in compliance with DPDP Act 2023.
- **Privacy-Preserving Selective Disclosure**: Employers and verifiers only see confirmation of enrollment, program, college, and academic year. Sensitive PII (caste, gender, DOB) is withheld.
- **Tamper-Evident Audit Ledger**: All actions are logged into `audit_logs` and `admission_events`.

---

## 📦 Setting Up Supabase Database (Person A)

1. Open your Supabase project SQL Editor.
2. Run the SQL script located in `supabase/schema.sql` (Creates tables, enums, indexes, `run_integrity_checks()` function, and views).
3. Run the seed script in `supabase/seed.sql` (Populates 5 institutions, 300 students, and the 4 hackathon test anomalies).
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key** into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

---

## 🚀 Deployment to Vercel (Person B)

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/satyapan-sih.git
   git push -u origin main
   ```
2. Import the repository into [Vercel](https://vercel.com).
3. Add the three environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**.

---

## 🎙️ What to Say During the Hackathon Demo

> *"AICTE currently receives mostly claimed enrolment numbers from institutions. Satyapan converts those numbers into confirmed student-level records linked to APAAR ID."*
>
> *"Colleges upload admission data through CSV or API. Our system validates APAAR IDs, tracks approved intake through a Seat Ledger, and automatically detects duplicate admissions, excess enrolment, category inconsistencies, and late admissions."*
>
> *"Instead of simply marking a record as suspicious, every student receives an Integrity Score with clear reasons and recommended actions. AICTE gets a real-time Control Tower, institutions get a portal to resolve issues, and employers can verify students through consent-based QR verification."*
>
> *"We integrate with the APAAR, ABC, and DigiLocker ecosystem rather than replacing it. Our contribution is the missing enrolment-integrity layer that helps AICTE move from annual reporting to continuous, trustworthy verification."*
