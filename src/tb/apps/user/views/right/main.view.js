/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of Backbee.
 *
 * Backbee is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Backbee is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Backbee. If not, see <http://www.gnu.org/licenses/>.
 */

define(['Core', 'jquery', 'component!dataview', 'component!popin','Core/Utils'], function (Core, jQuery, DataViewMng, popinMng) {

    'use strict';
    return Backbone.View.extend({

        initialize: function (params) {
            /* available */
            this.availableComponents = {
                user: 'user',
                workflow: 'workflow',
                layout: 'layout',
                pages: 'pages',
                blocks: 'blocks',
                extensions: 'extensions',
                users: 'users',
                media: 'media'
            };

            this.instances = {};
            this.currentComponent = null;
            this.popin = this.createMainPopin();
            this.template = jQuery(params.template) || "";
            this.mainContainer = this.template.find("#mainContainer").eq(0);
            this.setContent(this.template);
            this.bindEvents();
        },

        bindEvents: function () {
            var self = this,
                component;
            this.template.on("click", ".right-btn", function (e) {
                /* clean previous selection */
                self.selectButton(e.target);
                var component = jQuery(e.target).data("component");
                self.setComponent(component);
            });
        },

        selectButton: function(button) {
            /* remove previous selection */
            if (jQuery(button).hasClass("btn-primary")) {
                return false;
            }
            jQuery(button).closest(".right-nav-list").find(".active").removeClass("active");
            jQuery(button).addClass("active");
        },

        createMainPopin: function () {

            return popinMng.createPopIn({
                width: window.innerWidth,
                top: 180,
                height: window.innerHeight - 150,
                closeOnEscape: false,
                draggable: false,
                id: "id-main-right-popin",
                title: "Right management",
                close: function () {

                },
            });
        },

        setContent: function (content) {
            var content = jQuery(content);
            this.popin.setContent(content);
        },

        setComponent: function (componentName) {

            var currentKey,
                self = this,
                componentPath = "user/views/right/",
                componentInstance,
                component;

            if (typeof componentName !== "string") {
                return;
            }
            currentKey = this.availableComponents[componentName] || null;
            if (currentKey === null) {
                throw "ComponentNotFoundException";
            }
            component = this.instances[componentName] || null;
            if (component === null) {
                componentPath += componentName + ".view";
                require("Core/Utils").requireWithPromise([componentPath]).done(function (ComponentView) {
                    if (typeof component !== "function") {
                        componentInstance = new ComponentView();
                        self.handleComponent(componentName, componentInstance);
                    }
                }).fail(function () {
                    console.log(arguments);
                });
            } else {
                this.handleComponent(componentName, component, false);
            }
        },

        handleComponent: function (componentName, component, keep) {
            keep = (typeof keep === "boolean") ? keep : true;
            this.currentComponent = component;
            if (keep) {
                this.instances[componentName] = component;
            }
            this.render();
        },

        render: function () {
            if (!this.currentComponent) {
                throw "ComponentNotFoundException";
            }

            if (typeof this.currentComponent.render !== 'function') {
                throw "RenderNotFoundException";
            }
            var render = this.currentComponent.render();
            this.mainContainer.html(render);
            this.popin.display();
        }

    });

},function (reason) {
    console.log(reason);
});