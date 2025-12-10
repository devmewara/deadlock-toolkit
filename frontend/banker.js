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
    }
}

initBanker();
