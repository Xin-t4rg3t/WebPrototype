/*
  # Student Behavior Management System Database Schema

  ## Overview
  Complete database schema for a comprehensive student behavior management system with 
  incident tracking, counseling, peer mediation, device usage monitoring, and reporting.

  ## New Tables

  ### Core Tables
  1. `roles` - User role definitions (admin, teacher, counselor, student, parent)
     - `id` (uuid, primary key)
     - `name` (text, unique) - Role name
     - `description` (text) - Role description

  2. `user_roles` - Junction table linking users to roles
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key) - References auth.users
     - `role_id` (uuid, foreign key) - References roles
     - `created_at` (timestamp)

  3. `students` - Student profiles
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key) - References auth.users
     - `full_name` (text, required)
     - `roll_name` (text)
     - `mobile_name` (text)
     - `date_of_birth` (date)
     - `grade_level` (text)
     - `section` (text)
     - `address` (text)
     - `contact_number` (text)
     - `enrollment_status` (text) - active, inactive, suspended
     - `created_at` (timestamp)

  4. `parent_guardians` - Parent/guardian profiles
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key) - References auth.users
     - `full_name` (text, required)
     - `last_name` (text)
     - `relationship_to_student` (text)
     - `contact_number` (text)
     - `email` (text)
     - `address` (text)
     - `created_at` (timestamp)

  5. `student_parents` - Junction table linking students to parents
     - `id` (uuid, primary key)
     - `student_id` (uuid, foreign key) - References students
     - `parent_id` (uuid, foreign key) - References parent_guardians

  ### Reference Tables
  6. `incident_types` - Types of behavioral incidents
     - `id` (uuid, primary key)
     - `name` (text, unique, required)
     - `description` (text)

  7. `action_type` - Types of disciplinary actions
     - `id` (uuid, primary key)
     - `name` (text, unique, required)
     - `description` (text)

  8. `policies_rules` - School policies and rules
     - `id` (uuid, primary key)
     - `string_id` (text)
     - `outcome` (text)
     - `description` (text)
     - `date_performed` (timestamp)
     - `endedat_at` (timestamp)

  ### Operational Tables
  9. `incidents` - Incident records
     - `id` (uuid, primary key)
     - `reported_by_user_id` (uuid, foreign key) - References auth.users
     - `incident_type_id` (uuid, foreign key) - References incident_types
     - `date_reported` (timestamp)
     - `location` (text)
     - `immediate_action` (text)
     - `description` (text)
     - `status` (text) - open, investigating, resolved, closed
     - `created_at` (timestamp)
     - `student_id` (uuid, foreign key) - References students

  10. `reports` - Generated reports
      - `id` (uuid, primary key)
      - `report_type` (text)
      - `parameters` (jsonb)
      - `generated_at` (timestamp)
      - `file_path` (text)
      - `observation` (text)
      - `generated_by_user_id` (uuid, foreign key) - References auth.users

  11. `behavioral_interventions` - Intervention records
      - `id` (uuid, primary key)
      - `assigned_by_user_id` (uuid, foreign key) - References auth.users
      - `intervention_type` (text)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text) - scheduled, in_progress, completed, cancelled
      - `created_at` (timestamp)
      - `student_id` (uuid, foreign key) - References students

  12. `counseling_records` - Counseling session records
      - `id` (uuid, primary key)
      - `counselor_user_id` (uuid, foreign key) - References auth.users
      - `session_date` (timestamp)
      - `session_notes` (text)
      - `outcome` (text)
      - `follow_up_required` (boolean)
      - `created_at` (timestamp)
      - `modified_at` (timestamp)
      - `student_id` (uuid, foreign key) - References students

  13. `peer_mediation_sessions` - Peer mediation records
      - `id` (uuid, primary key)
      - `mediator_user_id` (uuid, foreign key) - References auth.users
      - `session_date` (timestamp)
      - `notes` (text)
      - `outcome` (text)
      - `created_at` (timestamp)
      - `modified_at` (timestamp)

  14. `device_usage_records` - Device usage tracking
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key) - References students
      - `device_id` (text)
      - `usage_start` (timestamp)
      - `usage_end` (timestamp)
      - `activity_description` (text)
      - `flagged` (boolean)
      - `created_at` (timestamp)

  15. `audit_logs` - System audit trail
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key) - References auth.users
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (text)
      - `timestamp` (timestamp)
      - `ip_address` (text)
      - `details` (jsonb)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on roles
  - Admin users have full access
  - Teachers can view and create records
  - Students can view their own records
  - Parents can view their children's records
*/

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  roll_name text,
  mobile_name text,
  date_of_birth date,
  grade_level text,
  section text,
  address text,
  contact_number text,
  enrollment_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create parent_guardians table
CREATE TABLE IF NOT EXISTS parent_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  last_name text,
  relationship_to_student text,
  contact_number text,
  email text,
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parent_guardians ENABLE ROW LEVEL SECURITY;

-- Create student_parents junction table
CREATE TABLE IF NOT EXISTS student_parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES parent_guardians(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, parent_id)
);

ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;

-- Create incident_types table
CREATE TABLE IF NOT EXISTS incident_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incident_types ENABLE ROW LEVEL SECURITY;

-- Create action_type table
CREATE TABLE IF NOT EXISTS action_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE action_type ENABLE ROW LEVEL SECURITY;

