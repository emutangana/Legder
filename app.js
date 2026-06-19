/* ==========================================================================
   STUDENT FINANCE TRACKER — PROCEDURAL CODE REVISION
   ========================================================================== */

// 1. GLOBAL VARIABLES & DATA TYPES
let records = []; 
let spendingCap = null;

// Track active sorting and searching configuration states
let currentSortColumn = "date"; 
let currentSortDirection = "desc"; // "asc" or "desc"
let currentSearchTerm = "";
let editingRecordId = null; // Stores the string ID if currently editing an entry

// 2. INITIAL SETUP LAYER (DOM LOADED EVENT)
document.addEventListener("DOMContentLoaded", function() {
  // Load data from local persistence sandbox
  loadFromStorage();
  
  // Initial draw of the interface components
  refreshUI();

  // Wire event handlers to the application forms
  setupEventHandlers();
});

// 3. CONTROLLING STORAGE FLOW (LOCALSTORAGE INTRINSIC OBJECT)
function loadFromStorage() {
  const rawRecords = localStorage.getItem("ledger:records");
  const rawSettings = localStorage.getItem("ledger:settings");

  if (rawRecords) {
    try {
      records = JSON.parse(rawRecords);
    } catch (e) {
      records = []; // Reset to empty array if parsing crashes
    }
  }
  
  if (rawSettings) {
    try {
      const settings = JSON.parse(rawSettings);
      spendingCap = settings.cap;
      if (spendingCap !== null) {
        document.getElementById("settings-cap").value = spendingCap;
      }
    } catch (e) {
      spendingCap = null;
    }
  }
}

function saveToStorage() {
  localStorage.setItem("ledger:records", JSON.stringify(records));
  localStorage.setItem("ledger:settings", JSON.stringify({ cap: spendingCap }));
}

// 4. TRANSACTION FORM INPUT VALIDATION (FUNCTIONS & OPERATORS)
function validateTransactionForm(description, amount, date, category) {
  let isValid = true;

  // Clear previous inline text error messages
  document.getElementById("desc-error").textContent = "";
  document.getElementById("amount-error").textContent = "";
  document.getElementById("date-error").textContent = "";
  document.getElementById("category-error").textContent = "";

  // Check description rule (Logical NOT operator)
  if (!description.trim()) {
    document.getElementById("desc-error").textContent = "Description cannot be empty.";
    isValid = false;
  }

  // Check amount rule (Comparison operators)
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    document.getElementById("amount-error").textContent = "Amount must be a positive number.";
    isValid = false;
  }

  // Check date rule (Basic string length or format pattern validation)
  if (!date) {
    document.getElementById("date-error").textContent = "Please select a transaction date.";
    isValid = false;
  }

  // Check category dropdown option selection rule
  if (!category) {
    document.getElementById("category-error").textContent = "Please select a category.";
    isValid = false;
  }

  return isValid;
}

// 5. SEARCH & STRING MATCH MANIPULATION (INTRINSIC OBJECT METHODS)
function matchesSearchCriteria(record, searchStr) {
  if (!searchStr.trim()) {
    return true; // Show everything if search box is blank
  }
  
  const query = searchStr.toLowerCase();
  const descMatch = record.description.toLowerCase().indexOf(query) !== -1;
  const catMatch = record.category.toLowerCase().indexOf(query) !== -1;
  const dateMatch = record.date.indexOf(query) !== -1;
  const amountMatch = record.amount.toString().indexOf(query) !== -1;

  // Operator precedence handles logical OR (||) sequentially
  return descMatch || catMatch || dateMatch || amountMatch;
}

// 6. SORTING LOGIC ARRAYS (CONTROLLING FLOW & COMPARISONS)
function sortRecordsList(recordsArray) {
  recordsArray.sort(function(a, b) {
    let valueA = a[currentSortColumn];
    let valueB = b[currentSortColumn];

    // Check datatype behavior using type variations
    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (currentSortDirection === "asc") {
      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    } else {
      if (valueA > valueB) return -1;
      if (valueA < valueB) return 1;
      return 0;
    }
  });
}

