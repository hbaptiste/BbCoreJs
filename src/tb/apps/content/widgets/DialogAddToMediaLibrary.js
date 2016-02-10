/**
 * A dialog that asks the user if he need
 *
 */

define([ 'Core', 'component!popin', 'BackBone', 'jquery', 'content.manager', 'component!session', 'component!translator', 'component!notify', 'jsclass'], function (Core, popinManager, BackBone, jQuery, ContentManager, sessionMng, Translator, notifyMng) {

    'use strict';

    var instance = null,

        trans = require('Core').get('trans') || function (value) { return value; },

        dialogTemplate = "<div><p><input id='user-choice' type='checkbox'></input> " + trans("remember_my_choice") + "</p></div>",

        AddToMediaLibraryDialog = new JS.Class({

            STORAGE_KEY: 'save_in_medialibrary',
            TEXT_ELEMENT: 'Element/Text',
            ADD_TO_LIBRARY_MAP: 'component:medialibrary:add_to_library_map',
            States: {
                UNSELECT_STATE: 0,
                SELECT_STATE: 1
            },
            initialize: function () {
                jQuery.extend(this, {}, BackBone.Events);
                jQuery.extend(this, {}, this.States);
                this.state = this.States.UNSELECT_STATE;
                this.saveToMediaLibrary = false;
                this.showDialog = true;
                this.dialog = popinManager.createPopIn({});
                this.dialog.setTitle(trans("save_in_media_library"));
                this.dialog.setContent(jQuery(dialogTemplate));
                this.handleState();
            },

            getParams: function (elementType, key) {
                return Core.config(this.ADD_TO_LIBRARY_MAP + ':' + elementType + ':' + key);
            },

            addFilters: function (mediaDatastore) {
                mediaDatastore.addFilter("byContentType", function (params, restParams) {
                    restParams.criterias.contentType = params.contentType;
                    restParams.criterias.contentUid = params.contentUid;
                    return restParams;
                });

                return mediaDatastore;
            },

            throwException: function (contentType, property) {
                Core.exception('AddToLibraryException', 550, 'the "' + property + '" property of medialibrary:add_to_library_map section named"' + contentType + '" should be a string');
            },

            getAddToLibraryParams: function (content) {

                var transformInto = this.getParams(content.type, "transform_into"),
                    fileElement = this.getParams(content.type, "file_element"),
                    titleElement = this.getParams(content.type, "title_element");

                if (typeof transformInto !== 'string') {
                    this.throwException(content.type, 'transformInto');
                }

                if (typeof fileElement !== 'string') {
                    this.throwException(content.type, 'fileElement');
                }

                if (typeof titleElement !== 'string') {
                    this.throwException(content.type, 'titleElement');
                }

                return {
                    transformInto: transformInto,
                    fileElement: fileElement,
                    titleElement: titleElement
                };
            },


            init: function () {
                var content = this.dialog.getContent(),
                    processFn = null,
                    self = this;

                Core.Mediator.subscribe('on:classcontent:beforedropmedia', function (context) {
                    if (!self.showDialog) { return; }
                    context.hasListener = true;
                    processFn = context.process;
                    self.show();
                });

                Core.Mediator.subscribe('on:classcontent:afterdropmedia', function (content, droppedFile) {
                    var title,
                        mediaData,
                        contentParams = self.getAddToLibraryParams(content);


                    if (contentParams && self.saveToMediaLibrary) {

                        Core.ApplicationManager.invokeService('content.main.getMediaDatastore').done(function (mediaDatastore) {

                            mediaDatastore = self.addFilters(mediaDatastore.getDataStore());

                            mediaDatastore.applyFilter("byContentType", {contentUid: content.uid, contentType: content.type}).execute().done(function (result) {

                                if (result.length !== 0) {
                                    notifyMng.warning(Translator.translate("media_already_in_medialibrary"));
                                    return;
                                }


                                ContentManager.createElement(contentParams.transformInto).done(function (mediaContent) {

                                    mediaContent.getData("elements").done(function (elements) {

                                        if (!elements[contentParams.titleElement]) {
                                            Core.exception('AddToLibraryException', 550, contentParams.transformInto + " should have a '" + contentParams.titleElement + "' element");
                                        }

                                        if (!elements[contentParams.fileElement]) {
                                            Core.exception('AddToLibraryException', 550, contentParams.transformInto + " should have a '" + contentParams.titleElement + "' element");
                                        }

                                        if (self.TEXT_ELEMENT !== elements[contentParams.titleElement].type) {
                                            Core.exception('AddToLibraryException', contentParams.titleElement + " element of '" + contentParams.transformInto + "' should be an Element/Text");
                                        }

                                        if (content.type !== elements[contentParams.fileElement].type) {
                                            Core.exception('AddToLibraryException', contentParams.fileElement + " element of '" + contentParams.transformInto + "' should be an " + content.type);
                                        }

                                        title = ContentManager.buildElement({
                                            'type': elements[contentParams.titleElement].type,
                                            'uid': elements[contentParams.titleElement].uid
                                        });

                                        title.set("value", droppedFile.name);

                                        mediaContent.addElement(contentParams.fileElement, {uid: content.uid, type: content.type });
                                        Core.ApplicationManager.invokeService('content.main.save', true).done(function () {

                                            mediaData = {
                                                title: droppedFile.name,
                                                content_uid: mediaContent.uid,
                                                content_type: contentParams.transformInto
                                            };

                                            mediaDatastore.save(mediaData, true);
                                        });

                                    });

                                });
                            });
                        });

                    }

                });

                jQuery(content).on('click', '#user-choice', this.handleClick.bind(this));

                this.dialog.addButton(trans('yes'), function () {
                    self.dialog.hide();
                    if (self.getState() === self.States.SELECT_STATE) {
                        sessionMng.setItem(self.STORAGE_KEY, self.States.SELECT_STATE);
                    }
                    self.saveToMediaLibrary = true; //do save the media in the media library

                    self.trigger('save', self.getState());
                    if (typeof processFn === 'function') {
                        processFn();
                    }
                });

                this.dialog.addButton(trans('no'), function () {
                    self.dialog.hide();
                    if (self.getState() === self.States.SELECT_STATE) {
                        sessionMng.setItem(self.STORAGE_KEY, self.States.UNSELECT_STATE); // save_to_medialibray = 0
                    }
                    self.saveToMediaLibrary = false; //do not save the media in the media library
                    if (typeof processFn === 'function') {
                        processFn();
                    }

                });
            },

            handleState: function () {
                /* retrive state from session */
                var saveState = sessionMng.getItem(this.STORAGE_KEY);
                if (typeof saveState === 'number') {
                    this.state = saveState;
                    if (this.state === this.States.SELECT_STATE) {
                        this.saveToMediaLibrary = true;
                        this.showDialog = false;
                    }
                }
            },

            handleClick: function (e) {

                if (jQuery(e.currentTarget).is(':checked')) {
                    this.setState(this.States.SELECT_STATE);
                    this.showDialog = false;
                } else {
                    this.setState(this.States.UNSELECT_STATE);
                }
            },

            setState: function (state) {
                this.state = state;
            },

            getState: function () {
                return this.state;
            },

            show: function () {
                this.dialog.display();
            },

            hide: function () {
                this.dialog.hide();
            }
        });

    return {

        getInstance: function () {
            if (!instance) {
                instance = new AddToMediaLibraryDialog();
            }
            return instance;
        },

        AddToMediaLibraryDialog: AddToMediaLibraryDialog
    };

});