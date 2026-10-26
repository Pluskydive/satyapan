-- ============================================================================
-- SATYAPAN (सत्यापन) - Seed Data & Intentional Anomaly Demonstrations
-- SIH 2026 - Official Demo Dataset
-- ============================================================================

-- Clean up any prior runs
truncate table admission_events cascade;
truncate table audit_logs cascade;
truncate table verification_requests cascade;
truncate table validation_flags cascade;
truncate table students cascade;
truncate table institutions cascade;

-- Step 10: Insert Accredited Technical Institutions
insert into institutions (aicte_code, name, state, district, approved_intake, supernumerary_capacity)
values
('AICTE-1001', 'Sunrise Institute of Technology', 'Maharashtra', 'Pune', 240, 10),
('AICTE-1002', 'Nova Engineering College', 'Karnataka', 'Bengaluru', 180, 5),
('AICTE-1003', 'Ganga Institute of Management', 'Uttar Pradesh', 'Lucknow', 120, 4),
('AICTE-1004', 'Deccan Polytechnic', 'Telangana', 'Hyderabad', 300, 12),
('AICTE-1005', 'Kaveri Institute of Technology', 'Tamil Nadu', 'Coimbatore', 200, 8);

-- Step 11: Seed Baseline Students (300 students for AICTE-1001)
insert into students (
    apaar_id, institutional_student_id, institution_id, full_name,
    dob_year, gender, social_category, nationality_type, program,
    admission_year, admission_date, enrolment_status
)
select
    lpad((100000000000 + row_number() over ())::text, 12, '0'),
    'STU-' || row_number() over (),
    (select id from institutions where aicte_code = 'AICTE-1001'),
    'Student ' || row_number() over (),
    2004 + ((row_number() over ()) % 4),
    case when (row_number() over ()) % 2 = 0 then 'Female' else 'Male' end,
    case when (row_number() over ()) % 4 = 0 then 'OBC'
         when (row_number() over ()) % 4 = 1 then 'General'
         when (row_number() over ()) % 4 = 2 then 'SC'
         else 'ST' end,
    'indian',
    case when (row_number() over ()) % 3 = 0 then 'B.Tech CSE'
         when (row_number() over ()) % 3 = 1 then 'B.Tech ECE'
         else 'B.Tech Mechanical' end,
    2026,
    date '2026-07-01' + cast(((row_number() over ()) % 60) as integer),
    'verified'
from generate_series(1, 300);

-- Step 12: Inject Intentional Anomalies for Hackathon Evaluation

-- 12.1 Anomaly 1: Invalid APAAR ID (Malformed 5-digit ID instead of 12)
update students
set apaar_id = '12345'
where institutional_student_id = 'STU-10';

-- 12.2 Anomaly 2: Cross-Institution Overlap (Double Admission / Ghost Enrolment)
-- Enrol STU-20 simultaneously in Nova Engineering College (AICTE-1002)
insert into students (
    apaar_id, institutional_student_id, institution_id, full_name,
    program, admission_year, admission_date, enrolment_status
)
select
    apaar_id,
    'STU-DUP-1',
    (select id from institutions where aicte_code = 'AICTE-1002'),
    full_name,
    'B.Tech AI-ML',
    2026,
    current_date,
    'verified'
from students
where institutional_student_id = 'STU-20';

-- 12.3 Anomaly 3: Late Admission past October 15 cutoff
update students
set admission_date = '2026-12-01'
where institutional_student_id = 'STU-30';

-- 12.4 Anomaly 4: Nationality / Category Inconsistency (NRI missing quota documents)
update students
set nationality_type = 'nri', social_category = null
where institutional_student_id = 'STU-40';

-- Execute initial integrity engine validation to generate initial flags and calculate scores
select run_integrity_checks();
