(function($) {
	// Pass a link element to resize facebox frame
  $.dropdownboxUrl = function (url, self) {
    $.dropdownbox.settings.currentElement = self;
    $.dropdownbox({ ajax: url });
    $.dropdownbox.settings.currentElement = null;
  };

  // For ajax way to replace some html
  // $.faceWithSize("www.google.com", "200x300")
  $.dropdownboxWithSize = function (url, size) {
    var self = $("<div></div>");
    self.attr("data-dropdownbox-width", size.split('x')[0]).
         attr("data-dropdownbox-height", size.split('x')[1]);
    $.dropdownboxUrl(url, self);
  };

  $.dropdownbox = function(data) {
    $.dropdownbox.loading()

    if (data.ajax) fillDropdownboxFromAjax(data.ajax)
    else if (data.image) fillDropdownboxFromImage(data.image)
    else if (data.div) fillDropdownboxFromHref(data.div)
    else if ($.isFunction(data)) data.call($)
    else $.dropdownbox.reveal(data)
	}

	$.extend($.dropdownbox, {
    settings: {
      opacity      		: 0.2,
      overlay      		: true,
      loadingImage 		: '/images/loading.gif',
      closeImage   		: '/dropdownbox/closelabel.gif',
      imageTypes   		: [ 'png', 'jpg', 'jpeg', 'gif' ],
	    dropdownboxHtml : '\
	    <div id="dropdownbox" style="display:none;"> \
				      <div class="popup"> \
				        <table> \
				          <tbody> \
				            <tr> \
				              <td class="body"> \
				                 <div class="pRelative"> \
				                  <div class="content"> \
				                  </div> \
				                  <a href="#" class="close" /> \
				                </div> \
				              </td> \
				            </tr> \
				          </tbody> \
				        </table> \
				      </div> \
				    </div>'
    },

    loading: function() {
      init()
      if ($('#dropdownbox .loading').length == 1) return true
      showOverlay()

			// add loading bar.
      $('#dropdownbox .content').empty()
      $('#dropdownbox .body').children().hide().end().
        append('<div class="dropdownboxloading"><img src="'+$.dropdownbox.settings.loadingImage+'"/></div>')

			// adjust position.
      var el = $.dropdownbox.settings.currentElement,
          leftVar = ($(window).width() - 925) / 2

			
			// set customized dropdownbox size
      if (el && el.attr('data-dropdownbox-height') && el.attr('data-dropdownbox-width')) {
        $('#dropdownbox .body').height(el.attr('data-dropdownbox-height'))
                           		 .width(925)
                           		 .css({'vertical-align':'middle','text-align':'center','background':'#fff'})
			}

			// show dropdownbox
      $('#dropdownbox').css({
        top: 0, // getPageScroll()[1] + (getPageHeight() / 10),
        left:	leftVar
      }).slideDown('slow')

			// bind event
      $(document).bind('keydown.dropdownbox', function(e) {
        if (e.keyCode == 27) $.dropdownbox.close()
        return true
      })
      $(document).trigger('loading.dropdownbox')
    },

    reveal: function(data) {
      $(document).trigger('beforeReveal.dropdownbox')

      $('#dropdownbox .content').append(data)
      $('#dropdownbox .dropdownboxloading').remove()
      $('#dropdownbox .body').children().fadeIn('normal')
      $('#dropdownbox .body').css({'vertical-align':'top','text-align':'left','background':'none'})

      $(document).trigger('reveal.dropdownbox').trigger('afterReveal.dropdownbox')
    },

    close: function() {
      $(document).trigger('close.dropdownbox')
      return false
    }
  })

  /*
   * Public, $.fn methods
   */

  $.fn.dropdownbox = function(settings) {
    if ($(this).length == 0) return
    init(settings)
    return this.bind('click.dropdownbox', clickHandler)
  }

  function clickHandler() {
    $.dropdownbox.settings.currentElement = $(this)
    $.dropdownbox.loading(true)
    $.dropdownbox.settings.currentElement = null
    fillDropdownboxFromHref(this.href)
    return false
  }

  /*
   * Private methods
   */

  // called one time to setup dropdownbox on this page
  function init(settings) {
    if ($.dropdownbox.settings.inited) return true
    else $.dropdownbox.settings.inited = true

    $(document).trigger('init.dropdownbox')

    var imageTypes = $.dropdownbox.settings.imageTypes.join('|')
    $.dropdownbox.settings.imageTypesRegexp = new RegExp('\.(' + imageTypes + ')$', 'i')

    if (settings) $.extend($.dropdownbox.settings, settings)
    $('body').append($.dropdownbox.settings.dropdownboxHtml)

    $('#dropdownbox .close').click($.dropdownbox.close)
  }

  // getPageScroll() by quirksmode.com
  function getPageScroll() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
      yScroll = self.pageYOffset;
      xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
      yScroll = document.documentElement.scrollTop;
      xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
      yScroll = document.body.scrollTop;
      xScroll = document.body.scrollLeft;
    }
    return new Array(xScroll,yScroll)
  }

  // Adapted from getPageSize() by quirksmode.com
  function getPageHeight() {
    var windowHeight
    if (self.innerHeight) {	// all except Explorer
      windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
      windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
      windowHeight = document.body.clientHeight;
    }
    return windowHeight
  }

  // Figures out what you want to display and displays it
  // formats are:
  //     div: #id
  //   image: blah.extension
  //    ajax: anything else
  function fillDropdownboxFromHref(href) {
    // div
    if (href.match(/#/)) {
      var url    = window.location.href.split('#')[0]
      var target = href.replace(url,'')
      if (target === '#') return
      $.dropdownbox.reveal($(target).html())

    // image
    } else if (href.match($.dropdownbox.settings.imageTypesRegexp)) {
      fillDropdownboxFromImage(href)
    // ajax
    } else {
      fillDropdownboxFromAjax(href)
    }
  }

  function fillDropdownboxFromImage(href) {
    var image = new Image()
    image.onload = function() {
      $.dropdownbox.reveal('<div class="image"><img src="' + image.src + '" /></div>')
    }
    image.src = href
  }

  function fillDropdownboxFromAjax(href) {
    $.get(href, function(data) { $.dropdownbox.reveal(data) })
  }

  function skipOverlay() {
    return $.dropdownbox.settings.overlay == false || $.dropdownbox.settings.opacity === null
  }

  var is_ipad = !!navigator.userAgent.match(/iPad/i);

  function showOverlay() {
    if (skipOverlay()) return

    if ($('#dropdownbox_overlay').length == 0)
      $("body").append('<div id="dropdownbox_overlay" class="dropdownbox_hide"></div>')

    $('#dropdownbox_overlay').hide().addClass("dropdownbox_overlayBG")
      .css('opacity', $.dropdownbox.settings.opacity)
      .click(function() { $(document).trigger('close.dropdownbox') })
      .fadeIn(200);
    if ( is_ipad ) {
      $('#dropdownbox_overlay').css('position','absolute').height(document.height);
    }
    return false
  }

  function hideOverlay() {
    if (skipOverlay()) return

    $('#dropdownbox_overlay').fadeOut(200, function(){
      $("#dropdownbox_overlay").removeClass("dropdownbox_overlayBG")
      $("#dropdownbox_overlay").addClass("dropdownbox_hide")
      $("#dropdownbox_overlay").remove()
    })

    return false
  }

  /*
   * Bindings
   */

  $(document).bind('close.dropdownbox', function() {
    $(document).unbind('keydown.dropdownbox')
    $('#dropdownbox').slideUp('slow', function() {
			hideOverlay()
      $('#dropdownbox .content').removeClass().addClass('content')
      $('#dropdownbox .loading').remove()
      $(document).trigger('afterClose.dropdownbox')
    })
  })
})(jQuery);