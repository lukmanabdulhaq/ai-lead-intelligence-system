import { getLeads } from '@/lib/api';
import { priorityConfig, statusConfig, sourceConfig, timeAgo } from '@/lib/utils';
import { Lead } from '@/types/lead';

export const revalidate = 30;

interface PageProps {
  searchParams: { priority?: string; source?: string; status?: string };
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = priorityConfig[priority as keyof typeof priorityConfig];
  if (!cfg) return <span className="text-xs text-gray-400">{priority}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as keyof typeof statusConfig];
  if (!cfg) return <span className="text-xs text-gray-400">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
}

function FilterBar({ current }: { current: PageProps['searchParams'] }) {
  const priorities = ['', 'HIGH', 'MEDIUM', 'LOW'];
  const sources    = ['', 'web_form', 'telegram', 'whatsapp', 'email', 'crm'];

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    return `/leads?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-3 flex-wrap mb-6">
      <span className="text-xs text-gray-500 font-medium">Priority:</span>
      {priorities.map(p => (
        <a key={p || 'all-p'} href={buildUrl({ priority: p })}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            (current.priority || '') === p
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}>
          {p || 'All'}
        </a>
      ))}
      <span className="text-xs text-gray-400 mx-1">|</span>
      <span className="text-xs text-gray-500 font-medium">Source:</span>
      {sources.map(s => (
        <a key={s || 'all-s'} href={buildUrl({ source: s })}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            (current.source || '') === s
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}>
          {s
            ? (sourceConfig[s as keyof typeof sourceConfig]?.icon + ' ' + sourceConfig[s as keyof typeof sourceConfig]?.label)
            : 'All'
          }
        </a>
      ))}
    </div>
  );
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const { leads, total } = await getLeads({
    priority: searchParams.priority,
    source:   searchParams.source,
    status:   searchParams.status,
    limit: 50,
  }).catch(() => ({ leads: [], total: 0 }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
        <p className="text-sm text-gray-500 mt-1">{total} total leads</p>
      </div>

      <FilterBar current={searchParams} />

      <div className="bg-white rounded-xl border border-gray-200">
        {leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No leads match these filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Contact', 'Message', 'AI Analysis', 'Priority', 'Status', 'Source', 'Time', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead: Lead) => {
                  const src = sourceConfig[lead.source];
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-sm text-gray-900">{lead.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{lead.email || '—'}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-sm text-gray-600 line-clamp-2">{lead.message}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs space-y-0.5">
                          {lead.intent   && <div><span className="text-gray-400">Intent:</span> <span className="font-medium text-gray-700">{lead.intent}</span></div>}
                          {lead.budget   && <div><span className="text-gray-400">Budget:</span> <span className="font-medium text-gray-700">{lead.budget}</span></div>}
                          {lead.location && <div><span className="text-gray-400">Location:</span> <span className="font-medium text-gray-700">{lead.location}</span></div>}
                        </div>
                      </td>
                      <td className="py-3 px-4"><PriorityBadge priority={lead.priority} /></td>
                      <td className="py-3 px-4"><StatusBadge status={lead.status} /></td>
                      <td className="py-3 px-4 text-sm text-gray-600">{src?.icon} {src?.label}</td>
                      <td className="py-3 px-4 text-xs text-gray-400">{timeAgo(lead.created_at)}</td>
                      <td className="py-3 px-4">
                        <a href={`/leads/${lead.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                          View →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
