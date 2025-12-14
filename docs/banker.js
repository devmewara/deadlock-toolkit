// ============================
// ⭐ BANKER'S ALGORITHM MODULE
// ============================

function initBanker() {
    document.getElementById("banker-generate").addEventListener("click", generateBankerTables);
    document.getElementById("banker-check").addEventListener("click", checkSafeState);
}

// ----------------------------
// Generate All Tables
// ----------------------------
function generateBankerTables() {
    const p = parseInt(document.getElementById("banker-processes").value);
    const r = parseInt(document.getElementById("banker-resources").value);

    createTable("banker-allocation", p, r, "P");
    createTable("banker-max", p, r, "P");
    createTable("banker-need", p, r, "P", true); // auto-filled
    createTable("banker-available", 1, r, "Avail");

    document.getElementById("banker-tables").style.display = "grid";
    document.getElementById("banker-actions").style.display = "block";
    document.getElementById("banker-output").innerHTML = "";

    attachLiveUpdateListeners();
    updateNeedMatrix();
}

// ----------------------------
// Create Any Table
// ----------------------------
function createTable(id, rows, cols, rowPrefix, disabled = false) {
    const table = document.getElementById(id);
    table.innerHTML = "";

    // Header
    let tr = document.createElement("tr");
    tr.innerHTML = "<th></th>";
    for (let j = 0; j < cols; j++) tr.innerHTML += `<th>R${j}</th>`;
    table.appendChild(tr);

    // Body
    for (let i = 0; i < rows; i++) {
        tr = document.createElement("tr");
        tr.innerHTML = `<td>${rowPrefix}${i}</td>`;

        for (let j = 0; j < cols; j++) {
            tr.innerHTML += `<td><input type="number" value="0" min="0" 
                class="table-input" ${disabled ? "disabled" : ""}></td>`;
        }
        table.appendChild(tr);
    }
}

// ----------------------------
// Read Table Values
// ----------------------------
function getTable(id) {
    const rows = [...document.getElementById(id).querySelectorAll("tr")].slice(1);
    return rows.map(row =>
        [...row.querySelectorAll("input")].map(inp => parseInt(inp.value) || 0)
    );
}

// ----------------------------
// AUTO UPDATE: NEED MATRIX
// ----------------------------
function updateNeedMatrix() {
    const alloc = getTable("banker-allocation");
    const max = getTable("banker-max");
    const needTable = document.getElementById("banker-need");

    const p = alloc.length;
    const r = alloc[0].length;

    let rows = needTable.querySelectorAll("tr");
    rows = [...rows].slice(1);

    for (let i = 0; i < p; i++) {
        const inputs = rows[i].querySelectorAll("input");
        for (let j = 0; j < r; j++) {
            inputs[j].value = Math.max(max[i][j] - alloc[i][j], 0);
        }
    }
}

// ----------------------------
// Add Listeners for LIVE Updates
// ----------------------------
function attachLiveUpdateListeners() {
    const allocationInputs = document.querySelectorAll("#banker-allocation input");
    const maxInputs = document.querySelectorAll("#banker-max input");

    allocationInputs.forEach(inp => inp.addEventListener("input", updateNeedMatrix));
    maxInputs.forEach(inp => inp.addEventListener("input", updateNeedMatrix));
}

// ----------------------------
// SAFE STATE CHECK
// ----------------------------
function checkSafeState() {
    const allocation = getTable("banker-allocation");
    const max = getTable("banker-max");
    const need = getTable("banker-need");
    let available = getTable("banker-available")[0];

    const p = allocation.length;
    const r = available.length;

    let finish = new Array(p).fill(false);
    let safeSeq = [];

    // SAFETY LOOP
    let progress = true;
    while (progress) {
        progress = false;

        for (let i = 0; i < p; i++) {
            if (!finish[i]) {
                let canRun = true;
                for (let j = 0; j < r; j++) {
                    if (need[i][j] > available[j]) {
                        canRun = false;
                        break;
                    }
                }

                if (canRun) {
                    for (let j = 0; j < r; j++) {
                        available[j] += allocation[i][j];
                    }
                    finish[i] = true;
                    safeSeq.push(`P${i}`);
                    progress = true;
                }
            }
        }
    }

    const out = document.getElementById("banker-output");

    if (finish.every(x => x)) {
        out.className = "output-panel success";
        out.innerHTML = `
            <h3>Safe State ✓</h3>
            <p>Safe Sequence: ${safeSeq.join(" → ")}</p>
        `;
    } else {
        out.className = "output-panel error";
        out.innerHTML = `
            <h3>UNSAFE STATE ⚠️</h3>
            <p>The system is deadlock-prone.</p>
        `;

        // Show Interactive Recovery Button
        renderRecoveryButton();
    }
}

/* -------------------------
   INTERACTIVE RECOVERY LOGIC (Banker's)
---------------------------- */

function renderRecoveryButton() {
    const out = document.getElementById("banker-output");

    // Prevent duplicate buttons
    if (document.getElementById("recovery-container")) return;

    const container = document.createElement("div");
    container.id = "recovery-container";
    container.style.marginTop = "15px";
    container.style.borderTop = "1px solid #eee";
    container.style.paddingTop = "10px";

    container.innerHTML = `
        <button id="btn-resolve" class="btn warning">Resolve Deadlock</button>
        <div id="recovery-strategies" style="display:none; margin-top:10px; background:#fafafa; padding:10px; border-radius:4px; border:1px solid #ddd;">
            <p style="margin:0 0 10px 0; font-weight:bold;">Select Recovery Strategy:</p>
            <button id="btn-max" class="btn danger" style="margin-right:5px; font-size:0.9em;">Terminate Process (Max Allocated)</button>
            <button id="btn-preempt" class="btn" style="background:#8e44ad; color:white; font-size:0.9em;">Preempt 1 Resource & Retry</button>
        </div>
        <div id="recovery-log-area"></div>
    `;
    out.appendChild(container);

    document.getElementById("btn-resolve").addEventListener("click", function () {
        this.style.display = "none";
        document.getElementById("recovery-strategies").style.display = "block";
    });

    document.getElementById("btn-max").addEventListener("click", () => applyBankerRecovery("terminate"));
    document.getElementById("btn-preempt").addEventListener("click", () => applyBankerRecovery("preempt"));
}

