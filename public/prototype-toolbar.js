/**
 * Prototype Toolbar — a drop-in dev toolbar for HTML prototypes.
 *
 * Adds a fixed bottom-left toolbar with:
 *   • Collapse toggle  — far left; hides Home / experiment / features / triggers / comments to a single control (sessionStorage)
 *   • Home  — back link to your prototype's home/index page
 *   • Experiment switcher  — toggles between variants (sets body class + sessionStorage)
 *   • Features list  — opens an overlay listing per-experiment features, with click-to-highlight
 *   • Design comments  — right panel: Git-tracked JSON (`/design-comments.json`), design-mode pick, Update copies agent prompt
 *   • Trigger events  — flyout of buttons that fire arbitrary callbacks (e.g. "open module complete dialog")
 *
 * Usage:
 *   PrototypeToolbar.init({
 *     home: { href: 'index.html', label: 'Home' },
 *     experiments: [
 *       { id: 'a', label: 'Experiment A' },
 *       { id: 'b', label: 'Experiment B' }
 *     ],
 *     features: {
 *       a: {
 *         sections: [
 *           {
 *             title: 'New things',
 *             items: [
 *               { text: 'New banner', hl: '#new-banner' },
 *               { text: 'Open intro modal', action: 'openIntro' }
 *             ]
 *           }
 *         ]
 *       }
 *     },
 *     actions: {
 *       openIntro: function() { document.getElementById('intro').showModal(); }
 *     },
 *     triggers: [
 *       { label: 'Module complete', icon: 'school', onClick: function() {} }
 *     ]
 *   });
 *
 * After init, body gets `proto-experiment-<id>` so you can scope CSS to a variant.
 * Window dispatches `experiment-changed` (CustomEvent with `detail.id`) when the user switches.
 */
