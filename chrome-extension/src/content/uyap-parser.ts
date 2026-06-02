// ============================================================================
// UYAP Parser - UYAP Sayfalarından Veri Çekme
// Açıklama: Chrome Extension için UYAP web sayfalarından veri çeker
// 
// Desteklenen Sayfalar:
// - Dashboard: Genel bakış, istatistikler
// - Dosya Arama: Arama sonuçları
// - Dosya Detay: Tam dosya bilgileri
// - Duruşma Listesi: Duruşma tarihleri ve sonuçlar
// - Karar Görüntüleme: Karar metinleri
// - Taraflar: Davacı ve davalı bilgileri
// - Belgeler: Belge listesi
// 
// Kullanım:
// import { parseCurrentPage, detectPageType } from './uyap-parser';
// const data = parseCurrentPage();
// ============================================================================

/// <reference types="chrome" />

// ============================================================================
// TİP TANIMLARI
// ============================================================================

/**
 * UYAP sayfa türleri
 */
export type UYAPPageType = 
  | 'dashboard'        // Ana panel, genel bakış
  | 'case-search'      // Dosya arama sayfası
  | 'case-detail'       // Dosya detay sayfası
  | 'hearing-list'      // Duruşma listesi
  | 'decision'          // Karar görüntüleme
  | 'parties'           // Taraflar bilgisi
  | 'documents'         // Belge listesi
  | 'unknown';          // Tanınamayan sayfa

/**
 * Çıkarılan dosya verisi
 */
export interface UYAPFileData {
  caseNumber: string;      // Dosya numarası (örn: "2024/1234 E.")
  court: string;           // Mahkeme adı
  caseType: string;        // Dosya türü (örn: "Hukuk")
  status: string;          // Dosya durumu
  subject?: string;        // Konu/başlık
  parties?: Party[];       // Taraflar
  hearings?: Hearing[];     // Duruşmalar
  decisions?: Decision[];  // Kararlar
  url: string;             // Sayfa URL'si
  extractedAt: Date;       // Çıkarım zamanı
}

/**
 * Taraf bilgisi
 */
export interface Party {
  type: 'davacı' | 'davalı' | 'diğer';
  name: string;
  tckn?: string;
  address?: string;
}

/**
 * Duruşma bilgisi
 */
export interface Hearing {
  date: string;            // Duruşma tarihi
  time?: string;          // Saat
  location?: string;      // Yer (salon)
  status?: string;        // Durum (yapıldı, ertelendi vb.)
  result?: string;        // Sonuç
}

/**
 * Karar bilgisi
 */
export interface Decision {
  date: string;           // Karar tarihi
  type: string;           // Karar türü
  decisionText?: string;   // Karar metni
  judge?: string;         // Hakim
}

// ============================================================================
// SABİTLER
// ============================================================================

/**
 * UYAP URL kalıpları - Hangi sayfada olduğumuzu tespit eder
 */
const UYAP_URL_PATTERNS = {
  dashboard: /uyap\.adalet\.gov\.tr\/dashboard/i,
  caseSearch: /uyap\.adalet\.gov\.tr\/dosya-arama/i,
  caseDetail: /uyap\.adalet\.gov\.tr\/dosya-detay/i,
  hearingList: /uyap\.adalet\.gov\.tr\/durusalist/i,
  decision: /uyap\.adalet\.gov\.tr\/karar/i,
  parties: /uyap\.adalet\.gov\.tr\/taraflar/i,
  documents: /uyap\.adalet\.gov\.tr\/belgeler/i,
};

/**
 * DOM element selector'ları - UYAP sayfa yapısına göre
 * NOT: Bu selector'lar UYAP'ın mevcut yapısına göre yazılmıştır
 * UYAP güncellenirse bu selector'lar güncellenmelidir
 */
