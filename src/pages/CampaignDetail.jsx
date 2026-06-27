import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Mail, AlertTriangle } from 'lucide-react';

const API_URL = '';

const statusIcons = {
  sent: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Sent' },
  failed: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Failed' },
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Pending' },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data.campaign);
        setEmailLogs(data.emailLogs);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === 'all'
    ? emailLogs
    : emailLogs.filter(log => log.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-muted">
        <AlertTriangle className="w-12 h-12 mb-3" />
        <p>Campaign not found</p>
        <Link to="/dashboard" className="text-primary mt-2 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard"
          className="p-2 rounded-xl hover:bg-surface-3 text-text-muted hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <p className="text-text-muted text-sm mt-1">
            Created {new Date(campaign.createdAt).toLocaleDateString('en', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs mb-1">Total</p>
          <p className="text-2xl font-bold text-white">{campaign.totalRecipients}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs mb-1">Sent</p>
          <p className="text-2xl font-bold text-success">{campaign.sentCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs mb-1">Failed</p>
          <p className="text-2xl font-bold text-error">{campaign.failedCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs mb-1">Pending</p>
          <p className="text-2xl font-bold text-warning">{campaign.pendingCount}</p>
        </div>
      </div>

      {/* Subject */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-text-muted mb-1">Subject</p>
        <p className="text-white font-medium">{campaign.subject}</p>
      </div>

      {/* Email logs table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Email Logs</h2>
          <div className="flex gap-2">
            {['all', 'sent', 'failed', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-surface-3 text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {f} {f === 'all' ? `(${emailLogs.length})` : `(${emailLogs.filter(l => l.status === f).length})`}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs text-text-muted font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 text-xs text-text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-text-muted font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-xs text-text-muted font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const config = statusIcons[log.status] || statusIcons.pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={log._id} className="border-b border-border/50 hover:bg-surface-3/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="text-white text-sm">{log.recipientEmail}</p>
                            {log.recipientName && (
                              <p className="text-text-muted text-xs">{log.recipientName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-text-muted text-sm">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleString('en', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                          : '—'
                        }
                      </td>
                      <td className="py-3 px-4">
                        {log.errorMessage ? (
                          <span className="text-error text-xs">{log.errorMessage}</span>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <Mail className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No emails match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
