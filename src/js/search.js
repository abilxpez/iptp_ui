// this is for a fancy autocomplete
module.exports = () => {
  const searchInput = document.getElementById('query');
  const suggestionsBox = document.getElementById('search-autocomplete');
  const SHOW_RESULTS_LENGTH = 0;
  const showClass = 'is-visible';

  if ((searchInput != null) && (typeof searchInput != 'undefined')) {
    searchInput.onkeyup = function toggleHints() {
      if (searchInput.value.length > SHOW_RESULTS_LENGTH) {
        suggestionsBox.classList.add(showClass);
        suggestionsBox.removeAttribute('aria-hidden');
      }
      else {
        suggestionsBox.classList.remove(showClass);
        suggestionsBox.setAttribute('aria-hidden', true);
      }
    }
  }
};
