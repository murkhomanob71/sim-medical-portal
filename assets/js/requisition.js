/* ==========================================================================
   requisition.js — SIM Group medical requisition, stock and catalog engine
   v3: multi-factory, month archives, auto-save, backup/restore, issue sync,
       roll-forward, low-stock & expiry intelligence, movement log, i18n.
   Everything runs offline and stores data in this browser's localStorage.
   ========================================================================== */
(() => {
  'use strict';

  /* ----------------------------------------------------------------------
     1. Constants
     ---------------------------------------------------------------------- */
  const DB_KEY = 'simMedical_v3';
  const LEGACY_PRODUCT_KEY = 'simProducts_v2';
  const LEGACY_STATE_KEY = 'simAppState_v2';
  const MOVEMENT_LIMIT = 400;
  const EXPIRY_WARNING_DAYS = 90;
  const AUTOSAVE_DELAY = 700;

  const FACTORIES = [
    { id: 'sim-fabrics', name: 'SIM Fabrics Ltd.', code: 'SF' },
    { id: 'mozaffar', name: 'Mozaffar Hossain Spinning Mills Ltd.', code: 'MH' },
    { id: 'sim-group', name: 'SIM Group (Central Medical)', code: 'SG' }
  ];

  // name, unit, pieces per box, retail rate per unit
  const PRODUCT_SEED = [
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

  // September 2026 stock report: name, opening, received, issue, remarks
  const STOCK_SEED = [
    ['Tab. Napa (500mg)', 1173, 0, 497, ''],
    ['Tab Napa Extend (665mg)', 507, 1080, 534, 'D-24516'],
    ['Tab. Histacin (4mg)', 345, 0, 295, ''],
    ['Tab. Alatrol (10mg)', 307, 0, 184, ''],
    ['Tab. Brodil (2mg)', 539, 0, 143, ''],
    ['Tab. Torax/Rolac (10mg)', 58, 200, 140, 'D-24516'],
    ['Tab. Flexi (100mg)', 385, 200, 70, 'D-24516'],
    ['Tab. Dinovo (500mg)/Solibo', 5, 150, 92, 'D-24516'],
    ['Tab. Myonil (50mg)', 0, 150, 50, 'D-24517'],
    ['Tab. Norvis (50mg)/Algin', 181, 450, 163, 'D-24517'],
    ['Tab. Famotack (20mg)', 76, 240, 76, 'D-24517'],
    ['Tab. Entacyd Plus', 171, 200, 269, 'D-24516'],
    ['Tab. Ofran (8mg)', 62, 150, 71, 'D-24517'],
    ['Tab. Deflux (10mg)', 211, 200, 124, 'D-24518'],
    ['Tab. Filmet (400mg)', 1315, 0, 145, ''],
    ['Tab. Cinaron Plus', 384, 0, 65, ''],
    ['Tab. Vergon (5mg)', 602, 0, 62, ''],
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

  /* ----------------------------------------------------------------------
     2. Translation dictionary
     ---------------------------------------------------------------------- */
  const I18N = {
    en: {
      clockLabel: 'Bangladesh time',
      backToDashboard: 'Back to Dashboard',
      medicalOperations: 'Medical Operations',
      pageTitle: 'Medical Requisition & Stock',
      pageSubtitle: 'Manage monthly medicine requests, inventory, and the permanent product catalog.',
      savedLocally: 'Saved in this browser',
      kpiProducts: 'Catalog products',
      kpiRequisition: 'Requisition value',
      kpiLowStock: 'Low stock items',
      kpiExpiring: 'Expiring soon',
      tabRequisition: 'Medicine Requisition',
      tabStock: 'Medicine Stock Report',
      statusDraft: 'Draft',
      statusApproved: 'Approved',
      statusIssued: 'Issued',
      save: 'Save',
      excel: 'Download Excel',
      print: 'Print / PDF',
      backup: 'Backup',
      restore: 'Restore',
      history: 'History',
      printRequisition: 'Medical Requisition',
      printStock: 'Medicine Stock Report',
      reportNo: 'Report No',
      status: 'Status',
      generated: 'Generated',
      monthlyReport: 'Monthly Report',
      monthlyRequisition: 'Monthly Medicine Requisition',
      inventorySummary: 'Inventory Summary',
      stockReport: 'Medicine Stock Report',
      forTheMonthOf: 'For the month of',
      colSl: 'Sl',
      colSlNo: 'Sl No.',
      colMedicine: 'Name of Medicine',
      colQty: 'Qty',
      colPrice: 'Price (৳)',
      colAction: 'Action',
      colOpening: 'Opening Stock',
      colReceived: 'Received',
      colTotal: 'Total',
      colIssue: 'Issue',
      colClosing: 'Closing Stock',
      colStatus: 'Status',
      colRemarks: 'Remarks',
      colSelect: 'Select',
      colProduct: 'Product',
      colUnit: 'Unit',
      colPieces: 'Pieces/Box',
      colRate: 'Retail rate/unit',
      colMin: 'Min',
      colExpiry: 'Expiry',
      colDelete: 'Delete',
      total: 'Total',
      doctorName: "Doctor's name",
      designation: 'Designation',
      regards: 'With Best Regards,',
      autoSync: 'Auto-fill Issue from the requisition',
      rollForward: 'Opening = last month closing',
      permanentCatalog: 'Permanent Catalog',
      productList: 'Permanent Product List',
      catalogHelp: 'Rate হলো প্রতি Box/Pcs-এর retail rate। অজানা rate থাকলে 0 দেখাবে—নিজে যাচাই করে বসাবেন।',
      productName: 'Product name',
      unit: 'Unit',
      piecesPerBox: 'Pieces per box',
      retailRate: 'Retail rate / unit (৳)',
      minStock: 'Min stock',
      expiry: 'Expiry',
      addProduct: 'Add product',
      searchProducts: 'Search products…',
      allUnits: 'All units',
      sortName: 'Name A–Z',
      sortRateDesc: 'Highest rate',
      sortRateAsc: 'Lowest rate',
      sortRecent: 'Recently added',
      selectAll: 'Select all',
      clearAll: 'Clear all',
      applyQty: 'Apply qty',
      historyTitle: 'Saved months & activity',
      savedMonths: 'Saved months',
      movementLog: 'Stock movement log',
      close: 'Close',
      cancel: 'Cancel',
      continue: 'Continue',
      confirmTitle: 'Please confirm',

      savedAt: 'Saved',
      unsaved: 'Unsaved changes',
      storageError: 'Could not save: browser storage is unavailable.',
      savedCount: 'rows saved',
      productsCount: (n) => `${n} product${n === 1 ? '' : 's'}`,
      filteredCount: (shown, total) => `Showing ${shown} of ${total} products`,
      emptyReq: 'No medicines selected yet. Tick a checkbox in the permanent product list below.',
      noMonths: 'No saved months yet.',
      noMovement: 'No stock movements recorded yet.',
      lowStockAlert: (n, names) => `${n} item${n === 1 ? '' : 's'} at or below minimum stock: ${names}.`,
      expiryAlert: (n, names) => `${n} product${n === 1 ? '' : 's'} expired or expiring within ${EXPIRY_WARNING_DAYS} days: ${names}.`,
      rollForwardConfirm: (month) => `Copy the closing stock of the previous month into the opening stock of ${month}? Received and issue values stay as they are.`,
      clearAllConfirm: 'Remove every medicine from this month\'s requisition?',
      deleteProductConfirm: (name) => `Permanently delete “${name}” from the catalog? It is also removed from every month's requisition.`,
      restoreConfirm: 'Replace ALL current data with the selected backup file? This cannot be undone.',
      restoreInvalid: 'That file is not a valid SIM Medical backup.',
      restoreDone: 'Backup restored successfully.',
      backupDone: 'Backup file downloaded.',
      excelDone: 'Excel workbook downloaded.',
      noPreviousMonth: 'There is no earlier month to copy from.',
      rolledForward: 'Opening stock updated from the previous month.',
      qtyPrompt: 'Quantity to apply to the selected medicines:',
      qtyInvalid: 'Enter a quantity of 1 or more.',
      notSelected: 'Select at least one medicine first.',
      addedToReq: 'Added to requisition.',
      issueLocked: 'Issue is locked for manual entry on this row.',
      syncOn: 'Issue column now follows the requisition automatically.',
      approvalChanged: (label) => `Report marked as ${label}.`,
      rollBack: 'Rolled back',
      backupLog: 'Backup exported',
      restoreLog: 'Backup restored',
      monthCreated: (label) => `${label} created with opening stock from the previous month.`,
      productAdded: (name) => `Product added: ${name}`,
      productDeleted: (name) => `Product deleted: ${name}`,
      movementIn: 'Received',
      movementOut: 'Issued',
      stockValue: 'Stock value',
      noFactory: 'No factory selected',
      ok: 'OK',
      low: 'Low',
      out: 'Out',
      expired: 'Expired',
      expiringSoon: 'Expiring',
      applyAll: 'Apply to selected',
      reportLocked: 'This month is marked as issued. Editing is still allowed.',
      syncRow: 'Manual'
    },
    bn: {
      clockLabel: 'বাংলাদেশ সময়',
      backToDashboard: 'ড্যাশবোর্ডে ফিরুন',
      medicalOperations: 'মেডিকেল অপারেশন্স',
      pageTitle: 'মেডিকেল রিকুইজিশন ও স্টক',
      pageSubtitle: 'মাসিক ঔষধের চাহিদা, ইনভেন্টরি এবং স্থায়ী প্রোডাক্ট ক্যাটালগ পরিচালনা করুন।',
      savedLocally: 'এই ব্রাউজারে সংরক্ষিত',
      kpiProducts: 'ক্যাটালগে প্রোডাক্ট',
      kpiRequisition: 'রিকুইজিশনের মূল্য',
      kpiLowStock: 'কম স্টকের আইটেম',
      kpiExpiring: 'মেয়াদ শেষের পথে',
      tabRequisition: 'ঔষধ রিকুইজিশন',
      tabStock: 'ঔষধ স্টক রিপোর্ট',
      statusDraft: 'খসড়া',
      statusApproved: 'অনুমোদিত',
      statusIssued: 'ইস্যুকৃত',
      save: 'সংরক্ষণ',
      excel: 'এক্সেল ডাউনলোড',
      print: 'প্রিন্ট / পিডিএফ',
      backup: 'ব্যাকআপ',
      restore: 'রিস্টোর',
      history: 'হিস্টোরি',
      printRequisition: 'মেডিকেল রিকুইজিশন',
      printStock: 'ঔষধ স্টক রিপোর্ট',
      reportNo: 'রিপোর্ট নম্বর',
      status: 'অবস্থা',
      generated: 'তৈরি হয়েছে',
      monthlyReport: 'মাসিক রিপোর্ট',
      monthlyRequisition: 'মাসিক ঔষধ রিকুইজিশন',
      inventorySummary: 'ইনভেন্টরি সারাংশ',
      stockReport: 'ঔষধ স্টক রিপোর্ট',
      forTheMonthOf: 'মাসের জন্য',
      colSl: 'ক্রম',
      colSlNo: 'ক্রমিক',
      colMedicine: 'ঔষধের নাম',
      colQty: 'পরিমাণ',
      colPrice: 'মূল্য (৳)',
      colAction: 'কার্যক্রম',
      colOpening: 'প্রারম্ভিক স্টক',
      colReceived: 'প্রাপ্ত',
      colTotal: 'মোট',
      colIssue: 'ইস্যু',
      colClosing: 'সমাপনী স্টক',
      colStatus: 'অবস্থা',
      colRemarks: 'মন্তব্য',
      colSelect: 'নির্বাচন',
      colProduct: 'প্রোডাক্ট',
      colUnit: 'একক',
      colPieces: 'টুকরা/বক্স',
      colRate: 'রিটেইল রেট/একক',
      colMin: 'সর্বনিম্ন',
      colExpiry: 'মেয়াদ',
      colDelete: 'মুছুন',
      total: 'মোট',
      doctorName: 'ডাক্তারের নাম',
      designation: 'পদবি',
      regards: 'নমস্কার,',
      autoSync: 'রিকুইজিশন থেকে ইস্যু অটো-পূরণ',
      rollForward: 'প্রারম্ভিক = গত মাসের সমাপনী',
      permanentCatalog: 'স্থায়ী ক্যাটালগ',
      productList: 'স্থায়ী প্রোডাক্ট তালিকা',
      catalogHelp: 'Rate হলো প্রতি Box/Pcs-এর retail rate। অজানা rate থাকলে 0 দেখাবে—নিজে যাচাই করে বসাবেন।',
      productName: 'প্রোডাক্টের নাম',
      unit: 'একক',
      piecesPerBox: 'প্রতি বক্সে টুকরা',
      retailRate: 'রিটেইল রেট / একক (৳)',
      minStock: 'সর্বনিম্ন স্টক',
      expiry: 'মেয়াদ',
      addProduct: 'প্রোডাক্ট যোগ করুন',
      searchProducts: 'প্রোডাক্ট খুঁজুন…',
      allUnits: 'সব একক',
      sortName: 'নাম অনুযায়ী',
      sortRateDesc: 'সর্বোচ্চ রেট',
      sortRateAsc: 'সর্বনিম্ন রেট',
      sortRecent: 'সাম্প্রতিক যোগ',
      selectAll: 'সব নির্বাচন',
      clearAll: 'সব বাতিল',
      applyQty: 'পরিমাণ বসান',
      historyTitle: 'সংরক্ষিত মাস ও কার্যক্রম',
      savedMonths: 'সংরক্ষিত মাস',
      movementLog: 'স্টক মুভমেন্ট লগ',
      close: 'বন্ধ',
      cancel: 'বাতিল',
      continue: 'চালিয়ে যান',
      confirmTitle: 'নিশ্চিত করুন',

      savedAt: 'সংরক্ষিত',
      unsaved: 'অসংরক্ষিত পরিবর্তন',
      storageError: 'সংরক্ষণ ব্যর্থ: ব্রাউজার স্টোরেজ পাওয়া যাচ্ছে না।',
      savedCount: 'সারি সংরক্ষিত',
      productsCount: (n) => `${n} টি প্রোডাক্ট`,
      filteredCount: (shown, total) => `${total} টির মধ্যে ${shown} টি দেখানো হচ্ছে`,
      emptyReq: 'এখনো কোনো ঔষধ নির্বাচন করা হয়নি। নিচের তালিকা থেকে টিক দিন।',
      noMonths: 'এখনো কোনো মাস সংরক্ষিত হয়নি।',
      noMovement: 'এখনো কোনো স্টক মুভমেন্ট নেই।',
      lowStockAlert: (n, names) => `${n} টি আইটেম সর্বনিম্ন স্টকে বা নিচে: ${names}।`,
      expiryAlert: (n, names) => `${n} টি প্রোডাক্টের মেয়াদ শেষ বা ${EXPIRY_WARNING_DAYS} দিনের মধ্যে শেষ হবে: ${names}।`,
      rollForwardConfirm: (month) => `${month} মাসের প্রারম্ভিক স্টকে গত মাসের সমাপনী স্টক বসাবেন? প্রাপ্ত ও ইস্যু অপরিবর্তিত থাকবে।`,
      clearAllConfirm: 'এই মাসের রিকুইজিশন থেকে সব ঔষধ সরিয়ে ফেলবেন?',
      deleteProductConfirm: (name) => `“${name}” স্থায়ীভাবে ক্যাটালগ থেকে মুছে ফেলবেন? সব মাসের রিকুইজিশন থেকেও মুছে যাবে।`,
      restoreConfirm: 'সব বর্তমান ডেটা নির্বাচিত ব্যাকআপ দিয়ে প্রতিস্থাপন করবেন? এটি ফেরানো যাবে না।',
      restoreInvalid: 'ফাইলটি বৈধ SIM Medical ব্যাকআপ নয়।',
      restoreDone: 'ব্যাকআপ সফলভাবে রিস্টোর হয়েছে।',
      backupDone: 'ব্যাকআপ ফাইল ডাউনলোড হয়েছে।',
      excelDone: 'এক্সেল ওয়ার্কবুক ডাউনলোড হয়েছে।',
      noPreviousMonth: 'কপি করার মতো আগের কোনো মাস নেই।',
      rolledForward: 'গত মাস থেকে প্রারম্ভিক স্টক হালনাগাদ হয়েছে।',
      qtyPrompt: 'নির্বাচিত ঔষধে যে পরিমাণ বসাতে চান:',
      qtyInvalid: '১ বা তার বেশি পরিমাণ দিন।',
      notSelected: 'আগে অন্তত একটি ঔষধ নির্বাচন করুন।',
      addedToReq: 'রিকুইজিশনে যোগ হয়েছে।',
      issueLocked: 'এই সারির ইস্যু ম্যানুয়াল এন্ট্রির জন্য লক করা হয়েছে।',
      syncOn: 'ইস্যু কলাম এখন রিকুইজিশন অনুসরণ করবে।',
      approvalChanged: (label) => `রিপোর্ট ${label} হিসেবে চিহ্নিত হয়েছে।`,
      rollBack: 'ফিরিয়ে আনা হয়েছে',
      backupLog: 'ব্যাকআপ এক্সপোর্ট',
      restoreLog: 'ব্যাকআপ রিস্টোর',
      monthCreated: (label) => `${label} মাস গত মাসের প্রারম্ভিক স্টকসহ তৈরি হয়েছে।`,
      productAdded: (name) => `প্রোডাক্ট যোগ হয়েছে: ${name}`,
      productDeleted: (name) => `প্রোডাক্ট মুছে ফেলা হয়েছে: ${name}`,
      movementIn: 'প্রাপ্ত',
      movementOut: 'ইস্যু',
      stockValue: 'স্টক মূল্য',
      noFactory: 'কোনো ফ্যাক্টরি নির্বাচিত নয়',
      ok: 'ঠিক আছে',
      low: 'কম',
      out: 'শেষ',
      expired: 'মেয়াদোত্তীর্ণ',
      expiringSoon: 'মেয়াদ শেষের পথে',
      applyAll: 'নির্বাচিতগুলোতে বসান',
      reportLocked: 'এই মাস ইস্যুকৃত। তবুও সম্পাদনা করা যাবে।',
      syncRow: 'ম্যানুয়াল'
    }
  };

  const t = (key, ...args) => {
    const lang = (db && db.lang) || 'en';
    const table = I18N[lang] || I18N.en;
    const value = table[key] !== undefined ? table[key] : I18N.en[key];
    return typeof value === 'function' ? value(...args) : (value !== undefined ? value : key);
  };

  /* ----------------------------------------------------------------------
     3. Small utilities
     ---------------------------------------------------------------------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const num = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clampQty = (value) => Math.max(0, Math.round(num(value)));

  const money = (value) => new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num(value));

  const pad = (value, size = 2) => String(value).padStart(size, '0');

  const todayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const monthValue = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

  const monthLabel = (value) => {
    if (!value || !/^\d{4}-\d{2}$/.test(value)) return '';
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1, 12).toLocaleString(db.lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const previousMonth = (value) => {
    if (!/^\d{4}-\d{2}$/.test(value || '')) return '';
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 2, 1, 12);
    return monthValue(date);
  };

  const nextMonth = (value) => {
    if (!/^\d{4}-\d{2}$/.test(value || '')) return '';
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month, 1, 12);
    return monthValue(date);
  };

  const formatDateTime = (iso) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(db.lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  };

  const daysUntil = (dateString) => {
    if (!dateString) return null;
    const target = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86400000);
  };

  const slug = (value) => String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const downloadFile = (filename, text, mime = 'application/json') => {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  /* ----------------------------------------------------------------------
     4. State creation / persistence
     ---------------------------------------------------------------------- */
  let db = null;
  let saveTimer = null;
  let lastSavedAt = null;

  const storageAvailable = () => {
    try {
      const probe = '__sim_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  };

  const readJSON = (key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  };

  const writeJSON = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  };

  const makeProducts = (rows) => rows.map((row, index) => ({
    id: index + 1,
    name: row[0],
    unit: row[1] === 'Pcs' ? 'Pcs' : 'Box',
    pieces: row[2] ?? '',
    rate: Math.max(0, num(row[3])),
    minStock: 0,
    expiry: ''
  }));

  const emptyMonth = (factoryId, month) => {
    const factory = FACTORIES.find((item) => item.id === factoryId);
    const [year, mm] = month.split('-');
    return {
      requisition: {},
      stock: [],
      approval: 'draft',
      reportNo: `${factory.code}-REQ-${year}-${mm}-001`,
      signature: { name: 'Dr. Rashna Mahjabin Tonni', title: 'Sr. Medical Officer' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const buildStockRows = (factoryId, month) => {
    const products = db.products;
    const previous = previousMonth(month);
    const previousData = previous ? db.factories[factoryId].months[previous] : null;

    return products.map((product) => {
      const match = previousData
        ? previousData.stock.find((row) => String(row.productId) === String(product.id))
        : null;
      const opening = match
        ? Math.max(0, num(match.opening) + num(match.received) - num(match.issue))
        : 0;
      return {
        productId: product.id,
        name: product.name,
        opening,
        received: 0,
        issue: 0,
        remarks: '',
        issueLocked: false
      };
    });
  };

  const createMonth = (factoryId, month, { fromPrevious = false } = {}) => {
    const record = emptyMonth(factoryId, month);
    record.stock = fromPrevious
      ? buildStockRows(factoryId, month)
      : db.products.map((product) => ({
          productId: product.id,
          name: product.name,
          opening: 0,
          received: 0,
          issue: 0,
          remarks: '',
          issueLocked: false
        }));
    db.factories[factoryId].months[month] = record;
    return record;
  };

  const seedFreshDatabase = () => {
    const fresh = {
      app: 'sim-medical-portal',
      version: 3,
      lang: 'en',
      activeFactory: 'sim-fabrics',
      activeMonth: monthValue(),
      syncIssue: true,
      products: makeProducts(PRODUCT_SEED),
      factories: {},
      movement: []
    };
    FACTORIES.forEach((factory) => {
      fresh.factories[factory.id] = { name: factory.name, months: {} };
    });
    db = fresh;

    // Historic September 2026 report shipped with the original build.
    const products = db.products;
    const september = createMonth('sim-fabrics', '2026-09');
    september.stock = STOCK_SEED.map((row) => {
      const product = products.find((item) => item.name.toLowerCase() === String(row[0]).toLowerCase());
      return {
        productId: product ? product.id : null,
        name: row[0],
        opening: num(row[1]),
        received: num(row[2]),
        issue: num(row[3]),
        remarks: row[4] || '',
        issueLocked: true
      };
    });

    // Bring the current month forward using September's closing stock.
    const current = monthValue();
    if (current !== '2026-09') {
      createMonth('sim-fabrics', current, { fromPrevious: true });
      db.activeMonth = current;
    } else {
      db.activeMonth = '2026-09';
    }
  };

  const migrateLegacy = () => {
    const legacyProducts = readJSON(LEGACY_PRODUCT_KEY);
    const legacyState = readJSON(LEGACY_STATE_KEY);
    if (!legacyProducts && !legacyState) return null;

    const fresh = {
      app: 'sim-medical-portal',
      version: 3,
      lang: 'en',
      activeFactory: 'sim-fabrics',
      activeMonth: monthValue(),
      syncIssue: true,
      products: [],
      factories: {},
      movement: []
    };
    FACTORIES.forEach((factory) => {
      fresh.factories[factory.id] = { name: factory.name, months: {} };
    });

    fresh.products = (Array.isArray(legacyProducts) ? legacyProducts : []).map((product, index) => ({
      id: num(product.id) || index + 1,
      name: String(product.name || '').trim(),
      unit: product.unit === 'Pcs' ? 'Pcs' : 'Box',
      pieces: product.pieces ?? '',
      rate: Math.max(0, num(product.rate)),
      minStock: 0,
      expiry: ''
    })).filter((product) => product.name);

    if (!fresh.products.length) fresh.products = makeProducts(PRODUCT_SEED);

    const targetMonth = legacyState && /^\d{4}-\d{2}$/.test(legacyState.reqMonth || '')
      ? legacyState.reqMonth
      : monthValue();

    const previousDb = db;
    db = fresh;
    const record = createMonth('sim-fabrics', targetMonth);

    if (legacyState) {
      if (legacyState.requisition && typeof legacyState.requisition === 'object') {
        Object.entries(legacyState.requisition).forEach(([id, value]) => {
          const qty = typeof value === 'object' ? clampQty(value.qty) : clampQty(value);
          if (qty > 0) record.requisition[id] = { qty };
        });
      }

      if (Array.isArray(legacyState.stock)) {
        record.stock = legacyState.stock.map((row) => {
          const product = fresh.products.find((item) => item.name.toLowerCase() === String(row.name || '').toLowerCase());
          return {
            productId: product ? product.id : null,
            name: String(row.name || ''),
            opening: clampQty(row.opening),
            received: clampQty(row.received),
            issue: clampQty(row.issue),
            remarks: String(row.remarks || ''),
            issueLocked: false
          };
        });
      }

      record.signature = {
        name: legacyState.signName || 'Dr. Rashna Mahjabin Tonni',
        title: legacyState.signTitle || 'Sr. Medical Officer'
      };
    }

    db.activeMonth = targetMonth;
    db = fresh;
    // Keep a reference so callers can compare.
    void previousDb;
    return fresh;
  };

  const normaliseDatabase = (raw) => {
    if (!raw || typeof raw !== 'object') return false;
    if (!Array.isArray(raw.products) || !raw.factories || typeof raw.factories !== 'object') return false;

    raw.version = 3;
    raw.app = 'sim-medical-portal';
    raw.lang = raw.lang === 'bn' ? 'bn' : 'en';
    raw.syncIssue = raw.syncIssue !== false;
    raw.movement = Array.isArray(raw.movement) ? raw.movement.slice(0, MOVEMENT_LIMIT) : [];

    raw.products = raw.products.map((product, index) => ({
      id: num(product.id) || index + 1,
      name: String(product.name || '').trim(),
      unit: product.unit === 'Pcs' ? 'Pcs' : 'Box',
      pieces: product.pieces ?? '',
      rate: Math.max(0, num(product.rate)),
      minStock: Math.max(0, clampQty(product.minStock)),
      expiry: /^\d{4}-\d{2}-\d{2}$/.test(product.expiry || '') ? product.expiry : ''
    })).filter((product) => product.name);

    if (!raw.products.length) raw.products = makeProducts(PRODUCT_SEED);

    FACTORIES.forEach((factory) => {
      if (!raw.factories[factory.id] || typeof raw.factories[factory.id] !== 'object') {
        raw.factories[factory.id] = { name: factory.name, months: {} };
      }
      const node = raw.factories[factory.id];
      node.name = node.name || factory.name;
      node.months = node.months && typeof node.months === 'object' ? node.months : {};
      Object.values(node.months).forEach((month) => {
        month.requisition = month.requisition && typeof month.requisition === 'object' ? month.requisition : {};
        month.stock = Array.isArray(month.stock) ? month.stock : [];
        month.approval = ['draft', 'approved', 'issued'].includes(month.approval) ? month.approval : 'draft';
        month.signature = month.signature && typeof month.signature === 'object'
          ? month.signature
          : { name: 'Dr. Rashna Mahjabin Tonni', title: 'Sr. Medical Officer' };
      });
    });

    if (!FACTORIES.some((factory) => factory.id === raw.activeFactory)) raw.activeFactory = 'sim-fabrics';
    if (!/^\d{4}-\d{2}$/.test(raw.activeMonth || '')) raw.activeMonth = monthValue();

    return true;
  };

  const loadDatabase = () => {
    const stored = readJSON(DB_KEY);
    if (stored && normaliseDatabase(stored)) {
      db = stored;
      return;
    }

    const migrated = migrateLegacy();
    if (migrated) {
      const normalised = normaliseDatabase(migrated);
      if (normalised) return;
    }

    seedFreshDatabase();
  };

  /* ----------------------------------------------------------------------
     5. Domain accessors
     ---------------------------------------------------------------------- */
  const currentFactory = () => db.factories[db.activeFactory] || Object.values(db.factories)[0];

  const currentFactoryMeta = () => FACTORIES.find((factory) => factory.id === db.activeFactory) || FACTORIES[0];

  const currentMonthData = () => {
    const factory = currentFactory();
    if (!factory.months[db.activeMonth]) {
      createMonth(db.activeFactory, db.activeMonth, { fromPrevious: true });
      logMovement({ kind: 'month', text: t('monthCreated', monthLabel(db.activeMonth)) });
      scheduleSave();
    }
    const record = factory.months[db.activeMonth];
    reconcileStock(record);
    return record;
  };

  const reconcileStock = (record) => {
    const known = new Set(record.stock.map((row) => String(row.productId)));
    let changed = false;

    db.products.forEach((product) => {
      if (!known.has(String(product.id))) {
        record.stock.push({
          productId: product.id,
          name: product.name,
          opening: 0,
          received: 0,
          issue: 0,
          remarks: '',
          issueLocked: false
        });
        changed = true;
      }
    });

    // Keep the displayed name in sync with the catalog.
    record.stock.forEach((row) => {
      const product = findProduct(row.productId);
      if (product && product.name !== row.name) {
        row.name = product.name;
        changed = true;
      }
    });

    return changed;
  };

  const findProduct = (id) => db.products.find((product) => String(product.id) === String(id));

  const stockRowFor = (record, productId) => record.stock.find((row) => String(row.productId) === String(productId));

  const requisitionTotal = (record) => db.products.reduce((sum, product) => {
    const item = record.requisition[product.id];
    if (!item) return sum;
    const qty = clampQty(typeof item === 'object' ? item.qty : item);
    return sum + qty * num(product.rate);
  }, 0);

  const closingOf = (row) => num(row.opening) + num(row.received) - num(row.issue);

  const lowStockItems = (record) => record.stock
    .map((row) => {
      const product = findProduct(row.productId);
      const minStock = product ? num(product.minStock) : 0;
      const closing = closingOf(row);
      return { row, product, minStock, closing };
    })
    .filter((item) => item.minStock > 0 && item.closing <= item.minStock);

  const expiryItems = () => db.products
    .map((product) => ({ product, days: daysUntil(product.expiry) }))
    .filter((item) => item.days !== null && item.days <= EXPIRY_WARNING_DAYS)
    .sort((a, b) => a.days - b.days);

  const logMovement = ({ kind, text, qty = null, direction = null }) => {
    db.movement.unshift({
      t: new Date().toISOString(),
      factory: db.activeFactory,
      month: db.activeMonth,
      kind,
      text,
      qty,
      direction
    });
    if (db.movement.length > MOVEMENT_LIMIT) db.movement.length = MOVEMENT_LIMIT;
  };

  /* ----------------------------------------------------------------------
     6. Save / status
     ---------------------------------------------------------------------- */
  const setStatus = (message, kind = '') => {
    const node = $('#saveStatus');
    if (!node) return;
    node.textContent = message;
    node.classList.remove('is-success', 'is-error');
    if (kind) node.classList.add(`is-${kind}`);
  };

  const saveNow = ({ silent = false } = {}) => {
    window.clearTimeout(saveTimer);
    saveTimer = null;
    const record = currentMonthData();
    record.updatedAt = new Date().toISOString();

    if (!storageAvailable()) {
      setStatus(t('storageError'), 'error');
      return false;
    }

    if (!writeJSON(DB_KEY, db)) {
      setStatus(t('storageError'), 'error');
      return false;
    }

    lastSavedAt = new Date();
    if (!silent) {
      setStatus(`${t('savedAt')} · ${new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(lastSavedAt)}`, 'success');
    }
    return true;
  };

  const scheduleSave = () => {
    setStatus(t('unsaved'));
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveNow({ silent: false }), AUTOSAVE_DELAY);
  };

  /* ----------------------------------------------------------------------
     7. Dialog helpers
     ---------------------------------------------------------------------- */
  let confirmResolver = null;

  const askConfirm = (message) => new Promise((resolve) => {
    const dialog = $('#confirmDialog');
    $('#confirmMessage').textContent = message;
    confirmResolver = resolve;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else resolve(window.confirm(message));
  });

  const closeConfirm = (answer) => {
    const dialog = $('#confirmDialog');
    if (dialog && dialog.open) dialog.close();
    if (confirmResolver) {
      const resolve = confirmResolver;
      confirmResolver = null;
      resolve(answer);
    }
  };

  /* ----------------------------------------------------------------------
     8. Renderers
     ---------------------------------------------------------------------- */
  const collator = new Intl.Collator(['en', 'bn'], { numeric: true, sensitivity: 'base' });

  const catalogFilters = {
    search: '',
    unit: 'all',
    sort: 'name'
  };

  let pendingRestore = null;

  const renderAll = () => {
    applyLanguage();
    renderContext();
    renderKPIs();
    renderAlerts();
    renderReq();
    renderStock();
    renderCatalog();
    renderMonths();
    syncSignatureInputs();
  };

  const syncSignatureInputs = () => {
    const signature = currentMonthData().signature || {};
    const nameInput = $('#signNameInput');
    const titleInput = $('#signTitleInput');
    if (nameInput) nameInput.value = signature.name || 'Dr. Rashna Mahjabin Tonni';
    if (titleInput) titleInput.value = signature.title || 'Sr. Medical Officer';
    updateSignature();
  };

  const applyLanguage = () => {
    document.documentElement.lang = db.lang;
    $$('[data-i18n]').forEach((node) => {
      const key = node.dataset.i18n;
      const value = I18N[db.lang] && I18N[db.lang][key];
      if (typeof value === 'string') node.textContent = value;
      else if (typeof I18N.en[key] === 'string') node.textContent = I18N.en[key];
    });
    $$('[data-i18n-placeholder]').forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      const value = (I18N[db.lang] && I18N[db.lang][key]) || I18N.en[key];
      if (typeof value === 'string') node.placeholder = value;
    });
    $('#langSelect').value = db.lang;
  };

  const renderContext = () => {
    const meta = currentFactoryMeta();
    $('#factorySelect').value = db.activeFactory;
    $('#factoryLabel').textContent = meta.name;
    $('#printFactoryName').textContent = `${meta.name} (Medical Department)`;
    $('#printStockFactoryName').textContent = `${meta.name} (Medical Department)`;

    const record = currentMonthData();
    $('#approvalSelect').value = record.approval;

    const syncToggle = $('#syncIssueToggle');
    if (syncToggle) syncToggle.checked = db.syncIssue !== false;

    const generated = formatDateTime(new Date().toISOString());
    $('#printReportNo').textContent = record.reportNo || '—';
    $('#printStockReportNo').textContent = record.reportNo || '—';
    $('#printStatus').textContent = t(`status${record.approval.charAt(0).toUpperCase()}${record.approval.slice(1)}`);
    $('#printStockStatus').textContent = $('#printStatus').textContent;
    $('#printGenerated').textContent = generated;
    $('#printStockGenerated').textContent = generated;

    document.title = `${meta.name} · ${monthLabel(db.activeMonth)} · SIM Medical`;
  };

  const renderKPIs = () => {
    const record = currentMonthData();
    $('#kpiProducts').textContent = String(db.products.length);
    $('#kpiRequisition').textContent = `৳ ${money(requisitionTotal(record))}`;
    $('#kpiLowStock').textContent = String(lowStockItems(record).length);
    $('#kpiExpiring').textContent = String(expiryItems().length);
  };

  const renderAlerts = () => {
    const area = $('#alertArea');
    const record = currentMonthData();
    const fragments = [];

    const low = lowStockItems(record);
    if (low.length) {
      const names = low.slice(0, 5).map((item) => item.product ? item.product.name : item.row.name).join(', ');
      fragments.push(`
        <div class="alert alert--warn">
          <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
          <p>${escapeHTML(t('lowStockAlert', low.length, names))}</p>
        </div>`);
    }

    const expiring = expiryItems();
    if (expiring.length) {
      const names = expiring.slice(0, 5).map((item) => item.product.name).join(', ');
      fragments.push(`
        <div class="alert alert--danger">
          <i class="bi bi-calendar-x-fill" aria-hidden="true"></i>
          <p>${escapeHTML(t('expiryAlert', expiring.length, names))}</p>
        </div>`);
    }

    if (!storageAvailable()) {
      fragments.push(`
        <div class="alert alert--danger">
          <i class="bi bi-shield-exclamation" aria-hidden="true"></i>
          <p>${escapeHTML(t('storageError'))}</p>
        </div>`);
    }

    area.innerHTML = fragments.join('');
  };

  const escapeHTML = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const selectedProducts = (record) => db.products.filter((product) => Boolean(record.requisition[product.id]));

  const renderReq = () => {
    const record = currentMonthData();
    $('#reqMonth').value = db.activeMonth;
    $('#reqMonthTitle').textContent = `${t('forTheMonthOf')} ${monthLabel(db.activeMonth)}`;

    const body = $('#reqTable tbody');
    const fragment = document.createDocumentFragment();
    let serial = 0;
    let total = 0;

    const selected = selectedProducts(record);
    if (!selected.length) {
      const row = document.createElement('tr');
      row.className = 'empty-row';
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = t('emptyReq');
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    selected.forEach((product) => {
      const item = record.requisition[product.id];
      const qty = clampQty(typeof item === 'object' ? item.qty : item);
      const amount = qty * num(product.rate);
      total += amount;
      serial += 1;

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
        const next = clampQty(qtyInput.value);
        record.requisition[product.id] = { qty: next };
        if (db.syncIssue) applyIssueSync(record, product.id, next);
        afterChange();
      });
      const unit = document.createElement('span');
      unit.className = 'unit-label';
      unit.textContent = product.unit;
      qtyEntry.append(qtyInput, unit);
      qtyCell.appendChild(qtyEntry);

      const amountCell = document.createElement('td');
      amountCell.className = 'num';
      amountCell.textContent = `৳ ${money(amount)}`;

      const actionCell = document.createElement('td');
      actionCell.className = 'no-print';
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'table-action';
      removeButton.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i><span>Remove</span>';
      removeButton.addEventListener('click', () => {
        delete record.requisition[product.id];
        if (db.syncIssue) applyIssueSync(record, product.id, 0);
        afterChange();
      });
      actionCell.appendChild(removeButton);

      row.append(serialCell, nameCell, qtyCell, amountCell, actionCell);
      fragment.appendChild(row);
    });

    body.replaceChildren(fragment);
    $('#reqTotal').innerHTML = `<b>৳ ${money(total)}</b>`;
  };

  const applyIssueSync = (record, productId, qty) => {
    const row = stockRowFor(record, productId);
    if (!row || row.issueLocked) return;
    row.issue = clampQty(qty);
  };

  const renderStock = () => {
    const record = currentMonthData();
    $('#stockMonth').value = db.activeMonth;
    $('#stockMonthTitle').textContent = `${t('forTheMonthOf')} ${monthLabel(db.activeMonth)}`;

    const body = $('#stockTable tbody');
    const fragment = document.createDocumentFragment();
    const sums = { opening: 0, received: 0, total: 0, issue: 0, closing: 0 };

    record.stock.forEach((row, index) => {
      const product = findProduct(row.productId);
      const name = product ? product.name : row.name;
      const opening = num(row.opening);
      const received = num(row.received);
      const issue = num(row.issue);
      const total = opening + received;
      const closing = total - issue;
      const minStock = product ? num(product.minStock) : 0;

      sums.opening += opening;
      sums.received += received;
      sums.total += total;
      sums.issue += issue;
      sums.closing += closing;

      const tr = document.createElement('tr');
      tr.dataset.productId = String(row.productId);
      if (minStock > 0 && closing <= minStock) tr.classList.add('row-low');

      const serialCell = document.createElement('td');
      serialCell.textContent = String(index + 1);

      const nameCell = document.createElement('td');
      nameCell.className = 'font-semibold text-gray-800';
      nameCell.textContent = name;

      const inputs = {};
      ['opening', 'received', 'issue'].forEach((key) => {
        const cell = document.createElement('td');
        cell.className = 'num';
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '1';
        input.value = String(num(row[key]));
        input.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
        input.setAttribute('aria-label', `${key} stock for ${name}`);
        input.addEventListener('input', () => {
          row[key] = clampQty(input.value);
          if (key === 'issue') row.issueLocked = true;
          updateStockTotals(record);
          scheduleSave();
        });
        input.addEventListener('change', () => {
          if (key === 'received' && num(row.received) > 0) {
            logMovement({
              kind: 'stock',
              text: `${name} — ${t('movementIn')}`,
              qty: num(row.received),
              direction: 'in'
            });
          }
          if (key === 'issue' && num(row.issue) > 0) {
            logMovement({
              kind: 'stock',
              text: `${name} — ${t('movementOut')}`,
              qty: num(row.issue),
              direction: 'out'
            });
          }
          renderKPIs();
          renderAlerts();
          renderMonths();
        });
        cell.appendChild(input);
        inputs[key] = cell;
      });

      const totalCell = document.createElement('td');
      totalCell.className = 'num computed-value';
      totalCell.dataset.stockTotal = 'true';
      totalCell.textContent = total.toLocaleString('en-US');

      const closingCell = document.createElement('td');
      closingCell.className = 'num computed-value';
      closingCell.dataset.stockClosing = 'true';
      closingCell.textContent = closing.toLocaleString('en-US');
      closingCell.classList.toggle('negative-stock', closing < 0);

      const statusCell = document.createElement('td');
      statusCell.className = 'no-print';
      statusCell.appendChild(buildStockBadge(closing, minStock));

      const remarksCell = document.createElement('td');
      const remarksInput = document.createElement('input');
      remarksInput.type = 'text';
      remarksInput.value = row.remarks || '';
      remarksInput.className = 'table-input input-wide border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
      remarksInput.setAttribute('aria-label', `Remarks for ${name}`);
      remarksInput.addEventListener('change', () => {
        row.remarks = remarksInput.value;
        scheduleSave();
      });
      remarksCell.appendChild(remarksInput);

      tr.append(
        serialCell, nameCell,
        inputs.opening, inputs.received, totalCell, inputs.issue, closingCell,
        statusCell, remarksCell
      );
      fragment.appendChild(tr);
    });

    body.replaceChildren(fragment);
    $('#sOpening').textContent = sums.opening.toLocaleString('en-US');
    $('#sReceived').textContent = sums.received.toLocaleString('en-US');
    $('#sTotal').textContent = sums.total.toLocaleString('en-US');
    $('#sIssue').textContent = sums.issue.toLocaleString('en-US');
    $('#sClosing').textContent = sums.closing.toLocaleString('en-US');
  };

  const buildStockBadge = (closing, minStock) => {
    const badge = document.createElement('span');
    if (closing <= 0) {
      badge.className = 'status-badge status-badge--out';
      badge.innerHTML = `<i class="bi bi-x-octagon" aria-hidden="true"></i>${escapeHTML(t('out'))}`;
    } else if (minStock > 0 && closing <= minStock) {
      badge.className = 'status-badge status-badge--low';
      badge.innerHTML = `<i class="bi bi-exclamation-triangle" aria-hidden="true"></i>${escapeHTML(t('low'))}`;
    } else {
      badge.className = 'status-badge status-badge--ok';
      badge.innerHTML = `<i class="bi bi-check2-circle" aria-hidden="true"></i>${escapeHTML(t('ok'))}`;
    }
    return badge;
  };

  const updateStockTotals = (record) => {
    const sums = { opening: 0, received: 0, total: 0, issue: 0, closing: 0 };
    record.stock.forEach((row) => {
      const opening = num(row.opening);
      const received = num(row.received);
      const issue = num(row.issue);
      sums.opening += opening;
      sums.received += received;
      sums.total += opening + received;
      sums.issue += issue;
      sums.closing += opening + received - issue;
    });
    $('#sOpening').textContent = sums.opening.toLocaleString('en-US');
    $('#sReceived').textContent = sums.received.toLocaleString('en-US');
    $('#sTotal').textContent = sums.total.toLocaleString('en-US');
    $('#sIssue').textContent = sums.issue.toLocaleString('en-US');
    $('#sClosing').textContent = sums.closing.toLocaleString('en-US');
  };

  const visibleProducts = () => {
    const term = catalogFilters.search.trim().toLowerCase();
    let list = db.products.filter((product) => {
      if (catalogFilters.unit !== 'all' && product.unit !== catalogFilters.unit) return false;
      if (!term) return true;
      return product.name.toLowerCase().includes(term);
    });

    switch (catalogFilters.sort) {
      case 'rate-desc':
        list = list.slice().sort((a, b) => num(b.rate) - num(a.rate) || collator.compare(a.name, b.name));
        break;
      case 'rate-asc':
        list = list.slice().sort((a, b) => num(a.rate) - num(b.rate) || collator.compare(a.name, b.name));
        break;
      case 'recent':
        list = list.slice().sort((a, b) => num(b.id) - num(a.id));
        break;
      default:
        list = list.slice().sort((a, b) => collator.compare(a.name, b.name));
    }
    return list;
  };

  const renderCatalog = () => {
    const record = currentMonthData();
    const body = $('#catalog tbody');
    const fragment = document.createDocumentFragment();
    const list = visibleProducts();

    if (!list.length) {
      const row = document.createElement('tr');
      row.className = 'empty-row';
      const cell = document.createElement('td');
      cell.colSpan = 8;
      cell.textContent = t('filteredCount', 0, db.products.length);
      row.appendChild(cell);
      fragment.appendChild(row);
    }

    list.forEach((product) => {
      const row = document.createElement('tr');

      const selectCell = document.createElement('td');
      selectCell.className = 'select-column';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'product-checkbox h-4 w-4 rounded border-gray-300 text-purple-700 focus:ring-2 focus:ring-purple-500';
      checkbox.checked = Boolean(record.requisition[product.id]);
      checkbox.dataset.productId = String(product.id);
      checkbox.setAttribute('aria-label', `Add ${product.name} to requisition`);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          record.requisition[product.id] = { qty: 1 };
          if (db.syncIssue) applyIssueSync(record, product.id, 1);
        } else {
          delete record.requisition[product.id];
          if (db.syncIssue) applyIssueSync(record, product.id, 0);
        }
        afterChange();
      });
      selectCell.appendChild(checkbox);

      const nameCell = document.createElement('td');
      nameCell.className = 'font-semibold text-gray-800';
      nameCell.textContent = product.name;

      const unitCell = document.createElement('td');
      unitCell.textContent = product.unit;

      const piecesCell = document.createElement('td');
      piecesCell.className = 'num';
      piecesCell.appendChild(makeTableInput({
        type: 'number',
        min: '0',
        step: '1',
        value: product.pieces ?? '',
        placeholder: '—',
        ariaLabel: `Pieces per box for ${product.name}`,
        onChange: (input) => {
          product.pieces = input.value;
          scheduleSave();
        }
      }));

      const rateCell = document.createElement('td');
      rateCell.className = 'num';
      rateCell.appendChild(makeTableInput({
        type: 'number',
        min: '0',
        step: '0.01',
        value: String(num(product.rate)),
        ariaLabel: `Retail rate per ${product.unit} for ${product.name}`,
        onChange: (input) => {
          product.rate = Math.max(0, num(input.value));
          renderReq();
          renderKPIs();
          scheduleSave();
        }
      }));

      const minCell = document.createElement('td');
      minCell.className = 'num';
      minCell.appendChild(makeTableInput({
        type: 'number',
        min: '0',
        step: '1',
        value: product.minStock ? String(product.minStock) : '',
        placeholder: '0',
        ariaLabel: `Minimum stock level for ${product.name}`,
        onChange: (input) => {
          product.minStock = clampQty(input.value);
          renderStock();
          renderKPIs();
          renderAlerts();
          scheduleSave();
        }
      }));

      const expiryCell = document.createElement('td');
      const expiryInput = document.createElement('input');
      expiryInput.type = 'date';
      expiryInput.value = product.expiry || '';
      expiryInput.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 expiry-input';
      expiryInput.setAttribute('aria-label', `Expiry date for ${product.name}`);
      const days = daysUntil(product.expiry);
      if (days !== null && days < 0) expiryInput.classList.add('is-expired');
      else if (days !== null && days <= EXPIRY_WARNING_DAYS) expiryInput.classList.add('is-soon');
      expiryInput.addEventListener('change', () => {
        product.expiry = expiryInput.value;
        renderCatalog();
        renderKPIs();
        renderAlerts();
        scheduleSave();
      });
      expiryCell.appendChild(expiryInput);

      const deleteCell = document.createElement('td');
      deleteCell.className = 'no-print';
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'table-action';
      deleteButton.innerHTML = '<i class="bi bi-trash3" aria-hidden="true"></i><span>Delete</span>';
      deleteButton.setAttribute('aria-label', `Delete ${product.name} permanently`);
      deleteButton.addEventListener('click', async () => {
        const ok = await askConfirm(t('deleteProductConfirm', product.name));
        if (!ok) return;
        removeProduct(product.id);
      });
      deleteCell.appendChild(deleteButton);

      row.append(selectCell, nameCell, unitCell, piecesCell, rateCell, minCell, expiryCell, deleteCell);
      fragment.appendChild(row);
    });

    body.replaceChildren(fragment);

    const countNode = $('#catalogCount');
    if (list.length !== db.products.length) {
      countNode.textContent = t('filteredCount', list.length, db.products.length);
    } else {
      countNode.textContent = t('productsCount', db.products.length);
    }
  };

  const makeTableInput = ({ type, min, step, value, placeholder = '', ariaLabel, onChange }) => {
    const input = document.createElement('input');
    input.type = type;
    if (min !== undefined) input.min = min;
    if (step !== undefined) input.step = step;
    input.value = value;
    if (placeholder) input.placeholder = placeholder;
    input.className = 'table-input border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500';
    input.setAttribute('aria-label', ariaLabel);
    input.addEventListener('change', () => onChange(input));
    return input;
  };

  const renderMonths = () => {
    const list = $('#monthList');
    if (!list) return;
    const factory = currentFactory();
    const months = Object.keys(factory.months).sort().reverse();

    if (!months.length) {
      list.innerHTML = `<li class="empty-note">${escapeHTML(t('noMonths'))}</li>`;
    } else {
      list.innerHTML = months.map((month) => {
        const record = factory.months[month];
        const items = Object.keys(record.requisition || {}).length;
        const total = requisitionTotal(record);
        const active = month === db.activeMonth ? ' is-current' : '';
        return `
          <li>
            <button type="button" class="month-button${active}" data-month="${month}">
              <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${escapeHTML(monthLabel(month))}</span>
              <span class="month-meta">${items} items · ৳ ${money(total)}</span>
            </button>
          </li>`;
      }).join('');

      $$('[data-month]', list).forEach((button) => {
        button.addEventListener('click', () => {
          db.activeMonth = button.dataset.month;
          renderAll();
          scheduleSave();
          $('#historyDialog').close();
        });
      });
    }

    const movement = $('#movementList');
    if (!movement) return;
    const entries = db.movement.filter((entry) => entry.factory === db.activeFactory).slice(0, 60);
    if (!entries.length) {
      movement.innerHTML = `<li class="empty-note">${escapeHTML(t('noMovement'))}</li>`;
    } else {
      movement.innerHTML = entries.map((entry) => {
        const dir = entry.direction === 'in' ? ' is-in' : entry.direction === 'out' ? ' is-out' : '';
        const qty = entry.qty === null || entry.qty === undefined ? '' : ` <span class="movement-qty${dir}">${entry.qty}</span>`;
        return `
          <li>
            <span class="movement-time">${escapeHTML(formatDateTime(entry.t))}</span>
            <span>${escapeHTML(entry.text)}${qty}</span>
            <span></span>
          </li>`;
      }).join('');
    }
  };

  /* ----------------------------------------------------------------------
     9. Change pipeline
     ---------------------------------------------------------------------- */
  const afterChange = () => {
    renderReq();
    renderStock();
    renderCatalog();
    renderKPIs();
    renderAlerts();
    renderContext();
    renderMonths();
    scheduleSave();
  };

  /* ----------------------------------------------------------------------
     10. Actions
     ---------------------------------------------------------------------- */
  const addProduct = (event) => {
    event.preventDefault();
    const name = $('#newName').value.trim();
    if (!name) {
      $('#newName').focus();
      setStatus(t('productName'), 'error');
      return;
    }
    if (db.products.some((product) => product.name.toLowerCase() === name.toLowerCase())) {
      setStatus(`${name} — ${t('colProduct')}`, 'error');
      return;
    }

    const nextId = db.products.reduce((max, product) => Math.max(max, num(product.id)), 0) + 1;
    const product = {
      id: nextId,
      name,
      unit: $('#newUnit').value === 'Pcs' ? 'Pcs' : 'Box',
      pieces: $('#newPieces').value,
      rate: Math.max(0, num($('#newRate').value)),
      minStock: clampQty($('#newMinStock').value),
      expiry: $('#newExpiry').value || ''
    };
    db.products.push(product);

    Object.values(currentFactory().months).forEach((record) => {
      if (!stockRowFor(record, product.id)) {
        record.stock.push({
          productId: product.id,
          name: product.name,
          opening: 0,
          received: 0,
          issue: 0,
          remarks: '',
          issueLocked: false
        });
      }
    });

    logMovement({ kind: 'product', text: t('productAdded', name) });
    $('#productForm').reset();
    $('#newUnit').value = 'Box';
    afterChange();
  };

  const removeProduct = (productId) => {
    const product = findProduct(productId);
    db.products = db.products.filter((item) => String(item.id) !== String(productId));

    Object.values(db.factories).forEach((factory) => {
      Object.values(factory.months).forEach((record) => {
        delete record.requisition[productId];
        record.stock = record.stock.filter((row) => String(row.productId) !== String(productId));
      });
    });

    if (product) logMovement({ kind: 'product', text: t('productDeleted', product.name) });
    afterChange();
  };

  const rollForward = async () => {
    const previous = previousMonth(db.activeMonth);
    if (!previous || !currentFactory().months[previous]) {
      setStatus(t('noPreviousMonth'), 'error');
      return;
    }

    const ok = await askConfirm(t('rollForwardConfirm', monthLabel(db.activeMonth)));
    if (!ok) return;

    const record = currentMonthData();
    const source = currentFactory().months[previous];
    record.stock.forEach((row) => {
      const match = source.stock.find((item) => String(item.productId) === String(row.productId));
      if (match) row.opening = Math.max(0, closingOf(match));
    });

    logMovement({ kind: 'rollback', text: `${t('rolledForward')} (${monthLabel(previous)})` });
    afterChange();
    setStatus(t('rolledForward'), 'success');
  };

  const selectAllVisible = () => {
    const record = currentMonthData();
    let changed = false;
    visibleProducts().forEach((product) => {
      if (!record.requisition[product.id]) {
        record.requisition[product.id] = { qty: 1 };
        if (db.syncIssue) applyIssueSync(record, product.id, 1);
        changed = true;
      }
    });
    if (changed) afterChange();
    else setStatus(t('notSelected'));
  };

  const clearAllSelected = async () => {
    const record = currentMonthData();
    if (!Object.keys(record.requisition).length) {
      setStatus(t('notSelected'));
      return;
    }
    const ok = await askConfirm(t('clearAllConfirm'));
    if (!ok) return;
    record.requisition = {};
    if (db.syncIssue) {
      record.stock.forEach((row) => {
        if (!row.issueLocked) row.issue = 0;
      });
    }
    afterChange();
  };

  const applyBulkQty = () => {
    const record = currentMonthData();
    if (!Object.keys(record.requisition).length) {
      setStatus(t('notSelected'), 'error');
      return;
    }
    const input = $('#bulkQty');
    const qty = clampQty(input ? input.value : 0);
    if (qty < 1) {
      setStatus(t('qtyInvalid'), 'error');
      return;
    }
    Object.keys(record.requisition).forEach((id) => {
      record.requisition[id] = { qty };
      if (db.syncIssue) applyIssueSync(record, id, qty);
    });
    afterChange();
  };

  const exportExcel = () => {
    if (!window.XLSX) {
      setStatus('Excel engine not loaded.', 'error');
      return;
    }

    const record = currentMonthData();
    const meta = currentFactoryMeta();
    const generatedOn = formatDateTime(new Date().toISOString());
    const signature = record.signature || { name: '', title: '' };
    const letterDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date()).replace(/\//g, '.');

    const requisitionRows = [
      [letterDate],
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
      ['Report No:', record.reportNo || '', '', `Status: ${record.approval.toUpperCase()}`],
      ['Sl No.', 'Name', 'Amount', 'Price (BDT)']
    ];

    let serial = 0;
    let total = 0;
    selectedProducts(record).forEach((product) => {
      const item = record.requisition[product.id];
      const qty = clampQty(typeof item === 'object' ? item.qty : item);
      const amount = qty * num(product.rate);
      total += amount;
      serial += 1;
      requisitionRows.push([serial, product.name, `${pad(qty)} ${product.unit.toLowerCase()}`, amount]);
    });

    requisitionRows.push(['', '', 'Total =', total]);
    requisitionRows.push(
      [],
      ['With Best Regards'],
      [],
      [signature.name],
      [signature.title],
      ['SIM Group'],
      [],
      [`Generated: ${generatedOn}`]
    );

    const stockRows = [
      [`${meta.name} (Medical Department)`],
      ['Medicine Stock Report'],
      [`For the month of ${monthLabel(db.activeMonth)}`],
      [`Report No: ${record.reportNo || ''}`, '', '', `Status: ${record.approval.toUpperCase()}`],
      [],
      ['Sl No.', 'Name of Medicine', 'Opening Stock', 'Received', 'Total', 'Issue', 'Closing Stock', 'Remarks']
    ];

    const totals = { opening: 0, received: 0, total: 0, issue: 0, closing: 0 };
    record.stock.forEach((row, index) => {
      const product = findProduct(row.productId);
      const opening = num(row.opening);
      const received = num(row.received);
      const issue = num(row.issue);
      const rowTotal = opening + received;
      const closing = rowTotal - issue;
      totals.opening += opening;
      totals.received += received;
      totals.total += rowTotal;
      totals.issue += issue;
      totals.closing += closing;
      stockRows.push([index + 1, product ? product.name : row.name, opening, received, rowTotal, issue, closing, row.remarks || '']);
    });
    stockRows.push(['', 'Total =', totals.opening, totals.received, totals.total, totals.issue, totals.closing, '']);

    const workbook = XLSX.utils.book_new();
    const requisitionSheet = XLSX.utils.aoa_to_sheet(requisitionRows);
    const stockSheet = XLSX.utils.aoa_to_sheet(stockRows);

    requisitionSheet['!cols'] = [{ wch: 8 }, { wch: 38 }, { wch: 14 }, { wch: 16 }];
    requisitionSheet['!pageSetup'] = { paperSize: 9, orientation: 'portrait', fitToWidth: 1 };
    requisitionSheet['!margins'] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };

    const letterRows = [0, 1, 2, 3, 4, 6, 8, 9, 11];
    const signatureStart = requisitionRows.length - 7;
    const signatureRows = Array.from({ length: 7 }, (_, index) => signatureStart + index);
    requisitionSheet['!merges'] = [...letterRows, ...signatureRows]
      .filter((row) => row >= 0 && row < requisitionRows.length)
      .map((row) => ({ s: { r: row, c: 0 }, e: { r: row, c: 3 } }));

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

    const styleTable = (sheet, headerRow, totalRow, columnCount) => {
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
    };

    styleTable(requisitionSheet, 12, requisitionRows.length - 8, 4);
    styleTable(stockSheet, 5, stockRows.length - 1, 8);

    XLSX.utils.book_append_sheet(workbook, requisitionSheet, 'Requisition');
    XLSX.utils.book_append_sheet(workbook, stockSheet, 'Stock Report');
    XLSX.writeFile(workbook, `SIM_Medical_${slug(meta.name)}_${db.activeMonth}_${record.approval}.xlsx`);
    setStatus(t('excelDone'), 'success');
  };

  const exportBackup = () => {
    const payload = {
      app: 'sim-medical-portal',
      version: 3,
      exportedAt: new Date().toISOString(),
      data: db
    };
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadFile(`sim-medical-backup-${stamp}.json`, JSON.stringify(payload, null, 2));
    logMovement({ kind: 'backup', text: t('backupLog') });
    scheduleSave();
    setStatus(t('backupDone'), 'success');
  };

  const importBackup = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const candidate = payload && payload.data ? payload.data : payload;
      if (!normaliseDatabase(candidate)) {
        setStatus(t('restoreInvalid'), 'error');
        return;
      }
      pendingRestore = candidate;
      const ok = await askConfirm(t('restoreConfirm'));
      if (!ok) {
        pendingRestore = null;
        return;
      }
      db = pendingRestore;
      pendingRestore = null;
      logMovement({ kind: 'restore', text: t('restoreLog') });
      saveNow();
      renderAll();
      setStatus(t('restoreDone'), 'success');
    } catch (error) {
      setStatus(t('restoreInvalid'), 'error');
    }
  };

  const changeApproval = (value) => {
    const record = currentMonthData();
    record.approval = value;
    const key = `status${value.charAt(0).toUpperCase()}${value.slice(1)}`;
    logMovement({ kind: 'approval', text: t('approvalChanged', t(key)) });
    renderContext();
    renderMonths();
    scheduleSave();
  };

  const changeMonth = (value) => {
    if (!/^\d{4}-\d{2}$/.test(value || '')) return;
    db.activeMonth = value;
    const existed = Boolean(currentFactory().months[value]);
    currentMonthData();
    if (!existed) {
      const previous = previousMonth(value);
      if (previous && currentFactory().months[previous]) {
        logMovement({ kind: 'month', text: t('monthCreated', monthLabel(value)) });
      }
    }
    renderAll();
    scheduleSave();
  };

  /* ----------------------------------------------------------------------
     11. Tabs
     ---------------------------------------------------------------------- */
  const showTab = (id) => {
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
  };

  /* ----------------------------------------------------------------------
     12. Wiring
     ---------------------------------------------------------------------- */
  const wireEvents = () => {
    $$('.tab-button').forEach((button) => {
      button.addEventListener('click', () => showTab(button.dataset.tabTarget));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const tabs = $$('.tab-button');
        const index = tabs.indexOf(button);
        const next = event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        showTab(tabs[next].dataset.tabTarget);
      });
    });

    $('#saveButton').addEventListener('click', () => saveNow());

    $('#excelButton').addEventListener('click', exportExcel);

    $('#printButton').addEventListener('click', () => {
      renderContext();
      window.setTimeout(() => window.print(), 60);
    });

    $('#backupButton').addEventListener('click', exportBackup);

    $('#restoreButton').addEventListener('click', () => $('#restoreInput').click());
    $('#restoreInput').addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = '';
      importBackup(file);
    });

    $('#historyButton').addEventListener('click', () => {
      renderMonths();
      const dialog = $('#historyDialog');
      if (typeof dialog.showModal === 'function') dialog.showModal();
    });

    $('#productForm').addEventListener('submit', addProduct);

    $('#reqMonth').addEventListener('change', (event) => changeMonth(event.target.value));
    $('#stockMonth').addEventListener('change', (event) => changeMonth(event.target.value));

    $('#factorySelect').addEventListener('change', (event) => {
      db.activeFactory = event.target.value;
      currentMonthData();
      renderAll();
      scheduleSave();
    });

    $('#langSelect').addEventListener('change', (event) => {
      db.lang = event.target.value === 'bn' ? 'bn' : 'en';
      renderAll();
      scheduleSave();
    });

    $('#approvalSelect').addEventListener('change', (event) => changeApproval(event.target.value));

    $('#syncIssueToggle').checked = db.syncIssue !== false;
    $('#syncIssueToggle').addEventListener('change', (event) => {
      db.syncIssue = event.target.checked;
      if (db.syncIssue) {
        const record = currentMonthData();
        record.stock.forEach((row) => {
          const item = record.requisition[row.productId];
          row.issueLocked = false;
          row.issue = item ? clampQty(typeof item === 'object' ? item.qty : item) : 0;
        });
        setStatus(t('syncOn'), 'success');
      }
      afterChange();
    });

    $('#rollForwardButton').addEventListener('click', rollForward);
    $('#selectAllVisible').addEventListener('click', selectAllVisible);
    $('#clearAllSelected').addEventListener('click', clearAllSelected);
    $('#applyQtyButton').addEventListener('click', applyBulkQty);

    const signature = currentMonthData().signature || {};
    $('#signNameInput').value = signature.name || 'Dr. Rashna Mahjabin Tonni';
    $('#signTitleInput').value = signature.title || 'Sr. Medical Officer';

    $('#signNameInput').addEventListener('input', (event) => {
      currentMonthData().signature.name = event.target.value;
      updateSignature();
      scheduleSave();
    });
    $('#signTitleInput').addEventListener('input', (event) => {
      currentMonthData().signature.title = event.target.value;
      updateSignature();
      scheduleSave();
    });

    $('#catalogSearch').addEventListener('input', (event) => {
      catalogFilters.search = event.target.value;
      renderCatalog();
    });
    $('#catalogUnitFilter').addEventListener('change', (event) => {
      catalogFilters.unit = event.target.value;
      renderCatalog();
    });
    $('#catalogSort').addEventListener('change', (event) => {
      catalogFilters.sort = event.target.value;
      renderCatalog();
    });

    $$('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => {
        const dialog = button.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    $('#confirmAccept').addEventListener('click', () => closeConfirm(true));
    const confirmDialog = $('#confirmDialog');
    if (confirmDialog) {
      confirmDialog.addEventListener('close', () => {
        if (confirmResolver) {
          const resolve = confirmResolver;
          confirmResolver = null;
          resolve(false);
        }
      });
      confirmDialog.addEventListener('click', (event) => {
        if (event.target === confirmDialog) closeConfirm(false);
      });
    }

    const historyDialog = $('#historyDialog');
    if (historyDialog) {
      historyDialog.addEventListener('click', (event) => {
        if (event.target === historyDialog) historyDialog.close();
      });
    }

    document.addEventListener('keydown', (event) => {
      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveNow();
      }
      if (meta && event.key.toLowerCase() === 'p') {
        renderContext();
      }
      if (event.key === 'Escape') {
        $$('dialog[open]').forEach((dialog) => dialog.close());
      }
    });

    window.addEventListener('beforeunload', () => {
      if (saveTimer) saveNow({ silent: true });
    });
  };

  const updateSignature = () => {
    const signature = currentMonthData().signature || {};
    const name = (signature.name || '').trim() || 'Dr. Rashna Mahjabin Tonni';
    const title = (signature.title || '').trim() || 'Sr. Medical Officer';
    $$('[data-sign-name]').forEach((node) => { node.textContent = name; });
    $$('[data-sign-title]').forEach((node) => { node.textContent = title; });
  };

  const populateFactories = () => {
    const select = $('#factorySelect');
    select.innerHTML = FACTORIES
      .map((factory) => `<option value="${factory.id}">${escapeHTML(factory.name)}</option>`)
      .join('');
  };

  /* ----------------------------------------------------------------------
     13. Boot
     ---------------------------------------------------------------------- */
  const init = () => {
    loadDatabase();
    populateFactories();
    wireEvents();

    const record = currentMonthData();
    const signature = record.signature || {};
    $('#signNameInput').value = signature.name || 'Dr. Rashna Mahjabin Tonni';
    $('#signTitleInput').value = signature.title || 'Sr. Medical Officer';

    renderAll();
    updateSignature();

    if (!storageAvailable()) {
      setStatus(t('storageError'), 'error');
    } else if (!readJSON(DB_KEY)) {
      saveNow({ silent: true });
    }

    setStatus(`${t('savedAt')} · ${new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date())}`, 'success');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
