export class FormHistory {
  constructor(onApply) {
    this.onApply = onApply;
    this.items = [];
    this.index = -1;
    this.isApplying = false;
  }

  get canGoBack() {
    return this.index > 0;
  }

  get canGoForward() {
    return this.index >= 0 && this.index < this.items.length - 1;
  }

  push(snapshot, { replace = false } = {}) {
    if (this.isApplying) {
      return;
    }

    const current = this.current();

    if (replace && current) {
      this.items[this.index] = snapshot;
      return;
    }

    if (current && this.sameSnapshot(current, snapshot)) {
      return;
    }

    if (this.index < this.items.length - 1) {
      this.items = this.items.slice(0, this.index + 1);
    }

    this.items.push(snapshot);
    this.index = this.items.length - 1;
  }

  back() {
    if (!this.canGoBack) {
      return;
    }

    this.index -= 1;
    this.applyCurrent();
  }

  forward() {
    if (!this.canGoForward) {
      return;
    }

    this.index += 1;
    this.applyCurrent();
  }

  current() {
    return this.index >= 0 ? this.items[this.index] : null;
  }

  applyCurrent() {
    const snapshot = this.current();

    if (!snapshot) {
      return;
    }

    this.isApplying = true;
    this.onApply(snapshot);
    this.isApplying = false;
  }

  sameSnapshot(left, right) {
    return (
      left.apiBaseUrl === right.apiBaseUrl
      && left.idInstance === right.idInstance
      && left.apiTokenInstance === right.apiTokenInstance
      && left.messageChatId === right.messageChatId
      && left.messageText === right.messageText
      && left.fileChatId === right.fileChatId
      && left.fileUrl === right.fileUrl
      && left.responseOutput === right.responseOutput
      && left.statusType === right.statusType
      && left.statusText === right.statusText
      && left.previewMethod === right.previewMethod
    );
  }
}
