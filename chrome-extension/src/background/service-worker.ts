// ============================================================================
// Refik Chrome Extension - Service Worker (Background Script)
// Açıklama: Uzantının arka planda çalışan ana script'idir
// 
// Görevleri:
// 1. UYAP sayfalarından veri çekme (chrome.tabs)
// 2. Backend API ile iletişim (api.refik.app)
// 3. Context menu oluşturma ve yönetme
// 4. Alarm/rastgele görevler zamanlama
// 5. Mesaj işleme (content script'ten gelen)
// 6. Push bildirim gönderme
// 
// Not: Manifest V3'te background script "Service Worker" olarak çalışır
// Bu nedenle setTimeout, localStorage gibi bazı API'ler farklıdır
// ============================================================================

/// <reference types="chrome" />

// ============================================================================
// TİP TANIMLARI
// ============================================================================

/**
 * API yanıt yapısı
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Backend'e gönderilecek dosya verisi
 */
interface FileData {
  caseNumber: string;
  court: string;
  caseType?: string;
  status?: string;
  url: string;
  parties?: any[];
  hearings?: any[];
  decisions?: any[];
  source: 'uyap' | 'manual';
}

/**
 * Hatırlatıcı oluşturma isteği
 */
interface ReminderRequest {
  caseId: string;
  caseNumber: string;
  hearingDate?: string;
  title: string;
  remindAt: string;
  type: 'hearing' | 'deadline' | 'general';
}

/**
 * Kullanıcı oturum bilgisi
 */
interface UserSession {
  userId: string;
  name: string;
  email: string;
  token: string;
  isLoggedIn: boolean;
}

// ============================================================================
// SABİTLER
// ============================================================================

/**
 * Backend API base URL
 * Production: api.refik.app
 * Development: localhost:3000
 */
const API_BASE_URL = 'https://api.refik.app/api/v1';

/**
 * Chrome Storage anahtarları
 */
const STORAGE_KEYS = {
  USER_SESSION: 'refik_user_session',
  API_TOKEN: 'refik_api_token',
  LAST_SCAN: 'refik_last_scan',
  SETTINGS: 'refik_settings',
} as const;

/**
 * Context menu ID'leri
 */
const CONTEXT_MENU_IDS = {
  SUMMARIZE: 'summarize-case',
  CREATE_REMINDER: 'create-reminder',
  ADD_TO_CASE: 'add-to-case',
} as const;

// ============================================================================
// GLOBAL DEĞİŞKENLER
// ============================================================================

/**
 * Mevcut kullanıcı oturumu
 * Service worker her uyandığında yeniden yüklenir
 * Bu nedenle chrome.storage kullanılır
 */
let currentSession: UserSession | null = null;

/**
 * Loglama yardımcı fonksiyonu
 * Debug modunda konsola yazar
 */
function log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
  const timestamp = new Date().toISOString();
  const prefix = `[Refik Service Worker][${timestamp}]`;
  
  switch (level) {
    case 'info':
      console.log(`${prefix} INFO: ${message}`, data || '');
      break;
    case 'warn':
      console.warn(`${prefix} WARN: ${message}`, data || '');
      break;
    case 'error':
      console.error(`${prefix} ERROR: ${message}`, data || '');
      break;
  }
}

// ============================================================================
// CHROME STORAGE YARDIMCILARI
// ============================================================================

/**
 * Chrome storage'dan veri okur
 * @param key - Storage anahtarı
 * @returns Promise<any> - Okunan veri veya null
 */
async function getFromStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

/**
 * Chrome storage'a veri yazar
 * @param key - Storage anahtarı
 * @param value - Yazılacak değer
 */
async function setToStorage(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

/**
 * Chrome storage'dan veri siler
 * @param key - Storage anahtarı
 */
async function removeFromStorage(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      resolve();
    });
  });
}

/**
 * Kullanıcı oturum bilgisini alır
 * @returns UserSession veya null
 */
async function getUserSession(): Promise<UserSession | null> {
  const session = await getFromStorage<UserSession>(STORAGE_KEYS.USER_SESSION);
  return session;
}

/**
 * Kullanıcı oturum bilgisini kaydeder
 * @param session - Oturum bilgisi
 */
async function setUserSession(session: UserSession): Promise<void> {
  await setToStorage(STORAGE_KEYS.USER_SESSION, session);
  currentSession = session;
}

