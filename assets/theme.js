(function ($) {
  var $ = jQuery = $;

  let cc = {
    sections: [] };


  theme.cartNoteMonitor = {
    load: function ($notes) {
      $notes.on('change.themeCartNoteMonitor paste.themeCartNoteMonitor keyup.themeCartNoteMonitor', function () {
        theme.cartNoteMonitor.postUpdate($(this).val());
      });
    },

    unload: function ($notes) {
      $notes.off('.themeCartNoteMonitor');
    },

    updateThrottleTimeoutId: -1,
    updateThrottleInterval: 500,

    postUpdate: function (val) {
      clearTimeout(theme.cartNoteMonitor.updateThrottleTimeoutId);
      theme.cartNoteMonitor.updateThrottleTimeoutId = setTimeout(function () {
        $.post(theme.routes.cart_url + '/update.js', {
          note: val },
        function (data) {}, 'json');
      }, theme.cartNoteMonitor.updateThrottleInterval);
    } };

  // Loading third party scripts
  theme.scriptsLoaded = {};
  theme.loadScriptOnce = function (src, callback, beforeRun, sync) {
    if (typeof theme.scriptsLoaded[src] === 'undefined') {
      theme.scriptsLoaded[src] = [];
      var tag = document.createElement('script');
      tag.src = src;

      if (sync || beforeRun) {
        tag.async = false;
      }

      if (beforeRun) {
        beforeRun();
      }

      if (typeof callback === 'function') {
        theme.scriptsLoaded[src].push(callback);
        if (tag.readyState) {// IE, incl. IE9
          tag.onreadystatechange = function () {
            if (tag.readyState == "loaded" || tag.readyState == "complete") {
              tag.onreadystatechange = null;
              for (var i = 0; i < theme.scriptsLoaded[this].length; i++) {
                theme.scriptsLoaded[this][i]();
              }
              theme.scriptsLoaded[this] = true;
            }
          }.bind(src);
        } else {
          tag.onload = function () {// Other browsers
            for (var i = 0; i < theme.scriptsLoaded[this].length; i++) {
              theme.scriptsLoaded[this][i]();
            }
            theme.scriptsLoaded[this] = true;
          }.bind(src);
        }
      }

      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      return true;
    } else if (typeof theme.scriptsLoaded[src] === 'object' && typeof callback === 'function') {
      theme.scriptsLoaded[src].push(callback);
    } else {
      if (typeof callback === 'function') {
        callback();
      }
      return false;
    }
  };

  theme.loadStyleOnce = function (src) {
    var srcWithoutProtocol = src.replace(/^https?:/, '');
    if (!document.querySelector('link[href="' + encodeURI(srcWithoutProtocol) + '"]')) {
      var tag = document.createElement('link');
      tag.href = srcWithoutProtocol;
      tag.rel = 'stylesheet';
      tag.type = 'text/css';
      var firstTag = document.getElementsByTagName('link')[0];
      firstTag.parentNode.insertBefore(tag, firstTag);
    }
  }; // Source: https://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  theme.debounce = function (func) {let wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 700;let immediate = arguments.length > 2 ? arguments[2] : undefined;
    var timeout;
    return function () {
      var context = this,args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  theme.Disclosure = function () {
    var selectors = {
      disclosureList: '[data-disclosure-list]',
      disclosureToggle: '[data-disclosure-toggle]',
      disclosureInput: '[data-disclosure-input]',
      disclosureOptions: '[data-disclosure-option]' };


    var classes = {
      listVisible: 'disclosure-list--visible' };


    function Disclosure($disclosure) {
      this.$container = $disclosure;
      this.cache = {};
      this._cacheSelectors();
      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();
    }

    Disclosure.prototype = $.extend({}, Disclosure.prototype, {
      _cacheSelectors: function () {
        this.cache = {
          $disclosureList: this.$container.find(selectors.disclosureList),
          $disclosureToggle: this.$container.find(selectors.disclosureToggle),
          $disclosureInput: this.$container.find(selectors.disclosureInput),
          $disclosureOptions: this.$container.find(selectors.disclosureOptions) };

      },

      _connectToggle: function () {
        this.cache.$disclosureToggle.on(
        'click',
        function (evt) {
          var ariaExpanded =
          $(evt.currentTarget).attr('aria-expanded') === 'true';
          $(evt.currentTarget).attr('aria-expanded', !ariaExpanded);

          this.cache.$disclosureList.toggleClass(classes.listVisible);
        }.bind(this));

      },

      _connectOptions: function () {
        this.cache.$disclosureOptions.on(
        'click',
        function (evt) {
          evt.preventDefault();
          this._submitForm($(evt.currentTarget).data('value'));
        }.bind(this));

      },

      _onFocusOut: function () {
        this.cache.$disclosureToggle.on(
        'focusout',
        function (evt) {
          var disclosureLostFocus =
          this.$container.has(evt.relatedTarget).length === 0;

          if (disclosureLostFocus) {
            this._hideList();
          }
        }.bind(this));


        this.cache.$disclosureList.on(
        'focusout',
        function (evt) {
          var childInFocus =
          $(evt.currentTarget).has(evt.relatedTarget).length > 0;
          var isVisible = this.cache.$disclosureList.hasClass(
          classes.listVisible);


          if (isVisible && !childInFocus) {
            this._hideList();
          }
        }.bind(this));


        this.$container.on(
        'keyup',
        function (evt) {
          if (evt.which !== 27) return; // escape
          this._hideList();
          this.cache.$disclosureToggle.focus();
        }.bind(this));


        this.bodyOnClick = function (evt) {
          var isOption = this.$container.has(evt.target).length > 0;
          var isVisible = this.cache.$disclosureList.hasClass(
          classes.listVisible);


          if (isVisible && !isOption) {
            this._hideList();
          }
        }.bind(this);

        $('body').on('click', this.bodyOnClick);
      },

      _submitForm: function (value) {
        this.cache.$disclosureInput.val(value);
        this.$container.parents('form').submit();
      },

      _hideList: function () {
        this.cache.$disclosureList.removeClass(classes.listVisible);
        this.cache.$disclosureToggle.attr('aria-expanded', false);
      },

      unload: function () {
        $('body').off('click', this.bodyOnClick);
        this.cache.$disclosureOptions.off();
        this.cache.$disclosureToggle.off();
        this.cache.$disclosureList.off();
        this.$container.off();
      } });


    return Disclosure;
  }();
  (function () {
    function throttle(callback, threshold) {
      let debounceTimeoutId = -1;
      let tick = false;

      return function () {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = setTimeout(callback, threshold);

        if (!tick) {
          callback.call();
          tick = true;
          setTimeout(function () {
            tick = false;
          }, threshold);
        }
      };
    }

    const scrollEvent = document.createEvent('Event');
    scrollEvent.initEvent('throttled-scroll', true, true);

    window.addEventListener("scroll", throttle(function () {
      window.dispatchEvent(scrollEvent);
    }, 200));

  })();
  // requires: throttled-scroll, debouncedresize

  /*
    Define a section by creating a new function object and registering it with the section handler.
    The section handler manages:
      Instantiation for all sections on the current page
      Theme editor lifecycle events
      Deferred initialisation
      Event cleanup
  
    There are two ways to register a section.
    In a theme:
      theme.Sections.register('slideshow', theme.SlideshowSection);
      theme.Sections.register('header', theme.HeaderSection, { deferredLoad: false });
      theme.Sections.register('background-video', theme.VideoManager, { deferredLoadViewportExcess: 800 });
  
    As a component:
      cc.sections.push({ name: 'faq', section: theme.Faq });
  
    Assign any of these to receive Shopify section lifecycle events:
      this.onSectionLoad
      this.afterSectionLoadCallback
      this.onSectionSelect
      this.onSectionDeselect
      this.onBlockSelect
      this.onBlockDeselect
      this.onSectionUnload
      this.afterSectionUnloadCallback
      this.onSectionReorder
  
    If you add any events using the manager's registerEventListener,
    e.g. this.registerEventListener(element, 'click', this.functions.handleClick.bind(this)),
    these will be automatically cleaned up after onSectionUnload.
   */

  theme.Sections = new function () {
    var _ = this;

    _._instances = [];
    _._deferredSectionTargets = [];
    _._sections = [];
    _._deferredLoadViewportExcess = 300; // load defferred sections within this many px of viewport
    _._deferredWatcherRunning = false;

    _.init = function () {
      $(document).on('shopify:section:load', function (e) {
        // load a new section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionLoad(target);
        }
      }).on('shopify:section:unload', function (e) {
        // unload existing section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionUnload(target);
        }
      }).on('shopify:section:reorder', function (e) {
        // unload existing section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionReorder(target);
        }
      });
      $(window).on('throttled-scroll.themeSectionDeferredLoader debouncedresize.themeSectionDeferredLoader', _._processDeferredSections);
      _._deferredWatcherRunning = true;
    };

    // register a type of section
    _.register = function (type, section, options) {
      _._sections.push({
        type: type,
        section: section,
        afterSectionLoadCallback: options ? options.afterLoad : null,
        afterSectionUnloadCallback: options ? options.afterUnload : null });


      // load now
      $('[data-section-type="' + type + '"]').each(function () {
        if (Shopify.designMode || options && options.deferredLoad === false || !_._deferredWatcherRunning) {
          _.sectionLoad(this);
        } else {
          _.sectionDeferredLoad(this, options);
        }
      });
    };

    // prepare a section to load later
    _.sectionDeferredLoad = function (target, options) {
      _._deferredSectionTargets.push({
        target: target,
        deferredLoadViewportExcess: options && options.deferredLoadViewportExcess ? options.deferredLoadViewportExcess : _._deferredLoadViewportExcess });

      _._processDeferredSections(true);
    };

    // load deferred sections if in/near viewport
    _._processDeferredSections = function (firstRunCheck) {
      if (_._deferredSectionTargets.length) {
        var viewportTop = $(window).scrollTop(),
        viewportBottom = viewportTop + $(window).height(),
        loopStart = firstRunCheck === true ? _._deferredSectionTargets.length - 1 : 0;
        for (var i = loopStart; i < _._deferredSectionTargets.length; i++) {
          var target = _._deferredSectionTargets[i].target,
          viewportExcess = _._deferredSectionTargets[i].deferredLoadViewportExcess,
          sectionTop = $(target).offset().top - viewportExcess,
          doLoad = sectionTop > viewportTop && sectionTop < viewportBottom;
          if (!doLoad) {
            var sectionBottom = sectionTop + $(target).outerHeight() + viewportExcess * 2;
            doLoad = sectionBottom > viewportTop && sectionBottom < viewportBottom;
          }
          if (doLoad || sectionTop < viewportTop && sectionBottom > viewportBottom) {
            // in viewport, load
            _.sectionLoad(target);
            // remove from deferred queue and resume checks
            _._deferredSectionTargets.splice(i, 1);
            i--;
          }
        }
      }

      // remove event if no more deferred targets left, if not on first run
      if (firstRunCheck !== true && _._deferredSectionTargets.length === 0) {
        _._deferredWatcherRunning = false;
        $(window).off('.themeSectionDeferredLoader');
      }
    };

    // load in a section
    _.sectionLoad = function (target) {
      var target = target,
      sectionObj = _._sectionForTarget(target),
      section = false;

      if (sectionObj.section) {
        section = sectionObj.section;
      } else {
        section = sectionObj;
      }

      if (section !== false) {
        var instance = {
          target: target,
          section: section,
          $shopifySectionContainer: $(target).closest('.shopify-section'),
          thisContext: {
            functions: section.functions,
            registeredEventListeners: [] } };


        instance.thisContext.registerEventListener = _._registerEventListener.bind(instance.thisContext);
        _._instances.push(instance);

        //Initialise any components
        if ($(target).data('components')) {
          //Init each component
          const components = $(target).data('components').split(',');
          components.forEach((component) => {
            $(document).trigger('cc:component:load', [component, target]);
          });
        }

        _._callSectionWith(section, 'onSectionLoad', target, instance.thisContext);
        _._callSectionWith(section, 'afterSectionLoadCallback', target, instance.thisContext);

        // attach additional UI events if defined
        if (section.onSectionSelect) {
          instance.$shopifySectionContainer.on('shopify:section:select', function (e) {
            _._callSectionWith(section, 'onSectionSelect', e.target, instance.thisContext);
          });
        }
        if (section.onSectionDeselect) {
          instance.$shopifySectionContainer.on('shopify:section:deselect', function (e) {
            _._callSectionWith(section, 'onSectionDeselect', e.target, instance.thisContext);
          });
        }
        if (section.onBlockSelect) {
          $(target).on('shopify:block:select', function (e) {
            _._callSectionWith(section, 'onBlockSelect', e.target, instance.thisContext);
          });
        }
        if (section.onBlockDeselect) {
          $(target).on('shopify:block:deselect', function (e) {
            _._callSectionWith(section, 'onBlockDeselect', e.target, instance.thisContext);
          });
        }
      }
    };

    // unload a section
    _.sectionUnload = function (target) {
      var sectionObj = _._sectionForTarget(target);
      var instanceIndex = -1;
      for (var i = 0; i < _._instances.length; i++) {
        if (_._instances[i].target == target) {
          instanceIndex = i;
        }
      }
      if (instanceIndex > -1) {
        var instance = _._instances[instanceIndex];
        // remove events and call unload, if loaded
        $(target).off('shopify:block:select shopify:block:deselect');
        instance.$shopifySectionContainer.off('shopify:section:select shopify:section:deselect');
        _._callSectionWith(instance.section, 'onSectionUnload', target, instance.thisContext);
        _._unloadRegisteredEventListeners(instance.thisContext.registeredEventListeners);
        _._callSectionWith(sectionObj, 'afterSectionUnloadCallback', target, instance.thisContext);
        _._instances.splice(instanceIndex);

        //Destroy any components
        if ($(target).data('components')) {
          //Init each component
          const components = $(target).data('components').split(',');
          components.forEach((component) => {
            $(document).trigger('cc:component:unload', [component, target]);
          });
        }
      } else {
        // check if it was a deferred section
        for (var i = 0; i < _._deferredSectionTargets.length; i++) {
          if (_._deferredSectionTargets[i].target == target) {
            _._deferredSectionTargets[i].splice(i, 1);
            break;
          }
        }
      }
    };

    _.sectionReorder = function (target) {
      var instanceIndex = -1;
      for (var i = 0; i < _._instances.length; i++) {
        if (_._instances[i].target == target) {
          instanceIndex = i;
        }
      }
      if (instanceIndex > -1) {
        var instance = _._instances[instanceIndex];
        _._callSectionWith(instance.section, 'onSectionReorder', target, instance.thisContext);
      }
    };

    // Helpers
    _._registerEventListener = function (element, eventType, callback) {
      element.addEventListener(eventType, callback);
      this.registeredEventListeners.push({
        element,
        eventType,
        callback });

    };

    _._unloadRegisteredEventListeners = function (registeredEventListeners) {
      registeredEventListeners.forEach((rel) => {
        rel.element.removeEventListener(rel.eventType, rel.callback);
      });
    };

    _._callSectionWith = function (section, method, container, thisContext) {
      if (typeof section[method] === 'function') {
        try {
          if (thisContext) {
            section[method].bind(thisContext)(container);
          } else {
            section[method](container);
          }
        } catch (ex) {
          const sectionType = container.dataset['sectionType'];
          console.warn(`Theme warning: '${method}' failed for section '${sectionType}'`);
          console.debug(container, ex);
        }
      }
    };

    _._themeSectionTargetFromShopifySectionTarget = function (target) {
      var $target = $('[data-section-type]:first', target);
      if ($target.length > 0) {
        return $target[0];
      } else {
        return false;
      }
    };

    _._sectionForTarget = function (target) {
      var type = $(target).attr('data-section-type');
      for (var i = 0; i < _._sections.length; i++) {
        if (_._sections[i].type == type) {
          return _._sections[i];
        }
      }
      return false;
    };

    _._sectionAlreadyRegistered = function (type) {
      for (var i = 0; i < _._sections.length; i++) {
        if (_._sections[i].type == type) {
          return true;
        }
      }
      return false;
    };
  }();
  class ccComponent {
    constructor(name) {let cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `.cc-${name}`;
      const _this = this;
      this.instances = [];

      // Initialise any instance of this component within a section
      $(document).on('cc:component:load', function (event, component, target) {
        if (component === name) {
          $(target).find(`${cssSelector}:not(.cc-initialized)`).each(function () {
            _this.init(this);
          });
        }
      });

      // Destroy any instance of this component within a section
      $(document).on('cc:component:unload', function (event, component, target) {
        if (component === name) {
          $(target).find(cssSelector).each(function () {
            _this.destroy(this);
          });
        }
      });

      // Initialise any instance of this component
      $(cssSelector).each(function () {
        _this.init(this);
      });
    }

    init(container) {
      $(container).addClass('cc-initialized');
    }

    destroy(container) {
      $(container).removeClass('cc-initialized');
    }

    registerInstance(container, instance) {
      this.instances.push({
        container,
        instance });

    }

    destroyInstance(container) {
      this.instances = this.instances.filter((item) => {
        if (item.container === container) {
          if (typeof item.instance.destroy === 'function') {
            item.instance.destroy();
          }

          return item.container !== container;
        }
      });
    }}

  /// Show a short-lived text popup above an element
  theme.showQuickPopup = function (message, $origin) {
    var $popup = $('<div class="simple-popup"/>');
    var offs = $origin.offset();
    $popup.html(message).css({ 'left': offs.left, 'top': offs.top }).hide();
    $('body').append($popup);
    $popup.css({ marginTop: -$popup.outerHeight() - 10, marginLeft: -($popup.outerWidth() - $origin.outerWidth()) / 2 });
    $popup.fadeIn(200).delay(3500).fadeOut(400, function () {
      $(this).remove();
    });
  };
  theme.Shopify = {
    formatMoney: function (t, r) {
      function e(t, r) {
        return void 0 === t ? r : t;
      }
      function a(t, r, a, o) {
        if (r = e(r, 2),
        a = e(a, ","),
        o = e(o, "."),
        isNaN(t) || null == t)
        return 0;
        t = (t / 100).toFixed(r);
        var n = t.split(".");
        return n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + a) + (n[1] ? o + n[1] : "");
      }
      "string" == typeof t && (t = t.replace(".", ""));
      var o = "",
      n = /\{\{\s*(\w+)\s*\}\}/,
      i = r || this.money_format;
      switch (i.match(n)[1]) {
        case "amount":
          o = a(t, 2);
          break;
        case "amount_no_decimals":
          o = a(t, 0);
          break;
        case "amount_with_comma_separator":
          o = a(t, 2, ".", ",");
          break;
        case "amount_with_space_separator":
          o = a(t, 2, " ", ",");
          break;
        case "amount_with_period_and_space_separator":
          o = a(t, 2, " ", ".");
          break;
        case "amount_no_decimals_with_comma_separator":
          o = a(t, 0, ".", ",");
          break;
        case "amount_no_decimals_with_space_separator":
          o = a(t, 0, " ", "");
          break;
        case "amount_with_apostrophe_separator":
          o = a(t, 2, "'", ".");
          break;
        case "amount_with_decimal_separator":
          o = a(t, 2, ".", ".");}

      return i.replace(n, o);
    },
    formatImage: function (originalImageUrl, format) {
      return originalImageUrl ? originalImageUrl.replace(/^(.*)\.([^\.]*)$/g, '$1_' + format + '.$2') : '';
    },
    Image: {
      imageSize: function (t) {
        var e = t.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
        return null !== e ? e[1] : null;
      },
      getSizedImageUrl: function (t, e) {
        if (null == e)
        return t;
        if ("master" == e)
        return this.removeProtocol(t);
        var o = t.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
        if (null != o) {
          var i = t.split(o[0]),
          r = o[0];
          return this.removeProtocol(i[0] + "_" + e + r);
        }
        return null;
      },
      removeProtocol: function (t) {
        return t.replace(/http(s)?:/, "");
      } } };


  /**
   * Use with template literals to build HTML with correct escaping.
   *
   * Example:
   *
   * const tve = theme.createTemplateVariableEncoder();
   * tve.add('className', className, 'attribute');
   * tve.add('title', title, 'html');
   * tve.add('richText', richText, 'raw');
   * const template = `
   *   <div class="${tve.values.className}">
   *     <h1>${tve.values.title}</h1>
   *     <div class="rte">${tve.values.richText}</div>
   *   </div>
   * `;
   */
  theme.createTemplateVariableEncoder = function () {
    return {
      utilityElement: document.createElement('div'),
      values: {},
      /**
       * Add a new value to sanitise.
       * @param {String} key - key used to retrieve this value
       * @param {String} value - the value to encode and store
       * @param {String} type - possible values: [attribute, html, raw] - the type of encoding to use
       */
      add: function (key, value, type) {
        switch (type) {
          case 'attribute':
            this.utilityElement.innerHTML = '';
            this.utilityElement.setAttribute('util', value);
            this.values[key] = this.utilityElement.outerHTML.match(/util="([^"]*)"/)[1];
            break;
          case 'html':
            this.utilityElement.innerText = value;
            this.values[key] = this.utilityElement.innerHTML;
            break;
          case 'raw':
            this.values[key] = value;
            break;
          default:
            throw `Type '${type}' not handled`;}

      } };

  };
  class AccordionInstance {
    constructor(container) {
      this.accordion = container;
      this.itemClass = '.cc-accordion-item';
      this.titleClass = '.cc-accordion-item__title';
      this.panelClass = '.cc-accordion-item__panel';
      this.allowMultiOpen = this.accordion.dataset.allowMultiOpen === 'true';

      // If multiple open items not allowed, set open item as active (if there is one)
      if (!this.allowMultiOpen) {
        this.activeItem = this.accordion.querySelector(`${this.itemClass}[open]`);
      }

      this.bindEvents();
    }

    /**
     * Adds inline 'height' style to a panel, to trigger open transition
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    static addPanelHeight(panel) {
      panel.style.height = `${panel.scrollHeight}px`;
    }

    /**
     * Removes inline 'height' style from a panel, to trigger close transition
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    static removePanelHeight(panel) {
      panel.getAttribute('style'); // Fix Safari bug (doesn't remove attribute without this first!)
      panel.removeAttribute('style');
    }

    /**
     * Opens an accordion item
     * @param {HTMLDetailsElement} item - The accordion item
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    open(item, panel) {
      panel.style.height = '0';

      // Set item to open. Blocking the default click action and opening it this way prevents a
      // slight delay which causes the panel height to be set to '0' (because item's not open yet)
      item.open = true;

      AccordionInstance.addPanelHeight(panel);

      // Slight delay required before starting transitions
      setTimeout(() => {
        item.classList.add('is-open');
      }, 10);

      if (!this.allowMultiOpen) {
        // If there's an active item and it's not the opened item, close it
        if (this.activeItem && this.activeItem !== item) {
          const activePanel = this.activeItem.querySelector(this.panelClass);
          this.close(this.activeItem, activePanel);
        }

        this.activeItem = item;
      }
    }

    /**
     * Closes an accordion item
     * @param {HTMLDetailsElement} item - The accordion item
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    close(item, panel) {
      AccordionInstance.addPanelHeight(panel);

      item.classList.remove('is-open');
      item.classList.add('is-closing');

      if (this.activeItem === item) {
        this.activeItem = null;
      }

      // Slight delay required to allow scroll height to be applied before changing to '0'
      setTimeout(() => {
        panel.style.height = '0';
      }, 10);
    }

    /**
     * Handles 'click' event on the accordion
     * @param {Object} e - The event object
     */
    handleClick(e) {
      // Ignore clicks outside a toggle (<summary> element)
      const toggle = e.target.closest(this.titleClass);
      if (!toggle) return;

      // Prevent the default action
      // We'll trigger it manually after open transition initiated or close transition complete
      e.preventDefault();

      const item = toggle.parentNode;
      const panel = toggle.nextElementSibling;

      if (item.open) {
        this.close(item, panel);
      } else {
        this.open(item, panel);
      }
    }

    /**
     * Handles 'transitionend' event in the accordion
     * @param {Object} e - The event object
     */
    handleTransition(e) {
      // Ignore transitions not on a panel element
      if (!e.target.matches(this.panelClass)) return;

      const panel = e.target;
      const item = panel.parentNode;

      if (item.classList.contains('is-closing')) {
        item.classList.remove('is-closing');
        item.open = false;
      }

      AccordionInstance.removePanelHeight(panel);
    }

    bindEvents() {
      // Need to assign the function calls to variables because bind creates a new function,
      // which means the event listeners can't be removed in the usual way
      this.clickHandler = this.handleClick.bind(this);
      this.transitionHandler = this.handleTransition.bind(this);

      this.accordion.addEventListener('click', this.clickHandler);
      this.accordion.addEventListener('transitionend', this.transitionHandler);
    }

    destroy() {
      this.accordion.removeEventListener('click', this.clickHandler);
      this.accordion.removeEventListener('transitionend', this.transitionHandler);
    }}


  class Accordion extends ccComponent {
    constructor() {let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'accordion';let cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `.cc-${name}`;
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new AccordionInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new Accordion();
  class CustomSelectInstance {
    constructor(el) {
      this.el = el;
      this.button = el.querySelector('.cc-select__btn');
      this.listbox = el.querySelector('.cc-select__listbox');
      this.options = el.querySelectorAll('.cc-select__option');
      this.selectedOption = el.querySelector('[aria-selected="true"]');
      this.nativeSelect = document.getElementById(`${el.id}-native`);
      this.swatches = 'swatch' in this.options[this.options.length - 1].dataset;
      this.focusedClass = 'is-focused';
      this.searchString = '';
      this.listboxOpen = false;

      // Set the selected option
      if (!this.selectedOption) {
        this.selectedOption = this.listbox.firstElementChild;
      }

      this.bindEvents();
      this.setButtonWidth();
    }

    bindEvents() {
      this.el.addEventListener('keydown', this.handleKeydown.bind(this));
      this.el.addEventListener('selectOption', this.handleSelectOption.bind(this));
      this.button.addEventListener('mousedown', this.handleMousedown.bind(this));
    }

    /**
     * Adds event listeners when the options list is visible
     */
    addListboxOpenEvents() {
      this.mouseoverHandler = this.handleMouseover.bind(this);
      this.mouseleaveHandler = this.handleMouseleave.bind(this);
      this.clickHandler = this.handleClick.bind(this);
      this.blurHandler = this.handleBlur.bind(this);

      this.listbox.addEventListener('mouseover', this.mouseoverHandler);
      this.listbox.addEventListener('mouseleave', this.mouseleaveHandler);
      this.listbox.addEventListener('click', this.clickHandler);
      this.listbox.addEventListener('blur', this.blurHandler);
    }

    /**
     * Removes event listeners added when the options list was visible
     */
    removeListboxOpenEvents() {
      this.listbox.removeEventListener('mouseover', this.mouseoverHandler);
      this.listbox.removeEventListener('mouseleave', this.mouseleaveHandler);
      this.listbox.removeEventListener('click', this.clickHandler);
      this.listbox.removeEventListener('blur', this.blurHandler);
    }

    /**
     * Handles a 'keydown' event on the custom select element
     * @param {Object} e - The event object
     */
    handleKeydown(e) {
      if (this.listboxOpen) {
        this.handleKeyboardNav(e);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        this.showListbox();
      }
    }

    /**
     * Handles a 'mousedown' event on the button element
     * @param {Object} e - The event object
     */
    handleMousedown(e) {
      if (!this.listboxOpen && e.button === 0) {
        this.showListbox();
      }
    }

    /**
     * Handles a 'mouseover' event on the options list
     * @param {Object} e - The event object
     */
    handleMouseover(e) {
      if (e.target.matches('li')) {
        this.focusOption(e.target);
      }
    }

    /**
     * Handles a 'mouseleave' event on the options list
     */
    handleMouseleave() {
      this.focusOption(this.selectedOption);
    }

    /**
     * Handles a 'click' event on the options list
     * @param {Object} e - The event object
     */
    handleClick(e) {
      if (e.target.matches('.js-option')) {
        this.selectOption(e.target);
      }
    }

    /**
     * Handles a 'blur' event on the options list
     */
    handleBlur() {
      if (this.listboxOpen) {
        this.hideListbox();
      }
    }

    /**
     * Handles a 'keydown' event on the options list
     * @param {Object} e - The event object
     */
    handleKeyboardNav(e) {
      let optionToFocus;

      // Disable tabbing if options list is open (as per native select element)
      if (e.key === 'Tab') {
        e.preventDefault();
      }

      switch (e.key) {
        // Focus an option
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();

          if (e.key === 'ArrowUp') {
            optionToFocus = this.focusedOption.previousElementSibling;
          } else {
            optionToFocus = this.focusedOption.nextElementSibling;
          }

          if (optionToFocus && !optionToFocus.classList.contains('is-disabled')) {
            this.focusOption(optionToFocus);
          }
          break;

        // Select an option
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.selectOption(this.focusedOption);
          break;

        // Cancel and close the options list
        case 'Escape':
          e.preventDefault();
          this.hideListbox();
          break;

        // Search for an option and focus the first match (if one exists)
        default:
          optionToFocus = this.findOption(e.key);

          if (optionToFocus) {
            this.focusOption(optionToFocus);
          }
          break;}

    }

    /**
     * Sets the button width to the same as the longest option, to prevent
     * the button width from changing depending on the option selected
     */
    setButtonWidth() {
      // Get the width of an element without side padding
      const getUnpaddedWidth = (el) => {
        const elStyle = getComputedStyle(el);
        return parseFloat(elStyle.paddingLeft) + parseFloat(elStyle.paddingRight);
      };

      const buttonPadding = getUnpaddedWidth(this.button);
      const optionPadding = getUnpaddedWidth(this.selectedOption);
      const buttonBorder = this.button.offsetWidth - this.button.clientWidth;
      const optionWidth = Math.ceil(this.selectedOption.getBoundingClientRect().width);

      this.button.style.width = `${optionWidth - optionPadding + buttonPadding + buttonBorder}px`;
    }

    /**
     * Shows the options list
     */
    showListbox() {
      this.listbox.hidden = false;
      this.listboxOpen = true;

      this.el.classList.add('is-open');
      this.button.setAttribute('aria-expanded', 'true');
      this.listbox.setAttribute('aria-hidden', 'false');

      // Slight delay required to prevent blur event being fired immediately
      setTimeout(() => {
        this.focusOption(this.selectedOption);
        this.listbox.focus();

        this.addListboxOpenEvents();
      }, 10);
    }

    /**
     * Hides the options list
     */
    hideListbox() {
      if (!this.listboxOpen) return;

      this.listbox.hidden = true;
      this.listboxOpen = false;

      this.el.classList.remove('is-open');
      this.button.setAttribute('aria-expanded', 'false');
      this.listbox.setAttribute('aria-hidden', 'true');

      if (this.focusedOption) {
        this.focusedOption.classList.remove(this.focusedClass);
        this.focusedOption = null;
      }

      this.button.focus();
      this.removeListboxOpenEvents();
    }

    /**
     * Finds a matching option from a typed string
     * @param {string} key - The key pressed
     * @returns {?HTMLElement}
     */
    findOption(key) {
      this.searchString += key;

      // If there's a timer already running, clear it
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }

      // Wait 500ms to see if another key is pressed, if not then clear the search string
      this.searchTimer = setTimeout(() => {
        this.searchString = '';
      }, 500);

      // Find an option that contains the search string (if there is one)
      const matchingOption = [...this.options].find((option) => {
        const label = option.innerText.toLowerCase();
        return label.includes(this.searchString) && !option.classList.contains('is-disabled');
      });

      return matchingOption;
    }

    /**
     * Focuses an option
     * @param {HTMLElement} option - The <li> element of the option to focus
     */
    focusOption(option) {
      // Remove focus on currently focused option (if there is one)
      if (this.focusedOption) {
        this.focusedOption.classList.remove(this.focusedClass);
      }

      // Set focus on the option
      this.focusedOption = option;
      this.focusedOption.classList.add(this.focusedClass);

      // If option is out of view, scroll the list
      if (this.listbox.scrollHeight > this.listbox.clientHeight) {
        const scrollBottom = this.listbox.clientHeight + this.listbox.scrollTop;
        const optionBottom = option.offsetTop + option.offsetHeight;

        if (optionBottom > scrollBottom) {
          this.listbox.scrollTop = optionBottom - this.listbox.clientHeight;
        } else if (option.offsetTop < this.listbox.scrollTop) {
          this.listbox.scrollTop = option.offsetTop;
        }
      }
    }

    /**
     * Handles a 'selectOption' event on the custom select element
     * @param {Object} e - The event object (pass value in detail.value)
     */
    handleSelectOption(e) {
      const matchingOption = [...this.options].find((option) => option.dataset.value === e.detail.value);
      if (matchingOption) {
        this.selectOption(matchingOption);
      }
    }

    /**
     * Selects an option
     * @param {HTMLElement} option - The option <li> element
     */
    selectOption(option) {
      if (option !== this.selectedOption) {
        // Switch aria-selected attribute to selected option
        option.setAttribute('aria-selected', 'true');
        this.selectedOption.setAttribute('aria-selected', 'false');

        // Update swatch colour in the button
        if (this.swatches) {
          if (option.dataset.swatch) {
            this.button.dataset.swatch = option.dataset.swatch;
          } else {
            this.button.removeAttribute('data-swatch');
          }
        }

        // Update the button text and set the option as active
        this.button.firstChild.textContent = option.firstElementChild.textContent;
        this.listbox.setAttribute('aria-activedescendant', option.id);
        this.selectedOption = document.getElementById(option.id);

        // If a native select element exists, update its selected value and trigger a 'change' event
        if (this.nativeSelect) {
          this.nativeSelect.value = option.dataset.value;
          this.nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          // Trigger a 'change' event on the custom select element
          const detail = { selectedValue: option.dataset.value };
          this.el.dispatchEvent(new CustomEvent('change', { bubbles: true, detail }));
        }
      }

      this.hideListbox();
    }}


  class CustomSelect extends ccComponent {
    constructor() {let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'custom-select';let cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `.cc-select`;
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new CustomSelectInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new CustomSelect();
  class FacetFiltersInstance {
    constructor(el) {
      this.filteringEnabled = el.dataset.filtering === 'true';
      this.sortingEnabled = el.dataset.sorting === 'true';

      this.filtersControl = document.querySelector('.cc-filters-control');
      this.filtersContainer = document.querySelector('.cc-filters-container');
      this.results = document.querySelector('.cc-filters-results');

      if (this.filteringEnabled) {
        this.filters = document.querySelector('.cc-filters');
        this.filtersFooter = document.querySelector('.cc-filters__footer');
        this.activeFilters = document.querySelector('.cc-active-filters');
        this.clearFiltersBtn = document.querySelector('.js-clear-filters');
      }

      if (this.sortingEnabled) {
        this.sortBy = document.querySelector('.cc-filter--sort');
        this.activeSortText = document.querySelector('.cc-sort-selected');
      }

      this.utils = {
        hidden: 'is-hidden',
        loading: 'is-loading',
        open: 'is-open',
        filtersOpen: 'filters-open' };


      if (this.filteringEnabled && !this.filtersFooter.classList.contains(this.utils.hidden)) {
        this.filters.style.height = `calc(100% - ${this.filtersFooter.offsetHeight}px)`;
      }

      this.bindEvents();
    }

    bindEvents() {
      this.filtersControl.addEventListener('click', this.handleControlClick.bind(this));
      this.filtersContainer.addEventListener('click', this.handleFiltersClick.bind(this));
      this.filtersContainer.addEventListener('input', this.debounce(this.handleFilterChange.bind(this), 500));

      if (this.filteringEnabled) {
        if (document.querySelector('.cc-price-range')) {
          this.filtersContainer.addEventListener('change', this.debounce(this.handleFilterChange.bind(this), 500));
        }

        this.activeFilters.addEventListener('click', this.handleActiveFiltersClick.bind(this));
      }

      document.addEventListener('click', this.handleClickOutside.bind(this));
      window.addEventListener('popstate', this.handleHistoryChange.bind(this));
    }

    debounce(fn, wait) {var _this2 = this;
      let timer;

      return function () {for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(_this2, args), wait);
      };
    }

    /**
     * Handles 'click' event on the filter/sort buttons (mobile only)
     * @param {Object} e - The event object
     */
    handleControlClick(e) {
      if (!e.target.matches('.cc-filters-control__btn')) return;
      document.body.classList.add(this.utils.filtersOpen);

      if (e.target.matches('.js-show-filters')) {
        this.filters.classList.add(this.utils.open);
      } else {
        this.sortBy.open = true;

        // Slight delay required before starting transition
        setTimeout(() => {
          this.sortBy.classList.add(this.utils.open);
        }, 10);
      }
    }

    /**
     * Handles 'click' event on the filters container
     * @param {Object} e - The event object
     */
    handleFiltersClick(e) {
      const { target } = e;
      const filter = target.closest('.cc-filter');

      // Filter 'clear' button clicked
      if (target.matches('.cc-filter-clear-btn')) {
        e.preventDefault();
        this.applyFilters(new URL(e.target.href).searchParams.toString(), e);
        return;
      }

      // Filters/Sort 'close' button, '[x] results' button or 'apply' button clicked (mobile only)
      if (target.matches('.js-close-filters')) {
        if (filter) {
          // Delay to allow for filter closing transition
          setTimeout(() => {
            filter.classList.remove(this.utils.open);
            filter.open = false;
          }, 300);
        }

        if (this.filteringEnabled) {
          this.filters.classList.remove(this.utils.open);
        }

        document.body.classList.remove(this.utils.filtersOpen);
        return;
      }

      if (target.matches('.cc-filter__toggle') || target.matches('.cc-filter-back-btn')) {
        const openFilter = document.querySelector(`.cc-filter[open]:not([data-index="${filter.dataset.index}"])`);

        // If a filter was opened (tablet/desktop) and there's one already open, close it
        if (openFilter) {
          this.closeFilter(openFilter, false);
        }

        // Open/close the filter, class added to allow for css transition
        if (!filter.classList.contains(this.utils.open)) {
          setTimeout(() => {
            filter.classList.add(this.utils.open);
          }, 10);
        } else {
          e.preventDefault();
          this.closeFilter(filter);
        }
      }
    }

    /**
     * Handles 'click' event outside the filters (tablet/desktop)
     * @param {Object} e - The event object
     */
    handleClickOutside(e) {
      const openFilter = document.querySelector(`.cc-filter.${this.utils.open}`);

      // If there's a filter open and the click event wasn't on it, close it (tablet/desktop)
      if (openFilter) {
        const filter = e.target.closest('.cc-filter');

        if (!filter || filter !== openFilter) {
          this.closeFilter(openFilter);
        }
      }
    }

    /**
     * Handles 'input' and 'change' events on the filters and sort by
     * @param {Object} e - The event object
     */
    handleFilterChange(e) {
      // Ignore 'change' events not triggered by user moving the price range slider
      if (e.type === 'change' && (!e.detail || e.detail.sender !== 'theme:component:price_range')) return;

      // If price min/max input value changed, dispatch 'change' event to trigger update of the slider
      if (e.type === 'input' && e.target.classList.contains('cc-price-range__input')) {
        e.target.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const formData = new FormData(document.getElementById('filters'));
      const searchParams = new URLSearchParams(formData);

      this.applyFilters(searchParams.toString(), e);
    }

    /**
     * Handles 'click' event on the active filters
     * @param {Object} e - The event object
     */
    handleActiveFiltersClick(e) {
      e.preventDefault();

      if (e.target.tagName === 'A') {
        this.applyFilters(new URL(e.target.href).searchParams.toString(), e);
      }
    }

    /**
     * Handles history changes (e.g. back button clicked)
     * @param {Object} e - The event object
     */
    handleHistoryChange(e) {
      let searchParams = '';

      if (e.state && e.state.searchParams) {
        searchParams = e.state.searchParams;
      }

      this.applyFilters(searchParams, null, false);
    }

    /**
     * Fetches the filtered/sorted page data and updates the current page
     * @param {string} searchParams - The filter/sort search parameters
     * @param {Object} e - The event object
     * @param {boolean} [updateUrl=true] - Whether to update the url with the selected filter/sort options
     */
    applyFilters(searchParams, e) {let updateUrl = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      this.results.classList.add(this.utils.loading);

      fetch(`${window.location.pathname}?${searchParams}`).
      then((response) => response.text()).
      then((responseText) => {
        const html = responseText;
        // Note: DOMParser.parseFromString behaviour is broken in iOS 15, returning incomplete content when referenced immediately
        const fetchedHTML = document.implementation.createHTMLDocument();
        fetchedHTML.documentElement.innerHTML = html;

        if (fetchedHTML.querySelector('.cc-facet-filters')) {
          this.updateFilters(fetchedHTML, e);
        }
        this.results.innerHTML = fetchedHTML.querySelector('.cc-filters-results').innerHTML;
        document.dispatchEvent(new CustomEvent('filters-applied', { bubbles: true }));
        this.results.classList.remove(this.utils.loading);
      });

      if (updateUrl) {
        this.updateURL(searchParams);
      }
    }

    /**
     * Updates the filters relevant to the fetched data
     * @param {html} fetchedHTML - HTML of the fetched page
     * @param {Object} e - The event object
     */
    updateFilters(fetchedHTML, e) {
      // Update the Filter/Sort buttons (mobile only)
      this.filtersControl.innerHTML = fetchedHTML.querySelector('.cc-filters-control').innerHTML;

      // Update the 'selected' option in the 'Sort by' dropdown button (tablet/desktop)
      if (e && e.target.name === 'sort_by') {
        this.activeSortText.textContent = e.target.nextElementSibling.textContent;
      }

      if (!this.filteringEnabled) return;

      document.querySelectorAll('.cc-filter').forEach((filter) => {
        const { index } = filter.dataset;
        if (index === '0') return; // Sort by

        const fetchedFilter = fetchedHTML.querySelector(`.cc-filter[data-index="${index}"]`);

        if (filter.dataset.type === 'price_range') {
          this.updateFilter(filter, fetchedFilter, false);

          if (!e || e.target.tagName !== 'INPUT') {
            // Update price fields and trigger update of slider
            filter.querySelectorAll('input').forEach((input) => {
              input.value = fetchedHTML.getElementById(input.id).value;
              input.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { sender: 'reset' } }));
            });
          }
        } else {
          if (e && e.target.tagName === 'INPUT') {
            const changedFilter = e.target.closest('.cc-filter');

            this.updateFilter(filter, fetchedFilter, filter.dataset.index !== changedFilter.dataset.index);
          } else {
            this.updateFilter(filter, fetchedFilter, true);
          }
        }
      });

      // Update the active filters
      this.updateActiveFilters(fetchedHTML);

      // Update the 'Clear all' button visibility (mobile only)
      this.clearFiltersBtn.hidden = fetchedHTML.querySelector('.js-clear-filters').hidden;

      // Update the '[x] results' button (mobile only)
      const footerEl = fetchedHTML.querySelector('.cc-filters__footer');
      const footerHidden = footerEl.classList.contains(this.utils.hidden);
      this.filtersFooter.innerHTML = footerEl.innerHTML;
      this.filtersFooter.classList.toggle(this.utils.hidden, footerHidden);
      this.filters.style.height = footerHidden ? null : `calc(100% - ${this.filtersFooter.offsetHeight}px)`;
    }

    /**
     * Updates a filter
     * @param {HTMLElement} filter - The filter element
     * @param {HTMLElement} fetchedFilter - The fetched filter element
     * @param {boolean} updateAll - Whether to update all filter markup or just toggle/header
     */
    updateFilter(filter, fetchedFilter, updateAll) {
      if (updateAll) {
        filter.innerHTML = fetchedFilter.innerHTML;
      } else {
        // Update toggle and header only
        filter.replaceChild(fetchedFilter.querySelector('.cc-filter__toggle'), filter.querySelector('.cc-filter__toggle'));
        filter.querySelector('.cc-filter__header').innerHTML = fetchedFilter.querySelector('.cc-filter__header').innerHTML;
      }
    }

    /**
     * Updates the active filter
     * @param {html} fetchedHTML - HTML of the fetched page
     */
    updateActiveFilters(fetchedHTML) {
      const activeFilters = fetchedHTML.querySelector('.cc-active-filters');

      this.activeFilters.innerHTML = activeFilters.innerHTML;
      this.activeFilters.hidden = !this.activeFilters.querySelector('.cc-active-filter');
    }

    /**
     * Updates the url with the current filter/sort parameters
     * @param {string} searchParams - The filter/sort parameters
     */
    updateURL(searchParams) {
      history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
    }

    /**
     * Closes a filter
     * @param {HTMLElement} filter - The filter element
     * @param {boolean} [delay=true] - Whether to wait for the css transition
     */
    closeFilter(filter) {let delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      clearTimeout(this.closeTimer);
      filter.classList.remove(this.utils.open);

      // Delay to allow for filter closing transition
      this.closeTimer = setTimeout(() => {
        filter.open = false;
      }, delay ? 300 : null);
    }}


  class FacetFilters extends ccComponent {
    constructor() {let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'facet-filters';let cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `.cc-facet-filters`;
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new FacetFiltersInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new FacetFilters();


  class PriceRangeInstance {
    constructor(container) {
      this.container = container;

      this.selectors = {
        inputMin: '.cc-price-range__input--min',
        inputMax: '.cc-price-range__input--max',
        control: '.cc-price-range__control',
        controlMin: '.cc-price-range__control--min',
        controlMax: '.cc-price-range__control--max',
        bar: '.cc-price-range__bar',
        activeBar: '.cc-price-range__bar-active' };


      this.controls = {
        min: {
          barControl: container.querySelector(this.selectors.controlMin),
          input: container.querySelector(this.selectors.inputMin) },

        max: {
          barControl: container.querySelector(this.selectors.controlMax),
          input: container.querySelector(this.selectors.inputMax) } };



      this.controls.min.value = parseInt(
      this.controls.min.input.value === '' ? this.controls.min.input.placeholder : this.controls.min.input.value);


      this.controls.max.value = parseInt(
      this.controls.max.input.value === '' ? this.controls.max.input.placeholder : this.controls.max.input.value);


      this.valueMin = this.controls.min.input.min;
      this.valueMax = this.controls.min.input.max;
      this.valueRange = this.valueMax - this.valueMin;

      [this.controls.min, this.controls.max].forEach((item) => {
        item.barControl.setAttribute('aria-valuemin', this.valueMin);
        item.barControl.setAttribute('aria-valuemax', this.valueMax);
      });

      this.controls.min.barControl.setAttribute('aria-valuenow', this.controls.min.value);
      this.controls.max.barControl.setAttribute('aria-valuenow', this.controls.max.value);

      this.bar = container.querySelector(this.selectors.bar);
      this.activeBar = container.querySelector(this.selectors.activeBar);
      this.inDrag = false;

      this.bindEvents();
      this.render();
    }

    getPxToValueRatio() {
      return this.bar.clientWidth / (this.valueMax - this.valueMin);
    }

    getPcToValueRatio() {
      return 100.0 / (this.valueMax - this.valueMin);
    }

    setActiveControlValue(value, reset) {
      // Clamp & default
      if (this.activeControl === this.controls.min) {
        if (value === '') {
          value = this.valueMin;
        }

        value = Math.max(this.valueMin, value);
        value = Math.min(value, this.controls.max.value);
      } else {
        if (value === '') {
          value = this.valueMax;
        }

        value = Math.min(this.valueMax, value);
        value = Math.max(value, this.controls.min.value);
      }

      // Round
      this.activeControl.value = Math.round(value);

      // Update input
      if (this.activeControl.input.value != this.activeControl.value) {
        if (this.activeControl.value == this.activeControl.input.placeholder) {
          this.activeControl.input.value = '';
        } else {
          this.activeControl.input.value = this.activeControl.value;
        }

        if (!reset) {
          this.activeControl.input.dispatchEvent(
          new CustomEvent('change', { bubbles: true, detail: { sender: 'theme:component:price_range' } }));

        }
      }

      // A11y
      this.activeControl.barControl.setAttribute('aria-valuenow', this.activeControl.value);
    }

    render() {
      this.drawControl(this.controls.min);
      this.drawControl(this.controls.max);
      this.drawActiveBar();
    }

    drawControl(control) {
      control.barControl.style.left = `${(control.value - this.valueMin) * this.getPcToValueRatio()}%`;
    }

    drawActiveBar() {
      this.activeBar.style.left = `${(this.controls.min.value - this.valueMin) * this.getPcToValueRatio()}%`;
      this.activeBar.style.right = `${(this.valueMax - this.controls.max.value) * this.getPcToValueRatio()}%`;
    }

    handleControlTouchStart(e) {
      e.preventDefault();
      this.startDrag(e.target, e.touches[0].clientX);
      this.boundControlTouchMoveEvent = this.handleControlTouchMove.bind(this);
      this.boundControlTouchEndEvent = this.handleControlTouchEnd.bind(this);
      window.addEventListener('touchmove', this.boundControlTouchMoveEvent);
      window.addEventListener('touchend', this.boundControlTouchEndEvent);
    }

    handleControlTouchMove(e) {
      this.moveDrag(e.touches[0].clientX);
    }

    handleControlTouchEnd(e) {
      e.preventDefault();
      window.removeEventListener('touchmove', this.boundControlTouchMoveEvent);
      window.removeEventListener('touchend', this.boundControlTouchEndEvent);
      this.stopDrag();
    }

    handleControlMouseDown(e) {
      e.preventDefault();
      this.startDrag(e.target, e.clientX);
      this.boundControlMouseMoveEvent = this.handleControlMouseMove.bind(this);
      this.boundControlMouseUpEvent = this.handleControlMouseUp.bind(this);
      window.addEventListener('mousemove', this.boundControlMouseMoveEvent);
      window.addEventListener('mouseup', this.boundControlMouseUpEvent);
    }

    handleControlMouseMove(e) {
      this.moveDrag(e.clientX);
    }

    handleControlMouseUp(e) {
      e.preventDefault();
      window.removeEventListener('mousemove', this.boundControlMouseMoveEvent);
      window.removeEventListener('mouseup', this.boundControlMouseUpEvent);
      this.stopDrag();
    }

    startDrag(target, startX) {
      this.activeControl = this.controls.min.barControl === target ? this.controls.min : this.controls.max;
      this.dragStartX = startX;
      this.dragStartValue = this.activeControl.value;
      this.inDrag = true;
    }

    moveDrag(moveX) {
      if (this.inDrag) {
        const value = this.dragStartValue + (moveX - this.dragStartX) / this.getPxToValueRatio();
        this.setActiveControlValue(value);
        this.render();
      }
    }

    stopDrag() {
      this.inDrag = false;
    }

    handleInputChange(e) {
      if (e.target.tagName !== 'INPUT') return;

      if (!e.detail || e.detail.sender !== 'theme:component:price_range') {
        const reset = e.detail && e.detail.sender === 'reset';

        this.activeControl = this.controls.min.input === e.target ? this.controls.min : this.controls.max;
        this.setActiveControlValue(e.target.value, reset);
        this.render();
      }
    }

    bindEvents() {
      [this.controls.min, this.controls.max].forEach((item) => {
        item.barControl.addEventListener('touchstart', this.handleControlTouchStart.bind(this));
        item.barControl.addEventListener('mousedown', this.handleControlMouseDown.bind(this));
      });

      this.container.addEventListener('change', this.handleInputChange.bind(this));
    }

    destroy() {}}


  class PriceRange extends ccComponent {
    constructor() {let name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'price-range';let cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : `.cc-${name}`;
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new PriceRangeInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new PriceRange();
  class GiftCardRecipient extends HTMLElement {
    constructor() {
      super();
      this.recipientCheckbox = null;
      this.recipientFields = null;
      this.recipientEmail = null;
    }

    connectedCallback() {
      if (!document.querySelector('html').classList.contains('no-js')) {
        this.recipientEmail = this.querySelector('[name="properties[Recipient email]"]');
        this.recipientEmailLabel = this.querySelector(`label[for="${this.recipientEmail.id}"]`);
        // When JS is enabled, the recipientEmail field changes from optional to required
        // For themes using labels
        if (this.recipientEmailLabel && this.recipientEmailLabel.dataset.jsLabel) {
          this.recipientEmailLabel.innerText = this.recipientEmailLabel.dataset.jsLabel;
        }
        // For themes using placeholders
        if (this.recipientEmail.dataset.jsPlaceholder) {
          this.recipientEmail.placeholder = this.recipientEmail.dataset.jsPlaceholder;
          this.recipientEmail.ariaLabel = this.recipientEmail.dataset.jsAriaLabel;
        }

        this.recipientCheckbox = this.querySelector('.cc-gift-card-recipient__checkbox');
        this.recipientFields = this.querySelector('.cc-gift-card-recipient__fields');

        this.recipientCheckbox.addEventListener('change', () => this.synchronizeProperties());
        this.synchronizeProperties();
      }
    }

    synchronizeProperties() {
      if (this.recipientCheckbox.checked) {
        this.recipientFields.style.display = 'block';
        // The 'required' attribute is not set in HTML because the recipientEmail field is optional when JS is disabled
        this.recipientEmail.setAttribute('required', '');
      } else {
        this.recipientFields.style.display = 'none';
        this.recipientEmail.removeAttribute('required');
      }
    }}


  if (!window.customElements.get('gift-card-recipient')) {
    window.customElements.define('gift-card-recipient', GiftCardRecipient);
  }
  class ccPopup {
    constructor($container, namespace) {
      this.$container = $container;
      this.namespace = namespace;
      this.cssClasses = {
        visible: 'cc-popup--visible',
        bodyNoScroll: 'cc-popup-no-scroll',
        bodyNoScrollPadRight: 'cc-popup-no-scroll-pad-right' };

    }

    /**
     * Open popup on timer / local storage - move focus to input ensure you can tab to submit and close
     * Add the cc-popup--visible class
     * Update aria to visible
     */
    open(callback) {
      // Prevent the body from scrolling
      if (this.$container.data('freeze-scroll')) {
        clearTimeout(theme.ccPopupRemoveScrollFreezeTimeoutId);
        $('body').addClass(this.cssClasses.bodyNoScroll);

        // Add any padding necessary to the body to compensate for the scrollbar that just disappeared
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'popup-scrollbar-measure';
        document.body.appendChild(scrollDiv);
        var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        if (scrollbarWidth > 0) {
          $('body').css('padding-right', scrollbarWidth + 'px').addClass(this.cssClasses.bodyNoScrollPadRight);
        }
      }

      // Add reveal class
      this.$container.addClass(this.cssClasses.visible);

      // Track previously focused element
      this.previouslyActiveElement = document.activeElement;

      // Focus on the close button after the animation in has completed
      setTimeout(() => {
        this.$container.find('.cc-popup-close')[0].focus();
      }, 500);

      // Pressing escape closes the modal
      $(window).on('keydown' + this.namespace, (event) => {
        if (event.keyCode === 27) {
          this.close();
        }
      });

      if (callback) {
        callback();
      }
    }

    /**
     * Close popup on click of close button or background - where does the focus go back to?
     * Remove the cc-popup--visible class
     */
    close(callback) {
      // Remove reveal class
      this.$container.removeClass(this.cssClasses.visible);

      // Revert focus
      if (this.previouslyActiveElement) {
        $(this.previouslyActiveElement).focus();
      }

      // Destroy the escape event listener
      $(window).off('keydown' + this.namespace);

      // Allow the body to scroll and remove any scrollbar-compensating padding, if no other scroll-freeze popups are visible
      const $visibleFreezePopups = $('.' + this.cssClasses.visible).filter(() => {return this.$container.data('freeze-scroll');});
      if ($visibleFreezePopups.length === 0) {
        let transitionDuration = 500;

        const $innerModal = this.$container.find('.cc-popup-modal');
        if ($innerModal.length) {
          transitionDuration = parseFloat(getComputedStyle($innerModal[0])['transitionDuration']);
          if (transitionDuration && transitionDuration > 0) {
            transitionDuration *= 1000;
          }
        }

        theme.ccPopupRemoveScrollFreezeTimeoutId = setTimeout(() => {
          $('body').removeClass(this.cssClasses.bodyNoScroll).removeClass(this.cssClasses.bodyNoScrollPadRight).css('padding-right', '0');
        }, transitionDuration);
      }

      if (callback) {
        callback();
      }
    }}
  ;
  // Initialise and observe animate on scroll
  if (document.body.classList.contains('cc-animate-enabled')) {
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
      const initAnimateOnScroll = () => {
        const animatableElems = document.querySelectorAll('[data-cc-animate]:not(.cc-animate-init)');
        if (animatableElems.length > 0) {
          const intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              // In view and hasn't been animated yet
              if (entry.isIntersecting && !entry.target.classList.contains('cc-animate-in')) {
                entry.target.classList.add('cc-animate-in');
                observer.unobserve(entry.target);
              }
            });
          });

          // Initialise and observe each animatable element
          animatableElems.forEach((elem) => {
            // Set the animation delay
            if (elem.dataset.ccAnimateDelay) {
              elem.style.animationDelay = elem.dataset.ccAnimateDelay;
            }

            // Set the animation duration
            if (elem.dataset.ccAnimateDuration) {
              elem.style.animationDuration = elem.dataset.ccAnimateDuration;
            }

            // Init the animation
            if (elem.dataset.ccAnimate) {
              elem.classList.add(elem.dataset.ccAnimate);
            }

            elem.classList.add('cc-animate-init');

            // Watch for elem
            intersectionObserver.observe(elem);
          });
        }
      };

      const aosMinWidth = getComputedStyle(document.documentElement).getPropertyValue('--aos-min-width') || '0';
      const mq = window.matchMedia(`(min-width: ${aosMinWidth}px)`);
      if (mq.matches) {
        initAnimateOnScroll();

        // Check for more animatable elements when the DOM mutates
        document.addEventListener('DOMContentLoaded', () => {
          const observer = new MutationObserver(theme.debounce(initAnimateOnScroll, 250));
          observer.observe(document.body, { subtree: true, childList: true });
        });
      } else {
        document.body.classList.remove('cc-animate-enabled');

        try {
          mq.addEventListener('change', (event) => {
            if (event.matches) {
              document.body.classList.add('cc-animate-enabled');
              setTimeout(initAnimateOnScroll, 100);
            }
          });
        } catch (e) {
          // Legacy browsers (Safari < 14), rely on the animations being shown by the line above the try {
        }
      }
    } else {
      // Reveal all the animations
      document.body.classList.remove('cc-animate-enabled');
    }
  }


  theme.MapSection = new function () {
    var _ = this;
    _.config = {
      zoom: 14,
      styles: {
        default: [],
        silver: [{ "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }],
        retro: [{ "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c9b2a6" }] }, { "featureType": "administrative.land_parcel", "elementType": "geometry.stroke", "stylers": [{ "color": "#dcd2be" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#ae9e90" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#93817c" }] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#a5b076" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#447530" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#f5f1e6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#fdfcf8" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#f8c967" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#e9bc62" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#e98d58" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [{ "color": "#db8555" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#806b63" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{ "color": "#8f7d77" }] }, { "featureType": "transit.line", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ebe3cd" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#b9d3c2" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#92998d" }] }],
        dark: [{ "elementType": "geometry", "stylers": [{ "color": "#212121" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] }, { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] }, { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }],
        night: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }],
        aubergine: [{ "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] }, { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }] }, { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] }, { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] }, { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#023e58" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#3C7680" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] }, { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ce" }] }, { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#023e58" }] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] }, { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#283d6a" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#3a4762" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }] } };


    _.apiStatus = null;

    this.geolocate = function ($map) {
      var deferred = $.Deferred();
      var geocoder = new google.maps.Geocoder();
      var address = $map.data('address-setting');

      geocoder.geocode({ address: address }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
          deferred.reject(status);
        }

        deferred.resolve(results);
      });

      return deferred;
    };

    this.createMap = function (container) {
      var $map = $('.map-section__map-container', container);

      return _.geolocate($map).
      then(
      function (results) {
        var mapOptions = {
          zoom: _.config.zoom,
          styles: _.config.styles[$(container).data('map-style')],
          center: results[0].geometry.location,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          disableDefaultUI: true,
          zoomControl: !$map.data('hide-zoom') };


        _.map = new google.maps.Map($map[0], mapOptions);
        _.center = _.map.getCenter();

        var marker = new google.maps.Marker({
          map: _.map,
          position: _.center,
          clickable: false });


        google.maps.event.addDomListener(window, 'resize', function () {
          google.maps.event.trigger(_.map, 'resize');
          _.map.setCenter(_.center);
        });
      }.bind(this)).

      fail(function () {
        var errorMessage;

        switch (status) {
          case 'ZERO_RESULTS':
            errorMessage = theme.strings.addressNoResults;
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = theme.strings.addressQueryLimit;
            break;
          default:
            errorMessage = theme.strings.addressError;
            break;}


        // Only show error in the theme editor
        if (Shopify.designMode) {
          var $mapContainer = $map.parents('.map-section');

          $mapContainer.addClass('page-width map-section--load-error');
          $mapContainer.
          find('.map-section__wrapper').
          html(
          '<div class="errors text-center">' + errorMessage + '</div>');

        }
      });
    };

    this.onSectionLoad = function (target) {
      var $container = $(target);
      // Global function called by Google on auth errors
      window.gm_authFailure = function () {
        if (!Shopify.designMode) return;

        $container.addClass('page-width map-section--load-error');
        $container.
        find('.map-section__wrapper').
        html(
        '<div class="errors text-center">' + theme.strings.authError + '</div>');

      };

      // create maps
      var key = $container.data('api-key');

      if (typeof key !== 'string' || key === '') {
        return;
      }

      // load map
      theme.loadScriptOnce('https://maps.googleapis.com/maps/api/js?key=' + key, function () {
        _.createMap($container);
      });
    };

    this.onSectionUnload = function (target) {
      if (typeof window.google !== 'undefined' && typeof google.maps !== 'undefined') {
        google.maps.event.clearListeners(_.map, 'resize');
      }
    };
  }();

  // Register the section
  cc.sections.push({
    name: 'map',
    section: theme.MapSection });

  // Manage videos
  theme.VideoManager = new function () {
    let _ = this;

    _.videos = {
      incrementor: 0,
      videoData: {} };


    _._loadYoutubeVideos = function (container) {
      $('.video-container[data-video-type="youtube"]:not(.video--init)', container).each(function () {
        $(this).addClass('video--init');
        _.videos.incrementor++;
        let containerId = 'theme-yt-video-' + _.videos.incrementor;
        $(this).data('video-container-id', containerId);
        let autoplay = $(this).data('video-autoplay');
        let loop = $(this).data('video-loop');
        let videoId = $(this).data('video-id');
        let isBackgroundVideo = $(this).hasClass('video-container--background');

        let ytURLSearchParams = new URLSearchParams('iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&enablejsapi=1&playslinline=1');
        ytURLSearchParams.append('origin', location.origin);
        ytURLSearchParams.append('playlist', videoId);
        ytURLSearchParams.append('loop', loop ? 1 : 0);
        ytURLSearchParams.append('autoplay', 0);
        ytURLSearchParams.append('controls', isBackgroundVideo ? 0 : 1);
        let widgetid = _.videos.incrementor;
        ytURLSearchParams.append('widgetid', widgetid);

        let src = 'https://www.youtube.com/embed/' + videoId + '?' + ytURLSearchParams.toString();

        let $videoElement = $('<iframe class="video-container__video-element" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">').attr({
          id: containerId,
          width: 640,
          height: 360,
          tabindex: isBackgroundVideo ? '-1' : null }).
        appendTo($('.video-container__video', this));

        _.videos.videoData[containerId] = {
          type: 'yt',
          id: containerId,
          container: this,
          mute: () => $videoElement[0].contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*'),
          play: () => $videoElement[0].contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*'),
          pause: () => $videoElement[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*'),
          stop: () => $videoElement[0].contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*'),
          seekTo: (to) => $videoElement[0].contentWindow.postMessage(`{"event":"command","func":"seekTo","args":[${to},true]}`, '*'),
          videoElement: $videoElement[0],
          isBackgroundVideo: isBackgroundVideo,
          establishedYTComms: false };


        if (autoplay) {
          $videoElement.on('load', () => setTimeout(() => {
            // set up imitation JS API and watch for play event
            window.addEventListener('message', (message) => {
              if (message.origin === 'https://www.youtube.com' && message.data && typeof message.data === 'string') {
                let data = JSON.parse(message.data);

                if (data.event === 'initialDelivery' && data.info && data.info.duration) {
                  _.videos.videoData[containerId].duration = data.info.duration;
                }

                if (data.event === 'infoDelivery' && data.channel === 'widget' && data.id === widgetid) {
                  _.videos.videoData[containerId].establishedYTComms = true;
                  // playing - add class
                  if (data.info && data.info.playerState === 1) {
                    $(this).addClass('video-container--playing');
                  }

                  // loop if in final second
                  if (loop && data.info && data.info.currentTime > _.videos.videoData[containerId].duration - 1) {
                    _.videos.videoData[containerId].seekTo(0);
                  }
                }
              }
            });
            $videoElement[0].contentWindow.postMessage(`{"event":"listening","id":${widgetid},"channel":"widget"}`, '*');

            // mute and play
            _.videos.videoData[containerId].mute();
            _.videos.videoData[containerId].play();

            // if no message received in 2s, assume comms failure and that video is playing
            setTimeout(() => {
              if (!_.videos.videoData[containerId].establishedYTComms) {
                $(this).addClass('video-container--playing');
              }
            }, 2000);
          }, 100));
        }

        if (isBackgroundVideo) {
          $videoElement.attr('tabindex', '-1');
          _._initBackgroundVideo(_.videos.videoData[containerId]);

          // hack only needed for YT BG videos
          _.addYTPageshowListenerHack();
        }

        $videoElement.attr('src', src);

        fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent($(this).data('video-url'))).
        then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).
        then((response) => {
          if (response.width && response.height) {
            $videoElement.attr({ width: response.width, height: response.height });
            if (_.videos.videoData[containerId].assessBackgroundVideo) {
              _.videos.videoData[containerId].assessBackgroundVideo();
            }
          }
        });
      });
    };

    _._loadVimeoVideos = function (container) {
      $('.video-container[data-video-type="vimeo"]:not(.video--init)', container).each(function () {
        $(this).addClass('video--init');
        _.videos.incrementor++;
        var containerId = 'theme-vi-video-' + _.videos.incrementor;
        $(this).data('video-container-id', containerId);
        var autoplay = $(this).data('video-autoplay');
        let loop = $(this).data('video-loop');
        let videoId = $(this).data('video-id');
        let isBackgroundVideo = $(this).hasClass('video-container--background');

        let viURLSearchParams = new URLSearchParams();
        if (autoplay) {
          viURLSearchParams.append('muted', 1);
        }
        if (loop) {
          viURLSearchParams.append('loop', 1);
        }
        if (isBackgroundVideo) {
          viURLSearchParams.append('controls', 0);
        }

        let src = 'https://player.vimeo.com/video/' + videoId + '?' + viURLSearchParams.toString();

        let $videoElement = $('<iframe class="video-container__video-element" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">').attr({
          id: containerId,
          width: 640,
          height: 360,
          tabindex: isBackgroundVideo ? '-1' : null }).
        appendTo($('.video-container__video', this));

        _.videos.videoData[containerId] = {
          type: 'vimeo',
          id: containerId,
          container: this,
          play: () => $videoElement[0].contentWindow.postMessage('{"method":"play"}', '*'),
          pause: () => $videoElement[0].contentWindow.postMessage('{"method":"pause"}', '*'),
          videoElement: $videoElement[0],
          isBackgroundVideo: isBackgroundVideo,
          establishedVimeoComms: false };


        if (autoplay) {
          $videoElement.on('load', () => setTimeout(() => {
            // set up imitation JS API and watch for play event
            window.addEventListener('message', (message) => {
              if (message.origin !== 'https://player.vimeo.com') return;
              if (message.source !== $videoElement[0].contentWindow) return;
              if (!message.data) return;

              let data = message.data;
              if (typeof data === 'string') {
                data = JSON.parse(data);
              }

              if (data.method === 'ping' || data.event === 'playing') {
                _.videos.videoData[containerId].establishedVimeoComms = true;
              }

              if (data.event === 'playing') {
                $(this).addClass('video-container--playing');
              }
            });
            $videoElement[0].contentWindow.postMessage({ method: 'addEventListener', value: 'playing' }, '*');
            $videoElement[0].contentWindow.postMessage({ method: 'appendVideoMetadata', value: location.origin }, '*');
            $videoElement[0].contentWindow.postMessage({ method: 'ping' }, '*');

            // play video
            _.videos.videoData[containerId].play();

            // if no message received in 2s, assume comms failure and that video is playing
            setTimeout(() => {
              if (!_.videos.videoData[containerId].establishedVimeoComms) {
                $(this).addClass('video-container--playing');
              }
            }, 2000);
          }, 100));
        }

        if (isBackgroundVideo) {
          $videoElement.attr('tabindex', '-1');
          _._initBackgroundVideo(_.videos.videoData[containerId]);
        }

        $videoElement.attr('src', src);

        fetch('https://vimeo.com/api/oembed.json?url=' + encodeURIComponent($(this).data('video-url'))).
        then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        }).
        then((response) => {
          if (response.width && response.height) {
            $videoElement.attr({ width: response.width, height: response.height });
            if (_.videos.videoData[containerId].assessBackgroundVideo) {
              _.videos.videoData[containerId].assessBackgroundVideo();
            }
          }
        });
      });
    };

    _._loadMp4Videos = function (container) {
      $('.video-container[data-video-type="mp4"]:not(.video--init)', container).addClass('video--init').each(function () {
        _.videos.incrementor++;
        var containerId = 'theme-mp-video-' + _.videos.incrementor;
        var $container = $(this);
        $(this).data('video-container-id', containerId);
        var $videoElement = $('<div class="video-container__video-element">').attr('id', containerId).
        appendTo($('.video-container__video', this));
        var autoplay = $(this).data('video-autoplay');
        let isBackgroundVideo = $(this).hasClass('video-container--background');

        var $video = $('<video playsinline>');
        if ($(this).data('video-loop')) {
          $video.attr('loop', 'loop');
        }
        $video.on('click mouseenter', () => $video.attr('controls', 'controls'));
        if (autoplay) {
          $video.attr({ autoplay: 'autoplay', muted: 'muted' });
          $video[0].muted = true; // required by Chrome - ignores attribute
          $video.one('loadeddata', function () {
            this.play();
            $container.addClass('video-container--playing');
          });
        }

        if ($(this).data('video-url')) {
          $video.attr('src', $(this).data('video-url'));
        }
        if ($(this).data('video-sources')) {
          const sources = $(this).data('video-sources').split('|');
          for (let i = 0; i < sources.length; i++) {
            const [format, mimeType, url] = sources[i].split(' ');
            // only use HLS if not looping
            if (format === 'm3u8' && $(this).data('video-loop')) {
              continue;
            }
            $('<source>').attr({ src: url, type: mimeType }).appendTo($video);
          }
        }
        $video.appendTo($videoElement);

        const videoData = _.videos.videoData[containerId] = {
          type: 'mp4',
          element: $video[0],
          play: () => $video[0].play(),
          pause: () => $video[0].pause(),
          isBackgroundVideo: isBackgroundVideo };



        if (isBackgroundVideo) {
          $video.attr('tabindex', '-1');
          if (autoplay) {
            // Support playing background videos in low power mode
            container.addEventListener('click', videoData.play, { once: true });
          }
        }
      });
    };

    // background video placement for iframes
    _._initBackgroundVideo = function (videoData) {
      if (videoData.container.classList.contains('video-container--background')) {
        videoData.assessBackgroundVideo = function () {
          var cw = this.offsetWidth,
          ch = this.offsetHeight,
          cr = cw / ch,
          frame = this.querySelector('iframe'),
          vr = parseFloat(frame.width) / parseFloat(frame.height),
          pan = this.querySelector('.video-container__video'),
          vCrop = 75; // pushes video outside container to hide controls
          if (cr > vr) {
            var vh = cw / vr + vCrop * 2;
            pan.style.marginTop = (ch - vh) / 2 - vCrop + 'px';
            pan.style.marginInlineStart = '';
            pan.style.height = vh + vCrop * 2 + 'px';
            pan.style.width = '';
          } else {
            var ph = ch + vCrop * 2;
            var pw = ph * vr;
            pan.style.marginTop = -vCrop + 'px';
            pan.style.marginInlineStart = (cw - pw) / 2 + 'px';
            pan.style.height = ph + 'px';
            pan.style.width = pw + 'px';
          }
        }.bind(videoData.container);
        videoData.assessBackgroundVideo();
        $(window).on('debouncedresize.' + videoData.id, videoData.assessBackgroundVideo);

        // Support playing background videos in low power mode
        videoData.container.addEventListener('click', videoData.play, { once: true });
      }
    };

    _._unloadVideos = function (container) {
      for (let dataKey in _.videos.videoData) {
        let data = _.videos.videoData[dataKey];
        if ($(container).find(data.container).length) {
          delete _.videos.videoData[dataKey];
          return;
        }
      }
    };

    // Compatibility with Sections
    this.onSectionLoad = function (container) {
      // url only - infer type
      $('.video-container[data-video-url]:not([data-video-type])').each(function () {
        var url = $(this).data('video-url');

        if (url.indexOf('.mp4') > -1) {
          $(this).attr('data-video-type', 'mp4');
        }

        if (url.indexOf('vimeo.com') > -1) {
          $(this).attr('data-video-type', 'vimeo');
          $(this).attr('data-video-id', url.split('?')[0].split('/').pop());
        }

        if (url.indexOf('youtu.be') > -1 || url.indexOf('youtube.com') > -1) {
          $(this).attr('data-video-type', 'youtube');
          if (url.indexOf('v=') > -1) {
            $(this).attr('data-video-id', url.split('v=').pop().split('&')[0]);
          } else {
            $(this).attr('data-video-id', url.split('?')[0].split('/').pop());
          }
        }
      });

      _._loadYoutubeVideos(container);
      _._loadVimeoVideos(container);
      _._loadMp4Videos(container);

      // play button
      $('.video-container__play', container).on('click', function (evt) {
        evt.preventDefault();
        var $container = $(this).closest('.video-container');
        // reveal
        $container.addClass('video-container--playing');

        // broadcast a play event on the section container
        $container.trigger("cc:video:play");

        // play
        var id = $container.data('video-container-id');
        _.videos.videoData[id].play();
      });

      // modal close button
      $('.video-container__stop', container).on('click', function (evt) {
        evt.preventDefault();
        var $container = $(this).closest('.video-container');
        // hide
        $container.removeClass('video-container--playing');

        // broadcast a stop event on the section container
        $container.trigger("cc:video:stop");

        // stop
        var id = $container.data('video-container-id');
        _.videos.videoData[id].pause();
      });
    };

    this.onSectionUnload = function (container) {
      $('.video-container__play, .video-container__stop', container).off('click');
      $(window).off('.' + $('.video-container').data('video-container-id'));
      $(window).off('debouncedresize.video-manager-resize');
      _._unloadVideos(container);
      $(container).trigger("cc:video:stop");
    };

    _.addYTPageshowListenerHack = function () {
      if (!_.pageshowListenerAdded) {
        _.pageshowListenerAdded = true;
        window.addEventListener('pageshow', (event) => {
          if (event.persisted) {
            // A playing YT video shows a black screen when loaded from bfcache on iOS
            Object.keys(_.videos.videoData).
            filter((key) => _.videos.videoData[key].type === 'yt' && _.videos.videoData[key].isBackgroundVideo).
            forEach((key) => {
              _.videos.videoData[key].stop();
              _.videos.videoData[key].play();
            });
          }
        });
      }
    };
  }();

  // Register the section
  cc.sections.push({
    name: 'video',
    section: theme.VideoManager });

  theme.CollapsibleTabs = new function () {
    this.onSectionLoad = function (container) {
      this.functions.notifyFaqHeaderOfChange();
    };

    this.onSectionReorder = function (container) {
      this.functions.notifyFaqHeaderOfChange();
    };

    this.onSectionUnload = function (container) {
      this.functions.notifyFaqHeaderOfChange();
    };

    this.functions = {
      notifyFaqHeaderOfChange: function () {
        document.dispatchEvent(
        new CustomEvent('theme:faq-header-update', { bubbles: true, cancelable: false }));

      } };

  }();

  // Register section
  cc.sections.push({
    name: 'collapsible-tabs',
    section: theme.CollapsibleTabs,
    deferredLoad: false });

  theme.FaqHeader = new function () {
    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.container = container;

      this.classNames = {
        questionContainerInactive: 'faq-search-item-inactive',
        sectionWithIndexStatus: 'section-faq-header--with-index' };


      this.searchInput = this.container.querySelector('.faq-search__input');
      if (this.searchInput) {
        this.registerEventListener(this.searchInput, 'change', this.functions.performSearch.bind(this));
        this.registerEventListener(this.searchInput, 'keyup', this.functions.performSearch.bind(this));
        this.registerEventListener(this.searchInput, 'paste', this.functions.performSearch.bind(this));
      }

      this.functions.debouncedBuildIndex = theme.debounce(this.functions.buildIndex.bind(this), 50);
      this.registerEventListener(document, 'theme:faq-header-update', this.functions.debouncedBuildIndex);
      this.functions.debouncedBuildIndex();

      if (this.container.querySelector('.faq-index')) {
        this.registerEventListener(this.container, 'click', this.functions.handleIndexClick.bind(this));
        this.container.closest('.section-faq-header').classList.add(this.classNames.sectionWithIndexStatus);
        this.functions.resizeIndex.call(this);
        this.registerEventListener(window, 'resize', theme.debounce(this.functions.resizeIndex.bind(this), 250));
      }
    };

    this.onSectionReorder = function (container) {
      this.functions.debouncedBuildIndex();
    };

    this.functions = {
      buildIndex: function () {
        const faqHeaderSection = this.container.closest('.section-faq-header'),
        indexContainer = this.container.querySelector('.faq-index__item-container');

        if (indexContainer) {
          indexContainer.querySelectorAll('.faq-index-item').forEach((element) => {
            element.parentNode.removeChild(element);
          });
        }

        this.linkedCollapsibleTabs = [];
        this.linkedQuestionContainers = [];
        this.linkedContent = [];

        let currentElement = faqHeaderSection;
        while (currentElement.nextElementSibling && currentElement.nextElementSibling.classList.contains('section-collapsible-tabs')) {
          currentElement = currentElement.nextElementSibling;

          // build list of searchable content
          this.linkedCollapsibleTabs.push(currentElement);
          currentElement.querySelectorAll('.collapsible-tabs__tab').forEach((element) => this.linkedQuestionContainers.push(element));
          currentElement.querySelectorAll('.collapsible-tabs__content').forEach((element) => this.linkedContent.push(element));

          // build index UI
          if (indexContainer) {
            const currentElementHeading = currentElement.querySelector('.collapsible-tabs__heading');
            if (currentElementHeading) {
              const tve = theme.createTemplateVariableEncoder();
              tve.add('title_id', currentElementHeading.id, 'attribute');
              tve.add('title', currentElementHeading.innerHTML, 'raw');

              const html = `
              <div class="faq-index-item">
                <a class="faq-index-item__link" href="#${tve.values.title_id}">${tve.values.title}</a>
              </div>`;
              const htmlFragment = document.createRange().createContextualFragment(html);
              indexContainer.appendChild(htmlFragment);
            }
          }
        }

        if (indexContainer) {
          this.functions.resizeIndex.call(this);
        }
      },

      resizeIndex: function () {
        const stickyContainer = this.container.querySelector('.faq-index__sticky-container'),
        faqHeaderSection = this.container.closest('.section-faq-header');

        let currentElement = faqHeaderSection;
        while (currentElement.nextElementSibling && currentElement.nextElementSibling.classList.contains('section-collapsible-tabs')) {
          currentElement = currentElement.nextElementSibling;
        }

        const stickyContainerRect = stickyContainer.getBoundingClientRect(),
        currentElementRect = currentElement.getBoundingClientRect();

        stickyContainer.style.height = currentElementRect.bottom - stickyContainerRect.top + 'px';
      },

      performSearch: function () {
        // defer to avoid input lag
        setTimeout(() => {
          const splitValue = this.searchInput.value.split(' ');

          // sanitise terms
          let terms = [];
          splitValue.forEach((t) => {
            if (t.length > 0) {
              terms.push(t.toLowerCase());
            }
          });

          // search
          this.linkedQuestionContainers.forEach((element) => {
            if (terms.length) {
              let termFound = false;
              const matchContent = element.textContent.toLowerCase();
              terms.forEach((term) => {
                if (matchContent.indexOf(term) >= 0) {
                  termFound = true;
                }
              });
              if (termFound) {
                element.classList.remove(this.classNames.questionContainerInactive);
              } else {
                element.classList.add(this.classNames.questionContainerInactive);
              }
            } else {
              element.classList.remove(this.classNames.questionContainerInactive);
            }
          });

          // hide non-question content if doing a search
          this.linkedContent.forEach((element) => {
            if (terms.length) {
              element.classList.add(this.classNames.questionContainerInactive);
            } else {
              element.classList.remove(this.classNames.questionContainerInactive);
            }
          });
        }, 10);
      },

      handleIndexClick: function (evt) {
        if (evt.target.classList.contains('faq-index-item__link')) {
          evt.preventDefault();
          const id = evt.target.href.split('#')[1];
          const scrollTarget = document.getElementById(id);
          let scrollTargetY = scrollTarget.getBoundingClientRect().top + window.pageYOffset - 50;

          // sticky header offset
          const stickyHeight = getComputedStyle(document.documentElement).getPropertyValue('--theme-sticky-header-height');
          if (stickyHeight) {
            scrollTargetY -= parseInt(stickyHeight);
          }

          window.scrollTo({
            top: scrollTargetY,
            behavior: 'smooth' });

        }
      } };

  }();

  // Register section
  cc.sections.push({
    name: 'faq-header',
    section: theme.FaqHeader,
    deferredLoad: false });

  /**
   * Popup Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace Popup
   */

  theme.Popup = new function () {
    /**
     * Popup section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */

    var dismissedStorageKey = 'cc-theme-popup-dismissed';

    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.popup = new ccPopup(this.$container, this.namespace);

      var dismissForDays = this.$container.data('dismiss-for-days'),
      delaySeconds = this.$container.data('delay-seconds'),
      showPopup = true,
      testMode = this.$container.data('test-mode'),
      lastDismissed = window.localStorage.getItem(dismissedStorageKey);

      // Should we show it during this page view?
      // Check when it was last dismissed
      if (lastDismissed) {
        var dismissedDaysAgo = (new Date().getTime() - lastDismissed) / (1000 * 60 * 60 * 24);
        if (dismissedDaysAgo < dismissForDays) {
          showPopup = false;
        }
      }

      // Check for error or success messages
      if (this.$container.find('.cc-popup-form__response').length) {
        showPopup = true;
        delaySeconds = 1;

        // If success, set as dismissed
        if (this.$container.find('.cc-popup-form__response--success').length) {
          this.functions.popupSetAsDismissed.call(this);
        }
      }

      // Prevent popup on Shopify robot challenge page
      if (document.querySelector('.shopify-challenge__container')) {
        showPopup = false;
      }

      // Show popup, if appropriate
      if (showPopup || testMode) {
        setTimeout(() => {
          this.popup.open();
        }, delaySeconds * 1000);
      }

      // Click on close button or modal background
      this.$container.on('click' + this.namespace, '.cc-popup-close, .cc-popup-background', () => {
        this.popup.close(() => {
          this.functions.popupSetAsDismissed.call(this);
        });
      });
    };

    this.onSectionSelect = function () {
      this.popup.open();
    };

    this.functions = {
      /**
       * Use localStorage to set as dismissed
       */
      popupSetAsDismissed: function () {
        window.localStorage.setItem(dismissedStorageKey, new Date().getTime());
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
    };
  }();

  // Register section
  cc.sections.push({
    name: 'newsletter-popup',
    section: theme.Popup });

  /**
   * StoreAvailability Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace StoreAvailability
   */

  theme.StoreAvailability = function (container) {
    const loadingClass = 'store-availability-loading';
    const initClass = 'store-availability-initialized';
    const storageKey = 'cc-location';

    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.productId = this.$container.data('store-availability-container');
      this.sectionUrl = this.$container.data('section-url');
      this.$modal;

      this.$container.addClass(initClass);
      this.transitionDurationMS = parseFloat(getComputedStyle(container).transitionDuration) * 1000;
      this.removeFixedHeightTimeout = -1;

      // Handle when a variant is selected
      $(window).on(`cc-variant-updated${this.namespace}${this.productId}`, (e, args) => {
        if (args.product.id === this.productId) {
          this.functions.updateContent.bind(this)(
          args.variant ? args.variant.id : null,
          args.product.title,
          this.$container.data('has-only-default-variant'),
          args.variant && typeof args.variant.available !== "undefined");
          if(document.body.classList.contains("template-product") &&  document.querySelector("#calculate") != null) window.handleVariantChange && window.handleVariantChange(args)
        }
      });

      // Handle single variant products
      if (this.$container.data('single-variant-id')) {
        this.functions.updateContent.bind(this)(
        this.$container.data('single-variant-id'),
        this.$container.data('single-variant-product-title'),
        this.$container.data('has-only-default-variant'),
        this.$container.data('single-variant-product-available'));

      }
    };

    this.onSectionUnload = function () {
      $(window).off(`cc-variant-updated${this.namespace}${this.productId}`);
      this.$container.off('click');
      if (this.$modal) {
        this.$modal.off('click');
      }
    };

    this.functions = {
      // Returns the users location data (if allowed)
      getUserLocation: function () {
        return new Promise((resolve, reject) => {
          let storedCoords;

          if (sessionStorage[storageKey]) {
            storedCoords = JSON.parse(sessionStorage[storageKey]);
          }

          if (storedCoords) {
            resolve(storedCoords);

          } else {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
              function (position) {
                const coords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude };


                //Set the localization api
                fetch('/localization.json', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json' },

                  body: JSON.stringify(coords) });


                //Write to a session storage
                sessionStorage[storageKey] = JSON.stringify(coords);

                resolve(coords);
              }, function () {
                resolve(false);
              }, {
                maximumAge: 3600000, // 1 hour
                timeout: 5000 });


            } else {
              resolve(false);
            }
          }
        });
      },

      // Requests the available stores and calls the callback
      getAvailableStores: function (variantId, cb) {
        return $.get(this.sectionUrl.replace('VARIANT_ID', variantId), cb);
      },

      // Haversine Distance
      // The haversine formula is an equation giving great-circle distances between
      // two points on a sphere from their longitudes and latitudes
      calculateDistance: function (coords1, coords2, unitSystem) {
        var dtor = Math.PI / 180;
        var radius = unitSystem === 'metric' ? 6378.14 : 3959;

        var rlat1 = coords1.latitude * dtor;
        var rlong1 = coords1.longitude * dtor;
        var rlat2 = coords2.latitude * dtor;
        var rlong2 = coords2.longitude * dtor;

        var dlon = rlong1 - rlong2;
        var dlat = rlat1 - rlat2;

        var a =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(rlat1) * Math.cos(rlat2) * Math.pow(Math.sin(dlon / 2), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
      },

      // Updates the existing modal pickup with locations with distances from the user
      updateLocationDistances: function (coords) {
        const unitSystem = this.$modal.find('[data-unit-system]').data('unit-system');
        const self = this;

        this.$modal.find('[data-distance="false"]').each(function () {
          const thisCoords = {
            latitude: parseFloat($(this).data('latitude')),
            longitude: parseFloat($(this).data('longitude')) };


          if (thisCoords.latitude && thisCoords.longitude) {
            const distance = self.functions.calculateDistance(
            coords, thisCoords, unitSystem).toFixed(1);

            $(this).html(distance);

            //Timeout to trigger animation
            setTimeout(() => {
              $(this).closest('.store-availability-list__location__distance').addClass('-in');
            }, 0);
          }

          $(this).attr('data-distance', 'true');
        });
      },

      // Requests the available stores and updates the page with info below Add to Basket, and append the modal to the page
      updateContent: function (variantId, productTitle, isSingleDefaultVariant, isVariantAvailable) {
        this.$container.off('click', '[data-store-availability-modal-open]');
        this.$container.off('click' + this.namespace, '.cc-popup-close, .cc-popup-background');
        $('.store-availabilities-modal').remove();

        if (!isVariantAvailable) {
          //If the variant is Unavailable (not the same as Out of Stock) - hide the store pickup completely
          this.$container.addClass(loadingClass);
          if (this.transitionDurationMS > 0) {
            this.$container.css('height', '0px');
          }
        } else {
          this.$container.addClass(loadingClass);
          if (this.transitionDurationMS > 0) {
            this.$container.css('height', this.$container.outerHeight() + 'px');
          }
        }

        if (isVariantAvailable) {
          this.functions.getAvailableStores.call(this, variantId, (response) => {
            if (response.trim().length > 0 && !response.includes('NO_PICKUP')) {
              this.$container.html(response);
              this.$container.html(this.$container.children().first().html()); // editor bug workaround

              this.$container.find('[data-store-availability-modal-product-title]').html(productTitle);

              if (isSingleDefaultVariant) {
                this.$container.find('.store-availabilities-modal__variant-title').remove();
              }

              this.$container.find('.cc-popup').appendTo('body');

              this.$modal = $('body').find('.store-availabilities-modal');
              const popup = new ccPopup(this.$modal, this.namespace);

              this.$container.on('click', '[data-store-availability-modal-open]', () => {
                popup.open();

                //When the modal is opened, try and get the users location
                this.functions.getUserLocation().then((coords) => {
                  if (coords && this.$modal.find('[data-distance="false"]').length) {
                    //Re-retrieve the available stores location modal contents
                    this.functions.getAvailableStores.call(this, variantId, (response) => {
                      this.$modal.find('.store-availabilities-list').html($(response).find('.store-availabilities-list').html());
                      this.functions.updateLocationDistances.bind(this)(coords);
                    });
                  }
                });

                return false;
              });

              this.$modal.on('click' + this.namespace, '.cc-popup-close, .cc-popup-background', () => {
                popup.close();
              });

              this.$container.removeClass(loadingClass);

              if (this.transitionDurationMS > 0) {
                let newHeight = this.$container.find('.store-availability-container').outerHeight();
                this.$container.css('height', newHeight > 0 ? newHeight + 'px' : '');
                clearTimeout(this.removeFixedHeightTimeout);
                this.removeFixedHeightTimeout = setTimeout(() => {
                  this.$container.css('height', '');
                }, this.transitionDurationMS);
              }
            }
          });
        }
      } };


    // Initialise the section when it's instantiated
    this.onSectionLoad(container);
  };

  // Register section
  cc.sections.push({
    name: 'store-availability',
    section: theme.StoreAvailability });




  /*================ Feature detection ================*/

  try {
    theme.shopifyFeatures = JSON.parse(document.documentElement.querySelector('#shopify-features').textContent);
  } catch (e) {
    theme.shopifyFeatures = {};
  }

  /*================ Slate ================*/
  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   * to users with visual impairments.
   *
   *
   * @namespace a11y
   */

  slate.a11y = {

    /**
     * For use when focus shifts to a container rather than a link
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects if focusing a link, just $link.focus();
     *
     * @param {JQuery} $element - The element to be acted upon
     */
    pageLinkFocus: function ($element) {
      var focusClass = 'js-focus-hidden';

      $element.first().
      attr('tabIndex', '-1').
      focus().
      addClass(focusClass).
      one('blur', callback);

      function callback() {
        $element.first().
        removeClass(focusClass).
        removeAttr('tabindex');
      }
    },

    /**
     * If there's a hash in the url, focus the appropriate element
     */
    focusHash: function () {
      var hash = window.location.hash;

      // is there a hash in the url? is it an element on the page?
      if (hash && document.getElementById(hash.slice(1))) {
        this.pageLinkFocus($(hash));
      }
    },

    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     */
    bindInPageLinks: function () {
      $('a[href*=#]').on('click', function (evt) {
        this.pageLinkFocus($(evt.currentTarget.hash));
      }.bind(this));
    },

    /**
     * Traps the focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    trapFocus: function (options) {
      var eventName = options.namespace ?
      'focusin.' + options.namespace :
      'focusin';

      if (!options.$elementToFocus) {
        options.$elementToFocus = options.$container;
      }

      options.$container.attr('tabindex', '-1');
      options.$elementToFocus.focus();

      $(document).on(eventName, function (evt) {
        if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
          options.$container.focus();
        }
      });
    },

    /**
     * Removes the trap of focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    removeTrapFocus: function (options) {
      var eventName = options.namespace ?
      'focusin.' + options.namespace :
      'focusin';

      if (options.$container && options.$container.length) {
        options.$container.removeAttr('tabindex');
      }

      $(document).off(eventName);
    } };

  ;
  /**
   * Cart Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the Cart template.
   *
   * @namespace cart
   */

  slate.cart = {

    /**
     * Browser cookies are required to use the cart. This function checks if
     * cookies are enabled in the browser.
     */
    cookiesEnabled: function () {
      var cookieEnabled = navigator.cookieEnabled;

      if (!cookieEnabled) {
        document.cookie = 'testcookie';
        cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
      }
      return cookieEnabled;
    } };

  ;
  /**
   * Utility helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions for dealing with arrays and objects
   *
   * @namespace utils
   */

  slate.utils = {

    /**
     * Return an object from an array of objects that matches the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
    findInstance: function (array, key, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
    },

    /**
     * Remove an object from an array of objects by matching the provided key and value
     *
     * @param {array} array - Array of objects
     * @param {string} key - Key to match the value against
     * @param {string} value - Value to get match of
     */
    removeInstance: function (array, key, value) {
      var i = array.length;
      while (i--) {
        if (array[i][key] === value) {
          array.splice(i, 1);
          break;
        }
      }

      return array;
    },

    /**
     * _.compact from lodash
     * Remove empty/false items from array
     * Source: https://github.com/lodash/lodash/blob/master/compact.js
     *
     * @param {array} array
     */
    compact: function (array) {
      var index = -1;
      var length = array == null ? 0 : array.length;
      var resIndex = 0;
      var result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[resIndex++] = value;
        }
      }
      return result;
    },

    /**
     * _.defaultTo from lodash
     * Checks `value` to determine whether a default value should be returned in
     * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
     * or `undefined`.
     * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
     *
     * @param {*} value - Value to check
     * @param {*} defaultValue - Default value
     * @returns {*} - Returns the resolved value
     */
    defaultTo: function (value, defaultValue) {
      return value == null || value !== value ? defaultValue : value;
    } };

  ;
  /**
   * Rich Text Editor
   * -----------------------------------------------------------------------------
   * Wrap iframes and tables in div tags to force responsive/scrollable layout.
   *
   * @namespace rte
   */

  slate.rte = {
    /**
     * Wrap tables in a container div to make them scrollable when needed
     *
     * @param {object} options - Options to be used
     * @param {jquery} options.$tables - jquery object(s) of the table(s) to wrap
     * @param {string} options.tableWrapperClass - table wrapper class name
     */
    wrapTable: function (options) {
      var tableWrapperClass = typeof options.tableWrapperClass === "undefined" ? '' : options.tableWrapperClass;

      options.$tables.wrap('<div class="' + tableWrapperClass + '"></div>');
    },

    /**
     * Wrap iframes in a container div to make them responsive
     *
     * @param {object} options - Options to be used
     * @param {jquery} options.$iframes - jquery object(s) of the iframe(s) to wrap
     * @param {string} options.iframeWrapperClass - class name used on the wrapping div
     */
    wrapIframe: function (options) {
      var iframeWrapperClass = typeof options.iframeWrapperClass === "undefined" ? '' : options.iframeWrapperClass;

      options.$iframes.each(function () {
        // Add wrapper to make video responsive
        $(this).wrap('<div class="' + iframeWrapperClass + '"></div>');

        // Re-set the src attribute on each iframe after page load
        // for Chrome's "incorrect iFrame content on 'back'" bug.
        // https://code.google.com/p/chromium/issues/detail?id=395791
        // Need to specifically target video and admin bar
        this.src = this.src;
      });
    } };

  ;
  /**
   * Image Helper Functions
   * -----------------------------------------------------------------------------
   * A collection of functions that help with basic image operations.
   *
   */

  slate.Image = function () {

    /**
     * Preloads an image in memory and uses the browsers cache to store it until needed.
     *
     * @param {Array} images - A list of image urls
     * @param {String} size - A shopify image size attribute
     */

    function preload(images, size) {
      if (typeof images === 'string') {
        images = [images];
      }

      for (var i = 0; i < images.length; i++) {
        var image = images[i];
        this.loadImage(this.getSizedImageUrl(image, size));
      }
    }

    /**
     * Loads and caches an image in the browsers cache.
     * @param {string} path - An image url
     */
    function loadImage(path) {
      new Image().src = path;
    }

    /**
     * Find the Shopify image attribute size
     *
     * @param {string} src
     * @returns {null}
     */
    function imageSize(src) {
      var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

      if (match) {
        return match[1];
      } else {
        return null;
      }
    }

    /**
     * Adds a Shopify size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
      if (size === null) {
        return src;
      }

      if (size === 'master') {
        return this.removeProtocol(src);
      }

      var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif|webp|heic)(\?v=\d+)?$/i);

      if (match) {
        var prefix = src.split(match[0]);
        var suffix = match[0];

        return this.removeProtocol(prefix[0] + '_' + size + suffix);
      } else {
        return null;
      }
    }

    function removeProtocol(path) {
      return path.replace(/http(s)?:/, '');
    }

    return {
      preload: preload,
      loadImage: loadImage,
      imageSize: imageSize,
      getSizedImageUrl: getSizedImageUrl,
      removeProtocol: removeProtocol };

  }();
  ;
  /**
   * Variant Selection scripts
   * ------------------------------------------------------------------------------
   *
   * Handles change events from the variant inputs in any `cart/add` forms that may
   * exist. Also updates the master select and triggers updates when the variants
   * price or image changes.
   *
   * @namespace variants
   */

  slate.Variants = function () {

    /**
     * Variant constructor
     *
     * @param {object} options - Settings from `product.js`
     */
    function Variants(options) {
      this.$container = options.$container;
      this.product = options.product;
      this.singleOptionSelector = options.singleOptionSelector;
      this.originalSelectorId = options.originalSelectorId;
      this.secondaryIdSelectors = options.secondaryIdSelectors;
      this.enableHistoryState = options.enableHistoryState;
      this.currentVariant = this._getVariantFromOptions();

      this._updateQtySelector(this.currentVariant);

      $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    }

    Variants.prototype = $.extend({}, Variants.prototype, {

      /**
       * Get the currently selected options from add-to-cart form. Works with all
       * form input elements.
       *
       * @return {array} options - Values of currently selected variants
       */
      _getCurrentOptions: function () {
        const currentOptions = $.map($(this.singleOptionSelector, this.$container), function (element) {
          const type = element.dataset.selectorType;
          const currentOption = {};

          if (type === 'listed') {
            const selectedOption = element.querySelector('input:checked');

            if (selectedOption) {
              currentOption.value = selectedOption.value;
              currentOption.index = element.dataset.index;

              return currentOption;
            } else {
              return false;
            }
          } else {
            const selectedOption = element.querySelector('[aria-selected="true"]');

            if (selectedOption) {
              currentOption.value = selectedOption.dataset.value;
              currentOption.index = element.dataset.index;

              return currentOption;
            } else {
              return false;
            }
          }
        });

        return currentOptions;
      },

      /**
       * Find variant based on selected values.
       *
       * @param  {array} selectedValues - Values of variant inputs
       * @return {object || undefined} found - Variant object from product.variants
       */
      _getVariantFromOptions: function () {
        var selectedValues = this._getCurrentOptions();
        var variants = this.product.variants;
        var found = false;

        
        variants.forEach(function (variant) {
          var satisfied = true;

          selectedValues.forEach(function (option) {
            if (satisfied) {
              satisfied = option.value === variant[option.index];
            }
          });

          if (satisfied) {
            found = variant;
          }
        });

        return found || null;
      },

      /**
       * Get a variant option element.
       *
       * @param {object} variant - Currently selected variant
       * @returns {element}
       */
      _getVariantOptionElement: function (variant) {
        return this.$container.find('select[name="id"] option[value="' + variant.id + '"]');
      },

      /**
       * Event handler for when a variant input changes.
       */
      _onSelectChange: function () {
        var variant = this._getVariantFromOptions();
        this.$container.trigger({
          type: 'variantChange',
          variant: variant });


        this._updateSecondarySelects(variant);
        this._updateInventoryNotice(variant);
        this._updateQtySelector(variant);

        if (!variant) {
          return;
        }

        $(window).trigger('cc-variant-updated', {
          variant: variant,
          product: this.product });


        this._updateMasterSelect(variant);
        this._updateImages(variant);
        this._updatePrice(variant);
        this.currentVariant = variant;

        if (this.enableHistoryState) {
          this._updateHistoryState(variant);
        }
        var data_qty = $('.qty-wrapper').attr("data-qty", variant.inventory_quantity);
        $('.error_msg').hide();
      },

      /**
       * Trigger event when variant image changes
       *
       * @param  {object} variant - Currently selected variant
       * @return {event}  variantImageChange
       */
      _updateImages: function (variant) {
        var variantMedia = variant.featured_media || {};
        var currentVariantMedia = this.currentVariant.featured_media || {};

        if (!variant.featured_media || variantMedia.id === currentVariantMedia.id) {
          return;
        }

        this.$container.trigger({
          type: 'variantImageChange',
          variant: variant });

      },

      /**
       * Trigger event when variant price changes.
       *
       * @param  {object} variant - Currently selected variant
       * @return {event} variantPriceChange
       */
      _updatePrice: function (variant) {
        var hasChanged = false;
        if (
        variant.price !== this.currentVariant.price ||
        variant.compare_at_price !== this.currentVariant.compare_at_price ||
        variant.unit_price_measurement !== this.currentVariant.unit_price_measurement ||

        variant.unit_price_measurement && (
        variant.unit_price !== this.currentVariant.unit_price ||
        variant.unit_price_measurement.reference_value !== this.currentVariant.unit_price_measurement.reference_value ||
        variant.unit_price_measurement.reference_unit !== this.currentVariant.unit_price_measurement.reference_unit))


        {
          hasChanged = true;
        }

        if (!hasChanged) {
          return;
        }

        this.$container.trigger({
          type: 'variantPriceChange',
          variant: variant });

      },

      /**
       * Update inventory notice
       *
       * @param {object} variant - Currently selected variant
       */
      _updateInventoryNotice: function (variant) {
        const invNotice = document.querySelector('.product-inventory');
        if (!invNotice) return;

        const hideInventoryNotice = () => {
          invNotice.classList.remove('product-inventory--low');
          invNotice.classList.add('product-inventory--none');
          invNotice.innerHTML = '';
        };

        if (!variant) {
          hideInventoryNotice();
          return;
        }

        const variantEl = this._getVariantOptionElement(variant);

        if (variantEl[0].dataset.stock === 'out') {
          hideInventoryNotice();
        } else {
          const { showNotice, showCount } = invNotice.dataset;
          const invCount = Number(variantEl[0].dataset.inventory);
          const invLow = invCount && invCount <= Number(invNotice.dataset.threshold);

          if (showNotice === 'low' && !invLow) {
            hideInventoryNotice();
            return;
          }

          const invStatus = invLow ? theme.strings.low_stock : theme.strings.in_stock;
          let invText = '';

          if (showCount === 'always' || showCount === 'low' && invLow) {
            if (invCount === 1) {
              invText = ` - ${theme.strings.single_unit_available}`;
            } else {
              invText = ` - ${theme.strings.x_units_available.replace('[[ quantity ]]', invCount)}`;
            }
          }

          invNotice.classList.remove('product-inventory--none');
          invNotice.classList.toggle('product-inventory--low', invLow);
          invNotice.innerHTML = `<span class="product-inventory__status">${invStatus}</span>${invText}`;
        }
      },

      /**
       * Update quantity selector options according to inventory level
       *
       * @param {object} variant - Currently selected variant
       */
      _updateQtySelector: function (variant) {
        const section = this.$container[0];
        const qtySelector = section.querySelector('.qty-wrapper');

        if (!qtySelector) return;

        if (!variant || !variant.available) {
          qtySelector.classList.add('is-disabled');
          return;
        }

        const variantEl = this._getVariantOptionElement(variant);
        const invCount = Number(variantEl[0].dataset.inventory);
        const qytOptionEls = qtySelector.querySelectorAll('.cc-select__option');
        const dynamicOpts = theme.settings.dynamicQtyOpts && invCount && invCount > 0 && invCount < 10;

        qytOptionEls.forEach((el, index) => {
          el.hidden = dynamicOpts && index + 1 > invCount;
        });

        qtySelector.classList.remove('is-disabled');
      },

      /**
       * Update history state for product deeplinking
       *
       * @param {object} variant - Currently selected variant
       */
      _updateHistoryState: function (variant) {
        if (!history.replaceState || !variant) {
          return;
        }

        var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
        window.history.replaceState({ path: newurl }, '', newurl);
      },

      /**
       * Update hidden master select of variant change
       *
       * @param {object} variant - Currently selected variant
       */
      _updateMasterSelect: function _updateMasterSelect(variant) {
        const select = $(this.originalSelectorId, this.$container)[0];
        if (!select) return;

        select.value = variant.id;
        select.dispatchEvent(
        new Event('change', { bubbles: true, cancelable: false }));

      },

      /**
       * Update hidden secondary selects, e.g. Installments form
       *
       * @param {object} variant - Currently selected variant
       */
      _updateSecondarySelects: function _updateSecondarySelects(variant) {
        $(this.secondaryIdSelectors, this.$container).each(function () {
          this.value = variant ? variant.id : null;
          this.dispatchEvent(
          new Event('change', { bubbles: true, cancelable: false }));

        });
      } });


    return Variants;
  }();
  ;

  /*=============== Components ===============*/
  const CCFetchedContent = class extends HTMLElement {
    connectedCallback() {
      if(this.dataset.url){
        fetch(this.dataset.url).
        then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.text();
        }).
        then((response) => {
        let frag = document.createDocumentFragment(),
        fetchedContent = document.createElement('div');
        frag.appendChild(fetchedContent);
        fetchedContent.innerHTML = response;

        let replacementContent = fetchedContent.querySelector(`[data-id="${CSS.escape(this.dataset.id)}"]`);
        if (replacementContent) {
          this.innerHTML = replacementContent.innerHTML;

          if (this.hasAttribute('contains-product-blocks')) {
            // peek carousel
            $('.js-content-products-slider .grid', this).each(function (index, value) {
              let section = value.closest('[data-section-type]');
              theme.peekCarousel.init(
              $(section),
              $(value),
              section.dataset.sectionId,
              function () {return true;},
              false,
              {
                infinite: false,
                slidesToShow: 2,
                slidesToScroll: 1,
                swipeToSlide: true,
                dots: false,
                prevArrow: $(value).closest('.content-products').find('.content-products-controls .prev'),
                nextArrow: $(value).closest('.content-products').find('.content-products-controls .next'),
                responsive: [
                {
                  breakpoint: 960,
                  settings: {
                    slidesToShow: 1 } }] });





            });
          }
        }
      });
      }
    }};


  window.customElements.define('cc-fetched-content', CCFetchedContent);
  ;
  theme.storageAvailable = function (type) {
    try {
      var storage = window[type],
      x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch (e) {
      return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
    }
  };
  ;
  theme.variants = {
    selectors: {
      originalSelectorId: '[data-product-select]',
      secondaryIdSelectors: '[data-product-secondary-select]',
      priceWrapper: '[data-price-wrapper]',
      productPrice: '[data-product-price]',
      addToCart: '[data-add-to-cart]',
      addToCartText: '[data-add-to-cart-text]',
      comparePrice: '[data-compare-price]',
      comparePriceText: '[data-compare-text]',
      unitPrice: '.unit-price',
      preorder: '[data-preorder]' },


    /**
     * Get the display unit for unit pricing
     */
    getBaseUnit: function (variant) {
      return variant.unit_price_measurement.reference_value === 1 ?
      variant.unit_price_measurement.reference_unit :
      variant.unit_price_measurement.reference_value +
      variant.unit_price_measurement.reference_unit;
    },

    /**
     * Updates the DOM state of the add to cart button
     */
    updateAddToCartState: function (evt) {
      var variant = evt.variant;
      if (variant) {
        $(theme.variants.selectors.priceWrapper, this.$container).removeClass('hide');
      } else {
        $(theme.variants.selectors.addToCart, this.$container).prop('disabled', true);
        $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.unavailable);
        $(theme.variants.selectors.priceWrapper, this.$container).addClass('hide');
        return;
      }

      if (variant.available) {
        $(theme.variants.selectors.addToCart, this.$container).prop('disabled', false);
        $('form', this.$container).removeClass('variant--unavailable');
        if ($(theme.variants.selectors.preorder, this.$container).length) {
          $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.productPreorder);
        } else {
          $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.addToCart);
        }
      } else {
        $(theme.variants.selectors.addToCart, this.$container).prop('disabled', true);
        $(theme.variants.selectors.addToCartText, this.$container).html(theme.strings.soldOut);
        $('form', this.$container).addClass('variant--unavailable');
      }

      // backorder
      var $backorderContainer = $('.backorder', this.$container);
      if ($backorderContainer.length) {
        if (variant && variant.available) {
          var $option = $(theme.variants.selectors.originalSelectorId + ' option[value="' + variant.id + '"]', this.$container);
          if (variant.inventory_management && $option.data('stock') == 'out') {
            $backorderContainer.find('.backorder__variant').html(this.productSingleObject.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - ' + variant.title));
            $backorderContainer.show();
          } else {
            $backorderContainer.hide();
          }
        } else {
          $backorderContainer.hide();
        }
      }
    },

    /**
     * Updates the DOM with specified prices
     */
    updateProductPrices: function (evt) {
      var variant = evt.variant;
      var $comparePrice = $(theme.variants.selectors.comparePrice, this.$container);
      var $compareEls = $comparePrice.add(theme.variants.selectors.comparePriceText, this.$container);
      var $price = $(theme.variants.selectors.productPrice, this.$container);
      var $unitPrice = $(theme.variants.selectors.unitPrice, this.$container);
      var isInDetail = $price.is('[data-product-detail-price]');

      $price.html('<span class="theme-money' + (isInDetail ? ' text-[24px] font-semibold' : '') + '" data-price="'+variant.price+'">' + theme.Shopify.formatMoney(variant.price, theme.moneyFormatWithCodeForProductsPreference) + '</span>');

      if (variant.compare_at_price > variant.price) {
        $price.addClass('product-price__reduced');
        $comparePrice.html('<span class="product-price__compare theme-money">' + theme.Shopify.formatMoney(variant.compare_at_price, theme.moneyFormat) + '</span>');
        $compareEls.removeClass('hide');
      } else {
        $price.removeClass('product-price__reduced');
        $comparePrice.html('');
        $compareEls.addClass('hide');
      }

      if (variant.unit_price_measurement) {
        var $newUnitPriceArea = $('<div class="unit-price small-text">');
        $('<span class="unit-price__price theme-money">').html(theme.Shopify.formatMoney(variant.unit_price, theme.moneyFormat)).appendTo($newUnitPriceArea);
        $('<span class="unit-price__separator">').html(theme.strings.unitPriceSeparator).appendTo($newUnitPriceArea);
        $('<span class="unit-price__unit">').html(theme.variants.getBaseUnit(variant)).appendTo($newUnitPriceArea);
        if ($unitPrice.length) {
          $unitPrice.replaceWith($newUnitPriceArea);
        } else {
          $(theme.variants.selectors.priceWrapper, this.$container).append($newUnitPriceArea);
        }
      } else {
        $unitPrice.remove();
      }
    } };

  ;
  theme.initAjaxAddToCartForm = function ($form_param) {
    $form_param.on('submit', function (evt) {
      evt.preventDefault();
      var $form = $(this);
      //Disable add button
      $form.addClass('add-in-progress').find(':submit').attr('disabled', 'disabled').each(function () {
        var contentFunc = $(this).is('button') ? 'html' : 'val';
        $(this).data('previous-value', $(this)[contentFunc]())[contentFunc](theme.strings.addingToCart);
      });
      //Add to cart
      $.post(theme.routes.cart_add_url + '.js', $form.serialize(), async function (itemData) {
        //Enable add button
        var $btn = $form.find(':submit').each(function () {
          var $btn = $(this);
          var contentFunc = $(this).is('button') ? 'html' : 'val';
          //Set to 'DONE', alter button style, wait a few secs, revert to normal
          $btn[contentFunc](theme.strings.addedToCart);
          setTimeout(function () {
            $btn.removeAttr('disabled')[contentFunc]($btn.data('previous-value'));
            $form.removeClass('add-in-progress');
          }, 1000);
        }).first();

        // calling custom js function
        if(document.body.classList.contains("template-product") &&  document.querySelector("#calculate") != null && window.onProductAdded) {
           await window.onProductAdded(itemData);
      }
        
        if (theme.settings.onAddToCart === 'add_and_redirect') {
          window.location = theme.routes.cart_url;
          return;
        }

        // reload header
        $.get(theme.routes.search_url, function (data) {
          var selectors = [
          '.page-header .header-cart',
          '.docked-navigation-container .header-cart'];

          var $parsed = $($.parseHTML('<div>' + data + '</div>'));
          for (var i = 0; i < selectors.length; i++) {
            var cartSummarySelector = selectors[i];
            var $newCartObj = $parsed.find(cartSummarySelector).clone();
            var $currCart = $(cartSummarySelector);
            $currCart.replaceWith($newCartObj);
          }
        });

        // close quick-buy, if present
        $.colorbox.close();

        // display added notice
        // get full product data
        theme.productData = theme.productData || {};
        if (!theme.productData[itemData.product_id]) {
          theme.productData[itemData.product_id] = JSON.parse(document.querySelector('.ProductJson-' + itemData.product_id).innerHTML);
        }
        var productVariant = null;
        for (var i = 0; i < theme.productData[itemData.product_id].variants.length; i++) {
          var variant = theme.productData[itemData.product_id].variants[i];
          if (variant.id == itemData.variant_id) {
            productVariant = variant;
          }
        }

        let productLineItems = {};
        const formData = new FormData($form[0]);
        for (const [key, value] of formData) {
          if (key.indexOf('properties[') === 0 && value) {
            const name = key.split('[')[1].split(']')[0];
            if (name[0] !== '_') {
              productLineItems[name] = value;
            }
          }
        }

        var productPrice = '';
        if (itemData.original_line_price > itemData.final_line_price) {
          productPrice += '<span class="cart-summary__price-reduced product-price__reduced theme-money">' + theme.Shopify.formatMoney(itemData.final_line_price, theme.moneyFormat) + '</span>';
          productPrice += '<span class="cart-summary__price-compare product-price__compare theme-money">' + theme.Shopify.formatMoney(itemData.original_line_price, theme.moneyFormat) + '</span>';
        } else {
          productPrice += '<span class="theme-money">' + theme.Shopify.formatMoney(itemData.final_line_price, theme.moneyFormat) + '</span>';
        }
        if (itemData.unit_price) {
          productPrice += '<span class="cart-summary__unit-price unit-price theme-money">' + theme.Shopify.formatMoney(itemData.unit_price, theme.moneyFormat) + theme.strings.unitPriceSeparator + itemData.unit_price_measurement.reference_unit + '</span>';
        }

        // append quantity
        var productQty = '';
        if (itemData.quantity > 1) {
          productQty = ' <span class="cart-summary__quantity">' + itemData.quantity + '</span>';
        }

        // append preorder text
        var productPreorderHTML = '';
        if ($form.parent()[0].hasAttribute('data-preorder')) {
          productPreorderHTML = ' <span class="cart-summary__preorder">' + theme.strings.productPreorder + '</span>';
        }

        if (itemData.line_level_discount_allocations && itemData.line_level_discount_allocations.length > 0) {
          productPrice += '<ul class="cart-discount-list small-text">';
          for (var i = 0; i < itemData.line_level_discount_allocations.length; i++) {
            var discount_allocation = itemData.line_level_discount_allocations[i];
            productPrice += [
            '<li class="cart-discount">',
            '<div class="cart-discount__label">',
            discount_allocation.discount_application.title.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
            '</div>',
            '<div class="cart-discount__amount theme-money">',
            theme.Shopify.formatMoney(discount_allocation.amount, theme.moneyFormat),
            '</div>',
            '</li>'].join('');
          }
          productPrice += '</ul>';
        }
        var sellingPlanHTML = '';
        if (itemData.selling_plan_allocation && itemData.selling_plan_allocation.selling_plan.name) {
          sellingPlanHTML = [
          '<div class="cart-summary__selling-plan ">',
          itemData.selling_plan_allocation.selling_plan.name,
          '</div>'].join('');
        }

        var productVariantsHTML = '';
        if (productVariant) {
          // get option names from full product data
          var optionNames = theme.productData[itemData.product_id].options;
          productVariantsHTML = '<div class="cart-summary__product__variants">';
          for (var i = 0; i < productVariant.options.length; i++) {
            if (productVariant.options[i].indexOf('Default Title') < 0) {
              productVariantsHTML += '<div class="cart-summary__variant">';
              productVariantsHTML += '<span class="cart-summary__variant-label">' + optionNames[i] + ':</span> ';
              productVariantsHTML += '<span class="cart-summary__variant-value">' + productVariant.options[i] + '</span>';
              productVariantsHTML += '</div>';
            }
          }
          productVariantsHTML += '</div>';
        }

        var productLineItemsHTML = '';
        if (Object.keys(productLineItems).length > 0) {
          productLineItemsHTML = '<div class="cart-summary__product__line-items">';
          const tempSpan = document.createElement('span');
          for (const key of Object.keys(productLineItems)) {
            tempSpan.innerText = productLineItems[key];
            productLineItemsHTML += `<div>${key}: ${tempSpan.innerHTML}</div>`;
          }
          productLineItemsHTML += '</div>';
        }


        var productImage;
        if (productVariant.featured_media) {
          productImage = slate.Image.getSizedImageUrl(productVariant.featured_media.preview_image.src, '200x');
        } else if (theme.productData[itemData.product_id].media && theme.productData[itemData.product_id].media.length > 0) {
          productImage = slate.Image.getSizedImageUrl(theme.productData[itemData.product_id].media[0].preview_image.src, '200x');
        }

        // additional fetch - for full cart data
        $.getJSON(theme.routes.cart_url + '.js', function (cartData) {
          const cartItems = cartData.items;
          var extraPriceMiniCart = 0;
          var extraProductsMiniCart = 0;
          if (cartItems.length > 0) {
            cartItems.forEach((item) => {
              if (item.product_title.toLowerCase().includes('extra charge')) {
                extraPriceMiniCart += item.final_line_price;
                extraProductsMiniCart += item.quantity;
              }
            });
          }
          var $template = $([
          '<div class="added-notice global-border-radius added-notice--pre-reveal">',
          '<div class="added-notice__header">',
          '<span class="added-notice__title">', theme.strings.addedToCartPopupTitle, '</span>',
          '<a class="added-notice__close feather-icon" href="#" aria-label="', theme.strings.close, '">', theme.icons.close, '</a>',
          '</div>',
          '<div class="cart-summary global-border-radius">',
          '<div class="cart-summary__product">',
          '<div class="cart-summary__product-image"><img class="global-border-radius" src="', productImage, '" role="presentation" alt=""></div>',
          '<div class="cart-summary__product__description">',
          '<div class="cart-summary__product-title">', theme.productData[itemData.product_id].title, productQty, '</div>',
          productVariantsHTML,
          productLineItemsHTML,
          productPreorderHTML,
          sellingPlanHTML,
          '<div class="cart-summary__price">', productPrice, '</div>',
          '</div>',
          '</div>',
          '</div>',
          '<div class="cart-summary__footer">',
          '<div class="cart-summary__total-quantity-row">',
          '<span>', theme.strings.addedToCartPopupItems, '</span>',
          '<span>', cartData.item_count - extraProductsMiniCart, '</span>',
          '</div>',
          '<div class="mini-cart__recap-price-line-extra">',
          '<span>Bespoke Price</span>',
          '<span>',theme.Shopify.formatMoney(extraPriceMiniCart, theme.moneyFormat),'</span>',
          '</div>',
          '<div class="cart-summary__total-price-row large-text">',
          '<span>', theme.strings.addedToCartPopupSubtotal, '</span>',
          '<span class="theme-money">', theme.Shopify.formatMoney(cartData.total_price, theme.moneyFormatWithCodeForCartPreference), '</span>',
          '</div>',
          '<a href="', theme.routes.cart_url, '" class="btn btn--primary btn--small btn--fullwidth cart-summary__button">', theme.strings.addedToCartPopupGoToCart, '</a>',
          '</div>',
          '</div>'].
          join(''));
          $template.appendTo('body');

          // transition in
          setTimeout(function () {
            $template.removeClass('added-notice--pre-reveal');
          }, 10);

          // transition out
          theme.addedToCartNoticeHideTimeoutId = setTimeout(function () {
            $template.find('.added-notice__close').trigger('click');
          }, 5000);
        });

      }, 'json').fail(function (data) {
        // Enable form
        $form.removeClass('add-in-progress');
        var $firstBtn = $form.find(':submit').removeAttr('disabled').each(function () {
          var $btn = $(this);
          var contentFunc = $btn.is('button') ? 'html' : 'val';
          $btn[contentFunc]($btn.data('previous-value'));
        }).first();

        //Not added, show message
        if (typeof data != 'undefined' && data.responseJSON && data.responseJSON.description) {
          theme.showQuickPopup(data.responseJSON.message, $firstBtn);
        } else {
          //Some unknown error? Disable ajax and submit the old-fashioned way.
          $form.off('submit').submit();
        }
      });
    });

    // global events - assign once
    $(document).off('.ajaxAddToCart');

    $(document).on('click.ajaxAddToCart', '.added-notice__close', function () {
      var $template = $(this).closest('.added-notice').addClass('added-notice--pre-destroy');
      setTimeout(function () {
        $template.remove();
      }, 500);
      return false;
    });

    $(document).on('mouseenter.ajaxAddToCart', '.header-cart', function () {
      clearTimeout(theme.addedToCartNoticeHideTimeoutId);
      $('.added-notice__close').trigger('click');
    });
  };

  theme.unloadAjaxAddToCartForm = function ($form) {
    $form.off('submit');
  };

  // overlap avoidance
  $(function () {
    var overlapGutter = 10;
    var overlapGutterFuzzed = overlapGutter + 1;
    var GRAVITY_LEFT = 0,
    GRAVITY_CENTRE = 1,
    GRAVITY_RIGHT = 2;

    function oaElementToOriginalRectangle($el) {
      var t = {
        left: $el.offset().left - parseFloat($el.css('margin-left')),
        top: $el.offset().top - parseFloat($el.css('margin-top')),
        width: $el.outerWidth(),
        height: $el.outerHeight() };

      t.right = t.left + t.width;
      t.bottom = t.top + t.height;
      if ($el.hasClass('avoid-overlaps__item--gravity-left')) {
        t.gravity = GRAVITY_LEFT;
      } else if ($el.hasClass('avoid-overlaps__item--gravity-right')) {
        t.gravity = GRAVITY_RIGHT;
      } else {
        t.gravity = GRAVITY_CENTRE;
      }
      return t;
    }

    function oaSetOffsetFromCentre(item) {
      if (item.newRect.gravity == GRAVITY_LEFT) {
        // top left position already set by default
      } else if (item.newRect.gravity == GRAVITY_RIGHT) {
        item.newRect.right = item.newRect.left;
        item.newRect.left = item.newRect.right - item.newRect.width;
      } else {
        item.newRect.left = item.newRect.left - item.newRect.width / 2;
        item.newRect.right = item.newRect.left + item.newRect.width;
      }
      item.newRect.top = item.newRect.top - item.newRect.height / 2;
      item.newRect.bottom = item.newRect.top + item.newRect.height;
    }

    function oaRectIsInsideBoundary(rect, container) {
      return rect.left >= container.left + overlapGutter &&
      rect.top >= container.top + overlapGutter &&
      rect.right <= container.right - overlapGutter &&
      rect.bottom <= container.bottom - overlapGutter;
    }

    function oaEnforceBoundaryConstraint(item, containerRect) {
      // left
      if (item.newRect.left < containerRect.left + overlapGutter) {
        item.newRect.left = containerRect.left + overlapGutterFuzzed;
        item.newRect.right = item.newRect.left + item.newRect.width;
      }
      // top
      if (item.newRect.top < containerRect.top + overlapGutter) {
        item.newRect.top = containerRect.top + overlapGutterFuzzed;
        item.newRect.bottom = item.newRect.top + item.newRect.height;
      }
      // right
      if (item.newRect.right > containerRect.right - overlapGutter) {
        item.newRect.right = containerRect.right - overlapGutterFuzzed;
        item.newRect.left = item.newRect.right - item.newRect.width;
      }
      // bottom
      if (item.newRect.bottom > containerRect.bottom - overlapGutter) {
        item.newRect.bottom = containerRect.bottom - overlapGutterFuzzed;
        item.newRect.top = item.newRect.bottom - item.newRect.height;
      }
    }

    function oaRectanglesOverlap(rect1, rect2) {
      return !(rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom);
    }

    function oaRectanglesOverlapWithGutter(rect1, rect2) {
      // increase rect1 size to fake gutter check
      return !(rect1.right + overlapGutter < rect2.left ||
      rect1.left - overlapGutter > rect2.right ||
      rect1.bottom + overlapGutter < rect2.top ||
      rect1.top - overlapGutter > rect2.bottom);
    }

    function oaGetSortedVectorsToAttempt(rect1, rect2) {
      // 0 - top, 1 - right, 2 - bottom, 3 - left
      // compare mid-points
      var deltaX = rect2.left + (rect2.right - rect2.left) / 2 - (rect1.left + (rect1.right - rect1.left) / 2);
      var deltaY = rect2.top + (rect2.bottom - rect2.top) / 2 - (rect1.top + (rect1.bottom - rect1.top) / 2);
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          return [1, 0, 2, 3];
        } else {
          return [3, 0, 2, 1];
        }
      } else {
        if (deltaY > 0) {
          return [2, 1, 3, 0];
        } else {
          return [0, 1, 3, 2];
        }
      }
    }

    function oaAttemptReposition(toMove, vector, movingAwayFrom, containerRect, allItems) {
      var newRect = $.extend({}, toMove.newRect);
      switch (vector) {
        case 0: // up
          newRect.bottom = movingAwayFrom.newRect.top - overlapGutterFuzzed;
          newRect.top = newRect.bottom - newRect.height;
          break;
        case 1: // right
          newRect.left = movingAwayFrom.newRect.right + overlapGutterFuzzed;
          newRect.right = newRect.left + newRect.width;
          break;
        case 2: // down
          newRect.top = movingAwayFrom.newRect.bottom + overlapGutterFuzzed;
          newRect.bottom = newRect.top + newRect.height;
          break;
        case 3: // left
          newRect.right = movingAwayFrom.newRect.left - overlapGutterFuzzed;
          newRect.left = newRect.right - newRect.width;
          break;}


      // check if new position is inside container
      var isInsideBoundary = oaRectIsInsideBoundary(newRect, containerRect);

      // check if new position overlaps any other elements
      var doesOverlap = false;
      for (var i = 0; i < allItems.length; i++) {
        var item = allItems[i];
        if (item.el[0] != toMove.el[0]) {// skip self
          if (oaRectanglesOverlap(newRect, item.newRect)) {
            doesOverlap = true;
          }
        }
      }

      // assign new position if deemed valid
      if (isInsideBoundary && !doesOverlap) {
        toMove.newRect = newRect;
        return true;
      }
      return false;
    }

    theme.checkOverlaps = function () {
      // every overlap-avoidance zone
      $('.avoid-overlaps').each(function () {
        if (!$(this).hasClass('avoid-overlaps--processed')) {
          $(this).addClass('avoid-overlaps--processed');
          checkOverlapsResizeObserver.observe(this);
        }

        var $container = $(this),
        $mobileContainer = $('.avoid-overlaps__mobile-container', this),
        containerRect = null;
        if ($mobileContainer.length && $mobileContainer.css('position') == 'relative') {
          containerRect = oaElementToOriginalRectangle($mobileContainer);
        } else {
          containerRect = oaElementToOriginalRectangle($container);
        }

        // all items that could overlap, in this zone
        var $candidates = $(this).find('.avoid-overlaps__item');

        // create cached dimensions to work on
        var itemsToProcess = []; // all elements that can collide
        var itemsThatCanBeMoved = []; // e.g. labels, positioned overlay title
        var itemsThatCanBeMoveALot = []; // e.g. labels
        $candidates.each(function () {
          var item = {
            el: $(this),
            newRect: oaElementToOriginalRectangle($(this)),
            oldRect: oaElementToOriginalRectangle($(this)),
            overlaps: false };

          // all items
          itemsToProcess.push(item);
          // items that can be moved freely
          if (!$(this).hasClass('overlay')) {
            itemsThatCanBeMoveALot.push(item);
          }
          // any items that can be moved
          if (
          $(this).css('position') == 'absolute' &&
          !$(this).hasClass('overlay--bottom-wide') &&
          !$(this).hasClass('overlay--low-wide'))
          {
            itemsThatCanBeMoved.push(item);
          }
        });

        // for each moveable element
        for (var i = 0; i < itemsThatCanBeMoved.length; i++) {
          var candidate = itemsThatCanBeMoved[i];
          // ensure it is positioned relative to centre
          oaSetOffsetFromCentre(candidate);

          // move inside container boundary
          oaEnforceBoundaryConstraint(candidate, containerRect);
        }

        // for every element, check if any freely moveable elements overlap it - and move if so
        for (var i = 0; i < itemsToProcess.length; i++) {
          var candidate = itemsToProcess[i];
          for (var j = 0; j < itemsThatCanBeMoveALot.length; j++) {
            var checking = itemsThatCanBeMoveALot[j];
            if (checking.el[0] != candidate.el[0]) {// skip self
              var vectorPreference = oaGetSortedVectorsToAttempt(candidate.newRect, checking.newRect);
              while (vectorPreference.length > 0 && oaRectanglesOverlapWithGutter(candidate.newRect, checking.newRect)) {
                var moved = oaAttemptReposition(checking, vectorPreference.shift(), candidate, containerRect, itemsToProcess);
                checking.overlaps = !moved;
              }
            }
          }
        }

        // set the new positions
        for (var j = 0; j < itemsToProcess.length; j++) {
          var item = itemsToProcess[j];
          var deltaX = item.newRect.left - item.oldRect.left;
          var deltaY = item.newRect.top - item.oldRect.top;
          item.el.css({
            marginLeft: deltaX != 0 ? deltaX : '',
            marginTop: deltaY != 0 ? deltaY : '' });

          item.el.toggleClass('is-overlapping', item.overlaps);
        }
      });

      // If the last section on the page is a full width scrolling banner, don't shift the footer up
      const lastSectionIsFullWidthScrollingBanner =
      document.querySelector('main .shopify-section:last-child .scrolling-banner--full-width');
      const footerGroup = document.querySelector('.footer-group');
      if (footerGroup && (footerGroup.childElementCount === 0 || lastSectionIsFullWidthScrollingBanner)) {
        footerGroup.classList.remove('footer-group--shift-up');
      }
    };

    let checkOverlapsResizeObserver = new ResizeObserver(theme.debounce(theme.checkOverlaps, 100));
    theme.checkOverlaps();
    $(document).on('shopify:section:load', theme.checkOverlaps);
    $(document).on('shopify:section:unload', theme.checkOverlaps);
    $(document).on('shopify:section:reorder', theme.checkOverlaps);
    $(document).on('shopify:section:select', theme.checkOverlaps);
    $(document).on('shopify:section:deselect', theme.checkOverlaps);
  });
  ;
  theme.assessLoadedRTEImage = function (el) {
    // container width
    var rteWidth = $(el).closest('.rte').width();
    // check original width
    if ($(el)[0].naturalWidth > rteWidth) {
      // wider
      var para = $(el).parentsUntil('.rte').filter('p');
      if (para.length > 0) {
        para.addClass('expanded-width'); // inside a para already
      } else {
        $(el).wrap('<p class="expanded-width"></p>'); // put it inside a para
      }
    } else {
      // not wider
      $(el).closest('.expanded-width').removeClass('expanded-width');
    }
  };

  // on image load
  theme.assessRTEImagesOnLoad = function (container) {
    $('.rte--expanded-images img:not(.exp-loaded)', container).each(function () {
      var originalImage = this;
      var img = new Image();
      $(img).on('load.rteExpandedImage', function () {
        $(originalImage).addClass('exp-loaded');
        theme.assessLoadedRTEImage(originalImage);
      });
      img.src = this.src;
      if (img.complete || img.readyState === 4) {
        // image is cached
        $(img).off('load.rteExpandedImage');
        $(originalImage).addClass('exp-loaded');
        theme.assessLoadedRTEImage(originalImage);
      }
    });
  };

  // initialise all images
  theme.assessRTEImagesOnLoad();

  // check any loaded images again on viewport resize
  $(window).on('debouncedresize', function () {
    $('.rte--expanded-images img.exp-loaded').each(function () {
      theme.assessLoadedRTEImage(this);
    });
  });
  ;
  theme.recentProductCacheExpiry = 1000 * 60 * 10; // 10 mins
  theme.recentProductHistoryCap = 12;
  theme.recentProductsStorageKey = 'theme.recent_products_v3';

  // recentArr must be the full array of all recent products, as it is used to update the cache
  theme.addRecentProduct = function (recentArr, index, $container, showHover, showVendor) {
    var item = recentArr[index],
    _recentArr = recentArr,
    _showHover = showHover,
    _showVendor = showVendor,
    _$container = $container,
    $itemContainer = $('<div class="product-block product-block--recent-unloaded grid__item one-sixth medium--one-quarter small-down--one-whole">');

    // check timestamp age
    var currentTimestamp = new Date().getTime();
    if (item.timestamp && item.timestamp > currentTimestamp - theme.recentProductCacheExpiry) {
      // display now
      $itemContainer.append(theme.buildRecentProduct(item, _showHover, _showVendor)).removeClass('product-block--recent-unloaded');
    } else {
      // get fresh data
      $.getJSON(item.url + '.js', function (data) {
        // update array with new data
        item.title = data.title;
        item.image = data.media && data.media.length ? data.media[0].preview_image.src : '';
        item.timestamp = currentTimestamp;
        // save updated recent products list
        window.localStorage.setItem(theme.recentProductsStorageKey, JSON.stringify(_recentArr));
        // in slideshow?
        _$container.filter('.slick-initialized').slick('slickUnfilter');
        // display
        $itemContainer.append(theme.buildRecentProduct(item, _showHover, _showVendor)).removeClass('product-block--recent-unloaded');
        // in slideshow?
        _$container.filter('.slick-initialized').slick('slickFilter', ':not(.product-block--recent-unloaded)');
      });
    }
    $container.append($itemContainer);
    theme.assessRecentProductGrid($container);
  };

  theme.assessRecentProductGrid = function ($container) {
    // add classes to hide all but 4 on tablet
    var $items = $container.children();
    var toHideOnTablet = Math.max($items.length - 4, 0);
    if (toHideOnTablet > 0) {
      $items.slice(0, 3).removeClass('medium--hide');
      for (var i = 0; i < toHideOnTablet; i++) {
        $($items[i]).addClass('medium--hide');
      }
    }
  };

  theme.onRecentProductImageLoad = function () {
  };

  theme.buildRecentProduct = function (item, showHover, showVendor) {
    var $item = $('<a class="recently-viewed-product plain-link">').attr({
      href: item.url,
      title: item.title });


    var $imageContWrapper = $('<div class="product-block__image-container">').appendTo($item);
    var $imageCont = $('<div class="hover-images global-border-radius relative">').appendTo($imageContWrapper);

    if (item.image) {
      $('<div class="image-one">').append(
      $('<img role="presentation">').on('load', theme.onRecentProductImageLoad).
      attr({ src: item.image, alt: item.title })).
      appendTo($imageCont);
    }

    if (showHover && item.image2) {
      $imageCont.addClass('hover-images--two');
      $('<div class="image-two">').css('background-image', 'url(' + item.image2 + ')').appendTo($imageCont);
    }

    if (item.available === false) {
      if (theme.settings.soldLabelEnabled) {
        $('<span class="product-label product-label--sold-out global-border-radius"></span>').html(theme.strings.soldOut).appendTo($imageCont);
      }
    } else {
      if (theme.settings.saleLabelEnabled && item.compareAtPrice > item.price) {
        $('<span class="product-label product-label--on-sale global-border-radius"></span>').html(theme.strings.onSale).appendTo($imageCont);
      }
    }

    $('<div class="product-block__title small-text">').html(item.title).appendTo($item);

    if (showVendor) {
      $('<div class="product-block__vendor tiny-text">').html(item.vendor).appendTo($item);
    }

    return $item;
  };

  theme.getRecentProducts = function () {
    var existingValue = window.localStorage.getItem(theme.recentProductsStorageKey);
    if (existingValue) {
      try {
        return JSON.parse(existingValue);
      } catch (error) {}
    }
    return [];
  };

  theme.addToAndReturnRecentProducts = function (data) {
    var existingArr = theme.getRecentProducts();

    // remove existing occurences
    var run = true;
    while (run) {
      run = false;
      for (var i = 0; i < existingArr.length; i++) {
        if (existingArr[i].handle == data.handle) {
          existingArr.splice(i, 1);
          run = true;
          break;
        }
      }
    }

    // add this onto the end
    data.timestamp = new Date().getTime();
    existingArr.push(data);

    // cap history
    while (existingArr.length > theme.recentProductHistoryCap) {
      existingArr.shift();
    }

    // save updated recent products list
    window.localStorage.setItem(theme.recentProductsStorageKey, JSON.stringify(existingArr));

    return existingArr;
  };

  // init slideshow
  theme.loadRecentlyViewed = function ($container) {
    theme.peekCarousel.init($container, $('.grid', $container), '.recentlyViewed', function () {
      return $(window).width() < 768;
    });

    // and filter out any lazy-loaded
    $('.grid', $container).filter('.slick-initialized').slick('slickFilter', ':not(.product-block--recent-unloaded)');
  };

  // unload slideshow
  theme.unloadRecentlyViewed = function ($container) {
    theme.peekCarousel.destroy($container, $('.slick-initialized', $container), '.recentlyViewed');
  };
  ;
  /* Product Media
   *
   * Load and destroy:
   * theme.ProductMedia.init(galleryContainer, {
   *   onModelViewerPlay: function(e){
   *     $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', false);
   *   },
   *   onModelViewerPause: function(e){
   *     $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', true);
   *   },
   *   onPlyrPlay: function(e){
   *     $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', false);
   *   },
   *   onPlyrPause: function(e){
   *     $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', true);
   *   },
   * });
   *
   * theme.ProductMedia.destroy(galleryContainer);
   *
   * Trigger mediaVisible and mediaHidden events based on UI
   * $slickSlideshow.on('afterChange', function(evt, slick, current){
   *   $('.product-media--activated').removeClass('product-media--activated').trigger('mediaHidden');
   *   $('.product-media', slick.$slides[current]).addClass('product-media--activated').trigger('mediaVisible');
   * });
   */
  theme.ProductMedia = new function () {
    var _ = this;

    _._setupShopifyXr = function () {
      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', _._setupShopifyXr.bind(this));
        return;
      }

      window.ShopifyXR.addModels(JSON.parse($(this).html()));
      window.ShopifyXR.setupXRElements();
    };

    this.init = function (container, callbacks) {
      var callbacks = callbacks || {},
      _container = container;

      // when any media appears
      $(container).on('mediaVisible', '.product-media--video-loaded, .product-media--model-loaded', function () {
        // autoplay all media on larger screens
        if ($(window).width() >= 768) {
          $(this).data('player').play();
        }
        // update view-in-space
        if ($(this).hasClass('product-media--model')) {
          $('.view-in-space', _container).attr('data-shopify-model3d-id', $(this).data('model-id'));
        }
      });

      // when any media is hidden
      $(container).on('mediaHidden', '.product-media--video-loaded, .product-media--model-loaded', function () {
        // pause all media
        $(this).data('player').pause();
      });

      // necessary callbacks
      if (callbacks.onVideoVisible) {
        $(container).on('mediaVisible', '.product-media--video-loaded', callbacks.onVideoVisible);
      }

      if (callbacks.onVideoHidden) {
        $(container).on('mediaHidden', '.product-media--video-loaded', callbacks.onVideoHidden);
      }

      $('model-viewer', container).each(function () {
        if (callbacks.onModelViewerPlay) {
          $(this).on('shopify_model_viewer_ui_toggle_play', callbacks.onModelViewerPlay);
        }
        if (callbacks.onModelViewerPause) {
          $(this).on('shopify_model_viewer_ui_toggle_pause', callbacks.onModelViewerPause);
        }
      });

      // set up video media elements with a controller
      $(container).find('.product-media--video').each(function (index) {
        var enableLooping = $(this).data('enable-video-looping'),
        element = $(this).find('iframe, video')[0],
        $currentMedia = $(this);
        if (element.tagName === 'VIDEO') {
          // set up a controller for Plyr video
          window.Shopify.loadFeatures([
          {
            name: 'video-ui',
            version: '1.0',
            onLoad: function () {
              var playerObj = { playerType: 'html5', element: element };

              playerObj.play = function () {
                this.plyr.play();
              }.bind(playerObj);

              playerObj.pause = function () {
                this.plyr.pause();
              }.bind(playerObj);

              playerObj.destroy = function () {
                this.plyr.destroy();
              }.bind(playerObj);

              playerObj.plyr = new Shopify.Plyr(element, {
                controls: [
                'play',
                'progress',
                'mute',
                'volume',
                'play-large',
                'fullscreen'],

                loop: { active: enableLooping },
                hideControlsOnPause: true,
                iconUrl: '//cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.svg',
                tooltips: { controls: false, seek: true } });

              $(this).data('player', playerObj).addClass('product-media--video-loaded');

              // callbacks for Plyr playback
              $(element).on('playing', function () {
                // pause other media
                $('.product-media').not($currentMedia).trigger('mediaHidden');
                // when playing, intercept events going through controls:
                // - prevent bubbling of mouse/touch start, for carousel gestures
                // - prevent bubbling of keydown, for carousel navigation
                $currentMedia.find('.plyr__controls').off('.themeMediaEventFix').
                on('keydown.themeMediaEventFix touchstart.themeMediaEventFix mousedown.themeMediaEventFix keydown.themeMediaEventFix', function (e) {
                  e.stopPropagation();
                });
                if (callbacks.onPlyrPlay) {
                  callbacks.onPlyrPlay(playerObj);
                }
              });
              $(element).on('pause ended', function () {
                // remove event bubbling interceptor
                $currentMedia.find('.plyr__controls').off('.themeMediaEventFix');
                if (callbacks.onPlyrPause) {
                  callbacks.onPlyrPause(playerObj);
                }
              });
              if (callbacks.onPlyrInit) {
                callbacks.onPlyrInit(playerObj);
              }
            }.bind(this) }]);


          theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.css');

        } else if (element.tagName === 'IFRAME') {
          if (
          /^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(
          element.src))

          {
            // set up a controller for YouTube video
            var existingYTCB = window.onYouTubeIframeAPIReady;
            var loadYoutubeVideo = function () {
              var playerObj = { playerType: 'youtube', element: element };
              var videoId = $(this).data('video-id');

              playerObj.player = new YT.Player(element, {
                videoId: videoId,
                events: {
                  onStateChange: function (event) {
                    if (event.data === YT.PlayerState.ENDED && enableLooping) {
                      event.target.seekTo(0);
                    }

                    if (event.data === YT.PlayerState.PLAYING) {
                      $('.product-media').not($currentMedia).trigger('mediaHidden');
                      if (callbacks.onYouTubePlay) {
                        callbacks.onYouTubePlay(playerObj);
                      }
                    }

                    if (event.data === YT.PlayerState.PAUSED && event.data === YT.PlayerState.ENDED) {
                      if (callbacks.onYouTubePause) {
                        callbacks.onYouTubePause(playerObj);
                      }
                    }
                  } } });



              playerObj.play = function () {
                this.player.playVideo();
              }.bind(playerObj);

              playerObj.pause = function () {
                this.player.pauseVideo();
              }.bind(playerObj);

              playerObj.destroy = function () {
                this.player.destroy();
              }.bind(playerObj);

              $(this).data('player', playerObj).addClass('product-media--video-loaded');

              if (callbacks.onYouTubeInit) {
                callbacks.onYouTubeInit(playerObj);
              }
            }.bind(this);

            if (window.YT && window.YT.Player) {
              loadYoutubeVideo();
            } else {
              window.onYouTubeIframeAPIReady = function () {
                if (existingYTCB) {
                  existingYTCB();
                }
                loadYoutubeVideo();
              };
              theme.loadScriptOnce('https://www.youtube.com/iframe_api');
            }
          }
        }
      });

      // set up a 3d model when it first appears
      $(container).on('mediaVisible mediaVisibleInitial', '.product-media--model:not(.product-media--model-loaded):not(.product-media--model-loading)', function (e) {
        var element = $(this).find('model-viewer')[0],
        $currentMedia = $(this),
        autoplay = e.type != 'mediaVisibleInitial';
        // do not run this twice
        $(this).addClass('product-media--model-loading');
        // load viewer
        theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css');
        window.Shopify.loadFeatures([
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: function () {
            $(this).data('player', new Shopify.ModelViewerUI(element));
            // insert mouseup event proxy, to allow mouseup to bubble up outside model viewer ui when player is paused, for carousel swipe gestures
            $('<div class="theme-event-proxy">').on('mouseup', function (e) {
              e.stopPropagation();
              e.preventDefault();
              var newEventTarget = $(e.currentTarget).closest('.product-media')[0];
              newEventTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }).appendTo(
            $(this).find('.shopify-model-viewer-ui__controls-overlay'));

            // when playing or loading, intercept events that bubble up outside the viewer:
            // - prevent bubbling of mouse/touch start, for carousel gestures
            // - prevent bubbling of keydown, for carousel navigation
            $(this).find('model-viewer').on('shopify_model_viewer_ui_toggle_play', function () {
              $(this).closest('.product-media').on('touchstart.themeModelViewerFix mousedown.themeModelViewerFix keydown.themeModelViewerFix', function (e) {
                e.stopPropagation();
              });
            }).on('shopify_model_viewer_ui_toggle_pause', function () {
              $(this).closest('.shopify-model-viewer-ui').off('.themeMediaEventFix');
            });
            // ensure play exclusivity
            $(this).find('model-viewer').on('shopify_model_viewer_ui_toggle_play', function () {
              $('.product-media').not($currentMedia).trigger('mediaHidden');
            });
            // set class and re-trigger visible event now loaded
            $(this).addClass('product-media--model-loaded').removeClass('product-media--model-loading');
            if (callbacks.onModelViewerInit) {
              callbacks.onModelViewerInit(element);
            }
            if (autoplay) {
              $(this).trigger('mediaVisible');
            }
          }.bind(this) }]);


      });

      // load AR viewer
      if ($('.model-json', container).length) {
        window.Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: _._setupShopifyXr.bind($('.model-json', container)) }]);



        // pause video when a 3d model is launched in AR
        $(document).on('shopify_xr_launch', function () {
          $('.product-media--video-loaded').each(function () {
            $(this).data('player').pause();
          });
        });
      }

      // 3d model in first place - start in paused mode
      setTimeout(function () {
        $('.product-media:first', this).filter('.product-media--model').trigger('mediaVisibleInitial');
      }.bind(container), 50);
    };

    this.destroy = function (container) {
      $(document).off('shopify_xr_launch');
      $(container).off('mediaVisible mediaVisibleInitial mediaHidden');
      $('.product-media--video-loaded, .product-media--model-loaded', container).each(function () {
        $(this).data('player').destroy();
      });
      $('.product-media--video video', container).off('playing pause ended');
      $('model-viewer', container).off('shopify_model_viewer_ui_toggle_play shopify_model_viewer_ui_toggle_pause');
    };
  }();


  /*================ Sections ================*/
  /**
   * Header Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace header
   */

  theme.Header = new function () {
    /**
     * Header section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */

    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);
      this.$nav = $('.site-nav', container);
      this.$navLinks = this.$nav.children('.site-nav__item:not(.site-nav__more-links)');
      this.$navMoreLinksLink = $('.site-nav__more-links', this.$nav);
      this.$navMoreLinksContainer = $('.small-dropdown__container', this.$navMoreLinksLink);
      this.$navMoreLinksSubmenuContainer = $('.site-nav__more-links .more-links__dropdown-container', this.$nav);
      this.search = {
        ongoingRequest: null,
        ongoingTimeoutId: -1,
        throttleMs: 500,
        searchUrlKey: 'searchUrl',
        resultsSelector: '.search-bar__results',
        resultsLoadingClass: 'search-bar--loading-results',
        resultsLoadedClass: 'search-bar--has-results',
        loadingMessage: theme.strings.searchLoading,
        moreResultsMessage: theme.strings.searchMoreResults,
        emptyMessage: theme.strings.searchNoResults };


      var breakpoint = 767.98;

      $(this.$container).on('click' + this.namespace, '.js-search-form-open', this.functions.searchFormOpen.bind(this));
      $(this.$container).on('click' + this.namespace, '.js-search-form-focus', this.functions.searchFormFocus.bind(this));
      $(this.$container).on('click' + this.namespace, '.js-search-form-close', this.functions.searchFormClose.bind(this));
      $(this.$container).on('click' + this.namespace, '.js-mobile-menu-icon', this.functions.mobileMenuOpen.bind(this));
      $(this.$container).on('click' + this.namespace, '.js-close-mobile-menu', this.functions.mobileMenuClose.bind(this));
      $(this.$container).on('focusin' + this.namespace, '.search-bar', this.functions.searchFocusIn.bind(this));
      $(this.$container).on('focusout' + this.namespace, '.search-bar', this.functions.searchFocusOut.bind(this));

      if ($('.search-bar[data-live-search="true"]', this.$container).length) {
        $(this.$container).on('keyup' + this.namespace + ' change' + this.namespace, '.search-bar[data-live-search="true"] input[name="q"]', this.functions.updateSearchResults.bind(this));
      }

      // make hidden search fields un-tabbable
      this.functions.setSearchTabbing.bind(this)();

      $('.focus-tint').on('click' + this.namespace, this.functions.onFocusTintClick.bind(this));

      $('body').toggleClass('header-has-messages', this.$container.find('.store-messages-bar').length > 0);

      /**
       * Header messages bar carousel
       */
      $('.js-messages-slider', this.$container).slick({
        infinite: true,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: false,
        nextArrow: false });


      /**
      * Breakpoint to unslick above 767px
      */
      $('.js-mobile-messages-slider', this.$container).slick({
        infinite: true,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        mobileFirst: true,
        prevArrow: false,
        nextArrow: false,
        responsive: [
        {
          breakpoint: breakpoint,
          settings: 'unslick' }] });




      /**
      * Reset the messages slider to use slick when screen size decreased to =< 767px
      */

      $(window).on('debouncedresize' + this.namespace, function (e) {
        $('.js-mobile-messages-slider', this.$container).slick('resize');
      });


      /**
       * Open/close mobile nested menus
       */
      $(this.$container).on('click' + this.namespace, '.mobile-site-nav__icon, .mobile-site-nav__link[href="#"]', function (e) {
        e.preventDefault();
        $(this).siblings('.mobile-site-nav__menu').slideToggle(250);
        $(this).toggleClass('submenu-open');
      });

      // Docked nav
      if (this.$container.hasClass('docking-header')) {
        this.desktopHeaderWasDocked = false;
        this.$dockedDesktopContentsContainer = $('.docked-navigation-container__inner', container);
        this.$dockedDesktopBaseContainer = $('.docked-navigation-container', container);
        this.mobileHeaderWasDocked = false;
        this.$dockedMobileContentsContainer = $('.docked-mobile-navigation-container__inner', container);
        this.$dockedMobileBaseContainer = $('.docked-mobile-navigation-container', container);
        // check now
        $(this.functions.dockedNavCheck.call(this));
        $(window).on('scroll' + this.namespace, this.functions.dockedNavCheck.bind(this));
        $(window).on('debouncedresize' + this.namespace, this.functions.dockedNavCheck.bind(this));

        // add style for docked nav
        $(this.functions.updateDockedNavHeightStyle.call(this));
        $(window).on('debouncedresize' + this.namespace, this.functions.updateDockedNavHeightStyle.bind(this));
      }

      // Keep menu in one row
      $(this.functions.menuLinkVisibilityCheck.call(this));
      $(window).on('debouncedresize' + this.namespace, this.functions.menuLinkVisibilityCheck.bind(this));

      // Display of overflow menu
      $(this.$container).on('mouseenter' + this.namespace, '.more-links--with-dropdown .site-nav__item', this.functions.onMoreLinksSubMenuActive.bind(this));

      // nav enhancements
      this.navHoverDelay = 250;
      this.$navLastOpenDropdown = $();
      $(this.$container).on('mouseenter' + this.namespace + ' mouseleave' + this.namespace, '.site-nav__item--has-dropdown', function (evt) {
        var $dropdownContainer = $(evt.currentTarget);
        // delay on hover-out
        if (evt.type == 'mouseenter') {
          clearTimeout(this.navOpenTimeoutId);
          clearTimeout($dropdownContainer.data('navCloseTimeoutId'));
          var $openSiblings = $dropdownContainer.siblings('.open');

          // close all menus but last opened
          $openSiblings.not(this.$navLastOpenDropdown).removeClass('open');
          this.$navLastOpenDropdown = $dropdownContainer;

          // show after a delay, based on first-open or not
          var timeoutDelay = $openSiblings.length == 0 ? 0 : this.navHoverDelay;

          // open it
          var navOpenTimeoutId = setTimeout(function () {
            $dropdownContainer.addClass('open').
            siblings('.open').
            removeClass('open');
            var $dropdown = $dropdownContainer.children('.small-dropdown:not(.more-links-dropdown)');
            if ($dropdown.length && $dropdownContainer.parent().hasClass('site-nav')) {
              var right = $dropdownContainer.offset().left + $dropdown.outerWidth();
              var transform = '',
              cw = this.$container.outerWidth() - 10;
              if (right > cw) {
                transform = 'translateX(' + (cw - right) + 'px)';
              }
              $dropdown.css('transform', transform);
            }

          }.bind(this), timeoutDelay);

          this.navOpenTimeoutId = navOpenTimeoutId;
          $dropdownContainer.data('navOpenTimeoutId', navOpenTimeoutId);
        } else {
          // cancel opening, and close after delay
          clearTimeout($dropdownContainer.data('navOpenTimeoutId'));
          $dropdownContainer.data('navCloseTimeoutId', setTimeout(function () {
            $dropdownContainer.removeClass('open').
            children('.small-dropdown:not(.more-links-dropdown)').
            css('transform', '');
          }, this.navHoverDelay));
        }
        // a11y
        $dropdownContainer.children('[aria-expanded]').attr('aria-expanded', evt.type == 'mouseenter');
      }.bind(this));

      // keyboard nav
      $(this.$container).on('keydown' + this.namespace, '.site-nav__item--has-dropdown > .site-nav__link', this.functions.dropdownLinkKeyPress.bind(this));

      // touch events
      $(this.$container).on('touchstart' + this.namespace + ' touchend' + this.namespace + ' click' + this.namespace, '.site-nav__item--has-dropdown > .site-nav__link', function (evt) {
        if (evt.type == 'touchstart') {
          $(this).data('touchstartedAt', evt.timeStamp);
        } else if (evt.type == 'touchend') {
          // down & up in under a second - presume tap
          if (evt.timeStamp - $(this).data('touchstartedAt') < 1000) {
            $(this).data('touchOpenTriggeredAt', evt.timeStamp);
            if ($(this).parent().hasClass('open')) {
              // trigger close
              $(this).parent().trigger('mouseleave');
            } else {
              // trigger close on any open items
              $('.site-nav__item.open').trigger('mouseleave');
              // trigger open
              $(this).parent().trigger('mouseenter');
            }
            // prevent fake click
            return false;
          }
        } else if (evt.type == 'click') {
          // if touch open was triggered very recently, prevent click event
          if ($(this).data('touchOpenTriggeredAt') && evt.timeStamp - $(this).data('touchOpenTriggeredAt') < 1000) {
            return false;
          }
        }
      });

      // account link dropdown
      $(this.$container).on('touchstart' + this.namespace, '.customer-account__parent-link', function () {
        // indicate we are using touch - to disable hover and prevent iOS issues
        $(this).closest('.customer-account').addClass('customer-account--using-touch');
      });
      $(this.$container).on('click' + this.namespace, '.customer-account__parent-link', this.functions.onAccountIconClick.bind(this));

      // localization
      $('.disclosure', this.$container).each(function () {
        $(this).data('disclosure', new theme.Disclosure($(this)));
      });
    };

    this.functions = {
      /**
       * Click account icon - do nothing special on mobile, toggle dropdown otherwise
       */
      onAccountIconClick: function (evt) {
        if ($(window).width() >= 768) {
          evt.preventDefault();
          var isOpen = $(evt.target).closest('.customer-account').toggleClass('customer-account--reveal-menu').hasClass('customer-account--reveal-menu');
          $(evt.target).closest('.customer-account__parent-link').attr('aria-expanded', isOpen);
        }
      },

      /**
       * Press return on dropdown parent to reveal children
       */
      dropdownLinkKeyPress: function (evt) {
        if (evt.which == 13) {
          if ($(evt.target).closest('.site-nav__dropdown').length && $(evt.target).closest('.more-links').length) {
            // in more-links
            $(evt.target).trigger('mouseenter');
          } else {
            // normal dropdown
            var isOpen = $(evt.target).closest('.site-nav__item--has-dropdown').toggleClass('open').hasClass('open');
            // a11y
            $(evt.target).attr('aria-expanded', isOpen);
          }
          return false;
        }
      },

      /**
       * Ensure hidden search forms cannot be tabbed to
       */
      setSearchTabbing: function (evt) {
        $('.search-bar', this.$container).each(function () {
          if ($(this).css('pointer-events') == 'none') {
            $(this).find('a, input, button').attr('tabindex', '-1');
          } else {
            $(this).find('a, input, button').removeAttr('tabindex');
          }
        });
      },

      /**
       * Event on focus of a more-links top-level link
       */
      onMoreLinksSubMenuActive: function (evt) {
        this.$navMoreLinksSubmenuContainer.empty();
        var $childMenu = $(evt.currentTarget).children('.site-nav__dropdown');
        if ($childMenu.length) {
          var $clone = $childMenu.clone();
          // alter layout of mega nav columns
          $clone.find('.mega-dropdown__container .one-third').removeClass('one-third').addClass('one-half');
          $clone.find('.mega-dropdown__container .one-quarter').removeClass('one-quarter').addClass('one-third');
          $clone.find('.site-nav__promo-container > .three-quarters').removeClass('three-quarters').addClass('two-thirds');
          $clone.find('.site-nav__promo-container > .one-quarter').removeClass('one-quarter').addClass('one-third');
          // add to visible container
          $clone.appendTo(this.$navMoreLinksSubmenuContainer);
        }
        var submenuHeight = this.$navMoreLinksSubmenuContainer.outerHeight() + 30; // extra for nav padding
        this.$navMoreLinksSubmenuContainer.parent().css('min-height', submenuHeight);
        $(evt.currentTarget).
        removeClass('more-links__parent--inactive').
        addClass('more-links__parent--active').
        siblings().
        removeClass('more-links__parent--active').
        addClass('more-links__parent--inactive');
        // a11y
        $(evt.target).attr('aria-expanded', true);
        $(evt.target).parent().siblings().find('a').attr('aria-expanded', false);
      },

      /**
       * Event for checking visible links in menu
       */
      menuLinkVisibilityCheck: function (evt) {
        var navWidth = this.$nav.width();
        var moreLinksWidth = this.$navMoreLinksLink.width();

        // check if we have too many links to show
        var spacingOffset = 4; // inline elements
        var total = 0;
        this.$navLinks.each(function () {
          total += $(this).width() + spacingOffset;
        });

        if (total > navWidth) {
          // calculate which links to move
          total = moreLinksWidth;
          var $_ref = this.$navMoreLinksContainer.empty();
          this.$navLinks.each(function () {
            total += $(this).width() + spacingOffset;
            if (total > navWidth) {
              $_ref.append(
              $(this).clone().removeClass('site-nav__invisible'));

              $(this).addClass('site-nav__invisible').find('a').attr('tabindex', '-1');
            } else {
              $(this).removeClass('site-nav__invisible').find('a').removeAttr('tabindex');
            }
          });
          this.$navMoreLinksLink.attr('role', 'menu');
          this.$navMoreLinksContainer.find('a').removeAttr('tabindex');
          this.$navMoreLinksLink.removeClass('site-nav__invisible');
          this.$navMoreLinksLink.toggleClass('more-links--with-dropdown', this.$navMoreLinksLink.find('.small-dropdown:first, .mega-dropdown:first').length > 0);
          this.$navMoreLinksLink.toggleClass('more-links--with-mega-dropdown', this.$navMoreLinksLink.find('.mega-dropdown:first').length > 0);
          this.$navMoreLinksContainer.find('.small-dropdown').css('transform', '');
        } else {
          // hide more-links
          this.$navLinks.removeClass('site-nav__invisible');
          this.$navMoreLinksLink.addClass('site-nav__invisible');
          this.$navMoreLinksLink.removeAttr('role');
          this.$navMoreLinksContainer.empty();
        }
      },

      /**
       * Event for showing the search bar
       */
      searchFormOpen: function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        $('body').addClass('search-bar-open');
        $('.search-bar:not(.mobile-menu-search):visible input[name="q"]', this.$container).focus();
        this.functions.setSearchTabbing.bind(this)();
      },

      /**
       * Event for transferring focus to the search bar input
       */
      searchFormFocus: function (evt) {
        $('.search-bar:visible input[name="q"]', this.$container).focus();
      },

      /**
       * Event for closing the search bar
       */
      searchFormClose: function (evt) {
        $('body').removeClass('search-bar-open search-bar-in-focus');
        this.functions.setSearchTabbing.bind(this)();
        // focus on the open button
        if (evt && evt.target) {
          $(evt.target).closest('.search-bar').prev('a').focus().blur();
        }
      },

      /**
       * Event for when focus enters the search bar
       */
      searchFocusIn: function (evt) {
        // ensure focus class is added by clearing any associated class removal
        clearTimeout(this.searchFocusOutTimeout);
        $('body').addClass('search-bar-in-focus');
      },

      /**
       * Event for when focus leaves the search bar
       */
      searchFocusOut: function (evt) {
        // defer in case focus on another element requires cancelling this
        this.searchFocusOutTimeout = setTimeout(function () {
          $('body').removeClass('search-bar-in-focus');
          $('.search-bar').removeClass('search-bar--has-results');
        }, 100);
      },

      /**
       * Event for clicks on the page focus tint
       */
      onFocusTintClick: function (evt) {
        this.functions.searchFormClose.bind(this)();
        return false;
      },

      /**
       * Event for showing the mobile navigation
       */
      mobileMenuOpen: function (evt) {
        $('.header-navigation', this.$container).addClass('header-navigation--open');
        $(document.body, this.$container).addClass('mobile-menu-open');
      },

      /**
       * Event for closing the mobile navigation
       */
      mobileMenuClose: function (evt) {
        $('.header-navigation', this.$container).removeClass('header-navigation--open');
        $(document.body, this.$container).removeClass('mobile-menu-open');
      },

      /**
       * Event for fetching new search results
       */
      updateSearchResults: function (evt) {
        var $form = $(evt.target).closest('form');
        var $bar = $form.closest('.search-bar');

        // build search url
        var searchUrl = $form.attr('action') + ($form.attr('action').indexOf('?') >= 0 ? '&' : '?') + $form.serialize();

        // has results url changed?
        if (searchUrl != $form.data(this.search.searchUrlKey)) {
          $form.data(this.search.searchUrlKey, searchUrl);

          // cancel any ongoing request
          this.functions._abortSearch.bind(this)();

          // hide results if under 3 characters entered
          var term = $form.find('input[name="q"]').val();
          if (term.length < 2) {
            this.functions._searchResultsHide.bind(this)($bar);
          } else {
            // fetch results
            $bar.addClass(this.search.resultsLoadingClass);
            $bar.find(this.search.resultsSelector).html('<div class="search-result search-result--loading">' + this.search.loadingMessage + '</div>');
            this.search.ongoingTimeoutId = setTimeout(this.functions._fetchResults.bind(this, $form, searchUrl, $bar), this.search.throttleMs);
          }
        }
      },

      /**
       * Cancel current search
       */
      _abortSearch: function () {
        if (this.search.ongoingRequest) {
          this.search.ongoingRequest.abort();
        }
        clearTimeout(this.search.ongoingTimeoutId);
      },

      /**
       * Immediately fetch search results
       */
      _fetchResults: function ($searchForm, searchUrl, $bar) {
        var ajaxUrl, ajaxData;
        if (theme.shopifyFeatures.predictiveSearch) {
          // use the API
          ajaxUrl = theme.routes.search_url + '/suggest.json';
          ajaxData = {
            "q": $searchForm.find('input[name="q"]').val(),
            "resources": {
              "type": $searchForm.find('input[name="type"]').val(),
              "limit": 5,
              "limit_scope": "each",
              "options": {
                "unavailable_products": 'last',
                "fields": $bar.data('live-search-meta') ? "title,product_type,variants.title,vendor,tag,variants.sku" : "title,product_type,variants.title,vendor" } } };



        } else {
          // use the theme template fallback
          ajaxUrl = $searchForm.attr('action') + '?' + $searchForm.serialize() + '&view=data';
          ajaxData = null;
        }

        this.search.ongoingRequest = $.ajax({
          url: ajaxUrl,
          data: ajaxData,
          dataType: "json",
          success: this.functions._searchResultsSuccess.bind(this, $bar, searchUrl) }).
        fail(function ($bar, request) {
          console.log('Error fetching results');
          this.functions._searchResultsHide.bind(this, $bar);
        }.bind(this, $bar)).always(function () {
          this.search.ongoingRequest = null;
        }.bind(this));
      },

      /**
       * Success fetching results - build and show
       */
      _searchResultsSuccess: function ($bar, searchUrl, response) {
        $bar.addClass(this.search.resultsLoadedClass).removeClass(this.search.resultsLoadingClass);
        const $results = $('<div class="search-results__results">'),
        $queries = $('<div class="search-results__queries">'),
        showPrice = $bar.data('live-search-price'),
        showVendor = $bar.data('live-search-vendor');
        let $moreResults = null;

        if (
        response.resources.results.products && response.resources.results.products.length > 0 ||
        response.resources.results.pages && response.resources.results.pages.length > 0 ||
        response.resources.results.articles && response.resources.results.articles.length > 0 ||
        response.resources.results.queries && response.resources.results.queries.length > 0)
        {
          if (response.resources.results.products) {
            for (var i = 0; i < response.resources.results.products.length; i++) {
              var result = response.resources.results.products[i];
              var $result = $('<a class="search-result">').attr('href', result.url);
              var $titleAndPrice = $('<div class="search-result__title">').appendTo($result);

              $('<div class="search-result__product">').html(result.title).appendTo($titleAndPrice);

              if (showVendor) {
                $('<div class="search-result__vendor">').text(result.vendor).appendTo($titleAndPrice);
              }

              if (showPrice) {
                var $price = $('<div class="search-result__price product-price">').appendTo($titleAndPrice);

                if (parseFloat(result.price_min) != parseFloat(result.price_max)) {
                  $price.append(
                  $('<span class="product-price__from">').html(theme.strings.priceFrom)).
                  append(' ');
                }

                if (parseFloat(result.compare_at_price_min) > parseFloat(result.price_min)) {
                  $price.append(
                  $('<span class="theme-money">').addClass('product-price__reduced').
                  html(theme.Shopify.formatMoney(result.price_min, theme.moneyFormatWithCodeForProductsPreference))).
                  append(' ').
                  append(
                  $('<span class="product-price__compare theme-money">').html(theme.Shopify.formatMoney(result.compare_at_price_min, theme.moneyFormat)));

                } else {
                  $('<span class="theme-money">').html(theme.Shopify.formatMoney(result.price_min, theme.moneyFormatWithCodeForProductsPreference)).appendTo($price);
                }
              }

              var $thumb;
              if (result.image) {
                $thumb = $('<span class="search-result__image">').append(
                $('<img role="presentation" alt="">').attr('src', slate.Image.getSizedImageUrl(result.image, '100x100_crop_center')));

              } else {
                $thumb = $('<span class="search-result__image">').append(
                $('<span class="search-result__char">').html(result.title[0]));

              }
              !result.title?.toLowerCase().includes('extra charge') ? $result.prepend($thumb).appendTo($results) : null;
            }
          }
          if (response.resources.results.articles) {
            for (var i = 0; i < response.resources.results.articles.length; i++) {
              var result = response.resources.results.articles[i];
              var $result = $('<a class="search-result">').
              attr('href', result.url).
              append($('<span class="search-result__title">').text(result.title));
              var $thumb;
              if (result.image) {
                $thumb = $('<span class="search-result__image">').append(
                $('<img role="presentation" alt="">').attr('src', slate.Image.getSizedImageUrl(result.image, '100x100_crop_center')));

              } else {
                $thumb = $('<span class="search-result__image">').append(
                $('<span class="search-result__char">').html(result.title[0]));

              }
              $result.prepend($thumb).appendTo($results);
            }
          }
          if (response.resources.results.pages) {
            for (var i = 0; i < response.resources.results.pages.length; i++) {
              var result = response.resources.results.pages[i];
              var $result = $('<a class="search-result">').
              attr('href', result.url).
              append($('<span class="search-result__title">').text(result.title));
              var $thumb = $('<span class="search-result__image">').append($('<span class="search-result__char">').html(result.title[0]));
              $result.prepend($thumb).appendTo($results);
            }
          }
          if (response.resources.results.queries && response.resources.results.queries.length > 0) {
            var queries = "";
            for (var i = 0; i < response.resources.results.queries.length; i++) {
              var query = response.resources.results.queries[i];
              queries += `<li class="search-result search-result--query"><a href="${query.url}">${query.styled_text}</a></li>`;
            }
            $queries.html(queries);
          }

          $moreResults = $('<a class="search-result search-result--more">').
          attr('href', searchUrl).
          html(this.search.moreResultsMessage);
        } else {
          $results.append('<div class="search-result search-result--empty">' + this.search.emptyMessage + '</div>');
        }

        const $resultContainer = $bar.find(this.search.resultsSelector);
        $resultContainer.html($results);

        if ($moreResults) {
          $moreResults.appendTo($resultContainer);
        }

        if (response.resources.results.queries && response.resources.results.queries.length > 0) {
          $resultContainer.prepend($queries);
        }
      },

      /**
       * Empty and hide search results
       */
      _searchResultsHide: function ($bar) {
        $bar.removeClass(this.search.resultsLoadedClass).
        removeClass(this.search.resultsLoadingClass).
        find(this.search.resultsSelector).
        empty();
      },

      /**
       * Check if we should dock both desktop/mobile header
       */
      dockedNavCheck: function (evt) {
        var scrollTop = $(window).scrollTop();
        var desktopShouldDock = $(window).width() >= theme.dockedNavDesktopMinWidth && this.$dockedDesktopBaseContainer.offset().top < scrollTop;
        var mobileShouldDock = $(window).width() < theme.dockedNavDesktopMinWidth && this.$dockedMobileBaseContainer.offset().top < scrollTop;

        if (desktopShouldDock) {
          // set dock placeholder height
          this.$dockedDesktopBaseContainer.css('height', this.$dockedDesktopContentsContainer.outerHeight());
        } else {
          // remove placeholder height if undocking
          if (this.desktopHeaderWasDocked) {
            this.$dockedDesktopBaseContainer.css('height', '');
          }
        }

        if (mobileShouldDock) {
          // set dock placeholder height
          this.$dockedMobileBaseContainer.css('height', this.$dockedMobileContentsContainer.outerHeight());
        } else {
          // remove placeholder height if undocking
          if (this.mobileHeaderWasDocked) {
            this.$dockedMobileBaseContainer.css('height', '');
          }
        }

        this.$container.toggleClass('docked-header--dock', desktopShouldDock || mobileShouldDock);

        // check menu links if width of nav has changed
        if (desktopShouldDock != this.desktopHeaderWasDocked) {
          this.functions.menuLinkVisibilityCheck.bind(this)();
        }

        this.desktopHeaderWasDocked = desktopShouldDock;
        this.mobileHeaderWasDocked = mobileShouldDock;
      },

      /**
       * Update the sticky element height based on the docked nav height
       */
      updateDockedNavHeightStyle: function () {
        var productStickyTop = theme.dockedNavHeight() + 30;
        document.documentElement.style.setProperty('--theme-sticky-header-height', theme.dockedNavHeight() + 'px');
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $('.focus-tint').off(this.namespace);
      $(window).off(this.namespace);
      $('.js-messages-slider', this.$container).slick('unslick');
      $('.js-mobile-messages-slider', this.$container).slick('unslick');

      $('.disclosure', this.$container).each(function () {
        $(this).data('disclosure').unload();
      });
    };
  }();
  ;
  /**
   * Footer Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the List Collections template.
   *
     * @namespace Footer
   */

  theme.Footer = new function () {
    /**
     * Footer section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // sticky footer
      this.$stickyFooter = $('.sticky-footer', container);
      // clear classes set outside of this container
      $('body').removeClass('sticky-footer-not-visible sticky-footer-partly-visible sticky-footer-fully-visible sticky-footer-taller-than-page sticky-footer-scrolled-into');
      // if sticky, assign events
      if (this.$stickyFooter.length) {
        this.functions.stickyResize.bind(this)();
        this.functions.stickyScroll.bind(this)();
        $(window).on('debouncedresize' + this.namespace, this.functions.stickyResize.bind(this));
        $(window).on('scroll' + this.namespace, this.functions.stickyScroll.bind(this));
      } else {
        // if footer is not sticky, check if it needs pushing down on short pages
        this.$footerInner = this.$container.find('.page-footer__inner ');
        this.functions.pushDown.call(this);
        $(window).on('debouncedresize' + this.namespace, this.functions.pushDown.bind(this));
      }

      // localization
      $('.disclosure', this.$container).each(function () {
        $(this).data('disclosure', new theme.Disclosure($(this)));
      });
    };

    this.functions = {
      /**
       * Push footer down on short pages, so it meets the edge of the viewport
       */
      pushDown: function () {
        var gap = $(window).height() - (this.$container.offset().top + this.$footerInner.outerHeight());
        if (gap > 0) {
          this.$container.css('padding-top', gap);
        } else {
          this.$container.css('padding-top', '');
        }
      },

      /**
       * Set a class to indicate if we've scrolled into the footer
       */
      stickyScroll: function () {
        $('body').toggleClass(
        'sticky-footer-scrolled-into',
        $(window).scrollTop() > this.$container.offset().top);

      },

      /**
       * Set footer container height and various utility classes
       */
      stickyResize: function () {
        var footerHeight = this.$stickyFooter.outerHeight();
        var footerOffsetTop = this.$container.offset().top;

        var partlyVisible = footerOffsetTop < $(window).height(),
        fullyVisible = footerOffsetTop + footerHeight < $(window).height(),
        tallerThanPage = footerHeight > $(window).height();

        // classes to define footer state when at the top of scroll
        $('body').toggleClass('sticky-footer-not-visible', !partlyVisible); // fully off-screen
        $('body').toggleClass('sticky-footer-partly-visible', partlyVisible && !fullyVisible); // partially off-screen
        $('body').toggleClass('sticky-footer-fully-visible', fullyVisible); // entirely on-screen
        $('body').toggleClass('sticky-footer-taller-than-page', tallerThanPage); // footer is taller than the viewport

        // match in-page footer container to sticky footer height
        this.$container.css('min-height', footerHeight);
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      $(window).off(this.namespace);

      $('.disclosure', this.$container).each(function () {
        $(this).data('disclosure').unload();
      });
    };
  }();

  /**
   * Product Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the Product template.
   *
     * @namespace product
   */

  theme.Product = new function () {

    var selectors = $.extend({}, theme.variants.selectors, {
      productJson: '[data-product-json]',
      productMediaContainer: '.product-detail__images',
      productMedia: '[data-product-media]',
      productImages: '[data-product-image]',
      productMediaThumbnails: '[data-product-media-thumbnail]',
      singleOptionSelector: '[data-single-option-selector]',
      skuWrapper: '.sku-wrapper',
      sku: '.sku-wrapper__sku',
      storeAvailability: '[data-store-availability-container]' });


    /**
     * Product section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      /// Init store availability if applicable
      if ($(selectors.storeAvailability, container).length) {
        this.storeAvailability = new theme.StoreAvailability($(selectors.storeAvailability, container)[0]);
      }

      // Stop parsing if we don't have the product json script tag when loading
      // section in the Theme Editor
      if (!$(selectors.productJson, this.$container).html()) {
        return;
      }

      var sectionId = this.$container.attr('data-section-id');
      this.productSingleObject = JSON.parse($(selectors.productJson + '.ProductJson-'+ theme.currentProductId || selectors.productJson, this.$container).html());
      var options = {
        $container: 
          this.$container,
        enableHistoryState: this.$container.data('enable-history-state') || false,
        singleOptionSelector: selectors.singleOptionSelector,
        originalSelectorId: selectors.originalSelectorId,
        secondaryIdSelectors: selectors.secondaryIdSelectors,
        product: this.productSingleObject };


      this.settings = {};
      this.settings.imageSize = 'master';
      this.variants = new slate.Variants(options);
      this.$productMediaContainer = $(selectors.productMediaContainer, this.$container);
      this.$productMedia = $(selectors.productMedia, this.$container);
      this.$productImages = $(selectors.productImages, this.$container);
      this.$productMediaThumbnails = $(selectors.productMediaThumbnails, this.$container);

      this.$container.on('variantChange' + this.namespace, theme.variants.updateAddToCartState.bind(this));
      this.$container.on('variantPriceChange' + this.namespace, theme.variants.updateProductPrices.bind(this));

      if (this.$container.find(selectors.skuWrapper)) {
        this.$container.on('variantChange' + this.namespace, this.functions.updateSKU.bind(this));
      }

      // set up desktop media behaviour
      if (this.$productMediaThumbnails.length) {
        // thumbnails control a slideshow
        if (this.$productMedia.length > 1) {
          this.$container.on('click' + this.namespace, selectors.productMediaThumbnails, this.functions.updatePrimaryProductMediaFromThumbnailClick.bind(this));
          this.$container.on('variantImageChange' + this.namespace, this.functions.updateProductMediaSlideshowFromVariantChange.bind(this));
        }

        // launch image zoom
        this.$container.on('click' + this.namespace, selectors.productImages, this.functions.openGallery.bind(this));
      } else {
        // media is in a column
        if (this.$productMedia.length > 1) {
          this.$container.on('variantImageChange' + this.namespace, this.functions.updateProductMediaColumn.bind(this));
          $(document).on('click' + this.namespace + ' keydown' + this.namespace, function () {
            this.$productMedia.not('.variant-dim--fixed').removeClass('variant-dim');
          }.bind(this));
          $(window).on('scroll' + this.namespace + ' ontouchstart' + this.namespace, function () {
            this.$productMedia.not('.variant-dim--fixed').removeClass('variant-dim');
          }.bind(this));

          // notify when media is on/off screen
          $(window).on('scroll' + this.namespace, this.functions.notifyMediaOfVisibilityInColumn.bind(this));
          this.functions.notifyMediaOfVisibilityInColumn.bind(this)();
        }

        // image zoom
        this.$container.on('click' + this.namespace, selectors.productImages, this.functions.openGallery.bind(this));
      }

      // mobile image slideshow
      this.mediaSlideshowActive = false;
      $(window).on('debouncedresize' + this.namespace, this.functions.assessMediaSlideshow.bind(this));
      this.functions.assessMediaSlideshow.bind(this)();

      // media
      theme.ProductMedia.init(this.$container, {
        onPlyrInit: function (playerObj) {
          var $slideshow = $(playerObj.element).closest('.slick-initialized');
          if ($slideshow.length) {
            theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
          }
        },
        onYoutubeInit: function (playerObj) {
          var $slideshow = $(playerObj.element).closest('.slick-initialized');
          if ($slideshow.length) {
            theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
          }
        },
        onModelViewerInit: function (playerObj) {
          var $slideshow = $(playerObj.element).closest('.slick-initialized');
          if ($slideshow.length) {
            theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
          }
        } });

      this.$container.find('.product-media').trigger('mediaVisibleInitial');

      theme.initVariantSelectors($(selectors.singleOptionSelector, container), options.product);

      if (this.variants.product.variants.length > 1) {
        // emit an event to broadcast the variant update
        $(window).trigger('cc-variant-updated', {
          variant: this.variants.currentVariant,
          product: this.productSingleObject });

      }

      // size chart
      this.$container.on('click', '.js-size-chart-open', function (e) {
        e.preventDefault();
        $('body').addClass('size-chart-is-open');
      });

      this.$container.on('click', '.js-size-chart-close', function () {
        $('body').removeClass('size-chart-is-open');
      });

      // ajax product form
      theme.initAjaxAddToCartForm($('form.ajax-product-form', this.$container));

      // section may contain RTE images
      theme.assessRTEImagesOnLoad(this.$container);
    };

    this.functions = {
      /**
       * Updates the SKU
       */
      updateSKU: function (evt) {
        var variant = evt.variant;

        if (variant && variant.sku) {
          $(selectors.skuWrapper, this.$container).removeClass('sku-wrapper--empty');
          $(selectors.sku, this.$container).html(variant.sku);

          if (document.getElementById('productDetailsSku')) {
            document.getElementById('productDetailsSku').innerText = 'SKU:' + variant.sku;
          }


        } else {
          $(selectors.skuWrapper, this.$container).addClass('sku-wrapper--empty');
          $(selectors.sku, this.$container).empty();

          if (document.getElementById('productDetailsSku')) {
            document.getElementById('productDetailsSku').innerText = '';
          }
        }
      },

      /**
       * Notify media when it goes off screen
       */
      notifyMediaOfVisibilityInColumn: function () {
        var viewportTop = $(window).scrollTop(),
        viewportBottom = viewportTop + $(window).height();
        $('.product-media', this.$container).each(function () {
          var mediaTop = $(this).offset().top,
          mediaBottom = mediaTop + $(this).outerHeight();
          if (mediaTop > viewportTop && mediaTop < viewportBottom || mediaBottom > viewportTop && mediaBottom < viewportBottom) {
            if (!$(this).hasClass('product-media--on-screen')) {
              $(this).addClass('product-media--on-screen');
              // load model viewer ui when on screen, or all of them in a carousel
              if ($(this).is('.product-media--model:not(.product-media--model-loaded)')) {
                $(this).trigger('mediaVisibleInitial');
              }
            }
          } else {
            if ($(this).hasClass('product-media--on-screen')) {
              $(this).removeClass('product-media--on-screen').trigger('mediaHidden');
            }
          }
        });
      },

      /**
       * Go to select image in main image slideshow
       */
      _updatePrimaryProductMediaFromThumbnail: function ($mediaWithId) {
        if (this.$productMediaContainer.hasClass('slick-slider')) {
          var index = this.$productMedia.filter('[data-media-id="' + $mediaWithId.data('media-id') + '"]').closest('.slick-slide').data('slick-index');
          this.$productMediaContainer.slick('slickGoTo', index);
        }
      },

      /**
       * Change main image when thumbnail is clicked
       */
      updatePrimaryProductMediaFromThumbnailClick: function (evt) {
        evt.preventDefault();
        this.functions._updatePrimaryProductMediaFromThumbnail.bind(this)($(evt.currentTarget));
      },

      /**
       * Change slideshow to variant media
       */
      updateProductMediaSlideshowFromVariantChange: function (evt) {
        var variant = evt.variant;
        var $found = this.$productMedia.filter(function () {
          return $(this).data('media-id') == variant.featured_media.id;
        });
        if ($found.length == 1) {
          this.functions._updatePrimaryProductMediaFromThumbnail.bind(this)($found);
        }
      },

      /**
       * Scroll the page to the specified image when in column, go to item in carousel
       */
      updateProductMediaColumn: function (evt) {
        var variant = evt.variant;
        var $found = this.$productMedia.filter(function () {
          return $(this).data('media-id') == variant.featured_media.id;
        });

        if ($found.length == 1) {

          if (this.$productMediaContainer.hasClass('slick-slider')) {
            this.functions._updatePrimaryProductMediaFromThumbnail.bind(this)($found);
          } else {
            // requires a delay (for some reason)
            clearTimeout(this.variantScrollTimeoutId);
            this.variantScrollTimeoutId = setTimeout(function () {
              var desiredScrollTop = $found.offset().top - theme.dockedNavHeight();
              var $cont = $found.closest('.product-detail');
              var maxScrollTop = $cont.offset().top + $cont.height() - $cont.find('.product-detail__detail').outerHeight() - 20;
              $('html,body').animate({
                scrollTop: Math.min(desiredScrollTop, maxScrollTop) },
              500, function () {
                $found.removeClass('variant-dim');
                this.$productImages.not($found).addClass('variant-dim variant-dim--fixed');
                setTimeout(function () {
                  $('.variant-dim--fixed').removeClass('variant-dim--fixed');
                }, 500);
              }.bind(this));
            }.bind(this), 25);
          }
        }
      },

      /**
       * Create/destroy slideshow depending on screen width
       */
      assessMediaSlideshow: function (evt) {
        var windowWidth = $(window).width();
        var count = false;
        if (this.$productMediaContainer.children().length > 1) {
          count = true;
        }
        var wantSlideshow = windowWidth < 768 || $('.product-detail__thumbnails').length;
        if (wantSlideshow) {
          if (!this.mediaSlideshowActive) {
            var initialSlide = 0;
            var fmid = this.$productMediaContainer.data('featured-media-id');
            this.$productMediaContainer.data('featured-media-id', null);
            initialSlide = this.$productMediaContainer.find('[data-media-id="' + fmid + '"]').parent().index();
            var $slideshow = this.$productMediaContainer.slick({
             infinite: true,
              fade: true,
              arrows: true,
              dots: true,
              adaptiveHeight: true,
              prevArrow: theme.icons.slideshowPrevArrow,
              nextArrow: theme.icons.slideshowNextArrow,
              appendArrows: $('.slick-external-controls .slick-arrows', this.$container),
              appendDots: $('.slick-external-controls .slick-dots', this.$container),
              initialSlide: initialSlide,
              waitForAnimate: false,
              asNavFor: $('.product-detail__thumbnail').length > 4 ? '.product-detail__thumbnails' : '',
              responsive: [
              {
                breakpoint: 768,
                settings: {
                  fade: false,
                  arrows: true,
                  dots: count } }
              ]  
            });
            
            if($('.product-detail__thumbnail').length > 4){
              $('.product-detail__thumbnails').addClass('has_slider');
              $('.product-detail__thumbnails').slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                asNavFor: '.product-detail__images',
                dots: false,
                centerMode: false,
                focusOnSelect: true,
                swipeToSlide: true                
              });
            }
             updateSlideInfo();
              $($slideshow).on('beforeChange', function(event, slick, currentSlide, nextSlide){
              updateSlideInfo(nextSlide);
              });


              function updateSlideInfo(currentSlideIndex = 0) {

                const totalSlides = $($slideshow).slick('getSlick').slideCount;

                $('.slide_count').html(`${currentSlideIndex + 1}/${totalSlides}`);
                if (window.innerWidth < 768) {
                  $('.slide_count').remove();
                }
              }

            $slideshow.find('.product-media').trigger('mediaVisibleInitial');
            $slideshow.on('afterChange', function (evt, slick, current) {
              // notify media of visibility
              var $currentMedia = $('.product-media', slick.$slides[current]);
              $('.product-media').not($currentMedia).trigger('mediaHidden');
              $currentMedia.trigger('mediaVisible');

              // active class
              var $currentSlideLink = $('[data-product-image]', slick.$slides[current]);
              $('.product-detail__thumbnail[data-media-id="' + $currentSlideLink.data('media-id') + '"]').
              addClass('thumb-active').
              siblings().
              removeClass('thumb-active');

              // fix tabbing
              theme.productGallerySlideshowTabFix(slick.$slides, current);
              // resize quickbuy
              $(this).closest('.quickbuy-container').trigger('changedsize');
            });
            theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
            this.mediaSlideshowActive = true;
          }
        } else {
          if (this.mediaSlideshowActive) {
            this.$productMediaContainer.slick('unslick');
            this.mediaSlideshowActive = false;
          }
        }
      },

      /**
       * Show gallery of all product images
       */
      openGallery: function (evt) {
        evt.preventDefault();

        var pswpElement = document.querySelectorAll('.pswp')[0];

        var items = [];
        this.$productImages.each(function (index) {
          $(this).data('image-index', index);
          var item = {
            src: $(this).attr('href'),
            w: $(this).data('image-w'),
            h: $(this).data('image-h') };

          var img = $(this).find('img')[0];
          if (typeof img.currentSrc !== 'undefined') {
            item.msrc = img.currentSrc;
          }
          items.push(item);
        });

        var options = {
          history: false,
          captionEl: false,
          shareEl: false,
          fullscreenEl: false };


        // use event target to determine which image to launch first
        options.index = $(evt.target).closest('a').data('image-index');
        options.getThumbBoundsFn = function (index) {
          var thumbnail = this.$productImages[index].getElementsByTagName('img')[0],
          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
          rect = thumbnail.getBoundingClientRect();
          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
        }.bind(this);

        // Initializes and opens PhotoSwipe
        this.imageGallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        this.imageGallery.init();
        this.imageGallery.listen('destroy', function () {
          this.imageGallery = null;
        }.bind(this));
        var _this = this;
        this.imageGallery.listen('afterChange', function () {
          var currentSrc = this.currItem.src;
          var $currentThumb = _this.$productImages.filter(function () {
            return $(this).attr('href') == currentSrc;
          });
          _this.functions._updatePrimaryProductMediaFromThumbnail.bind(_this)($currentThumb);
        });
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(document).off(this.namespace);
      $(window).off(this.namespace);
      if (this.imageGallery) {
        this.imageGallery.close();
      }
      if (this.storeAvailability) {
        this.storeAvailability.onSectionUnload();
      }
      theme.ProductMedia.destroy(this.$container);
      this.$container.find('.slick-initialized').slick('unslick').off('afterChange');
      theme.unloadAjaxAddToCartForm($('form.ajax-product-form', this.$container));
    };
  }();
  ;
  /**
   * Blog Template Script
   * ------------------------------------------------------------------------------
   * For both the blog page and homepage section
   *
     * @namespace blog
   */

  theme.Blog = new function () {

    var selectors = {
      header: '.featured-blog__header, .blog-featured-image',
      headerImage: '.featured-blog__header-image, .blog-image',
      slideshow: '.js-content-products-slider .grid' };


    var breakpoint = 768;
    var resizeTimer;

    /**
     * Blog section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // header spacing/image
      this.$header = $(selectors.header, this.$container);
      this.$headerImage = $(selectors.headerImage, this.$container);

      // peek carousel
      $('.js-content-products-slider .grid', this.$container).each(function (index, value) {
        theme.peekCarousel.init(
        this.$container,
        $(value),
        this.namespace,
        function () {return true;},
        false,
        {
          infinite: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: true,
          dots: false,
          prevArrow: $(value).closest('.content-products').find('.content-products-controls .prev'),
          nextArrow: $(value).closest('.content-products').find('.content-products-controls .next'),
          responsive: [
          {
            breakpoint: $('.single-column-layout', this.$container).length ? 768 : 960,
            settings: {
              slidesToShow: 1 } }] });





      }.bind(this));

      //Section
      this.functions.assessSection.bind(this)();
      $(window).on('debouncedresize' + this.namespace, this.functions.assessSection.bind(this));
    };

    this.functions = {
      /**
       * Set the height of the left-column, taking sticky nav into account
       */
      assessSection: function (evt) {
        var windowWidth = $(window).width();
        if (windowWidth < 768) {
          this.$headerImage.css('height', '');
        } else {
          var headerPadding = parseInt(this.$header.css('padding-top'));
          this.$headerImage.css('height', $(window).height() - headerPadding * 2 - theme.dockedNavHeight());
        }
      } };


    this.onSectionUnload = function (container) {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $('.js-content-products-slider .grid', this.$container), this.namespace);
    };
  }();
  ;
  /**
   * Article Template Script
   * ------------------------------------------------------------------------------
   * For both the article page
   *
     * @namespace article
   */

  theme.Article = new function () {
    var selectors = {
      slideshow: '.js-content-products-slider .grid' };


    /**
     * Article section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);
      var rteWidth = $('.template-article .rte').width();

      // product slideshow
      $(selectors.slideshow, this.$container).each(function (index, value) {
        theme.peekCarousel.init(
        this.$container,
        $(value),
        this.namespace,
        function () {return true;},
        false,
        {
          infinite: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          swipeToSlide: true,
          dots: false,
          prevArrow: $(value).closest('.content-products').find('.content-products-controls .prev'),
          nextArrow: $(value).closest('.content-products').find('.content-products-controls .next'),
          responsive: [
          {
            breakpoint: $('.single-column-layout', this.$container).length ? 768 : 960,
            settings: {
              slidesToShow: 1 } }] });





      }.bind(this));

      // section may contain RTE images
      theme.assessRTEImagesOnLoad(this.$container);
    };

    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $(selectors.slideshow, this.$container), this.namespace);
    };
  }();
  ;
  /**
   * Slideshow Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace Slideshow
   */

  theme.Slideshow = new function () {
    /**
     * Slideshow section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);
      this.$slideshow = $('.js-slideshow-section', this.$container);

      /**
       * Slick slideshow
       */
      var count = false;
      if (this.$slideshow.children().length > 1) {
        var count = true;
      }
      this.$slideshow.slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: count,
        adaptiveHeight: false,
        autoplay: this.$slideshow.data('autoplay'),
        fade: this.$slideshow.data('transition') !== 'slide',
        autoplaySpeed: this.$slideshow.data('autoplayspeed'),
        prevArrow: $('.full-width-slideshow-controls .prev', this.$container),
        nextArrow: $('.full-width-slideshow-controls .next', this.$container) }).
      on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        $(slick.$slides.get(currentSlide)).addClass('slick--leaving');

      }).on('afterChange', function (event, slick, currentSlide) {
        const $lastSlide = $(slick.$slides).filter('.slick--leaving');
        setTimeout(function () {$lastSlide.removeClass('slick--leaving');}, 100);
      });

      $(window).on('debouncedresize' + this.namespace, this.functions.onResize.bind(this));

      // section hides overlappers until initialised
      if (theme.checkOverlaps) {
        theme.checkOverlaps();
      }
    };

    this.functions = {
      /**
       * Event callback for window resize
       */
      onResize: function (evt) {
        // fix slick bug where height does not adapt to content height on resize
        this.$slideshow.slick('setPosition');
      } };


    /**
     * Event callback for Theme Editor `shopify:block:select` event
     */
    this.onBlockSelect = function (block) {
      this.$slideshow.
      slick('slickGoTo', $(block).data('slick-index'), true).
      slick('slickPause');
    };

    /**
     * Event callback for Theme Editor `shopify:block:deselect` event
     */
    this.onBlockDeselect = function (block) {
      this.$slideshow.slick('slickPlay');
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$slideshow.slick('unslick');
    };
  }();
  ;
  /**
   * Banner Script
   * ------------------------------------------------------------------------------
   *
   * @namespace banner
   */

  theme.Banner = new function () {
    this.onSectionLoad = theme.Slideshow.onSectionLoad;
    this.onSectionUnload = theme.Slideshow.onSectionUnload;
    this.onBlockSelect = theme.Slideshow.onBlockSelect;
    this.onBlockDeselect = theme.Slideshow.onBlockDeselect;
    this.functions = theme.Slideshow.functions;
  }();
  ;
  /**
   * Standout collection Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace StandoutCollection
   */

  theme.StandoutCollection = new function () {
    /**
     * StandoutCollection section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      /**
       * Slick StandoutCollection
       */
      theme.peekCarousel.init(
      this.$container,
      $('.js-standout-collection-slider', this.$container),
      this.namespace,
      function () {return true;},
      false,
      {
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        prevArrow: $('.standout-collection-slider__controls .prev', this.$container),
        nextArrow: $('.standout-collection-slider__controls .next', this.$container) });


    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $('.js-standout-collection-slider', this.$container), this.namespace);
    };
  }();
  ;
  /**
   * Get The Look Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace get-the-look
   */

  theme.GetTheLook = new function () {
    var selectors = {
      header: '.get-the-look__image-container',
      headerImage: '.get-the-look__image-container .placeholder-svg, .get-the-look__image-container .rimage-background',
      slideshow: '.js-get-the-look-slider',
      product: '.get-the-look__product:first' };


    var breakpoint = 768;
    var resizeTimer;

    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // header spacing/image
      this.$header = $(selectors.header, this.$container);
      this.$headerImage = $(selectors.headerImage, this.$container);

      // slideshow
      this.$slideshow = $(selectors.slideshow, this.$container);

      // first product
      this.$firstProduct = $(selectors.product, this.$container);

      // peek carousel
      theme.peekCarousel.init(this.$container, this.$slideshow, this.namespace, function () {
        return this.$firstProduct.length && parseInt(this.$firstProduct.css('margin-right')) == 0;
      }.bind(this));

      // section
      this.functions.assessSection.bind(this)();
      $(window).on('debouncedresize' + this.namespace, this.functions.assessSection.bind(this));
    };

    this.functions = {
      /**
       * Set the height of the left-column, taking sticky nav into account
       */
      assessSection: function (evt) {
        if (this.$firstProduct.length && parseInt(this.$firstProduct.css('margin-right')) == 0) {
          this.$headerImage.css('height', '');
        } else {
          var headerPadding = parseInt(this.$header.css('margin-top'));
          this.$headerImage.css('height', $(window).height() - headerPadding * 2 - theme.dockedNavHeight());
        }
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      theme.peekCarousel.destroy(this.$container, this.$slideshow, this.namespace);
    };
  }();

  /**
   * Promotional Images Script
   * ------------------------------------------------------------------------------
   *
   * @namespace promotional-images
   */

  theme.PromotionalImages = new function () {

    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // section
      $(this.functions.assessSection.call(this));
      $(window).on('debouncedresize' + this.namespace, this.functions.assessSection.bind(this));
    };

    this.functions = {
      assessSection: function (evt) {
        if ($(window).width() >= 768) {
          // check all the rows
          $('.promotional-row').each(function () {
            var tallest = 0;
            $(this).find('.text_over_image .promotional-row__content').each(function () {
              var thisHeight = $(this).outerHeight() + 60;
              if (thisHeight > tallest) {
                tallest = thisHeight;
              }
            });
            $(this).find('.text_over_image').css('min-height', tallest);
          });
        } else {
          $('.promotional-row .text_over_image').css('min-height', '');
        }
      } };


    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
    };

  }();
  ;
  /**
   * Featured Collection Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace featured-collection */

  theme.FeaturedCollection = new function () {

    var selectors = {
      slideshow: '[data-carousel-enabled]' };


    var breakpoint = 768;
    var resizeTimer;

    /**
     * FeaturedCollection section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);
      this.$slideshow = $(selectors.slideshow, this.$container);
      //Slideshow

      this.$slideshow.each(function (index, value) {
        theme.peekCarousel.init(this.$container, $(value), this.namespace, function () {
          return true;
        }, false, {
          infinite: false,
          slidesToShow: this.$slideshow.data('slides-per-row'),
          slidesToScroll: 1,
          swipeToSlide: true,
          dots: false,
          prevArrow: $('.featured-collection-controls .prev', this.$container),
          nextArrow: $('.featured-collection-controls .next', this.$container),
          responsive: [
          {
            breakpoint: breakpoint,
            settings: {
              slidesToShow: 1,
              nextArrow: false,
              prevArrow: false } }] });






      }.bind(this));
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      theme.peekCarousel.destroy(this.$container, this.$slideshow, this.namespace);
    };
  }();
  ;
  /**
   * List Collections Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the List Collections template.
   *
     * @namespace ListCollections
   */

  theme.ListCollections = new function () {
    /**
     * ListCollections section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // section may contain RTE images
      theme.assessRTEImagesOnLoad(this.$container);

      /**
       * Slick ListCollections
       */
      $('.js-list-collection-slider', this.$container).each(function (index, value) {
        theme.peekCarousel.init(
        this.$container,
        $(value),
        this.namespace,
        function () {
          return true;
        },
        false,
        {
          infinite: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          prevArrow: $(value).siblings('.standout-collection-slider__controls').children('.prev'),
          nextArrow: $(value).siblings('.standout-collection-slider__controls').children('.next'),
          responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1 } }] });





      }.bind(this));
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      theme.peekCarousel.destroy(this.$container, $('.js-list-collection-slider', this.$container), this.namespace);
    };
  }();
  ;
  /**
   * Cart Template Script
   * ------------------------------------------------------------------------------
   *
     * @namespace cart
   */

  theme.Cart = new function () {
    /**
     * Cart section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // toggle shipping estimates
      this.$container.on('click' + this.namespace, '.js-shipping-calculator-trigger', function () {
        var $this = $(this);
        var $parent = $this.parents('.shipping-calculator-container');
        $parent.toggleClass('calculator-open');
        if ($parent.hasClass('calculator-open')) {
          $this.html(theme.strings.cart_shipping_calculator_hide_calculator);
          $parent.children('.shipping-calculator').slideDown(250);
        } else {
          $this.html(theme.strings.cart_shipping_calculator_title);
          $parent.children('.shipping-calculator').slideUp(250);
        }
      });

      // toggle notes
      this.$container.on('click' + this.namespace, '.js-cart-notes-trigger', function () {
        var $this = $(this);
        var $parent = $this.parent('.cart-notes-container');
        $parent.toggleClass('notes-open');
        if ($parent.hasClass('notes-open')) {
          $this.html(theme.strings.cart_general_hide_note);
          $parent.children('.cart-notes').slideDown(250);
        } else {
          $this.html(theme.strings.cart_general_show_note);
          $parent.children('.cart-notes').slideUp(250);
        }
      });
      theme.cartNoteMonitor.load($('.cart-notes [name="note"]', this.$container));

      // quantity adjustment
      if (this.$container.data('ajax-update')) {
        var updateCartFunction = theme.debounce(this.functions.updateCart.bind(this), 500);
        this.$container.on('keyup' + this.namespace + ' change' + this.namespace, '.quantity__change input', function (event) {
          if ($(this).data('initial-value') && $(this).data('initial-value') == $(this).val()) {
            return;
          }
          if ($(this).val().length == 0 || $(this).val() == '0') {
            return;
          }
          var inputId = $(this).attr('id');
          updateCartFunction({
            line: $(this).data('line'),
            quantity: $(this).val() },
          function () {
            // set focus inside input that changed
            $('#' + inputId).focus();
            
            // oncart change event
            window.onCartChange && window.onCartChange(event);
          });
          
          $(this).data('previousValue', $(this).val());

           
        });

        this.$container.on('click' + this.namespace, '.quantity__minus, .quantity__plus', function (e) {
          var $input = $(this).closest('.quantity__change').find('.quantity__number');
          if ($(this).hasClass('quantity__minus')) {
            $input.val(parseInt($input.val()) - 1).trigger('change');
          } else {
            $input.val(parseInt($input.val()) + 1).trigger('change');
          }
          return false;
        });
      }

      // select contents on focus
      this.$container.on('focusin' + this.namespace + ' click' + this.namespace, 'input.quantity__number', function () {
        $(this).select();
      }).on('mouseup' + this.namespace, 'input.quantity__number', function (e) {
        e.preventDefault(); //Prevent mouseup killing select()
      });

      // terms and conditions checkbox
      if ($('#terms', container).length > 0) {
        $(document).on('click' + this.namespace, '[name="checkout"], a[href*="/checkout"]', function () {
          if ($('#terms:checked').length == 0) {
            alert(theme.strings.cartTermsNotChecked);
            return false;
          }
        });
      }

      // recently viewed
      this.$recentlyViewed = $('.recently-viewed', this.$container);
      if (this.$recentlyViewed.length) {
        this.functions.loadRecentlyViewed.bind(this)();
        theme.loadRecentlyViewed(this.$recentlyViewed);
      }
    };

    this.functions = {
      /**
      * Display recently viewed products, minus products in the cart
      */
      loadRecentlyViewed: function (evt) {
        if (theme.storageAvailable('localStorage')) {
          // grab current value and parse
          var recentDisplayCount = 6;
          var existingArr = theme.getRecentProducts();

          if (existingArr.length) {
            // remove in-cart items from row
            var handlesToExcludeValue = this.$recentlyViewed.data('exclude');
            var handlesToExclude = [];
            if (handlesToExcludeValue.length) {
              handlesToExclude = handlesToExcludeValue.split(',');
            }

            // show the products
            var $recentlyViewedBucket = this.$recentlyViewed.find('.grid'),
            count = 0,
            iterator = 0,
            showVendor = this.$recentlyViewed.data('show-vendor'),
            showHoverImage = this.$recentlyViewed.data('show-hover-image');

            while (count < recentDisplayCount && iterator < existingArr.length) {
              var showThis = true;
              // skip those in the excluded-list
              for (var i = 0; i < handlesToExclude.length; i++) {
                if (existingArr[iterator].handle == handlesToExclude[i]) {
                  showThis = false;
                  break;
                }
              }
              if (showThis) {
                count++;
                theme.addRecentProduct(existingArr, iterator, $recentlyViewedBucket, showHoverImage, showVendor);
              }
              iterator++;
            }

            // reveal container, if anything to show
            if (count > 0) {
              this.$recentlyViewed.removeClass('hidden');
            }
          }
        }
      },

      refreshCartAreas: function (successCallback) {
        const cartSectionId = this.$container.data('section-id');
        this.cartRefreshXhr = $.ajax({
          type: 'GET',
          url: theme.routes.cart_url + `?sections=header,${cartSectionId}`,
          success: function (data) {
            const toReplace = {};
            toReplace['header'] = ['.page-header .header-cart', '.docked-navigation-container .header-cart'];
            toReplace[cartSectionId] = ['[data-section-type="cart"] .cart-items', '[data-section-type="cart"] .subtotal-row'];
            Object.keys(toReplace).forEach((section) => {
              let $newDom = $(data[section]);
              $newDom.find('.fade-in').removeClass('fade-in');

              for (let i = 0; i < toReplace[section].length; i++) {
                $(toReplace[section][i]).html(
                $newDom.find(toReplace[section][i]).html());

              }
            });

            successCallback();
          },
          error: function (data) {
            if (data.statusText != 'abort') {
              console.log('Error refreshing page');
            }
          },
          complete: () => {
            this.cartRefreshXhr = null;
          } });

      },

      /**
      * Function for changing the cart and updating the page
      */
      updateCart: function (params, successCallback) {
        var _ = this;
        if (_.cartXhr) {
          _.cartXhr.abort();
        }
        if (_.cartRefreshXhr) {
          _.cartRefreshXhr.abort();
        }

        _.cartXhr = $.ajax({
          type: 'POST',
          url: theme.routes.cart_change_url + '.js',
          data: params,
          dataType: 'json',
          success: function (data) {
            if (_.cartRefreshXhr) {
              _.cartRefreshXhr.abort();
            }
            _.functions.refreshCartAreas.call(_, successCallback);
          },
          error: (data) => {
            console.log('Error processing update');
            if (data.responseJSON) {
              if (data.responseJSON.description) {
                theme.showQuickPopup(data.responseJSON.description, $(document.activeElement));
              } else if (data.responseJSON.message) {
                theme.showQuickPopup(data.responseJSON.message, $(document.activeElement));
              }
            }
            setTimeout(() => {
              this.functions.refreshCartAreas.call(this, successCallback);
            }, 1000);
          } });

      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(document).off(this.namespace);
      if (this.$recentlyViewed.length) {
        theme.unloadRecentlyViewed(this.$recentlyViewed);
      }
      theme.cartNoteMonitor.unload($('.cart-notes [name="note"]', this.$container));
    };
  }();
  ;
  theme.ImageWithText = new function () {
    /**
     * ImageWithText section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.$imageContainer = $('.image-with-text__image', container);
      this.$image = $('.image-with-text__image .rimage__image', container);
      this.$text = $('.image-with-text__content', container);
    };
    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      $(window).off(this.namespace);
    };
  }();
  ;
  /**
   * FeaturedProduct Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace FeaturedProduct
   */

  theme.FeaturedProduct = new function () {
    /**
     * FeaturedProduct section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */

    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.$row = $('.featured-product-section', container);
      this.$imageOuterContainer = $('.featured-product-image', container);
      this.$mediaContainer = $('.featured-product-image-link, .product-media-wrapper', container);
      this.$media = $('.product-media', container);

      if (this.$media.length) {
        theme.ProductMedia.init(this.$container);
      }
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      if (this.$media.length) {
        theme.ProductMedia.destroy(this.$container);
      }
      $(window).off(this.namespace);
    };
  }();
  ;
  /**
   * RecentlyViewed Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the RecentlyViewed template.
   *
     * @namespace recently-viewed
   */

  theme.RecentlyViewed = new function () {

    var selectors = {
      recentlyViewed: '.recently-viewed' };


    /**
     * RecentlyViewed section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      this.$recentlyViewed = $(selectors.recentlyViewed, this.$container);
      if (this.$recentlyViewed.length) {
        this.functions.loadRecentlyViewed.bind(this)();
        theme.loadRecentlyViewed(this.$recentlyViewed);
      }
    };

    this.functions = {
      /**
       * Display recently viewed products, and add this page to it
       */
      loadRecentlyViewed: function (evt) {
        // feature usability detect
        if (theme.storageAvailable('localStorage')) {
          var recentDisplayCount = 6;

          var recentProductData = {
            handle: this.$recentlyViewed.data('handle'),
            url: this.$recentlyViewed.data('url').split('?')[0],
            title: this.$recentlyViewed.data('title'),
            vendor: this.$recentlyViewed.data('vendor'),
            available: this.$recentlyViewed.data('available'),
            image: this.$recentlyViewed.data('image'),
            image2: this.$recentlyViewed.data('image2') };

          var existingArr = theme.addToAndReturnRecentProducts(recentProductData);

          // check each recent product, excluding one just added
          if (existingArr.length > 1) {
            var $recentlyViewedBucket = this.$recentlyViewed.removeClass('hidden').find('.grid');
            var showVendor = this.$recentlyViewed.data('show-vendor');
            var showHoverImage = this.$recentlyViewed.data('show-hover-image'),
            rangeStart = Math.max(0, existingArr.length - recentDisplayCount - 1),
            rangeEnd = existingArr.length - 1;
            for (var i = rangeStart; i < rangeEnd; i++) {
              theme.addRecentProduct(existingArr, i, $recentlyViewedBucket, showHoverImage, showVendor);
            }
          }
        }
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      if (this.$recentlyViewed.length) {
        theme.unloadRecentlyViewed(this.$recentlyViewed);
      }
    };
  }();
  ;
  /**
   * Search Template Script
   * ------------------------------------------------------------------------------
   * For search results page
   *
   * @namespace search-template
   */

  theme.SearchTemplate = new function () {

    var selectors = {
      productsContainer: '.cc-filters-results' };


    /**
     * Search section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // product title height alignment
      this.$productsContainer = $(selectors.productsContainer, container);
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
    };
  }();

  /**
   * Testimonials Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace Testimonials
   */

  theme.Testimonials = new function () {
    /**
     * Testimonials section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);
      this.$slideshow = $('.js-testimonials-section', this.$container);

      /**
       * Testimonials slick slideshow
       */
      var breakpoint = 768;
      var count = false;
      if (this.$slideshow.children().length > 2) {
        var count = true;
      }
      if (this.$slideshow.children().length > 1) {
        var mobileCount = true;
      }
      this.$slideshow.slick({
        infinite: true,
        slidesToShow: 2,
        slidesToScroll: 1,
        dots: count,
        adaptiveHeight: false,
        autoplay: this.$slideshow.data('autoplay'),
        autoplaySpeed: this.$slideshow.data('autoplayspeed'),
        arrows: false,
        responsive: [
        {
          breakpoint: breakpoint,
          settings: {
            slidesToShow: 1,
            dots: mobileCount } }] });





      $(window).on('debouncedresize' + this.namespace, this.functions.onResize.bind(this));
    };

    this.functions = {
      /**
       * Event callback for window resize
       */
      onResize: function (evt) {
        // fix slick bug where height does not adapt to content height on resize
        this.$slideshow.slick('setPosition');
      } };


    /**
     * Event callback for Theme Editor `shopify:block:select` event
     */
    this.onBlockSelect = function (block) {
      this.$slideshow.
      slick('slickGoTo', $(block).data('slick-index'), true).
      slick('slickPause');
    };

    /**
     * Event callback for Theme Editor `shopify:block:deselect` event
     */
    this.onBlockDeselect = function (block) {
      this.$slideshow.slick('slickPlay');
    };

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      this.$slideshow.slick('unslick');
    };
  }();
  ;
  /**
   * Gallery Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace gallery */

  theme.Gallery = new function () {

    var selectors = {
      slideshow: '.gallery--mobile-carousel' };


    var breakpoint = 768;

    /**
     * Gallery section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */
    this.onSectionLoad = function (container) {
      this.$container = $(container);
      this.namespace = theme.namespaceFromSection(container);

      // Slideshow
      if ($(selectors.slideshow, this.$container).length) {
        let assessCarouselFunction = function () {
          let $slideshow = $(selectors.slideshow, this.$container),
          isCarousel = $slideshow.hasClass('slick-slider'),
          shouldShowCarousel = $(window).width() < breakpoint;

          if (!shouldShowCarousel) {
            $('.lazyload--manual', $slideshow).removeClass('lazyload--manual').addClass('lazyload');
          }

          if (isCarousel && !shouldShowCarousel) {
            // Destroy carousel

            // - unload slick
            $slideshow.slick('unslick').off('init');
            $slideshow.find('a, .gallery__item').removeAttr('tabindex').removeAttr('role');

            // - re-row items
            var rowLimit = $slideshow.data('grid');
            var $currentRow = null;
            $slideshow.find('.gallery__item').each(function (index) {
              if (index % rowLimit === 0) {
                $currentRow = $('<div class="gallery__row">').appendTo($slideshow);
              }
              $(this).appendTo($currentRow);
            });
          } else if (!isCarousel && shouldShowCarousel) {
            // Create carousel

            // - de-row items
            $slideshow.find('.gallery__item').appendTo($slideshow);
            $slideshow.find('.gallery__row').remove();

            // - init carousel
            $slideshow.on('init', function () {
              $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');
            }).slick({
              autoplay: false,
              fade: false,
              infinite: true,
              useTransform: true,
              dots: true,
              prevArrow: $('.gallery-slideshow-controls .prev', this.$container),
              nextArrow: $('.gallery-slideshow-controls .next', this.$container) });

          }
        };

        assessCarouselFunction.call(this);
        $(window).on('debouncedresize' + this.namespace, assessCarouselFunction.bind(this));
      }
    };

    /**
    * Event callback for Theme Editor `section:unload` event
    */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      $('.slick-slider', this.$container).each(function () {
        $(this).slick('unslick').off('init');
      });
    };

    this.onBlockSelect = function (block) {
      $(block).closest('.slick-slider').each(function () {
        $(this).slick('slickGoTo', $(this).data('slick-index')).slick('slickPause');
      });
    };

    this.onBlockDeselect = function (block) {
      $(block).closest('.slick-slider').each(function () {
        $(this).slick('slickPlay');
      });
    };
  }();
  ;
  theme.ScrollingBannerSection = new function () {
    this.onSectionLoad = function (target) {
      document.fonts.ready.then(() => target.querySelector('.marquee').classList.add('marquee--animate'));
    };
  }();



  /*================ Templates ================*/
  /**
   * Customer Addresses Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the Customer Addresses
   * template.
   *
   * @namespace customerAddresses
   */

  theme._initCustomerAddressCountryDropdown = function () {
    // Initialize each edit form's country/province selector
    new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
      hideElement: 'AddressProvinceContainerNew' });


    if ($('#AddressCountryNew-modal').length) {
      new Shopify.CountryProvinceSelector('AddressCountryNew-modal', 'AddressProvinceNew-modal', {
        hideElement: 'AddressProvinceContainerNew-modal' });

    }

    $('.address-country-option').each(function () {
      var formId = $(this).data('form-id');
      var countrySelector = 'AddressCountry_' + formId;
      var provinceSelector = 'AddressProvince_' + formId;
      var containerSelector = 'AddressProvinceContainer_' + formId;

      new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector });

    });
  };

  theme._setupCustomAddressModal = function () {
    var suffix = '-modal';
    $('.lightbox-content form, .lightbox-content input[id], .lightbox-content select[id], .lightbox-content div[id]').each(function () {
      $(this).attr('id', $(this).attr('id') + suffix);
    });
    $('.lightbox-content label[for]').each(function () {
      $(this).attr('for', $(this).attr('for') + suffix);
    });
    $('.lightbox-content .address-country-option').each(function () {
      var formId = $(this).data('form-id') + suffix;
      $(this).attr('data-form-id', formId).data('form-id', formId);
    });
    theme._initCustomerAddressCountryDropdown();
  };

  theme.customerAddresses = function () {
    var $newAddressForm = $('#AddressNewForm');

    if (!$newAddressForm.length) {
      return;
    }

    // Initialize observers on address selectors, defined in shopify_common.js
    if (Shopify) {
      theme._initCustomerAddressCountryDropdown();
    }

    // Toggle new/edit address forms
    $('.address-new-toggle').on('click', function () {
      $.colorbox({
        transition: 'fade',
        html: '<div class="lightbox-content">' + $newAddressForm.html() + '</div>',
        onComplete: theme._setupCustomAddressModal });

      return false;
    });

    $('.address-edit-toggle').on('click', function () {
      var formId = $(this).data('form-id');
      $.colorbox({
        transition: 'fade',
        html: '<div class="lightbox-content">' + $('#EditAddress_' + formId).html() + '</div>',
        onComplete: theme._setupCustomAddressModal });

      return false;
    });

    $('.address-delete').on('click', function () {
      var $el = $(this);
      var formId = $el.data('form-id');
      var confirmMessage = $el.data('confirm-message');
      if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
        Shopify.postLink(theme.routes.account_addresses_url + '/' + formId, { parameters: { _method: 'delete' } });
      }
    });

    // show lightbox if error inside
    if ($('#AddressNewForm .errors').length) {
      $('.address-new-toggle').click();
    }
    if ($('.grid .address-card .errors').length) {
      $('.grid .address-card .errors').first().closest('.address-card').find('.address-edit-toggle').click();
    }
  }();
  ;
  /**
   * Password Template Script
   * ------------------------------------------------------------------------------
   * A file that contains scripts highly couple code to the Password template.
   *
   * @namespace password
   */

  theme.customerLogin = function () {
    var selectors = {
      recoverPasswordForm: '#RecoverPassword',
      hideRecoverPasswordLink: '#HideRecoverPasswordLink' };


    $(document).on('click', selectors.recoverPasswordForm, onShowHidePasswordForm);
    $(document).on('click', selectors.hideRecoverPasswordLink, onShowHidePasswordForm);


    function onShowHidePasswordForm(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm($(this).closest('.container'));
    }

    /**
     *  Show/Hide recover password form
     */
    function toggleRecoverPasswordForm(container) {
      $('[id=RecoverPasswordForm]', container).toggleClass('hide');
      $('[id=CustomerLoginForm]', container).toggleClass('hide');
    }

    // if on login page, check for past form submission
    if ($(selectors.recoverPasswordForm).length) {
      checkUrlHash();
      resetPasswordSuccess();

      function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
          toggleRecoverPasswordForm(null);
        }
      }

      /**
       *  Show reset password success message
       */
      function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
          return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
      }
    }
  }();
  ;


  theme.icons = {
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    slideshowPrevArrow: '<button class="slick-prev" aria-label="' + theme.strings.previous + '"><svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg></button>',
    slideshowNextArrow: '<button class="slick-next" aria-label="' + theme.strings.next + '"><svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>' };


  theme.initVariantSelectors = function ($els, data, inLightbox) {
    var $btns = $els.filter(function () {
      return $(this).data('selector-type') == 'listed';
    });

    $btns.each(function () {
      // change swatch label on hover
      var $label = $(this).find('.js-option-title');
      if ($label.length) {
        $label.data('default-content', $label.html());
        $(this).on('change', function () {
          $label.data('default-content', $(this).find('.opt-btn:checked').val());
        }).on('mouseenter', '.opt-label', function () {
          $label.html($(this).prev().val());
        }).on('mouseleave', '.opt-label', function () {
          $label.html($label.data('default-content'));
        });
      }
    });

    // If we have buttons, add the disabled-state to options that have no valid variants
    if ($btns.length > 0) {
      // each option
      for (var optionIndex = 0; optionIndex < data.options.length; optionIndex++) {
        // list each value for this option
        var optionValues = {};
        for (var variantIndex = 0; variantIndex < data.variants.length; variantIndex++) {
          var variant = data.variants[variantIndex];
          if (typeof optionValues[variant.options[optionIndex]] === 'undefined') {
            optionValues[variant.options[optionIndex]] = false;
          }
          // mark true if an option is available
          if (variant.available) {
            optionValues[variant.options[optionIndex]] = true;
          }
        }
        // mark any completely unavailable options
        for (var key in optionValues) {
          if (!optionValues[key]) {
            $($els[optionIndex]).find('.opt-btn').filter(function () {
              return $(this).val() == key;
            }).addClass('is-unavailable');
          }
        }
      }
    }

    if (inLightbox) {
      $.colorbox.resize();
    }
  };

  theme.namespaceFromSection = function (container) {
    return ['.', $(container).data('section-type'), $(container).data('section-id')].join('');
  };

  // global helpers for the docked nav
  theme.dockedNavDesktopMinWidth = 768;
  theme.dockedNavHeight = function () {
    if ($(window).width() >= theme.dockedNavDesktopMinWidth) {
      if ($('.docked-navigation-container').length) {
        return $('.docked-navigation-container__inner').height();
      }
    } else {
      if ($('.docked-mobile-navigation-container').length) {
        return $('.docked-mobile-navigation-container__inner').height();
      }
    }
    return 0;
  };

  // Calculate accent colour height
  theme.resizeAccent = function () {
    var accentHeight = 0;
    var $firstSection = $('.accent-background').next();

    if ($firstSection.length) {
      var $marginTop = parseInt($firstSection.css('margin-top'));

      if ($firstSection[0].id === 'shopify-section-banner') {
        // If banner element is empty
        if (!$firstSection.children().length && !$firstSection.text().trim().length) {
          $firstSection = $firstSection.next();
        }
      }

      if ($firstSection.hasClass('no-accent-if-full-width') && $firstSection.find('.container').length === 0) {
        accentHeight = '';
      } else if ($firstSection.find('.sticky-element').length) {
        accentHeight = Math.round($firstSection.find('.sticky-element').outerHeight() / 2 + $marginTop);
      } else {
        accentHeight = Math.round($firstSection.outerHeight() / 2 + $marginTop);
      }
      $('.accent-background').css('height', accentHeight);
    } else {
      accentHeight = '';
    }
    $('.accent-background').css('height', accentHeight);
  };

  // peeking carousels UI
  theme.peekCarousel = {
    init: function ($container, $slideshows, globalNamespace, useCarouselCheckFn, removeClasses, slickConfig) {
      theme.peekCarousel._checkAdvice($container);

      var data = {
        $slideshows: $slideshows,
        useCarouselCheckFn: useCarouselCheckFn,
        removeClasses: removeClasses,
        slickConfig: typeof slickConfig == 'object' ? slickConfig : {
          infinite: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          swipeToSlide: true,
          dots: false,
          arrows: false } };



      theme.peekCarousel._assess.bind(data)();
      $(window).on('debouncedresize' + globalNamespace, theme.peekCarousel._assess.bind(data));

      $('.product-carousel-peek__advice', $container).on('click', function () {
        $(this).closest('.product-carousel-peek').find('.slick-initialized').slick('slickNext').trigger('dismissAdvice');
      });
    },

    destroy: function ($container, $slideshows, globalNamespace) {
      if ($slideshows.hasClass('slick-initialized')) {
        $slideshows.slick('unslick').off('swipe dismissAdvice afterChange init');
      }
      $(window).off('debouncedresize' + globalNamespace, theme.peekCarousel._assess);
      $('.product-carousel-peek__advice', $container).off('click');
    },

    _assess: function () {
      for (var i = 0; i < this.$slideshows.length; i++) {
        var $slideshow = $(this.$slideshows[i]);

        if (this.useCarouselCheckFn()) {
          if (!$slideshow.hasClass('slick-initialized')) {
            // stow away the original classes
            if (this.removeClasses) {
              $slideshow.children().each(function () {
                $(this).data('peekOriginalClassName', this.className);
                this.className = '';
              });
            }

            // note when singular or empty
            if ($slideshow.children().length == 0) {
              $slideshow.closest('.product-carousel-peek').addClass('product-carousel-peek--empty');
            }
            if ($slideshow.children().length == 1) {
              $slideshow.closest('.product-carousel-peek').addClass('product-carousel-peek--single');
            }

            // fetch lazy-loaded products
            $slideshow.on('afterChange init', theme.peekCarousel._lazyLoadProduct);

            // turn into slideshow
            $slideshow.slick(this.slickConfig).on('swipe dismissAdvice', theme.peekCarousel._dismissAdviceOnSlickSwipe);
          }
        } else {
          if ($slideshow.hasClass('slick-initialized')) {
            // destroy slideshow
            $slideshow.slick('unslick').off('swipe dismissAdvice afterChange');

            // restore original class names
            if (this.removeClasses) {
              $slideshow.children().each(function () {
                this.className = $(this).data('peekOriginalClassName');
              });
            }
          };
        }
      }
    },

    _checkAdvice: function (container) {
      if ($.cookie('theme.boost.dismissPeekAdvice') != '1') {
        $('.product-carousel-peek', container).addClass('product-carousel-peek--show-advice');
      }
    },

    _dismissAdvice: function () {
      $.cookie('theme.boost.dismissPeekAdvice', '1', { expires: 7, path: '/', domain: window.location.hostname });
      $('.product-carousel-peek').addClass('product-carousel-peek--dismiss-advice');
    },

    _dismissAdviceOnSlickSwipe: function (evt, slick) {
      theme.peekCarousel._dismissAdvice();
      $(this).off('swipe');
    },

    _lazyLoadProduct: function (evt, slick) {
      var data = this;
      slick.$slides.filter('[data-lazy-product-url]').filter(function () {
        return $(this).hasClass('slick-active') || $(this).prev().hasClass('slick-active');
      }).each(function () {
        var $this = $(this);
        $.get($(this).data('lazy-product-url') + '?sections=product-block', function (response) {
          $this.html($(response['product-block']).children().html());
        });
        $this.removeAttr('data-lazy-product-url');
      });
    } };


  // makes a lot of assumptions about tabindex use
  // 1. we want to prevent the actual slide being a tab target, so there are other controls to use
  // 2. anything could be in a slide
  // 3. plyr does not use tabindex for anything
  // 4. model-viewer has 'tabindex="-1"' in its default paused state, applied by the model viewer ui
  theme.productGallerySlideshowTabFix = function (slides, current) {
    $(slides[current]).attr('tabindex', '-1').find('[tabindex]').each(function () {
      $(this).attr('tabindex', '0');
      $(this).filter('model-viewer').attr('tabindex', '-1'); // assume model is not playing now
    });
    $(slides).not(slides[current]).attr('tabindex', '-1').
    find('a, input, select, textarea, button, iframe, video, model-viewer, [tabindex]').each(function () {
      $(this).attr('tabindex', '-1');
    });
  };

  $(function () {
    // Common a11y fixes
    slate.a11y.pageLinkFocus($(window.location.hash));

    $('.in-page-link').on('click', function (evt) {
      slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
    });

    // Enable focus style when using tab
    $(document).on('keyup.themeTabCheck', function (evt) {
      if (evt.keyCode === 9) {
        $('body').addClass('tab-used');
        $(document).off('keyup.themeTabCheck');
      }
    });

    // Target tables to make them scrollable
    var tableSelectors = '.rte table';

    slate.rte.wrapTable({
      $tables: $(tableSelectors),
      tableWrapperClass: 'rte__table-wrapper' });


    // Target iframes to make them responsive
    var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"]';

    slate.rte.wrapIframe({
      $iframes: $(iframeSelectors),
      iframeWrapperClass: 'rte__video-wrapper' });


    // Apply a specific class to the html element for browser support of cookies.
    if (slate.cart.cookiesEnabled()) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

    // Input state: empty
    $(document).on('change focusout inputstateEmpty', '.input-wrapper input, .input-wrapper textarea', function () {
      $(this).closest('.input-wrapper').toggleClass('is-empty', $(this).val().length == 0);
    });

    // Input state: focus
    $(document).on('focusin focusout', '.input-wrapper input, .input-wrapper textarea', function (evt) {
      $(this).closest('.input-wrapper').toggleClass('in-focus', evt.type == 'focusin');
    });

    // Input state: check on section load
    $(document).on('shopify:section:load', function () {
      $('.input-wrapper input, .input-wrapper textarea').trigger('inputstateEmpty');
    });

    // Input state: html5 autofocus - focussed before dom ready
    $('.input-wrapper input:focus, .input-wrapper textarea:focus').closest('.input-wrapper').addClass('in-focus');

    // Input state: check empty now
    $('.input-wrapper input, .input-wrapper textarea').trigger('inputstateEmpty');

    $('.input-wrapper input, .input-wrapper textarea').on('animationstart', function (e) {
      if (e.originalEvent.animationName == 'onAutoFillStart') {
        $(this).closest('.input-wrapper').removeClass('is-empty');
      } else if (e.originalEvent.animationName == 'onAutoFillCancel') {
        $(this).trigger('inputstateEmpty');
      }
    });

    // focus on some inputs on page load, on desktop
    if ($(window).width() > 1024) {
      $('input[data-desktop-autofocus]').focus();
    }

    // Tabs
    $(document).on('click assess', '.tabs a', function (evt) {
      // active class
      $(this).addClass('tab--active').closest('ul').find('.tab--active').not(this).removeClass('tab--active');
      // hide inactive content
      $(this).closest('li').siblings().find('a').each(function () {
        $($(this).attr('href')).removeClass('tab-content--active');
      });
      // show active content
      $($(this).attr('href')).addClass('tab-content--active');
      evt.preventDefault();
    });

    function tabFunc() {
      $('.tabs:not(:has(.tab--active)) a:first').trigger('assess');
    };

    tabFunc();
    $(document).on('shopify:section:load', tabFunc);

    /// Quickbuy with colorbox and slick
    var activeQuickBuyRequest = null;
    var breakpoint = 768;

    $(document).on('click', '.js-contains-quickbuy .js-quickbuy-button', function (e) {
      if ($(window).width() > breakpoint) {

        if (activeQuickBuyRequest) {
          return false;
        }

        var $qbButton = $(this);
        var $prod = $(this).closest('.js-contains-quickbuy');
        var placeholder = $prod.find('.quickbuy-placeholder-template').html();
        var $template = $('<div class="quickbuy">' + placeholder + '</div>');

        // observer for dynamic payment buttons
        var buttonObserved = false;
        var buttonObserver = new MutationObserver(function (mutations) {
          $.colorbox.resize();
        });

        $.colorbox({
          closeButton: false,
          preloading: false,
          open: true,
          speed: 200,
          slideshow: true,
          //transition: "none",
          html: [$template.wrap('<div>').parent().html()].join(''),
          onComplete: function () {
            var $slideshow = $('.quickbuy__product-media').slick({
              infinite: false,
              slidesToScroll: 1,
              speed: 300,
              slidesToShow: 1,
              swipeToSlide: true,
              variableWidth: true,
              waitForAnimate: false,
              prevArrow: $('.quickbuy__slider-controls .prev'),
              nextArrow: $('.quickbuy__slider-controls .next') });


            theme.ProductMedia.init($('.quickbuy__media-container'), {
              onPlyrInit: function (playerObj) {
                theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
              },
              onYoutubeInit: function (playerObj) {
                theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
              },
              onModelViewerInit: function (playerObj) {
                theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);
              },
              onVideoVisible: function (e) {
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', false);
              },
              onVideoHidden: function (e) {
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', true);
              },
              onPlyrPlay: function (e) {
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', false);
              },
              onPlyrPause: function (e) {
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', true);
              },
              onModelViewerPlay: function (e) {
                // prevent swiping and left/right key control
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', false).
                slick('slickSetOption', 'accessibility', false).
                closest('.quickbuy__media-container').addClass('media-playing');
              },
              onModelViewerPause: function (e) {
                $(e.target).closest('.slick-slider').slick('slickSetOption', 'swipe', true).
                slick('slickSetOption', 'accessibility', true).
                closest('.quickbuy__media-container').removeClass('media-playing');
              } });


            $slideshow.find('.product-media').trigger('mediaVisibleInitial');
            $slideshow.on('afterChange', function (evt, slick, current) {
              // notify media of visibility
              $('.product-media--activated').removeClass('product-media--activated').trigger('mediaHidden');
              var $currentMedia = $('.product-media', slick.$slides[current]).addClass('product-media--activated').trigger('mediaVisible');
              // fix tabbing
              theme.productGallerySlideshowTabFix(slick.$slides, current);
              // indicate media type on carousel
              $slideshow.closest('.quickbuy__media-container').toggleClass('quickbuy__media-container--current-image', $currentMedia.hasClass('product-media--image'));
              // resize quickbuy
              $(this).closest('.quickbuy-container').trigger('changedsize');
            });
            theme.productGallerySlideshowTabFix($slideshow.slick('getSlick').$slides, $slideshow.slick('getSlick').currentSlide);

            $.colorbox.resize();

            // initialise variants
            var $container = $('.quickbuy-form');
            var productData = JSON.parse($('[data-product-json]', $prod).html());
            var options = {
              $container: $container,
              enableHistoryState: false,
              singleOptionSelector: '[data-single-option-selector]',
              originalSelectorId: '[data-product-select]',
              secondaryIdSelectors: '[data-product-secondary-select]',
              product: productData, // for slate
              productSingleObject: productData // for our callbacks
            };
            var variants = new slate.Variants(options);
            $container.on('variantChange', theme.variants.updateAddToCartState.bind(options));
            $container.on('variantPriceChange', theme.variants.updateProductPrices.bind(options));
            if ($('.quickbuy__product-media .slick-slide', $container).length > 1) {
              $container.on('variantImageChange', function (evt) {
                var variant = evt.variant;
                var $found = $('.quickbuy__product-media .slick-slide:not(.slick-cloned)[data-media-id="' + variant.featured_media.id + '"]', $container);
                if ($found.length) {
                  $found.closest('.slick-slider').slick('slickGoTo', $found.data('slick-index'));
                }
              });
            }
            // custom quantity selector
            document.querySelector('.qty-actual .qty-minus')?.addEventListener('click', function(event) {
                event.preventDefault();
                let currentQty = event.target.closest('.qty-actual').querySelector('.qty-actual__input[name="quantity"]').value;
                if (currentQty > 1) {
                  event.target.closest('.qty-actual').querySelector('.qty-actual__input[name="quantity"]').value = currentQty - 1;
                }
            });
            document.querySelector('.qty-actual .qty-plus')?.addEventListener('click', function(event) {
                event.preventDefault();
                let currentQty = event.target.closest('.qty-actual').querySelector('.qty-actual__input[name="quantity"]').value;
                event.target.closest('.qty-actual').querySelector('.qty-actual__input[name="quantity"]').value = parseInt(parseInt(currentQty) + 1);
            });
            
            // resize lightbox after callbacks may have altered the page
            $container.on('variantChange', $.colorbox.resize);

            // initialise variant selectors
            theme.initVariantSelectors($('.quickbuy .option-selector'), options.product, true);

            // initialise custom select elements
            $(document).trigger('cc:component:load', ['custom-select', '.quickbuy']);

            // load extra payment buttons
            if (Shopify.PaymentButton) {
              $(document).on('shopify:payment_button:loaded.themeQuickBuy', function () {
                $(document).off('shopify:payment_button:loaded.themeQuickBuy');
                $.colorbox.resize();

                // attach a MutationObserver
                buttonObserved = $('.quickbuy-form .shopify-payment-button')[0];
                if (buttonObserved) {
                  buttonObserver.observe(buttonObserved, { attributes: true, childList: true, subtree: true });
                }
              });
              Shopify.PaymentButton.init();
            }

            // ajax product form
            theme.initAjaxAddToCartForm($('form.ajax-product-form', $container));

            // add to recent products
            var recentProductData = {
              handle: productData.handle,
              url: $qbButton.attr('href').split('?')[0],
              title: productData.title,
              vendor: productData.vendor,
              available: productData.available,
              image: productData.media && productData.media.length > 0 ? productData.media[0].preview_image.src : null,
              image2: productData.media && productData.media.length > 1 ? productData.media[1].preview_image.src : null,
              price: productData.price,
              priceVaries: productData.price_varies,
              compareAtPrice: productData.compare_at_price };

            var lowestPriceVariant = productData.variants[0];
            for (var i = 1; i < productData.variants.length; i++) {
              if (productData.variants[i].price < lowestPriceVariant.price) {
                lowestPriceVariant = productData.variants[i];
              }
            }
            if (lowestPriceVariant.unit_price_measurement) {
              recentProductData.unitPrice = lowestPriceVariant.unit_price;
              recentProductData.unitPriceUnit = theme.variants.getBaseUnit(lowestPriceVariant);
            }
            theme.addToAndReturnRecentProducts(recentProductData);
          },
          onCleanup: function () {
            buttonObserver.disconnect();
            theme.ProductMedia.destroy($('.quickbuy__media-container'));
            $('.quickbuy .slick-initialized').slick('unslick').off('afterChange');
            $('.quickbuy-form').off('variantChange variantPriceChange variantImageChange');
            // $('.quickbuy-form .clickybox-replaced').clickyBoxes('destroy');
            theme.initAjaxAddToCartForm($('.quickbuy form.ajax-product-form'));
          } });


        // e.stopImmediatePropagation();
        return false;
      }
    });

    $(document).on('click', '#colorbox .quickbuy__close .js-close-quickbuy', function () {
      $.colorbox.close();
      return false;
    });

    // general purpose 'close a lightbox' link
    $(document).on('click', '.js-close-lightbox', function () {
      $.colorbox.close();
      return false;
    });

    // quantity selector
    $(document).on('change', '.qty-wrapper > .cc-select', function () {
      var value = $(this).find('[aria-selected="true"]').data('value');
      var $input = $(this).siblings('.qty-actual').find('[name="quantity"]');
      if (value == '10+') {
        $input.val('10').closest('.qty-wrapper').addClass('hide-proxy');
        setTimeout(function () {
          $input.select().focus();
        }, 10);
      } else {
        $input.val(value);
      }
    });

    // newsletter success message shows in lightbox
    var $newsletterSuccess = $('.subscribe-form__response--success');
    if ($newsletterSuccess.length && !$('.cc-popup-form__response--success').length) {
      $.colorbox({
        transition: 'fade',
        html: '<div class="subscribe-form-lightbox-response">' + $newsletterSuccess.html() + '</div>',
        onOpen: function () {
          $('#colorbox').css('opacity', 0);
        },
        onComplete: function () {
          $('#colorbox').animate({ 'opacity': 1 }, 350);
        } });

    }

    // resize height of accent colour on homepage
    if ($('.accent-background').length) {
      // run now, and after fonts are loaded, then on resize
      $(function () {
        theme.resizeAccent();
      });
      $(window).on('debouncedresize', theme.resizeAccent);

      // run when the section at the top loads
      $(document).on('shopify:section:load', function (evt) {
        if ($(evt.target).prev().hasClass('accent-background')) {
          theme.resizeAccent();
        }
      });

      // a section may have moved to/away from the top
      $(document).on('shopify:section:reorder', theme.resizeAccent);
      // a section may change in a way that affects the accent size
      $(document).on('shopify:section:load', theme.resizeAccent);
    }

    // Watch for play/stop video events
    $(document).on('cc:video:play', function () {
      if ($(window).outerWidth() < 768) {
        $('body').addClass('video-modal-open');
      }
    }).on('cc:video:stop', function () {
      if ($(window).outerWidth() < 768) {
        $('body').removeClass('video-modal-open');
      }
    });
  }); // end of main $(function()

  theme.Sections.init();
  theme.Sections.register('header', theme.Header, { deferredLoad: false });
  theme.Sections.register('footer', theme.Footer);
  theme.Sections.register('product', theme.Product, { deferredLoad: false });
  theme.Sections.register('blog', theme.Blog);
  theme.Sections.register('article', theme.Article);
  theme.Sections.register('slideshow', theme.Slideshow);
  theme.Sections.register('banner', theme.Banner);
  theme.Sections.register('standout-collection', theme.StandoutCollection);
  theme.Sections.register('get-the-look', theme.GetTheLook);
  theme.Sections.register('promotional-images', theme.PromotionalImages);
  theme.Sections.register('featured-collection', theme.FeaturedCollection);
  theme.Sections.register('list-collections', theme.ListCollections, { deferredLoad: false });
  theme.Sections.register('cart', theme.Cart, { deferredLoad: false });
  theme.Sections.register('image-with-text', theme.ImageWithText);
  theme.Sections.register('featured-product', theme.FeaturedProduct);
  theme.Sections.register('recently-viewed', theme.RecentlyViewed);
  theme.Sections.register('testimonials', theme.Testimonials);
  theme.Sections.register('gallery', theme.Gallery);
  theme.Sections.register('video', theme.VideoManager);
  theme.Sections.register('background-video', theme.VideoManager);
  theme.Sections.register('scrolling-banner', theme.ScrollingBannerSection);
  theme.Sections.register('search-template', theme.SearchTemplate, { deferredLoad: false });


  //Register dynamically pulled in sections
  $(function ($) {
    if (cc.sections.length) {
      cc.sections.forEach((section) => {
        try {
          let data = {};
          if (typeof section.deferredLoad !== 'undefined') {
            data.deferredLoad = section.deferredLoad;
          }
          if (typeof section.deferredLoadViewportExcess !== 'undefined') {
            data.deferredLoadViewportExcess = section.deferredLoadViewportExcess;
          }
          theme.Sections.register(section.name, section.section, data);
        } catch (err) {
          console.error(`Unable to register section ${section.name}.`, err);
        }
      });
    } else {
      console.warn('Barry: No common sections have been registered.');
    }
  });

})(theme.jQuery);  
/* Built with Barry v1.0.8 */