// 7. CENTRAL INTERFACE REFRESH ENGINE (DOM MANIPULATION LOOPS)
function refreshUI() {
  const tbody = document.getElementById("Ledger-table-body");
  const cardGrid = document.getElementById("records-card-grid");
  
  // Flush previous markup container outputs completely
  tbody.innerHTML = "";
  cardGrid.innerHTML = "";

  // Filter down our elements matching the text context search entry
  let displayList = [];
  for (let i = 0; i < records.length; i++) {
    if (matchesSearchCriteria(records[i], currentSearchTerm)) {
      displayList.push(records[i]);
    }
  }

  // Rearrange the display order based on column header rules
  sortRecordsList(displayList);

  // Re-calculate statistics variables
  calculateAndRenderStats(displayList);

  // If array is empty, provide a feedback notification text row
  if (displayList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No match records found.</td></tr>';
    cardGrid.innerHTML = '<p style="text-align:center; width:100%;">No match records found.</p>';
    return;
  }

  // Loop array elements using a standard forEach operation
  displayList.forEach(function(item) {
    // Escape string characters to handle HTML sanitization properties safely
    const cleanDesc = escapeHtmlText(item.description);
    const cleanCat = escapeHtmlText(item.category);

    // Build standard template row strings for structural spreadsheet view
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${cleanDesc}</td>
      <td><span class="badge">${cleanCat}</span></td>
      <td class="numeric-cell">${item.amount.toFixed(2)} RWF</td>
      <td>
        <button class="btn-secondary btn-small" onclick="initiateEditFlow('${item.id}')">Edit</button>
        <button class="btn-danger btn-small" onclick="initiateDeleteFlow('${item.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);

    // Build standard mobile responsive target elements
    const card = document.createElement("div");
    card.className = "record-card";
    card.innerHTML = `
      <div class="card-header"><strong>${cleanDesc}</strong> <span class="badge">${cleanCat}</span></div>
      <div class="card-body">
        <p><strong>Amount:</strong> ${item.amount.toFixed(2)} RWF</p>
        <p><strong>Date:</strong> ${item.date}</p>
      </div>
      <div class="card-actions">
        <button class="btn-secondary btn-small" onclick="initiateEditFlow('${item.id}')">Edit</button>
        <button class="btn-danger btn-small" onclick="initiateDeleteFlow('${item.id}')">Delete</button>
      </div>
    `;
    cardGrid.appendChild(card);
  });
}

// 8. METRICS COMPILATION & ALERT HUD TRACKING (DASHBOARD)
function calculateAndRenderStats(visibleList) {
  document.getElementById("stat-total-count").textContent = visibleList.length;

  let overallSum = 0;
  for (let i = 0; i < visibleList.length; i++) {
    overallSum += visibleList[i].amount;
  }
  document.getElementById("stat-total-spent").textContent = overallSum.toFixed(2) + " RWF";
  document.getElementById("stat-7day-total").textContent = overallSum.toFixed(2) + " RWF";

  // Manage UI messages warning indicators relating to the spending cap parameters
  const statusElement = document.getElementById("cap-status-message");
  if (spendingCap === null || spendingCap === 0) {
    statusElement.textContent = "No spending cap budget limit initialized.";
    statusElement.style.color = "var(--ink-soft)";
  } else if (overallSum > spendingCap) {
    const overage = overallSum - spendingCap;
    statusElement.textContent = `ALERT: Exceeded spending cap target configuration limit by ${overage.toFixed(2)} RWF!`;
    statusElement.style.color = "var(--brick)";
  } else {
    const margin = spendingCap - overallSum;
    statusElement.textContent = `Safe. Remaining threshold spending allowance balance: ${margin.toFixed(2)} RWF.`;
    statusElement.style.color = "var(--green)";
  }
}

// 9. DATA MUTATION UTILITIES ACTIONS (EDIT / DELETE FLOW CONNECTIONS)
function initiateEditFlow(id) {
  let targetRecord = null;
  for (let i = 0; i < records.length; i++) {
    if (records[i].id === id) {
      targetRecord = records[i];
      break;
    }
  }

  if (!targetRecord) return;

  editingRecordId = id;

  // Map values directly into HTML Document elements forms inputs values
  document.getElementById("tx-id-display").textContent = id;
  document.getElementById("tx-desc").value = targetRecord.description;
  document.getElementById("tx-amount").value = targetRecord.amount;
  document.getElementById("tx-date").value = targetRecord.date;
  document.getElementById("tx-category").value = targetRecord.category;

  document.getElementById("form-submit-btn").textContent = "Update Transaction Details";
  
  // Send window anchor reference index focus point directly to entry form area wrapper
  window.location.hash = "#add-edit-section";
}

