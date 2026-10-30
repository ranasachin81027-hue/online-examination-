import React, { useState } from 'react';
import { PYTHON_FLASK_FILES } from '../data/pythonFlaskSource';
import { 
  X, 
  FileCode, 
  Copy, 
  Check, 
  Terminal, 
  Download, 
  HelpCircle,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface ProjectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectSourceModal: React.FC<ProjectSourceModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(PYTHON_FLASK_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-900 text-white">
              <Terminal className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                B.Tech Project Deliverable: Python / Flask / SQLite Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Production-ready code, unit test suite, and Windows execution instructions for college project submission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area: Sidebar + File Viewer */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 p-3 shrink-0 flex flex-col">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
              Project Files
            </div>
            <div className="space-y-1 flex-1 overflow-y-auto">
              {PYTHON_FLASK_FILES.map((file) => {
                const isActive = selectedFile.name === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-900 text-white shadow-xs font-semibold'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-slate-500'}`} />
                    <span className="truncate">{file.path}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Windows Guide card */}
            <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950">
              <div className="flex items-center gap-1.5 font-semibold mb-1 text-indigo-900">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Windows Run Tip</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                Install Python 3.9+, create venv, run <code className="bg-indigo-100/70 px-1 py-0.5 rounded font-mono">pip install -r requirements.txt</code>, then launch <code className="bg-indigo-100/70 px-1 py-0.5 rounded font-mono">python app.py</code>.
              </p>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900 text-slate-100 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-mono text-indigo-400 font-semibold">{selectedFile.path}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 capitalize">{selectedFile.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed selection:bg-indigo-600 selection:text-white">
              <pre className="text-slate-300">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">ExamPortal Architecture:</span>
            <span>MVC Design · Parameterized SQL Queries · Werkzeug Password Hashing · Role Access Controls</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
