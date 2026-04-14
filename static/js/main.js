(function () {
  const filterButtons = document.querySelectorAll('.filter-button');
  const filterLists = document.querySelectorAll('.filters-menu');

  for (let i = 0; i < filterButtons.length; i += 1) {
    filterButtons[i].addEventListener('click', function (e) {
      e.stopPropagation();

      filterButtons.forEach((btn, index) => {
        if (index !== i) {
          btn.setAttribute('aria-expanded', 'false');
        }
      });
      filterLists.forEach((menu) => menu.setAttribute('hidden', 'hidden'));

      const menu = document.getElementById(this.getAttribute('aria-controls'));
      const expanded = this.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        this.setAttribute('aria-expanded', 'false');
        menu.setAttribute('hidden', 'hidden');
      } else {
        this.setAttribute('aria-expanded', 'true');
        menu.removeAttribute('hidden');
      }
    });
  }

  document.body.addEventListener('click', function () {
    const openButton = document.querySelector('.filter-button[aria-expanded="true"]');
    if (openButton) {
      openButton.setAttribute('aria-expanded', 'false');
      const menu = document.getElementById(openButton.getAttribute('aria-controls'));
      if (menu) menu.setAttribute('hidden', 'hidden');
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const openButton = document.querySelector('.filter-button[aria-expanded="true"]');
      if (openButton) {
        openButton.setAttribute('aria-expanded', 'false');
        const menu = document.getElementById(openButton.getAttribute('aria-controls'));
        if (menu) menu.setAttribute('hidden', 'hidden');
      }
    }
  });
})();
