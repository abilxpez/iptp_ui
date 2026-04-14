module.exports = function () {
    const litigationCheckbox = document.getElementById('litigationCheckbox');

    if (!litigationCheckbox) {
        // Litigation checkbox not found - this is expected on pages that don't have it
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const baseUrl = window.location.origin + window.location.pathname;

    // If a specific parameter (e.g., 'retainState') is missing, clear stored state
    if (!urlParams.has('retainState')) {
        localStorage.removeItem('litigationCheckboxState');
        litigationCheckbox.checked = false; // Reset checkbox to default
    } else {
        // Retrieve and apply stored state if 'retainState' exists
        const savedState = localStorage.getItem('litigationCheckboxState');
        litigationCheckbox.checked = savedState === "checked";
    }

    // Function to save checkbox state in localStorage
    const saveCheckboxState = () => {
        localStorage.setItem('litigationCheckboxState', litigationCheckbox.checked ? "checked" : "unchecked");
    };

    // Function to update the URL based on the checkbox state
    const applyFilter = (isInitialLoad = false) => {
        if (litigationCheckbox.checked) {
            urlParams.set('status', 'in-litigation');
        } else {
            urlParams.delete('status');
        }

        // Always add 'retainState' to prevent clearing localStorage on next visit
        urlParams.set('retainState', 'true');

        const newUrl = `${baseUrl}?${urlParams.toString()}`;

        if (!isInitialLoad && window.location.search !== urlParams.toString()) {
            window.location.href = newUrl;
        }
    };

    // Apply filter on load
    applyFilter(true);

    // Save state and update URL on checkbox change
    litigationCheckbox.addEventListener('change', () => {
        saveCheckboxState();
        applyFilter();
    });
};
