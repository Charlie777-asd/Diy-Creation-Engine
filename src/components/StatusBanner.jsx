import React, { useState } from 'react';
import { isSupabaseConfigured, supabaseConfigError } from '../services/supabaseClient';

/**
 * StatusBanner — Premium floating service-health dashboard.
 * Shows Ollama AI + Supabase DB connection status.
 * Slides in after app loads. Collapsible.
 */
export default function StatusBanner({ ollamaStatus, show, onDismiss }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!show) return null;

  const dbOk = isSupabaseConfigured;
  const aiOk = ollamaStatus === 'connected';
  const allGood = dbOk && aiOk;

  if (allGood && collapsed) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '104px',
        right: '28px',
        zIndex: 9985,
        width: collapsed ? '48px' : '300px',
        background: 'rgba(8, 5, 2, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(200,168,76,0.25)',
        borderRadius: collapsed ? '24px' : '18px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,168,76,0.1)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: "'Lato', sans-serif",
      }}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            width: '48px', height: '48px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '18px',
          }}
          title="Show system status"
        >
          {allGood ? '🟢' : '🔴'}
        </button>
      ) : (
        <div style={{ padding: '14px 16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: allGood ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 8px ${allGood ? '#22c55e' : '#f59e0b'}`,
                animation: 'status-pulse 2s infinite',
              }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#c9a84c', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                System Status
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5c4020', fontSize: '14px', lineHeight: 1, padding: '2px' }}
            >✕</button>
          </div>

          {/* Services */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Ollama AI */}
            <ServiceRow
              icon="🤖"
              label="Local AI (Ollama)"
              ok={aiOk}
              detail={
                aiOk
                  ? 'Connected & ready'
                  : ollamaStatus === 'checking'
                  ? 'Connecting…'
                  : 'Offline — start Ollama on your PC'
              }
              fix={!aiOk && ollamaStatus !== 'checking' ? 'ollama serve' : null}
            />

            {/* Supabase */}
            <ServiceRow
              icon="🗄️"
              label="Supabase Database"
              ok={dbOk}
              detail={
                dbOk
                  ? 'Connected'
                  : 'VITE_SUPABASE_ANON_KEY missing in .env'
              }
              fix={!dbOk ? 'Add key to .env file' : null}
              fixUrl={!dbOk ? 'https://supabase.com/dashboard/project/hglezeelsvgjhidnkvtg/settings/api' : null}
            />
          </div>

          {/* Footer note */}
          {!allGood && (
            <p style={{ fontSize: '9px', color: '#5c4020', marginTop: '10px', lineHeight: 1.4 }}>
              App works in demo mode without database. AI features require Ollama running locally.
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function ServiceRow({ icon, label, ok, detail, fix, fixUrl }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '8px 10px',
      background: ok ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
      border: `1px solid ${ok ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: '10px',
    }}>
      <span style={{ fontSize: '14px', marginTop: '1px' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: ok ? '#86efac' : '#fca5a5' }}>
            {label}
          </span>
          <span style={{
            fontSize: '7px', fontWeight: 700,
            padding: '1px 5px', borderRadius: '4px',
            background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: ok ? '#22c55e' : '#ef4444',
          }}>
            {ok ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
        <p style={{ fontSize: '9px', color: '#8a7355', margin: '2px 0 0', lineHeight: 1.4 }}>
          {detail}
        </p>
        {fix && (
          <div style={{ marginTop: '5px' }}>
            {fixUrl ? (
              <a
                href={fixUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '8.5px', fontWeight: 700,
                  color: '#c9a84c', textDecoration: 'none',
                  border: '1px solid rgba(200,168,76,0.3)',
                  borderRadius: '4px', padding: '2px 7px',
                  display: 'inline-block',
                }}
              >
                → Get API Key ↗
              </a>
            ) : (
              <code style={{
                fontSize: '8px', background: 'rgba(0,0,0,0.4)',
                color: '#c9a84c', padding: '2px 6px', borderRadius: '4px',
              }}>
                {fix}
              </code>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
