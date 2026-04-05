export class GreenApiClient {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  buildMethodUrl(apiMethod, credentials = {}) {
    const baseUrl = this.normalizeBaseUrl(credentials.apiBaseUrl || this.apiBaseUrl);
    const idInstance = credentials.idInstance?.trim() || "{idInstance}";
    const apiTokenInstance = credentials.apiTokenInstance?.trim() || "{apiTokenInstance}";

    return `${baseUrl}/waInstance${idInstance}/${apiMethod}/${apiTokenInstance}`;
  }

  getSettings(credentials) {
    return this.request("GET", "getSettings", credentials);
  }

  getStateInstance(credentials) {
    return this.request("GET", "getStateInstance", credentials);
  }

  sendMessage(credentials, payload) {
    return this.request("POST", "sendMessage", credentials, payload);
  }

  sendFileByUrl(credentials, payload) {
    return this.request("POST", "sendFileByUrl", credentials, payload);
  }

  async request(httpMethod, apiMethod, credentials, payload = null) {
    const url = this.buildMethodUrl(apiMethod, credentials);
    const response = await fetch(url, this.buildOptions(httpMethod, payload));
    const responseBody = await this.readBody(response);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${this.formatError(responseBody)}`);
    }

    return {
      ok: true,
      requestedAt: new Date().toISOString(),
      method: apiMethod,
      httpMethod,
      url,
      payload,
      response: responseBody
    };
  }

  buildOptions(httpMethod, payload) {
    const options = {
      method: httpMethod,
      headers: {}
    };

    if (!payload) {
      return options;
    }

    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);

    return options;
  }

  async readBody(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return response.text();
  }

  formatError(responseBody) {
    if (typeof responseBody === "string") {
      return responseBody;
    }

    return JSON.stringify(responseBody, null, 2);
  }

  normalizeBaseUrl(value) {
    return value.replace(/\/+$/, "");
  }
}
