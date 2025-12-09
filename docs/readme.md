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

This project follows a professional multi-branch workflow.
Each major module was developed in its own dedicated branch, ensuring clean separation of features and clear revision tracking.
The branches used during development include:

rag-module

banker-module

detection-module

scenarios-module

rag-fix

documentation

Each branch contained meaningful updates and was merged into the main branch after verification.
This approach ensures a clean, traceable, and industry-standard revision history.
---

## 🔹 Author

**Name:** Devendra Kumar Mewara  
**Registration No:** 12415160  
**Section:** K24HP  
**Course:** Operating Systems (CSE316)  

---

### ✨ This toolkit helps students understand deadlocks through visualization rather than theory alone.