const SELECTORS = {
  // Dosya numarası
  caseNumber: '[data-testid="case-number"], .case-no, #dosyaNo',
  
  // Mahkeme adı
  court: '[data-testid="court-name"], .court-name, #mahkemeAdi',
  
  // Dosya türü
  caseType: '[data-testid="case-type"], .case-type, #dosyaTuru',
  
  // Durum
  status: '[data-testid="case-status"], .case-status, #durum',
  
  // Konu
  subject: '[data-testid="case-subject"], .case-subject, #konu',
  
  // Taraflar container
  partiesContainer: '[data-testid="parties"], .parties, #taraflar',
  
  // Tek taraflı bilgi
  partyItem: '.party-item, .taraf, [data-testid="party"]',
  
  // Duruşma listesi
  hearingContainer: '[data-testid="hearings"], .hearings, #durusalar',
  
  // Tek duruşma
  hearingItem: '.hearing-item, .durusalar-item, [data-testid="hearing"]',
  
  // Kararlar container
  decisionContainer: '[data-testid="decisions"], .decisions, #kararlar',
  
  // Tek karar
  decisionItem: '.decision-item, .karar-item, [data-testid="decision"]',
};

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Sayfa URL'sinden sayfa türünü tespit eder
 * @returns Sayfa türü (UYAPPageType)
 */
export function detectPageType(): UYAPPageType {
  const url = window.location.href;
  
  // URL kalıplarını kontrol et
  if (UYAP_URL_PATTERNS.dashboard.test(url)) return 'dashboard';
  if (UYAP_URL_PATTERNS.caseSearch.test(url)) return 'case-search';
  if (UYAP_URL_PATTERNS.caseDetail.test(url)) return 'case-detail';
  if (UYAP_URL_PATTERNS.hearingList.test(url)) return 'hearing-list';
  if (UYAP_URL_PATTERNS.decision.test(url)) return 'decision';
  if (UYAP_URL_PATTERNS.parties.test(url)) return 'parties';
  if (UYAP_URL_PATTERNS.documents.test(url)) return 'documents';
  
  // URL kalıbı yoksa DOM'a bak
  return detectPageTypeFromDOM();
}

/**
 * DOM elementlerinden sayfa türünü tespit eder
 * URL kalıbı eşleşmediğinde kullanılır
 * @returns Sayfa türü (UYAPPageType)
 */
function detectPageTypeFromDOM(): UYAPPageType {
  // Dashboard kontrolü
  const dashboardIndicator = document.querySelector('.dashboard, [data-testid="dashboard"]');
  if (dashboardIndicator) return 'dashboard';
  
  // Dosya detay kontrolü
  const caseDetailIndicator = document.querySelector('.dosya-detay, #dosyaDetay, [data-testid="case-detail"]');
  if (caseDetailIndicator) return 'case-detail';
  
  // Duruşma listesi kontrolü
  const hearingIndicator = document.querySelector('.durusalar, #durusalar, [data-testid="hearing-list"]');
  if (hearingIndicator) return 'hearing-list';
  
  return 'unknown';
}

/**
 * DOM'dan metin çeker
 * Birden fazla selector denenebilir
 * @param selectors - Denenecek selector'ler (virgülle ayrılmış)
 * @returns Çekilen metin veya null
 */
function extractText(...selectors: string[]): string | null {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    } catch {
      // Selector geçersiz, sonrakiyle dene
    }
  }
  return null;
}

/**
 * Bir container içindeki tüm öğeleri çeker
 * @param containerSelector - Container selector'ü
 * @param itemSelector - Öğe selector'ü
 * @returns Öğe elementleri dizisi
 */
function extractItems(containerSelector: string, itemSelector: string): Element[] {
  const container = document.querySelector(containerSelector);
  if (!container) return [];
  
  return Array.from(container.querySelectorAll(itemSelector));
}

/**
 * Tarih bilgisini parse eder
 * UYAP farklı formatlarda tarih gösterebilir
 * @param dateString - Tarih string'i
 * @returns Parsed tarih veya null
 */
function parseDate(dateString: string): string | null {
  if (!dateString) return null;
  
  // Türkçe tarih formatları
  const turkishPatterns = [
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/,  // 15.06.2024
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // 15/06/2024
    /(\d{4})-(\d{2})-(\d{2})/,         // 2024-06-15
  ];
  
  for (const pattern of turkishPatterns) {
    const match = dateString.match(pattern);
    if (match) {
      // Türkçe formatı ISO formatına çevir
      if (pattern.source.includes('.')) {
        return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
      }
    }
  }
  
  return dateString.trim();
}

// ============================================================================
// VERİ ÇIKARMA FONKSİYONLARI
// ============================================================================

/**
 * Dosya numarasını çıkarır
 * UYAP'ta genellikle "2024/1234 E." formatında
 * @returns Dosya numarası veya null
 */
