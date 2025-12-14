// Revision 5: Complete Detection Module with fixed row labels, clean UI layout, and recovery

function initDetection() {
    document.getElementById('detect-generate').addEventListener('click', generateDetectionTables);
    document.getElementById('detect-check').addEventListener('click', detectDeadlock);
}

/* -------------------------
   TABLE GENERATION MODULE
---------------------------- */

function createTable(id, rows, cols, labelPrefix = "P") {
    const table = document.getElementById(id);
    table.innerHTML = '';

    // Header
    const header = document.createElement('tr');
    header.innerHTML = '<th></th>';
    for (let j = 0; j < cols; j++) {
        header.innerHTML += `<th>R${j}</th>`;
    }
    table.appendChild(header);

    // Body Rows
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');

        // Row Label
        const rowLabel = rows === 1 ? "Avail" : `${labelPrefix}${i}`;
        row.innerHTML = `<td>${rowLabel}</td>`;

        for (let j = 0; j < cols; j++) {
            row.innerHTML += `
                <td><input type="number" class="table-input" value="0" min="0"></td>
            `;
        }

        table.appendChild(row);
    }
}

function generateDetectionTables() {
    const pCount = parseInt(document.getElementById('detect-processes').value);
    const rCount = parseInt(document.getElementById('detect-resources').value);

    // Proper labels
    createTable('detect-allocation', pCount, rCount, "P");
    createTable('detect-request', pCount, rCount, "P");
    createTable('detect-available', 1, rCount, "Avail");

    document.getElementById('detect-tables').style.display = 'grid';
    document.getElementById('detect-actions').style.display = 'block';
    document.getElementById('detect-output').innerHTML = '';
    document.getElementById('detect-output').className = 'output-panel';
    if (document.getElementById('recovery-panel')) {
        document.getElementById('recovery-panel').style.display = 'none';
    }
}

/* -------------------------
   READ TABLE DATA
---------------------------- */

function getTableData(id) {
    const table = document.getElementById(id);
    const rows = table.querySelectorAll('tr');
    const result = [];

    // Skip header row (index 0)
    for (let i = 1; i < rows.length; i++) {
        const inputs = rows[i].querySelectorAll('input');
        const rowData = [];
        inputs.forEach(inp => rowData.push(parseInt(inp.value) || 0));
        result.push(rowData);
    }

    return result;
}

/* -------------------------
   DEADLOCK DETECTION LOGIC
---------------------------- */

function detectDeadlock() {
    const allocation = getTableData('detect-allocation');
    const request = getTableData('detect-request');
    const available = getTableData('detect-available')[0];

    const result = runDetectionAlgorithm(allocation, request, available);
    const { deadlocked, safeSequence } = result;

    const output = document.getElementById('detect-output');
    const recoveryPanel = document.getElementById('recovery-panel');
    const victimList = document.getElementById('victim-list');

    // Clear previous highlights
    updateDeadlockHighlights([]);

    if (deadlocked.length > 0) {
        output.innerHTML = `
            <h3>⚠️ Deadlock Detected!</h3>
            <p>Deadlocked Processes: <strong>${deadlocked.map(i => `P${i}`).join(', ')}</strong></p>
        `;
        output.className = 'output-panel error';

        // Create Resolve UI
        const resolveContainer = document.createElement('div');
        resolveContainer.id = "resolve-container";
        resolveContainer.style.marginTop = "15px";
        resolveContainer.innerHTML = `
            <button id="btn-auto-resolve" class="btn warning" style="width:100%;">
                Auto Resolve Deadlock
            </button>
            <div id="sim-log"></div>
        `;
        output.appendChild(resolveContainer);

        // Handler: Auto Resolve
        document.getElementById('btn-auto-resolve').addEventListener('click', function () {
            this.style.display = 'none'; // Hide button after click
            updateDeadlockHighlights(deadlocked); // Highlight
            applyComprehensiveRecovery(deadlocked);
        });

    } else {
        output.innerHTML = `
            <h3>✓ No Deadlock</h3>
            <p>The system is in a safe state.</p>
            <p>Safe Sequence: ${safeSequence.join(" → ")}</p>
        `;
        output.className = 'output-panel success';
        if (recoveryPanel) recoveryPanel.style.display = 'none';
    }
}