/**
 * Oturumu temizler (çıkış)
 */
async function clearUserSession(): Promise<void> {
  await removeFromStorage(STORAGE_KEYS.USER_SESSION);
  await removeFromStorage(STORAGE_KEYS.API_TOKEN);
  currentSession = null;
  log('info', 'Oturum temizlendi');
}

// ============================================================================
// API İLETİŞİM FONKSİYONLARI
// ============================================================================

/**
 * Backend'e API isteği gönderir
 * @param endpoint - API endpoint'i (örn: '/ai/case-update')
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param body - İstek gövdesi (opsiyonel)
 * @returns API yanıtı
 */
async function apiRequest<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  // Oturum kontrolü
  const session = await getUserSession();
  if (!session?.token) {
    return { success: false, error: 'Oturum açılmamış' };
  }
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
    };
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const url = `${API_BASE_URL}${endpoint}`;
    log('info', `API İsteği: ${method} ${url}`, body);
    
    const response = await fetch(url, options);
    
    // HTTP hata kontrolü
    if (!response.ok) {
      const errorText = await response.text();
      log('error', `API Hatası: ${response.status}`, errorText);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}` 
      };
    }
    
    // JSON yanıt parse et
    const data = await response.json();
    log('info', `API Yanıtı başarılı: ${endpoint}`);
    
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    log('error', `API İsteği başarısız: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

/**
 * Token geçerliliğini kontrol eder
 * @param token - JWT token
 * @returns Geçerli mi?
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ token }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// UYAP VERİ ÇEKME FONKSİYONLARI
// ============================================================================

/**
 * Aktif UYAP sekmesini bulur
 * @returns Tab veya null
 */
async function findUyapTab(): Promise<chrome.tabs.Tab | null> {
  const tabs = await chrome.tabs.query({});
  
  // UYAP sekmesini bul
  const uyapTab = tabs.find(tab => {
    if (!tab.url) return false;
    return tab.url.includes('uyap.adalet.gov.tr');
  });
  
  return uyapTab || null;
}

/**
 * UYAP sayfasından veri çeker
 * Content script'e mesaj göndererek yapar
 * @param tabId - UYAP sekme ID'si
 * @returns Çekilen veri veya null
 */
async function fetchFromUYAP(tabId: number): Promise<FileData | null> {
  try {
    // Content script'e mesaj gönder
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'GET_PAGE_DATA',
    });
    
    if (response && response.data) {
      log('info', 'UYAP verisi çekildi', response.data);
      return response.data;
    }
    
    return null;
  } catch (error) {
    log('error', 'UYAP veri çekme hatası', error);
    return null;
  }
}

/**
 * Kullanıcının oturum açıp açmadığını kontrol eder
 * @returns Açıksa true
 */
async function isUserLoggedIn(): Promise<boolean> {
  const session = await getUserSession();
  return session?.isLoggedIn === true && !!session?.token;
}

// ============================================================================
// DOSYA İŞLEMLERİ
// ============================================================================

/**
 * Backend'e dosya ekler veya günceller
 * @param fileData - Dosya verileri
 * @returns Eklenen dosya ID'si veya null
 */
async function addOrUpdateFile(fileData: FileData): Promise<string | null> {
  const result = await apiRequest<{ id: string }>('/cases', 'POST', {
    caseNumber: fileData.caseNumber,
    court: fileData.court,
    caseType: fileData.caseType,
    subject: fileData.subject,
    status: fileData.status,
    uyapUrl: fileData.url,
    parties: fileData.parties,
    source: 'uyap',
  });
  
  if (result.success && result.data?.id) {
    log('info', `Dosya eklendi: ${result.data.id}`);
    return result.data.id;
  }
  
  log('error', 'Dosya ekleme hatası', result.error);
  return null;
}

/**
 * Dosyayı AI ile özetler
 * @param caseId - Dosya ID'si
 * @param newContent - Yeni içerik (opsiyonel)
 */
async function summarizeFile(caseId: string, newContent?: string): Promise<string | null> {
  const result = await apiRequest<{ aiSummary: string }>('/ai/case-update', 'POST', {
    caseId,
    newContent: newContent || 'UYAP sayfasından güncellendi',
  });
  
  if (result.success && result.data?.aiSummary) {
    log('info', `Dosya özetlendi: ${caseId}`);
    return result.data.aiSummary;
  }
  
  log('error', 'Özetleme hatası', result.error);
  return null;
}

