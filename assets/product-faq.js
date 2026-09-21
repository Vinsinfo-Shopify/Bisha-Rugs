if (!customElements.get('faq-tabs')) {
  class FaqTabs extends HTMLElement {
    connectedCallback() {
      this.tabs = Array.from(this.querySelectorAll('[data-faq-tab]'));
      this.items = Array.from(this.querySelectorAll('[data-faq-category]'));

      this.tabs.forEach((tab) => {
        tab.addEventListener('click', () => this.setActiveTab(tab.dataset.faqTab));
      });

      const initialTab = this.tabs.find((tab) => tab.classList.contains('is-active')) || this.tabs[0];
      if (initialTab) this.setActiveTab(initialTab.dataset.faqTab);
    }

    setActiveTab(category) {
      this.tabs.forEach((tab) => {
        const isActive = tab.dataset.faqTab === category;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      let visibleCount = 0;
      let firstVisibleItem = null;
      let lastVisibleItem = null;

      this.items.forEach((item) => {
        const shouldShow = category === 'all' || item.dataset.faqCategory === category;
        item.hidden = !shouldShow;
        item.classList.remove('is-first-visible', 'is-last-visible');

        if (shouldShow) {
          visibleCount += 1;
          if (!firstVisibleItem) firstVisibleItem = item;
          lastVisibleItem = item;
          const numberEl = item.querySelector('[data-faq-number]');
          if (numberEl) numberEl.textContent = visibleCount + '.';
        }
      });

      if (firstVisibleItem) firstVisibleItem.classList.add('is-first-visible');
      if (lastVisibleItem) lastVisibleItem.classList.add('is-last-visible');
    }
  }

  customElements.define('faq-tabs', FaqTabs);
}