export function extractCaseNumber(): string | null {
  // Önce belirli bir elementi dene
  const caseNumberEl = document.querySelector(
    '[data-testid="case-number"], ' +
    '.case-number, ' +
    '#dosyaNo, ' +
    '.dosya-no, ' +
    '[class*="caseNumber"]'
  );
  
  if (caseNumberEl && caseNumberEl.textContent) {
    return caseNumberEl.textContent.trim();
  }
  
  // Sayfadaki tüm metinlerde ara
  const pageText = document.body.innerText;
  const casePattern = /\d{4}\/\d+/;
  const match = pageText.match(casePattern);
  
  return match ? match[0] : null;
}

/**
 * Mahkeme adını çıkarır
 * @returns Mahkeme adı veya null
 */
export function extractCourt(): string | null {
  return extractText(
    '[data-testid="court-name"]',
    '.court-name',
    '#mahkemeAdi',
    '.mahkeme-adi',
    '[class*="court"]'
  );
}

/**
 * Dosya türünü çıkarır
 * Örnek: "Hukuk", "Ceza", "İş"
 * @returns Dosya türü veya null
 */
export function extractCaseType(): string | null {
  return extractText(
    '[data-testid="case-type"]',
    '.case-type',
    '#dosyaTuru',
    '.dosya-turu'
  );
}

/**
 * Dosya durumunu çıkarır
 * Örnek: "Aktif", "Kapalı", "Ertelendi"
 * @returns Durum veya null
 */
export function extractStatus(): string | null {
  return extractText(
    '[data-testid="case-status"]',
    '.case-status',
    '#durum',
    '.durum'
  );
}

/**
 * Dosya konusunu/başlığını çıkarır
 * @returns Konu veya null
 */
export function extractSubject(): string | null {
  return extractText(
    '[data-testid="case-subject"]',
    '.case-subject',
    '#konu',
    '.konu'
  );
}

/**
 * Taraflar bilgisini çıkarır (davacı, davalı)
 * @returns Taraflar dizisi
 */
export function extractParties(): Party[] {
  const parties: Party[] = [];
  
  // Taraflar container'ını bul
  const partiesContainer = document.querySelector(
    '[data-testid="parties"], ' +
    '.parties, ' +
    '#taraflar, ' +
    '.taraflar'
  );
  
  if (!partiesContainer) return parties;
  
  // Her tarafı çıkar
  const partyElements = partiesContainer.querySelectorAll(
    '.party-item, ' +
    '.taraf, ' +
    '[data-testid="party"], ' +
    '.taraf-item'
  );
  
  partyElements.forEach(element => {
    const text = element.textContent || '';
    
    // Taraf türünü belirle
    let type: Party['type'] = 'diğer';
    if (text.includes('Davacı') || text.includes('davacı')) {
      type = 'davacı';
    } else if (text.includes('Davalı') || text.includes('davalı')) {
      type = 'davalı';
    }
    
    // İsim çıkarımı (basit heuristic)
    const nameMatch = text.match(/(?:Davacı|Davalı|Biçim)\s*[:\-]?\s*([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)+)/);
    const name = nameMatch ? nameMatch[1] : text.substring(0, 50).trim();
    
    // TCKN çıkarımı (varsa)
    const tcknMatch = text.match(/\d{11}/);
    
    parties.push({
      type,
      name,
      tckn: tcknMatch ? tcknMatch[0] : undefined,
    });
  });
  
  return parties;
}

/**
 * Duruşma bilgilerini çıkarır
 * @returns Duruşmalar dizisi
 */
export function extractHearings(): Hearing[] {
  const hearings: Hearing[] = [];
  
  // Duruşma container'ını bul
  const hearingContainer = document.querySelector(
    '[data-testid="hearings"], ' +
    '.hearings, ' +
    '#durusalar, ' +
    '.durusalar'
  );
  
  if (!hearingContainer) return hearings;
  
  // Her duruşmayı çıkar
  const hearingElements = hearingContainer.querySelectorAll(
    '.hearing-item, ' +
    '.durusalar-item, ' +
    '[data-testid="hearing"], ' +
    '.durusalar-satur'
  );
  
  hearingElements.forEach(element => {
    const text = element.textContent || '';
    
    // Tarih çıkarımı
    const dateMatch = text.match(/\d{1,2}[.\/]\d{1,2}[.\/]\d{4}/);
    const date = dateMatch ? parseDate(dateMatch[0]) : null;
    
    // Saat çıkarımı
    const timeMatch = text.match(/\d{1,2}:\d{2}/);
    const time = timeMatch ? timeMatch[0] : undefined;
    
    // Yer (salon) çıkarımı
    const locationMatch = text.match(/(?:Salon|Salon No)[\s:]*(\d+|[A-Z]+)/i);
    const location = locationMatch ? locationMatch[1] : undefined;
    
    // Durum çıkarımı
    let status = 'Bilinmiyor';
    if (text.includes('Yapıldı') || text.includes('Gerçekleşti')) status = 'Yapıldı';
    if (text.includes('Ertelendi')) status = 'Ertelendi';
    if (text.includes('İptal')) status = 'İptal';
    
    // Sonuç çıkarımı
    const resultMatch = text.match(/(?:Sonuç|Bilgi)[\s:]*([^\n]+)/);
    const result = resultMatch ? resultMatch[1].trim() : undefined;
    
    if (date) {
      hearings.push({
        date: date,
        time,
        location,
        status,
        result,
      });
    }
  });
  
  return hearings;
}

