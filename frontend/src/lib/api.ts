import { Lead, LeadStats } from '@/types/lead';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getLeads(params?: {
  priority?: string;
  source?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ leads: Lead[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.priority) query.set('priority', params.priority);
  if (params?.source)   query.set('source',   params.source);
  if (params?.status)   query.set('status',   params.status);
  if (params?.limit)    query.set('limit',    String(params.limit));
  if (params?.offset)   query.set('offset',   String(params.offset));

  const res = await fetch(`${API}/api/leads?${query}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function getLead(id: string): Promise<Lead> {
  const res = await fetch(`${API}/api/leads/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Lead not found');
  return res.json();
}

export async function getStats(): Promise<LeadStats> {
  const res = await fetch(`${API}/api/leads/stats/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function updateLeadStatus(id: string, status: string): Promise<Lead> {
  const res = await fetch(`${API}/api/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function submitLead(data: {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  source: string;
}): Promise<Lead> {
  const res = await fetch(`${API}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit lead');
  return res.json();
}
