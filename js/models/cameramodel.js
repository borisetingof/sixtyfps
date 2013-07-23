/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'gsap',
    'bezier'
], function ($, _, Backbone, gsap, bezier) {

    var CameraModel = Backbone.Model.extend({
        x:0,
        y:0,
        z:-999,

        oldx:0,
        oldy:0,


        rotation:0,
        upAngle:0,

        spinObject:{spin:720},

        rotationRange:4,
        upAngleRange:10,

        focalLength:300,
        height:0,

        initialize:function () {

        },
        setSize:function (width, height) {
            this.width = width;
            this.height = height;
        },
        introRotate:function (x, y) {
            this.oldx = this.x = x;
            this.oldy = this.y = y;
            TweenLite.to(this.spinObject, 4.0, {spin:0, ease:Strong.easeOut});
            TweenLite.to(this, 1.0, {z:100, ease:Strong.easeOut});
        },
        move:function (x, y) {
            TweenLite.killTweensOf(this);
            TweenLite.to(this, 4, {bezier:{curviness:2, correlate:"x,z", values:[
                {x:(this.oldx + x) / 2, y:(this.oldy + y) / 2, z:155},
                {x:x, y:y, z:200}
            ]}, ease:Strong.easeOut});
            this.oldx = x;
            this.oldy = y;
        },
        mouseMove:function (mX, mY) {
            this.rotate(mX / (this.width / 2), mY / (this.height / 2));
        },
        rotate:function (rot, up) {
            this.rotation = rot * this.rotationRange / 180 * Math.PI;
            this.upAngle = up * this.upAngleRange / 180 * Math.PI;
        }
    })
    return CameraModel;
});