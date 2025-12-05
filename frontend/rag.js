// Revision 2: RAG module initialized
let network = null;
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let processCount = 0;
let resourceCount = 0;

function initRAG() {
    const container = document.getElementById('rag-network');
    const data = { nodes: nodes, edges: edges };
    const options = {
        nodes: {
            shape: 'box',
            font: { size: 16 }
        },
        edges: {
            arrows: 'to',
            smooth: { type: 'cubicBezier' }
        },
        physics: {
            enabled: true,
            stabilization: { iterations: 100 }
        },
        manipulation: {
            enabled: true,
            addEdge: function (data, callback) {
                if (data.from === data.to) {
                    alert("Self-loops are not allowed.");
                    return;
                }
                // Check if edge already exists
                const exists = edges.get({
                    filter: function (item) {
                        return item.from === data.from && item.to === data.to;
                    }
                });
                if (exists.length > 0) {
                    alert("Edge already exists.");
                    return;
                }

                // Determine edge type based on nodes
                const fromNode = nodes.get(data.from);
                const toNode = nodes.get(data.to);

                if (fromNode.group === toNode.group) {
                    alert("Cannot connect same type nodes directly.");
                    return;
                }

                data.label = fromNode.group === 'process' ? 'Request' : 'Assign';
                callback(data);
            }
        }
    };

    network = new vis.Network(container, data, options);

    // Event Listeners
    document.getElementById('rag-add-process').addEventListener('click', addProcess);
    document.getElementById('rag-add-resource').addEventListener('click', addResource);
    document.getElementById('rag-reset').addEventListener('click', resetRAG);
    document.getElementById('rag-check').addEventListener('click', checkDeadlockRAG);
}

function addProcess() {
    processCount++;
    nodes.add({
        id: `P${processCount}`,
        label: `P${processCount}`,
        group: 'process',
        color: { background: '#3b82f6', border: '#2563eb' },
        font: { color: 'white' },
        shape: 'ellipse'
    });
}

function addResource() {
    resourceCount++;
    nodes.add({
        id: `R${resourceCount}`,
        label: `R${resourceCount}`,
        group: 'resource',
        color: { background: '#10b981', border: '#059669' },
        font: { color: 'white' },
        shape: 'box'
    });
}

function resetRAG() {
    nodes.clear();
    edges.clear();
    processCount = 0;
    resourceCount = 0;
    updateStatus("Graph reset. Ready to build.", "normal");
}

function checkDeadlockRAG() {
    // Simple Cycle Detection for Single Instance Resource Types
    // Build adjacency list
    const adj = {};
    const allNodes = nodes.get();

    allNodes.forEach(node => {
        adj[node.id] = [];
    });

    const allEdges = edges.get();
    allEdges.forEach(edge => {
        if (adj[edge.from]) {
            adj[edge.from].push(edge.to);
        }
    });

    // DFS for Cycle Detection
    const visited = new Set();
    const recStack = new Set();
    let cycleFound = false;

    function isCyclic(nodeId) {
        if (recStack.has(nodeId)) return true;
        if (visited.has(nodeId)) return false;

        visited.add(nodeId);
        recStack.add(nodeId);

        const neighbors = adj[nodeId] || [];
        for (const neighbor of neighbors) {
            if (isCyclic(neighbor)) return true;
        }

        recStack.delete(nodeId);
        return false;
    }

    for (const node of allNodes) {
        if (isCyclic(node.id)) {
            cycleFound = true;
            break;
        }
    }

    if (cycleFound) {
        updateStatus("Deadlock Detected! Cycle found in the graph.", "error");
    } else {
        updateStatus("No Deadlock Detected. System is safe.", "success");
    }
}

function updateStatus(msg, type) {
    const statusEl = document.getElementById('rag-message');
    statusEl.textContent = msg;
    statusEl.className = ''; // reset
    if (type === 'error') statusEl.style.color = 'var(--danger-color)';
    else if (type === 'success') statusEl.style.color = 'var(--success-color)';
    else statusEl.style.color = 'var(--text-color)';
}
