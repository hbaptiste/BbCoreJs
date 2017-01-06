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
            alert("sd");
            this.content.append("<p class='t'>pages</p>");
            return this.content;
        }
    });
});