// ============================================================================
// Refik Chrome Extension - Content Script
// Açıklama: UYAP sayfalarında çalışan ana script
// 
// Bu script:
// 1. Sayfa yüklendiğinde otomatik olarak çalışır
// 2. UYAP verilerini çeker
// 3. Background service worker'a gönderir
// 4. Kullanıcı etkileşimlerini işler
// ============================================================================

/// <reference types="chrome" />

import { 
  parseCurrentPage, 
  detectPageType,
  UYAPFileData,
  extractDecisionText,
  extractHearings,
  extractStatus
} from './uyap-parser';

// ============================================================================
// SABİTLER
// ============================================================================

const UYAP_URL_PATTERN = 'uyap.adalet.gov.tr';

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Background script'e mesaj gönder
 */
function sendToBackground(action: string, data?: any): void {
  chrome.runtime.sendMessage({ action, data }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[Refik Content] Mesaj hatası:', chrome.runtime.lastError);
    }
  });
}

/**
 * Sayfa yüklendiğinde gösterilecek bildirim
 */
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // Mevcut toast'ı kaldır
  const existingToast = document.getElementById('refik-toast');
  if (existingToast) existingToast.remove();

  // Yeni toast oluştur
  const toast = document.createElement('div');
  toast.id = 'refik-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  // Animation ekle
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // 3 saniye sonra kaldır
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Highlight overlay ekle
 */
function addHighlightButton(element: Element, text: string, action: string): void {
  const button = document.createElement('button');
  button.className = 'refik-highlight-btn';
  button.textContent = text;
  button.style.cssText = `
    position: absolute;
    top: -30px;
    right: 0;
    padding: 4px 12px;
    background: #3B82F6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    z-index: 99999;
  `;
  
  button.onclick = (e) => {
    e.stopPropagation();
    sendToBackground(action);
    button.remove();
  };

  element.style.position = 'relative';
  element.appendChild(button);
}

// ============================================================================
// SAYFA ANALİZ
// ============================================================================

/**
 * Sayfayı analiz et ve veri çek
 */
function analyzePage(): void {
  console.log('[Refik Content] Sayfa analiz ediliyor...');
  
  const pageType = detectPageType(window.location.href, window.location.pathname);
  console.log('[Refik Content] Sayfa türü:', pageType);
  
  if (pageType === 'file-detail' || pageType === 'unknown') {
    // Dosya detay sayfasında tam analiz yap
    const fileData = parseCurrentPage();
    
    if (fileData) {
      console.log('[Refik Content] Dosya verileri:', fileData.caseNumber);
      sendToBackground('UYAP_DATA_FETCHED', fileData);
      showToast('Refik: Dosya bilgileri alındı', 'success');
    }
  } else if (pageType === 'file-search') {
    console.log('[Refik Content] Arama sayfası algılandı');
  } else if (pageType === 'decision-view') {
    // Karar görüntüleme sayfası
    const decisionText = extractDecisionText();
    console.log('[Refik Content] Karar metni uzunluğu:', decisionText.length);
    
    sendToBackground('UYAP_DATA_FETCHED', {
      pageType: 'decision-view',
      content: decisionText,
      url: window.location.href,
    });
  }
}

// ============================================================================
// MESAJ İŞLEYİCİLER
// ============================================================================

/**
 * Background'dan gelen mesajları işle
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Refik Content] Mesaj alındı:', message.action);
  
  switch (message.action) {
    case 'PAGE_LOADED':
      // Sayfa tamamen yüklendi, analiz et
      setTimeout(analyzePage, 1000); // 1 sn bekle (dynamic content için)
      break;
      
    case 'SUMMARIZE_RESULT':
      // AI özet sonucunu göster
      if (message.data?.summary) {
        showToast(`Özet: ${message.data.summary.substring(0, 100)}...`, 'success');
      }
      break;
      
    case 'summarize-current-page':
      // Manuel özetleme
      const fileData = parseCurrentPage();
      if (fileData) {
        sendToBackground('SUMMARIZE', {
          caseId: fileData.caseNumber,
          newContent: JSON.stringify(fileData),
          contentType: 'document',
          title: `UYAP - ${fileData.caseNumber}`,
        });
        showToast('Refik: Dosya özetleniyor...', 'info');
      }
      break;
      
    case 'create-reminder-from-page':
      // Manuel hatırlatıcı oluşturma
      const data = parseCurrentPage();
      if (data && data.hearings.length > 0) {
        const nextHearing = data.hearings[0];
        sendToBackground('CREATE_REMINDER', {
          title: `${data.caseNumber} - Duruşma`,
          dueDate: nextHearing.date,
          caseId: data.caseNumber,
        });
        showToast('Refik: Hatırlatıcı oluşturuldu', 'success');
      } else {
        showToast('Refik: Duruşma bilgisi bulunamadı', 'error');
      }
      break;
      
    case 'add-to-refik-case':
      // Dosyayı Refik'e ekle
      const caseData = parseCurrentPage();
      if (caseData) {
        sendToBackground('UYAP_DATA_FETCHED', caseData);
        showToast('Refik: Dosya Refik\'e eklendi', 'success');
      }
      break;
      
    default:
      console.log('[Refik Content] Bilinmeyen action:', message.action);
  }
});

// ============================================================================
// SAYFA DEĞİŞİKLİĞİ
// ============================================================================

// MutationObserver ile sayfa değişikliklerini izle
let lastUrl = window.location.href;

const observer = new MutationObserver(() => {
  // URL değiştiğinde (SPA navigation)
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('[Refik Content] URL değişti:', lastUrl);
    
    // Yeni sayfayı analiz et
    setTimeout(analyzePage, 2000);
  }
  
  // Yeni içerik yüklendiğinde (dynamic content)
  const fileData = parseCurrentPage();
  if (fileData && fileData.caseNumber) {
    sendToBackground('UYAP_DATA_FETCHED', fileData);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// ============================================================================
// BAŞLANGIÇ
// ============================================================================

console.log('[Refik Content] UYAP Content Script başlatıldı');

// Sayfa yüklendiğinde analiz et
if (document.readyState === 'complete') {
  setTimeout(analyzePage, 2000);
} else {
  window.addEventListener('load', () => {
    setTimeout(analyzePage, 2000);
  });
}