(function(global) {
  'use strict';

  var DEFAULTS = {
    home: null,
    experiments: [],
    features: {},
    actions: {},
    triggers: [],
    storageKey: 'proto-experiment',
    onExperimentChange: null,
    reloadOnExperimentChange: true
  };

  var config = null;
  var currentExp = null;
  var activeHighlightKey = null;
  var rootEl = null;
  var collapseBtn = null;
  var TOOLBAR_COLLAPSED_KEY = 'proto-toolbar-collapsed';

  /* ─── Utils ─────────────────────────────────────────────────────── */

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function(k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k.indexOf('on') === 0 && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          node.setAttribute(k, v === true ? '' : v);
        }
      });
    }
    (children || []).forEach(function(c) {
      if (c == null || c === false) return;
      if (typeof c === 'string' || typeof c === 'number') {
        node.appendChild(document.createTextNode(String(c)));
      } else {
        node.appendChild(c);
      }
    });
    return node;
  }

  function icon(name) {
    return el('span', { class: 'material-symbols-rounded' }, [name]);
  }

  function findExperiment(id) {
    for (var i = 0; i < config.experiments.length; i++) {
      if (config.experiments[i].id === id) return config.experiments[i];
    }
    return null;
  }

  /* ─── Experiment state ─────────────────────────────────────────── */

  function readStoredExp() {
    if (!config.experiments.length) return null;
    var stored = window.sessionStorage.getItem(config.storageKey);
    return findExperiment(stored) ? stored : config.experiments[0].id;
  }

  function applyBodyClass(expId) {
    document.body.className = document.body.className
      .replace(/\bproto-experiment-[\w-]+/g, '').trim();
    if (expId) document.body.classList.add('proto-experiment-' + expId);
  }

  /** Keep trigger label + menu option `is-selected` in sync when not reloading. */
  function syncExperimentDropdownUI() {
    if (!rootEl) return;
    var labelEl = rootEl.querySelector('.proto-toolbar__exp-label');
    if (labelEl) {
      var cur = findExperiment(currentExp);
      labelEl.textContent = cur ? cur.label : '';
    }
    rootEl.querySelectorAll('.proto-toolbar__exp-option').forEach(function(li) {
      var v = li.getAttribute('data-value');
      var isSel = v === currentExp;
      li.classList.toggle('is-selected', isSel);
      li.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });
  }

  function setExperiment(expId, opts) {
    opts = opts || {};
    if (!findExperiment(expId)) return;
    window.sessionStorage.setItem(config.storageKey, expId);
    currentExp = expId;
    applyBodyClass(expId);
    window.dispatchEvent(new CustomEvent('experiment-changed', { detail: { id: expId } }));
    if (typeof config.onExperimentChange === 'function') config.onExperimentChange(expId);
    syncExperimentDropdownUI();
    var shouldReload = opts.reload != null ? opts.reload : config.reloadOnExperimentChange;
    if (shouldReload) location.reload();
  }

  /* ─── Home button ──────────────────────────────────────────────── */

  function buildHome() {
    if (!config.home || !config.home.href) return null;
    return el('a', {
      class: 'proto-toolbar__btn proto-toolbar__home',
      href: config.home.href
    }, [
      icon('arrow_back'),
      config.home.label || 'Home'
    ]);
  }

  /* ─── Experiment dropdown ──────────────────────────────────────── */

  function buildExperimentDropdown() {
    if (config.experiments.length < 2) return null;

    var current = findExperiment(currentExp);
    var container = el('div', { class: 'proto-toolbar__exp' });
    var labelEl = el('span', { class: 'proto-toolbar__exp-label' }, [current ? current.label : '']);
    var trigger = el('button', {
      type: 'button',
      class: 'proto-toolbar__btn proto-toolbar__exp-trigger',
      'aria-haspopup': 'listbox',
      'aria-expanded': 'false'
    }, [icon('science'), labelEl, icon('expand_more')]);

    var menu = el('ul', {
      class: 'proto-toolbar__exp-menu',
      role: 'listbox',
      'aria-label': 'Select experiment'
    });
    config.experiments.forEach(function(opt) {
      var isSel = opt.id === currentExp;
      menu.appendChild(el('li', {
        class: 'proto-toolbar__exp-option' + (isSel ? ' is-selected' : ''),
        role: 'option',
        'aria-selected': isSel ? 'true' : 'false',
        'data-value': opt.id
      }, [opt.label]));
    });

    container.appendChild(trigger);
    container.appendChild(menu);

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = container.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function(e) {
      var li = e.target.closest('.proto-toolbar__exp-option');
      if (!li) return;
      setExperiment(li.getAttribute('data-value'));
      container.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        container.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    return container;
  }

  /* ─── Features list overlay ────────────────────────────────────── */

  function clearFeatureHighlights() {
    document.querySelectorAll('.proto-feature-hl').forEach(function(el) {
      el.classList.remove('proto-feature-hl');
    });
    if (rootEl) {
      rootEl.querySelectorAll('.proto-toolbar__features-item.is-active').forEach(function(el) {
        el.classList.remove('is-active');
      });
    }
    activeHighlightKey = null;
  }

  function applyFeatureHighlight(selector) {
    if (!selector) return false;
    var found = false;
    selector.split(',').map(function(s) { return s.trim(); }).forEach(function(sel) {
      try {
        document.querySelectorAll(sel).forEach(function(el) {
          el.classList.add('proto-feature-hl');
          found = true;
        });
      } catch (e) {}
    });
    return found;
  }

  function scrollToHighlighted() {
    var first = document.querySelector('.proto-feature-hl');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /** Highlight DOM for a design comment; falls back to first `#id` if full path matches nothing (fragile nth-of-type). */
  function highlightCommentTarget(selector) {
    clearFeatureHighlights();
    if (!selector || !String(selector).trim()) return;
    var s = String(selector).trim();
    if (applyFeatureHighlight(s)) {
      scrollToHighlighted();
      return;
    }
    var m = s.match(/#[a-zA-Z_][\w-]*/);
    if (m) {
      var idSel = m[0];
      if (idSel !== s && applyFeatureHighlight(idSel)) {
        scrollToHighlighted();
      }
    }
  }

  function clearCommentRowHoverHighlight() {
    commentHoverTargets.forEach(function(el) {
      if (el && el.classList) el.classList.remove('proto-design-hover-hl');
    });
    commentHoverTargets = [];
  }

  /** Blue ring on page target while pointer hovers a comment row (same class as design-mode hover). */
  function applyCommentRowHoverHighlight(selector) {
    clearCommentRowHoverHighlight();
    if (!selector || !String(selector).trim()) return;
    var s = String(selector).trim();
    function addMatches(selStr) {
      try {
        document.querySelectorAll(selStr).forEach(function(el) {
          el.classList.add('proto-design-hover-hl');
          commentHoverTargets.push(el);
        });
      } catch (e) {}
    }
    addMatches(s);
    if (!commentHoverTargets.length) {
      var m = s.match(/#[a-zA-Z_][\w-]*/);
      if (m) addMatches(m[0]);
    }
  }

  window.addEventListener('proto-comment-highlight-run', function(ev) {
    try {
      var d = ev.detail;
      if (!d || d.selector == null) return;
      highlightCommentTarget(String(d.selector));
    } catch (e) {}
  });

  function renderFeatureItem(item, idx, parentIdx) {
    var key = parentIdx != null ? parentIdx + '-' + idx : String(idx);
    var hasInteraction = !!(item.hl || item.action || item.nav);
    var classes = 'proto-toolbar__features-item' + (hasInteraction ? ' is-clickable' : '');
    var li = el('li', {
      class: classes,
      'data-fl-key': key,
      'data-fl-hl': item.hl || null,
      'data-fl-action': item.action || null,
      'data-fl-nav': item.nav || null
    }, [
      el('span', { class: 'proto-toolbar__features-bullet' }),
      el('span', null, [item.text])
    ]);
    return li;
  }

  function renderFeaturesOverlay(overlay) {
    overlay.innerHTML = '';
    var data = (config.features && config.features[currentExp]) || null;
    var label = (findExperiment(currentExp) || {}).label || 'Features';

    var header = el('div', { class: 'proto-toolbar__features-header' }, [
      el('span', { class: 'proto-toolbar__features-title' }, [label]),
      el('button', {
        type: 'button',
        class: 'proto-toolbar__features-close',
        'aria-label': 'Close',
        onclick: function() { closeFeaturesOverlay(); }
      }, [icon('close')])
    ]);
    overlay.appendChild(header);

    if (!data || !data.sections || !data.sections.length) {
      overlay.appendChild(el('div', {
        class: 'proto-toolbar__features-empty'
      }, ['No features defined for this experiment yet.']));
      return;
    }

    if (data.notice) {
      overlay.appendChild(el('div', { class: 'proto-toolbar__features-notice' }, [data.notice]));
    }

    var itemIdx = 0;
    data.sections.forEach(function(section) {
      overlay.appendChild(el('div', { class: 'proto-toolbar__features-section-title' }, [section.title]));
      var list = el('ul', { class: 'proto-toolbar__features-list' });
      section.items.forEach(function(item) {
        list.appendChild(renderFeatureItem(item, itemIdx));
        if (item.children && item.children.length) {
          var sub = el('ul', { class: 'proto-toolbar__features-sublist' });
          item.children.forEach(function(child, ci) {
            sub.appendChild(renderFeatureItem(child, ci, itemIdx));
          });
          list.appendChild(sub);
        }
        itemIdx++;
      });
      overlay.appendChild(list);
    });

    overlay.querySelectorAll('.proto-toolbar__features-item.is-clickable').forEach(function(li) {
      li.addEventListener('click', function() {
        var key = li.getAttribute('data-fl-key');
        var hl = li.getAttribute('data-fl-hl');
        var actionName = li.getAttribute('data-fl-action');
        var nav = li.getAttribute('data-fl-nav');

        if (activeHighlightKey === key) { clearFeatureHighlights(); return; }
        clearFeatureHighlights();

        if (actionName && config.actions && typeof config.actions[actionName] === 'function') {
          var handled = config.actions[actionName]();
          if (handled !== false) {
            li.classList.add('is-active');
            activeHighlightKey = key;
            return;
          }
        }
        if (hl) {
          var found = applyFeatureHighlight(hl);
          if (found) {
            li.classList.add('is-active');
            activeHighlightKey = key;
            scrollToHighlighted();
            return;
          }
        }
        if (nav) {
          var sep = nav.indexOf('?') === -1 ? '?' : '&';
          var hashIdx = nav.indexOf('#');
          var base = hashIdx !== -1 ? nav.substring(0, hashIdx) : nav;
          var hash = hashIdx !== -1 ? nav.substring(hashIdx) : '';
          window.location.href = base + sep + 'exp=' + currentExp + hash;
        }
      });
    });
  }

  function openFeaturesOverlay() {
    var overlay = rootEl.querySelector('.proto-toolbar__features-overlay');
    var btn = rootEl.querySelector('.proto-toolbar__features-trigger');
    renderFeaturesOverlay(overlay);
    overlay.classList.add('is-open');
    if (btn) btn.setAttribute('aria-pressed', 'true');
  }

  function closeFeaturesOverlay() {
    var overlay = rootEl.querySelector('.proto-toolbar__features-overlay');
    var btn = rootEl.querySelector('.proto-toolbar__features-trigger');
    if (overlay) overlay.classList.remove('is-open');
    if (btn) btn.setAttribute('aria-pressed', 'false');
    clearFeatureHighlights();
  }

  function buildFeaturesButton() {
    if (!config.features || !Object.keys(config.features).length) return null;
    var btn = el('button', {
      type: 'button',
      class: 'proto-toolbar__btn proto-toolbar__features-trigger proto-toolbar__btn--icon',
      'aria-pressed': 'false',
      'aria-label': 'Features list',
      'data-tooltip': 'Features list'
    }, [icon('checklist')]);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var overlay = rootEl.querySelector('.proto-toolbar__features-overlay');
      if (overlay && overlay.classList.contains('is-open')) {
        closeFeaturesOverlay();
      } else {
        openFeaturesOverlay();
      }
    });
    return btn;
  }

  function buildFeaturesOverlayEl() {
    if (!config.features || !Object.keys(config.features).length) return null;
    var overlay = el('div', { class: 'proto-toolbar__features-overlay' });
    overlay.addEventListener('click', function(e) { e.stopPropagation(); });
    return overlay;
  }

  function readToolbarCollapsed() {
    try {
      return sessionStorage.getItem(TOOLBAR_COLLAPSED_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function writeToolbarCollapsed(collapsed) {
    try {
      if (collapsed) sessionStorage.setItem(TOOLBAR_COLLAPSED_KEY, '1');
      else sessionStorage.removeItem(TOOLBAR_COLLAPSED_KEY);
    } catch (e) {}
  }

  function closeToolbarChrome() {
    closeFeaturesOverlay();
    if (rootEl) {
      rootEl.querySelectorAll('.proto-toolbar__tools.is-open').forEach(function(n) {
        n.classList.remove('is-open');
      });
      rootEl.querySelectorAll('.proto-toolbar__exp.is-open').forEach(function(n) {
        n.classList.remove('is-open');
      });
    }
    if (commentsPanelEl && commentsPanelEl.classList.contains('is-open')) {
      commentsPanelEl.classList.remove('is-open');
      var b = rootEl && rootEl.querySelector('.proto-toolbar__comments-trigger');
      if (b) b.setAttribute('aria-pressed', 'false');
      stopDesignPickMode();
      clearFeatureHighlights();
      clearCommentRowHoverHighlight();
    }
  }

  function applyToolbarCollapsed(collapsed) {
    if (!rootEl) return;
    rootEl.classList.toggle('is-collapsed', !!collapsed);
    if (collapseBtn) {
      collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      collapseBtn.setAttribute('aria-label', collapsed ? 'Expand prototype toolbar' : 'Collapse prototype toolbar');
      collapseBtn.setAttribute('data-tooltip', collapsed ? 'Expand toolbar' : 'Collapse toolbar');
      var ic = collapseBtn.querySelector('.material-symbols-rounded');
      if (ic) ic.textContent = collapsed ? 'unfold_more' : 'unfold_less';
    }
    if (collapsed) closeToolbarChrome();
  }

  function buildCollapseToggleButton() {
    var btn = el('button', {
      type: 'button',
      class: 'proto-toolbar__btn proto-toolbar__btn--icon proto-toolbar__collapse-toggle',
      'aria-expanded': 'true',
      'aria-label': 'Collapse prototype toolbar',
      'data-tooltip': 'Collapse toolbar'
    }, [icon('unfold_less')]);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var becomeCollapsed = !rootEl.classList.contains('is-collapsed');
      writeToolbarCollapsed(becomeCollapsed);
      applyToolbarCollapsed(becomeCollapsed);
    });
    collapseBtn = btn;
    return btn;
  }

  /* ─── Triggers flyout ──────────────────────────────────────────── */

  function buildTriggersFlyout() {
    if (!config.triggers || !config.triggers.length) return null;

    var wrapper = el('div', { class: 'proto-toolbar__tools' });
    var btn = el('button', {
      type: 'button',
      class: 'proto-toolbar__btn proto-toolbar__btn--icon proto-toolbar__tools-trigger',
      'aria-label': 'Trigger event',
      'data-tooltip': 'Trigger event'
    }, [icon('bolt')]);

    var flyout = el('div', { class: 'proto-toolbar__tools-flyout' });
    flyout.appendChild(el('div', { class: 'proto-toolbar__tools-header' }, ['Trigger event']));

    config.triggers.forEach(function(t) {
      var disabled = !!t.disabled;
      var row = el('button', {
        type: 'button',
        class: 'proto-toolbar__tools-row' + (disabled ? ' is-disabled' : ''),
        disabled: disabled || null,
        'aria-label': t.label
      }, [icon(t.icon || 'bolt'), el('span', null, [t.label])]);

      if (!disabled && typeof t.onClick === 'function') {
        row.addEventListener('click', function() {
          t.onClick();
          wrapper.classList.remove('is-open');
        });
      }
      flyout.appendChild(row);
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(flyout);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      wrapper.classList.toggle('is-open');
    });
    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) wrapper.classList.remove('is-open');
    });

    return wrapper;
  }

  /* ─── Design comments (Git-tracked JSON) ─────────────────────── */

  var commentsPanelEl = null;
  var commentsListHost = null;
  var commentsSearchInput = null;
  var commentsDesignToggle = null;
  var commentsUpdateBtn = null;
  var commentsUpdateBtnRestoreTimer = null;
  var commentsClipboardStatusEl = null;
  var commentsData = [];
  var designModeOn = false;
  var designPickListener = null;
  var designHoverListener = null;
  var designHoverRaf = null;
  var designHoverEl = null;
  var commentsActiveRowId = null;
  var COMMENTS_JSON_URL = '/design-comments.json';
  var STORAGE_DISMISSED = 'proto-comments-dismissed';
  var STORAGE_PENDING = 'proto-comments-pending';
  var commentHoverTargets = [];

  function loadDismissedIds() {
    try {
      var raw = sessionStorage.getItem(STORAGE_DISMISSED);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveDismissedIds(ids) {
    sessionStorage.setItem(STORAGE_DISMISSED, JSON.stringify(ids));
  }

  function loadPendingComments() {
    try {
      var raw = sessionStorage.getItem(STORAGE_PENDING);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function savePendingComments(arr) {
    sessionStorage.setItem(STORAGE_PENDING, JSON.stringify(arr));
  }

  function escapeCssId(id) {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(id);
    return id.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1');
  }

  function buildSelectorForElement(element) {
    if (!element || element.nodeType !== 1) return '';
    if (element.id) return '#' + escapeCssId(element.id);
    var parts = [];
    var cur = element;
    while (cur && cur.nodeType === 1 && cur !== document.documentElement) {
      var tag = cur.tagName.toLowerCase();
      var parent = cur.parentElement;
      if (!parent) break;
      var sameTag = [];
      for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].tagName === cur.tagName) sameTag.push(parent.children[i]);
      }
      var idx = sameTag.indexOf(cur) + 1;
      parts.unshift(tag + ':nth-of-type(' + idx + ')');
      cur = parent;
      if (cur.id) {
        parts.unshift('#' + escapeCssId(cur.id));
        break;
      }
    }
    return parts.join(' > ');
  }

  function newCommentId() {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') {
      return global.crypto.randomUUID();
    }
    return 'c-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
  }

  function filterCommentRowsBySearch(rows) {
    var q = (commentsSearchInput && commentsSearchInput.value || '').trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(function(c) {
      return (
        String(c.body || '').toLowerCase().indexOf(q) !== -1 ||
        String(c.title || '').toLowerCase().indexOf(q) !== -1 ||
        String(c.author || '').toLowerCase().indexOf(q) !== -1 ||
        String(c.selector || '').toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function getVisibleCommentsMerged() {
    var dismissed = loadDismissedIds();
    var pend = loadPendingComments();
    var fromPending = pend.filter(function(c) {
      if (dismissed.indexOf(c.id) !== -1) return false;
      if (c.experimentId && c.experimentId !== currentExp) return false;
      return true;
    });
    var fromFile = commentsData.filter(function(c) {
      if (c.resolved) return false;
      if (dismissed.indexOf(c.id) !== -1) return false;
      if (c.experimentId && c.experimentId !== currentExp) return false;
      return true;
    });
    return fromPending.concat(fromFile);
  }

  function renderCommentsList() {
    if (!commentsListHost) return;
    commentsListHost.innerHTML = '';
    var merged = getVisibleCommentsMerged();
    var rows = filterCommentRowsBySearch(merged);
    if (!rows.length) {
      var empty = el('div', { class: 'proto-comments-empty' }, []);
      if (merged.length && commentsSearchInput && commentsSearchInput.value.trim()) {
        empty.textContent = 'No comments match your search.';
      } else {
        empty.appendChild(document.createTextNode('No open comments for this experiment. Use Add comment, edit '));
        empty.appendChild(el('code', { class: 'proto-comments-empty__code' }, ['public/design-comments.json']));
        empty.appendChild(document.createTextNode(', or queue comments for Update.'));
      }
      commentsListHost.appendChild(empty);
      return;
    }
    rows.forEach(function(c) {
      var isQueued = loadPendingComments().some(function(p) { return p.id === c.id; });
      var row = el('div', {
        role: 'button',
        tabindex: '0',
        class: 'proto-comments-row' + (commentsActiveRowId === c.id ? ' is-active' : '') + (isQueued ? ' is-queued' : ''),
        'data-comment-id': c.id,
        'data-comment-sel': c.selector || ''
      }, []);
      var meta = el('div', { class: 'proto-comments-row__meta' }, [
        el('span', { class: 'proto-comments-row__avatar', 'aria-hidden': 'true' }, [(c.author || '?').slice(0, 1).toUpperCase()]),
        el('div', { class: 'proto-comments-row__meta-text' }, [
          el('div', { class: 'proto-comments-row__title' }, [c.title || '(no title)']),
          el('div', { class: 'proto-comments-row__sub' }, [
            (c.author || 'Anonymous') + ' · ' + String(c.createdAt || '').slice(0, 10) + (isQueued ? ' · Queued' : '')
          ])
        ])
      ]);
      row.appendChild(meta);
      row.appendChild(el('div', { class: 'proto-comments-row__body' }, [c.body || '']));
      row.appendChild(el('div', { class: 'proto-comments-row__actions' }, [
        el('button', {
          type: 'button',
          class: 'proto-comments-row__done',
          'data-done-id': c.id
        }, ['Done'])
      ]));
      commentsListHost.appendChild(row);
    });

    commentsListHost.querySelectorAll('.proto-comments-row').forEach(function(row) {
      function activate(e) {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target.closest('.proto-comments-row__done')) return;
        if (e.type === 'keydown' && e.key === ' ') e.preventDefault();
        clearCommentRowHoverHighlight();
        var sel = row.getAttribute('data-comment-sel');
        var cid = row.getAttribute('data-comment-id');
        commentsActiveRowId = cid;
        renderCommentsList();
        window.dispatchEvent(new CustomEvent('proto-comment-navigate', { detail: { selector: sel || '' } }));
        if (e.type === 'keydown' && commentsListHost) {
          var nr = commentsListHost.querySelector('.proto-comments-row[data-comment-id="' + cid + '"]');
          if (nr) nr.focus();
        }
      }
      row.addEventListener('click', activate);
      row.addEventListener('keydown', activate);
      row.addEventListener('mouseenter', function() {
        applyCommentRowHoverHighlight(row.getAttribute('data-comment-sel'));
      });
      row.addEventListener('mouseleave', function() {
        clearCommentRowHoverHighlight();
      });
    });

    commentsListHost.querySelectorAll('.proto-comments-row__done').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = btn.getAttribute('data-done-id');
        var d = loadDismissedIds();
        if (d.indexOf(id) === -1) d.push(id);
        saveDismissedIds(d);
        var pend = loadPendingComments().filter(function(p) { return p.id !== id; });
        savePendingComments(pend);
        renderCommentsList();
      });
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
    return Promise.resolve();
  }

  function closeCommentsModal() {
    var m = document.querySelector('.proto-comments-modal-backdrop');
    if (m && m._protoCommentsEsc) {
      document.removeEventListener('keydown', m._protoCommentsEsc);
      m._protoCommentsEsc = null;
    }
    if (m) m.remove();
    document.body.style.overflow = '';
  }

  function openDesignCommentModal(selector) {
    closeCommentsModal();
    var capturedSelector = (selector || '').trim();
    var backdrop = el('div', { class: 'proto-comments-modal-backdrop' }, []);
    var modal = el('div', {
      class: 'proto-comments-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'proto-comments-modal-title'
    }, []);

    var top = el('div', { class: 'proto-comments-modal__top' }, []);
    var title = el('div', { class: 'proto-comments-modal__top-title', id: 'proto-comments-modal-title' }, ['New design comment']);
    var submitBtn = el('button', {
      type: 'button',
      class: 'proto-comments-modal__submit-icon',
      'aria-label': 'Queue comment for update'
    }, [icon('arrow_upward')]);
    top.appendChild(title);
    top.appendChild(submitBtn);

    var authorIn = el('input', {
      type: 'text',
      class: 'proto-comments-modal__input',
      placeholder: 'Your name (optional)',
      autocomplete: 'name'
    });
    var bodyIn = el('textarea', {
      class: 'proto-comments-modal__textarea',
      placeholder: 'Comment…',
      required: true,
      'aria-required': 'true'
    });

    function tryQueueDesignComment() {
      var o = {
        id: newCommentId(),
        author: authorIn.value.trim() || undefined,
        title: undefined,
        body: bodyIn.value.trim(),
        selector: capturedSelector,
        createdAt: new Date().toISOString(),
        resolved: false,
        experimentId: currentExp
      };
      if (!o.body) {
        bodyIn.focus();
        return;
      }
      var pend = loadPendingComments();
      pend.push(o);
      savePendingComments(pend);
      closeCommentsModal();
      renderCommentsList();
    }

    submitBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      tryQueueDesignComment();
    });

    modal.appendChild(top);
    modal.appendChild(el('label', { class: 'proto-comments-modal__label' }, ['Author']));
    modal.appendChild(authorIn);
    modal.appendChild(el('label', { class: 'proto-comments-modal__label' }, ['Comment']));
    modal.appendChild(bodyIn);

    backdrop.addEventListener('click', function(ev) {
      if (!modal.contains(ev.target)) closeCommentsModal();
    });

    backdrop._protoCommentsEsc = function(ev) {
      if (ev.key === 'Escape') closeCommentsModal();
    };
    document.addEventListener('keydown', backdrop._protoCommentsEsc);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    bodyIn.focus();
  }

  function clearDesignHover() {
    if (designHoverEl) {
      designHoverEl.classList.remove('proto-design-hover-hl');
      designHoverEl = null;
    }
  }

  function stopDesignPickMode() {
    designModeOn = false;
    clearDesignHover();
    if (designHoverRaf != null) {
      cancelAnimationFrame(designHoverRaf);
      designHoverRaf = null;
    }
    if (designHoverListener) {
      document.removeEventListener('mousemove', designHoverListener, true);
      designHoverListener = null;
    }
    if (designPickListener) {
      document.removeEventListener('click', designPickListener, true);
      designPickListener = null;
    }
    document.body.classList.remove('proto-comments-design-mode');
    if (commentsDesignToggle) {
      commentsDesignToggle.classList.remove('is-on');
      commentsDesignToggle.setAttribute('aria-pressed', 'false');
    }
  }

  function startDesignPickMode() {
    if (designModeOn) {
      stopDesignPickMode();
      return;
    }
    designModeOn = true;
    document.body.classList.add('proto-comments-design-mode');
    if (commentsDesignToggle) {
      commentsDesignToggle.classList.add('is-on');
      commentsDesignToggle.setAttribute('aria-pressed', 'true');
    }
    var hoverX = 0;
    var hoverY = 0;
    designHoverListener = function(ev) {
      if (!designModeOn) return;
      hoverX = ev.clientX;
      hoverY = ev.clientY;
      if (designHoverRaf != null) return;
      designHoverRaf = requestAnimationFrame(function() {
        designHoverRaf = null;
        if (!designModeOn) return;
        var under = document.elementFromPoint(hoverX, hoverY);
        if (!under || under.nodeType !== 1) {
          clearDesignHover();
          return;
        }
        if (
          under === document.body ||
          under === document.documentElement ||
          under.closest('.proto-toolbar') ||
          under.closest('.proto-comments-panel') ||
          under.closest('.proto-comments-modal-backdrop')
        ) {
          clearDesignHover();
          return;
        }
        if (designHoverEl === under) return;
        clearDesignHover();
        designHoverEl = under;
        designHoverEl.classList.add('proto-design-hover-hl');
      });
    };
    document.addEventListener('mousemove', designHoverListener, true);
    designPickListener = function(ev) {
      if (!designModeOn) return;
      var t = ev.target;
      if (t.closest('.proto-toolbar') || t.closest('.proto-comments-panel') || t.closest('.proto-comments-modal-backdrop')) {
        return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      clearDesignHover();
      var sel = buildSelectorForElement(t);
      stopDesignPickMode();
      if (sel) openDesignCommentModal(sel);
    };
    document.addEventListener('click', designPickListener, true);
  }

  function getMergedCommentsForExport() {
    var dismissed = loadDismissedIds();
    var pending = loadPendingComments();
    var byId = {};
    commentsData.forEach(function(c) {
      var copy = Object.assign({}, c);
      if (dismissed.indexOf(c.id) !== -1) copy.resolved = true;
      byId[c.id] = copy;
    });
    pending.forEach(function(p) {
      byId[p.id] = Object.assign({}, p);
    });
    var merged = Object.keys(byId).map(function(k) {
      return byId[k];
    });
    merged.sort(function(a, b) {
      return String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    });
    return merged;
  }

  function buildMergedCommentsJsonString() {
    return JSON.stringify(getMergedCommentsForExport(), null, 2);
  }

  function buildCommentsAgentClipboardPrompt() {
    var json = buildMergedCommentsJsonString();
    var instruction =
      'Replace the entire contents of `public/design-comments.json` with the JSON array below (single valid JSON array). ' +
      'This snapshot merges the last loaded server file with: (1) comments marked Done in this session as `"resolved": true`, and (2) any comments queued from Add comment in this browser. ' +
      'After updating the file, create a git commit with an appropriate message (push only if I ask you to push).';
    return instruction + '\n\n```json\n' + json + '\n```\n';
  }

  function showCommentsClipboardStatus(msg, isError) {
    if (!commentsClipboardStatusEl) return;
    commentsClipboardStatusEl.textContent = msg || '';
    commentsClipboardStatusEl.hidden = !msg;
    commentsClipboardStatusEl.classList.toggle('proto-comments-panel__status--err', !!isError);
  }

  function flashUpdateButtonCopied() {
    if (!commentsUpdateBtn) return;
    if (commentsUpdateBtnRestoreTimer) clearTimeout(commentsUpdateBtnRestoreTimer);
    commentsUpdateBtn.textContent = 'Copied';
    commentsUpdateBtnRestoreTimer = setTimeout(function() {
      if (commentsUpdateBtn) commentsUpdateBtn.textContent = 'Update';
      commentsUpdateBtnRestoreTimer = null;
    }, 1500);
  }

  function copyCommentsUpdateAgentPrompt() {
    var payload = buildCommentsAgentClipboardPrompt();
    var p = copyToClipboard(payload);
    if (p && typeof p.then === 'function') {
      p.then(function() {
        flashUpdateButtonCopied();
        showCommentsClipboardStatus('', false);
      }).catch(function() {
        showCommentsClipboardStatus('Could not copy — allow clipboard access or use a secure context (HTTPS).', true);
      });
    } else {
      flashUpdateButtonCopied();
    }
  }

  function clearPendingQueue() {
    savePendingComments([]);
    renderCommentsList();
  }

  function refreshComments() {
    var url = COMMENTS_JSON_URL + '?t=' + Date.now();
    fetch(url, { credentials: 'same-origin' })
      .then(function(r) {
        if (!r.ok) throw new Error('bad status');
        return r.json();
      })
      .then(function(data) {
        commentsData = Array.isArray(data) ? data : [];
        renderCommentsList();
      })
      .catch(function() {
        commentsData = [];
        renderCommentsList();
      });
  }

  function toggleCommentsPanel(btn) {
    if (!commentsPanelEl) return;
    var open = !commentsPanelEl.classList.contains('is-open');
    commentsPanelEl.classList.toggle('is-open', open);
    btn.setAttribute('aria-pressed', open ? 'true' : 'false');
    if (open) refreshComments();
    else {
      stopDesignPickMode();
      clearFeatureHighlights();
      clearCommentRowHoverHighlight();
      commentsActiveRowId = null;
    }
  }

  function buildCommentsButton() {
    var btn = el('button', {
      type: 'button',
      class: 'proto-toolbar__btn proto-toolbar__btn--icon proto-toolbar__comments-trigger',
      'aria-label': 'Design comments',
      'aria-pressed': 'false',
      'data-tooltip': 'Design comments'
    }, [icon('forum')]);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleCommentsPanel(btn);
    });
    return btn;
  }

  function buildCommentsPanel() {
    var panel = el('div', {
      class: 'proto-comments-panel',
      'aria-label': 'Design comments'
    }, []);

    var header = el('div', { class: 'proto-comments-panel__header' }, []);
    header.appendChild(el('span', { class: 'proto-comments-panel__title' }, ['Comments']));
    var closeBtn = el('button', {
      type: 'button',
      class: 'proto-comments-panel__iconbtn',
      'aria-label': 'Close comments'
    }, [icon('close')]);
    closeBtn.addEventListener('click', function() {
      panel.classList.remove('is-open');
      var b = rootEl && rootEl.querySelector('.proto-toolbar__comments-trigger');
      if (b) b.setAttribute('aria-pressed', 'false');
      stopDesignPickMode();
      clearFeatureHighlights();
      clearCommentRowHoverHighlight();
    });
    header.appendChild(closeBtn);

    var toolbar = el('div', { class: 'proto-comments-panel__toolbar' }, []);
    commentsDesignToggle = el('button', {
      type: 'button',
      class: 'proto-comments-panel__pill',
      'aria-pressed': 'false',
      'aria-label': 'Add comment — click an element on the page to attach a note'
    }, ['Add comment']);
    commentsDesignToggle.addEventListener('click', function() {
      if (designModeOn) stopDesignPickMode();
      else startDesignPickMode();
    });

    var refreshBtn = el('button', {
      type: 'button',
      class: 'proto-comments-panel__pill',
      'aria-label': 'Reload comments from server'
    }, [icon('refresh'), ' Reload']);
    refreshBtn.addEventListener('click', function() {
      refreshComments();
    });

    commentsUpdateBtn = el('button', {
      type: 'button',
      class: 'proto-comments-panel__pill proto-comments-panel__pill--primary',
      'aria-label': 'Copy update prompt for agent (instruction plus JSON)'
    }, ['Update']);
    commentsUpdateBtn.addEventListener('click', function() {
      copyCommentsUpdateAgentPrompt();
    });

    var clearBtn = el('button', {
      type: 'button',
      class: 'proto-comments-panel__pill',
      'aria-label': 'Clear queued comments from this browser'
    }, ['Clear queue']);
    clearBtn.addEventListener('click', clearPendingQueue);

    toolbar.appendChild(commentsDesignToggle);
    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(commentsUpdateBtn);
    toolbar.appendChild(clearBtn);

    commentsClipboardStatusEl = el('div', {
      class: 'proto-comments-panel__status',
      role: 'status',
      hidden: true
    }, []);

    commentsSearchInput = el('input', {
      type: 'search',
      class: 'proto-comments-panel__search',
      placeholder: 'Search comments…'
    });
    commentsSearchInput.addEventListener('input', function() {
      renderCommentsList();
    });

    commentsListHost = el('div', { class: 'proto-comments-panel__list' }, []);

    panel.appendChild(header);
    panel.appendChild(toolbar);
    panel.appendChild(commentsClipboardStatusEl);
    panel.appendChild(commentsSearchInput);
    panel.appendChild(commentsListHost);

    document.addEventListener('click', function(e) {
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(e.target)) return;
      if (rootEl && rootEl.contains(e.target)) return;
      if (e.target.closest('.proto-comments-modal-backdrop')) return;
      panel.classList.remove('is-open');
      var b = rootEl && rootEl.querySelector('.proto-toolbar__comments-trigger');
      if (b) b.setAttribute('aria-pressed', 'false');
      stopDesignPickMode();
      clearFeatureHighlights();
      clearCommentRowHoverHighlight();
    });

    return panel;
  }

  function initCommentsFeature() {
    commentsPanelEl = buildCommentsPanel();
    document.body.appendChild(commentsPanelEl);
    window.addEventListener('experiment-changed', function() {
      if (commentsPanelEl && commentsPanelEl.classList.contains('is-open')) {
        renderCommentsList();
      }
    });
  }

  /* ─── Init ─────────────────────────────────────────────────────── */

  function init(userConfig) {
    if (rootEl) return; // idempotent
    config = Object.assign({}, DEFAULTS, userConfig || {});
    config.experiments = config.experiments || [];
    config.features = config.features || {};
    config.actions = config.actions || {};
    config.triggers = config.triggers || [];

    function ready(fn) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
      } else fn();
    }

    ready(function() {
      currentExp = readStoredExp();
      applyBodyClass(currentExp);

      rootEl = el('div', { class: 'proto-toolbar', role: 'toolbar', 'aria-label': 'Prototype toolbar' });
      var mainCluster = el('div', { class: 'proto-toolbar__main' });
      [buildHome(), buildExperimentDropdown(), buildFeaturesButton(), buildTriggersFlyout(), buildCommentsButton()]
        .forEach(function(c) { if (c) mainCluster.appendChild(c); });

      rootEl.appendChild(buildCollapseToggleButton());
      rootEl.appendChild(mainCluster);

      var overlay = buildFeaturesOverlayEl();
      if (overlay) rootEl.appendChild(overlay);

      document.body.appendChild(rootEl);
      initCommentsFeature();
      applyToolbarCollapsed(readToolbarCollapsed());
    });
  }

  global.PrototypeToolbar = {
    init: init,
    setExperiment: setExperiment,
    getExperiment: function() { return currentExp; },
    reloadDesignComments: refreshComments
  };
})(window);
