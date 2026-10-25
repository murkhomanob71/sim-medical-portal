/* ==========================================================================
   notices.js — per-sector notice board (offline, localStorage)
   ========================================================================== */
(() => {
  'use strict';

  const STORE_KEY = 'simNotices_v1';

  const SECTORS = {
    'sim-fabrics': {
      label: 'SIM Fabrics Ltd.',
      subtitle: 'Departmental notices, circulars and sector files — stored on this computer.'
    },
    central: {
      label: 'SIM Group Central Medical Hub',
      subtitle: 'Executive medical operations, policy notes and central instructions.'
    },
    mozaffar: {
      label: 'Mozaffar Hossain Spinning Mills Ltd.',
      subtitle: 'Sector notices, safety circulars and medical camp announcements.'
    },
    archive: {
      label: 'Notice Board & File Archive',
      subtitle: 'Central repository for past notices and reference documents.'
    }
  };

  const CATEGORY_LABEL = {
    general: 'General',
    medical: 'Medical',
    safety: 'Safety',
    hr: 'HR'
  };

  const SEED = {
    'sim-fabrics': [
      {
        title: 'Monthly medical requisition schedule',
        category: 'medical',
        body: 'All department heads are requested to submit the monthly medicine requisition to the Medical Center by the 25th of every month. Late submissions will be carried over to the next cycle.',
        pinned: true,
        author: 'Central Medical Department'
      },
      {
        title: 'Free blood pressure and sugar screening',
        category: 'general',
        body: 'A free health screening camp will be held at the factory medical room every Sunday from 9:00 AM to 12:00 PM. Workers are encouraged to attend.',
        pinned: false,
        author: 'Medical Officer'
      }
    ],
    central: [
      {
        title: 'Standard operating procedure for medicine stock',
        category: 'medical',
        body: 'Opening stock must always match the closing stock of the previous month. Any discrepancy should be reported to the Central Medical Department before the 5th of the month.',
        pinned: true,
        author: 'Central Medical Department'
      }
    ],
    mozaffar: [
      {
        title: 'Workplace safety refresher training',
        category: 'safety',
        body: 'A safety refresher session for all shift supervisors will be conducted in the training room. Attendance is mandatory for supervisors and line chiefs.',
        pinned: true,
        author: 'Safety Committee'
      }
    ],
    archive: [
      {
        title: 'How to keep a copy of this notice board',
        category: 'general',
        body: 'Use the Print button to produce a paper copy of the currently selected sector. Use the Backup button on the requisition page for a full data export.',
        pinned: false,
        author: 'System Administrator'
      }
    ]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const escapeHTML = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const readStore = () => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  const writeStore = () => {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      return false;
    }
  };

  const makeId = () => `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const seedDatabase = () => {
    const sectors = {};
    Object.keys(SECTORS).forEach((id) => {
      sectors[id] = (SEED[id] || []).map((notice, index) => ({
        id: makeId(),
        title: notice.title,
        body: notice.body,
        category: notice.category,
        pinned: Boolean(notice.pinned),
        author: notice.author,
        createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString()
      }));
    });
    return { version: 1, sectors };
  };

  let state = readStore();
  if (!state || !state.sectors) {
    state = seedDatabase();
    writeStore();
  }
  Object.keys(SECTORS).forEach((id) => {
    if (!Array.isArray(state.sectors[id])) state.sectors[id] = [];
  });

  let activeSector = 'sim-fabrics';
  let activeCategory = 'all';
  let searchTerm = '';

  /* ---------------------------------------------------------------------- */
  const formatDate = (iso) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  const noticesForSector = () => state.sectors[activeSector] || [];

  const visibleNotices = () => {
    const term = searchTerm.trim().toLowerCase();
    return noticesForSector()
      .filter((notice) => {
        if (activeCategory !== 'all' && notice.category !== activeCategory) return false;
        if (!term) return true;
        return `${notice.title} ${notice.body} ${notice.author}`.toLowerCase().includes(term);
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  };

  const renderHeading = () => {
    const sector = SECTORS[activeSector];
    $('#notice-title').textContent = sector.label;
    $('#noticeSubtitle').textContent = sector.subtitle;
    document.title = `${sector.label} · Notice Board · SIM Medical`;
    $('#sectorSelect').value = activeSector;
  };

  const renderCounts = () => {
    const all = noticesForSector();
    const counts = { all: all.length, general: 0, medical: 0, safety: 0, hr: 0 };
    all.forEach((notice) => {
      if (counts[notice.category] !== undefined) counts[notice.category] += 1;
    });
    $$('[data-count]').forEach((node) => {
      node.textContent = String(counts[node.dataset.count] || 0);
    });
  };

  const noticeCard = (notice) => {
    const li = document.createElement('li');
    li.className = `notice-card notice-card--${notice.category}${notice.pinned ? ' notice-card--pinned' : ''}`;
    li.dataset.id = notice.id;

    const head = document.createElement('div');
    head.className = 'notice-card-head';

    const title = document.createElement('h2');
    title.textContent = notice.title;

    const categoryBadge = document.createElement('span');
    categoryBadge.className = `notice-badge notice-badge--${notice.category}`;
    categoryBadge.textContent = CATEGORY_LABEL[notice.category] || 'General';

    head.append(title, categoryBadge);

    if (notice.pinned) {
      const pinBadge = document.createElement('span');
      pinBadge.className = 'notice-badge notice-badge--pinned';
      pinBadge.innerHTML = '<i class="bi bi-pin-angle-fill" aria-hidden="true"></i>Pinned';
      head.appendChild(pinBadge);
    }

    const body = document.createElement('p');
    body.className = 'notice-body';
    body.textContent = notice.body;

    const foot = document.createElement('div');
    foot.className = 'notice-card-foot';

    const meta = document.createElement('span');
    meta.className = 'notice-meta';
    meta.innerHTML = `<span><i class="bi bi-person" aria-hidden="true"></i> ${escapeHTML(notice.author || 'Medical Department')}</span>`
      + `<span><i class="bi bi-clock" aria-hidden="true"></i> ${escapeHTML(formatDate(notice.createdAt))}</span>`;

    const actions = document.createElement('span');
    actions.className = 'notice-actions';

    const pinButton = document.createElement('button');
    pinButton.type = 'button';
    pinButton.className = 'icon-button';
    pinButton.title = notice.pinned ? 'Unpin notice' : 'Pin notice';
    pinButton.setAttribute('aria-label', notice.pinned ? `Unpin ${notice.title}` : `Pin ${notice.title}`);
    pinButton.innerHTML = `<i class="bi ${notice.pinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'}" aria-hidden="true"></i>`;
    pinButton.addEventListener('click', () => {
      notice.pinned = !notice.pinned;
      writeStore();
      render();
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'icon-button icon-button--danger';
    deleteButton.title = 'Delete notice';
    deleteButton.setAttribute('aria-label', `Delete ${notice.title}`);
    deleteButton.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i>';
    deleteButton.addEventListener('click', () => {
      if (!window.confirm(`Delete “${notice.title}”?`)) return;
      state.sectors[activeSector] = noticesForSector().filter((item) => item.id !== notice.id);
      writeStore();
      render();
    });

    actions.append(pinButton, deleteButton);
    foot.append(meta, actions);

    li.append(head, body, foot);
    return li;
  };

  const render = () => {
    renderHeading();
    renderCounts();

    const list = $('#noticeList');
    const notices = visibleNotices();

    if (!notices.length) {
      const empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = searchTerm || activeCategory !== 'all'
        ? 'No notices match this filter yet.'
        : 'No notices published for this sector yet. Use the form to publish the first one.';
      list.replaceChildren(empty);
      return;
    }

    list.replaceChildren(...notices.map(noticeCard));
  };

  /* ---------------------------------------------------------------------- */
  const setStatus = (message, isError = false) => {
    const node = $('#composeStatus');
    node.textContent = message;
    node.classList.toggle('is-error', isError);
  };

  const addNotice = (event) => {
    event.preventDefault();
    const title = $('#noticeTitleInput').value.trim();
    const body = $('#noticeBodyInput').value.trim();

    if (!title) {
      setStatus('Please enter a notice title.', true);
      $('#noticeTitleInput').focus();
      return;
    }
    if (!body) {
      setStatus('Please write the notice details.', true);
      $('#noticeBodyInput').focus();
      return;
    }

    state.sectors[activeSector].unshift({
      id: makeId(),
      title,
      body,
      category: $('#noticeCategory').value,
      pinned: $('#noticePinned').checked,
      author: 'Medical Department',
      createdAt: new Date().toISOString()
    });

    if (!writeStore()) {
      setStatus('Could not save — browser storage is unavailable.', true);
      return;
    }

    $('#noticeForm').reset();
    $('#noticeCategory').value = 'general';
    setStatus('Notice published.');
    activeCategory = 'all';
    $$('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.category === 'all'));
    render();
    window.setTimeout(() => setStatus(''), 2600);
  };

  const boot = () => {
    const select = $('#sectorSelect');
    select.innerHTML = Object.entries(SECTORS)
      .map(([id, sector]) => `<option value="${id}">${escapeHTML(sector.label)}</option>`)
      .join('');

    const params = new URLSearchParams(window.location.search);
    const requested = params.get('sector');
    if (requested && SECTORS[requested]) activeSector = requested;
    select.value = activeSector;

    select.addEventListener('change', (event) => {
      activeSector = SECTORS[event.target.value] ? event.target.value : 'sim-fabrics';
      const url = new URL(window.location.href);
      url.searchParams.set('sector', activeSector);
      window.history.replaceState({}, '', url);
      render();
    });

    $$('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.category;
        $$('.chip').forEach((item) => item.classList.toggle('is-active', item === chip));
        render();
      });
    });

    $('#noticeSearch').addEventListener('input', (event) => {
      searchTerm = event.target.value;
      render();
    });

    $('#noticeForm').addEventListener('submit', addNotice);
    $('#printNotices').addEventListener('click', () => window.print());

    render();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
