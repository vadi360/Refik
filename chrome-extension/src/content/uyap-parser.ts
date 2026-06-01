// ============================================================================
// Refik Chrome Extension - UYAP Parser
// Açıklama: UYAP sayfalarından veri çeken fonksiyonlar
// 
// Desteklenen sayfalar:
// - Dosya arama
// - Dosya detay
// - Duruşma listesi
// - Karar görüntüleme
// ============================================================================

/**
 * UYAP sayfa türlerini belirle
 */
export type UYAPPageType = 
  | 'dashboard'
  | 'file-search'
  | 'file-detail'
  | 'hearing-list'
  | 'decision-view'
  | 'parties'
  | 'documents'
  | 'unknown';

/**
 * UYAP dosya verisi
 */
export interface UYAPFileData {
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
  decisions: Array<{
    date: string;
    content: string;
  }>;
  status: string;
  url: string;
  pageType: UYAPPageType;
}

/**
 * Sayfa türünü belirle
 */
export function detectPageType(url: string, pathname: string): UYAPPageType {
  if (pathname.includes('/Dosya/DosyaArama')) return 'file-search';
  if (pathname.includes('/Dosya/DosyaDetay')) return 'file-detail';
  if (pathname.includes('/Durusma/DurusmaListesi')) return 'hearing-list';
  if (pathname.includes('/Karar/KararGoruntuleme')) return 'decision-view';
  if (pathname.includes('/Taraflar/TarafBilgileri')) return 'parties';
  if (pathname.includes('/Belge/BelgeListesi')) return 'documents';
  if (pathname.includes('/Anasayfa') || pathname === '/') return 'dashboard';
  return 'unknown';
}

/**
 * DOM'dan veri çek
 */
export function parseElement(selector: string): string | null {
  const element = document.querySelector(selector);
  return element?.textContent?.trim() || null;
}

/**
 * Tablo verisi çek
 */
export function parseTable(tableSelector: string): Array<Record<string, string>> {
  const table = document.querySelector(tableSelector);
  if (!table) return [];

  const rows = table.querySelectorAll('tr');
  const data: Array<Record<string, string>> = [];
  
  rows.forEach((row, index) => {
    if (index === 0) return; // Header satırını atla
    
    const cells = row.querySelectorAll('td');
    const rowData: Record<string, string> = {};
    
    cells.forEach((cell, cellIndex) => {
      rowData[`col${cellIndex}`] = cell.textContent?.trim() || '';
    });
    
    if (Object.values(rowData).some(v => v)) {
      data.push(rowData);
    }
  });

  return data;
}

/**
 * Dosya numarasını çek
 */
export function extractCaseNumber(): string | null {
  // Birçok olası selector deneyelim
  const selectors = [
    '.dosya-no',
    '.case-number',
    '#dosyaNo',
    '[data-field="caseNumber"]',
    '.panel-body .col-md-3',
    'strong:has(+ span)',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim() || '';
      // Regex ile dosya numarası formatını kontrol et
      const match = text.match(/\d{4}\/\d+/);
      if (match) return match[0];
    }
  }

  // URL'den çekmeyi dene
  const urlMatch = window.location.href.match(/dosyaNo=(\d+)/);
  if (urlMatch) return urlMatch[1];

  return null;
}

/**
 * Mahkeme bilgisini çek
 */
export function extractCourt(): string | null {
  const selectors = [
    '.mahkeme-adi',
    '.court-name',
    '#mahkemeAdi',
    '.panel-heading',
    'h3:contains("Mahkeme")',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.textContent?.trim() || '';
      if (text.length > 3) return text;
    }
  }

  return null;
}

/**
 * Dava türünü çek
 */
export function extractCaseType(): string | null {
  const selectors = [
    '.dava-turu',
    '.case-type',
    '#davaTuru',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || null;
    }
  }

  return null;
}

/**
 * Tarafları çek
 */
export function extractParties(): { plaintiff: string; defendant: string } {
  const result = { plaintiff: '', defendant: '' };

  // Davacı
  const plaintiffSelectors = [
    '.davaci',
    '.plaintiff',
    '#davaciAd',
    'td:contains("Davacı") + td',
  ];

  for (const selector of plaintiffSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      result.plaintiff = element.textContent?.trim() || '';
      break;
    }
  }

  // Davalı
  const defendantSelectors = [
    '.davali',
    '.defendant',
    '#davaliAd',
    'td:contains("Davalı") + td',
  ];

  for (const selector of defendantSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      result.defendant = element.textContent?.trim() || '';
      break;
    }
  }

  return result;
}

/**
 * Duruşmaları çek
 */
