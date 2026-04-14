module.exports = () => {
  const filterButtons = document.querySelectorAll('.filter-button');
  const filterLists = document.querySelectorAll('.filters-menu');

  for(let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].onclick = function handleClick(e) {
      e.cancelBubble = true;

      // Reset other buttons
      const otherButtons = Object.values(filterButtons);
      otherButtons.splice(i, 1);
      for(let i = 0; i < otherButtons.length; i++) {
        otherButtons[i].setAttribute('aria-expanded', 'false');
      }

      // Hide the other menus
      for(let i = 0; i < filterLists.length; i++) {
        filterLists[i].setAttribute('hidden', 'hidden');
      }

      // Get vars
      const menuName = this.getAttribute('aria-controls');
      const menu = document.getElementById(menuName);
      const expanded = (this.getAttribute('aria-expanded') == 'true');

      if (expanded) {
        menu.setAttribute('hidden', 'hidden');
        this.setAttribute('aria-expanded', 'false');
      }
      else {
        menu.removeAttribute('hidden');
        this.setAttribute('aria-expanded', 'true');
      }
    };
  }
  document.body.onclick = function() {
    const button = document.querySelector('.filter-button[aria-expanded=true]');
    if(button) {
      button.setAttribute('aria-expanded', 'false');
      button.nextElementSibling.setAttribute('hidden', 'hidden');
    }
  }

  // Toggle functionality
  const setupToggle = () => {
    const toggleSwitches = document.querySelectorAll('.toggleSwitch');

    const saveToggleState = (id, isChecked) => {
      localStorage.setItem(id, isChecked ? "checked" : "unchecked");
    };
  
    const restoreToggleState = (id) => {
      const state = localStorage.getItem(id);
      return state === "checked"; // Defaults to false if state is null
    };
  
    const resetHomeToggleState = () => {
      const homeToggle = document.getElementById('homeToggleSwitch');
      if (homeToggle) {
        homeToggle.checked = false;
        saveToggleState(homeToggle.id, true);
      }
    };
  
    const syncPolicyToggleWithHome = () => {
      const homeToggle = document.getElementById('homeToggleSwitch');
      const policyToggle = document.getElementById('policiesToggleSwitch');
      if (homeToggle && policyToggle) {
        const homeState = restoreToggleState(homeToggle.id);
        policyToggle.checked = homeState; 
        saveToggleState(policyToggle.id, homeState);
      }
    };

    const syncToggleWithURL = (toggleSwitch) => {
      const urlParams = new URLSearchParams(window.location.search);
      const isAfterPresent = urlParams.has('after') && urlParams.get('after') === '2025-01-20';
    
      // Sync toggle with the URL parameter
      toggleSwitch.checked = isAfterPresent;
    
      // Save the toggle state to ensure persistence
      saveToggleState(toggleSwitch.id, isAfterPresent);
    };
    
  
    const applyFilter = (trump20toggle, isInitialLoad = false) => {
      const urlParams = new URLSearchParams(window.location.search); // Current URL params
      const baseUrl = window.location.origin + window.location.pathname;
    
      // Determine the desired state
      const desiredParams = new URLSearchParams(urlParams.toString());
      if (trump20toggle.checked) {
        desiredParams.set('after', '2025-01-20');
        desiredParams.delete('before');
        desiredParams.delete('all');
      } else {
        desiredParams.set('all', 'True');
        desiredParams.delete('after');
      }
    
      // Compare current and desired parameters
      if (urlParams.toString() !== desiredParams.toString()) {
        if (!isInitialLoad) {
          desiredParams.delete('page');
          const newUrl = `${baseUrl}?${desiredParams.toString()}`;
          window.location.href = newUrl; // Refresh only if not during initial load
        }
      }
    };

    if (toggleSwitches.length > 0) {
      toggleSwitches.forEach(toggleSwitch => {
        const toggleId = toggleSwitch.id;
      
        // Handle default states
        if (window.location.pathname.includes('home')) {
          if (!localStorage.getItem(toggleId)) {
            resetHomeToggleState();
          }
        } else if (window.location.pathname.includes('policies')) {
          syncPolicyToggleWithHome();
        }
      
        // Sync the toggle state with the URL on load
        syncToggleWithURL(toggleSwitch);

      
        // Apply filters without refreshing during setup
        applyFilter(toggleSwitch, true);
      
        // Save state on change and refresh if necessary
        toggleSwitch.addEventListener('change', () => {
          saveToggleState(toggleId, toggleSwitch.checked);
          applyFilter(toggleSwitch);
        });
      });
    }
  };
  document.addEventListener('DOMContentLoaded', setupToggle);
  setupToggle();
}  

