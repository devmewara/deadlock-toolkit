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
    document.getElementById('recovery-panel').style.display = 'none';
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

    const pCount = allocation.length;
    const rCount = available.length;

    const work = [...available];
    const finish = new Array(pCount).fill(false);

    // Step 1: Mark processes with all-zero Allocation as finished
    for (let i = 0; i < pCount; i++) {
        let hasAlloc = allocation[i].some(val => val > 0);
        finish[i] = !hasAlloc;
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

    const output = document.getElementById('detect-output');
    const recoveryPanel = document.getElementById('recovery-panel');
    const victimList = document.getElementById('victim-list');

    if (deadlocked.length > 0) {
        output.innerHTML = `
            <h3>⚠️ Deadlock Detected!</h3>
            <p>Deadlocked Processes: <strong>${deadlocked.map(i => `P${i}`).join(', ')}</strong></p>
        `;
        output.className = 'output-panel error';

        // Show recovery options
        recoveryPanel.style.display = 'block';
        victimList.innerHTML = '';

        deadlocked.forEach(p => {
            const btn = document.createElement('button');
            btn.className = "btn danger";
            btn.textContent = `Terminate P${p}`;
            btn.onclick = () => terminateProcess(p);
            victimList.appendChild(btn);
        });

    } else {
        output.innerHTML = `
            <h3>✓ No Deadlock</h3>
            <p>The system is in a safe state.</p>
        `;
        output.className = 'output-panel success';
        recoveryPanel.style.display = 'none';
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
