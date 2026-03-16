import { getLeads, getStats } from '@/lib/api';
import { priorityConfig, sourceConfig, timeAgo } from '@/lib/utils';
import { Lead } from '@/types/lead';

export const revalidate = 30; // refresh every 30s

async function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-3xl font-bold ${color || 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: keyof typeof priorityConfig }) {
  const cfg = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function LeadRow({ lead }: { lead: Lead }) {
  const src = sourceConfig[lead.source];
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="font-medium text-sm text-gray-900">{lead.name || 'Unknown'}</div>
        <div className="text-xs text-gray-400">{lead.email || '—'}</div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600 line-clamp-1 max-w-xs block">{lead.message}</span>
      </td>
      <td className="py-3 px-4">
        <PriorityBadge priority={lead.priority} />
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{src?.icon} {src?.label}</span>
      </td>
      <td className="py-3 px-4 text-xs text-gray-400">{timeAgo(lead.created_at)}</td>
      <td className="py-3 px-4">
        <a href={`/leads/${lead.id}`}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          View →
        </a>
      </td>
    </tr>
  );
}

export default async function DashboardPage() {
  const [statsData, leadsData] = await Promise.all([
    getStats().catch(() => null),
    getLeads({ limit: 10 }).catch(() => ({ leads: [], total: 0 })),
  ]);

  const stats = statsData;
  const { leads } = leadsData;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered lead intelligence · Updates every 30 seconds
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Leads"
          value={stats?.total ?? '—'}
          sub="all time"
        />
        <StatCard
          label="Today"
          value={stats?.today ?? '—'}
          sub="new leads"
          color="text-blue-600"
        />
        <StatCard
          label="High Priority"
          value={stats?.byPriority?.HIGH ?? '—'}
          sub="need action now"
          color="text-red-600"
        />
        <StatCard
          label="Qualified"
          value={stats?.byStatus?.qualified ?? '—'}
          sub="ready to close"
          color="text-green-600"
        />
      </div>

      {/* Source breakdown */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Leads by source</h2>
          <div className="flex gap-6 flex-wrap">
            {Object.entries(stats.bySource).map(([source, count]) => {
              const cfg = sourceConfig[source as keyof typeof sourceConfig];
              return (
                <div key={source} className="flex items-center gap-2">
                  <span className="text-base">{cfg?.icon || '📌'}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{count}</div>
                    <div className="text-xs text-gray-400">{cfg?.label || source}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent leads table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent leads</h2>
          <a href="/leads" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </a>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No leads yet. Send a test lead to your n8n webhook to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Message</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Source</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">Time</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => <LeadRow key={lead.id} lead={lead} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
