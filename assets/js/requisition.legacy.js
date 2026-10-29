    'use strict';

    const PRODUCT_KEY = 'simProducts_v2';
    const STATE_KEY = 'simAppState_v2';

    // Product: name, unit, pieces per box, retail rate per unit.
    const productSeed = [
      ['Tab Napa Extend (665mg)', 'Box', '', 280],
      ['Tab. Napa (500mg)', 'Box', '', 500],
      ['Tab. Histacin (4mg)', 'Box', '', 150],
      ['Tab. Alatrol (10mg)', 'Box', '', 750],
      ['Tab. Torax/Rolac (10mg)', 'Box', '', 600],
      ['Tab. Brodil (2mg)', 'Box', '', 130],
      ['Tab. Flexi (100mg)', 'Box', '', 500],
      ['Tab. Solivo (500mg)', 'Box', '', 450],
      ['Tab. Myonil (50mg)', 'Box', '', 150],
      ['Tab. Fusid (40mg)', 'Box', '', 200],
      ['Tab. Norvis (50mg)/Algin', 'Box', '', 240],
      ['Tab. Famotack (20mg)', 'Box', '', 180],
      ['Tab. Filmet (400mg)', 'Box', '', 425],
      ['Tab. Entacyd Plus', 'Box', '', 500],
      ['Tab. Ofran (8mg)', 'Box', '', 330],
      ['Tab. Deflux (10mg)', 'Box', '', 600],
      ['Tab. Cinaron Plus', 'Box', '', 280],
      ['Tab. Vergon (5mg)', 'Box', '', 442],
      ['Optimox E/D', 'Pcs', '', 80],
      ['Tear E/D', 'Box', '', 450],
      ['Windel Plus Solution', 'Box', '', 300],
      ['3cc Syringe', 'Box', '', 400],
      ['Nichipore 2 inch', 'Pcs', '', 100],
      ['Normal Saline 1000ml', 'Pcs', '', 120],
      ['Viodin Solution 100ml', 'Box', '', 100],
      ['Surgical Gauze', 'Box', '', 300],
      ['Surgical Mask', 'Box', '', 100],
      ['Blood Lancet', 'Box', '', 150],
      ['Bactocin Ointment', 'Pcs', '', 100],
      ['ORS-N', 'Box', '', 85],
      ['Nix Rubbing Balm', 'Pcs', '', 40],
      ['Hexisol (50mg)', 'Pcs', '', 140],
      ['Hexisol (250mg)', 'Pcs', '', 60],
      ['Burna Cream', 'Pcs', '', 200],
      ['Prolin 3-0', 'Pcs', '', 200],
      ['Marksilk 3.0', 'Pcs', '', 147.67],
      ['Catgut 3.0', 'Pcs', '', 130],
      ['Clofenac Gel', 'Pcs', '', 70],
      ['Green Strip', 'Box', '', 200],
      ['Than Gauze', 'Box', '', 433.33],
      ['Gloves 7 inch (one time use)', 'Pcs', '', 5],
      ['Surgical BP Blade', 'Pcs', '', 55],
      ['Inj. Torax (30mg)/Winop', 'Pcs', '', 95],
      ['Inj. Torax (60mg)', 'Pcs', '', 35],
      ['Inj. Norvis (2ml)/Algin', 'Pcs', '', 32],
      ['Inj. Maxpro 40mg', 'Pcs', '', 105],
      ['Inj. Ofran (4ml)/Emistat', 'Pcs', '', 95],
      ['Inj. TT Vaccine (Vial)', 'Pcs', '', 950],
      ['Budicort (1mg/2ml)', 'Pcs', '', 70],
      ['Inj. Avil (45.5mg/2ml)', 'Pcs', '', 37.6],
      ['Inj. Cotson (100mg/2ml)', 'Pcs', '', 60],
      // Additional stock-report products; retail rates were not provided.
      ['Tab. Dinovo (500mg)/Solibo', 'Box', '', 0],
      ['Tab. Cinaron Plus/Revert', 'Box', '', 0],
      ['Tab. Vergon (5mg)/Promtil', 'Box', '', 0],
      ['Tab. Pizo-A (0.5mg)', 'Box', '', 0],
      ['Tab. Tenil (3mg)', 'Box', '', 0],
      ['Cap. Traxyl (500mg)', 'Box', '', 0],
      ['Inj. Esonix (40mg)', 'Pcs', '', 0],
      ['Inj. Tranexyl (5ml)/Xamic', 'Pcs', '', 0],
      ['Tab. NO-Spa (40mg)', 'Box', '', 0],
      ['Tab. Indever (10mg)', 'Box', '', 0],
      ['Tab. Amdocal (5mg)', 'Box', '', 0],
      ['Tab. Norium (10mg)', 'Box', '', 0],
      ['Tab. Reumacap SR', 'Box', '', 0],
      ['Tab. Zox 500mg', 'Box', '', 0]
    ];

    // September 2026 stock report: name, opening, received, issue, remarks.
    const stockSeed = [
      ['Tab. Napa (500mg)', 1173, 0, 497, ''],
      ['Tab. Napa Extend (665mg)', 507, 1080, 534, 'D-24516'],
      ['Tab. Histacin (4mg)', 345, 0, 295, ''],
      ['Tab. Alatrol (10mg)', 307, 0, 184, ''],
      ['Tab. Brodil (2mg)', 539, 0, 143, ''],
      ['Tab. Torax (10mg)/Rolac', 58, 200, 140, 'D-24516'],
      ['Tab. Flexi (100mg)', 385, 200, 70, 'D-24516'],
      ['Tab. Dinovo (500mg)/Solibo', 5, 150, 92, 'D-24516'],
      ['Tab. Myonil (50mg)', 0, 150, 50, 'D-24517'],
      ['Tab. Norvis (50mg)/Algin', 181, 450, 163, 'D-24517'],
      ['Tab. Famotack (20mg)', 76, 240, 76, 'D-24517'],
      ['Tab. Entacyd Plus', 171, 200, 269, 'D-24516'],
      ['Tab. Ofran (8mg)/Emistat', 62, 150, 71, 'D-24517'],
      ['Tab. Deflux (10mg)', 211, 200, 124, 'D-24518'],
      ['Tab. Filmet (400mg)', 1315, 0, 145, ''],
      ['Tab. Cinaron Plus/Revert', 384, 0, 65, ''],
      ['Tab. Vergon (5mg)/Promtil', 602, 0, 62, ''],
      ['Tab. Pizo-A (0.5mg)', 90, 200, 110, ''],
      ['Tab. Tenil (3mg)', 192, 0, 6, ''],
      ['Tab. Fusid (40mg)', 34, 0, 22, ''],
      ['Cap. Traxyl (500mg)', 12, 60, 5, 'D-24519'],
      ['Inj. Torax (30mg)/Winop', 7, 5, 9, 'D-24519'],
      ['Inj. Torax (60mg)', 0, 5, 0, 'D-24518'],
      ['Inj. Esonix (40mg)', 2, 10, 7, 'D-24518'],
      ['Inj. Norvis (2ml)/Algin', 14, 0, 7, ''],
      ['Inj. Ofran (4ml)/Emistat', 14, 0, 1, ''],
      ['Inj. Tranexyl (5ml)/Xamic', 5, 0, 2, ''],
      ['ORS-N', 77, 500, 536, 'D-24519'],
      ['Tab. NO-Spa (40mg)', 194, 0, 18, ''],
      ['Tab. Indever (10mg)', 188, 0, 4, ''],
      ['Tab. Amdocal (5mg)', 23, 0, 4, ''],
      ['Tab. Norium (10mg)', 0, 300, 41, 'D-24516'],
      ['Tab. Reumacap SR', 200, 200, 10, 'D-24518'],
      ['Tab. Zox 500mg', 38, 0, 13, '']
    ];

    function readStore(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch (error) {
        return fallback;
      }
    }

    function safeStore(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        setStatus('Could not save: browser storage is unavailable.', 'error');
        return false;
      }
    }

    const savedProducts = readStore(PRODUCT_KEY, null);
    let products = Array.isArray(savedProducts)
      ? savedProducts.map((product, index) => ({
          id: product.id ?? index + 1,
          name: String(product.name ?? '').trim(),
          unit: product.unit === 'Pcs' ? 'Pcs' : 'Box',
          pieces: product.pieces ?? '',
          rate: Math.max(0, Number(product.rate) || 0)
        })).filter((product) => product.name)
      : productSeed.map((product, index) => ({
          id: index + 1,
          name: product[0],
          unit: product[1],
          pieces: product[2],
          rate: product[3]
        }));

    const savedState = readStore(STATE_KEY, {}) || {};
    let requisition = savedState.requisition && typeof savedState.requisition === 'object'
      ? savedState.requisition
      : {};
    let stock = Array.isArray(savedState.stock)
      ? savedState.stock
      : stockSeed.map((row) => ({ name: row[0], opening: row[1], received: row[2], issue: row[3], remarks: row[4] }));

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const reqMonthInput = $('#reqMonth');
    const stockMonthInput = $('#stockMonth');
    const saveStatus = $('#saveStatus');

    function setStatus(message, kind = '') {
      if (!saveStatus) return;
      saveStatus.textContent = message;
      saveStatus.classList.remove('is-success', 'is-error');
      if (kind) saveStatus.classList.add(`is-${kind}`);
    }

    function markUnsaved() {
      setStatus('Unsaved changes');
    }

    function localMonthValue(date = new Date()) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${date.getFullYear()}-${month}`;
    }

    function monthLabel(value) {
      if (!value || !/^\d{4}-\d{2}$/.test(value)) return '';
      const [year, month] = value.split('-').map(Number);
      return new Date(year, month - 1, 1, 12).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    function money(value) {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);
    }

    function persistProducts() {
      safeStore(PRODUCT_KEY, products);
    }

    function updateSignature() {
      const name = $('#signNameInput')?.value.trim() || 'Dr. Rashna Mahjabin Tonni';
      const title = $('#signTitleInput')?.value.trim() || 'Sr. Medical Officer';
      $$('[data-sign-name]').forEach((element) => { element.textContent = name; });
      $$('[data-sign-title]').forEach((element) => { element.textContent = title; });
    }

    function renderCatalog() {
      const body = $('#catalog tbody');
      const fragment = document.createDocumentFragment();

      products.forEach((product) => {
        const row = document.createElement('tr');
        const selectCell = document.createElement('td');
        selectCell.className = 'select-column';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'product-checkbox h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-2 focus:ring-purple-500';
        checkbox.checked = Boolean(requisition[product.id]);
        checkbox.setAttribute('aria-label', `Add ${product.name} to requisition`);
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            if (!requisition[product.id]) requisition[product.id] = { qty: 1 };
          } else {
            delete requisition[product.id];
          }
          renderReq();
          markUnsaved();
        });
        selectCell.appendChild(checkbox);

        const nameCell = document.createElement('td');
        nameCell.className = 'font-semibold text-gray-800';
        nameCell.textContent = product.name;

        const unitCell = document.createElement('td');
        unitCell.textContent = product.unit;

        const piecesCell = document.createElement('td');
        piecesCell.className = 'num';
        const piecesInput = document.createElement('input');
        piecesInput.type = 'number';
        piecesInput.min = '0';
        piecesInput.step = '1';
        piecesInput.value = product.pieces ?? '';
        piecesInput.placeholder = '—';
        piecesInput.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
        piecesInput.setAttribute('aria-label', `Pieces per box for ${product.name}`);
        piecesInput.addEventListener('change', () => {
          product.pieces = piecesInput.value;
          markUnsaved();
        });
        piecesCell.appendChild(piecesInput);

        const rateCell = document.createElement('td');
        rateCell.className = 'num';
        const rateInput = document.createElement('input');
        rateInput.type = 'number';
        rateInput.min = '0';
        rateInput.step = '0.01';
        rateInput.value = String(Number(product.rate) || 0);
        rateInput.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
        rateInput.setAttribute('aria-label', `Retail rate per ${product.unit} for ${product.name}`);
        rateInput.addEventListener('change', () => {
          product.rate = Math.max(0, Number(rateInput.value) || 0);
          renderReq();
          markUnsaved();
        });
        rateCell.appendChild(rateInput);

        const deleteCell = document.createElement('td');
        deleteCell.className = 'no-print';
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'table-action';
        deleteButton.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i><span>Delete</span>';
        deleteButton.setAttribute('aria-label', `Delete ${product.name} permanently`);
        deleteButton.addEventListener('click', () => {
          if (!window.confirm(`Permanently delete “${product.name}” from the catalog?`)) return;
          products = products.filter((item) => String(item.id) !== String(product.id));
          delete requisition[product.id];
          renderCatalog();
          renderReq();
          markUnsaved();
        });
        deleteCell.appendChild(deleteButton);

        row.append(selectCell, nameCell, unitCell, piecesCell, rateCell, deleteCell);
        fragment.appendChild(row);
      });

      body.replaceChildren(fragment);
      $('#catalogCount').textContent = `${products.length} product${products.length === 1 ? '' : 's'}`;
    }

    function renderReq() {
      $('#reqMonthTitle').textContent = `For the month of ${monthLabel(reqMonthInput.value)}`;
      const body = $('#reqTable tbody');
      const fragment = document.createDocumentFragment();
      let total = 0;
      let serial = 0;
      const selected = products.filter((product) => Boolean(requisition[product.id]));

      if (selected.length === 0) {
        const row = document.createElement('tr');
        row.className = 'empty-row';
        const cell = document.createElement('td');
        cell.colSpan = 5;
        cell.textContent = 'No medicines selected yet. Choose a checkbox in the permanent product list below.';
        row.appendChild(cell);
        fragment.appendChild(row);
      }

      selected.forEach((product) => {
        serial += 1;
        const item = requisition[product.id] && typeof requisition[product.id] === 'object'
          ? requisition[product.id]
          : { qty: Number(requisition[product.id]) || 0 };
        if (item.qty === undefined) item.qty = 1;
        requisition[product.id] = item;
        const qty = Math.max(0, Number(item.qty) || 0);
        const amount = qty * (Number(product.rate) || 0);
        total += amount;

        const row = document.createElement('tr');
        const serialCell = document.createElement('td');
        serialCell.textContent = String(serial);
        const nameCell = document.createElement('td');
        nameCell.className = 'font-semibold text-gray-800';
        nameCell.textContent = product.name;

        const qtyCell = document.createElement('td');
        const qtyEntry = document.createElement('span');
        qtyEntry.className = 'qty-entry';
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '0';
        qtyInput.step = '1';
        qtyInput.value = String(qty);
        qtyInput.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
        qtyInput.setAttribute('aria-label', `Quantity of ${product.name}`);
        qtyInput.addEventListener('change', () => {
          item.qty = Math.max(0, Number(qtyInput.value) || 0);
          renderReq();
          markUnsaved();
        });
        const unit = document.createElement('span');
        unit.className = 'unit-label';
        unit.textContent = product.unit;
        qtyEntry.append(qtyInput, unit);
        qtyCell.appendChild(qtyEntry);

        const amountCell = document.createElement('td');
        amountCell.className = 'num';
        amountCell.textContent = money(amount);

        const actionCell = document.createElement('td');
        actionCell.className = 'no-print';
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'table-action';
        removeButton.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i><span>Remove</span>';
        removeButton.addEventListener('click', () => {
          delete requisition[product.id];
          renderReq();
          renderCatalog();
          markUnsaved();
        });
        actionCell.appendChild(removeButton);

        row.append(serialCell, nameCell, qtyCell, amountCell, actionCell);
        fragment.appendChild(row);
      });

      body.replaceChildren(fragment);
      $('#reqTotal').innerHTML = `<b>৳ ${money(total)}</b>`;
    }

    function updateStockCalculations() {
      const rows = $$('#stockTable tbody tr');
      const sums = { opening: 0, received: 0, total: 0, issue: 0, closing: 0 };

      stock.forEach((item, index) => {
        const opening = Number(item.opening) || 0;
        const received = Number(item.received) || 0;
        const issue = Number(item.issue) || 0;
        const total = opening + received;
        const closing = total - issue;
        sums.opening += opening;
        sums.received += received;
        sums.total += total;
        sums.issue += issue;
        sums.closing += closing;

        const row = rows[index];
        const totalCell = row?.querySelector('[data-stock-total]');
        const closingCell = row?.querySelector('[data-stock-closing]');
        if (totalCell) totalCell.textContent = total.toLocaleString('en-US');
        if (closingCell) {
          closingCell.textContent = closing.toLocaleString('en-US');
          closingCell.classList.toggle('negative-stock', closing < 0);
        }
      });

      $('#sOpening').textContent = sums.opening.toLocaleString('en-US');
      $('#sReceived').textContent = sums.received.toLocaleString('en-US');
      $('#sTotal').textContent = sums.total.toLocaleString('en-US');
      $('#sIssue').textContent = sums.issue.toLocaleString('en-US');
      $('#sClosing').textContent = sums.closing.toLocaleString('en-US');
    }

    function renderStock() {
      $('#stockMonthTitle').textContent = `For the month of ${monthLabel(stockMonthInput.value)}`;
      const body = $('#stockTable tbody');
      const fragment = document.createDocumentFragment();

      stock.forEach((item, index) => {
        const row = document.createElement('tr');
        const serialCell = document.createElement('td');
        serialCell.textContent = String(index + 1);
        const nameCell = document.createElement('td');
        nameCell.className = 'font-semibold text-gray-800';
        nameCell.textContent = item.name;
        const inputCells = {};

        ['opening', 'received', 'issue'].forEach((key) => {
          const cell = document.createElement('td');
          cell.className = 'num';
          const input = document.createElement('input');
          input.type = 'number';
          input.min = '0';
          input.step = '1';
          input.value = String(Number(item[key]) || 0);
          input.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
          input.setAttribute('aria-label', `${key} stock for ${item.name}`);
          input.addEventListener('input', () => {
            item[key] = input.value === '' ? 0 : Math.max(0, Number(input.value) || 0);
            updateStockCalculations();
            markUnsaved();
          });
          cell.appendChild(input);
          inputCells[key] = cell;
        });

        const totalCell = document.createElement('td');
        totalCell.className = 'num computed-value';
        totalCell.dataset.stockTotal = 'true';
        const closingCell = document.createElement('td');
        closingCell.className = 'num computed-value';
        closingCell.dataset.stockClosing = 'true';

        const remarksCell = document.createElement('td');
        const remarksInput = document.createElement('input');
        remarksInput.type = 'text';
        remarksInput.value = item.remarks || '';
        remarksInput.className = 'table-input input-wide border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
        remarksInput.setAttribute('aria-label', `Remarks for ${item.name}`);
        remarksInput.addEventListener('change', () => {
          item.remarks = remarksInput.value;
          markUnsaved();
        });
        remarksCell.appendChild(remarksInput);

        row.append(
          serialCell,
          nameCell,
          inputCells.opening,
          inputCells.received,
          totalCell,
          inputCells.issue,
          closingCell,
          remarksCell
        );
        fragment.appendChild(row);
      });

      body.replaceChildren(fragment);
      updateStockCalculations();
    }

    function saveAll() {
      const state = {
        reqMonth: reqMonthInput.value,
        stockMonth: stockMonthInput.value,
        requisition,
        stock,
        signName: $('#signNameInput').value,
        signTitle: $('#signTitleInput').value
      };
      const savedStateOk = safeStore(STATE_KEY, state);
      const savedProductsOk = safeStore(PRODUCT_KEY, products);
      if (savedStateOk && savedProductsOk) setStatus('Saved on this browser.', 'success');
    }

    function addProduct(event) {
      event.preventDefault();
      const name = $('#newName').value.trim();
      const unit = $('#newUnit').value;
      const pieces = $('#newPieces').value;
      const rate = Math.max(0, Number($('#newRate').value) || 0);
      if (!name) {
        $('#newName').focus();
        setStatus('Enter a product name first.', 'error');
        return;
      }
      if (products.some((product) => product.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        setStatus('That product is already in the catalog.', 'error');
        return;
      }
      const nextId = products.reduce((max, product) => Math.max(max, Number(product.id) || 0), 0) + 1;
      products.push({ id: nextId, name, unit, pieces, rate });
      renderCatalog();
      $('#productForm').reset();
      $('#newUnit').value = 'Box';
      markUnsaved();
    }

    function exportExcel() {
      if (!window.XLSX) {
        setStatus('Excel export is unavailable. Check your internet connection and reload.', 'error');
        return;
      }

      const today = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date()).replace(/\//g, '.');
      const signName = $('#signNameInput').value.trim() || 'Dr. Rashna Mahjabin Tonni';
      const signTitle = $('#signTitleInput').value.trim() || 'Sr. Medical Officer';

      const requisitionRows = [
        [today],
        ['To'],
        ['Director'],
        ['SIM Group,'],
        ['Thakurbaritek, Masumabad, Vulta, Rupgonj, Narayanganj.'],
        [],
        ['Subject: Requisition for medicines and accessories for the Medical Center'],
        [],
        ['Dear Sir,'],
        ['With due respect, this is to inform you that, to work properly the following medicines and accessories are badly needed for The Medical Center:-'],
        [],
        ['Sl No.', 'Name', 'Amount', 'Price (BDT)']
      ];

      let serial = 0;
      let requisitionTotal = 0;
      products.filter((product) => Boolean(requisition[product.id])).forEach((product) => {
        const item = requisition[product.id] && typeof requisition[product.id] === 'object'
          ? requisition[product.id]
          : { qty: Number(requisition[product.id]) || 0 };
        const qty = Math.max(0, Number(item.qty) || 0);
        const amount = qty * (Number(product.rate) || 0);
        const quantityLabel = `${String(qty).padStart(2, '0')} ${product.unit.toLowerCase()}`;
        requisitionTotal += amount;
        requisitionRows.push([++serial, product.name, quantityLabel, amount]);
      });

      requisitionRows.push(['', '', 'Total =', requisitionTotal]);
      requisitionRows.push([], ['With Best Regards'], [], [signName], [signTitle], ['SIM Group']);

      const stockRows = [
        ['SIM Fabrics Ltd. (Medical Department)'],
        ['Medicine Stock Report'],
        [`For the month of ${monthLabel(stockMonthInput.value)}`],
        [],
        ['Sl No.', 'Name of Medicine', 'Opening Stock', 'Received', 'Total', 'Issue', 'Closing Stock', 'Remarks']
      ];
      const stockTotals = { opening: 0, received: 0, total: 0, issue: 0, closing: 0 };
      stock.forEach((item, index) => {
        const opening = Number(item.opening) || 0;
        const received = Number(item.received) || 0;
        const issue = Number(item.issue) || 0;
        const total = opening + received;
        const closing = total - issue;
        stockTotals.opening += opening;
        stockTotals.received += received;
        stockTotals.total += total;
        stockTotals.issue += issue;
        stockTotals.closing += closing;
        stockRows.push([index + 1, item.name, opening, received, total, issue, closing, item.remarks || '']);
      });
      stockRows.push(['', 'Total =', stockTotals.opening, stockTotals.received, stockTotals.total, stockTotals.issue, stockTotals.closing, '']);

      const workbook = XLSX.utils.book_new();
      const requisitionSheet = XLSX.utils.aoa_to_sheet(requisitionRows);
      const stockSheet = XLSX.utils.aoa_to_sheet(stockRows);
      requisitionSheet['!cols'] = [{ wch: 8 }, { wch: 38 }, { wch: 14 }, { wch: 14 }];
      requisitionSheet['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToWidth: 1 };
      requisitionSheet['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

      // Merge the letter and signature lines across the four-column page width.
      const letterRows = [0, 1, 2, 3, 4, 6, 8, 9];
      const signatureStart = requisitionRows.length - 6;
      const signatureRows = Array.from({ length: 6 }, (_, index) => signatureStart + index);
      requisitionSheet['!merges'] = [...letterRows, ...signatureRows].map((row) => ({
        s: { r: row, c: 0 },
        e: { r: row, c: 3 }
      }));

      stockSheet['!cols'] = [
        { wch: 6 }, { wch: 30 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
      ];
      stockSheet['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToWidth: 1 };
      stockSheet['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

      const gridBorder = {
        top: { style: 'thin', color: { rgb: 'FF64748B' } },
        bottom: { style: 'thin', color: { rgb: 'FF64748B' } },
        left: { style: 'thin', color: { rgb: 'FF64748B' } },
        right: { style: 'thin', color: { rgb: 'FF64748B' } }
      };
      function styleTable(sheet, headerRow, totalRow, columnCount) {
        for (let row = headerRow; row <= totalRow; row += 1) {
          for (let column = 0; column < columnCount; column += 1) {
            const address = XLSX.utils.encode_cell({ r: row, c: column });
            const cell = sheet[address] || (sheet[address] = { t: 's', v: '' });
            const isHeader = row === headerRow;
            const isTotal = row === totalRow;
            cell.s = {
              font: { bold: isHeader || isTotal, color: { rgb: isHeader ? 'FFFFFFFF' : 'FF1A1A1A' } },
              border: {
                top: { ...gridBorder.top },
                bottom: { ...gridBorder.bottom },
                left: { ...gridBorder.left },
                right: { ...gridBorder.right }
              },
              alignment: { vertical: 'center', horizontal: column === 0 ? 'center' : 'left', wrapText: true },
              ...(isHeader ? { fill: { patternType: 'solid', fgColor: { rgb: 'FF4A148C' } } } : {}),
              ...(isTotal ? { fill: { patternType: 'solid', fgColor: { rgb: 'FFF1F5F9' } } } : {})
            };
          }
        }
      }

      const requisitionHeaderRow = 11;
      const requisitionTotalRow = requisitionRows.length - 7;
      const stockHeaderRow = 4;
      const stockTotalRow = stockRows.length - 1;
      styleTable(requisitionSheet, requisitionHeaderRow, requisitionTotalRow, 4);
      styleTable(stockSheet, stockHeaderRow, stockTotalRow, 8);

      XLSX.utils.book_append_sheet(workbook, requisitionSheet, 'Requisition');
      XLSX.utils.book_append_sheet(workbook, stockSheet, 'Stock Report');
      XLSX.writeFile(workbook, `SIM_Medical_Requisition_${reqMonthInput.value || 'report'}.xlsx`);
      setStatus('Official A4 portrait workbook downloaded.', 'success');
    }

    function showTab(id) {
      $$('.tab-button').forEach((button) => {
        const selected = button.dataset.tabTarget === id;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-selected', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      $$('.panel').forEach((panel) => {
        const selected = panel.id === id;
        panel.classList.toggle('active', selected);
        panel.setAttribute('aria-hidden', String(!selected));
      });
      setStatus('');
    }

    // Initialize existing state and wire up controls.
    reqMonthInput.value = savedState.reqMonth || localMonthValue();
    stockMonthInput.value = savedState.stockMonth || '2026-09';
    $('#signNameInput').value = savedState.signName || 'Dr. Rashna Mahjabin Tonni';
    $('#signTitleInput').value = savedState.signTitle || 'Sr. Medical Officer';

    $$('.tab-button').forEach((button) => {
      button.addEventListener('click', () => showTab(button.dataset.tabTarget));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const tabs = $$('.tab-button');
        const currentIndex = tabs.indexOf(button);
        const nextIndex = event.key === 'ArrowRight'
          ? (currentIndex + 1) % tabs.length
          : (currentIndex - 1 + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        showTab(tabs[nextIndex].dataset.tabTarget);
      });
    });

    $('#saveButton').addEventListener('click', saveAll);
    $('#excelButton').addEventListener('click', exportExcel);
    $('#printButton').addEventListener('click', () => window.print());
    $('#productForm').addEventListener('submit', addProduct);
    reqMonthInput.addEventListener('change', () => { renderReq(); markUnsaved(); });
    stockMonthInput.addEventListener('change', () => { renderStock(); markUnsaved(); });
    $('#signNameInput').addEventListener('input', () => { updateSignature(); markUnsaved(); });
    $('#signTitleInput').addEventListener('input', () => { updateSignature(); markUnsaved(); });

    renderCatalog();
    renderReq();
    renderStock();
    updateSignature();
