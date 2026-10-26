-- ============================================================================
-- SATYAPAN (सत्यापन) - Core Database Schema & Integrity Engine
-- SIH 2026 - AICTE Enrolment Integrity & APAAR Verification System
-- ============================================================================

-- Step 4.1: Institutions Table
create table if not exists institutions (
    id uuid primary key default gen_random_uuid(),
    aicte_code text unique not null,
    name text not null,
    state text not null,
    district text,
    approved_intake int not null default 0,
    supernumerary_capacity int not null default 0,
    status text not null default 'active',
    created_at timestamptz not null default now()
);

-- Step 4.2: Enums and Students Table
do $$ begin
    create type admission_status as enum (
        'draft',
        'pending_apaar_validation',
        'verified',
        'flagged',
        'withdrawn',
        'migrated'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type nationality_type as enum (
        'indian',
        'nri',
        'oci',
        'foreign_national'
    );
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type flag_severity as enum (
        'low',
        'medium',
        'high',
        'critical'
    );
exception
    when duplicate_object then null;
end $$;

create table if not exists students (
    id uuid primary key default gen_random_uuid(),
    apaar_id varchar(12),
    institutional_student_id text not null,
    institution_id uuid not null references institutions(id) on delete cascade,
    full_name text not null,
    dob_year int,
    gender text,
    social_category text,
    nationality_type nationality_type not null default 'indian',
    program text not null,
    admission_year int not null,
    admission_date date,
    enrolment_status admission_status not null default 'draft',
    integrity_score int not null default 100,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (institution_id, institutional_student_id, admission_year)
);

-- Step 4.3: Validation Flags Table
create table if not exists validation_flags (
    id uuid primary key default gen_random_uuid(),
    student_id uuid references students(id) on delete cascade,
    institution_id uuid references institutions(id) on delete cascade,
    rule_code text not null,
    severity flag_severity not null default 'medium',
    title text not null,
    explanation text not null,
    recommended_action text not null,
    status text not null default 'open',
    created_at timestamptz not null default now()
);

-- Step 4.4: Verification Requests Table (Employer Consent-based Verification)
create table if not exists verification_requests (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    verifier_type text not null,
    verifier_name text,
    purpose text not null,
    requested_fields jsonb not null default '[]'::jsonb,
    disclosed_fields jsonb not null default '{}'::jsonb,
    consent_granted boolean not null default false,
    result text not null default 'pending',
    verification_code text unique not null default encode(gen_random_bytes(8), 'hex'),
    created_at timestamptz not null default now()
);

-- Step 4.5: Tamper-Evident Audit Logs Table
create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid,
    actor_role text,
    action text not null,
    entity text not null,
    entity_id uuid,
    before_data jsonb,
    after_data jsonb,
    created_at timestamptz not null default now()
);

-- Step 4.6: Admission Events History Table
create table if not exists admission_events (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references students(id) on delete cascade,
    institution_id uuid not null references institutions(id) on delete cascade,
    event_type text not null,
    payload jsonb not null default '{}'::jsonb,
    actor_role text not null default 'institution_staff',
    created_at timestamptz not null default now()
);

-- Step 4.7: Indexes for Search Performance
create index if not exists idx_students_apaar on students(apaar_id);
create index if not exists idx_students_institution on students(institution_id);
create index if not exists idx_students_status on students(enrolment_status);
create index if not exists idx_flags_student on validation_flags(student_id);
create index if not exists idx_flags_institution on validation_flags(institution_id);

