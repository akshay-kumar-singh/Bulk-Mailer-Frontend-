import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Send, CheckCircle, XCircle, Clock, TrendingUp, Mail, ChevronRight, RefreshCw } from 'lucide-react';

const API_URL = '';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-primary/20 transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-text-muted text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const statusConfig = {
  completed: { color: 'text-success', bg: 'bg-success/10', label: 'Completed', icon: CheckCircle },
  sending: { color: 'text-info', bg: 'bg-info/10', label: 'Sending', icon: Send },
  paused: { color: 'text-warning', bg: 'bg-warning/10', label: 'Paused', icon: Clock },
  failed: { color: 'text-error', bg: 'bg-error/10', label: 'Failed', icon: XCircle },
  draft: { color: 'text-text-muted', bg: 'bg-surface-3', label: 'Draft', icon: Mail },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-2 border border-border rounded-xl p-3 shadow-xl">
        <p className="text-text-muted text-xs mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
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
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-text-muted mt-1">Track your email campaigns and activity</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-3 text-text-muted hover:text-white border border-border hover:border-primary/30 transition-all duration-200 text-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Campaigns" value={stats?.totalCampaigns || 0} color="text-primary" bgColor="bg-primary/10" />
        <StatCard icon={CheckCircle} label="Emails Sent" value={stats?.totalSent || 0} color="text-success" bgColor="bg-success/10" />
        <StatCard icon={XCircle} label="Failed" value={stats?.totalFailed || 0} color="text-error" bgColor="bg-error/10" />
        <StatCard icon={Clock} label="Pending" value={stats?.totalPending || 0} color="text-warning" bgColor="bg-warning/10" />
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Last 7 Days Activity</h2>
        {stats?.dailyStats && stats.dailyStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.dailyStats} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  const d = new Date(val + 'T00:00:00');
                  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sent" fill="#22c55e" name="Sent" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Mail className="w-12 h-12 mb-3 opacity-30" />
            <p>No activity yet. Send your first campaign!</p>
          </div>
        )}
      </div>

      {/* Campaigns List */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Campaigns</h2>
          <Link
            to="/compose"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-primary/25 transition-all"
          >
            <Send className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const config = statusConfig[campaign.status] || statusConfig.draft;
              const StatusIcon = config.icon;
              return (
                <Link
                  key={campaign._id}
                  to={`/campaign/${campaign._id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-3/50 hover:bg-surface-3 border border-transparent hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium group-hover:text-primary transition-colors">
                        {campaign.name}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {new Date(campaign.createdAt).toLocaleDateString('en', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-success">{campaign.sentCount} sent</span>
                        <span className="text-error">{campaign.failedCount} failed</span>
                        {campaign.pendingCount > 0 && (
                          <span className="text-warning">{campaign.pendingCount} pending</span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {campaign.totalRecipients} total recipients
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-muted">
            <Send className="w-12 h-12 mb-3 opacity-30" />
            <p>No campaigns yet</p>
            <p className="text-sm mt-1">Create your first campaign to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
