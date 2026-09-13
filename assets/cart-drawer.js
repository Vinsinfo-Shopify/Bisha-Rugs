(() => {
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

  class CartDrawerMarquee extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('.cart-drawer-marquee__track');
      if (!this.track) return;

      this.resizeObserver = new ResizeObserver(() => this.measure());
      this.resizeObserver.observe(this);
      this.measure();
    }

    disconnectedCallback() {
      this.resizeObserver?.disconnect();
    }

    get speed() {
      return parseFloat(this.dataset.speed) || 40;
    }

    measure() {
      if (REDUCED_MOTION.matches || !this.clientWidth) return;

      const group = this.track.firstElementChild;
      if (!group) return;

      const groupWidth = group.getBoundingClientRect().width;
      if (!groupWidth) return;

      const required = Math.max(2, Math.ceil((this.clientWidth * 2) / groupWidth));

      while (this.track.childElementCount < required) {
        const clone = this.track.firstElementChild.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        this.track.appendChild(clone);
      }

      this.style.setProperty('--cart-drawer-marquee-shift', `${100 / this.track.childElementCount}%`);
      this.style.setProperty('--cart-drawer-marquee-duration', `${groupWidth / this.speed}s`);
    }
  }

  class CartDrawerDiscount extends HTMLElement {
    connectedCallback() {
      this.addEventListener('click', (event) => {
        if (event.target.closest('[data-discount-apply]')) this.apply();
      });

      this.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        this.apply();
      });
    }

    apply() {
      const input = this.querySelector('.cart-drawer-discount__input');
      if (!input) return;

      if (input.value.trim() === '') {
        input.focus();
        return;
      }

      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  if (!window.customElements.get('cart-drawer-marquee')) {
    window.customElements.define('cart-drawer-marquee', CartDrawerMarquee);
  }

  if (!window.customElements.get('cart-drawer-discount')) {
    window.customElements.define('cart-drawer-discount', CartDrawerDiscount);
  }
})();