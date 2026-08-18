import React, { useState } from 'react';
import {
  Database,
  X,
  Save,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Server,
  CloudCheck,
  HardDrive,
  Copy,
  Zap,
  Radio,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  isSupabaseConfigured,
  testSupabaseConnection,
  getActiveSupabaseConfig,
  DEFAULT_SUPABASE_URL,
} from '../lib/supabase';

export const SupabaseConfigModal: React.FC = () => {
  const {
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
    products,
    sales,
    purchases,
    customers,
    syncStatus,
    isRealtimeActive,
    lastSyncedTime,
    triggerManualSync,
    triggerManualPull,
    refreshSupabaseConnection,
  } = useApp();

  const [supabaseUrl, setSupabaseUrl] = useState(() => getActiveSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getActiveSupabaseConfig().anonKey);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [manualSyncing, setManualSyncing] = useState(false);
  const [manualPulling, setManualPulling] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSql, setShowSql] = useState(false);

  if (!isSupabaseModalOpen) return null;

  const isConfigured = isSupabaseConfigured(supabaseUrl, supabaseAnonKey);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pos_supabase_url', supabaseUrl.trim());
    localStorage.setItem('pos_supabase_anon_key', supabaseAnonKey.trim());
    setStatusMsg({
      type: 'success',
      text: 'Supabase URL နှင့် Anon Key ကို သိမ်းဆည်းပြီး Auto-Sync & Realtime စတင် ချိတ်ဆက်နေပါသည်...',
    });

    // Refresh realtime subscriber and trigger sync/pull
    refreshSupabaseConnection();

    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMsg(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      if (res.success) {
        setStatusMsg({ type: 'success', text: res.message });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `ချိတ်ဆက်မှု မအောင်မြင်ပါ: ${err?.message || 'Server Unreachable'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncToCloud = async () => {
    setManualSyncing(true);
    setStatusMsg({ type: 'info', text: 'Supabase Cloud Database သို့ ဒေတာများ သိမ်းဆည်းနေပါသည်...' });

    const res = await triggerManualSync();
    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.message,
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message,
      });
    }
    setManualSyncing(false);
  };

  const handlePullFromCloud = async () => {
    setManualPulling(true);
    setStatusMsg({ type: 'info', text: 'Supabase Cloud မှ ဒေတာများ ရယူနေပါသည်...' });

    const res = await triggerManualPull();
    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.message,
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message,
      });
    }
    setManualPulling(false);
  };

  const sqlSchemaCode = `-- 1. Create table for POS data & Realtime sync
CREATE TABLE IF NOT EXISTS pos_backups (
  id TEXT PRIMARY KEY,
  shop_name TEXT,
  phone TEXT,
  total_products INT,
  total_sales INT,
  total_purchases INT,
  total_customers INT,
  data_json JSONB,
  origin_device_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE pos_backups ENABLE ROW LEVEL SECURITY;

-- 3. Allow Public Anon Read & Write
CREATE POLICY "Allow public anon access" 
ON pos_backups 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- 4. Enable Supabase Realtime for pos_backups
ALTER PUBLICATION supabase_realtime ADD TABLE pos_backups;`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-2xs z-70 flex items-center justify-center p-3 md:p-4 animate-in fade-in">
      <div className="bg-slate-900 text-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 md:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Supabase Cloud Realtime Database</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isConfigured
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isConfigured ? 'Auto-Sync & Realtime Live' : 'Key ထည့်ရန် လိုအပ်သည်'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                အချိန်နှင့်တပြေးညီ အလိုအလျောက် သိမ်းဆည်းခြင်းနှင့် စက်အချင်းချင်း တိုက်ရိုက်ချိတ်ဆက်ခြင်း
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Realtime Live Features Banner */}
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Full Realtime Auto-Sync Status</span>
              </span>
              <span className="flex items-center space-x-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{isRealtimeActive ? 'Realtime Active' : 'Connecting...'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                <span className="text-slate-400 flex items-center space-x-1">
                  <DownloadCloud className="w-3 h-3 text-cyan-400" />
                  <span>1. Auto Fetch</span>
                </span>
                <span className="text-emerald-300 font-semibold mt-0.5">အက်ပ်ဖွင့်လျှင် အလိုအလျောက်ရယူ</span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                <span className="text-slate-400 flex items-center space-x-1">
                  <UploadCloud className="w-3 h-3 text-emerald-400" />
                  <span>2. Auto Save</span>
                </span>
                <span className="text-emerald-300 font-semibold mt-0.5">စာရင်းသွင်းတိုင်း တိုက်ရိုက်သိမ်း</span>
              </div>

              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex flex-col">
                <span className="text-slate-400 flex items-center space-x-1">
                  <Radio className="w-3 h-3 text-purple-400" />
                  <span>3. Realtime Multi-Device</span>
                </span>
                <span className="text-purple-300 font-semibold mt-0.5">PC / ဖုန်း တိုက်ရိုက် Live Sync</span>
              </div>
            </div>

            {lastSyncedTime && (
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span>နောက်ဆုံး Cloud သို့ Sync လုပ်ခဲ့ချိန်:</span>
                <span className="font-mono text-emerald-400 font-semibold">{lastSyncedTime}</span>
              </div>
            )}
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start space-x-2.5 animate-in fade-in ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
                  : 'bg-blue-950/80 border border-blue-500/50 text-blue-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className="block font-semibold mb-1 text-slate-200">
                Supabase Project URL:
              </label>
              <input
                type="text"
                required
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://pheguftotlraqdppaajl.supabase.co"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-200">
                  Supabase Anon (Public) Key:
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Project Settings &gt; API
                </span>
              </div>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  required
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pr-10 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Supabase Dashboard &gt; Project Settings &gt; API ထဲမှ <strong className="text-slate-200">anon public key</strong> ကို ကူးယူထည့်သွင်းပေးပါ။
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <button
                id="btn-modal-save-supabase"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center space-x-2 shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save & Connect (သိမ်းဆည်းမည်)</span>
              </button>

              <button
                id="btn-modal-test-supabase"
                type="button"
                disabled={testing}
                onClick={handleTestConnection}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl cursor-pointer flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? 'စစ်ဆေးနေပါသည်...' : 'Test Connection (စစ်ဆေးမည်)'}</span>
              </button>
            </div>
          </form>

          {/* Manual Cloud Sync & Restore Section */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <h4 className="font-bold text-xs text-slate-300 flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manual Control (လက်ဖြင့် ချက်ချင်း Sync / Pull လုပ်လိုပါက)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                id="btn-modal-sync-cloud"
                type="button"
                disabled={manualSyncing || syncStatus === 'syncing'}
                onClick={handleSyncToCloud}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-3 rounded-xl cursor-pointer flex items-center justify-center space-x-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${manualSyncing ? 'animate-bounce' : ''}`} />
                <span>{manualSyncing ? 'Cloud သို့ သိမ်းနေပါသည်...' : 'Force Sync Now (ချက်ချင်းသိမ်းမည်)'}</span>
              </button>

              <button
                id="btn-modal-pull-cloud"
                type="button"
                disabled={manualPulling || syncStatus === 'fetching'}
                onClick={handlePullFromCloud}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2.5 px-3 rounded-xl cursor-pointer flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <DownloadCloud className={`w-4 h-4 ${manualPulling ? 'animate-pulse' : ''}`} />
                <span>{manualPulling ? 'ရယူနေပါသည်...' : 'Force Pull Now (ဒေတာ ပြန်ရယူမည်)'}</span>
              </button>
            </div>
          </div>

          {/* SQL Schema helper toggle */}
          <div className="pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <Server className="w-3.5 h-3.5" />
              <span>{showSql ? 'SQL Schema ဖျောက်မည် ▲' : 'Supabase SQL Table & Realtime Setup ကြည့်ရန် ▼'}</span>
            </button>

            {showSql && (
              <div className="mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 animate-in fade-in">
                <p className="text-[11px] text-slate-400">
                  Supabase Dashboard &gt; <strong className="text-white">SQL Editor</strong> တွင် အောက်ပါ SQL Query ကို Run ပေးပါ (Realtime ဖွင့်ထားပြီးဖြစ်စေရန်):
                </p>
                <div className="relative font-mono text-[10px] text-emerald-400 bg-black/50 p-2.5 rounded-lg overflow-x-auto max-h-48">
                  <pre>{sqlSchemaCode}</pre>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sqlSchemaCode);
                    alert('SQL Script ကို Copy ကူးပြီးပါပြီ!');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy SQL Code</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 md:p-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer transition-colors text-xs"
          >
            ပိတ်မည် (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