/**
 * Hatırlatıcı oluşturur
 * @param request - Hatırlatıcı isteği
 */
async function createReminder(request: ReminderRequest): Promise<boolean> {
  const result = await apiRequest('/reminders', 'POST', {
    caseId: request.caseId,
    title: request.title,
    remindAt: request.remindAt,
    type: request.type,
    source: 'uyap',
  });
  
  if (result.success) {
    log('info', `Hatırlatıcı oluşturuldu: ${request.title}`);
    return true;
  }
  
  log('error', 'Hatırlatıcı oluşturma hatası', result.error);
  return false;
}

// ============================================================================
// CONTEXT MENU İŞLEMLERİ
// ============================================================================

/**
 * Context menu'leri oluşturur
 * Kullanıcı UYAP sayfasında sağ tıkladığında görünür
 */
function createContextMenus(): void {
  // Önce mevcut menüleri temizle
  chrome.contextMenus.removeAll(() => {
    log('info', 'Context menüler temizlendi');
  });
  
  // Özetleme menüsü
  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.SUMMARIZE,
    title: '📋 Bu Dosyayı Özetle',
    contexts: ['page'],
  });
  
  // Hatırlatıcı oluşturma menüsü
  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.CREATE_REMINDER,
    title: '⏰ Duruşma Hatırlatıcısı Oluştur',
    contexts: ['page'],
  });
  
  // Dosyaya ekleme menüsü
  chrome.contextMenus.create({
    id: CONTEXT_MENU_IDS.ADD_TO_CASE,
    title: '📁 Dosyaya Ekle',
    contexts: ['page'],
  });
  
  log('info', 'Context menüler oluşturuldu');
}

/**
 * Context menu tıklamasını işler
 * @param info - Tıklanan menu bilgisi
 * @param tab - Tıklanan sekme
 */
async function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab
): Promise<void> {
  if (!tab?.id) return;
  
  // Oturum kontrolü
  if (!(await isUserLoggedIn())) {
    // Kullanıcıyı popupid'e yönlendir
    chrome.action.openPopup();
    return;
  }
  
  log('info', `Context menu tıklandı: ${info.menuItemId}`);
  
  // UYAP verisini çek
  const fileData = await fetchFromUYAP(tab.id);
  if (!fileData) {
    showNotification('UYAP verileri çekilemedi', 'Dosya bilgileri alınamadı');
    return;
  }
  
  switch (info.menuItemId) {
    case CONTEXT_MENU_IDS.SUMMARIZE:
      // Dosyayı ekle ve özetle
      const caseId = await addOrUpdateFile(fileData);
      if (caseId) {
        const summary = await summarizeFile(caseId);
        if (summary) {
          showNotification('✅ Özet Tamamlandı', summary);
        }
      }
      break;
      
    case CONTEXT_MENU_IDS.CREATE_REMINDER:
      // Hatırlatıcı oluştur
      if (fileData.hearings && fileData.hearings.length > 0) {
        const nextHearing = fileData.hearings[0];
        await createReminder({
          caseId: fileData.caseNumber,
          caseNumber: fileData.caseNumber,
          hearingDate: nextHearing.date,
          title: `Duruşma: ${fileData.caseNumber}`,
          remindAt: nextHearing.date,
          type: 'hearing',
        });
        showNotification('⏰ Hatırlatıcı Oluşturuldu', nextHearing.date);
      } else {
        showNotification('⚠️ Duruşma Bulunamadı', 'Bu dosyada duruşma bilgisi yok');
      }
      break;
      
    case CONTEXT_MENU_IDS.ADD_TO_CASE:
      // Sadece dosyayı ekle
      const addedId = await addOrUpdateFile(fileData);
      if (addedId) {
        showNotification('✅ Dosya Eklendi', fileData.caseNumber);
      }
      break;
  }
}

// ============================================================================
// BİLDİRİM FONKSİYONLARI
// ============================================================================

/**
 * Chrome bildirimi gösterir
 * @param title - Bildirim başlığı
 * @param message - Bildirim içeriği
 */
function showNotification(title: string, message: string): void {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/logo.svg',
    title,
    message,
    priority: 1,
  });
}

