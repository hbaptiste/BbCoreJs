define([
    'jquery',
    'page.repository',
    'Core',
    'Core/Renderer',
    'text!page/tpl/manage.list.twig',
    'page.view.tree.management',
    'component!popin',
    'component!rangeselector',
    'component!dataview',
    'page.view.manage.item',
    'component!pagination',
    'content.repository',
    'component!notify',
    'component!translator'
], function (jQuery, repository, Core, Renderer, template) {

    'use strict';

    /**
     * View of new page
     * @type {Object} Backbone.View
     */
    return Backbone.View.extend({

        /**
         * Initialize of PageViewReview
         */
        initialize: function (data) {
            this.popin = require('component!popin').createPopIn();
            this.pageStore = data.pageStore;

            this.pageStore.applySorter('byModified', 'desc');
            this.pageStore.applyFilter('byStatus', [0, 1, 2, 3]);

            this.initTree();
            this.initRange();
            this.initPagination();
            this.initDataview();

            this.pageStore.on("dataStateUpdate", function () {
                this.pagination.setItems(this.pageStore.getTotal());
            }.bind(this));
        },

        retrieveUid: function (el) {
            return jQuery(el).parents('li:first').attr('data-uid');
        },

        initDataview: function () {
            var Dataview = require('component!dataview');
            this.dataview = Dataview.createDataView({
                allowMultiSelection: true,
                selectedItemClass: "selected",
                css: {
                    width: "auto",
                    height: "auto"
                },
                dataStore: this.pageStore,
                itemRenderer: require('page.view.manage.item').render
            });

            this.dataview.registerRenderer({
                name: 'list',
                render: function (items) {
                    var wrapper = jQuery("<ul/>");
                    wrapper.addClass('bb5-list-data bb5-list-display-list clearfix');
                    return jQuery(wrapper).html(items);
                }
            });

            this.dataview.setRenderMode('list');
        },

        initTree: function () {
            var Tree = require('page.view.tree.management');
            this.tree = new Tree({
                popin: false,
                do_loading: true,
                do_pagination: true,
                site_uid: Core.get('site.uid'),
                only_section: true
            });
            this.tree.setPageStore(this.pageStore);
        },

        initRange: function () {
            var Range = require('component!rangeselector');

            this.range = Range.createPageRangeSelector({
                range: [10, 50, 10],
                selected: 10
            });

            this.range.on('pageRangeSelectorChange', function (val) {
                this.pageStore.setLimit(val);
                this.pagination.setItemsOnPage(val);
            }.bind(this));

            this.pageStore.setLimit(this.range.getValue());
        },

        initPagination: function () {
            var Pagination = require('component!pagination');

            this.pagination = Pagination.createPagination({
                itemsOnPage: this.range.getValue()
            });

            this.pagination.on("pageChange", function (page) {
                var limit = this.range.getValue(),
                    start = (page - 1) * limit;

                this.pageStore.setStart(start);

                this.pageStore.execute();
            }.bind(this));
        },

        initLayout: function (tpl) {
            this.layout = jQuery(tpl).find('#content-library-pane-wrapper').layout({
                applyDefaultStyles: true,
                closable: false,
                west__childOptions: {
                    center__paneSelector: '.inner-center',
                    south__paneSelector: '.ui-layout-south'
                },
                center__childOptions: {
                    center__paneSelector: '.inner-center',
                    north__paneSelector: '.ui-layout-north',
                    south__paneSelector: '.ui-layout-south'
                }
            });
            this.layout.resizeAll();
            this.layout.sizePane('west', 235);
        },

        deletePage: function (uid) {
            Core.ApplicationManager.invokeService('page.main.removeGrouped', {uids: [uid], popin: this.popin}, this.pageStore);
        },

        computeLayouts: function (layouts) {
            var key,
                layout,
                data = {};

            for (key in layouts) {
                if (layouts.hasOwnProperty(key)) {
                    layout = layouts[key];
                    data[layout.uid] = layout.label;
                }
            }

            return data;
        },

        onSubmit: function (data) {
            var self = this;

            if (typeof this.parent_uid === 'string') {
                data.parent_uid = this.parent_uid;
            }

            repository.save(data, function () {
                self.popin.hide();
            });
        },

        onValidate: function (form, data) {
            if (!data.hasOwnProperty('layout_uid') || data.layout_uid.trim().length === 0) {
                form.addError('layout_uid', 'Template is required.');
            }
        },

        bindSorterElements: function () {
            var elements = jQuery('a[data-sorter]');

            elements.on('click', function (event) {
                var elem = jQuery(event.target),
                    sorter = elem.data('sorter'),
                    direction = (elem.data('direction') === 'asc' ? 'desc' : 'asc');

                jQuery('a[data-direction="desc"]').data('direction', 'asc');

                elem.data('direction', direction);
                this.pageStore.applyNamedSorter(sorter, direction);
                this.pageStore.execute();
            }.bind(this));
        },

        bindTrash: function () {
            jQuery('#bb-page-management-trash-view').dblclick(function () {
                this.pageStore.applyFilter('byTrash', [4]);
                this.pageStore.execute();
            }.bind(this));
        },

        resizeCenterPane: function () {
            jQuery('#bb-windowpane-center').height(
                jQuery('#content-library-pane-wrapper').height() - (jQuery('#bb-windowpane-north').height() + jQuery('#bb-windowpane-south').height() + 20)
            );
        },

        bindGroupedActions: function () {
            var selectAll = jQuery('#bb-page-manage-select-all'),
                select = jQuery('#bb-page-manage-grouped-action');

            // Don't work correctly
            selectAll.change(function () {
                var elems = jQuery('.bb-page-manage-select-page');

                if (!selectAll.is(':checked')) {
                    elems.attr('checked', false);
                } else {
                    elems.attr('checked', true);
                }
            });

            select.change(function (event) {
                var service = jQuery(event.target).find(':checked').val(),
                    elems,
                    i,
                    uids = [];

                elems = jQuery('.bb-page-manage-select-page:checked');
                select.val(0);
                if (service === '0' || elems.length === 0) {
                    return;
                }
                if (elems.length === 0) {
                    require('component!notify').warning(require('component!translator').translate('no_page_selected'));
                    return;
                }

                for (i = 0; i < elems.length; i = i + 1) {
                    uids.push(elems.get(i).getAttribute('data-identifier'));
                }
                Core.ApplicationManager.invokeService('page.main.' + service, {uids: uids, popin: this.popin}, this.pageStore);
            }.bind(this));
        },

        /**
         * Render the template into the DOM with the Renderer
         * @returns {Object} PageViewReview
         */
        render: function () {
            var parent;

            this.content = Renderer.render(template);

            this.popin.setTitle('Review pages');
            this.popin.setContent(this.content);
            this.initLayout(this.content);

            this.popin.addOptions({
                id: 'page-popin-manage',
                top: 180,
                height: window.innerHeight - 192,
                width: document.body.clientWidth,
                closeOnEscape: false,
                draggable: false,
                open: function () {
                    parent = jQuery(this).parent('.ui-dialog:first');
                    parent.css({
                        top: 192
                    });
                    parent.find(".ui-dialog-titlebar-close").hide();
                }
            });

            jQuery(window).resize(function () {
                parent.css({
                    height: window.innerHeight - 192,
                    width: document.body.clientWidth
                });
                jQuery('#content-library-pane-wrapper').layout().resizeAll();
                this.resizeCenterPane();
            }.bind(this));

            this.popin.display();
            this.popin.mask();

            Core.Scope.subscribe('page', function () { return; }, function () {
                require('component!popin').hide(this.popin);
            }.bind(this));

            jQuery('#content-library-pane-wrapper').on('click', '.btn-delete', function () {
                this.deletePage(this.retrieveUid(event.target));
            }.bind(this));

            this.tree.renderIn('#bb-page-management-tree-view');
            this.range.render('#bb-page-management-range-view');


            this.pageStore.execute();

            this.pagination.on('afterRender', function () {
                jQuery('#content-library-pane-wrapper').layout().resizeAll();
                this.resizeCenterPane();
            }.bind(this));
            this.pagination.render('#bb-page-management-pagination-view', 'replaceWith');

            this.dataview.render('#bb-page-management-data-view');
            this.popin.unmask();

            this.bindSorterElements();
            this.bindGroupedActions();
            this.bindTrash();

            return this;
        }
    });
});
