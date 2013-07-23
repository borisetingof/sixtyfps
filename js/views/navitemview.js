/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'router'
], function ($, _, Backbone, Router) {
    var NavItemView = Backbone.View.extend({
        raphael:null,
        circle:null,
        pointer:null,
        text:null,
        router:null,
        scale:1,
        scaleTarget:1,

        events:{
            "click":"onClick"
        },
        initialize:function (params) {
            this.raphael = params.raphael;
            _.bindAll(this, 'onMouseOver');
            _.bindAll(this, 'onMouseOut');
            _.bindAll(this, 'onClick');
            _.bindAll(this, 'enterFrame');
            _.bindAll(this, 'insideChanged');
            _.bindAll(this, 'visibleChanged');
            _.bindAll(this, 'frozenAndActiveChanged');

            this.model.bind('change:inside', this.insideChanged);
            this.model.bind('change:visible', this.visibleChanged);

            this.model.bind('change:freeze', this.frozenAndActiveChanged);
            this.model.bind('change:active', this.frozenAndActiveChanged);
        },

        frozenAndActiveChanged:function(model){
             if(!model.get('freeze') && model.get('active')){
                 this.circle.hide();
             }
            else{
                 this.circle.show();
             }
        },
        visibleChanged: function(model, visible){
            if(visible) this.show();
            else this.hide();
        },
        show:function(){
            this.circle.show();
            this.text.show();
            this.hitzone.show();

            if(!this.model.get('inside')) this.pointer.show();
        },
        hide:function(){
            this.circle.hide();
            this.text.hide();
            this.hitzone.hide();
            this.pointer.hide();
        },
        insideChanged:function (model, inside) {
            if (inside) {
                this.pointer.hide();
            }
            else {
                if(this.model.get('visible')) this.pointer.show();
            }
        },
        onClick:function () {
            //Router.navigate('project/' + this.model.id, {trigger:true, replace: true});
            Router.browse(this.model.id);
            this.scaleTarget = 1;
        },
        onMouseOver:function () {
            if(!this.model.get('active') && !this.model.spinning) {
                this.model.set({'freeze':true});
                $('body').css('cursor', 'pointer');
                this.scaleTarget = 4;
            }
        },
        onMouseOut:function () {
            $('body').css('cursor', 'default');
            this.model.set({'freeze':false});
            this.scaleTarget = 1;
        },
        enterFrame:function () {
            this.scale += (this.scaleTarget - this.scale) / 6;

            var x = this.model.get('x') + this.model.halfWidth;
            var y = this.model.get('y') + this.model.halfHeight;

            this.circle.attr({cx:x, cy:y});
            this.hitzone.attr({cx:x, cy:y});

            this.text.transform("t" + (x - this.textOffset) + "," + y + "s" + (this.scale + this.model.scale));

            this.pointer.transform("t" + (this.model.pointerX  + this.model.halfWidth - this.textOffset) + "," + (this.model.pointerY + this.model.halfHeight) + "r" + (180-this.model.pointerA*180/Math.PI));

            window.requestAnimationFrame(this.enterFrame);
        },
        render:function () {
            this.circle = this.raphael.circle(0, 0, 2);
            this.circle.attr({fill:"black"});

            var num = (this.model.id < 10) ? "0" + this.model.id : this.model.id;
            this.text = this.raphael.print(0, 0, num, this.raphael.getFont("CuprumRegular"), 10);
            this.text.attr({fill:"white"});
            this.textOffset = this.text.getBBox().width / 2 + 1;

            this.hitzone = this.raphael.circle(0, 0, 30).attr({fill:"white", stroke:"none", opacity:0});
            this.hitzone.hover(this.onMouseOver, this.onMouseOut);
            this.hitzone.click(this.onClick);

            var side = 5;
            this.pointer = this.raphael.path("M" + (-side*1.5 / 2) + "," + 0 + " L" + (Math.cos(Math.PI / 3) * side*1.5 - side*1.5 / 2) + "," + Math.sin(Math.PI / 3) * side * (-1) + " L" + side*1.5/2 + "," + 0);

            //console.log("M" + (-side*1.5 / 2) + "," + 0 + " L" + (Math.cos(Math.PI / 3) * side*1.5 - side*1.5 / 2) + "," + Math.sin(Math.PI / 3) * side * (-1) + " L" + side*1.5/2 + "," + 0)

            //this.pointer = this.raphael.path("M" + (-side * 1.5 / 2) + "," + 0 + " L" + (Math.cos(Math.PI / 3) * side * 1.5 - side * 1.5 / 2) + "," + Math.sin(Math.PI / 3) * side * (-1) + " L" + side * 1.5 / 2 + ",-" + 0 + " L" + 0 + "," + 0 + " L" + (-side * 1.5 / 2) + "," + 0);

            this.pointer.hide();
            this.pointer.attr({stroke:"white"});

            this.hide();

            this.enterFrame();
        }
    });
    return NavItemView;
});
