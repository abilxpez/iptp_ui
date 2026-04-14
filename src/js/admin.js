window.onload = (() => { 
  const $body = $('body');

  const IPTPAdmin = {
    currentState: JSON.parse(localStorage.getItem('iptp.admin')) || {},

    saveUIstate: (k, v) => {
      IPTPAdmin.currentState[k] = v;
      localStorage.setItem('iptp.admin', JSON.stringify(IPTPAdmin.currentState));
    }, // saveUIstate

    addEditorNav: () => {
      const $tab = $('#tab-general'),
            $panels = $tab.find('.title-wrapper label');

      if($panels.length>0) {
        let panelNav = [];
        $panels.each(function(i, v) {
          let $panel = $(v).closest('.object');
          if(!$panel.attr('id')) {
            $panel.attr('id', `panel-${i}`);
          }
          panelNav.push(`<li><a href="#${$panel.attr('id')}">${v.textContent.trim()}</a></li>`);
        });
        $tab.append(`<div class="editor-nav ${IPTPAdmin.currentState.editorNav}"><div class="editor-nav-toggle" data-toggle="editor-nav"><i class="icon icon-fa-chevron-right"></i></div><ul>${panelNav.join('')}</ul></div>`);

        $body.on('click', '[data-toggle="editor-nav"]', function(e) {
          const $editorNav = $(this).closest('.editor-nav');
          $editorNav.toggleClass('collapsed');
          if($editorNav.hasClass('collapsed')) {
            IPTPAdmin.saveUIstate('editorNav', 'collapsed');
          }
          else {
            IPTPAdmin.saveUIstate('editorNav', '');
          }
        });
      } // if
    }, // addEditorNav
    
    addFiltersOverlay: () => {
      const $filters = $('#filter-overlay');
      if($filters.length) {
        $filters.css({
          left: $filters.offset().left,
          top: $filters.offset().top,
        }).addClass('ready').siblings().removeClass('col9').css({
          paddingRight: 0,
        });

        $body.on('click', '[data-toggle="filters"]', function(e) {
          e.preventDefault();
          $filters.toggleClass('collapsed');
        });
      }
    }, // addFiltersOverlay
  }; // IPTPAdmin

  // To change the text in the snippet chooser buttons
  const updateChooserButtons = () => {
    $('.action-choose:contains(Choose another)').text('Change');
  };

  // adds editor nav  
  if($body.hasClass('page-editor')) {
    IPTPAdmin.addEditorNav();
  }
  IPTPAdmin.addFiltersOverlay();

  // wagtail widget enhancements
  $body
    .on('click', '[data-toggle="updateSearch"]', function(e) { // this is used for agency_modal & subject_matter_modal
      e.preventDefault();
      var $button = $(this);
      $button.addClass('active');
      $button.siblings().removeClass('active');
      $($button.attr('data-target')).val(this.value).trigger('change');
    })
    .on('click', '.c-sf-add-button, .choose-page', function() {
      setTimeout(updateChooserButtons, 1500);
    });

  setInterval(updateChooserButtons, 5000);

  try {
    window.wagtail.ui.ModelChooser.addChooseHook(function(modal, instance) {
      instance.text(`${modal.body.find('.button.active').text().trim()}: ${instance.text().trim()}`);
      return this;
    });
  }
  catch(err) {
    //
  }
});

