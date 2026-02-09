export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Student {
  id: string;
  user_id?: string;
  full_name: string;
  roll_name?: string;
  mobile_name?: string;
  date_of_birth?: string;
  grade_level?: string;
  section?: string;
  address?: string;
  contact_number?: string;
  enrollment_status: string;
  created_at: string;
}

export interface IncidentType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Incident {
  id: string;
  reported_by_user_id?: string;
  student_id: string;
  incident_type_id?: string;
  date_reported: string;
  location?: string;
  immediate_action?: string;
  description?: string;
  status: string;
  created_at: string;
  students?: Student;
  incident_types?: IncidentType;
}

export interface CounselingRecord {
  id: string;
  student_id: string;
  counselor_user_id?: string;
  session_date: string;
  session_notes?: string;
  outcome?: string;
  follow_up_required: boolean;
  created_at: string;
  modified_at: string;
  students?: Student;
}

export interface BehavioralIntervention {
  id: string;
  student_id: string;
  assigned_by_user_id?: string;
  intervention_type?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
  students?: Student;
}

export interface DeviceUsageRecord {
  id: string;
  student_id: string;
  device_id?: string;
  usage_start?: string;
  usage_end?: string;
  activity_description?: string;
  flagged: boolean;
  created_at: string;
  students?: Student;
}

export interface PeerMediationSession {
  id: string;
  mediator_user_id?: string;
  session_date: string;
  notes?: string;
  outcome?: string;
  created_at: string;
  modified_at: string;
}

export interface ParentGuardian {
  id: string;
  user_id?: string;
  full_name: string;
  last_name?: string;
  relationship_to_student?: string;
  contact_number?: string;
  email?: string;
  address?: string;
  created_at: string;
}
