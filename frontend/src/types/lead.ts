export type LeadPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type LeadIntent   = 'BUY' | 'RENT' | 'INQUIRE' | 'CONSULT' | 'OTHER';
export type LeadSource   = 'web_form' | 'telegram' | 'whatsapp' | 'email' | 'crm' | 'manual';
export type LeadStatus   = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';

export interface Lead {
  id:          string;
  name:        string | null;
  email:       string | null;
  phone:       string | null;
  message:     string;
  source:      LeadSource;
  intent:      LeadIntent | null;
  budget:      string | null;
  location:    string | null;
  timeline:    string | null;
  priority:    LeadPriority;
  confidence:  number | null;
  ai_summary:  string | null;
  status:      LeadStatus;
  assigned_to: string | null;
  notes:       string | null;
  created_at:  string;
  updated_at:  string;
}

export interface LeadStats {
  total:      number;
  today:      number;
  byPriority: Record<LeadPriority, number>;
  bySource:   Record<string, number>;
  byStatus:   Record<LeadStatus, number>;
}
