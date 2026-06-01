(() => {
  // src/content/uyap-parser.ts
  function detectPageType(url, pathname) {
    if (pathname.includes("/Dosya/DosyaArama")) return "file-search";
    if (pathname.includes("/Dosya/DosyaDetay")) return "file-detail";
    if (pathname.includes("/Durusma/DurusmaListesi")) return "hearing-list";
    if (pathname.includes("/Karar/KararGoruntuleme")) return "decision-view";
    if (pathname.includes("/Taraflar/TarafBilgileri")) return "parties";
    if (pathname.includes("/Belge/BelgeListesi")) return "documents";
    if (pathname.includes("/Anasayfa") || pathname === "/") return "dashboard";
    return "unknown";
  }
  function extractCaseNumber() {
    var _a;
    const selectors = [
      ".dosya-no",
      ".case-number",
      "#dosyaNo",
      '[data-field="caseNumber"]',
      ".panel-body .col-md-3",
      "strong:has(+ span)"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = ((_a = element.textContent) == null ? void 0 : _a.trim()) || "";
        const match = text.match(/\d{4}\/\d+/);
        if (match) return match[0];
      }
    }
    const urlMatch = window.location.href.match(/dosyaNo=(\d+)/);
    if (urlMatch) return urlMatch[1];
    return null;
  }
  function extractCourt() {
    var _a;
    const selectors = [
      ".mahkeme-adi",
      ".court-name",
      "#mahkemeAdi",
      ".panel-heading",
      'h3:contains("Mahkeme")'
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = ((_a = element.textContent) == null ? void 0 : _a.trim()) || "";
        if (text.length > 3) return text;
      }
    }
    return null;
  }
  function extractCaseType() {
    var _a;
    const selectors = [
      ".dava-turu",
      ".case-type",
      "#davaTuru"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return ((_a = element.textContent) == null ? void 0 : _a.trim()) || null;
      }
    }
    return null;
  }
  function extractParties() {
    var _a, _b;
    const result = { plaintiff: "", defendant: "" };
    const plaintiffSelectors = [
      ".davaci",
      ".plaintiff",
      "#davaciAd",
      'td:contains("Davac\u0131") + td'
    ];
    for (const selector of plaintiffSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        result.plaintiff = ((_a = element.textContent) == null ? void 0 : _a.trim()) || "";
        break;
      }
    }
    const defendantSelectors = [
      ".davali",
      ".defendant",
      "#davaliAd",
      'td:contains("Daval\u0131") + td'
    ];
    for (const selector of defendantSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        result.defendant = ((_b = element.textContent) == null ? void 0 : _b.trim()) || "";
        break;
      }
    }
    return result;
  }
  function extractHearings() {
    const hearings = [];
    const tableRows = document.querySelectorAll("table.durusma-tablo tr, .hearing-row");
    tableRows.forEach((row) => {
      var _a, _b, _c, _d, _e, _f;
      const cells = row.querySelectorAll("td");
      if (cells.length >= 3) {
        hearings.push({
          date: ((_b = (_a = cells[0]) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "",
          time: ((_d = (_c = cells[1]) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "",
          result: ((_f = (_e = cells[2]) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || ""
        });
      }
    });
    if (hearings.length === 0) {
      const listItems = document.querySelectorAll(".durma-item, .hearing-item");
      listItems.forEach((item) => {
        const text = item.textContent || "";
        const dateMatch = text.match(/\d{2}\.\d{2}\.\d{4}/);
        const timeMatch = text.match(/\d{2}:\d{2}/);
        hearings.push({
          date: dateMatch ? dateMatch[0] : "",
          time: timeMatch ? timeMatch[0] : "",
          result: text.replace((dateMatch == null ? void 0 : dateMatch[0]) || "", "").replace((timeMatch == null ? void 0 : timeMatch[0]) || "", "").trim()
        });
      });
    }
    return hearings;
  }
  function extractDecisions() {
    const decisions = [];
    const decisionCards = document.querySelectorAll(".karar-card, .decision-item");
    decisionCards.forEach((card) => {
      var _a, _b;
      const dateEl = card.querySelector(".karar-tarih, .decision-date");
      const contentEl = card.querySelector(".karar-icerik, .decision-content");
      if (dateEl && contentEl) {
        decisions.push({
          date: ((_a = dateEl.textContent) == null ? void 0 : _a.trim()) || "",
          content: ((_b = contentEl.textContent) == null ? void 0 : _b.trim()) || ""
        });
      }
    });
    return decisions;
  }
  function extractStatus() {
    var _a;
    const selectors = [
      ".dava-durumu",
      ".case-status",
      "#davaDurumu",
      ".status-badge"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return ((_a = element.textContent) == null ? void 0 : _a.trim()) || null;
      }
    }
    return null;
  }
  function parseCurrentPage() {
    try {
      const pageType = detectPageType(window.location.href, window.location.pathname);
      const caseNumber = extractCaseNumber();
      if (!caseNumber) {
        console.log("[Refik Parser] Dosya numaras\u0131 bulunamad\u0131");
        return null;
      }
      const fileData = {
        caseNumber,
        court: extractCourt() || "Bilinmiyor",
        caseType: extractCaseType() || "Bilinmiyor",
        parties: extractParties(),
        hearings: extractHearings(),
        decisions: extractDecisions(),
        status: extractStatus() || "Aktif",
        url: window.location.href,
        pageType
      };
      console.log("[Refik Parser] Sayfa analiz edildi:", { caseNumber, pageType });
      return fileData;
    } catch (error) {
      console.error("[Refik Parser] Sayfa parse hatas\u0131:", error);
      return null;
    }
  }
  function extractDecisionText() {
    var _a;
    const selectors = [
      ".karar-icerik",
      "#kararText",
      ".decision-text",
      ".kararMetni"
    ];
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return ((_a = element.textContent) == null ? void 0 : _a.trim()) || "";
      }
    }
    const bodyText = document.body.innerText;
    if (bodyText.length > 100) {
      return bodyText.substring(0, 1e4);
    }
    return "";
  }

  // src/content/script.ts
  function sendToBackground(action, data) {
    chrome.runtime.sendMessage({ action, data }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[Refik Content] Mesaj hatas\u0131:", chrome.runtime.lastError);
      }
    });
  }
  function showToast(message, type = "info") {
    const existingToast = document.getElementById("refik-toast");
    if (existingToast) existingToast.remove();
    const toast = document.createElement("div");
    toast.id = "refik-toast";
    toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#3B82F6"};
    color: white;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
    toast.textContent = message;
    const style = document.createElement("style");
    style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3e3);
  }
  function analyzePage() {
    console.log("[Refik Content] Sayfa analiz ediliyor...");
    const pageType = detectPageType(window.location.href, window.location.pathname);
    console.log("[Refik Content] Sayfa t\xFCr\xFC:", pageType);
    if (pageType === "file-detail" || pageType === "unknown") {
      const fileData = parseCurrentPage();
      if (fileData) {
        console.log("[Refik Content] Dosya verileri:", fileData.caseNumber);
        sendToBackground("UYAP_DATA_FETCHED", fileData);
        showToast("Refik: Dosya bilgileri al\u0131nd\u0131", "success");
      }
    } else if (pageType === "file-search") {
      console.log("[Refik Content] Arama sayfas\u0131 alg\u0131land\u0131");
    } else if (pageType === "decision-view") {
      const decisionText = extractDecisionText();
      console.log("[Refik Content] Karar metni uzunlu\u011Fu:", decisionText.length);
      sendToBackground("UYAP_DATA_FETCHED", {
        pageType: "decision-view",
        content: decisionText,
        url: window.location.href
      });
    }
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    var _a;
    console.log("[Refik Content] Mesaj al\u0131nd\u0131:", message.action);
    switch (message.action) {
      case "PAGE_LOADED":
        setTimeout(analyzePage, 1e3);
        break;
      case "SUMMARIZE_RESULT":
        if ((_a = message.data) == null ? void 0 : _a.summary) {
          showToast(`\xD6zet: ${message.data.summary.substring(0, 100)}...`, "success");
        }
        break;
      case "summarize-current-page":
        const fileData = parseCurrentPage();
        if (fileData) {
          sendToBackground("SUMMARIZE", {
            caseId: fileData.caseNumber,
            newContent: JSON.stringify(fileData),
            contentType: "document",
            title: `UYAP - ${fileData.caseNumber}`
          });
          showToast("Refik: Dosya \xF6zetleniyor...", "info");
        }
        break;
      case "create-reminder-from-page":
        const data = parseCurrentPage();
        if (data && data.hearings.length > 0) {
          const nextHearing = data.hearings[0];
          sendToBackground("CREATE_REMINDER", {
            title: `${data.caseNumber} - Duru\u015Fma`,
            dueDate: nextHearing.date,
            caseId: data.caseNumber
          });
          showToast("Refik: Hat\u0131rlat\u0131c\u0131 olu\u015Fturuldu", "success");
        } else {
          showToast("Refik: Duru\u015Fma bilgisi bulunamad\u0131", "error");
        }
        break;
      case "add-to-refik-case":
        const caseData = parseCurrentPage();
        if (caseData) {
          sendToBackground("UYAP_DATA_FETCHED", caseData);
          showToast("Refik: Dosya Refik'e eklendi", "success");
        }
        break;
      default:
        console.log("[Refik Content] Bilinmeyen action:", message.action);
    }
  });
  var lastUrl = window.location.href;
  var observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      console.log("[Refik Content] URL de\u011Fi\u015Fti:", lastUrl);
      setTimeout(analyzePage, 2e3);
    }
    const fileData = parseCurrentPage();
    if (fileData && fileData.caseNumber) {
      sendToBackground("UYAP_DATA_FETCHED", fileData);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  console.log("[Refik Content] UYAP Content Script ba\u015Flat\u0131ld\u0131");
  if (document.readyState === "complete") {
    setTimeout(analyzePage, 2e3);
  } else {
    window.addEventListener("load", () => {
      setTimeout(analyzePage, 2e3);
    });
  }
})();
