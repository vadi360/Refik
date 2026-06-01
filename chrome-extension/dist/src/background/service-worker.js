(() => {
  // src/background/service-worker.ts
  var API_BASE_URL = "https://api.refik.app/api/v1";
  async function getConfig() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        {
          apiUrl: API_BASE_URL,
          token: null,
          autoSummarize: true,
          notifications: {
            reminder: true,
            deadline: true,
            delegation: true
          }
        },
        (items) => resolve(items)
      );
    });
  }
  async function apiRequest(endpoint, method, body) {
    const config = await getConfig();
    if (!config.token) {
      throw new Error("Giri\u015F yap\u0131lmam\u0131\u015F. L\xFCtfen Refik popup'tan giri\u015F yap\u0131n.");
    }
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`
      },
      body: body ? JSON.stringify(body) : void 0
    });
    if (!response.ok) {
      if (response.status === 401) {
        chrome.storage.sync.set({ token: null });
        throw new Error("Oturum s\xFCresi dolmu\u015F. L\xFCtfen tekrar giri\u015F yap\u0131n.");
      }
      throw new Error(`API hatas\u0131: ${response.status}`);
    }
    return response.json();
  }
  async function sendToContent(tabId, message) {
    return chrome.tabs.sendMessage(tabId, message);
  }
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "summarize-case",
      title: "\u{1F4CB} Bu Dosyay\u0131 \xD6zetle",
      contexts: ["page"]
    });
    chrome.contextMenus.create({
      id: "create-reminder",
      title: "\u23F0 Duru\u015Fma Hat\u0131rlat\u0131c\u0131s\u0131 Olu\u015Ftur",
      contexts: ["page"]
    });
    chrome.contextMenus.create({
      id: "add-to-case",
      title: "\u{1F4C1} Dosyaya Ekle",
      contexts: ["page"]
    });
    console.log("[Refik] Eklenti y\xFCklendi");
  });
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!(tab == null ? void 0 : tab.id)) return;
    const config = await getConfig();
    if (!config.token) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "Refik - Giri\u015F Gerekli",
        message: "\xD6zellikleri kullanmak i\xE7in \xF6nce giri\u015F yap\u0131n."
      });
      return;
    }
    switch (info.menuItemId) {
      case "summarize-case":
        await sendToContent(tab.id, { action: "summarize-current-page" });
        break;
      case "create-reminder":
        await sendToContent(tab.id, { action: "create-reminder-from-page" });
        break;
      case "add-to-case":
        await sendToContent(tab.id, { action: "add-to-refik-case" });
        break;
    }
  });
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    var _a;
    console.log("[Refik BG] Mesaj al\u0131nd\u0131:", request.action);
    try {
      switch (request.action) {
        // UYAP verisi çek
        case "UYAP_DATA_FETCHED":
          await handleUYAPData(request.data);
          break;
        // Özet iste
        case "SUMMARIZE":
          await handleSummarize(request.data, (_a = sender.tab) == null ? void 0 : _a.id);
          break;
        // Hatırlatıcı oluştur
        case "CREATE_REMINDER":
          await handleCreateReminder(request.data);
          break;
        // Token doğrula
        case "VALIDATE_TOKEN":
          await handleValidateToken(sendResponse);
          return true;
        // Bağlantı kontrolü
        case "CHECK_CONNECTION":
          await handleConnectionCheck(sendResponse);
          return true;
        default:
          console.log("[Refik BG] Bilinmeyen action:", request.action);
      }
    } catch (error) {
      console.error("[Refik BG] Hata:", error);
      sendResponse({ success: false, error: error.message });
    }
  });
  async function handleUYAPData(data) {
    console.log("[Refik BG] UYAP verisi i\u015Fleniyor:", data.caseNumber);
    const config = await getConfig();
    chrome.storage.local.get(["recentFiles"], (result) => {
      const recentFiles = result.recentFiles || [];
      recentFiles.unshift({
        ...data,
        timestamp: Date.now()
      });
      if (recentFiles.length > 10) {
        recentFiles.pop();
      }
      chrome.storage.local.set({ recentFiles });
    });
    if (config.autoSummarize) {
      try {
        await apiRequest("/ai/case-update", "POST", {
          caseId: data.caseNumber,
          newContent: JSON.stringify(data),
          contentType: "document",
          title: `UYAP - ${data.caseNumber}`,
          metadata: { source: "uyap", url: data.url }
        });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Refik - Dosya \u0130\u015Flendi",
          message: `${data.caseNumber} dosyas\u0131 analiz edildi.`
        });
      } catch (error) {
        console.error("[Refik BG] Otomatik \xF6zetleme hatas\u0131:", error);
      }
    }
  }
  async function handleSummarize(data, tabId) {
    const result = await apiRequest("/ai/case-update", "POST", data);
    if (tabId) {
      await sendToContent(tabId, {
        action: "SUMMARIZE_RESULT",
        data: result.data
      });
    }
  }
  async function handleCreateReminder(data) {
    const result = await apiRequest("/reminders", "POST", {
      title: data.title,
      dueDate: data.dueDate,
      caseId: data.caseId,
      notifyTypes: ["push", "email"]
    });
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Refik - Hat\u0131rlat\u0131c\u0131 Olu\u015Fturuldu",
      message: data.title
    });
    return result;
  }
  async function handleValidateToken(sendResponse) {
    try {
      await apiRequest("/users/profile", "GET");
      sendResponse({ success: true, valid: true });
    } catch {
      sendResponse({ success: true, valid: false });
    }
  }
  async function handleConnectionCheck(sendResponse) {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      sendResponse({ success: true, connected: true, data });
    } catch {
      sendResponse({ success: true, connected: false });
    }
  }
  chrome.alarms.create("check-reminders", {
    periodInMinutes: 5
    // Her 5 dakikada kontrol
  });
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "check-reminders") {
      console.log("[Refik BG] Alarm kontrol\xFC \xE7al\u0131\u015Ft\u0131");
    }
  });
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    var _a;
    if (changeInfo.status === "complete" && ((_a = tab.url) == null ? void 0 : _a.includes("uyap.adalet.gov.tr"))) {
      try {
        await sendToContent(tabId, { action: "PAGE_LOADED" });
      } catch (error) {
        console.error("[Refik BG] Tab g\xFCncelleme hatas\u0131:", error);
      }
    }
  });
  console.log("[Refik] Background service worker ba\u015Flat\u0131ld\u0131");
})();
