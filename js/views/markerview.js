/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var MarkerView = Backbone.View.extend({
        initialize:function () {
            _.bindAll(this, 'templateImageUrlChanged');
            _.bindAll(this, 'generateImageMatrix');
            this.model.bind('change:templateImageUrl', this.templateImageUrlChanged);
        },
        templateImageUrlChanged:function () {
            this.image = new Image();
            this.image.onload = this.generateImageMatrix;
            this.image.src = this.model.get("templateImageUrl");
        },
        generateImageMatrix:function () {
            //$el. and $(this.el). reference to el
            //this.$("object"). reference to object inside el
            var step = 9;

            var H = this.image.width;
            var W = this.image.height;
            $(this.el).append("<canvas width=" + W + " height=" + H + "></canvas>");

            var ctx;
            ctx = $(this.el).find('canvas')[0].getContext('2d');
            ctx.drawImage(this.image, 0, 0);
            var imageData = ctx.getImageData(0, 0, W, H);

            var data = [];
            var index, red;

            var stepOffset = (this.model.type == 'normal') ? 1 : 0.7;
            var str='';

            for (var y = 0; y < imageData.height / step; y++) {
                for (var x = 0; x < imageData.width / step; x++) {
                    index = (x * step + y * step * imageData.width) * 4;
                    red = imageData.data[index + 0];
                    if (red < 250) {
                        data.push([Math.round(x * step * stepOffset - 500 / 2 * stepOffset), Math.round(y * step * stepOffset - 500 / 2 * stepOffset)]);
                        str +=  '[' + data[data.length - 1][0] + ',' + data[data.length - 1][1] + '],';
                    }
                }
            }
            if(this.model.id=='0') console.log(str);

            $(this.el).find('canvas').remove();
            this.model.setImageMatrix(data);
        },
        render:function () {
            return this;
        }
    });
    return MarkerView;
});
