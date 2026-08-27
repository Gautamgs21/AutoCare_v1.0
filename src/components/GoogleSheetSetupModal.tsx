import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Play, Database, FileSpreadsheet, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storageService';

interface GoogleSheetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
}

export const GoogleSheetSetupModal: React.FC<GoogleSheetSetupModalProps> = ({
  isOpen,
  onClose,
  currentScriptUrl,
  onSaveScriptUrl,
}) => {
  const [scriptUrl, setScriptUrl] = useState(currentScriptUrl);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'code' | 'test'>('guide');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const scriptCode = storageService.getGoogleAppsScriptTemplate();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSave = () => {
    onSaveScriptUrl(scriptUrl.trim());
    onClose();
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter your deployed Google Apps Script Web App URL first.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Pinging Google Apps Script endpoint...');

    try {
      const ok = await storageService.testConnection(scriptUrl.trim());
      if (ok) {
        setTestStatus('success');
        setTestMessage('Connected successfully! Your Google Sheet is ready to receive fleet data.');
      } else {
        setTestStatus('error');
        setTestMessage('Could not reach Apps Script. Make sure access is set to "Anyone" and the Web App is deployed as a new version.');
      }
    } catch (e: any) {
      setTestStatus('error');
      setTestMessage(e.message || 'Connection test failed. Check CORS / Web App deployment permissions.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-[640px] max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Google Sheets & Apps Script Setup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Free, serverless cloud database for GitHub-hosted AutoCare
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. 3-Minute Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Copy Apps Script Code ({'Code.gs'})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'test'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Connect & Test
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-2 text-emerald-900 dark:text-emerald-200">
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Why Google Sheet + Apps Script?
                </h4>
                <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                  Because AutoCare is hosted as a static site on <strong>GitHub Pages</strong>, Google Apps Script serves as your <strong>100% free, zero-maintenance backend API</strong>, and Google Sheets acts as your real-time database!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Create a Google Sheet
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Open <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> and rename your sheet to <strong>"AutoCare Fleet Database"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Open Apps Script Editor
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      In the Google Sheet menu bar, click <strong>Extensions &gt; Apps Script</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Paste the Script Code
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Delete any placeholder code in <code>Code.gs</code>, switch to the <strong>"2. Copy Apps Script Code"</strong> tab above, click Copy, and paste it into the editor. Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">Ctrl+S</kbd> to save.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Deploy as Web App
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Click the <strong>Deploy &gt; New deployment</strong> button in the top right.
                      <br />• Select Type: <strong>Web App</strong>
                      <br />• Execute as: <strong>Me</strong>
                      <br />• Who has access: <strong>Anyone</strong> (crucial for receiving syncs from GitHub)
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      Paste the Web App URL here
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Copy the generated URL (ends in <code>/exec</code>) and paste it into the <strong>"Connect & Test"</strong> tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Code.gs (Ready for Google Apps Script)
                </span>
                <button
                  onClick={handleCopyCode}
                  className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px] max-h-72 overflow-y-auto p-4 leading-relaxed">
                <pre>{scriptCode}</pre>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                This script automatically generates 4 formatted sheets: <code>Vehicles</code>, <code>FuelLogs</code>, <code>ServiceRecords</code>, and <code>Priorities</code>, with color-coded headers and auto-resizing.
              </p>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Apps Script Web App URL:
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-hidden font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Save URL</span>
                </button>
              </div>

              {testStatus !== 'idle' && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs font-medium ${
                    testStatus === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : testStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {testMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
          >
            Save & Finish
          </button>
        </div>
      </div>
    </div>
  );
};
