// ============================================================================
// Refik Chrome Extension - Background Service Worker
// Açıklama: UYAP scraping, API iletişimi, context menu, alarm yönetimi
// 
// Bu service worker:
// 1. UYAP sayfalarından veri çeker
// 2. Backend API (api.refik.app) ile haberleşir
// 3. Context menu oluşturur
// 4. Alarm/hatırlatıcı yönetir
// 5. Bildirim gönderir
// ============================================================================

/// <reference types="chrome" />

// ============================================================================
// TİPLER
// ============================================================================

interface UYAPFileData {
  caseNumber: string;
  court: string;
  caseType: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  hearings: Array<{
    date: string;
    time: string;
    result: string;
  }>;
  status: string;
  url: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RefikConfig {
  apiUrl: string;
  token: string | null;
  autoSummarize: boolean;
  notifications: {
    reminder: boolean;
    deadline: boolean;
    delegation: boolean;
  };
}

// ============================================================================
// SABİTLER
// ============================================================================

const API_BASE_URL = 'https://api.refik.app/api/v1';

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Chrome storage'dan config oku
 */
async function getConfig(): Promise<RefikConfig> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        apiUrl: API_BASE_URL,
        token: null,
        autoSummarize: true,
        notifications: {
          reminder: true,
          deadline: true,
          delegation: true,
        },
      },
      (items) => resolve(items as RefikConfig)
    );
  });
}