-- ============================================================================
-- PART 2: INTEGRITY ENGINE FUNCTION (Step 5)
-- ============================================================================
create or replace function run_integrity_checks()
returns void as $$
begin
    -- Reset all open flags prior to re-validation
    delete from validation_flags where status = 'open';

    -- 1. Check for Invalid or Missing APAAR ID
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'INVALID_APAAR', 'high',
        'Invalid or missing APAAR ID',
        'APAAR ID is missing or is not a valid 12-digit identifier.',
        'Institution should correct the APAAR ID or initiate APAAR creation.'
    from students s
    where s.apaar_id is null
       or s.apaar_id !~ '^[0-9]{12}$';

    -- 2. Check for Duplicate APAAR within the same Institution
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'DUPLICATE_APAAR_IN_INSTITUTION', 'high',
        'Duplicate APAAR ID within institution',
        'The same APAAR ID is used by multiple student records in this institution.',
        'Merge duplicate records after verification.'
    from students s
    join (
        select apaar_id, institution_id
        from students
        where apaar_id is not null
        group by apaar_id, institution_id
        having count(*) > 1
    ) d on d.apaar_id = s.apaar_id and d.institution_id = s.institution_id;

    -- 3. Check for Cross-Institution Overlap (Ghost Admissions)
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'CROSS_INSTITUTION_OVERLAP', 'critical',
        'Potential enrolment overlap across institutions',
        'The same APAAR ID appears in more than one active institution record.',
        'Classify as Allowed, Review, or Violation after verification.'
    from students s
    join (
        select apaar_id
        from students
        where apaar_id is not null
          and enrolment_status in ('verified', 'flagged')
        group by apaar_id
        having count(distinct institution_id) > 1
    ) d on d.apaar_id = s.apaar_id;

    -- 4. Check for Excess Enrolment Over Approved Intake + Supernumerary
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'EXCESS_ENROLMENT', 'critical',
        'Enrolment exceeds approved capacity',
        'Active enrolment exceeds approved intake plus supernumerary capacity.',
        'AICTE review required; institution must justify additional admissions.'
    from students s
    join (
        select i.id as institution_id
        from institutions i
        join students s on s.institution_id = i.id
           and s.enrolment_status in ('verified', 'flagged')
        group by i.id
        having count(s.id) > i.approved_intake + i.supernumerary_capacity
    ) e on e.institution_id = s.institution_id;

    -- 5. Check for Nationality / Category Inconsistency
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'NATIONALITY_INCONSISTENCY', 'medium',
        'Nationality/category inconsistency',
        'Student is marked NRI, OCI, or Foreign National but category data is missing.',
        'Request corrected category documentation.'
    from students s
    where s.nationality_type <> 'indian'
      and (s.social_category is null or s.social_category = '');

    -- 6. Check for Late Admission beyond October 15 Cutoff
    insert into validation_flags (
        student_id, institution_id, rule_code, severity, title,
        explanation, recommended_action
    )
    select
        s.id, s.institution_id, 'LATE_ADMISSION', 'medium',
        'Admission recorded after reporting deadline',
        'Admission date is after the standard reporting deadline.',
        'Institution must provide approval or correction.'
    from students s
    where s.admission_date > make_date(s.admission_year, 10, 15);

    -- 7. Recalculate Student Integrity Scores based on triggered penalties
    update students s
    set integrity_score = 100 - coalesce(f.penalty, 0)
    from (
        select student_id,
            sum(case severity
                when 'low' then 5
                when 'medium' then 15
                when 'high' then 30
                when 'critical' then 50
            end) as penalty
        from validation_flags
        where status = 'open' and student_id is not null
        group by student_id
    ) f
    where f.student_id = s.id;

    -- Reset unflagged students score back to 100 if no active flags
    update students
    set integrity_score = 100
    where id not in (
        select student_id from validation_flags where status = 'open' and student_id is not null
    );

    -- 8. Auto-flag students whose Integrity Score drops below 70 threshold
    update students
    set enrolment_status = 'flagged'
    where integrity_score < 70
      and enrolment_status = 'verified';

    -- Reset status to verified if score recovered
    update students
    set enrolment_status = 'verified'
    where integrity_score >= 70
      and enrolment_status = 'flagged';
end;
$$ language plpgsql;

-- ============================================================================
-- PART 3: DASHBOARD REPORTING VIEWS (Steps 7, 8, 9)
-- ============================================================================

-- Step 7: Institution Summary View
create or replace view v_institution_summary as
select
    i.id,
    i.aicte_code,
    i.name,
    i.state,
    i.approved_intake,
    i.supernumerary_capacity,
    count(s.id) filter (where s.enrolment_status in ('verified','flagged')) as actual_enrolment,
    count(s.id) filter (where s.enrolment_status = 'flagged') as flagged_students,
    count(s.id) filter (where s.nationality_type = 'nri') as nri_students,
    count(s.id) filter (where s.nationality_type = 'oci') as oci_students,
    count(s.id) filter (where s.nationality_type = 'foreign_national') as fn_students,
    round(coalesce(avg(s.integrity_score), 100.0), 1) as avg_integrity_score
from institutions i
left join students s on s.institution_id = i.id
group by i.id;

-- Step 8: National Summary View
create or replace view v_national_summary as
select
    count(distinct institution_id) as institutions_reporting,
    count(*) as total_students,
    count(*) filter (where enrolment_status = 'verified') as verified_students,
    count(*) filter (where enrolment_status = 'flagged') as flagged_students,
    count(*) filter (where nationality_type = 'nri') as nri_students,
    count(*) filter (where nationality_type = 'oci') as oci_students,
    count(*) filter (where nationality_type = 'foreign_national') as fn_students,
    round(coalesce(avg(integrity_score), 100.0), 1) as avg_integrity_score
from students;

-- Step 9: State Summary View
create or replace view v_state_summary as
select
    i.state,
    count(distinct i.id) as institutions,
    count(s.id) as students,
    count(s.id) filter (where s.enrolment_status = 'flagged') as flagged_students,
    round(coalesce(avg(s.integrity_score), 100.0), 1) as avg_integrity_score
from institutions i
left join students s on s.institution_id = i.id
group by i.state
order by students desc;
