import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Mail, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = '';

const statusIcons = {
  sent: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Sent' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Failed' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
};

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this campaign and all of its email logs? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('Campaign deleted successfully');
        navigate('/dashboard');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete campaign');
      }
    } catch {
      toast.error('Error deleting campaign');
    } finally {
      setIsDeleting(false);
    }
  };

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
        <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--color-text-muted)]">
        <AlertTriangle className="w-12 h-12 mb-3" />
        <p className="font-medium">Campaign not found</p>
        <Link to="/dashboard" className="text-[var(--color-accent)] mt-2 hover:underline text-sm">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{campaign.name}</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              Created {new Date(campaign.createdAt).toLocaleDateString('en', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-sm font-semibold cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? 'Deleting...' : 'Delete Campaign'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider mb-1">Total</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{campaign.totalRecipients}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider mb-1">Sent</p>
          <p className="text-2xl font-bold text-emerald-500">{campaign.sentCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-500">{campaign.failedCount}</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-[var(--color-text-muted)] text-xs font-medium uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{campaign.pendingCount}</p>
        </div>
      </div>

      {/* Subject */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider mb-1">Subject</p>
        <p className="text-[var(--color-text-primary)] font-medium">{campaign.subject}</p>
      </div>

      {/* Email logs table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Email Logs</h2>
          <div className="flex gap-2">
            {['all', 'sent', 'failed', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] border border-transparent'
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
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Recipient</th>
                  <th className="text-left py-3 px-4 text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Time</th>
                  <th className="text-left py-3 px-4 text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const config = statusIcons[log.status] || statusIcons.pending;
                  const StatusIcon = config.icon;
                  return (
                    <tr key={log._id} className="border-b border-[var(--color-border)]/40 hover:bg-[var(--color-surface-3)]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                          <div>
                            <p className="text-[var(--color-text-primary)] text-sm">{log.recipientEmail}</p>
                            {log.recipientName && (
                              <p className="text-[var(--color-text-muted)] text-xs">{log.recipientName}</p>
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
                      <td className="py-3 px-4 text-[var(--color-text-muted)] text-sm">
                        {log.sentAt
                          ? new Date(log.sentAt).toLocaleString('en', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
                          : '—'
                        }
                      </td>
                      <td className="py-3 px-4">
                        {log.errorMessage ? (
                          <span className="text-red-500 text-xs">{log.errorMessage}</span>
                        ) : (
                          <span className="text-[var(--color-text-muted)] text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-muted)]">
            <Mail className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">No emails match this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