/**
 * API'ye istek gönder
 */
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: any
): Promise<ApiResponse<T>> {
  const config = await getConfig();

  if (!config.token) {
    throw new Error('Giriş yapılmamış. Lütfen Refik popup\'tan giriş yapın.');
  }

  const response = await fetch(`${config.apiUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      chrome.storage.sync.set({ token: null });
      throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    }
    throw new Error(`API hatası: ${response.status}`);
  }

  return response.json();
}

/**
 * Mesaj gönder (content script'e)
 */
async function sendToContent(
  tabId: number,
  message: any
): Promise<chrome.tabs.Tab> {
  return chrome.tabs.sendMessage(tabId, message);
}

// ============================================================================
// CONTEXT MENU
// ============================================================================

/**
 * Context menu oluştur
 */
chrome.runtime.onInstalled.addListener(() => {
  // Özetleme
  chrome.contextMenus.create({
    id: 'summarize-case',
    title: '📋 Bu Dosyayı Özetle',
    contexts: ['page'],
  });

  // Hatırlatıcı
  chrome.contextMenus.create({
    id: 'create-reminder',
    title: '⏰ Duruşma Hatırlatıcısı Oluştur',
    contexts: ['page'],
  });

  // Dosyaya ekle
  chrome.contextMenus.create({
    id: 'add-to-case',
    title: '📁 Dosyaya Ekle',
    contexts: ['page'],
  });

  console.log('[Refik] Eklenti yüklendi');
});

/**
 * Context menu tıklama işleyicisi
 */
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  const config = await getConfig();

  if (!config.token) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Refik - Giriş Gerekli',
      message: 'Özellikleri kullanmak için önce giriş yapın.',
    });
    return;
  }

  switch (info.menuItemId) {
    case 'summarize-case':
      await sendToContent(tab.id, { action: 'summarize-current-page' });
      break;

    case 'create-reminder':
      await sendToContent(tab.id, { action: 'create-reminder-from-page' });
      break;

    case 'add-to-case':
      await sendToContent(tab.id, { action: 'add-to-refik-case' });
      break;
  }
});

// ============================================================================
// MESSAGE HANDLER (Content Script'ten Gelen Mesajlar)
// ============================================================================

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('[Refik BG] Mesaj alındı:', request.action);

  try {
    switch (request.action) {
      // UYAP verisi çek
      case 'UYAP_DATA_FETCHED':
        await handleUYAPData(request.data);
        break;

      // Özet iste
      case 'SUMMARIZE':
        await handleSummarize(request.data, sender.tab?.id);
        break;

      // Hatırlatıcı oluştur
      case 'CREATE_REMINDER':
        await handleCreateReminder(request.data);
        break;

      // Token doğrula
      case 'VALIDATE_TOKEN':
        await handleValidateToken(sendResponse);
        return true;

      // Bağlantı kontrolü
      case 'CHECK_CONNECTION':
        await handleConnectionCheck(sendResponse);
        return true;

      default:
        console.log('[Refik BG] Bilinmeyen action:', request.action);
    }
  } catch (error) {
    console.error('[Refik BG] Hata:', error);
    sendResponse({ success: false, error: (error as Error).message });
  }
});

/**
 * UYAP'tan çekilen veriyi işle
 */
async function handleUYAPData(data: UYAPFileData) {
  console.log('[Refik BG] UYAP verisi işleniyor:', data.caseNumber);

  // Storage'a kaydet (son tarananlar)
  const config = await getConfig();
  
  chrome.storage.local.get(['recentFiles'], (result) => {
    const recentFiles = result.recentFiles || [];
    
    // Yeni dosyayı başa ekle
    recentFiles.unshift({
      ...data,
      timestamp: Date.now(),
    });

    // En fazla 10 dosya tut
    if (recentFiles.length > 10) {
      recentFiles.pop();
    }

    chrome.storage.local.set({ recentFiles });
  });

  // Auto-summarize açıksa otomatik özetle
  if (config.autoSummarize) {
    try {
      await apiRequest('/ai/case-update', 'POST', {
        caseId: data.caseNumber,
        newContent: JSON.stringify(data),
        contentType: 'document',
        title: `UYAP - ${data.caseNumber}`,
        metadata: { source: 'uyap', url: data.url },
      });
      
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Refik - Dosya İşlendi',
        message: `${data.caseNumber} dosyası analiz edildi.`,
      });
    } catch (error) {
      console.error('[Refik BG] Otomatik özetleme hatası:', error);
    }
  }
}

/**
 * Özet isteğini işle
 */
async function handleSummarize(data: any, tabId?: number) {
  const result = await apiRequest<any>('/ai/case-update', 'POST', data);

  if (tabId) {
    await sendToContent(tabId, {
      action: 'SUMMARIZE_RESULT',
      data: result.data,
    });
  }
}

/**
 * Hatırlatıcı oluştur
 */
async function handleCreateReminder(data: {
  title: string;
  dueDate: string;
  caseId?: string;
}) {
  const result = await apiRequest<any>('/reminders', 'POST', {
    title: data.title,
    dueDate: data.dueDate,
    caseId: data.caseId,
    notifyTypes: ['push', 'email'],
  });

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Refik - Hatırlatıcı Oluşturuldu',
    message: data.title,
  });

  return result;
}

/**
 * Token doğrula
 */
async function handleValidateToken(sendResponse: Function) {
  try {
    await apiRequest('/users/profile', 'GET');
    sendResponse({ success: true, valid: true });
  } catch {
    sendResponse({ success: true, valid: false });
  }
}

/**
 * Bağlantı kontrolü
 */
async function handleConnectionCheck(sendResponse: Function) {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    sendResponse({ success: true, connected: true, data });
  } catch {
    sendResponse({ success: true, connected: false });
  }
}

// ============================================================================
// ALARM / HATIRLATICI
// ============================================================================

/**
 * Alarm oluştur (hatırlatıcı için)
 */
chrome.alarms.create('check-reminders', {
  periodInMinutes: 5, // Her 5 dakikada kontrol
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'check-reminders') {
    console.log('[Refik BG] Alarm kontrolü çalıştı');
    // Burada backend'e istek atıp yaklaşan hatırlatıcıları kontrol edebiliriz
  }
});

// ============================================================================
// TAB OLAYLARI
// ============================================================================

/**
 * UYAP sekmesi değiştiğinde kontrol et
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('uyap.adalet.gov.tr')) {
    // Sayfa tamamen yüklendiğinde içeriği çek
    try {
      await sendToContent(tabId, { action: 'PAGE_LOADED' });
    } catch (error) {
      console.error('[Refik BG] Tab güncelleme hatası:', error);
    }
  }
});

console.log('[Refik] Background service worker başlatıldı');