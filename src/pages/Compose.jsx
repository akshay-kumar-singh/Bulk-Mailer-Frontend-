import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, FileText, AlertCircle, Info, Paperclip, X } from 'lucide-react';
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
        }
      };
      reader.readAsDataURL(file);
    });
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

    // Store data in sessionStorage for preview page
    sessionStorage.setItem('compose_data', JSON.stringify({
      campaignName,
      subject,
      emailListRaw,
      template,
      attachments
    }));
    navigate('/preview');
  };

  const handleSend = async () => {
    if (!template || !emailListRaw || !subject) {
      toast.error('Please fill all fields');
      return;
    }

    setIsLoading(true);
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
        navigate('/dashboard');
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Failed to send. Check if server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    setEmailListRaw(SAMPLE_LIST);
    setTemplate(SAMPLE_TEMPLATE);
    setSubject('Collaboration Opportunity with {company}');
    setCampaignName('Sample Outreach');
    toast.success('Sample data loaded!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compose Campaign</h1>
          <p className="text-text-muted mt-1">Create personalized emails for your recipients</p>
        </div>
        <button
          onClick={loadSample}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-3 text-text-muted hover:text-white border border-border hover:border-primary/30 transition-all duration-200 text-sm cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          Load Sample
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-info/10 border border-info/20">
        <Info className="w-5 h-5 text-info mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="text-info font-medium">Safe Sending Limits</p>
          <p className="text-text-muted mt-1">Max 45 emails/day with 3-second delays between each. Placeholders: <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{'{name}'}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{'{company}'}</code> <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded">{'{designation}'}</code></p>
        </div>
      </div>

      {/* Campaign Name */}
      <div className="glass-card rounded-2xl p-6">
        <label className="block text-sm font-medium text-text-muted mb-2">Campaign Name</label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="e.g. June Outreach, HR Follow-ups..."
          className="w-full px-4 py-3 bg-surface-3 border border-border rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Email List */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Email List</h2>
            </div>
            <span className="text-xs text-text-muted bg-surface-3 px-2 py-1 rounded-lg">
              CSV format
            </span>
          </div>
          <textarea
            value={emailListRaw}
            onChange={(e) => setEmailListRaw(e.target.value)}
            placeholder={`email,name,company,designation\njohn@example.com,John Doe,TechCorp,Manager\njane@example.com,Jane Smith,DesignLab,Designer`}
            rows={14}
            className="w-full px-4 py-3 bg-surface-3 border border-border rounded-xl text-white placeholder-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all font-mono text-sm resize-none"
          />
          <p className="text-xs text-text-muted mt-2">
            First row is treated as header and skipped. One recipient per line.
          </p>
        </div>

        {/* Right: Template */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Email Template</h2>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-muted mb-2">Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Collaboration with {company}"
              className="w-full px-4 py-3 bg-surface-3 border border-border rounded-xl text-white placeholder-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>
          <label className="block text-sm font-medium text-text-muted mb-2">Body</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder={`Hi {name},\n\nI noticed {company} is doing great work...\n\nBest regards`}
            rows={10}
            className="w-full px-4 py-3 bg-surface-3 border border-border rounded-xl text-white placeholder-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all text-sm resize-none"
          />

          {/* Attachments Section */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-3 text-text-muted hover:text-white border border-border hover:border-primary/30 transition-all duration-200 text-sm cursor-pointer">
                <Paperclip className="w-4 h-4" />
                Attach Files (Resume, etc.)
                <input type="file" multiple onChange={handleFileChange} className="hidden" />
              </label>
              <span className="text-xs text-text-muted">Max 5MB total</span>
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-3 border border-border/50">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-white truncate">{att.filename}</span>
                      <span className="text-xs text-text-muted shrink-0">
                        ({(att.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="p-1 hover:bg-error/10 hover:text-error rounded transition-colors text-text-muted"
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-3 text-white border border-border hover:border-primary/30 hover:bg-surface-3/80 transition-all duration-200 font-medium cursor-pointer"
        >
          <AlertCircle className="w-4 h-4" />
          Preview Emails
        </button>
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Sending...' : 'Send All'}
        </button>
      </div>
    </div>
  );
}
