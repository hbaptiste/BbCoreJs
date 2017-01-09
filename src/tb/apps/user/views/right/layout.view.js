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

define([
        'jquery',
        'component!dataview',
        'Core/Renderer',
        'text!user/templates/right/layout-item-tpl.twig',
        'component!datastore'
    ], function (jQuery, DataViewMng, Renderer, layoutItemTpl, DataStore) {

    "use strict";

    return Backbone.View.extend({

        initialize: function () {
           this.content = jQuery("<div><div><span>All Actions</span>|<span>View</span></div><div class='datastore-ctn'>sdsd</div></div>").eq(0);
           this.dataContainer = this.content.find(".datastore-ctn").eq(0);
           this.createComponents();
           this.bindEvents();
        },

        createComponents: function () {
           /* create datastore */
           /* create dataview */
           var self = this;
           var fakeLayouts = [
                {
                    'uid': '5qsd746qsd',
                    'title': 'Layout 1',
                    'description': 'Layout description'
                },
                 {
                    'uid': '5qsd746wxcqsd',
                    'title': 'sw sdfsf',
                    'description': 'Layout description',
                    'rights': {
                        'all': 4,
                        'view': 1,
                        'edit': 0,
                        'create': 0,
                        'delete': 0
                    }
                },
                {
                    'uid': '5qs4d5qsd',
                    'title': 'Layout 2',
                    'description': 'Autre description'
                }

           ];

           this.fakeDataView = DataViewMng.createDataView({
                'id': 'radical-blaze',
                'itemKey': 'uid',
                'enableSelection': false,
                itemRenderer: function(mode, item) {
                    var itemRender = jQuery(Renderer.render(layoutItemTpl, item));
                    itemRender.bind('click', self.handleLayoutClick.bind(self, item));
                    return itemRender;
                }
           });

           this.fakeDataView.setData(fakeLayouts);
           this.fakeDataView.render(this.dataContainer);
        },

        handleLayoutClick: function (layoutItem, e) {
            var self = this;
            layoutItem.test = "my very Test";
            layoutItem.title = "sdsde";
            setTimeout(function() {
                console.log(self.fakeDataView.data);
            }, 3000);
        },

        bindEvents: function () {

            this.content.on("click", '.t', function(e) {
                alert(3);
            });
        },

        render: function () {
            return this.content;
        }
    });
});