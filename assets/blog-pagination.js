class PaginatedBlogList extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector('[data-blog-list]');
    this.button = this.querySelector('[data-load-more-button]');
    this.mode = this.getAttribute('data-mode');
    this.loading = false;

    if (this.button) {
      this.button.addEventListener('click', () => this.loadNextPage());
    }

    if (this.mode === 'infinite_scroll') {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) this.loadNextPage();
        },
        { rootMargin: '0px 0px 400px 0px' }
      );
      this.observer.observe(this);
    }
  }

  get nextUrl() {
    return this.getAttribute('data-next-url');
  }

  async loadNextPage() {
    const url = this.nextUrl;
    if (this.loading || !url) return;
    this.loading = true;
    if (this.button) this.button.setAttribute('aria-busy', 'true');

    try {
      const response = await fetch(url);
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const newList = doc.querySelector('[data-blog-list]');
      const newWrapper = doc.querySelector('paginated-blog-list');

      if (newList && this.list) {
        Array.from(newList.children).forEach((child) => this.list.appendChild(child));
      }

      const newNextUrl = newWrapper ? newWrapper.getAttribute('data-next-url') : null;

      if (newNextUrl) {
        this.setAttribute('data-next-url', newNextUrl);
      } else {
        this.removeAttribute('data-next-url');
        if (this.button) this.button.remove();
        if (this.observer) this.observer.disconnect();
      }
    } catch (error) {
      console.error('Could not load more blog posts', error);
    } finally {
      this.loading = false;
      if (this.button) this.button.removeAttribute('aria-busy');
    }
  }
}

customElements.define('paginated-blog-list', PaginatedBlogList);