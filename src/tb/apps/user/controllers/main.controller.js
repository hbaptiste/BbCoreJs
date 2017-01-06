/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBuilder5.
 *
 * BackBuilder5 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBuilder5 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBuilder5. If not, see <http://www.gnu.org/licenses/>.
 */

define(
    ['Core', 'user/views/popin.view', 'jquery'],
    function (Core, PopinView, jQuery) {
        'use strict';

        Core.ControllerManager.registerController('MainController', {

            appName: 'user',
            config: {},
            userPopin: null,
            handleResize: null,
            handleResizeStart: 0,
            userList: null,
            groupList: null,

            /**
             * Initialize of Page Controller
             */
            onInit: function () {
                this.app = Core.get('application.user');
            },

            /**
             * Index action
             * Show the index in the edit contribution toolbar
             */
            indexAction: function () {
                this.popinView = new PopinView();
                this.app.popin = this.popinView;

                this.userPopin = jQuery("#toolbar-user-group-popin");
                this.handleResize = this.userPopin.find(".resizable-handle");
                this.userList = this.userPopin.find("#user-list");
                this.groupList = this.userPopin.find("#group-list");
                this.resizeZonesService();
                this.handleResize.on('mousedown', this.resizeStart.bind(this));

                Core.ApplicationManager.invokeService('user.user.index', this.popinView);
                Core.ApplicationManager.invokeService('user.group.index', this.popinView);
            },

            /**
             * Resize user/group zones services
             */
            resizeZonesService: function (userHeight) {
                var userListMinHeight = 5 * this.userPopin.height() / 100,
                    userListHeight = (this.userList.find(">ul").height() > userListMinHeight) ? this.userList.find(">ul").height() : userListMinHeight,
                    userListMaxHeight = 48 * this.userPopin.height() / 100;

                userListHeight = (this.userList.find(">ul").height() > userListMaxHeight) ? userListMaxHeight : this.userList.find(">ul").height();

                this.userList.height(userHeight || userListHeight);
                this.groupList.height(this.userPopin.height() - this.handleResize.outerHeight() - this.userList.outerHeight());
            },

            resizeStart: function (e) {
                this.handleResizeStart = e;
                this.userPopin.on('mousemove', {'userListHeight': this.userList.height(), 'clientY': e.clientY}, this.resizeMove.bind(this));
                this.userPopin.one('mouseup', this.resizeStop.bind(this));
            },

            resizeStop: function () {
                this.userPopin.off('mousemove');
            },

            resizeMove: function (e) {
                var delta = e.clientY - e.data.clientY;

                this.resizeZonesService(e.data.userListHeight + delta);
            }
        });
    }
);
