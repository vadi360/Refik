// ============================================================================
// Refik Chrome Extension - Popup UI (React)
// Açıklama: Extension popup arayüzü
// ============================================================================

import React, { useState, useEffect } from 'react';

// ============================================================================
// TİPLER
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
}

interface FileData {
  caseNumber: string;
  court: string;
  caseType: string;
  status: string;
  url: string;
  timestamp?: number;
}

interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  token: string;
  currentFile: FileData | null;
  recentFiles: FileData[];
  connectionStatus: 'connected' | 'disconnected' | 'checking';
}

// ============================================================================
// API SERVİS
// ============================================================================

const API_BASE = 'https://api.refik.app/api/v1';

async function apiRequest(endpoint: string, options?: RequestInit): Promise<any> {
  const token = await new Promise<string>((resolve) => {
    chrome.storage.sync.get(['token'], (result) => resolve(result.token || ''));
  });

  if (!token) throw new Error('Giriş yapılmamış');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      chrome.storage.sync.set({ token: null });
      throw new Error('Oturum süresi dolmuş');
    }
    throw new Error(`API hatası: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// BİLEŞENLER
// ============================================================================

/**
 * Login Ekranı
 */
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Lütfen token girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Token geçerli mi kontrol et
      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        onLogin(token);
      } else {
        setError('Geçersiz token');
      }
    } catch (err) {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        <span style={styles.logoText}>Refik</span>
        <span style={styles.logoTag}>UYAP Yardımcısı</span>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Giriş Yap</h2>
        <p style={styles.subtitle}>
          Refik hesabınızdan aldığınız token ile giriş yapın
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer token..."
            style={styles.input}
            disabled={loading}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={handleLogin}
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>

        <div style={styles.help}>
          <p>Token almak için:</p>
          <ol style={styles.helpList}>
            <li>refik.app adresine gidin</li>
            <li>Hesap ayarlarına girin</li>
            <li>"API Token" bölümünden token oluşturun</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * Ana Ekran
 */
function MainScreen({ 
  user, 
  currentFile, 
  recentFiles, 
  connectionStatus,
  onLogout,
  onRefresh,
  onSummarize,
  onCreateReminder
}: {
  user: User;
  currentFile: FileData | null;
  recentFiles: FileData[];
  connectionStatus: 'connected' | 'disconnected' | 'checking';
  onLogout: () => void;
  onRefresh: () => void;
  onSummarize: () => void;
  onCreateReminder: () => void;
}) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerLogo}>Refik</span>
          {user && <span style={styles.headerUser}>{user.name}</span>}
        </div>
        <div style={styles.headerRight}>
          <span style={{
            ...styles.statusDot,
            background: connectionStatus === 'connected' ? '#10B981' : '#EF4444'
          }} />
          <button onClick={onLogout} style={styles.logoutBtn}>Çıkış</button>
        </div>
      </div>

      {/* Mevcut Dosya */}
      {currentFile ? (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>📁 Mevcut Dosya</span>
            <span style={styles.cardBadge}>{currentFile.status}</span>
          </div>
          
          <div style={styles.fileInfo}>
            <div style={styles.fileNumber}>{currentFile.caseNumber}</div>
            <div style={styles.fileCourt}>{currentFile.court}</div>
            <div style={styles.fileType}>{currentFile.caseType}</div>
          </div>

          <div style={styles.actions}>
            <button onClick={onSummarize} style={styles.actionBtn}>
              📋 Özet
            </button>
            <button onClick={onCreateReminder} style={styles.actionBtn}>
              ⏰ Hatırlat
            </button>
            <button onClick={onRefresh} style={styles.actionBtn}>
              🔄 Yenile
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📋</span>
          <p>UYAP'ta bir dosya açın</p>
        </div>
      )}

      {/* Son Tarananlar */}
      {recentFiles.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Son Tarananlar</span>
          </div>
          
          <div style={styles.recentList}>
            {recentFiles.slice(0, 5).map((file, index) => (
              <div key={index} style={styles.recentItem}>
                <span style={styles.recentNumber}>{file.caseNumber}</span>
                <span style={styles.recentCourt}>{file.court}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerText}>api.refik.app</span>
      </div>
    </div>
  );
}

// ============================================================================
// ANA UYGULAMA
// ============================================================================

export default function App() {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    user: null,
    token: '',
    currentFile: null,
    recentFiles: [],
    connectionStatus: 'checking',
  });

  // Başlangıçta token ve verileri yükle
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Storage'dan token ve recent files al
      const data = await new Promise<any>((resolve) => {
        chrome.storage.sync.get(['token', 'user'], (result) => {
          chrome.storage.local.get(['recentFiles', 'currentFile'], (local) => {
            resolve({
              token: result.token,
              user: result.user,
              recentFiles: local.recentFiles || [],
              currentFile: local.currentFile || null,
            });
          });
        });
      });

      if (data.token) {
        // Token geçerli mi kontrol et
        try {
          const response = await fetch(`${API_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setState({
              ...state,
              isLoggedIn: true,
              token: data.token,
              user: userData.data,
              recentFiles: data.recentFiles,
              currentFile: data.currentFile,
              connectionStatus: 'connected',
            });
          } else {
            setState({ ...state, connectionStatus: 'disconnected' });
          }
        } catch {
          setState({ ...state, connectionStatus: 'disconnected' });
        }
      } else {
        setState({ ...state, connectionStatus: 'disconnected' });
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setState({ ...state, connectionStatus: 'disconnected' });
    }
  };

  const handleLogin = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        
        chrome.storage.sync.set({ token, user: userData.data });
        
        setState({
          ...state,
          isLoggedIn: true,
          token,
          user: userData.data,
          connectionStatus: 'connected',
        });
      }
    } catch (error) {
      console.error('Login hatası:', error);
    }
  };

  const handleLogout = () => {
    chrome.storage.sync.set({ token: null, user: null });
    setState({
      ...state,
      isLoggedIn: false,
      token: '',
      user: null,
    });
  };

  const handleSummarize = async () => {
    if (!state.currentFile || !state.token) return;

    try {
      await apiRequest('/ai/case-update', {
        method: 'POST',
        body: JSON.stringify({
          caseId: state.currentFile.caseNumber,
          newContent: JSON.stringify(state.currentFile),
          contentType: 'document',
          title: `UYAP - ${state.currentFile.caseNumber}`,
        }),
      });
      alert('Dosya özetlendi!');
    } catch (error) {
      alert('Özetleme hatası: ' + (error as Error).message);
    }
  };

  const handleCreateReminder = async () => {
    if (!state.currentFile?.caseNumber || !state.token) return;

    try {
      await apiRequest('/reminders', {
        method: 'POST',
        body: JSON.stringify({
          title: `${state.currentFile.caseNumber} - UYAP Hatırlatıcı`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          caseId: state.currentFile.caseNumber,
          notifyTypes: ['push', 'email'],
        }),
      });
      alert('Hatırlatıcı oluşturuldu!');
    } catch (error) {
      alert('Hatırlatıcı hatası: ' + (error as Error).message);
    }
  };

  const handleRefresh = () => {
    // UYAP sayfasından veri çek
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'PAGE_LOADED' });
      }
    });
  };

  // Render
  if (!state.isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <MainScreen
      user={state.user}
      currentFile={state.currentFile}
      recentFiles={state.recentFiles}
      connectionStatus={state.connectionStatus}
      onLogout={handleLogout}
      onRefresh={handleRefresh}
      onSummarize={handleSummarize}
      onCreateReminder={handleCreateReminder}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px',
    minHeight: '100%',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logoText: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  logoTag: {
    display: 'block',
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
  card: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '16px',
  },
  inputGroup: {
    marginBottom: '12px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#3B82F6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  buttonDisabled: {
    background: '#9CA3AF',
    cursor: 'not-allowed',
  },
  error: {
    background: '#FEE2E2',
    color: '#991B1B',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    marginBottom: '12px',
  },
  help: {
    marginTop: '16px',
    padding: '12px',
    background: '#F3F4F6',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#6B7280',
  },
  helpList: {
    marginTop: '8px',
    paddingLeft: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E7EB',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headerLogo: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerUser: {
    fontSize: '12px',
    color: '#6B7280',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  logoutBtn: {
    fontSize: '12px',
    color: '#EF4444',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
  },
  cardBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: '10px',
  },
  fileInfo: {
    marginBottom: '12px',
  },
  fileNumber: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '4px',
  },
  fileCourt: {
    fontSize: '12px',
    color: '#6B7280',
  },
  fileType: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    flex: 1,
    padding: '8px',
    background: '#F3F4F6',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '32px 16px',
    color: '#6B7280',
  },
  emptyIcon: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '8px',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  recentItem: {
    padding: '8px',
    background: '#F9FAFB',
    borderRadius: '4px',
  },
  recentNumber: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
  },
  recentCourt: {
    display: 'block',
    fontSize: '11px',
    color: '#6B7280',
  },
  footer: {
    textAlign: 'center',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #E5E7EB',
  },
  footerText: {
    fontSize: '11px',
    color: '#9CA3AF',
  },
};