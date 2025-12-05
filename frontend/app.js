document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');

            // Update Menu Active State
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Update Section Visibility
            sections.forEach(section => {
                section.classList.remove('active-section');
                if (section.id === targetId) {
                    section.classList.add('active-section');
                }
            });
        });
    });

    // Initialize Modules if needed
    if (typeof initRAG === 'function') initRAG();
    if (typeof initBanker === 'function') initBanker();
    if (typeof initDetection === 'function') initDetection();
    if (typeof initScenarios === 'function') initScenarios();
});
