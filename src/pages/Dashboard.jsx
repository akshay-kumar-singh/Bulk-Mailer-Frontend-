import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, CheckCircle, XCircle, Clock, TrendingUp, Mail, ChevronRight, RefreshCw, Zap } from 'lucide-react';

const API_URL = '';

const StatCard = ({ icon: Icon, label, value, color, gradient }) => (
  <div className="glass-card rounded-2xl p-5 flex items-center gap-4 group transition-all duration-300 hover:scale-[1.02]">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-0.5">{value}</p>
    </div>
  </div>
);

const statusConfig = {
  completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Completed', icon: CheckCircle, dot: 'bg-emerald-500' },
  sending: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Sending', icon: Zap, dot: 'bg-blue-500' },
  paused: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Paused', icon: Clock, dot: 'bg-amber-500' },
  failed: { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed', icon: XCircle, dot: 'bg-red-500' },
  draft: { color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface-3)]', label: 'Draft', icon: Mail, dot: 'bg-gray-400' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-tooltip-bg)] border border-[var(--color-border)] rounded-xl p-3 shadow-xl backdrop-blur-lg">
        <p className="text-[var(--color-text-muted)] text-xs font-medium mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        fetch(`${API_URL}/api/campaigns/stats/overview?userId=${userId}`),
        fetch(`${API_URL}/api/campaigns?userId=${userId}`)
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns);
      }
    } catch {
      // Server may be sleeping
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-[var(--color-text-muted)] mt-1">Track your email campaigns and activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-200 text-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Campaigns" value={stats?.totalCampaigns || 0} gradient="from-indigo-500 to-purple-500" />
        <StatCard icon={CheckCircle} label="Sent" value={stats?.totalSent || 0} gradient="from-emerald-500 to-teal-500" />
        <StatCard icon={XCircle} label="Failed" value={stats?.totalFailed || 0} gradient="from-red-500 to-rose-500" />
        <StatCard icon={Clock} label="Pending" value={stats?.totalPending || 0} gradient="from-amber-500 to-orange-500" />
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Weekly Activity</h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[var(--color-text-muted)]">Sent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1.5 rounded-full bg-red-500" />
              <span className="text-[var(--color-text-muted)]">Failed</span>
            </div>
          </div>
        </div>
        {stats?.dailyStats && stats.dailyStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.dailyStats} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="date"
                stroke="var(--color-text-muted)"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val + 'T00:00:00');
                  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sent" stroke="#22c55e" strokeWidth={2.5} fill="url(#sentGradient)" name="Sent" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#failedGradient)" name="Failed" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
            <Mail className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm mt-1 opacity-60">Send your first campaign to see stats here</p>
          </div>
        )}
      </div>

      {/* Campaigns List */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recent Campaigns</h2>
          <Link
            to="/compose"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Send className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((campaign) => {
              const config = statusConfig[campaign.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              const total = campaign.sentCount + campaign.failedCount + campaign.pendingCount;
              const successRate = total > 0 ? Math.round((campaign.sentCount / total) * 100) : 0;

              return (
                <Link
                  key={campaign._id}
                  to={`/campaign/${campaign._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-surface-3)]/40 hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-accent)]/15 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-[var(--color-text-primary)] font-medium group-hover:text-[var(--color-accent)] transition-colors">
                        {campaign.name}
                      </p>
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                        {new Date(campaign.createdAt).toLocaleDateString('en', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Mini progress */}
                    <div className="hidden sm:flex items-center gap-3 text-xs font-medium">
                      <span className="text-emerald-500">{campaign.sentCount} sent</span>
                      {campaign.failedCount > 0 && <span className="text-red-500">{campaign.failedCount} failed</span>}
                      {campaign.pendingCount > 0 && <span className="text-amber-500">{campaign.pendingCount} pending</span>}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${config.dot} ${campaign.status === 'sending' ? 'animate-pulse-dot' : ''}`} />
                      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]">
            <Send className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No campaigns yet</p>
            <p className="text-sm mt-1 opacity-60">Create your first campaign to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