function runDetectionAlgorithm(allocation, request, available) {
    const pCount = allocation.length;
    const rCount = available.length;

    const work = [...available];
    const finish = new Array(pCount).fill(false);
    const safeSequence = [];

    // Step 1: Mark processes with all-zero Allocation as finished
    for (let i = 0; i < pCount; i++) {
        let hasAlloc = allocation[i].some(val => val > 0);
        if (!hasAlloc) {
            finish[i] = true;
        }
    }

    // Step 2: Try to satisfy requests
    let progress;
    do {
        progress = false;

        for (let p = 0; p < pCount; p++) {
            if (!finish[p]) {
                let canGrant = true;

                for (let r = 0; r < rCount; r++) {
                    if (request[p][r] > work[r]) {
                        canGrant = false;
                        break;
                    }
                }

                if (canGrant) {
                    // Pretend to finish process & release resources
                    for (let r = 0; r < rCount; r++) {
                        work[r] += allocation[p][r];
                    }

                    finish[p] = true;
                    safeSequence.push(`P${p}`);
                    progress = true;
                }
            }
        }
    } while (progress);

    // Identify deadlocked processes
    const deadlocked = [];
    for (let i = 0; i < pCount; i++) {
        if (!finish[i]) deadlocked.push(i);
    }

    return { deadlocked, safeSequence };
}

/* -------------------------
   SIMULATED RECOVERY LOGIC
---------------------------- */

/* -------------------------
   INTERACTIVE RECOVERY LOGIC (Detection)
---------------------------- */

function renderDetectionRecovery(deadlocked) {
    const output = document.getElementById('detect-output');

    // Prevent duplicates
    if (document.getElementById('sim-recovery-container')) return;

    const container = document.createElement('div');
    container.id = 'sim-recovery-container';
    container.style.marginTop = '15px';
    container.style.borderTop = '1px dashed #ccc';
    container.style.paddingTop = '10px';

    container.innerHTML = `
        <button id="btn-auto-resolve" class="btn warning">Auto-Resolve Deadlock</button>
        <div id="sim-strategies" style="display:none; margin-top:10px; background:#fff3cd; padding:10px; border-radius:4px;">
             <p style="margin:0 0 10px 0;"><strong>Recommended Strategy:</strong> Terminate process holding maximum resources.</p>
             <button id="btn-execute-sim" class="btn danger">Execute Simulation</button>
        </div>
        <div id="sim-log"></div>
    `;
    output.appendChild(container);

    document.getElementById('btn-auto-resolve').addEventListener('click', function () {
        this.style.display = 'none';
        document.getElementById('sim-strategies').style.display = 'block';
    });

    document.getElementById('btn-execute-sim').addEventListener('click', () => {
        applyDetectionRecovery(deadlocked);
    });
}

function applyComprehensiveRecovery(deadlockedIndices) {
    const logArea = document.getElementById('sim-log');

    // Retrieve data for explanation and logic
    const allocation = getTableData('detect-allocation');
    const request = getTableData('detect-request');
    const explanationText = explainDeadlock(deadlockedIndices, request, allocation);

    // 1. Select Victim (Strategy: Max Allocated Resources)
    let victimIdx = -1;
    let maxResources = -1;

    deadlockedIndices.forEach(idx => {
        // Ensure values are numbers to avoid concatenation
        const held = allocation[idx].reduce((a, b) => Number(a) + Number(b), 0);
        if (held > maxResources) {
            maxResources = held;
            victimIdx = idx;
        }
    });

    if (victimIdx === -1) victimIdx = deadlockedIndices[0];

    // 2. Perform Virtual Updates
    const allocTable = document.getElementById('detect-allocation');
    const reqTable = document.getElementById('detect-request');
    const availTable = document.getElementById('detect-available');

    const allocInputs = allocTable.rows[victimIdx + 1].querySelectorAll('input');
    const reqInputs = reqTable.rows[victimIdx + 1].querySelectorAll('input');
    const availInputs = availTable.rows[1].querySelectorAll('input');

    // Calculate resources to release for reporting
    let releasedResourcesStr = [];
    allocInputs.forEach((input, rIndex) => {
        const val = parseInt(input.value) || 0;
        if (val > 0) releasedResourcesStr.push(`${val} of R${rIndex}`);

        // Update Available
        const currentAvail = parseInt(availInputs[rIndex].value) || 0;
        availInputs[rIndex].value = currentAvail + val;
        // Zero out Allocation
        input.value = 0;
    });

    // Clear Requests
    reqInputs.forEach(input => input.value = 0);

    // Mark as Terminated
    const rowLabel = allocTable.rows[victimIdx + 1].cells[0];
    if (!rowLabel.innerText.includes("(Terminated)")) {
        rowLabel.innerHTML += " <span style='color:red; font-size:0.8em;'>(Terminated)</span>";
    }

    // 3. Re-run Detection
    const newAlloc = getTableData('detect-allocation');
    const newReq = getTableData('detect-request');
    const newAvail = getTableData('detect-available')[0];
    const result = runDetectionAlgorithm(newAlloc, newReq, newAvail);

    // Update highlights
    updateDeadlockHighlights(result.deadlocked);

    // 4. Generate 5-Step Report
    const logEntry = document.createElement('div');
    logEntry.style.marginTop = "15px";
    logEntry.style.background = "#fff";
    logEntry.style.border = "1px solid #e2e8f0";
    logEntry.style.borderRadius = "8px";
    logEntry.style.padding = "20px";
    logEntry.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";

    let html = `<h3 style="margin-top:0; color:#3b82f6;">Recovery Execution Report</h3>`;

    // Step 1: Explanation
    html += `
    <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
        <strong>Step 1: Deadlock Explanation</strong><br>
        <span style="color:#64748b; font-style:italic;">${explanationText}</span>
    </div>`;

    // Step 2: Victim Selection
    html += `
    <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
        <strong>Step 2: Victim Selection Strategy</strong><br>
        Policy: <em>Choose process holding maximum allocated resources.</em><br>
        Selected Victim: <strong>P${victimIdx}</strong> (Held ${maxResources === 0 ? 'no' : maxResources} total resources).
    </div>`;

    // Step 3: Virtual Termination
    html += `
    <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
        <strong>Step 3: Virtual Termination</strong><br>
        <span style="color:#ef4444;">Process P${victimIdx} marked as Terminated.</span> Request queue cleared.
    </div>`;

    // Step 4: Resource Release
    const releasedText = releasedResourcesStr.length > 0 ? releasedResourcesStr.join(", ") : "No resources held";
    html += `
    <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #eee;">
        <strong>Step 4: Resource Release</strong><br>
        Resources reclaimed: ${releasedText}.<br>
        <em>Allocation & Request tables updated. Available matrix increased.</em>
    </div>`;

    // Step 5: Validation
    if (result.deadlocked.length === 0) {
        html += `
        <div style="color: #10b981; font-weight:bold;">
            Step 5: Validation (Success) ✅<br>
            Deadlock successfully resolved.<br>
            <span style="font-weight:normal; color:#333;">Safe Sequence: ${result.safeSequence.join(" → ")}</span>
        </div>`;
    } else {
        html += `
        <div style="color: #ef4444; font-weight:bold;">
             Step 5: Validation (Incomplete) ⚠️<br>
             Deadlock persists with remaining processes: ${result.deadlocked.map(i => `P${i}`).join(', ')}.<br>
             <button id="btn-continue-resolve" class="btn warning" style="margin-top:10px; font-size:0.8rem;">Attempt Next Recovery</button>
        </div>`;
    }

    logEntry.innerHTML = html;
    logArea.innerHTML = ""; // Clear previous
    logArea.appendChild(logEntry);

    // Bind continue button if exists
    const contBtn = document.getElementById('btn-continue-resolve');
    if (contBtn) {
        contBtn.onclick = () => {
            updateDeadlockHighlights(result.deadlocked);
            applyComprehensiveRecovery(result.deadlocked);
        };
    }
}

