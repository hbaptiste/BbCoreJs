define(['jquery'], function (jQuery) {

    "use strict";

    return Backbone.View.extend({

        initialize: function () {
           this.content = jQuery("<div>").eq(0);
           this.bindEvents();
        },

        bindEvents: function () {

            this.content.on("click", '.t', function(e) {
                alert(3);
            });
        },

        render: function () {
            console.log("content", this.content);
            this.content.append("<p class='t'>workflow</p>");
            console.log("content", this.content);
            return this.content;
        }
    });
});