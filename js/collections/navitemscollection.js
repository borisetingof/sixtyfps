/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'gsap',
    'bezier',
    'models/navitemmodel'
], function ($, _, Backbone, NavItemModel) {
    var NavItemsCollection = Backbone.Collection.extend({
        model:NavItemModel,
        screenCenterWidth:800,
        sideMargin:60,
        positionsY:[-231, -187, -207, -237, -231, -184, -139, 0, 33, 11, 55, 33, 32, 16],
        positionsX:[],
        height:0,
        initialize:function () {
            this.generatePositionsX();

            _.bindAll(this, 'showNext');
            this.bind('change:visible', _.bind(this.positionModel, this));
        },
        showFirstTwoItems:function () {
            this.models[0].set({visible:true});
            this.models[1].set({visible:true});
            this.models[0].spinning = true;
            this.models[1].spinning = true;
        },
        showTheRest:function () {
            this.models[0].float = true;
            this.models[1].float = true;
            this.models[0].spinning = false;
            this.models[1].spinning = false;
            this.models[2].set({visible:true});
        },
        showNext:function () {
            this.models[this.currentIdAnimating].float = true;
            var nextModel = this.models[this.currentIdAnimating + 1]
            if (nextModel) nextModel.set({visible:true});
        },
        browse:function (id) {
            for (var i = 0; i < this.length; i++) {
                this.models[i].set({active:false});
            }
            this.models[id].set({active:true});
        },
        positionModel:function (model) {
            var toX = this.findPositionX(parseInt(model.id));
            var toY = this.findPositionY(parseInt(model.id));

            if (model.id == 0 || model.id == 1) {  //show first 2 without tweening
                model.initX = toX;
                model.initY = toY;
            }
            else {
                var fromX = this.findPositionX(parseInt(model.id) - 1);
                var fromY = this.findPositionY(parseInt(model.id) - 1);

                model.initX = fromX;
                model.initY = fromY;

                TweenLite.to(model, 2.8, {initX:toX, initY:toY, ease:Strong.easeInOut});
                setTimeout(this.showNext, 1000);
                this.currentIdAnimating = parseInt(model.id);
            }
        },
        generatePositionsX:function(){
            var width = 1920 - this.sideMargin * 2;
            for (var i=0; i<this.positionsY.length; i++){
                this.positionsX[i] = this.sideMargin + Math.round(width / (this.positionsY.length - 1) * i);
            }
        },
        findPositionX:function (id) {
            return this.positionsX[id]
        },
        findPositionY:function (id) {
            return this.positionsY[id];
        },
        setSize:function(width, height, offset){
            this.height = height;
            for (var i = 0; i < this.length; i++) {
                this.models[i].setSize(width, height, offset);

                TweenLite.killTweensOf(this.models[i]);
                this.models[i].initX = this.findPositionX(i);
                this.models[i].initY = this.findPositionY(i);
            }
        }
    })
    return new NavItemsCollection;
});