// ============================================================================
// ALARM İŞLEMLERİ
// ============================================================================

/**
 * Periyodik kontrol alarmı oluşturur
 * Her saat çalışır
 */
function schedulePeriodicCheck(): void {
  // Mevcut alarmı iptal et
  chrome.alarms.clear('periodic-check', () => {
    // Yeni alarm oluştur (her saat)
    chrome.alarms.create('periodic-check', {
      periodInMinutes: 60,
      delayInMinutes: 1, // İlk çalışma 1 dakika sonra
    });
    log('info', 'Periyodik kontrol alarmı ayarlandı (her saat)');
  });
}

/**
 * Alarm tetiklendiğinde çalışır
 * @param alarmName - Alarm adı
 */
async function handleAlarm(alarmName: string): Promise<void> {
  log('info', `Alarm tetiklendi: ${alarmName}`);
  
  if (alarmName === 'periodic-check') {
    // Her saat yapılacak kontroller
    await performPeriodicCheck();
  }
}

/**
 * Periyodik kontrol işlemleri
 * - Oturum geçerliliği kontrolü
 * - Yeni veri kontrolü (opsiyonel)
 */
async function performPeriodicCheck(): Promise<void> {
  // Oturum kontrolü
  const session = await getUserSession();
  if (!session) return;
  
  // Token geçerliliğini kontrol et
  const isValid = await verifyToken(session.token);
  if (!isValid) {
    log('warn', 'Token artık geçerli değil');
    await clearUserSession();
    showNotification('⚠️ Oturum Sona Erdi', 'Lütfen tekrar giriş yapın');
  }
}

// ============================================================================
// MESSAGING (CONTENT SCRIPT İLETİŞİMİ)
// ============================================================================

/**
 * Content script'ten gelen mesajları işler
 * @param message - Mesaj içeriği
 * @param sender - Gönderen bilgisi
 * @param sendResponse - Yanıt gönderme fonksiyonu
 */
async function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
): Promise<void> {
  const { action, data } = message;
  
  log('info', `Mesaj alındı: ${action}`, sender);
  
  switch (action) {
    case 'GET_USER_SESSION':
      // Kullanıcı oturum bilgisini döndür
      const session = await getUserSession();
      sendResponse({ 
        success: true, 
        data: session,
        isLoggedIn: session?.isLoggedIn === true 
      });
      break;
      
    case 'LOGIN':
      // Giriş işlemi
      const loginResult = await handleLogin(data.token);
      sendResponse(loginResult);
      break;
      
    case 'LOGOUT':
      // Çıkış işlemi
      await clearUserSession();
      sendResponse({ success: true });
      break;
      
    case 'GET_PAGE_DATA':
      // UYAP sayfasından veri çek
      if (sender.tab?.id) {
        const pageData = await fetchFromUYAP(sender.tab.id);
        sendResponse({ success: true, data: pageData });
      } else {
        sendResponse({ success: false, error: 'Sekme bulunamadı' });
      }
      break;
      
    case 'ADD_CASE':
      // Dosya ekle
      const caseId = await addOrUpdateFile(data);
      sendResponse({ success: !!caseId, caseId });
      break;
      
    case 'SUMMARIZE_CASE':
      // Dosya özetle
      if (data.caseId) {
        const summary = await summarizeFile(data.caseId, data.newContent);
        sendResponse({ success: !!summary, summary });
      } else {
        sendResponse({ success: false, error: 'caseId gerekli' });
      }
      break;
      
    case 'CREATE_REMINDER':
      // Hatırlatıcı oluştur
      const reminderSuccess = await createReminder(data);
      sendResponse({ success: reminderSuccess });
      break;
      
    default:
      sendResponse({ success: false, error: 'Bilinmeyen action' });
  }
}

/**
 * Giriş işlemini handler
 * @param token - JWT token
 */
