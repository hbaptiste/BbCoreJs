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
    [
        'jquery',
        'content.models.Content',
        'content.models.ContentSet',
        'definition.manager',
        'content.container.manager',
        'content.repository',
        'jsclass'
    ],
    function (jQuery,
              Content,
              ContentSet,
              DefinitionManager,
              ContentContainer,
              ContentRepository
            ) {

        'use strict';

        var ContentManager = new JS.Class({

            contentClass: 'bb-content',
            identifierDataAttribute: 'bb-identifier',
            idDataAttribute: 'bb-id',
            dropZoneAttribute: '*[dropzone="true"]',

            /**
             * Search all contentset with dragzone="true" attribute
             * and dont have data-bb-id attribute for build element
             */
            buildContentSet: function () {
                var self = this,
                    dropzone = jQuery(this.dropZoneAttribute).not('[data-' + this.idDataAttribute + ']');

                dropzone.each(function () {
                    var currentTarget = jQuery(this),
                        objectIdentifier = currentTarget.data(self.identifierDataAttribute);

                    if (currentTarget.hasClass(self.contentClass) && typeof objectIdentifier === 'string') {
                        ContentContainer.addContent(self.buildElement(self.retrievalObjectIdentifier(objectIdentifier)));
                    }
                });
            },

            /**
             * Create new element from the API
             * @param {String} type
             * @returns {Promise}
             */
            createElement: function (type) {
                var self = this,
                    dfd = jQuery.Deferred();

                ContentRepository.save({'type': type}).done(function (data, response) {
                    dfd.resolve(self.buildElement({'type': type, 'uid': response.getHeader('BB-RESOURCE-UID')}));

                    return data;
                });

                return dfd.promise();
            },

            /**
             * Build a content/contentSet element according to the definition
             * @param {Object} event
             * @returns {Object}
             */
            buildElement: function (config) {
                var content,
                    objectIdentifier = this.buildObjectIdentifier(config.type, config.uid),
                    element = jQuery('[data-' + this.identifierDataAttribute + '="' + objectIdentifier + '"]'),
                    id = element.data(this.idDataAttribute);

                if (id === undefined && objectIdentifier !== undefined) {

                    config.definition = DefinitionManager.find(config.type);
                    config.jQueryObject = element;

                    if (config.definition !== null) {
                        if (config.definition.properties.is_container) {
                            content = new ContentSet(config);
                        } else {
                            content = new Content(config);
                        }
                    }
                } else {
                    content = ContentContainer.find(element.data(this.idDataAttribute));
                }

                return content;
            },

            /**
             * Retrieve a object identifier for split uid and type
             */
            retrievalObjectIdentifier: function (objectIdentifier) {
                var regex,
                    object = {},
                    res;

                if (objectIdentifier) {
                    /*jslint regexp: true */
                    regex = /(.+)\(([a-f0-9]+)\)$/;
                    /*jslint regexp: false */

                    res = regex.exec(objectIdentifier);

                    if (null !== res) {
                        object.type = res[1];
                        object.uid = res[2];
                    }
                }

                return object;
            },

            /**
             * Build an object identifier
             * @param {String} type
             * @param {String} uid
             * @returns {null|String}
             */
            buildObjectIdentifier: function (type, uid) {
                var objectIdentifier = null;

                if (typeof type === 'string' && typeof uid === 'string') {
                    objectIdentifier = type + '(' + uid + ')';
                }

                return objectIdentifier;
            }
        });

        return new JS.Singleton(ContentManager);
    }
);