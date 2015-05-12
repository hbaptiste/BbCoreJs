define(['Core', 'contribution.view.index', 'jquery'], function (Core, IndexView, jQuery) {

    'use strict';

    var trans = Core.get('trans') || function (value) {return value; };

    Core.ControllerManager.registerController('MainController', {
        appName: 'contribution',
        config: {
            imports: []
        },
        /**
         * Initialize of Contribution Controller
         */
        onInit: function () {
            this.mainApp = Core.get('application.main');
            this.mediaLibraryIsLoaded = false;
            this.mediaLibrary = false;
        },

        indexService: function () {
            var config = {},
                view;

            Core.ApplicationManager.invokeService('main.main.setTitlePane', trans('edit_page'));
            Core.Scope.register('contribution');

            if (this.viewIsLoaded !== true) {
                this.viewIsLoaded = true;
            } else {
                config.alreadyLoaded = true;
            }

            view = new IndexView(config);

            return view.render();
        },

        manageTabMenuService: function (element) {
            element = jQuery(element);

            jQuery('ul#edit-tab li.active').removeClass('active');
            element.addClass('active');

            jQuery('div#contrib-tab-apps div.tab-pane.active').removeClass('active');
            jQuery('div#' + element.children('a').data('type') + '-contrib-tab').addClass('active');
        },

        /**
         * Index action
         * Show the edition toolbar
         */
        indexAction: function () {
            this.indexService();
        },

        showMediaLibraryService: function (config) {
            var self = this,
                config = {} || config;
            if (!this.mediaLibraryIsLoaded) {
                require(['component!medialibrary'], function (MediaLibraryComponent) {
                    if (self.mediaLibraryIsLoaded) { return; }
                    config.mode = "view";
                    self.mediaLibrary = MediaLibraryComponent.createMediaLibrary(config);
                    self.mediaLibraryIsLoaded = true;
                    self.mediaLibrary.display();
                });
            } else {
                self.mediaLibrary.display();
            }
        }
    });
});