async function handleLogin(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Token geçerliliğini kontrol et
    const isValid = await verifyToken(token);
    if (!isValid) {
      return { success: false, error: 'Geçersiz token' };
    }
    
    // Token'i storage'a kaydet
    await setToStorage(STORAGE_KEYS.API_TOKEN, token);
    
    // Kullanıcı bilgilerini al (token'dan veya API'den)
    // Şimdilik basit tutalım
    await setUserSession({
      userId: 'unknown',
      name: 'Kullanıcı',
      email: '',
      token,
      isLoggedIn: true,
    });
    
    log('info', 'Giriş başarılı');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Giriş hatası';
    log('error', 'Giriş başarısız', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// TAB OLAYLARI
// ============================================================================

/**
 * Sekme güncellendiğinde çalışır
 * UYAP sayfasına girildiğinde popup güncellemek için
 * @param tabId - Sekme ID'si
 * @param changeInfo - Değişiklik bilgisi
 * @param tab - Sekme bilgisi
 */
async function handleTabUpdate(
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
): Promise<void> {
  // UYAP sayfasına girildiğini kontrol et
  if (tab.url && tab.url.includes('uyap.adalet.gov.tr')) {
    log('info', 'UYAP sayfasına girildi', tab.url);
    
    // Son tarama zamanını güncelle
    await setToStorage(STORAGE_KEYS.LAST_SCAN, new Date().toISOString());
  }
}

/**
 * Sekme kapatıldığında çalışır
 * @param tabId - Kapatılan sekme ID'si
 */
function handleTabClose(tabId: number): void {
  log('info', `Sekme kapatıldı: ${tabId}`);
}

// ============================================================================
// KOMUT İŞLEMLERİ (SHORTCUTS)
// ============================================================================

/**
 * Keyboard shortcut tetiklendiğinde çalışır
 * Ctrl+Shift+R veya Cmd+Shift+R
 * @param command - Komut adı
 */
async function handleCommand(command: string): Promise<void> {
  log('info', `Komut çalıştırıldı: ${command}`);
  
  if (command === 'open-popup') {
    // Popup'u aç
    // Not: Manifest V3'te popup açma API'si değişti
    chrome.action.openPopup?.();
  }
}

// ============================================================================
// YÜKLEME VE BAŞLATMA
// ============================================================================

/**
 * Service worker başladığında çalışır
 * Tüm event listener'ları ve başlangıç işlemlerini yapar
 */
async function initialize(): Promise<void> {
  log('info', 'Service Worker başlatılıyor...');
  
  // Mevcut oturumu yükle
  const session = await getUserSession();
  if (session) {
    currentSession = session;
    log('info', 'Mevcut oturum yüklendi', session.userId);
  }
  
  // Context menüleri oluştur
  createContextMenus();
  
  // Periyodik alarmı ayarla
  schedulePeriodicCheck();
  
  log('info', 'Service Worker hazır');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Extension yüklendiğinde veya güncellendiğinde çalışır
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  log('info', 'Extension yüklendi/güncellendi', details);
  
  // İlk kurulum için
  if (details.reason === 'install') {
    log('info', 'İlk kurulum tamamlandı');
    createContextMenus();
    schedulePeriodicCheck();
  }
  
  // Güncelleme için
  if (details.reason === 'update') {
    log('info', 'Güncelleme tamamlandı');
  }
});

/**
 * Service worker başladığında çalışır
 */
self.addEventListener('activate', async (event) => {
  log('info', 'Service Worker aktif');
  await initialize();
});

/**
 * Service worker yüklendiğinde çalışır
 */
self.addEventListener('install', async (event) => {
  log('info', 'Service Worker yükleniyor');
  await initialize();
});

/**
 * Mesaj dinleyicisi (content script'ten gelen)
 */
chrome.runtime.onMessage.addListener(handleMessage);

/**
 * Context menu tıklama dinleyicisi
 */
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

/**
 * Tab güncelleme dinleyicisi
 */
chrome.tabs.onUpdated.addListener(handleTabUpdate);

/**
 * Tab kapatma dinleyicisi
 */
chrome.tabs.onRemoved.addListener((tabId) => handleTabClose(tabId));

/**
 * Komut dinleyicisi (keyboard shortcuts)
 */
chrome.commands.onCommand.addListener(handleCommand);

/**
 * Alarm dinleyicisi
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  handleAlarm(alarm.name);
});

// ============================================================================
// MODÜL EXPORT
// ============================================================================

export {
  getUserSession,
  setUserSession,
  clearUserSession,
  isUserLoggedIn,
  apiRequest,
  fetchFromUYAP,
  addOrUpdateFile,
  summarizeFile,
  createReminder,
  showNotification,
};

log('info', 'Service Worker script yüklendi');