import { getLead } from '@/lib/api';
import { priorityConfig, statusConfig, sourceConfig, timeAgo, formatConfidence } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface PageProps { params: { id: string } }

export default async function LeadDetailPage({ params }: PageProps) {
  const lead = await getLead(params.id).catch(() => null);
  if (!lead) notFound();

  const priority = priorityConfig[lead.priority];
  const status   = statusConfig[lead.status];
  const source   = sourceConfig[lead.source];

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <a href="/leads" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        ← Back to leads
      </a>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{lead.name || 'Unknown contact'}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {lead.email && <span>📧 {lead.email}</span>}
              {lead.phone && <span>📱 {lead.phone}</span>}
              <span>{source?.icon} {source?.label}</span>
              <span>{timeAgo(lead.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${priority?.color} ${priority?.bg}`}>
              <span className={`w-2 h-2 rounded-full ${priority?.dot}`} />
              {priority?.label} Priority
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status?.color} ${status?.bg}`}>
              {status?.label}
            </span>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          🤖 AI Analysis
          <span className="text-xs font-normal text-gray-400">
            Confidence: {formatConfidence(lead.confidence)}
          </span>
        </h2>

        {lead.ai_summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5">
            <p className="text-sm text-blue-800 font-medium">{lead.ai_summary}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Intent',    value: lead.intent },
            { label: 'Budget',    value: lead.budget },
            { label: 'Location',  value: lead.location },
            { label: 'Timeline',  value: lead.timeline },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg px-4 py-3">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-sm font-semibold text-gray-800">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Original message */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">💬 Original Message</h2>
        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-4 py-3">
          {lead.message}
        </p>
      </div>

      {/* Update status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline Status</h2>
        <div className="flex gap-2 flex-wrap">
          {(['new', 'contacted', 'qualified', 'closed', 'lost'] as const).map(s => {
            const cfg = statusConfig[s];
            const isActive = lead.status === s;
            return (
              <a
                key={s}
                href={`/api/update-status?id=${lead.id}&status=${s}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  isActive
                    ? `${cfg.color} ${cfg.bg} font-semibold`
                    : 'text-gray-500 bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {cfg.label}
              </a>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Created {new Date(lead.created_at).toLocaleString()} ·
          Updated {new Date(lead.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