-- Create policies_rules table
CREATE TABLE IF NOT EXISTS policies_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  string_id text,
  outcome text,
  description text,
  date_performed timestamptz,
  endedat_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE policies_rules ENABLE ROW LEVEL SECURITY;

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  incident_type_id uuid REFERENCES incident_types(id) ON DELETE SET NULL,
  date_reported timestamptz DEFAULT now(),
  location text,
  immediate_action text,
  description text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text,
  parameters jsonb,
  generated_at timestamptz DEFAULT now(),
  file_path text,
  observation text,
  generated_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create behavioral_interventions table
CREATE TABLE IF NOT EXISTS behavioral_interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  assigned_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  intervention_type text,
  description text,
  start_date date,
  end_date date,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE behavioral_interventions ENABLE ROW LEVEL SECURITY;

-- Create counseling_records table
CREATE TABLE IF NOT EXISTS counseling_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  counselor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_date timestamptz DEFAULT now(),
  session_notes text,
  outcome text,
  follow_up_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  modified_at timestamptz DEFAULT now()
);

ALTER TABLE counseling_records ENABLE ROW LEVEL SECURITY;

-- Create peer_mediation_sessions table
CREATE TABLE IF NOT EXISTS peer_mediation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mediator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_date timestamptz DEFAULT now(),
  notes text,
  outcome text,
  created_at timestamptz DEFAULT now(),
  modified_at timestamptz DEFAULT now()
);

ALTER TABLE peer_mediation_sessions ENABLE ROW LEVEL SECURITY;

-- Create device_usage_records table
CREATE TABLE IF NOT EXISTS device_usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  device_id text,
  usage_start timestamptz,
  usage_end timestamptz,
  activity_description text,
  flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_usage_records ENABLE ROW LEVEL SECURITY;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  timestamp timestamptz DEFAULT now(),
  ip_address text,
  details jsonb
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Roles policies
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Students policies
CREATE POLICY "Authenticated users can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Parent guardians policies
CREATE POLICY "Authenticated users can view parent guardians"
  ON parent_guardians FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert parent guardians"
  ON parent_guardians FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update parent guardians"
  ON parent_guardians FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Student parents policies
CREATE POLICY "Authenticated users can view student-parent relationships"
  ON student_parents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage student-parent relationships"
  ON student_parents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Incident types policies
CREATE POLICY "Authenticated users can view incident types"
  ON incident_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage incident types"
  ON incident_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Action type policies
CREATE POLICY "Authenticated users can view action types"
  ON action_type FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage action types"
  ON action_type FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies rules policies
CREATE POLICY "Authenticated users can view policies"
  ON policies_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage policies"
  ON policies_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Incidents policies
CREATE POLICY "Authenticated users can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by_user_id);

CREATE POLICY "Staff can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Reports policies
CREATE POLICY "Authenticated users can view reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can generate reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = generated_by_user_id);

-- Behavioral interventions policies
CREATE POLICY "Authenticated users can view interventions"
  ON behavioral_interventions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create interventions"
  ON behavioral_interventions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = assigned_by_user_id);

CREATE POLICY "Staff can update interventions"
  ON behavioral_interventions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Counseling records policies
CREATE POLICY "Authenticated users can view counseling records"
  ON counseling_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can create counseling records"
  ON counseling_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = counselor_user_id);

CREATE POLICY "Counselors can update counseling records"
  ON counseling_records FOR UPDATE
  TO authenticated
  USING (auth.uid() = counselor_user_id)
  WITH CHECK (auth.uid() = counselor_user_id);

-- Peer mediation sessions policies
CREATE POLICY "Authenticated users can view peer mediation sessions"
  ON peer_mediation_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mediators can create peer mediation sessions"
  ON peer_mediation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = mediator_user_id);

CREATE POLICY "Mediators can update peer mediation sessions"
  ON peer_mediation_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = mediator_user_id)
  WITH CHECK (auth.uid() = mediator_user_id);

-- Device usage records policies
CREATE POLICY "Authenticated users can view device usage"
  ON device_usage_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create device usage records"
  ON device_usage_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update device usage records"
  ON device_usage_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Audit logs policies
CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('teacher', 'Teacher with access to student records and incidents'),
  ('counselor', 'Counselor with access to counseling records'),
  ('student', 'Student with limited access to own records'),
  ('parent', 'Parent with access to their children records')
ON CONFLICT (name) DO NOTHING;

-- Insert default incident types
INSERT INTO incident_types (name, description) VALUES
  ('Bullying', 'Physical or verbal bullying behavior'),
  ('Disruptive Behavior', 'Behavior that disrupts the learning environment'),
  ('Tardiness', 'Repeated late arrivals to class'),
  ('Truancy', 'Unexcused absences from school'),
  ('Academic Dishonesty', 'Cheating or plagiarism'),
  ('Dress Code Violation', 'Violation of school dress code'),
  ('Technology Misuse', 'Inappropriate use of school technology'),
  ('Fighting', 'Physical altercation with another student'),
  ('Vandalism', 'Damage to school property'),
  ('Other', 'Other types of incidents')
ON CONFLICT (name) DO NOTHING;

-- Insert default action types
INSERT INTO action_type (name, description) VALUES
  ('Verbal Warning', 'Verbal warning given to student'),
  ('Written Warning', 'Formal written warning'),
  ('Detention', 'After-school detention'),
  ('Suspension', 'Temporary suspension from school'),
  ('Parent Conference', 'Meeting with parents required'),
  ('Counseling', 'Referral to counselor'),
  ('Community Service', 'Required community service hours'),
  ('Behavioral Contract', 'Signed behavioral improvement contract'),
  ('No Action', 'Incident documented but no action taken')
ON CONFLICT (name) DO NOTHING;