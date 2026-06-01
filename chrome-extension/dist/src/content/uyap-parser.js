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
  function parseElement(selector) {
    var _a;
    const element = document.querySelector(selector);
    return ((_a = element == null ? void 0 : element.textContent) == null ? void 0 : _a.trim()) || null;
  }
  function parseTable(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return [];
    const rows = table.querySelectorAll("tr");
    const data = [];
    rows.forEach((row, index) => {
      if (index === 0) return;
      const cells = row.querySelectorAll("td");
      const rowData = {};
      cells.forEach((cell, cellIndex) => {
        var _a;
        rowData[`col${cellIndex}`] = ((_a = cell.textContent) == null ? void 0 : _a.trim()) || "";
      });
      if (Object.values(rowData).some((v) => v)) {
        data.push(rowData);
      }
    });
    return data;
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
  function parseSearchResults() {
    const results = [];
    const rows = document.querySelectorAll(".arama-sonucu tr, .search-result-row");
    rows.forEach((row) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const linkEl = row.querySelector("a");
      const cells = row.querySelectorAll("td");
      if (linkEl && cells.length >= 3) {
        results.push({
          caseNumber: ((_b = (_a = cells[0]) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || "",
          court: ((_d = (_c = cells[1]) == null ? void 0 : _c.textContent) == null ? void 0 : _d.trim()) || "",
          caseType: ((_f = (_e = cells[2]) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || "",
          status: ((_h = (_g = cells[3]) == null ? void 0 : _g.textContent) == null ? void 0 : _h.trim()) || "",
          url: linkEl.getAttribute("href") || ""
        });
      }
    });
    return results;
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
})();
