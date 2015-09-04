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
        'jquery',
        'page.repository',
        'component!treeview',
        'component!mask'
    ],

    function (Core, jQuery, PageRepository, Tree, Mask) {



        'use strict';

        /**
     * View of new page
     * @type {Object} Backbone.View
     */
        var PageViewTree = Backbone.View.extend({

            limit_of_page: 10,

            /**
         * Initialize of PageViewClone
         */
            initialize: function (config) {
                this.config = config;
                if (typeof this.config.site_uid !== 'string') {
                    Core.exception('MissingPropertyException', 500, 'Property "site_uid" must be set to constructor');
                }
                this.maskMng = Mask.createMask({});
                this.site_uid = this.config.site_uid;

                this.initializeTree();
            },

            /**
         * Initialize tree
         */
            initializeTree: function () {
                var config = {
                    dragAndDrop: true,
                    onCreateLi: this.onCreateLi,
                    id: this.config.popinId || 'bb-page-tree'
                };

                this.formatedData = [];

                if (this.config.popin === true) {
                    this.tree = Tree.createPopinTreeView(config);
                    this.treeView = this.tree.treeView;
                    Core.ApplicationManager.invokeService('content.main.registerPopin', 'treeView', this.tree);
                } else {
                    this.treeView = this.tree = Tree.createTreeView(config);
                }

                this.bindDefaultEvents();
            },

            /**
         * Event trigged when LI is created
         * @param {Object} node
         * @param {Object} li
         */
            onCreateLi: function (node, li) {

                var title = li.find('.jqtree-title');

                if (node.is_fake !== true) {
                    if (node.state === 0 || node.state === 2) {
                        title.html('<i class="bb5-ico-workflow offline"></i>' + title.html());
                    } else if (node.state === 3) {
                        title.html('<i class="bb5-ico-workflow masked"></i>' + title.html());
                    } else {
                        title.html('<i class="bb5-ico-workflow"></i>' + title.html());
                    }
                }
            },

            /**
         * Bind default events of tree
         */
            bindDefaultEvents: function () {
                this.treeView.on('tree.click', jQuery.proxy(this.onClick, this));
                this.treeView.on('tree.open', jQuery.proxy(this.onOpen, this));
            },

            /**
         * Event trigged on click in tree
         * @param {Object} event
         */
            onClick: function (event) {

                var self = this,
                    parent = event.node.parent;
                /* do nothing with ellipsis node */
                if (event.node.is_ellipsis) {
                    return;
                }

                if (event.node.is_fake === true && self.config.do_pagination === true) {
                    self.findPages(parent, parent.range_to + 1).done(function (data) {
                        self.treeView.invoke('removeNode', event.node);
                        self.insertDataInNode(data, parent);
                    });
                }
            },

            /**
         * Event trigged on click in arrow in tree
         * @param {Object} event
         */
            onOpen: function (event) {
                var self = this;
                if (event.node.is_fake === true) {
                    return;
                }

                if (event.node.before_load === true) {
                    self.findPages(event.node, 0).done(function (data) {
                        self.insertDataInNode(data, event.node);
                        if (self.treeView.isRoot(event.node)) {
                            self.trigger("rootIsLoaded");
                        }
                    });
                }
            },

            /**
         * Find pages with page repository and add limit in current node
         * @param {String} parent_uid
         * @param {Object} event
         * @param {Number} start
         * @param {Number} limit
         */
            findPages: function (node, start) {
                var dfd = jQuery.Deferred(),
                    self = this;

                PageRepository.findChildren(node.id, start, this.limit_of_page).done(function (data, response) {

                    self.updateLimit(node, response);

                    dfd.resolve(data);
                }).fail(function (e) {
                    dfd.reject(e);
                });

                return dfd.promise();
            },

            /**
         * Update limit of node for create pagination
         * @param {Object} event
         * @param {Object} response
         */
            updateLimit: function (node, response) {
                if (node !== undefined) {
                    node.range_total = response.getRangeTotal();
                    node.range_to = response.getRangeTo();
                    node.range_from = response.getRangeFrom();
                }
            },

            /**
         * Formate Page object to Node object
         * @param {Object} page
         * @returns {Object}
         */
            formatePageToNode: function (page) {
                page.children = [];

                page.id = page.uid;
                page.label = page.title;
                page.before_load = false;
                page.hasChildren = function () {
                    return this.children.length !== 0 || this.has_children === true;
                };

                if (page.has_children) {
                    if (this.config.do_loading === true) {
                        page.before_load = true;
                        page.children.push(this.buildNode('Loading...', {
                            'is_fake': true
                        }));
                    }
                }

                return page;
            },

            /**
         * Build a simple node
         * @param {String} label
         * @param {Object} properties
         * @returns {Object}
         */
            buildNode: function (label, properties) {
                var node = {};

                node.id = Math.random().toString(36).substr(2, 9);
                node.label = label;
                node.children = [];

                this.updateNode(node, properties);

                return node;
            },

            updateNode: function (node, properties) {
                var property;

                for (property in properties) {
                    if (properties.hasOwnProperty(property)) {
                        node[property] = properties[property];
                    }
                }
            },

            /**
         * Insert data in node, remove loader and add pagination if necessary
         * @param {Object} data
         * @param {Object} node
         */
            insertDataInNode: function (data, node) {
                var key, formattedNode, children = node.children;

                if (node.before_load) {
                    if (node.children.hasOwnProperty(0) && node.children[0].is_fake === true) {
                        this.treeView.invoke('removeNode', node.children[0]);
                    }
                    node.before_load = false;
                }

                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        formattedNode = this.formatePageToNode(data[key]);
                        this.removeEllipsisNode(formattedNode);
                        this.treeView.invoke('appendNode', formattedNode, node);
                    }
                }

                if (node.range_total > children.length && this.config.do_pagination === true) {
                    this.treeView.invoke('appendNode', this.buildNode('next results...', {
                        'is_fake': true
                    }), node);
                }
            },


            selectPage: function (pageUid) {
                var self = this;
                this.mask();

                PageRepository.findAncestors(pageUid).done(function (ancestorInfos) {

                    if (!Array.isArray(ancestorInfos) || ancestorInfos.length === 0) {
                        self.unmask();
                        return false;
                    }
                    var callbacks = [],
                        nodeCallBack,
                        parentNode,
                        index,
                        ancestor;

                    jQuery.each(ancestorInfos, function (i) {
                        ancestor = self.formatePageToNode(ancestorInfos[i]);
                        index = i - 1;
                        parentNode = (i === 0) ? null : ancestorInfos[index];
                        nodeCallBack = self.createNodeCallBack(ancestor, parentNode, i, callbacks, pageUid);
                        callbacks.push(nodeCallBack);
                    });

                    if (callbacks.length === 0) {
                        return false;
                    }

                    callbacks[0].call(this);
                });

            },

            createNodeCallBack: function (node, parentNode, nextId, callbacksList, pageUid) {
                var self = this,
                    nextCallback;

                return function () {
                    if ((callbacksList.length === 1) && (self.treeView.isRoot({id: node.uid}))) {
                        self.handleLastNode(pageUid, node);
                        self.unmask();
                        return;
                    }
                    self.findPages(node, 0).done(function (response) {
                        self.handleNewNode(node, parentNode, response);

                        nextCallback = callbacksList[nextId + 1];
                        if (typeof callbacksList[nextId + 1] === "function") {
                            nextCallback.call(this);
                        } else {
                            self.handleLastNode(pageUid, node);
                            self.unmask();
                        }
                    });
                };
            },

            handleLastNode: function (pageUid, node) {

                var currentNode = this.treeView.getNodeById(pageUid);
                if (currentNode) {
                    this.treeView.invoke('selectNode', currentNode);
                } else {
                    currentNode = this.formatePageToNode(Core.get("current.page"));
                    this.addEllipsisNode(currentNode, node);
                    this.treeView.invoke('selectNode', this.treeView.getNodeById(currentNode.id));
                }
            },

            handleNewNode: function (node, parentNode, nodeChildren) {
                /* case 1: The node is already in the tree: open it silently */
                node = this.treeView.getNodeById(node.uid);
                if (node) {
                    /* as root is loaded by default add nothing to root */
                    if (!parentNode) { return; }
                    this.insertDataInNode(nodeChildren, node);
                } else {
                    /* case 2: The node hasn't been loaded yet */
                    this.addEllipsisNode(node, parentNode);
                }
            },

            mask: function () {
                this.maskMng.mask(this.treeView.el);
            },

            unmask: function () {
                this.maskMng.unmask(this.treeView.el);
            },

            removeEllipsisNode: function (node) {
                var elpsNode = this.treeView.getNodeById("elps_" + node.uid),
                    linkedNode = this.treeView.getNodeById(node.uid);

                if (!elpsNode) {
                    return;
                }
                this.treeView.invoke("removeNode", elpsNode);
                if (!linkedNode) {
                    return;
                }
                this.treeView.invoke("removeNode", linkedNode);
            },

            addEllipsisNode: function (node, parentNode) {
                var ellipsis_before;

                if (parentNode) {
                    parentNode = this.treeView.getNodeById(parentNode.uid);
                }

                parentNode = parentNode || this.treeView.getRootNode();
                ellipsis_before = this.buildNode("...", {
                    is_fake: true,
                    is_ellipsis: true,
                    link_to: node.uid
                });
                ellipsis_before.id = "elps_" + node.uid;
                this.treeView.invoke("appendNode", ellipsis_before, parentNode);
                this.treeView.invoke("appendNode", node, parentNode);
            },

            getTree: function () {
                var self = this,
                    dfd = jQuery.Deferred(),
                    rootNode;

                PageRepository.findRoot().done(function (data) {
                    if (data.hasOwnProperty(0)) {

                        rootNode = data[0];
                        rootNode.id = rootNode.uid;

                        self.treeView.setData([self.formatePageToNode(rootNode)]);

                        dfd.resolve(self.tree);
                    }
                }).fail(function () {
                    dfd.reject();
                });

                return dfd.promise();
            }
        });

        return PageViewTree;
    }
);