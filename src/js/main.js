const DonutChart = require('./donut-chart.js');
const TimelineChart = require('./chart-timeline.js');
const axios = require('axios');


window.iptp = {
  charts: {},
  tabs: require('./tabs.js'),
  activeNav: require('./active-nav.js'),
  filters: require('./filters.js'),
  pdfviewer: require('./pdfviewer.js'),
  litigation: require('./litigation.js'),
  yie: () => {
    const documentLinks = Array.prototype.slice.call(document.querySelectorAll('[data-document].sidenav__link'));
    iptp.looper = setInterval(() => {
      if(document.querySelector('[data-tab="documents"]').getAttribute('aria-selected')=='true') {
        documentLinks.forEach((link, i) => {
          link.classList.remove('sidenav__link--current');
          if(i===Math.floor(Math.random() * documentLinks.length)) {
            link.classList.add('sidenav__link--current');
          }
        });
      }
    }, 1000);
  },

  data: {},

  elems: {
    datavizElem: document.getElementById('dataviz-timeline'),
    policyCountBubble: document.getElementById('policy-count-bubble'),
    policyCountTimeline: document.getElementById('policy-count'),
  },

  makeCharts: () => {
    Array.prototype.slice.call(document.querySelectorAll('[data-chart]')).forEach(elem => {
      let chart = DonutChart(elem, +elem.getAttribute('data-total'), +elem.getAttribute('data-part'), elem.getAttribute('data-color'));
      iptp.charts[elem.getAttribute('data-chart-name')] = chart;
      chart.draw();
    });

    // if(iptp.elems.datavizElem) {
    //   axios.get(`/policies.json${location.search}`)
    //   .then((response) => {
    //     iptp.data.policies = response.data;
    //     if(typeof response.data === 'object' && response.data.length) {
    //       setTimeout(()=>{
    //         iptp.incrementPolicies({
    //           bubble: iptp.elems.policyCountBubble,
    //           count: 'total',
    //           increment: 100,
    //         });
    //         iptp.incrementPolicies({
    //           bubble: iptp.elems.policyCountTimeline,
    //           count: 'total',
    //           increment: 100,
    //         });
    //       }, 5);

    //       iptp.charts.timeline = TimelineChart(iptp.data.policies, '#dataviz-timeline');
    //       iptp.charts.timeline.draw();
    //     }
    //   }, (error) => {
    //     console.log(error);
    //   });
    // }
  }, // makeCharts
  
  incrementPolicies: (args) => {
    if(!args || !args.bubble) return;
    let final = Number(args.bubble.getAttribute('data-count'));
    let all_policies_current = final==iptp.data.policies.length //# of current events should never be equal # of policies total
    if(!final || isNaN(final) || all_policies_current) {
      switch(args.count) {
        default:
          final = iptp.data.policies.length;
          break;
      }
    }

    let countup = null;
    let count = +args.bubble.textContent; //0
    countup = setInterval(() => {
      count = Math.min(Math.round(count + (Math.random()*args.increment)), final);
      args.bubble.textContent = count;
      if(count===final) {
        clearInterval(countup);
        if(args.callback) { args.callback(); }
      }
    }, 10);
  }, // incrementPolicies

  facets: () => {
    const facets = document.querySelectorAll('.facet'),
          applyButton = document.getElementById('apply-filter');
    if(facets.length) {
      document.getElementById('main-content').style.minHeight = `${document.getElementsByClassName('facets-form')[0].offsetHeight + 300}px`;
      facets.forEach(facet => facet.addEventListener('click', event => {
        applyButton.removeAttribute('disabled');
      }));
    }
  }, // facets
  
  loadGlossary: () => {
    const terms = document.querySelectorAll('[data-term], [data-slug]');
    
    const collapseEntries = () => {
      Array.prototype.slice.call(document.querySelectorAll('.glossary__item')).forEach(entry => {
        entry.querySelector('.glossary__term').setAttribute('aria-expanded', false);
        entry.querySelector('.glossary__definition').setAttribute('aria-hidden', true);
      })
    };

    if(terms.length>0) {
      const glossary = document.getElementById('glossary'),
            glossaryToggles = document.querySelectorAll('[data-toggle="glossary"]');
      
      terms.forEach(term => {
        term.addEventListener('click', e => {
          const slug = term.getAttribute('data-term') || term.getAttribute('data-slug'),
                entry = glossary.querySelector(`[data-slug="${slug}"]`);
          if(glossary.getAttribute('aria-hidden')=='true') { // collapse all entries if the glossary had been closed
            collapseEntries();
          }
          if(entry.querySelector('.glossary__term').getAttribute('aria-expanded')=='true') {
            entry.querySelector('.glossary__term').setAttribute('aria-expanded', false);  
            entry.querySelector('.glossary__definition').setAttribute('aria-hidden', true);
          }
          else {
            entry.querySelector('.glossary__term').setAttribute('aria-expanded', true);
            entry.querySelector('.glossary__definition').setAttribute('aria-hidden', false);
          }
          glossary.setAttribute('aria-hidden', false);
        });
      });
      
      glossaryToggles.forEach(toggle => {
        collapseEntries();
        toggle.addEventListener('click', e => {
          if(glossary.getAttribute('aria-hidden')=='true') {
            glossary.setAttribute('aria-hidden', false);
          }
          else {
            glossary.setAttribute('aria-hidden', true);
          }
        });
      });      
    }
  }, // loadGlossary
  
  activateSearch: () => { // resets the filters
    const resetFilters = document.getElementById('search-reset');
    if(resetFilters) {
      resetFilters.addEventListener('click', e => { // puts the focus back on the input
        document.getElementById('query').focus();
      });
      const searchForm = document.getElementById('main-search');  
      searchForm.addEventListener('submit', e => {
        // console.log('submit');
        if(resetFilters.checked) {
          searchForm.querySelectorAll('input[type="hidden"]').forEach(input => {
            input.remove();
          });
        }
      });
    }
  }, // activateSearch
  
  subsequentActions: () => {
    const trigger = document.querySelector('[data-toggle="collapsed"]');
    if(trigger) {
      trigger.addEventListener('click', e => {
        const parent = trigger.parentNode;
        if(parent.classList.contains('collapsed')) {
          parent.classList.remove('collapsed');
        }
        else {
          parent.classList.add('collapsed');
        }
      });
    }
  }, // subsequentActions
  
  enableGlobalInteractions: () => {
    const glossary = document.getElementById('glossary');
    
    window.addEventListener("keydown", e => {
      if(e.which === 27) { // ESC
        glossary.setAttribute('aria-hidden', true); 
        document.querySelectorAll('.filter-button[aria-expanded="true"]').forEach(button => {
          button.setAttribute('aria-expanded', false);
          button.nextElementSibling.setAttribute('hidden', 'hidden');
        });
      }
    });
  }, // enableGlobalInteractions
  

  init: () => {
    iptp.pdfviewer();
    iptp.makeCharts();
    iptp.activeNav();
    iptp.filters();
    iptp.tabs();
    iptp.facets();
    iptp.subsequentActions();
    iptp.loadGlossary();
    iptp.enableGlobalInteractions();
    iptp.activateSearch();
    iptp.litigation();
    
    iptp.incrementPolicies({
      bubble: iptp.elems.policyCountBubble,
      count: 'total',
      increment: 100,
    });

    if(location.search.indexOf('show-tags')>=0) {
      document.body.classList.add('show-tags');
    }
    if(location.search.indexOf('evil')>=0) {
      iptp.yie();
    }
    
    

  },
};

window.onload = iptp.init;
