import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, FileText, Eye, Info, Paperclip, X, User, Building2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = '';

const SAMPLE_LIST = `email,name,company,designation
john@example.com,John Doe,TechCorp,Manager
jane@example.com,Jane Smith,DesignLab,Designer
mike@example.com,Mike Johnson,StartupXYZ,CEO`;

const SAMPLE_TEMPLATE = `Hi {name},

I came across {company} and was really impressed by the work your team is doing.

I'd love to connect and explore potential collaboration opportunities. As a {designation}, I believe you'd find our services valuable.

Would you be available for a quick 15-minute call this week?

Best regards,
[Your Name]`;

export default function Compose({ userId }) {
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [emailListRaw, setEmailListRaw] = useState('');
  const [template, setTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];
    let loaded = 0;

    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        newAttachments.push({
          filename: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data,
          size: file.size
        });
        
        loaded++;
        if (loaded === files.length) {
          const totalSize = [...attachments, ...newAttachments].reduce((acc, curr) => acc + curr.size, 0);
          if (totalSize > 5 * 1024 * 1024) {
             toast.error('Attachments total size must be under 5MB');
             return;
          }
          setAttachments(prev => [...prev, ...newAttachments]);
          toast.success(`${files.length} file(s) attached`);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so user can re-select the same file
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = async () => {
    if (!template || !emailListRaw) {
      toast.error('Please fill in both the email list and template');
      return;
    }
    if (!subject) {
      toast.error('Please add a subject line');
      return;
    }

    setShowPreview(true);
    setPreviewLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/email/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          subject,
          emailListRaw,
          previewCount: 5
        })
      });

      const result = await res.json();
      if (res.ok) {
        setPreviews(result.previews);
        setTotalRecipients(result.totalRecipients);
      } else {
        toast.error(result.error);
        setShowPreview(false);
      }
    } catch {
      toast.error('Failed to generate preview');
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSend = async () => {
    if (!template || !emailListRaw || !subject) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          campaignName: campaignName || `Campaign ${new Date().toLocaleDateString()}`,
          subject,
          template,
          emailListRaw,
          attachments
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setShowPreview(false);
        navigate('/dashboard');
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to send. Check if server is running.');
    } finally {
      setIsLoading(false);
      setIsSending(false);
    }
  };

  const loadSample = () => {
    setEmailListRaw(SAMPLE_LIST);
    setTemplate(SAMPLE_TEMPLATE);
    setSubject('Collaboration Opportunity with {company}');
    setCampaignName('Sample Outreach');
    toast.success('Sample data loaded!');
  };

  const estimatedDays = Math.ceil(totalRecipients / 45);

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Compose Campaign</h1>
            <p className="text-[var(--color-text-muted)] mt-1">Create personalized emails for your recipients</p>
          </div>
          <button
            onClick={loadSample}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-200 text-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Load Sample
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="text-blue-600 dark:text-blue-400 font-medium">Safe Sending Limits</p>
            <p className="text-[var(--color-text-secondary)] mt-1">Max 45 emails/day with 3-second delays between each. Placeholders: <code className="text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 rounded font-mono text-xs">{'{name}'}</code> <code className="text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 rounded font-mono text-xs">{'{company}'}</code> <code className="text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-1.5 py-0.5 rounded font-mono text-xs">{'{designation}'}</code></p>
          </div>
        </div>

        {/* Campaign Name */}
        <div className="glass-card rounded-2xl p-6">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. June Outreach, HR Follow-ups..."
            className="w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/25 transition-all"
          />
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Email List */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[var(--color-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Email List</h2>
              </div>
              <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-3)] px-2 py-1 rounded-lg">
                CSV format
              </span>
            </div>
            <textarea
              value={emailListRaw}
              onChange={(e) => setEmailListRaw(e.target.value)}
              placeholder={`email,name,company,designation\njohn@example.com,John Doe,TechCorp,Manager\njane@example.com,Jane Smith,DesignLab,Designer`}
              rows={14}
              className="w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/40 focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/25 transition-all font-mono text-sm resize-none"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              First row is treated as header and skipped. One recipient per line.
            </p>
          </div>

          {/* Right: Template */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Email Template</h2>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Collaboration with {company}"
                className="w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/50 focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/25 transition-all"
              />
            </div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Body</label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder={`Hi {name},\n\nI noticed {company} is doing great work...\n\nBest regards`}
              rows={10}
              className="w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]/40 focus:outline-none focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/25 transition-all text-sm resize-none"
            />

            {/* Attachments Section */}
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-200 text-sm cursor-pointer">
                  <Paperclip className="w-4 h-4" />
                  Attach Files
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
                <span className="text-xs text-[var(--color-text-muted)]">Max 5MB total</span>
              </div>
              
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-3)] border border-[var(--color-border)]/50 animate-fade-in">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                        <span className="text-sm text-[var(--color-text-primary)] truncate">{att.filename}</span>
                        <span className="text-xs text-[var(--color-text-muted)] shrink-0">
                          ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors text-[var(--color-text-muted)] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-surface-3)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-200 font-medium cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Preview Emails
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Sending...' : 'Send All'}
          </button>
        </div>
      </div>

      {/* ─── Preview Modal ─── */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-backdrop" onClick={() => !isSending && setShowPreview(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Modal */}
          <div
            className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[var(--color-accent)]" />
                  Email Preview
                </h2>
                {!previewLoading && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Showing {previews.length} of {totalRecipients} personalized emails
                  </p>
                )}
              </div>
              <button
                onClick={() => !isSending && setShowPreview(false)}
                disabled={isSending}
                className="p-2 rounded-xl hover:bg-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(85vh - 160px)' }}>
              {previewLoading ? (
                <div className="flex justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Sending estimate */}
                  {totalRecipients > 0 && (
                    <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[var(--color-text-primary)] font-medium text-sm">
                          Ready to send to <span className="text-[var(--color-accent)] font-bold">{totalRecipients}</span> recipients
                        </p>
                        <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                          Estimated: <span className="text-amber-500 font-semibold">{estimatedDays} day{estimatedDays > 1 ? 's' : ''}</span> at 45/day
                        </p>
                      </div>
                      {attachments.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                          {attachments.length} attachment{attachments.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Preview cards */}
                  {previews.map((preview, index) => (
                    <div key={index} className="glass-card rounded-xl p-5 space-y-3 animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                      {/* Email header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-[var(--color-accent)]" />
                          </div>
                          <div>
                            <p className="text-[var(--color-text-primary)] font-medium text-sm">{preview.to}</p>
                            {preview.name && (
                              <p className="text-[var(--color-text-muted)] text-xs flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {preview.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-medium">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="bg-[var(--color-surface-3)] rounded-lg px-4 py-2.5">
                        <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Subject</p>
                        <p className="text-[var(--color-text-primary)] font-medium text-sm">{preview.subject}</p>
                      </div>

                      {/* Body */}
                      <div className="bg-[var(--color-input-bg)] rounded-lg px-4 py-2.5">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Body</p>
                        <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap text-sm leading-relaxed">{preview.body}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!previewLoading && previews.length > 0 && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setShowPreview(false)}
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface-3)] border border-[var(--color-border)] transition-all cursor-pointer disabled:opacity-50"
                >
                  Edit Campaign
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? 'Sending...' : `Send to ${totalRecipients} Recipients`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
