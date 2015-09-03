/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBee is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBee is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBee. If not, see <http://www.gnu.org/licenses/>.
 */

define(
    [
        'Core',
        'page.view.contribution.index',
        'page.view.manage',
        'Core/Request',
        'Core/RequestHandler',
        'page.save.manager'
    ],
    function (
        Core,
        ContributionIndexView,
        ManageView,
        Request,
        RequestHandler,
        SaveManager
    ) {

        'use strict';

        Core.ControllerManager.registerController('MainController', {

            appName: 'page',

            config: {
                imports: ['page.repository'],
                define: {
                    treeService: ['page.view.tree.contribution'],
                    getPageTreeViewInstanceService: ['page.view.tree'],
                    updatePageInfoService: ['page.widget.InformationPage'],
                    clonePageService: ['page.view.clone'],
                    newPageService: ['page.view.new'],
                    editPageService: ['page.view.edit'],
                    validateService: ['component!translator', 'component!revisionpageselector', 'component!notify'],
                    cancelService: ['component!translator', 'component!revisionpageselector', 'component!notify'],
                    deletePageService: ['page.view.delete']
                }
            },

            /**
             * Initialize of Page Controller
             */
            onInit: function () {
                this.mainApp =  Core.get('application.main');
                this.repository = require('page.repository');
            },

            /**
             * Index action
             * Show the index in the edit contribution toolbar
             */
            contributionIndexAction: function () {

                var self = this;

                Core.ApplicationManager.invokeService('contribution.main.index').done(function (service) {
                    service.done(function () {

                        Core.Scope.register('contribution', 'page');

                        if (self.contribution_loaded !== true) {
                            self.repository.findCurrentPage().done(function (data) {
                                if (data.hasOwnProperty(0)) {
                                    data = data[0];
                                }
                                Core.set("current.page", data);
                                var view = new ContributionIndexView({'data': data});
                                view.render();

                                self.contribution_loaded = true;

                                Core.ApplicationManager.invokeService('contribution.main.manageTabMenu', '#edit-tab-page');
                            });
                        } else {
                            Core.ApplicationManager.invokeService('contribution.main.manageTabMenu', '#edit-tab-page');
                        }
                    });
                });
            },

            /**
             * Show tree with pages
             */
            treeService: function (req, config) {
                var PageTreeViewContribution = req('page.view.tree.contribution'),
                    view = new PageTreeViewContribution(config);
                view.render();
                return view;
            },

            getPageTreeViewInstanceService: function (req) {
                return req('page.view.tree');
            },

            getPageRepositoryService: function () {
                return this.repository;
            },

            getSaveManagerService: function () {
                return SaveManager;
            },

            /**
             * Delete action
             * Delete page with uid
             * @param {String} uid
             */
            deletePageService: function (req, config) {
                var DeleteView = req('page.view.delete');
                this.repository.find(config.uid).then(
                    function (page) {
                        config.page = page;
                        var view = new DeleteView(config);
                        view.render();
                    }
                );
            },

            findCurrentPageService: function () {
                return this.repository.findCurrentPage();
            },

            clonePageService: function (req, config) {
                config.callbackAfterSubmit = this.newPageRedirect;
                var CloneView = req('page.view.clone'),
                    view = new CloneView(config);
                view.render();
            },

            newPageService: function (req, config) {
                if ('redirect' === config.flag) {
                    config.callbackAfterSubmit = this.newPageRedirect;
                }
                var NewView = req('page.view.new'),
                    view = new NewView(config);
                view.render();
            },

            editPageService: function (req, config) {
                var EditView = req('page.view.edit'),
                    view = new EditView(config);
                view.render();
            },

            /**
             * Manage pages action
             */
            manageAction: function () {
                var view = new ManageView();
                Core.Scope.register('page', 'management');
                view.render();
            },

            newPageRedirect: function (data, response) {
                if (response.getHeader('Location')) {
                    var request = new Request();
                    request.setUrl(response.getHeader('Location'));
                    RequestHandler.send(request).then(
                        function (page) {
                            if (page.uri) {
                                document.location.href = page.uri;
                            }
                        }
                    );
                }
                return data;
            },

            validateService: function (req) {
                this.repository.findCurrentPage().done(function (page) {
                    var translator = req('component!translator'),
                        notify = req('component!notify'),
                        config = {
                            popinTitle: translator.translate('validation_confirmation'),
                            noContentMsg: translator.translate('no_page_modification_validate'),
                            title: translator.translate('confirm_saving_changes_page_below') + ' :',
                            currentPage: page,
                            onSave: function (data, popin) {
                                if (data.length > 0) {
                                    SaveManager.save(data, page.uid).done(function () {
                                        notify.success(translator.translate('page_modification_validated'));

                                        location.reload();

                                        popin.unmask();
                                        popin.hide();
                                    });
                                } else {
                                    notify.warning(translator.translate('no_page_modification_validate'));
                                    popin.unmask();
                                    popin.hide();
                                }
                            }
                        };

                    req('component!revisionpageselector').create(config).show();
                });
            },

            cancelService: function (req) {
                this.repository.findCurrentPage().done(function (page) {
                    var translator = req('component!translator'),
                        notify = req('component!notify'),
                        config = {
                            popinTitle: translator.translate('cancel_confirmation'),
                            noContentMsg: translator.translate('no_page_modification_cancel'),
                            title: translator.translate('cancel_changes_page_below') + ' :',
                            currentPage: page,
                            onSave: function (data, popin) {
                                if (data.length > 0) {
                                    notify.success(translator.translate('page_modification_canceled'));
                                    location.reload();
                                } else {
                                    notify.warning(translator.translate('no_page_modification_cancel'));
                                }

                                popin.unmask();
                                popin.hide();

                                SaveManager.clear();
                            }
                        };

                    req('component!revisionpageselector').create(config).show();
                });
            },

            updatePageInfoService: function (req) {
                var widget = req('page.widget.InformationPage');

                widget.updateContent();
            },

            getContentPopins: function () {
                return Core.get('application.page').getPopins();
            },

            registerPopinService: function (id, popin) {
                this.getContentPopins()[id] = popin;
            },

            removePopinService: function (id) {
                delete this.getContentPopins()[id];
            },

            getPopinService: function (id) {
                return this.getContentPopins()[id];
            }
        });
    }
);