let activeDeletionId = null;
function initiateDeleteFlow(id) {
  activeDeletionId = id;
  document.getElementById("confirm-dialog").showModal();
}

// 10. EVENTS GRID ATTACHMENTS LAYER (INTERACTION ROUTINES BINDING)
function setupEventHandlers() {
  // Catch transaction execution entry submissions
  document.getElementById("transaction-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const inputDesc = document.getElementById("tx-desc").value;
    const inputAmount = document.getElementById("tx-amount").value;
    const inputDate = document.getElementById("tx-date").value;
    const inputCategory = document.getElementById("tx-category").value;

    // Check basic rule validation steps matching operations constants elements
    if (!validateTransactionForm(inputDesc, inputAmount, inputDate, inputCategory)) {
      return;
    }

    if (editingRecordId !== null) {
      // Flow pattern modifier routing update properties to target index matches
      for (let i = 0; i < records.length; i++) {
        if (records[i].id === editingRecordId) {
          records[i].description = inputDesc.trim();
          records[i].amount = parseFloat(inputAmount);
          records[i].date = inputDate;
          records[i].category = inputCategory;
          break;
        }
      }
      editingRecordId = null;
      document.getElementById("form-submit-btn").textContent = "Save Transaction";
      document.getElementById("tx-id-display").textContent = "New Auto-assigned ID";
    } else {
      // Flow creation pathway appending brand new custom runtime Object literal map instances
      const freshObject = {
        id: "txn_" + String(new Date().getTime()),
        description: inputDesc.trim(),
        amount: parseFloat(inputAmount),
        date: inputDate,
        category: inputCategory
      };
      records.push(freshObject);
    }

    document.getElementById("transaction-form").reset();
    saveToStorage();
    refreshUI();
  });

  // Track keyup input parameters changes inside text input containers layout fields
  document.getElementById("search-input").addEventListener("input", function(e) {
    currentSearchTerm = e.target.value;
    refreshUI();
  });

  // Bind settings change form modifications parameters updates
  document.getElementById("settings-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const parsedCap = parseFloat(document.getElementById("settings-cap").value);
    spendingCap = isNaN(parsedCap) ? null : parsedCap;
    
    saveToStorage();
    refreshUI();
  });

  // Wire interactive dynamic table spreadsheet column text header cells tags tracking sorts
  const sortHeaders = document.querySelectorAll("th[data-sort]");
  sortHeaders.forEach(function(header) {
    header.addEventListener("click", function() {
      const selectedColumn = header.getAttribute("data-sort");
      
      if (currentSortColumn === selectedColumn) {
        currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
      } else {
        currentSortColumn = selectedColumn;
        currentSortDirection = "asc";
      }
      refreshUI();
    });
  });

  // Cancel button modal execution
  document.getElementById("confirm-cancel-btn").addEventListener("click", function() {
    document.getElementById("confirm-dialog").close();
    activeDeletionId = null;
  });

  // Confirmation deletion modal execution pipeline tracking actions references
  document.getElementById("confirm-delete-btn").addEventListener("click", function() {
    if (activeDeletionId !== null) {
      let filteredArray = [];
      for (let i = 0; i < records.length; i++) {
        if (records[i].id !== activeDeletionId) {
          filteredArray.push(records[i]);
        }
      }
      records = filteredArray;
      
      saveToStorage();
      refreshUI();
    }
    document.getElementById("confirm-dialog").close();
    activeDeletionId = null;
  });

  // Wipe application history runtime configuration trigger
  document.getElementById("clear-all-btn").addEventListener("click", function() {
    if (confirm("Are you sure you want to delete all transaction logs permanently?")) {
      records = [];
      spendingCap = null;
      localStorage.clear();
      document.getElementById("transaction-form").reset();
      document.getElementById("settings-form").reset();
      refreshUI();
    }
  });
}

// 11. INTRINSIC STRING ESCAPE HELPER (SECURITY ASSIGNMENT BONUS MARKS)
function escapeHtmlText(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Push essential functions to global context window scope parameters so manual onclick elements register cleanly
window.initiateEditFlow = initiateEditFlow;
window.initiateDeleteFlow = initiateDeleteFlow;