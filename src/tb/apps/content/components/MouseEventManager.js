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
        'tb.core',
        'jquery',
        'content.container',
        'content.manager',
        'content.widget.Breadcrumb',
        'jsclass'
    ],
    function (Core,
              jQuery,
              ContentContainer,
              ContentManager,
              Breadcrumb
            ) {

        'use strict';

        var MouseEventManager = new JS.Class({

            contentClass: 'bb-content',
            contentHoverClass: 'bb-content-hover',
            identifierDataAttribute: 'bb-identifier',
            idDataAttribute: 'bb-id',
            breadCrumbSelector: 'div.bb5-content-breadcrumb div.bb5-ui-width-setter',

            /**
             * listen the DOM
             */
            listen: function () {
                this.bindEvents();
            },

            /**
             * Bind events for content
             */
            bindEvents: function () {
                var body = jQuery('body');

                body.on('click', '.' + this.contentClass, jQuery.proxy(this.onClick, this));
                body.on('mouseenter', '.' + this.contentClass, jQuery.proxy(this.onMouseEnter, this));
                body.on('mouseleave', '.' + this.contentClass, jQuery.proxy(this.onMouseLeave, this));
            },

            /**
             * Event trigged on click
             *
             * @param {Object} event
             * @returns {Boolean}
             */
            onClick: function (event) {
                var currentTarget = jQuery(event.currentTarget),
                    identifier = currentTarget.data(this.identifierDataAttribute),
                    content = ContentManager.buildElement(ContentManager.retrievalObjectIdentifier(identifier));

                if (ContentManager.isUsable(content.type)) {

                    ContentManager.unSelectContent();

                    Breadcrumb.show(content, this.breadCrumbSelector);

                    if (content.jQueryObject.length === 0) {
                        content.jQueryObject = currentTarget;
                        content.populate();
                    }

                    Core.Mediator.publish('on:classcontent:click', content, event);

                    ContentContainer.addContent(content);

                    content.select();

                    return false;
                }
            },

            /**
             * Event trigged on mouse enter in content zone
             * @param {Object} event
             * @returns {Boolean}
             */
            onMouseEnter: function (event) {
                event.stopImmediatePropagation();

                var identifier = jQuery(event.currentTarget).data(this.identifierDataAttribute),
                    data = ContentManager.retrievalObjectIdentifier(identifier);

                if (ContentManager.isUsable(data.type)) {

                    Core.Mediator.publish('on:classcontent:mouseenter', event);

                    jQuery('.' + this.contentHoverClass).removeClass(this.contentHoverClass);

                    jQuery(event.currentTarget).addClass(this.contentHoverClass);
                }
            },

            /**
             * Event trigged on mouse leave from content zone
             * @param {Object} event
             * @returns {Boolean}
             */
            onMouseLeave: function (event) {

                var identifier = jQuery(event.currentTarget).data(this.identifierDataAttribute),
                    data = ContentManager.retrievalObjectIdentifier(identifier),
                    currentTarget,
                    parentToSelect;

                if (ContentManager.isUsable(data.type)) {

                    Core.Mediator.publish('on:classcontent:mouseleave', event);

                    currentTarget = jQuery(event.currentTarget);
                    parentToSelect = currentTarget.parents('.' + this.contentClass + ':first');

                    currentTarget.removeClass(this.contentHoverClass);

                    if (parentToSelect.length > 0) {
                        jQuery(parentToSelect).trigger("mouseenter", {
                            userTrigger: true
                        });
                    }
                }
            }

            /***** EVENTS END *****/
        });

        return new JS.Singleton(MouseEventManager);
    }
);