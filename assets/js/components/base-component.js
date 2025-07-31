class BaseComponent {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaultOptions, ...options };
    this.init();
  }

  get defaultOptions() {
    return {};
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    // Override in child classes
  }

  bindEvents() {
    // Override in child classes
  }

  destroy() {
    if (this.element) {
      this.element.innerHTML = "";
    }
  }
}

window.BaseComponent = BaseComponent;
