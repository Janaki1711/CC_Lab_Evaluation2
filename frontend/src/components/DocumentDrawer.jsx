import React from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  FileText, 
  ShieldCheck, 
  Clock, 
  User, 
  HardDrive, 
  ExternalLink,
  Lock,
  Layers,
  Key
} from 'lucide-react';

export default function DocumentDrawer({ document, isOpen, onClose, onDownload, onDelete }) {
  if (!isOpen || !document) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFileBadgeColor = (ext) => {
    if (ext === 'pdf') return 'bg-rose-50 text-rose-700 border-rose-200';
    if (ext === 'docx' || ext === 'doc') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (ext === 'xlsx' || ext === 'csv') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getFileBadgeColor(document.file_extension)}`}>
                {document.file_extension || 'FILE'}
              </span>
              <span className="text-xs font-bold text-slate-700">Document Specification</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-5 text-xs text-slate-600">
            
            {/* Title & Description */}
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {document.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {document.description || 'Verified enterprise document stored under Kubernetes-orchestrated distributed persistent volumes.'}
              </p>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-800 text-[11px] block mt-0.5">
                  {document.department}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                <span className="font-mono text-slate-800 text-[11px] block mt-0.5">
                  {formatSize(document.file_size_bytes)}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner / Author</span>
                <span className="font-semibold text-slate-800 text-[11px] block mt-0.5 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {document.uploader_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Uploaded On</span>
                <span className="font-mono text-slate-500 text-[11px] block mt-0.5">
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Cloud Storage & Kubernetes Architecture Manifest */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                Storage Cluster Manifest
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">MinIO Object Key</label>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all mt-1">
                  {document.storage_key}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Target Bucket</label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-indigo-700 mt-1">
                    {document.storage_bucket || 'academic-documents'}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Data Redundancy</label>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mt-1">
                    PVC HostPath Bound
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Content-Type / MIME</label>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600 mt-1">
                  {document.mime_type}
                </div>
              </div>
            </div>

            {/* Security & Access Policy Callout */}
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                End-to-End Cryptographic Verification
              </div>
              <p className="text-[11px] text-slate-600 leading-normal">
                Direct downloads stream binary chunks over the internal Kubernetes cluster bridge, secured by JWT identity and role-based access verification.
              </p>
            </div>

          </div>
        </div>

        {/* Drawer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => onDelete(document.id)}
            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete Asset
          </button>

          <button
            onClick={() => onDownload(document)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Stream Binary Download
          </button>
        </div>

      </div>
    </div>
  );
}