/* -------------------------
   RECOVERY: TERMINATE PROCESS
---------------------------- */

function terminateProcess(pIndex) {
    const allocTable = document.getElementById('detect-allocation');
    const reqTable = document.getElementById('detect-request');
    const availTable = document.getElementById('detect-available');

    const allocInputs = allocTable.rows[pIndex + 1].querySelectorAll('input');
    const availInputs = availTable.rows[1].querySelectorAll('input');

    // Release resources from terminated process
    allocInputs.forEach((input, rIndex) => {
        const val = parseInt(input.value) || 0;
        const currentAvail = parseInt(availInputs[rIndex].value) || 0;

        availInputs[rIndex].value = currentAvail + val;
        input.value = 0;
    });

    // Clear requests
    const reqInputs = reqTable.rows[pIndex + 1].querySelectorAll('input');
    reqInputs.forEach(input => input.value = 0);

    // Re-run detection after recovery
    detectDeadlock();
}

function explainDeadlock(deadlocked, request, allocation) {
    for (let i of deadlocked) {
        for (let r = 0; r < request[0].length; r++) {
            // If P[i] is requesting R[r]
            if (request[i][r] > 0) {
                // Find a deadlocked process P[k] holding R[r]
                for (let k of deadlocked) {
                    if (i !== k && allocation[k][r] > 0) {
                        return `Analysis: Circular wait detected. P${i} is waiting for R${r}, which is currently held by P${k}.`;
                    }
                }
            }
        }
    }
    return "Analysis: A subset of processes is waiting for resources held by each other in a cyclic manner.";
}

function updateDeadlockHighlights(deadlockedIndices) {
    // 1. Clear existing
    document.querySelectorAll('.deadlocked-row').forEach(row => row.classList.remove('deadlocked-row'));

    // 2. Add new
    if (deadlockedIndices.length > 0) {
        const allocTable = document.getElementById('detect-allocation');
        const reqTable = document.getElementById('detect-request');

        deadlockedIndices.forEach(idx => {
            if (allocTable.rows[idx + 1]) allocTable.rows[idx + 1].classList.add('deadlocked-row');
            if (reqTable.rows[idx + 1]) reqTable.rows[idx + 1].classList.add('deadlocked-row');
        });
    }
}
