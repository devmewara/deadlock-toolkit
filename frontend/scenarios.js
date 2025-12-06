// Revision 5: Scenarios module updated with revision tracking comment
function initScenarios() {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.scenario-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-scenario');
            document.getElementById(`${target}-scenario`).classList.add('active');
        });
    });

    // Dining Philosophers
    document.getElementById('dining-start').addEventListener('click', startDining);
    document.getElementById('dining-reset').addEventListener('click', resetDining);

    // Traffic
    document.getElementById('traffic-start').addEventListener('click', startTraffic);
    document.getElementById('traffic-deadlock').addEventListener('click', causeTrafficDeadlock);
    document.getElementById('traffic-reset').addEventListener('click', resetTraffic);
}

// --- Dining Philosophers ---
let diningInterval;
const diningCanvas = document.getElementById('dining-canvas');
const dCtx = diningCanvas.getContext('2d');
const philosophers = 5;
// State includes: thinking, hungry, holding_left, eating
const pState = new Array(philosophers).fill('thinking');
const forks = new Array(philosophers).fill(true); // true = available

function drawDining() {
    dCtx.clearRect(0, 0, diningCanvas.width, diningCanvas.height);
    const cx = diningCanvas.width / 2;
    const cy = diningCanvas.height / 2;
    const radius = 100;

    // Define color mapping for the new states
    const statusMap = {
        'thinking': { color: '#3b82f6', label: 'Thinking' },
        'hungry': { color: '#f59e0b', label: 'Hungry' }, // Switched to Orange/Warning
        'holding_left': { color: '#ef4444', label: 'BLOCKED' }, // New Deadlock-Prone State (Red/Danger)
        'eating': { color: '#10b981', label: 'Eating' }
    };

    // Draw Table
    dCtx.beginPath();
    dCtx.arc(cx, cy, radius + 40, 0, 2 * Math.PI);
    dCtx.fillStyle = '#e2e8f0';
    dCtx.fill();
    dCtx.stroke();

    for (let i = 0; i < philosophers; i++) {
        const angle = (i * 2 * Math.PI) / philosophers - Math.PI / 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;

        const stateData = statusMap[pState[i]];

        // Draw Philosopher
        dCtx.beginPath();
        dCtx.arc(px, py, 25, 0, 2 * Math.PI);
        dCtx.fillStyle = stateData.color;
        dCtx.fill();
        dCtx.fillStyle = 'white';
        dCtx.fillText(`P${i}`, px - 5, py + 5);

        // Draw state text
        dCtx.fillStyle = 'black';
        dCtx.fillText(stateData.label, px - 20, py + 40);

        // Draw Fork (between i and i+1)
        const fAngle = angle + Math.PI / philosophers;
        const fx = cx + Math.cos(fAngle) * (radius - 40);
        const fy = cy + Math.sin(fAngle) * (radius - 40);

        dCtx.beginPath();
        dCtx.arc(fx, fy, 5, 0, 2 * Math.PI);
        dCtx.fillStyle = forks[i] ? 'black' : '#cbd5e1'; // Black if available, gray if taken
        dCtx.fill();
    }
}

// Function to manage philosopher state transitions in the deadlock-prone model
function managePhilosopher(i) {
    const left = i;
    const right = (i + 1) % philosophers;

    switch (pState[i]) {
        case 'thinking':
            // 1. Thinking -> Hungry (Randomly decide to get hungry)
            if (Math.random() < 0.05) {
                pState[i] = 'hungry';
            }
            break;

        case 'hungry':
            // 2. Hungry -> Holding_Left (Try to grab the left fork)
            if (forks[left]) {
                forks[left] = false; // Acquire left fork
                pState[i] = 'holding_left';
            }
            // If fork is not available, stays 'hungry' and waits
            break;

        case 'holding_left':
            // 3. Holding_Left -> Eating (Try to grab the right fork)
            if (forks[right]) {
                forks[right] = false; // Acquire right fork
                pState[i] = 'eating';
                // Set a timer for the eating duration
                setTimeout(() => {
                    // Release both forks after eating
                    forks[left] = true;
                    forks[right] = true;
                    pState[i] = 'thinking'; // Go back to thinking
                    // Re-draw immediately after state change to make the release visible
                    drawDining();
                }, 2000); // Eats for 2 seconds
            }
            // If the right fork is NOT available, the philosopher remains in 'holding_left' 
            // and is now BLOCKED (Deadlock condition is achieved when all are in this state).
            break;

        case 'eating':
            // Stays in 'eating' until the timeout releases them
            break;
    }
}


