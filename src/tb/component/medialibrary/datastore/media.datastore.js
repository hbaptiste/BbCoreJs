/*jslint unparam: true*/
define(['component!datastore', 'jsclass'], function (DataStore) {
    'use strict';

    var createDataStore = function () {

        var restDataStore = new DataStore.RestDataStore({
            resourceEndpoint: 'media',
            idKey: 'id'
        });

        restDataStore.addFilter("byMediaFolder", function (value, restParams) {
            restParams.criterias.mediaFolder_uid = value;
            return restParams;
        });

        restDataStore.addFilter("byTitle", function (value, restParams) {
            restParams.criterias.mediaTitle = value;
            return restParams;
        });

        restDataStore.addFilter("byBeforeDate", function (value, restParams) {
            restParams.criterias.beforePubdateField = value;
            return restParams;
        });

        restDataStore.addFilter("byAfterDate", function (value, restParams) {
            restParams.criterias.afterPubdateField = value;
            return restParams;
        });

        restDataStore.on("unApplyFilter:byTitle", function (lastValue, restParams) {
            delete restParams.criterias.mediaTitle;
        });

        restDataStore.on("unApplyFilter:byBeforeDate", function (lastValue, restParams) {
            delete restParams.criterias.beforePubdateField;
        });

        restDataStore.on("unApplyFilter:byAfterDate", function (lastValue, restParams) {
            delete restParams.criterias.afterPubdateField;
        });

        return restDataStore;
    }

    return {
        getDataStore: createDataStore
    };
});