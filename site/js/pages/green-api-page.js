import { GreenApiClient } from "../services/green-api-client.js";
import { ThemeManager } from "../services/theme-manager.js";
import { FormHistory } from "../state/form-history.js";

export class GreenApiPage {
  constructor(config) {
    this.config = config;
    this.client = new GreenApiClient(config.apiBaseUrl);
    this.themeManager = new ThemeManager(config.themeStorageKey, config.defaultTheme);
    this.elements = this.getElements();
    this.history = new FormHistory((snapshot) => this.restoreSnapshot(snapshot));
    this.commitTimer = null;
    this.currentStatusType = config.defaultStatus.type;
    this.currentPreviewMethod = config.defaultPreviewMethod;
    this.formFields = [
      this.elements.apiBaseUrl,
      this.elements.idInstance,
      this.elements.apiTokenInstance,
      this.elements.messageChatId,
      this.elements.messageText,
      this.elements.fileChatId,
      this.elements.fileUrl
    ];
  }

  init() {
    this.elements.apiBaseUrl.value = this.config.apiBaseUrl;
    this.themeManager.restore();
    this.bindUi();
    this.renderResponse(this.config.defaultResponse);
    this.setStatus(this.config.defaultStatus.type, this.config.defaultStatus.text);
    this.updateRequestPreview();
    this.saveSnapshot({ replace: true });
  }

  getElements() {
    return {
      apiBaseUrl: document.querySelector("#apiBaseUrl"),
      idInstance: document.querySelector("#idInstance"),
      apiTokenInstance: document.querySelector("#apiTokenInstance"),
      messageChatId: document.querySelector("#messageChatId"),
      messageText: document.querySelector("#messageText"),
      fileChatId: document.querySelector("#fileChatId"),
      fileUrl: document.querySelector("#fileUrl"),
      responseOutput: document.querySelector("#responseOutput"),
      statusBadge: document.querySelector("#statusBadge"),
      requestUrlPreview: document.querySelector("#requestUrlPreview"),
      navBack: document.querySelector("#navBack"),
      navForward: document.querySelector("#navForward"),
      navRefresh: document.querySelector("#navRefresh"),
      themeToggle: document.querySelector("#themeToggle"),
      buttons: Array.from(document.querySelectorAll(".action-button"))
    };
  }

  bindUi() {
    this.bindFormFields();
    this.bindToolbar();
    this.bindMethodButtons();
  }

  bindFormFields() {
    this.formFields.forEach((field) => {
      const onFieldChange = () => {
        this.updateRequestPreview();
        this.scheduleSnapshotSave();
      };

      field.addEventListener("input", onFieldChange);
      field.addEventListener("change", onFieldChange);
    });
  }

  bindToolbar() {
    this.elements.navBack.addEventListener("click", () => {
      this.history.back();
      this.updateNavigationButtons();
    });

    this.elements.navForward.addEventListener("click", () => {
      this.history.forward();
      this.updateNavigationButtons();
    });

    this.elements.navRefresh.addEventListener("click", () => {
      this.resetForm();
    });

    this.elements.themeToggle.addEventListener("click", () => {
      this.themeManager.toggle();
    });
  }

  bindMethodButtons() {
    this.elements.buttons.forEach((button) => {
      const method = button.dataset.method;

      button.addEventListener("mouseenter", () => this.setPreviewMethod(method));
      button.addEventListener("focus", () => this.setPreviewMethod(method));
      button.addEventListener("click", () => this.handleMethodClick(method, button));
    });
  }

  async handleMethodClick(method, button) {
    this.setPreviewMethod(method);
    this.setButtonsDisabled(button, true);
    this.setStatus("loading", `Выполняется ${method}`);

    try {
      const result = await this.callMethod(method);
      this.renderResponse(result);
      this.setStatus("success", `${method} выполнен`);
    } catch (error) {
      this.renderResponse({
        ok: false,
        error: error.message
      });
      this.setStatus("error", "Ошибка");
    } finally {
      this.setButtonsDisabled(button, false);
      this.saveSnapshot({ replace: true });
    }
  }

  callMethod(method) {
    const credentials = this.getCredentials();

    switch (method) {
      case "getSettings":
        return this.client.getSettings(credentials);
      case "getStateInstance":
        return this.client.getStateInstance(credentials);
      case "sendMessage":
        return this.client.sendMessage(credentials, this.buildMessagePayload());
      case "sendFileByUrl":
        return this.client.sendFileByUrl(credentials, this.buildFilePayload());
      default:
        throw new Error(`Неизвестный метод: ${method}`);
    }
  }

  setPreviewMethod(method) {
    this.currentPreviewMethod = method || this.config.defaultPreviewMethod;
    this.updateRequestPreview();
  }

  updateRequestPreview() {
    const previewUrl = this.client.buildMethodUrl(this.currentPreviewMethod, this.readCredentials());
    this.elements.requestUrlPreview.textContent = previewUrl;
    this.elements.requestUrlPreview.title = previewUrl;
  }

  scheduleSnapshotSave() {
    if (this.history.isApplying) {
      return;
    }

    window.clearTimeout(this.commitTimer);
    this.commitTimer = window.setTimeout(() => {
      this.saveSnapshot();
    }, 180);
  }

  saveSnapshot(options = {}) {
    this.history.push(this.makeSnapshot(), options);
    this.updateNavigationButtons();
  }

