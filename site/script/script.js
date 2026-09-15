
    const infoPanel = document.getElementById('infoPanel');
    const toggleBtn = document.getElementById('toggleBtn');
 
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = infoPanel.classList.toggle('collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
      toggleBtn.setAttribute('aria-label', isCollapsed ? 'Expand panel' : 'Collapse panel');
    });

    
/* -- Data Pannel  -- */



    (function () {
  // scope everything inside this IIFE so it never collides with
  // other <script> blocks/toggles elsewhere on the page
  document.querySelectorAll('.data-panel').forEach(function (panel) {
    var chevron = panel.querySelector(':scope > .data-title-row > .chevron-btn');
    if (!chevron) return;

    chevron.addEventListener('click', function (e) {
      e.stopPropagation();          // don't let the click bubble into other toggles
      panel.classList.toggle('collapsed');
    });
  });
})(); 

