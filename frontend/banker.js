function initBanker() {
    document.getElementById('banker-generate').addEventListener('click', generateBankerTables);
    document.getElementById('banker-check').addEventListener('click', checkSafeState);
}

function generateBankerTables() {
    const pCount = parseInt(document.getElementById('banker-processes').value);
    const rCount = parseInt(document.getElementById('banker-resources').value);

    createTable('banker-allocation', pCount, rCount);
    createTable('banker-max', pCount, rCount);
    createTable('banker-available', 1, rCount);

    document.getElementById('banker-tables').style.display = 'grid';
    document.getElementById('banker-actions').style.display = 'block';
    document.getElementById('banker-output').innerHTML = '';
    document.getElementById('banker-output').className = 'output-panel';
}

function createTable(id, rows, cols) {
    const table = document.getElementById(id);
    table.innerHTML = '';

    // Header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th></th>';
    for (let j = 0; j < cols; j++) {
        headerRow.innerHTML += `<th>R${j}</th>`;
    }
    table.appendChild(headerRow);

    // Rows
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${rows === 1 ? 'Avail' : 'P' + i}</td>`;
        for (let j = 0; j < cols; j++) {
            row.innerHTML += `<td><input type="number" class="table-input" value="0" min="0"></td>`;
        }
        table.appendChild(row);
    }
}

function getTableData(id) {
    const table = document.getElementById(id);
    const data = [];
    const rows = table.querySelectorAll('tr');

    // Skip header
    for (let i = 1; i < rows.length; i++) {
        const rowData = [];
        const inputs = rows[i].querySelectorAll('input');
        inputs.forEach(input => rowData.push(parseInt(input.value) || 0));
        data.push(rowData);
    }
    return data;
}

function checkSafeState() {
    const allocation = getTableData('banker-allocation');
    const max = getTableData('banker-max');
    const available = getTableData('banker-available')[0];

    const pCount = allocation.length;
    const rCount = available.length;

    // Calculate Need
    const need = [];
    for (let i = 0; i < pCount; i++) {
        const row = [];
        for (let j = 0; j < rCount; j++) {
            row.push(max[i][j] - allocation[i][j]);
        }
        need.push(row);
    }

    // Safety Algorithm
    const work = [...available];
    const finish = new Array(pCount).fill(false);
    const safeSequence = [];
    let found;

    do {
        found = false;
        for (let p = 0; p < pCount; p++) {
            if (!finish[p]) {
                let canAllocate = true;
                for (let r = 0; r < rCount; r++) {
                    if (need[p][r] > work[r]) {
                        canAllocate = false;
                        break;
                    }
                }

                if (canAllocate) {
                    for (let r = 0; r < rCount; r++) {
                        work[r] += allocation[p][r];
                    }
                    finish[p] = true;
                    safeSequence.push(`P${p}`);
                    found = true;
                }
            }
        }
    } while (found);

    const output = document.getElementById('banker-output');
    if (finish.every(f => f)) {
        output.innerHTML = `<h3>Safe State!</h3><p>Safe Sequence: ${safeSequence.join(' -> ')}</p>`;
        output.className = 'output-panel success';
    } else {
        output.innerHTML = `<h3>Unsafe State!</h3><p>System is in a deadlock-prone state.</p>`;
        output.className = 'output-panel error';
    }
}
