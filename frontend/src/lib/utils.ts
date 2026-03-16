import { LeadPriority, LeadSource, LeadStatus } from '@/types/lead';

export const priorityConfig: Record<LeadPriority, {
  label: string;
  color: string;
  bg: string;
  dot: string;
}> = {
  HIGH:   { label: 'High',   color: 'text-red-700',    bg: 'bg-red-50 border border-red-200',    dot: 'bg-red-500' },
  MEDIUM: { label: 'Medium', color: 'text-amber-700',  bg: 'bg-amber-50 border border-amber-200', dot: 'bg-amber-400' },
  LOW:    { label: 'Low',    color: 'text-green-700',  bg: 'bg-green-50 border border-green-200', dot: 'bg-green-500' },
};

export const statusConfig: Record<LeadStatus, {
  label: string;
  color: string;
  bg: string;
}> = {
  new:       { label: 'New',       color: 'text-blue-700',  bg: 'bg-blue-50 border border-blue-200' },
  contacted: { label: 'Contacted', color: 'text-purple-700',bg: 'bg-purple-50 border border-purple-200' },
  qualified: { label: 'Qualified', color: 'text-teal-700',  bg: 'bg-teal-50 border border-teal-200' },
  closed:    { label: 'Closed',    color: 'text-gray-700',  bg: 'bg-gray-100 border border-gray-200' },
  lost:      { label: 'Lost',      color: 'text-red-400',   bg: 'bg-red-50 border border-red-100' },
};

export const sourceConfig: Record<LeadSource, { label: string; icon: string }> = {
  web_form: { label: 'Web Form',  icon: '🌐' },
  telegram: { label: 'Telegram',  icon: '✈️' },
  whatsapp: { label: 'WhatsApp',  icon: '💬' },
  email:    { label: 'Email',     icon: '📧' },
  crm:      { label: 'CRM',       icon: '📋' },
  manual:   { label: 'Manual',    icon: '✏️' },
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)   return 'just now';
  if (minutes < 60)  return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatConfidence(confidence: number | null): string {
  if (confidence === null || confidence === undefined) return '—';
  return `${Math.round(confidence * 100)}%`;
}
