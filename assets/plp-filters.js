if (!window.__pfSidebarCollapseBound) {
  window.__pfSidebarCollapseBound = true;
  document.addEventListener('click', function (event) {
    var toggle = event.target.closest('[data-pf-sidebar-toggle]');
    if (!toggle) return;
    var sidebar = toggle.closest('.facets-sidebar');
    if (!sidebar) return;
    var collapsed = sidebar.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });
}
if (!window.__pfFacetAllBound) {
  window.__pfFacetAllBound = true;

  var pfSyncAll = function (list) {
    var allInput = list.querySelector('input[data-facet-all]');
    if (!allInput) return;
    var values = list.querySelectorAll('input[type="checkbox"][name]');
    allInput.checked = !Array.prototype.some.call(values, function (input) {
      return input.checked;
    });
  };

  document.addEventListener('change', function (event) {
    var input = event.target;
    if (!input || input.type !== 'checkbox') return;

    var list = input.closest('.option-value-list');
    if (!list || !list.querySelector('input[data-facet-all]')) return;

    if (input.hasAttribute('data-facet-all')) {
      input.checked = true;
      Array.prototype.forEach.call(list.querySelectorAll('input[type="checkbox"][name]'), function (value) {
        value.checked = false;
      });
    } else {
      pfSyncAll(list);
    }
  });
}
if (!customElements.get('facets-scroll-next')) {
  customElements.define(
    'facets-scroll-next',
    class extends HTMLElement {
      constructor() {
        super();
        this.onClick = this.onClick.bind(this);
        this.update = this.update.bind(this);
      }

      connectedCallback() {
        this.scroller = this.parentElement;
        this.button = this.querySelector('[data-facets-next]');
        if (!this.scroller || !this.button) return;

        this.button.addEventListener('click', this.onClick);
        this.scroller.addEventListener('scroll', this.update, { passive: true });
        window.addEventListener('resize', this.update);
        requestAnimationFrame(this.update);
      }

      disconnectedCallback() {
        if (!this.button) return;

        this.button.removeEventListener('click', this.onClick);
        this.scroller.removeEventListener('scroll', this.update);
        window.removeEventListener('resize', this.update);
      }

      onClick() {
        var direction = getComputedStyle(this.scroller).direction === 'rtl' ? -1 : 1;
        this.scroller.scrollBy({ left: this.scroller.clientWidth * 0.6 * direction, behavior: 'smooth' });
      }

      update() {
        var remaining =
          this.scroller.scrollWidth - this.scroller.clientWidth - Math.abs(this.scroller.scrollLeft);
        this.button.hidden = remaining <= 1;
      }
    }
  );
}
if (!customElements.get('pf-sticky-bar')) {
  customElements.define(
    'pf-sticky-bar',
    class extends HTMLElement {
      constructor() {
        super();
        this.onScroll = this.onScroll.bind(this);
        this.update = this.update.bind(this);
      }

      connectedCallback() {
        this.bar = this.querySelector('.pf-mobilebar');
        if (!this.bar) return;

        this.pinned = false;
        this.frame = null;
        this.media = window.matchMedia('(max-width: 749px)');

        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onScroll, { passive: true });

        if (this.media.addEventListener) {
          this.media.addEventListener('change', this.onScroll);
        } else {
          this.media.addListener(this.onScroll);
        }

        this.update();
      }

      disconnectedCallback() {
        if (!this.bar) return;

        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onScroll);

        if (this.media.removeEventListener) {
          this.media.removeEventListener('change', this.onScroll);
        } else {
          this.media.removeListener(this.onScroll);
        }

        if (this.frame) cancelAnimationFrame(this.frame);
      }

      onScroll() {
        if (this.frame) return;
        this.frame = requestAnimationFrame(
          function () {
            this.frame = null;
            this.update();
          }.bind(this)
        );
      }
      offset() {
        var header = document.querySelector('.shopify-section--header');
        if (!header) return 0;

        return Math.max(0, header.getBoundingClientRect().bottom);
      }

      update() {
        if (!this.media.matches) return this.unpin();

        var bounds = this.getBoundingClientRect();
        var offset = this.offset();

        if (bounds.top > offset) return this.unpin();

        var height = this.bar.getBoundingClientRect().height;
        this.style.height = height + 'px';

        if (!this.pinned) {
          this.classList.add('is-pinned');
          this.pinned = true;
        }
        var container = this.parentElement;
        var limit = container ? container.getBoundingClientRect().bottom - height : offset;

        this.bar.style.insetBlockStart = Math.min(offset, limit) + 'px';
      }

      unpin() {
        if (!this.pinned) return;

        this.classList.remove('is-pinned');
        this.style.removeProperty('height');
        this.bar.style.removeProperty('inset-block-start');
        this.pinned = false;
      }
    }
  );
}