function startDining() {
    if (diningInterval) clearInterval(diningInterval);
    document.getElementById('dining-status').textContent = "Simulation Running...";
    document.getElementById('dining-status').className = 'status-text';

    // Reset state before starting
    pState.fill('thinking');
    forks.fill(true);

    const runSimulation = () => {
        // Run logic for all philosophers
        for (let i = 0; i < philosophers; i++) {
            managePhilosopher(i);
        }

        // Check for deadlock (All philosophers holding left fork and waiting for right)
        // We exclude 'eating' state because an eating philosopher will eventually release resources.
        const allHoldingLeft = pState.every(state => state === 'holding_left');

        if (allHoldingLeft) {
            clearInterval(diningInterval);
            diningInterval = null;
            document.getElementById('dining-status').innerHTML = "<strong>DEADLOCK DETECTED!</strong> All philosophers are holding their left fork and waiting indefinitely for their right fork (Circular Wait).";
            document.getElementById('dining-status').className = 'output-panel error'; // Use the error class for clear visual feedback
        }

        drawDining();
    };

    // Run the simulation faster to increase the chance of deadlock
    diningInterval = setInterval(runSimulation, 200);
}

function resetDining() {
    clearInterval(diningInterval);
    diningInterval = null;
    pState.fill('thinking');
    forks.fill(true);
    drawDining();
    document.getElementById('dining-status').textContent = "Simulation Reset.";
    document.getElementById('dining-status').className = 'status-text';
}

// --- Traffic Deadlock ---
let trafficInterval;
const trafficCanvas = document.getElementById('traffic-canvas');
const tCtx = trafficCanvas.getContext('2d');
let cars = [];
let isDeadlocked = false;

function initTrafficCars() {
    cars = [
        { id: 1, x: 250, y: 400, dir: 'up', color: 'red', stopped: false },
        { id: 2, x: 0, y: 250, dir: 'right', color: 'blue', stopped: false },
        { id: 3, x: 350, y: 0, dir: 'down', color: 'green', stopped: false },
        { id: 4, x: 600, y: 150, dir: 'left', color: 'orange', stopped: false }
    ];
}

function drawTraffic() {
    tCtx.clearRect(0, 0, trafficCanvas.width, trafficCanvas.height);

    // Draw Roads
    tCtx.fillStyle = '#334155';
    tCtx.fillRect(200, 0, 200, 400); // Vertical
    tCtx.fillRect(0, 100, 600, 200); // Horizontal

    // Intersection
    tCtx.fillStyle = '#475569';
    tCtx.fillRect(200, 100, 200, 200);

    // Draw Cars
    cars.forEach(car => {
        tCtx.fillStyle = car.color;
        tCtx.fillRect(car.x, car.y, 40, 40);
    });
}

function updateTraffic() {
    if (isDeadlocked) return;

    cars.forEach(car => {
        if (car.stopped) return;

        if (car.dir === 'up') car.y -= 2;
        if (car.dir === 'down') car.y += 2;
        if (car.dir === 'left') car.x -= 2;
        if (car.dir === 'right') car.x += 2;

        // Loop around
        if (car.y < -50) car.y = 450;
        if (car.y > 450) car.y = -50;
        if (car.x < -50) car.x = 650;
        if (car.x > 650) car.x = -50;
    });
    drawTraffic();
}

function startTraffic() {
    if (trafficInterval) clearInterval(trafficInterval);
    initTrafficCars();
    isDeadlocked = false;
    document.getElementById('traffic-status').textContent = "Traffic Flowing...";
    document.getElementById('traffic-status').className = 'status-text';
    trafficInterval = setInterval(updateTraffic, 20);
}

function causeTrafficDeadlock() {
    if (trafficInterval) clearInterval(trafficInterval);
    isDeadlocked = true;

    // Better coordinates for visual deadlock
    cars[0] = { ...cars[0], x: 250, y: 210 }; // Red (Up)
    cars[1] = { ...cars[1], x: 210, y: 250 }; // Blue (Right)
    cars[2] = { ...cars[2], x: 350, y: 190 }; // Green (Down)
    cars[3] = { ...cars[3], x: 290, y: 150 }; // Orange (Left)

    cars.forEach(car => car.stopped = true); // Ensure they don't move

    drawTraffic();
    document.getElementById('traffic-status').textContent = "Deadlock! Gridlock detected.";
    document.getElementById('traffic-status').className = 'output-panel error';
}

function resetTraffic() {
    clearInterval(trafficInterval);
    isDeadlocked = false;
    initTrafficCars();
    drawTraffic();
    document.getElementById('traffic-status').textContent = "Traffic Reset.";
    document.getElementById('traffic-status').className = 'status-text';
}

// Initial Draw
setTimeout(() => {
    drawDining();
    initTrafficCars();
    drawTraffic();
}, 100);