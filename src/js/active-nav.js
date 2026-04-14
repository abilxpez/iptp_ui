module.exports = () => {
    let mainNavLinks = document.querySelectorAll('.active-nav li a');
    let sideNavLinks = Array.prototype.slice.call(document.querySelectorAll('.sidenav li a'));
    const currentClass = 'sidenav__link--current';

    const clickHandler = function(e) {
        if(!this.hasAttribute('target')) {
            sideNavLinks.forEach(link => link.classList.remove(currentClass));
            this.classList.add(currentClass);
        }
    };

    if(mainNavLinks.length) {
        mainNavLinks[0].classList.add(currentClass);

        // let lastId;
        // let cur = [];

        // This should probably be throttled.
        // Especially because it triggers during smooth scrolling.
        // https://lodash.com/docs/4.17.10#throttle
        // You could do like...
        // window.addEventListener("scroll", () => {
        //    _.throttle(doThatStuff, 100);
        // });
        // Only not doing it here to keep this Pen dependency-free.

        window.addEventListener("scroll", event => {
            let fromTop = window.scrollY;
            
            mainNavLinks.forEach(link => {  
                let section = document.querySelector(link.hash);

                if ( section.offsetTop <= fromTop) {
                    link.classList.add(currentClass);
                    mainNavLinks.forEach(l => { if(l!=link) { l.classList.remove(currentClass); }});
                    
                }
                else {
                    link.classList.remove(currentClass);
                }
            });
        });
    }
    else if(sideNavLinks.length) {
        sideNavLinks.forEach(link => link.addEventListener('click', clickHandler));
    }

}
