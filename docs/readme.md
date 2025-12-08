# Deadlock Prevention & Recovery Toolkit  
### *An Operating Systems Mini Project*

This project demonstrates deadlock concepts through interactive simulations and algorithms.  
It includes visual models, cycle detection, safe state checking, and real-world scenarios.

---

## 🔹 Modules Included

### **1. Resource Allocation Graph (RAG)**
- Visualizes processes and resources  
- Allows creating Request (P → R) and Allocation (R → P) edges  
- Detects cycles using Depth-First Search  
- Highlights deadlock conditions  

### **2. Banker’s Algorithm**
- Accepts Allocation, Max, and Available matrices  
- Computes Need matrix  
- Determines Safe or Unsafe state  
- Displays Safe Sequence when system is safe  

### **3. Deadlock Detection & Recovery**
- Works on matrix-based deadlock detection  
- Identifies deadlocked processes  
- Allows recovery by terminating processes  
- Updates resource availability after recovery  

### **4. Scenarios Module**
Includes animations for real-world deadlock situations:
- **Dining Philosophers Problem**  
- **Traffic Intersection Deadlock**  

These scenarios visually demonstrate circular wait and mutual blocking.

---

## 🔹 Technology Stack

- **HTML** – Interface layout  
- **CSS** – Styling and structure  
- **JavaScript** – Algorithms and animations  
- **Vis.js** – Graph visualization  
- **Git & GitHub** – Version control  
- **VS Code** – Development environment  

---

## 🔹 How to Run the Project

1. Open the `frontend` folder  
2. Double-click `index.html`  
3. The toolkit will open in your browser  
4. Navigate using the sidebar:
   - RAG Visualization  
   - Banker’s Algorithm  
   - Deadlock Detection & Recovery  
   - Scenarios Simulation  

---

## 🔹 GitHub Revision Workflow

This project follows a structured multi-branch workflow:

| Commit No. | Branch Name       | Description |
|------------|-------------------|-------------|
| 1          | main              | Initial project structure |
| 2          | rag-module        | RAG module update |
| 3          | banker-module     | Banker module update |
| 4          | detection-module  | Detection module update |
| 5          | scenarios-module  | Scenarios simulation update |
| 6          | documentation     | Documentation improvements |
| 7          | final-polish      | Final UI polish and cleanup |

Each branch was created, updated, and merged into `main` with meaningful changes.  
This ensures a clean and professional revision history.  
:contentReference[oaicite:0]{index=0}

---

## 🔹 Author

**Name:** Devendra Kumar Mewara  
**Registration No:** 12415160  
**Section:** K24HP  
**Course:** Operating Systems (CSE316)  

---

### ✨ This toolkit helps students understand deadlocks through visualization rather than theory alone.
