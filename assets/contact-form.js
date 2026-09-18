
(function () {
  'use strict';

  var ERROR_CLASS = 'contact-form__error';
  var POST_PARAMS = ['form_type', 'utf8', 'contact_posted'];

  function resetSubmissionState() {
    if (!window.history || typeof window.history.replaceState !== 'function') {
      return;
    }

    var url;

    try {
      url = new URL(window.location.href);
    } catch (error) {
      return;
    }

    var params = url.searchParams;
    var stale = POST_PARAMS.filter(function (key) {
      return params.has(key);
    });

    Array.from(params.keys()).forEach(function (key) {
      if (key.indexOf('posted_successfully') !== -1) {
        stale.push(key);
      }
    });

    if (!stale.length) {
      return;
    }

    stale.forEach(function (key) {
      params.delete(key);
    });

    var query = params.toString();

    window.history.replaceState(
      window.history.state,
      '',
      url.pathname + (query ? '?' + query : '') + url.hash
    );
  }

  function copyFrom(root) {
    var data = root.dataset;

    return {
      required: {
        'contact[name]': data.requiredName,
        'contact[email]': data.requiredEmail,
        'contact[body]': data.requiredMessage,
        conditions: data.requiredPrivacy
      },
      invalid: {
        'contact[name]': data.invalidName,
        'contact[email]': data.invalidEmail,
        'contact[body]': data.invalidMessage
      }
    };
  }

  function errorElementFor(field) {
    var id = (field.id || field.name).replace(/[^\w-]+/g, '-') + '-error';
    var element = document.getElementById(id);

    if (element) {
      return element;
    }

    element = document.createElement('p');
    element.id = id;
    element.className = ERROR_CLASS;
    element.hidden = true;

    var host =
      field.closest('.form-control') ||
      field.closest('.checkbox-control') ||
      field.parentNode;

    host.appendChild(element);

    return element;
  }

  function describedBy(field, errorId, add) {
    var tokens = (field.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter(Boolean);
    var index = tokens.indexOf(errorId);

    if (add && index === -1) {
      tokens.push(errorId);
    } else if (!add && index !== -1) {
      tokens.splice(index, 1);
    }

    if (tokens.length) {
      field.setAttribute('aria-describedby', tokens.join(' '));
    } else {
      field.removeAttribute('aria-describedby');
    }
  }

  function render(field, copy) {
    var element = errorElementFor(field);
    var message = '';

    if (!field.validity.valid) {
      message = field.validity.valueMissing
        ? copy.required[field.name]
        : copy.invalid[field.name];

      message = message || field.validationMessage;
    }

    if (message) {
      element.textContent = message;
      element.hidden = false;
      field.setAttribute('aria-invalid', 'true');
      describedBy(field, element.id, true);
    } else {
      element.textContent = '';
      element.hidden = true;
      field.removeAttribute('aria-invalid');
      describedBy(field, element.id, false);
    }
  }

  function init(root) {
    if (root.contactFormReady) {
      return;
    }

    var form = root.querySelector('form');

    if (!form) {
      return;
    }

    var copy = copyFrom(root);
    var fields = Array.from(
      form.querySelectorAll('input:not([type="hidden"]), textarea')
    ).filter(function (field) {
      return (
        field.willValidate &&
        (field.required || field.pattern || field.type === 'email')
      );
    });

    if (!fields.length) {
      return;
    }

    root.contactFormReady = true;

    fields.forEach(function (field) {
      var liveEvent = field.type === 'checkbox' ? 'change' : 'input';

      field.addEventListener('invalid', function (event) {
        event.preventDefault();
        render(field, copy);
      });

      field.addEventListener('blur', function () {
        if (field.type === 'checkbox' || field.value.trim() !== '') {
          render(field, copy);
        }
      });

      field.addEventListener(liveEvent, function () {
        if (field.hasAttribute('aria-invalid')) {
          render(field, copy);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      if (form.checkValidity()) {
        return;
      }

      event.preventDefault();

      var firstInvalid = form.querySelector('[aria-invalid="true"]');

      if (firstInvalid && typeof firstInvalid.focus === 'function') {
        firstInvalid.focus();
      }
    });
  }

  function initAll(scope) {
    Array.from(scope.querySelectorAll('[data-contact-form]')).forEach(init);
  }

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  ready(function () {
    resetSubmissionState();
    initAll(document);
  });

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