/**
 * Karar bilgilerini çıkarır
 * @returns Kararlar dizisi
 */
export function extractDecisions(): Decision[] {
  const decisions: Decision[] = [];
  
  // Karar container'ını bul
  const decisionContainer = document.querySelector(
    '[data-testid="decisions"], ' +
    '.decisions, ' +
    '#kararlar, ' +
    '.kararlar'
  );
  
  if (!decisionContainer) return decisions;
  
  // Her kararı çıkar
  const decisionElements = decisionContainer.querySelectorAll(
    '.decision-item, ' +
    '.karar-item, ' +
    '[data-testid="decision"], ' +
    '.karar-satur'
  );
  
  decisionElements.forEach(element => {
    const text = element.textContent || '';
    
    // Tarih çıkarımı
    const dateMatch = text.match(/\d{1,2}[.\/]\d{1,2}[.\/]\d{4}/);
    const date = dateMatch ? parseDate(dateMatch[0]) : null;
    
    // Karar türü
    let type = 'Bilinmiyor';
    if (text.includes('Red')) type = 'Red';
    if (text.includes('Kabul')) type = 'Kabul';
    if (text.includes('Emsal')) type = 'Emsal';
    
    // Hakim çıkarımı
    const judgeMatch = text.match(/(?:Hakim|Hakimler)[\s:]*([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)+)/);
    const judge = judgeMatch ? judgeMatch[1] : undefined;
    
    // Karar metni (uzun metin varsa)
    const decisionTextMatch = text.match(/(?:Karar|Metni)[\s:]*([^\n]{100,})/);
    const decisionText = decisionTextMatch ? decisionTextMatch[1].trim() : undefined;
    
    if (date) {
      decisions.push({
        date,
        type,
        judge,
        decisionText,
      });
    }
  });
  
  return decisions;
}

/**
 * Mevcut sayfadan tüm dosya bilgilerini çıkarır
 * Bu ana fonksiyondur - diğer fonksiyonları çağırır
 * @returns Tüm dosya verileri
 */
export function parseCurrentPage(): UYAPFileData | null {
  const pageType = detectPageType();
  
  // Tanınamayan sayfa kontrolü
  if (pageType === 'unknown') {
    console.log('[UYAP Parser] Sayfa türü tespit edilemedi');
    return null;
  }
  
  // Temel bilgileri çıkar
  const caseNumber = extractCaseNumber();
  if (!caseNumber) {
    console.log('[UYAP Parser] Dosya numarası bulunamadı');
    return null;
  }
  
  const data: UYAPFileData = {
    caseNumber,
    court: extractCourt() || 'Bilinmiyor',
    caseType: extractCaseType() || 'Bilinmiyor',
    status: extractStatus() || 'Aktif',
    subject: extractSubject() || undefined,
    url: window.location.href,
    extractedAt: new Date(),
  };
  
  // Sayfa türüne göre ek bilgiler
  switch (pageType) {
    case 'case-detail':
    case 'parties':
      data.parties = extractParties();
      break;
      
    case 'hearing-list':
      data.hearings = extractHearings();
      break;
      
    case 'decision':
      data.decisions = extractDecisions();
      break;
  }
  
  console.log('[UYAP Parser] Veri çıkarıldı:', data);
  return data;
}

// ============================================================================
// SAYAÇ VE ANALİZ FONKSİYONLARI
// ============================================================================

