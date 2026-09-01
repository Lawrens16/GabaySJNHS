export type UserRole = 'admin' | 'lfo' | 'counselor';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ProfileStatus = 'stub' | 'complete';
export type OffenseCategory = 'minor' | 'major' | 'grave';
export type ClearanceStatus = 'pending' | 'served' | 'cleared' | 'non_compliant';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type SessionType = 'intake' | 'routine' | 'behavioral' | 'academic' | 'crisis' | 'follow_up';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentOfficer {
  id: string;
  username: string;
  full_name: string;
  pin_hash: string;
  pin_code?: string | null;
  is_active: boolean;
  expires_at: string;
  created_by: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  lrn: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  gender: string | null;
  birthdate: string | null;
  grade_level: number | null;
  section: string | null;
  contact_number: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  photo_url: string | null;
  photo_storage_path: string | null;
  profile_status: ProfileStatus;
  assigned_counselor_id: string | null;
  created_by_lfo_id: string | null;
  completed_by_counselor_id: string | null;
  // Evidence: guardian-signed docs or photos attached by LFO at stub creation
  stub_evidence_urls?: string[] | null;
  stub_evidence_notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  assigned_counselor?: Profile;
  disciplinary_records?: DisciplinaryRecord[];
}

export interface DisciplinaryRecord {
  id: string;
  student_id: string;
  lfo_id: string;
  incident_date: string;
  offense_category: OffenseCategory;
  offense_description: string;
  sanction_imposed: string;
  is_suspended: boolean;
  suspension_start_date: string | null;
  suspension_end_date: string | null;
  clearance_status: ClearanceStatus;
  cleared_at: string | null;
  cleared_by_lfo_id: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  student?: Student;
}

export interface CounselingSession {
  id: string;
  student_id: string;
  counselor_id: string;
  scheduled_at: string;
  session_type: SessionType;
  status: SessionStatus;
  summary_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  student?: Student;
}

export interface CounselingNote {
  id: string;
  session_id: string | null;
  student_id: string;
  counselor_id: string;
  image_url: string;
  image_storage_path: string;
  ocr_raw_text: string;
  counselor_edited_text: string;
  accuracy_disclaimer_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfficerAccessLog {
  id: string;
  officer_id: string;
  student_id: string;
  action: string;
  ip_address: string | null;
  accessed_at: string;
  // Joins
  officer?: EnrollmentOfficer;
  student?: Student;
}
