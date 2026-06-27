import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Eye, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = '';

export default function Preview({ userId }) {
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [composeData, setComposeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('compose_data');
    if (!stored) {
      navigate('/compose');
      return;
    }

    const data = JSON.parse(stored);
    setComposeData(data);
    fetchPreviews(data);
  }, []);

  const fetchPreviews = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/email/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: data.template,
          subject: data.subject,
          emailListRaw: data.emailListRaw,
          previewCount: 5
        })
      });

      const result = await res.json();
      if (res.ok) {
        setPreviews(result.previews);
        setTotalRecipients(result.totalRecipients);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAll = async () => {
    if (!composeData) return;

    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          campaignName: composeData.campaignName,
          subject: composeData.subject,
          template: composeData.template,
          emailListRaw: composeData.emailListRaw,
          attachments: composeData.attachments
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        sessionStorage.removeItem('compose_data');
        navigate('/dashboard');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to send. Check server connection.');
    } finally {
      setIsSending(false);
    }
  };

  const estimatedDays = Math.ceil(totalRecipients / 45);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/compose')}
            className="p-2 rounded-xl hover:bg-surface-3 text-text-muted hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              Email Preview
            </h1>
            <p className="text-text-muted mt-1">
              Showing {previews.length} of {totalRecipients} personalized emails
            </p>
          </div>
        </div>
      </div>

      {/* Sending estimate */}
      {totalRecipients > 0 && (
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">
              Ready to send to <span className="text-primary font-bold">{totalRecipients}</span> recipients
            </p>
            <p className="text-text-muted text-sm mt-1">
              At 45 emails/day, estimated completion: <span className="text-warning font-semibold">{estimatedDays} day{estimatedDays > 1 ? 's' : ''}</span>
            </p>
          </div>
          <button
            onClick={handleSendAll}
            disabled={isSending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send All'}
          </button>
        </div>
      )}

      {/* Preview cards */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {previews.map((preview, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 space-y-4 hover:border-primary/30 transition-all duration-300">
              {/* Email header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{preview.to}</p>
                    {preview.name && (
                      <p className="text-text-muted text-xs flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {preview.name}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  #{index + 1}
                </span>
              </div>

              {/* Subject */}
              <div className="bg-surface-3/60 rounded-xl px-4 py-3">
                <p className="text-xs text-text-muted mb-1">Subject</p>
                <p className="text-white font-medium">{preview.subject}</p>
              </div>

              {/* Body */}
              <div className="bg-surface-3/40 rounded-xl px-4 py-3">
                <p className="text-xs text-text-muted mb-2">Body</p>
                <p className="text-text whitespace-pre-wrap text-sm leading-relaxed">{preview.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
