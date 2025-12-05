function initDetection() {
    document.getElementById('detect-generate').addEventListener('click', generateDetectionTables);
    document.getElementById('detect-check').addEventListener('click', detectDeadlock);
}

function generateDetectionTables() {
    const pCount = parseInt(document.getElementById('detect-processes').value);
    const rCount = parseInt(document.getElementById('detect-resources').value);

    createTable('detect-allocation', pCount, rCount);
    createTable('detect-request', pCount, rCount);
    createTable('detect-available', 1, rCount);

    document.getElementById('detect-tables').style.display = 'grid';
    document.getElementById('detect-actions').style.display = 'block';
    document.getElementById('detect-output').innerHTML = '';
    document.getElementById('detect-output').className = 'output-panel';
    document.getElementById('recovery-panel').style.display = 'none';
}

function detectDeadlock() {
    const allocation = getTableData('detect-allocation');
    const request = getTableData('detect-request');
    const available = getTableData('detect-available')[0];

    const pCount = allocation.length;
    const rCount = available.length;

    // Detection Algorithm (similar to Banker's but with Request instead of Need)
    const work = [...available];
    const finish = new Array(pCount).fill(false);

    // Mark processes with zero allocation as finished (optimistic assumption for some variants, 
    // but standard algorithm checks if Request <= Work)
    // Actually, for detection: 
    // 1. Work = Available
    // 2. For all i, if Allocation[i] != 0, Finish[i] = false, else true.

    for (let i = 0; i < pCount; i++) {
        let hasAlloc = false;
        for (let j = 0; j < rCount; j++) {
            if (allocation[i][j] > 0) {
                hasAlloc = true;
                break;
            }
        }
        finish[i] = !hasAlloc;
    }

    let found;
    do {
        found = false;
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
                    for (let r = 0; r < rCount; r++) {
                        work[r] += allocation[p][r];
                    }
                    finish[p] = true;
                    found = true;
                }
            }
        }
    } while (found);

    const deadlockedProcesses = [];
    for (let i = 0; i < pCount; i++) {
        if (!finish[i]) deadlockedProcesses.push(i);
    }

    const output = document.getElementById('detect-output');
    const recoveryPanel = document.getElementById('recovery-panel');
    const victimList = document.getElementById('victim-list');

    if (deadlockedProcesses.length > 0) {
        output.innerHTML = `<h3>Deadlock Detected!</h3><p>Deadlocked Processes: ${deadlockedProcesses.map(p => 'P' + p).join(', ')}</p>`;
        output.className = 'output-panel error';

        // Show Recovery Options
        recoveryPanel.style.display = 'block';
        victimList.innerHTML = '';
        deadlockedProcesses.forEach(p => {
            const btn = document.createElement('button');
            btn.textContent = `Terminate P${p}`;
            btn.onclick = () => terminateProcess(p);
            victimList.appendChild(btn);
        });

    } else {
        output.innerHTML = `<h3>No Deadlock</h3><p>System is in a safe state.</p>`;
        output.className = 'output-panel success';
        recoveryPanel.style.display = 'none';
    }
}

function terminateProcess(pIndex) {
    // Reset Allocation and Request for victim
    const allocTable = document.getElementById('detect-allocation');
    const reqTable = document.getElementById('detect-request');
    const availTable = document.getElementById('detect-available');

    // Return resources to Available
    const allocInputs = allocTable.rows[pIndex + 1].querySelectorAll('input');
    const availInputs = availTable.rows[1].querySelectorAll('input');

    allocInputs.forEach((input, rIndex) => {
        const val = parseInt(input.value) || 0;
        const currentAvail = parseInt(availInputs[rIndex].value) || 0;
        availInputs[rIndex].value = currentAvail + val;
        input.value = 0;
    });

    // Clear Request
    const reqInputs = reqTable.rows[pIndex + 1].querySelectorAll('input');
    reqInputs.forEach(input => input.value = 0);

    // Re-run detection
    detectDeadlock();
}
