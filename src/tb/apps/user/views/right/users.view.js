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

define(['jquery'], function (jQuery) {

    "use strict";

    return Backbone.View.extend({

        initialize: function () {
            this.state = {};
           this.content = jQuery("<div>").eq(0);
           this.bindEvents();
        },

        bindEvents: function () {

            this.content.on("click", '.t', function(e) {
                alert(3);
            });
        },

        render: function () {
            this.content.html("<p class='t'>users</p>");
            return this.content;
        }
    });
});