import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, Shield, Lock } from 'lucide-react';
import { documentApi } from '../services/api';

export default function UploadModal({ isOpen, onClose, onUploadSuccess, currentUser, activeDepartment }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const initialDept = (activeDepartment && activeDepartment !== 'all') 
    ? activeDepartment 
    : (currentUser?.department || 'Cloud & Infrastructure Engineering');
  const [department, setDepartment] = useState(initialDept);
  const [submissionType, setSubmissionType] = useState('contract');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) {
        const cleanName = f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an enterprise document to upload.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('department', department);
    formData.append('course_code', department.split(' ')[0].toUpperCase()); // Acts as category code
    formData.append('submission_type', submissionType);
    formData.append('is_public', isPublic ? 'true' : 'false');

    try {
      await documentApi.upload(formData, (pct) => setProgress(pct));
      onUploadSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Check connection to file service.');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Upload Enterprise Vault Asset</h3>
              <p className="text-[11px] text-slate-500 font-mono">MinIO Persistent Distributed Storage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & drop upload area */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Document File (PDF, DOCX, XLSX, ZIP)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-5 text-center cursor-pointer bg-slate-50/50 transition">
              <input
                type="file"
                id="vault-file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="vault-file-upload" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                {file ? (
                  <div>
                    <span className="font-bold text-indigo-950 text-xs">{file.name}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">({formatSize(file.size)})</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-slate-700">Click to choose or drag document here</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Streaming upload up to 50 MB</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Services Agreement FY2026"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Cloud & Infrastructure Engineering">Engineering & Specs</option>
                <option value="Legal & Corporate Compliance">Legal & Compliance</option>
                <option value="Global Finance & Operations">Finance & Audits</option>
                <option value="Computer Science & Engineering">Computer Science & Academic</option>
                <option value="Human Resources">HR & Protocols</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Classification</label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="contract">Legal Contract / MSA</option>
                <option value="blueprint">Architecture Blueprint</option>
                <option value="financial_report">Financial Audit Report</option>
                <option value="policy">Corporate Policy / Protocol</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document purpose and versioning notes..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-indigo-700">
                <span>Streaming binary to MinIO S3...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Encrypting & Storing...' : 'Upload to Vault'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
