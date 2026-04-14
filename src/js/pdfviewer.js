// https://github.com/pipwerks/PDFObject
// https://pdfobject.com/
const PDFObject = require('pdfobject');

module.exports = () => {
    const currentClass = 'sidenav__link--current';
    const sideNavLinks = document.querySelectorAll('.sidenav--documents li a');

    const viewOptions = {
        pdfOpenParams: {
        pagemode: 'none',
        navpanes: 1,
        toolbar: 1,
        statusbar: 1,
        view: 'Fit',
        }
    };

    const proxyClickHandler = function(e) {
        document.querySelector('[data-tab="documents"]').setAsActive();
        let link = document.querySelector(`[data-document-id="${this.getAttribute('data-proxy-click')}"]`);
        if(link) {
            clickHandler.call(link, e);
        }
        return false;
    };
  
    const clickHandler = function(e) {
        e.preventDefault();
        let pdfUrl = this.getAttribute('href');
        let pdfDoc = PDFObject.embed(pdfUrl, '#pdfviewer', Object.assign({
            fallbackLink: pdfUrl,
        }, viewOptions));
        sideNavLinks.forEach(link => {link.classList.remove(currentClass);});
        this.classList.add(currentClass);
        document.getElementById('document-title').textContent = this.getAttribute('title');
        document.getElementById('source-display').innerHTML = this.parentNode.querySelector('.document-source').innerHTML;
    };

    const pdfLinks = Array.prototype.slice.call(document.querySelectorAll('[data-document-id]'));
    if(pdfLinks.length) {
        pdfLinks.forEach(link => link.addEventListener('click', clickHandler));
    }
    const proxyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-proxy-click]'));
    if(proxyLinks.length) {
        proxyLinks.forEach(link => link.addEventListener('click', proxyClickHandler));
    }

};