function applyBankerRecovery(strategy) {
    const alloc = getTable("banker-allocation");

    // 1. Identify Victim (Process holding max resources)
    let victimIdx = -1;
    let maxResources = -1;

    alloc.forEach((row, i) => {
        const sum = row.reduce((a, b) => a + b, 0);
        // We only target processes that actually hold resources
        if (sum > maxResources && sum > 0) {
            maxResources = sum;
            victimIdx = i;
        }
    });

    if (victimIdx === -1) {
        alert("System holds 0 allocated resources. Nothing to recover.");
        return;
    }

    // 2. Apply Strategy
    const allocTable = document.getElementById("banker-allocation");
    const availTable = document.getElementById("banker-available");
    const needTable = document.getElementById("banker-need");
    const logArea = document.getElementById("recovery-log-area");

    const allocInputs = allocTable.rows[victimIdx + 1].querySelectorAll("input");
    const needInputs = needTable.rows[victimIdx + 1].querySelectorAll("input");
    const availInputs = availTable.rows[1].querySelectorAll("input");

    let actionMsg = "";

    if (strategy === "terminate") {
        // TERMINATE: Release ALL resources
        allocInputs.forEach((inp, r) => {
            const val = parseInt(inp.value) || 0;
            const avail = parseInt(availInputs[r].value) || 0;
            availInputs[r].value = avail + val; // Return to Avail
            inp.value = 0; // Clear Alloc
            needInputs[r].value = 0; // Clear Need
        });

        // Visual Tag
        const rowLabel = allocTable.rows[victimIdx + 1].cells[0];
        if (!rowLabel.innerHTML.includes("Terminated")) {
            rowLabel.innerHTML += " <span style='color:red; font-size:0.8em;'>(Terminated)</span>";
        }
        actionMsg = `Simulated Termination of <strong>P${victimIdx}</strong>. All resources released.`;

    } else if (strategy === "preempt") {
        // PREEMPT: Release 1 unit of the most abundant resource held by victim
        let bestR = -1;
        let maxRVal = -1;

        allocInputs.forEach((inp, r) => {
            const val = parseInt(inp.value) || 0;
            if (val > maxRVal) {
                maxRVal = val;
                bestR = r;
            }
        });

        if (bestR !== -1) {
            const currentAlloc = parseInt(allocInputs[bestR].value);
            const currentAvail = parseInt(availInputs[bestR].value);
            const currentNeed = parseInt(needInputs[bestR].value);

            allocInputs[bestR].value = currentAlloc - 1;
            availInputs[bestR].value = currentAvail + 1;
            // IMPORTANT: If we take away a resource, the process NEEDS it back to finish!
            needInputs[bestR].value = currentNeed + 1;

            actionMsg = `Simulated Preemption: Took 1 unit of R${bestR} from <strong>P${victimIdx}</strong>.`;
        } else {
            actionMsg = `Could not preempt from P${victimIdx} (Allocation empty).`;
        }
    }

    // 3. Log Action
    const logEntry = document.createElement("div");
    logEntry.style.marginTop = "10px";
    logEntry.style.padding = "8px";
    logEntry.style.background = "#f0f4f8";
    logEntry.style.borderLeft = "4px solid #3498db";
    logEntry.innerHTML = `${actionMsg}`;

    // 4. Verify Safety Post-Action
    const safetyResult = verifySafetyAfterRecovery();

    if (safetyResult.safe) {
        logEntry.innerHTML += `<br><span style="color:green; font-weight:bold;">✓ Deadlock Resolved successfully.</span>`;
        logEntry.innerHTML += `<br><span style="font-size:0.9em;">Safe Sequence: ${safetyResult.sequence.join(" → ")}</span>`;
        document.getElementById("recovery-strategies").style.display = "none";
    } else {
        logEntry.innerHTML += `<br><span style="color:red; font-weight:bold;">⚠️ Still Unsafe.</span> <span style="font-size:0.9em;">Try further recovery.</span>`;
    }

    logArea.appendChild(logEntry);
}

function verifySafetyAfterRecovery() {
    // Re-read current table state
    const allocation = getTable("banker-allocation");
    const need = getTable("banker-need");
    let available = getTable("banker-available")[0];

    const p = allocation.length;
    const r = available.length;
    let finish = new Array(p).fill(false);
    let safeSeq = [];
    let progress = true;

    // Safety Algorithm
    while (progress) {
        progress = false;
        for (let i = 0; i < p; i++) {
            if (!finish[i]) {
                let canRun = true;
                for (let j = 0; j < r; j++) {
                    if (need[i][j] > available[j]) {
                        canRun = false;
                        break;
                    }
                }

                if (canRun) {
                    for (let j = 0; j < r; j++) available[j] += allocation[i][j];
                    finish[i] = true;
                    safeSeq.push(`P${i}`);
                    progress = true;
                }
            }
        }
    }

    return {
        safe: finish.every(x => x),
        sequence: safeSeq
    };
}

initBanker();
