# Deadlock Prevention & Recovery Toolkit  
### *An Operating Systems Mini Project*

This project presents core deadlock concepts through interactive simulations and algorithmic visualizations.  
It transforms abstract OS theory into intuitive, hands-on learning experiences.  
Students can explore resource graphs, safe sequence checking, cycle detection,  
and real-world scenarios — all within a simple browser window.

---

## 🔹 Modules Included

### **1. Resource Allocation Graph (RAG)**
- Visualizes processes and resources  
- Allows creating Request (P → R) and Allocation (R → P) edges  
- Detects cycles using Depth-First Search  
- Highlights deadlocked nodes clearly  

### **2. Banker’s Algorithm**
- Accepts Allocation, Max, and Available matrices  
- Computes Need matrix automatically  
- Determines Safe or Unsafe state  
- Displays Safe Sequence when it exists  

### **3. Deadlock Detection & Recovery**
- Performs matrix-based deadlock detection  
- Identifies processes involved in deadlock  
- Supports recovery by terminating selected processes  
- Updates resource availability dynamically  

### **4. Scenarios Module**
Includes examples of real-world deadlock situations:
- **Dining Philosophers Problem**  
- **Producer–Consumer Problem**
- **Readers–Writers Problem**  
- **Traffic Intersection Deadlock**  


---

## 🔹 Technology Stack

- **HTML** – User interface structure  
- **CSS** – Styling and layout  
- **JavaScript** – Algorithms and animations  
- **Vis.js** – Graph visualization engine  
- **Git & GitHub** – Version control and hosting  

---

## 🔹 How to Run the Project

1. Open the **docs** folder  
2. Double-click **index.html**  
3. The toolkit will open in your browser  

### Navigate using the left sidebar:
- RAG Visualization  
- Banker’s Algorithm  
- Deadlock Detection & Recovery  
- Scenarios Simulation  

---

## 🔹 GitHub Project Workflow

During development, the project followed a structured workflow where each major feature  
was built and tested separately before being integrated into the main branch.  
This ensured clear revisions, modular development, and easy debugging.

Although the repository now contains only the finalized **main** branch  
(to keep the submission clean and deployment stable),  
the project originally progressed through dedicated feature work on modules such as:

- RAG Visualization  
- Banker’s Algorithm  
- Deadlock Detection  
- Scenarios Module  
- Documentation updates  

This workflow reflects traditional software engineering practice,  
where features are developed independently and merged once verified.

---

## 🔹 Author

**Name:** Devendra Kumar Mewara  
**Registration No:** 12415160  
**Section:** K24HP  
**Course:** Operating Systems (CSE316)  

---

### ✨ This toolkit allows learners to *see* deadlocks — not just read about them.  
A bridge between theory and intuition.