  makeSnapshot() {
    return {
      apiBaseUrl: this.elements.apiBaseUrl.value,
      idInstance: this.elements.idInstance.value,
      apiTokenInstance: this.elements.apiTokenInstance.value,
      messageChatId: this.elements.messageChatId.value,
      messageText: this.elements.messageText.value,
      fileChatId: this.elements.fileChatId.value,
      fileUrl: this.elements.fileUrl.value,
      responseOutput: this.elements.responseOutput.value,
      statusType: this.currentStatusType,
      statusText: this.elements.statusBadge.textContent || this.config.defaultStatus.text,
      previewMethod: this.currentPreviewMethod
    };
  }

  restoreSnapshot(snapshot) {
    this.elements.apiBaseUrl.value = snapshot.apiBaseUrl;
    this.elements.idInstance.value = snapshot.idInstance;
    this.elements.apiTokenInstance.value = snapshot.apiTokenInstance;
    this.elements.messageChatId.value = snapshot.messageChatId;
    this.elements.messageText.value = snapshot.messageText;
    this.elements.fileChatId.value = snapshot.fileChatId;
    this.elements.fileUrl.value = snapshot.fileUrl;
    this.elements.responseOutput.value = snapshot.responseOutput;
    this.currentPreviewMethod = snapshot.previewMethod || this.config.defaultPreviewMethod;
    this.setStatus(snapshot.statusType, snapshot.statusText);
    this.updateRequestPreview();
  }

  resetForm() {
    window.clearTimeout(this.commitTimer);

    this.elements.apiBaseUrl.value = this.config.apiBaseUrl;
    this.elements.idInstance.value = "";
    this.elements.apiTokenInstance.value = "";
    this.elements.messageChatId.value = "";
    this.elements.messageText.value = "";
    this.elements.fileChatId.value = "";
    this.elements.fileUrl.value = "";
    this.currentPreviewMethod = this.config.defaultPreviewMethod;
    this.renderResponse(this.config.defaultResponse);
    this.setStatus(this.config.defaultStatus.type, this.config.defaultStatus.text);
    this.updateRequestPreview();
    this.saveSnapshot();
  }

  updateNavigationButtons() {
    this.elements.navBack.disabled = !this.history.canGoBack;
    this.elements.navForward.disabled = !this.history.canGoForward;
  }

  readCredentials() {
    return {
      apiBaseUrl: this.getApiBaseUrl(false),
      idInstance: this.elements.idInstance.value,
      apiTokenInstance: this.elements.apiTokenInstance.value
    };
  }

  getCredentials() {
    const credentials = this.readCredentials();

    return {
      apiBaseUrl: this.getApiBaseUrl(true),
      idInstance: this.requireValue(credentials.idInstance, "Введите idInstance"),
      apiTokenInstance: this.requireValue(credentials.apiTokenInstance, "Введите ApiTokenInstance")
    };
  }

  getApiBaseUrl(strict = true) {
    const rawValue = this.elements.apiBaseUrl.value.trim();

    if (!rawValue) {
      return this.config.apiBaseUrl;
    }

    if (!strict) {
      return rawValue.replace(/\/+$/, "");
    }

    try {
      return new URL(rawValue).toString().replace(/\/+$/, "");
    } catch {
      throw new Error("API URL должен быть валидным адресом");
    }
  }

  buildMessagePayload() {
    return {
      chatId: this.normalizeChatId(this.elements.messageChatId.value),
      message: this.requireValue(this.elements.messageText.value, "Введите текст сообщения")
    };
  }

  buildFilePayload() {
    const urlFile = this.requireValue(this.elements.fileUrl.value, "Введите прямую ссылку на файл");

    return {
      chatId: this.normalizeChatId(this.elements.fileChatId.value),
      urlFile,
      fileName: this.deriveFileName(urlFile)
    };
  }

  requireValue(value, errorMessage) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error(errorMessage);
    }

    return trimmed;
  }

  normalizeChatId(value) {
    const raw = this.requireValue(value, "Введите chatId или номер телефона");

    if (raw.includes("@")) {
      return raw;
    }

    const digits = raw.replace(/[^\d]/g, "");

    if (!digits) {
      throw new Error("Номер телефона должен содержать цифры");
    }

    return `${digits}@c.us`;
  }

  deriveFileName(urlValue) {
    let url;

    try {
      url = new URL(urlValue);
    } catch {
      throw new Error("Ссылка на файл должна быть валидным URL");
    }

    const pathParts = url.pathname.split("/").filter(Boolean);
    const fileName = decodeURIComponent(pathParts[pathParts.length - 1] || "");

    if (!fileName || !fileName.includes(".")) {
      throw new Error("URL должен вести на конкретный файл с расширением");
    }

    return fileName;
  }

  renderResponse(data) {
    this.elements.responseOutput.value = JSON.stringify(data, null, 2);
  }

  setButtonsDisabled(activeButton, isLoading) {
    this.elements.buttons.forEach((button) => {
      button.disabled = isLoading;
    });

    // Здесь без спиннеров и лишних промежуточных состояний:
    // для тестового важнее, чтобы название метода оставалось читаемым.
    activeButton.textContent = isLoading ? "Выполняется..." : activeButton.dataset.method;
  }

  setStatus(type, text) {
    this.currentStatusType = type;
    this.elements.statusBadge.className = `status-badge status-${type}`;
    this.elements.statusBadge.textContent = text;
  }
}