export function extractHearings(): Array<{ date: string; time: string; result: string }> {
  const hearings: Array<{ date: string; time: string; result: string }> = [];

  // Tablo formatında duruşmalar
  const tableRows = document.querySelectorAll('table.durusma-tablo tr, .hearing-row');
  
  tableRows.forEach((row) => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      hearings.push({
        date: cells[0]?.textContent?.trim() || '',
        time: cells[1]?.textContent?.trim() || '',
        result: cells[2]?.textContent?.trim() || '',
      });
    }
  });

  // Liste formatında duruşmalar
  if (hearings.length === 0) {
    const listItems = document.querySelectorAll('.durma-item, .hearing-item');
    listItems.forEach((item) => {
      const text = item.textContent || '';
      const dateMatch = text.match(/\d{2}\.\d{2}\.\d{4}/);
      const timeMatch = text.match(/\d{2}:\d{2}/);
      
      hearings.push({
        date: dateMatch ? dateMatch[0] : '',
        time: timeMatch ? timeMatch[0] : '',
        result: text.replace(dateMatch?.[0] || '', '').replace(timeMatch?.[0] || '', '').trim(),
      });
    });
  }

  return hearings;
}

/**
 * Kararları çek
 */
export function extractDecisions(): Array<{ date: string; content: string }> {
  const decisions: Array<{ date: string; content: string }> = [];

  // Karar kartları
  const decisionCards = document.querySelectorAll('.karar-card, .decision-item');
  
  decisionCards.forEach((card) => {
    const dateEl = card.querySelector('.karar-tarih, .decision-date');
    const contentEl = card.querySelector('.karar-icerik, .decision-content');
    
    if (dateEl && contentEl) {
      decisions.push({
        date: dateEl.textContent?.trim() || '',
        content: contentEl.textContent?.trim() || '',
      });
    }
  });

  return decisions;
}

/**
 * Dosya durumunu çek
 */
export function extractStatus(): string | null {
  const selectors = [
    '.dava-durumu',
    '.case-status',
    '#davaDurumu',
    '.status-badge',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || null;
    }
  }

  return null;
}

/**
 * Sayfadaki tüm verileri çek (tam analiz)
 */
export function parseCurrentPage(): UYAPFileData | null {
  try {
    const pageType = detectPageType(window.location.href, window.location.pathname);
    
    // Minimum dosya numarası gerekli
    const caseNumber = extractCaseNumber();
    if (!caseNumber) {
      console.log('[Refik Parser] Dosya numarası bulunamadı');
      return null;
    }

    const fileData: UYAPFileData = {
      caseNumber,
      court: extractCourt() || 'Bilinmiyor',
      caseType: extractCaseType() || 'Bilinmiyor',
      parties: extractParties(),
      hearings: extractHearings(),
      decisions: extractDecisions(),
      status: extractStatus() || 'Aktif',
      url: window.location.href,
      pageType,
    };

    console.log('[Refik Parser] Sayfa analiz edildi:', { caseNumber, pageType });
    
    return fileData;
  } catch (error) {
    console.error('[Refik Parser] Sayfa parse hatası:', error);
    return null;
  }
}

/**
 * Arama sonuçlarından dosya bilgilerini çek
 */
export function parseSearchResults(): Array<{
  caseNumber: string;
  court: string;
  caseType: string;
  status: string;
  url: string;
}> {
  const results: Array<{
    caseNumber: string;
    court: string;
    caseType: string;
    status: string;
    url: string;
  }> = [];

  // Arama sonuçları tablosu
  const rows = document.querySelectorAll('.arama-sonucu tr, .search-result-row');
  
  rows.forEach((row) => {
    const linkEl = row.querySelector('a');
    const cells = row.querySelectorAll('td');
    
    if (linkEl && cells.length >= 3) {
      results.push({
        caseNumber: cells[0]?.textContent?.trim() || '',
        court: cells[1]?.textContent?.trim() || '',
        caseType: cells[2]?.textContent?.trim() || '',
        status: cells[3]?.textContent?.trim() || '',
        url: linkEl.getAttribute('href') || '',
      });
    }
  });

  return results;
}

/**
 * Karar metnini çek
 */
export function extractDecisionText(): string {
  const selectors = [
    '.karar-icerik',
    '#kararText',
    '.decision-text',
    '.kararMetni',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || '';
    }
  }

  // Tüm sayfa metnini dene (karar görüntüleme sayfası)
  const bodyText = document.body.innerText;
  if (bodyText.length > 100) {
    return bodyText.substring(0, 10000); // Max 10KB
  }

  return '';
}