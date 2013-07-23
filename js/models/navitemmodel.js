/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var NavItemModel = Backbone.Model.extend({
        amp:50,
        alpha:0,
        float:false,

        initX:0,
        initY:0,
        initZ:0,

        pointerX:0,
        pointerY:0,
        pointerA:0,

        up:null,
        rot:null,
        camx:null,
        camy:null,
        camz:null,

        smoothingTarget:0,
        smoothing:0,

        dy:0,
        scale:0,

        cameraModel:null,
        spinning:false,
        defaults:{
            active:false,
            freeze:false,
            inside:false,
            visible:false,

            x:0,
            y:0,
            z:0
        },
        halfWidth:0,
        halfHeight:0,
        positiveScaleRatio :1,
        offset:0,
        oldTime:(new Date).getTime(),
        fpsKoeff:1,
        initialize:function (params) {
            this.cameraModel = params.cameraModel;

            _.bindAll(this, 'enterFrame');
            _.bindAll(this, 'onFreezeChange');
            _.bindAll(this, 'onVisibleChange');

            this.bind('change:freeze', this.onFreezeChange);
            this.bind('change:visible', this.onVisibleChange);

            this.enterFrame();
        },
        setSize:function(width, height, offset){
            this.halfWidth = width/2;
            this.halfHeight = height/2;
            this.offset = offset;
        },
        onVisibleChange:function(){
            //this.initZ = 8000;
            //TweenLite.to(this, 3, {initZ:0,  ease:Strong.easeOut});
        },
        onFreezeChange:function () {
            this.smoothingTarget = 10000;
            this.smoothing = 0;
        },
        calculateFpsKoeff:function () {
            var time = (new Date).getTime();
            var fps = Math.round(1000 / (time - this.oldTime)) + 1;
            this.fpsKoeff = 61/fps;
            this.oldTime = time;
        },
        enterFrame:function () {
            this.calculateFpsKoeff();

            if (!this.get('freeze')) {

                var cameraUp;
                var cameraRot;

                if(this.get('active')){
                    this.alpha = 0;
                    this.dy-=this.dy/20*this.fpsKoeff;

                    this.scale += (1.75 - this.scale)/20*this.fpsKoeff;

                    cameraUp = 0;
                    cameraRot = 0;
                }
                else {
                    if(this.float) this.alpha += 0.01*this.fpsKoeff;
                    this.dy = Math.sin(this.alpha) * this.amp;

                    this.scale -= this.scale/20*this.fpsKoeff;

                    cameraUp = this.cameraModel.upAngle;
                    cameraRot = this.cameraModel.rotation;
                }
                if (Math.abs(this.smoothingTarget - this.smoothing) < 0.00001) {
                    this.smoothing = this.smoothingTarget;

                    this.camx = this.cameraModel.x;
                    this.camy = this.cameraModel.y;
                    this.camz = this.cameraModel.z;
                }
                else {
                    this.smoothing += (this.smoothingTarget - this.smoothing) / 50*this.fpsKoeff;

                    this.camx += (this.cameraModel.x - this.camx) / 10*this.fpsKoeff;
                    this.camy += (this.cameraModel.y - this.camy) / 10*this.fpsKoeff;
                    this.camz += (this.cameraModel.z - this.camz) / 10*this.fpsKoeff;
                }

                this.up += (cameraUp - this.up) / 50*this.fpsKoeff;
                this.rot += (cameraRot - this.rot) / 50*this.fpsKoeff;

                var x = this.initX - this.camx;
                var y = this.initY - this.camy + this.dy;
                var z = this.initZ - this.camz;

                // rotation around y axis
                var tx, ty, tz;
                var angle = this.rot
                tx = Math.cos(angle) * x - Math.sin(angle) * z;
                tz = Math.sin(angle) * x + Math.cos(angle) * z;
                x = tx;
                z = tz;

                // rotation around x axis
                angle = this.up;
                ty = Math.cos(angle) * y - Math.sin(angle) * z;
                tz = Math.sin(angle) * y + Math.cos(angle) * z;
                y = ty;
                z = tz;

                // rotation around z axis
                angle = this.cameraModel.spinObject.spin / 180 * Math.PI;
                tx = Math.cos(angle) * x - Math.sin(angle) * y;
                ty = Math.sin(angle) * x + Math.cos(angle) * y;
                x = tx;
                y = ty;

                var scaleRatio = this.cameraModel.focalLength / (this.cameraModel.focalLength + z);

                if(scaleRatio >= 0){
                    this.positiveScaleRatio = scaleRatio;
                }

                var projectedX = x * this.positiveScaleRatio;
                var projectedY = y * this.positiveScaleRatio;


                this.set({x:projectedX});
                this.set({y:projectedY - this.offset});


                //checking inside/outside
                var dx = this.get('x');
                var dy = this.get('y');

                var x, y;
                var R = this.halfWidth;

                if (Math.sqrt(dx * dx + dy * dy) > R) {
                    var angle = Math.atan2(dx, dy);
                    x = (R-10) * Math.sin(angle);
                    y = (R-10) * Math.cos(angle);
                    this.set({inside:false});
                    this.pointerX = x+10;
                    this.pointerY = y;
                    this.pointerA = angle;

                }
                else {
                    this.set({inside:true});
                }
            }


            window.requestAnimationFrame(this.enterFrame);
        }
    })
    return NavItemModel;
});