/**
 * Sayfadaki toplam dosya sayısını döner (arama sonuçları için)
 * @returns Dosya sayısı
 */
export function getResultCount(): number {
  const resultElement = document.querySelector(
    '[data-testid="result-count"], ' +
    '.result-count, ' +
    '#sonucSayisi'
  );
  
  if (resultElement) {
    const text = resultElement.textContent || '';
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  
  // Alternatif: Sonuç item'larını say
  const resultItems = document.querySelectorAll(
    '.result-item, ' +
    '.dosya-item, ' +
    '[data-testid="result-item"]'
  );
  
  return resultItems.length;
}

/**
 * Sayfa yüklenme durumunu kontrol eder
 * @returns Yüklendiyse true
 */
export function isPageLoaded(): boolean {
  // Loading spinner'ı kontrol et
  const loading = document.querySelector(
    '.loading, ' +
    '.spinner, ' +
    '[data-testid="loading"], ' +
    '#yukleniyor'
  );
  
  return !loading;
}

// ============================================================================
// MUTATION OBSERVER - SAYFA DEĞİŞİKLİKLERİNİ TAKİP ET
// ============================================================================

/**
 * DOM değişikliklerini dinler
 * UYAP SPA (Single Page Application) olduğu için bu gerekli
 * Sayfa tamamen değişmeden sadece içerik güncellenebilir
 * @param callback - Her değişiklikte çağrılacak fonksiyon
 * @returns Observer instance (durdurmak için kullanılabilir)
 */
export function observePageChanges(callback: (mutations: MutationRecord[]) => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    // Sayfa yüklenmiş mi kontrol et
    if (!isPageLoaded()) return;
    
    // Değişiklikleri callback'e gönder
    callback(mutations);
  });
  
  // Body'yi izle (tüm alt elementler dahil)
  observer.observe(document.body, {
    childList: true,      // Yeni eklenen/çıkarılan elementler
    subtree: true,        // Tüm alt ağaç
    characterData: true,  // Text değişiklikleri
    attributes: false,    // Attribute değişiklikleri (gerekirse açılır)
  });
  
  console.log('[UYAP Parser] MutationObserver başlatıldı');
  return observer;
}

/**
 * Sayfa değişikliğinde otomatik olarak veri çeker
 * 5 saniye debounce ile fazla çağrıyı önler
 * @param callback - Veri çekildiğinde çağrılacak fonksiyon
 */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function autoParseOnChange(callback: (data: UYAPFileData) => void): void {
  observePageChanges(() => {
    // Debounce: 5 saniye içinde sadece bir kez çalışır
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
      const data = parseCurrentPage();
      if (data) {
        callback(data);
      }
    }, 5000); // 5 saniye debounce
  });
}

// ============================================================================
// DEBUG VE TEST FONKSİYONLARI
// ============================================================================

/**
 * Mevcut sayfa bilgilerini console'a yazdırır
 * Debugging için kullanılır
 */
export function debugPage(): void {
  const data = parseCurrentPage();
  console.log('=== UYAP Parser Debug ===');
  console.log('Sayfa Türü:', detectPageType());
  console.log('URL:', window.location.href);
  console.log('Veri:', JSON.stringify(data, null, 2));
  console.log('========================');
}

/**
 * Tüm sayfa elementlerini listeler (debugging)
 * Sayfa yapısını anlamak için kullanılır
 */
export function listPageElements(): void {
  const allElements = document.querySelectorAll('*');
  console.log('=== Sayfa Elementleri ===');
  console.log(`Toplam: ${allElements.length} element`);
  
  // Sadece elementlerini ve class'larını listele
  const elementsWithData = Array.from(allElements)
    .filter(el => el.id || el.className)
    .slice(0, 50); // İlk 50'yi göster
  
  elementsWithData.forEach(el => {
    const id = el.id ? `#${el.id}` : '';
    const className = el.className ? `.${el.className.toString().split(' ').join('.')}` : '';
    console.log(`${el.tagName}${id}${className}`);
  });
}

// ============================================================================
// MODÜL EXPORT
// ============================================================================

export default {
  detectPageType,
  parseCurrentPage,
  extractCaseNumber,
  extractCourt,
  extractCaseType,
  extractStatus,
  extractSubject,
  extractParties,
  extractHearings,
  extractDecisions,
  getResultCount,
  isPageLoaded,
  observePageChanges,
  autoParseOnChange,
  debugPage,
  listPageElements,
};