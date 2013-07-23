/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/navitemscollection',
    'collections/markerscollection',
    'router'
], function ($, _, Backbone, NavItemsCollection, MarkersCollection, Router) {
    var LinesModel = Backbone.Model.extend({
        lines:[],
        circles:[],

        trail:[],
        chaos:[],

        chaosTotal:10,
        trailParticlesTotal:1,

        attributes:{
            oldMarker:null,
            activeMarker:null,
            introMarker:null
        },

        allowMouseTrail:false,

        colors:[
            {r:100, g:255, b:148},
            {r:255, g:40, b:40},
            {r:255, g:0, b:125},
            {r:0, g:192, b:255},
            {r:255, g:106, b:239},
            {r:255, g:127, b:64},
            {r:255, g:100, b:165},
            {r:136, g:212, b:255},
            {r:255, g:40, b:40},
            {r:255, g:61, b:98},
            {r:0, g:159, b:255},
            {r:255, g:255, b:255},
            {r:94, g:166, b:255},
            {r:255, g:40, b:40}
        ],

        currentColor:{r:94, g:166, b:255},
        oldTime:(new Date).getTime(),
        fpsKoeff:1,

        initialize:function () {
            NavItemsCollection.bind("change:freeze", _.bind(this.onFreezeChange, this));
            MarkersCollection.bind("change:active", _.bind(this.onActiveChanged, this));
        },
        onActiveChanged:function (marker, active) {
            if (active) {
                this.currentColor = this.colors[marker.id];
                this.allowMouseTrail = true;
                this.set({oldMarker:this.get('activeMarker')});
                this.set({activeMarker:marker});
            }
        },
        updateValues:function () {
            this.lines = [];
            this.circles = [];


            this.calculateFpsKoeff();
            this.drawLines();
            this.drawMouseTrail();
            this.drawChaos();
        },
        calculateFpsKoeff:function () {
            var time = (new Date).getTime();
            var fps = Math.round(1000 / (time - this.oldTime)) + 1;
            this.fpsKoeff = 61/fps;
            this.oldTime = time;
        },
        drawLines:function () {
            var p1, p2;
            var minDist = 320;

            for (var i = 0; i < NavItemsCollection.length; i++) {

                var modelA = NavItemsCollection.models[i];
                p1 = {x:modelA.get('x'), y:modelA.get('y')};

                for (var j = i + 1; j < NavItemsCollection.length; j++) {
                    var modelB = NavItemsCollection.models[j];
                    p2 = {x:modelB.get('x'), y:modelB.get('y'), z:0};

                    if (modelA.get('visible') && modelB.get('visible')) this.checkLineCondition(p1, p2, minDist);

                }
            }
        },
        drawMouseTrail:function () {
            var p1, p2;
            var minDist = 20;
            for (var i = 0; i < this.trail.length; i++) {
                this.trail[i].x += (this.trail[i].xTarget - this.trail[i].x) / (this.trail[i].inertia/this.fpsKoeff);
                this.trail[i].y += (this.trail[i].yTarget - this.trail[i].y) / (this.trail[i].inertia/this.fpsKoeff);

                this.circles.push({x:this.trail[i].x, y:this.trail[i].y, z:0, r:this.trail[i].r, o:1});

                p1 = {x:this.trail[i].x, y:this.trail[i].y};

                for (var j = i; j < this.trail.length; j++) {
                    p2 = {x:this.trail[j].x, y:this.trail[j].y};
                    this.checkLineCondition(p1, p2, minDist);
                }
                if (Math.abs(this.trail[i].y - this.trail[i].yTarget) < 20)  this.trail.splice(i, 1);
            }
        },
        drawChaos:function () {
            for (var i = 0; i < this.chaos.length; i++) {
                var c = this.chaos[i];
                c.a += c.vel*this.fpsKoeff;
                c.o += 0.1*this.fpsKoeff;
                if (c.o > 1)c.o = 1;

                var cx = NavItemsCollection.models[c.id].get('x') + c.r * Math.cos(c.a);
                var cy = NavItemsCollection.models[c.id].get('y') - c.a * 10;
                if (cy < NavItemsCollection.models[c.id].get('y') - 25) {
                    c.a = -2.5;
                }
                this.circles.push({x:cx, y:cy, z:0, r:c.rad, o:c.o});
            }
        },
        checkLineCondition:function (p1, p2, minDist) {
            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                //this.lines.push({x1:p1.x, y1:p1.y, x2:p2.x, y2:p2.y, o:1 - dist / minDist})
                this.lines.push({x:p1.x, y:p1.y, o:1 - dist / minDist});
                this.lines.push({x:p2.x, y:p2.y, o:1 - dist / minDist});
            }
        },
        random:function (min, max) {
            return Math.random() * (max - min) + min;
        },
        randomAround:function (value, range) {
            return value - range / 2 + range * Math.random();
        },
        onFreezeChange:function (model, freeze) {
            if (freeze) {
                this.showCircleChaos(model.id);
            }
            else {
                this.hideCircleChaos();
            }
        },
        showCircleChaos:function (id) {
            for (var i = 0; i < this.chaosTotal; i++) {
                this.chaos[i] = {id:id, r:40 - Math.random() * 80, a:Math.random() * Math.PI, vel:0.06 - 0.03 * Math.random(), rad:1 + Math.random(), o:0};
            }
        },
        hideCircleChaos:function () {
            this.chaos = [];
        },
        mouseMove:function (mX, mY) {
            if (!this.allowMouseTrail) return;

            for (var i = 0; i < this.trailParticlesTotal; i++) {
                var x = this.randomAround(mX, 50);
                var y = this.randomAround(mY, 50);
                this.trail.push({x:x, y:y, xTarget:this.randomAround(x, 100), yTarget:this.randomAround(y, 100), r:Math.random() * 2, o:1, inertia:this.randomAround(50, 50)});
            }
        }
    });
    return LinesModel;
});
