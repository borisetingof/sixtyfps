/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'stats',
    'router'
], function ($, _, Backbone, Stats, Router) {
    var ThreeJSView = Backbone.View.extend({
        width:0,
        height:0,

        renderer:null,

        orthoScene:null,
        orthoCamera:null,

        perspScene:null,
        perspCamera:null,

        particles:null,
        lines:null,
        testGeometry:null,

        particlesPoolSize:400,
        linesPoolSize:600,
        planesHalfPoolSize:1000,

        camStep:650,

        shortRange:150.0,
        highSpeed:3.0,
        lowSpeed:1.5,
        lowShine:1.0,
        highShine:10.0,
        fadeRange:50.0,

        introPlayed:false,
        firstPatternPlayed:false,

        camRotationXTarget:0,
        camRotationYTarget:0,

        mysticIntroVar:2.05,

        oldTime:(new Date).getTime(),

        PARTICLE_VS:[
            'attribute float radius;',
            'attribute vec4 alpha;',
            'varying lowp vec4 vAlpha;',
            'void main()',
            '{',
            'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
            'gl_Position =  projectionMatrix * mvPosition;',
            'gl_PointSize = 2.0*radius;',
            'vAlpha = alpha;',
            '}'
        ].join('\n'),
        PARTICLE_FS:[
            'uniform sampler2D texture;',
            'varying lowp vec4 vAlpha;',
            'void main()',
            '{',
            'vec4 outColor = texture2D( texture, gl_PointCoord );',
            'gl_FragColor = outColor*vec4(1.0, 1.0, 1.0, vAlpha);',
            '}'
        ].join('\n'),
        LINES_VS:[
            'attribute float alpha;',
            'varying float vAlpha;',
            'void main()',
            '{',
            'vAlpha = alpha;',
            'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
            'gl_Position = projectionMatrix * mvPosition;',
            'gl_PointSize = 4.0;',
            '}'
        ].join('\n'),
        LINES_FS:[
            'uniform vec3 color;',
            'varying float vAlpha;',
            'void main()',
            '{',
            'gl_FragColor = vec4(color, vAlpha);',
            '}'
        ].join('\n'),
        PLANES_VS:[
            'uniform float uTime;',
            'uniform float uTween;',
            'uniform float uFadeRange;',
            'uniform float uOffset;',

            'attribute float initAngle;',
            'attribute float initZ;',
            'attribute float targetZ;',
            'attribute vec3 center;',
            'attribute float flyRange;',
            'attribute float shine;',
            'attribute float speed;',

            'varying vec3 v_V;',
            'varying vec3 v_P;',
            'varying vec2 vUv;',
            'varying float vShine;',
            'varying float vOpacity;',


            'mat4 rotateAngleAxisMatrix(float angle, vec3 axis) {',
            'float c = cos(angle);',
            'float s = sin(angle);',
            'float t = 1.0 - c;',
            'axis = normalize(axis);',
            'float x = axis.x, y = axis.y, z = axis.z;',
            'return mat4(',
            't*x*x + c,    t*x*y + s*z,  t*x*z - s*y, 0.0,',
            't*x*y - s*z,  t*y*y + c,    t*y*z + s*x, 0.0,',
            't*x*z + s*y,  t*y*z - s*x,  t*z*z + c,   0.0,',
            '0.0,          0.0,          0.0,         1.0',
            ');',
            '}',

            'vec4 rotateAngleAxis(float angle, vec3 axis, vec3 v) {',
            'return rotateAngleAxisMatrix(angle, axis) * vec4 (v, 1.0);',
            '}',

            'mat4 translationMatrix(vec3 pos) {',
            'return mat4(',
            '1.0,  0.0, 0.0,  pos.x,',
            '0.0,  1.0, 0.0,  pos.y,',
            '0.0,  0.0, 1.0,  pos.z,',
            '0.0,  0.0, 0.0,  1.0',
            ');',
            '}',

            'void main()',
            '{',

            //spinning angle
            'float currentAngle = initAngle + uTime * 0.05 * speed / max(speed, 1.0);',
            //'float currentAngle = 0.0;',

            //flying z-position. Assuming particle doesn't have z offset, so it moves from 0 to flyRange
            'float flyZ = initZ + uTime * speed;',
            'flyZ = fract(flyZ/flyRange) * flyRange;',


            'vOpacity = min(1.0, flyZ/uFadeRange) - (flyZ - (flyRange - uFadeRange)) / uFadeRange * floor(flyZ / (flyRange - uFadeRange));',


            //forming a shape
            'float shapeZ = targetZ * uTween / 100.0;',

            'vec4 rpos = rotateAngleAxis(currentAngle, vec3(1.0, 0.0, 0.0), position) * translationMatrix(vec3(center.x, center.y, center.z + flyZ + shapeZ));',
            'vec4 mvPosition = modelViewMatrix * rpos;',
            'gl_Position = projectionMatrix * mvPosition * translationMatrix(vec3(0.0, uOffset, 0.0));',
            'v_P = gl_Position.xyz;',
            'v_V = mvPosition.xyz;',
            'vUv = uv;',
            'vShine = shine;',
            '}'
        ].join('\n'),
        PLANES_FS:[
            "#extension GL_OES_standard_derivatives : enable",
            'uniform sampler2D texture;',
            'uniform vec3 uColor;',
            'varying vec3 v_V;',
            'varying vec3 v_P;',
            'varying vec2 vUv;',
            'varying float vShine;',
            'varying float vOpacity;',
            'void main()',
            '{',
            'vec3 N = normalize(cross(dFdy(v_P), dFdx(v_P)));',
            'vec3 V = normalize(v_V);',
            'vec3 R = reflect(V, N);',

            'vec3  lightSourcePosition = vec3(0.0, 0.0, 1.0);',
            'vec3 L = normalize(lightSourcePosition);',

            'float shininess = vShine;',
            'vec4  ambient = vec4(0.1, 0.1, 0.1, 1.0);',
            'vec4  diffuse = vec4(0.1, 0.1, 0.1, 1.0) * max(dot(L, N), 0.0);',
            'vec4  specular = vec4(1.0, 1.0, 1.0, 1.0) * pow(max(dot(R, L), 0.0), shininess);',

            'vec4 resultColor = texture2D(texture, vUv)*(ambient + diffuse + specular);',
            'if(resultColor.a < 0.5) discard;',
            'gl_FragColor = resultColor * vec4(uColor, vOpacity/1.3);',
            '}'
        ].join('\n'),

        initialize:function (params) {
            _.bindAll(this, 'introTransition1');
            _.bindAll(this, 'introTransitionOver');
            _.bindAll(this, 'transition2');

            this.stats = new Stats();
        },

        enterFrame:function () {


            this.model.updateValues();

            this.renderCircles(this.model.circles);
            this.renderLines();
            this.timeIncrement();

            this.renderer.clear();
            this.composer.render(0.1);
            this.renderer.render(this.orthoScene, this.orthoCamera);
            //this.renderer.render(this.perspScene, this.perspCamera);


            if (this.firstPatternPlayed) {
                if (Math.abs(this.perspCamera.rotation.x - this.camRotationXTarget) > 0.0001) {
                    this.perspCamera.rotation.x += (this.camRotationXTarget - this.perspCamera.rotation.x) / 40;
                }
                if (Math.abs(this.perspCamera.rotation.y - this.camRotationYTarget) > 0.0001) {
                    this.perspCamera.rotation.y += (this.camRotationYTarget - this.perspCamera.rotation.y) / 40;
                }
                if (this.perspCamera.rotation.x != this.camRotationXTarget || this.perspCamera.rotation.y != this.camRotationYTarget) {
                    this.updateCameraProjectionMatrix();
                }
            }


            window.requestAnimationFrame(this.enterFrame);
        },

        updatePattern:function (model, marker) {
            if (this.introPlayed) this.updateNormalPattern(marker);
            else this.updateIntroPattern(marker);

        },

        updateIntroPattern:function (marker) {

            this.perspCamera.position.z = this.camStep / this.mysticIntroVar;
            this.updateCameraProjectionMatrix();


            this.introPlayed = true;

            var activeMarker = this.model.get('activeMarker');

            //HIDE ALL FIRST HALF
            var c;
            for (var i = 0; i < this.planesHalfPoolSize; i++) {
                for (var j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[i * 4 + j].set(Number.Infinity, Number.Infinity, Number.Infinity);
                }
            }

            // SECOND HALF TO SPHERE
            var mouseX = 0, //this.mouseX,
                mouseY = 0, //this.mouseY,
                k = 1;

            for (i = 0; i < activeMarker.imageMatrix.length; i++) {
                c = activeMarker.imageMatrix[i];
                var targetZ = -(Math.sqrt((c[0] - mouseX) * (c[0] - mouseX) + (c[1] - mouseY) * (c[1] - mouseY)) * k);  //calculating bend

                for (j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[(i + this.planesHalfPoolSize) * 4 + j].set(c[0], -c[1], -this.camStep / this.mysticIntroVar);
                    this.attributesPlanes.targetZ.value[(i + this.planesHalfPoolSize) * 4 + j] = targetZ;

                    this.attributesPlanes.initZ.value[(i + this.planesHalfPoolSize) * 4 + j] = this.shortRange - this.fadeRange / 2;
                    this.attributesPlanes.flyRange.value[(i + this.planesHalfPoolSize) * 4 + j] = this.shortRange;
                    this.attributesPlanes.speed.value[(i + this.planesHalfPoolSize) * 4 + j] = 0;
                }
            }

            // hide second half excess particles
            for (i = this.planesHalfPoolSize + activeMarker.imageMatrix.length; i < this.planesHalfPoolSize * 2; i++) {
                for (j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[i * 4 + j].set(Number.Infinity, Number.Infinity, Number.Infinity);
                }
            }

            this.attributesPlanes.center.needsUpdate = true;
            this.attributesPlanes.targetZ.needsUpdate = true;

            this.attributesPlanes.initZ.needsUpdate = true;
            this.attributesPlanes.flyRange.needsUpdate = true;
            this.attributesPlanes.speed.needsUpdate = true;

            /*
             setTimeout(this.introTransition1, 150);
             TweenLite.to(this.uniformsPlanes.uTween, 0.4, {value:100, ease:Strong.easeOut });
             TweenLite.to(this.perspCamera, 0.2, {fov:110, ease:Strong.easeOut});
             TweenLite.to(this.perspCamera.position, 0.4, {z:30, ease:Strong.easeOut, onUpdate:this.updateCameraProjectionMatrix});
             */


            setTimeout(this.introTransition1, 350);
            TweenLite.to(this.uniformsPlanes.uTween, 0.7, {value:100, ease:Strong.easeOut });
            TweenLite.to(this.perspCamera, 0.5, {fov:110, ease:Strong.easeOut});
            TweenLite.to(this.perspCamera.position, 0.6, {z:30, ease:Strong.easeOut, onUpdate:this.updateCameraProjectionMatrix});

        },

        introTransition1:function () {
            TweenLite.killTweensOf(this.perspCamera, true);
            TweenLite.killTweensOf(this.perspCamera.position, true);


            _.bindAll(this, 'introTransition2');
            TweenLite.to(this.perspCamera, 0.3, {fov:98, ease:Strong.easeIn, onUpdate:this.updateCameraProjectionMatrix, onComplete:this.introTransition2});
        },

        introTransition2:function () {

            this.perspCamera.position.z = this.camStep / this.mysticIntroVar;
            this.perspCamera.fov = 75;
            this.updateCameraProjectionMatrix();


            // SECOND HALF TO CHAOS

            this.uniformsPlanes.uTween.value = 0;

            var activeMarker = this.model.get('activeMarker');

            for (var i = 0; i < activeMarker.imageMatrix.length; i++) {

                var targetZ = this.camStep * Math.random() - this.camStep / this.mysticIntroVar;
                var initZ = this.camStep * Math.random() - this.camStep / this.mysticIntroVar;
                var initAngle = Math.random() * 360 / (Math.PI * 2);


                for (var j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[(i + this.planesHalfPoolSize) * 4 + j].z += this.attributesPlanes.targetZ.value[(i + this.planesHalfPoolSize) * 4 + j];
                    this.attributesPlanes.targetZ.value[(i + this.planesHalfPoolSize) * 4 + j] = targetZ;

                    this.attributesPlanes.speed.value[(i + this.planesHalfPoolSize) * 4 + j] = this.lowSpeed;
                    this.attributesPlanes.initAngle.value[(i + this.planesHalfPoolSize) * 4 + j] = initAngle;
                    this.attributesPlanes.initZ.value[(i + this.planesHalfPoolSize) * 4 + j] = initZ;
                    this.attributesPlanes.flyRange.value[(i + this.planesHalfPoolSize) * 4 + j] = this.camStep;
                }
            }

            this.attributesPlanes.center.needsUpdate = true;
            this.attributesPlanes.targetZ.needsUpdate = true;

            this.attributesPlanes.speed.needsUpdate = true;
            this.attributesPlanes.initAngle.needsUpdate = true;
            this.attributesPlanes.flyRange.needsUpdate = true;
            this.attributesPlanes.initZ.needsUpdate = true;


            TweenLite.to(this.perspCamera.position, 1, {z:0, ease:Strong.easeOut, onUpdate:this.updateCameraProjectionMatrix});
            TweenLite.to(this.uniformsPlanes.uTween, 1, {value:100, ease:Strong.easeOut, onComplete:this.introTransitionOver});

            Router.showNav();
        },

        introTransitionOver:function () {

            var activeMarker = this.model.get('activeMarker');

            for (var i = 0; i < activeMarker.imageMatrix.length; i++) {
                for (var j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[(i + this.planesHalfPoolSize) * 4 + j].z += this.attributesPlanes.targetZ.value[(i + this.planesHalfPoolSize) * 4 + j];
                    this.attributesPlanes.targetZ.value[(i + this.planesHalfPoolSize) * 4 + j] = 0;
                }
            }

            this.attributesPlanes.center.needsUpdate = true;
            this.attributesPlanes.targetZ.needsUpdate = true;

            Router.browse(0);
        },

        updateNormalPattern:function (marker) {

            Router.transitionIsOn = true;

            this.perspCamera.position.z = this.camStep;
            this.perspCamera.updateProjectionMatrix();


            var oldMarker = this.model.get('oldMarker');
            var activeMarker = this.model.get('activeMarker');

            //FIRST HALF
            // transfer old pattern on start indexes
            var c;
            for (var i = 0; i < oldMarker.imageMatrix.length; i++) {
                c = oldMarker.imageMatrix[i];
                var targetZ = this.camStep * Math.random();
                for (var j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[i * 4 + j].set(c[0], -c[1], 0);
                    this.attributesPlanes.center.value[i * 4 + j].z = this.attributesPlanes.center.value[(i + this.planesHalfPoolSize) * 4 + j].z + this.camStep;
                    this.attributesPlanes.shine.value[(i + 0) * 4 + j] = this.attributesPlanes.shine.value[(i + this.planesHalfPoolSize) * 4 + j];

                    this.attributesPlanes.flyRange.value[(i + 0) * 4 + j] = this.attributesPlanes.flyRange.value[(i + this.planesHalfPoolSize) * 4 + j];
                    this.attributesPlanes.initZ.value[(i + 0) * 4 + j] = this.attributesPlanes.initZ.value[(i + this.planesHalfPoolSize) * 4 + j];
                    this.attributesPlanes.speed.value[(i + 0) * 4 + j] = this.attributesPlanes.speed.value[(i + this.planesHalfPoolSize) * 4 + j];
                    this.attributesPlanes.initAngle.value[(i + 0) * 4 + j] = this.attributesPlanes.initAngle.value[(i + this.planesHalfPoolSize) * 4 + j];

                    if (this.firstPatternPlayed) {
                        this.attributesPlanes.targetZ.value[(i + 0) * 4 + j] = targetZ;
                    }
                }
            }
            // hide excess particles
            for (i = oldMarker.imageMatrix.length; i < this.planesHalfPoolSize; i++) {
                for (j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[i * 4 + j].set(Number.Infinity, Number.Infinity, Number.Infinity);
                }
            }


            // SECOND HALF
            // add new pattern
            var flyRange, initZ, shine, speed;
            var longRangeParticleDueIn = 10;
            for (i = 0; i < activeMarker.imageMatrix.length; i++) {
                c = activeMarker.imageMatrix[i];

                longRangeParticleDueIn--;

                var initAngle = Math.random() * 360 / (Math.PI * 2);
                if (longRangeParticleDueIn == 0) {
                    longRangeParticleDueIn = 10;
                    flyRange = this.camStep;
                    initZ = flyRange * Math.random();
                    shine = this.highShine;
                    speed = this.lowSpeed;
                }
                else {
                    //flyRange = shortRange;//200*(500-Math.sqrt(c.x * c.x + c.y * c.y))/500 ;
                    flyRange = this.shortRange;
                    initZ = flyRange * Math.random();
                    shine = this.lowShine;
                    speed = this.highSpeed;
                }
                for (j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[(i + this.planesHalfPoolSize) * 4 + j].set(c[0], -c[1], -this.camStep);
                    this.attributesPlanes.flyRange.value[(i + this.planesHalfPoolSize) * 4 + j] = flyRange;
                    this.attributesPlanes.initZ.value[(i + this.planesHalfPoolSize) * 4 + j] = initZ;
                    this.attributesPlanes.shine.value[(i + this.planesHalfPoolSize) * 4 + j] = shine;
                    this.attributesPlanes.speed.value[(i + this.planesHalfPoolSize) * 4 + j] = speed;
                    this.attributesPlanes.initAngle.value[(i + this.planesHalfPoolSize) * 4 + j] = initAngle;
                }
            }


            // hide excess particles
            for (i = activeMarker.imageMatrix.length + this.planesHalfPoolSize; i < this.planesHalfPoolSize * 2; i++) {
                for (j = 0; j < 4; j++) {
                    this.attributesPlanes.center.value[i * 4 + j].set(Number.Infinity, Number.Infinity, Number.Infinity);
                }
            }

            this.attributesPlanes.center.needsUpdate = true;
            this.attributesPlanes.flyRange.needsUpdate = true;
            this.attributesPlanes.initZ.needsUpdate = true;
            this.attributesPlanes.shine.needsUpdate = true;
            this.attributesPlanes.speed.needsUpdate = true;
            this.attributesPlanes.initAngle.needsUpdate = true;

            if (this.firstPatternPlayed) {
                this.attributesPlanes.targetZ.needsUpdate = true;
                this.transition1();
            }
            else {
                TweenLite.to(this.uniformsPlanes.uOffset, 2, {value:this.offset, ease:Quad.easeInOut});
                this.transition2();

            }

            this.firstPatternPlayed = true;
        },

        transition1:function () {
            TweenLite.killTweensOf(this.uniformsPlanes.uTween);
            TweenLite.killTweensOf(this.perspCamera.position);


            this.uniformsPlanes.uTween.value = 0;
            TweenLite.to(this.uniformsPlanes.uTween, 1, {value:100, ease:Strong.easeOut, onComplete:this.transition2 });
            //TweenLite.to(this.perspCamera, 1, {fov:75, ease:Strong.easeOut, onUpdate:this.updateCameraProjectionMatrix});
        },
        transition2:function () {
            Router.transitionIsOn = false;

            var c = this.model.currentColor;
            TweenLite.to(this.uniformsPlanes.uColor.value, 3, {r:c.r / 255, g:c.g / 255, b:c.b / 255, ease:Strong.easeInOut});
            TweenLite.to(this.perspCamera.position, 3, {z:0, ease:Strong.easeInOut, onUpdate:this.updateCameraProjectionMatrix});
        },

        updateCameraProjectionMatrix:function () {
            this.perspCamera.updateProjectionMatrix();
        },

        timeIncrement:function () {
            var time = (new Date).getTime();
            var fps = Math.round(1000/(time - this.oldTime)) + 1;
            this.oldTime = time;
            this.uniformsPlanes.uTime.value += 61/fps;
        },

        renderCircles:function (array) {
            //var projector = new THREE.Projector();
            var c;
            for (var i = 0; i < array.length; i++) {
                c = array[i];
                /*
                 var p2d = new THREE.Vector3(c.x / this.width * 2, -c.y / this.height * 2, 1);
                 this.particles.geometry.vertices[i] = projector.unprojectVector(p2d, this.perspCamera);
                 */
                this.particles.geometry.vertices[i].set(c.x, c.y, 0);

                this.attributesParticles.alpha.value[i] = c.o;
                this.attributesParticles.radius.value[i] = c.r;
            }
            for (i = array.length; i < this.particlesPoolSize; i++) {
                this.particles.geometry.vertices[i].set(Number.Infinity, Number.Infinity,
                    Number.Infinity);
            }

            this.particles.geometry.verticesNeedUpdate = true;
            this.attributesParticles.alpha.needsUpdate = true;
            this.attributesParticles.radius.needsUpdate = true;
        },
        renderLines:function () {
            //var projector = new THREE.Projector();

            var maxLines = Math.min(this.model.lines.length, this.linesPoolSize);

            var l;
            for (var i = 0; i < maxLines; i++) {
                l = this.model.lines[i];
                /*
                 var p2d = new THREE.Vector3(l.x / this.width * 2, -l.y / this.height * 2, 1);
                 this.lines.geometry.vertices[i] = projector.unprojectVector(p2d, this.perspCamera);
                 */
                this.lines.geometry.vertices[i].set(l.x, l.y, 0);
                this.linesAttributes.alpha.value[i] = l.o;
            }
            for (i = maxLines; i < this.linesPoolSize; i++) {
                this.lines.geometry.vertices[i].set(Number.Infinity, Number.Infinity, Number.Infinity);
            }
            this.lines.geometry.verticesNeedUpdate = true;
            this.linesAttributes.alpha.needsUpdate = true;
        },


        // create all
        render:function () {
            this.renderer = new THREE.WebGLRenderer({antialias:true});
            this.renderer.autoClear = false;

            //ortho
            this.orthoScene = new THREE.Scene();
            this.orthoCamera = new THREE.OrthographicCamera(0, 0, 0, 0, 0, 1);

            this.createParticlesPool();
            this.createLinesPool();


            //persp
            this.perspScene = new THREE.Scene();
            this.perspScene.fog = new THREE.Fog(0x000000, 0, 25000); //0x020209

            this.renderer.setClearColor(this.perspScene.fog.color, 1);

            this.perspCamera = new THREE.PerspectiveCamera(75, 1, 1, this.camStep * 2 - this.shortRange);
            this.perspCamera.position.z = this.camStep;

            this.createTestGeometry();


            //post production
            var renderPass = new THREE.RenderPass(this.perspScene, this.perspCamera);

            //bloom
            var effectBloom = new THREE.BloomPass(1.0);

            //vignette
            var vignetteShader = THREE.VignetteShader;
            vignetteShader.uniforms[ "offset" ].value = 1.8;
            var vignettePass = new THREE.ShaderPass(vignetteShader);
            vignettePass.renderToScreen = true;

            this.composer = new THREE.EffectComposer(this.renderer);
            this.composer.addPass(renderPass);
            this.composer.addPass(effectBloom);
            this.composer.addPass(vignettePass);

            _.bindAll(this, 'updateCameraProjectionMatrix');
            this.model.bind('change:activeMarker', _.bind(this.updatePattern, this));

            _.bindAll(this, 'enterFrame');
            this.enterFrame();

            var gl = this.renderer.domElement.getContext('webgl') || this.renderer.domElement.getContext('experimental-webgl');
            gl.getExtension('OES_standard_derivatives');

            return this.renderer.domElement;
        },

        createTestGeometry:function () {
            this.testGeometry = new THREE.Geometry();

            var colorV4 = new THREE.Color();
            var c = this.model.currentColor;
            colorV4.setRGB(c.r / 255, c.g / 255, c.b / 255);

            this.uniformsPlanes = {
                texture:{type:"t", value:THREE.ImageUtils.loadTexture("img/circle.png")},
                uTime:{type:"f", value:0.0},
                uTween:{type:"f", value:0.0},
                uFadeRange:{type:"f", value:this.fadeRange},
                uColor:{ type:"c", value:colorV4},
                uOffset:{type:"f", value:0.0}
            };

            this.attributesPlanes = {
                center:{type:"v3", value:[]},
                initAngle:{type:'f', value:[]},
                initZ:{type:'f', value:[]},
                targetZ:{type:"f", value:[]},
                flyRange:{type:"f", value:[]},
                shine:{type:"f", value:[]},
                speed:{type:"f", value:[]}
            };

            var planesShaderMaterial = new THREE.ShaderMaterial({
                uniforms:this.uniformsPlanes,
                attributes:this.attributesPlanes,
                vertexShader:this.PLANES_VS,
                fragmentShader:this.PLANES_FS,
                side:THREE.DoubleSide,
                depthWrite:true,
                transparent:true
            });

            var side = 3;
            for (var i = 0; i < this.planesHalfPoolSize * 2; i++) {
                this.testGeometry.vertices.push(
                    new THREE.Vector3(side, side, 0),
                    new THREE.Vector3(-side, side, 0),
                    new THREE.Vector3(-side, -side, 0),
                    new THREE.Vector3(side, -side, 0)
                );
                for (var j = 0; j < 4; j++) {
                    this.attributesPlanes.initAngle.value[i * 4 + j] = 0;
                    this.attributesPlanes.initZ.value[i * 4 + j] = 0;
                    this.attributesPlanes.targetZ.value[i * 4 + j] = 0;
                    this.attributesPlanes.center.value[i * 4 + j] = new THREE.Vector3(Number.Infinity, Number.Infinity, Number.Infinity);
                    this.attributesPlanes.flyRange.value[i * 4 + j] = 0;
                    this.attributesPlanes.shine.value[i * 4 + j] = this.highShine;
                    this.attributesPlanes.speed.value[i * 4 + j] = 0;
                }

                var face = new THREE.Face4(i * 4, i * 4 + 1, i * 4 + 2, i * 4 + 3);
                this.testGeometry.faces.push(face);

                this.testGeometry.faceVertexUvs[0].push([
                    new THREE.UV(0, 1),
                    new THREE.UV(1, 1),
                    new THREE.UV(1, 0),
                    new THREE.UV(0, 0)
                ]);
            }

            this.perspScene.add(new THREE.Mesh(this.testGeometry, planesShaderMaterial));
        },
        createParticlesPool:function () {
            var uniforms = {
                texture:{type:"t", value:THREE.ImageUtils.loadTexture("img/circle.png")},
                color:{type:"c", value:new THREE.Color(0xffffff)}
            };
            this.attributesParticles = {
                alpha:{type:'f', value:[]},
                radius:{type:'f', value:[]}
            };
            var particlesShaderMaterial = new THREE.ShaderMaterial({
                uniforms:uniforms,
                attributes:this.attributesParticles,
                vertexShader:this.PARTICLE_VS,
                fragmentShader:this.PARTICLE_FS
            });

            this.particles = new THREE.ParticleSystem(new THREE.Geometry(), particlesShaderMaterial);
            this.orthoScene.add(this.particles);
            for (var i = 0; i < this.particlesPoolSize; i++) {
                this.particles.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                this.attributesParticles.alpha.value[i] = 0.0;
                this.attributesParticles.radius.value[i] = 0.0;
            }
        },
        createLinesPool:function () {
            var uniforms = {
                color:{type:"c", value:new THREE.Color(0xcccccc)}
            };
            this.linesAttributes = {
                alpha:{type:'f', value:[]}
            };
            var linesShaderMaterial = new THREE.ShaderMaterial({
                uniforms:uniforms,
                attributes:this.linesAttributes,
                vertexShader:this.LINES_VS,
                fragmentShader:this.LINES_FS
            });

            this.lines = new THREE.Line(new THREE.Geometry(), linesShaderMaterial, THREE.LinePieces);
            this.orthoScene.add(this.lines);
            for (var i = 0; i < this.linesPoolSize; i++) {
                this.lines.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
                this.linesAttributes.alpha.value[i] = 0.0;
            }
        },

        mouseMove:function (mX, mY) {
            this.camRotationYTarget = -mX * 0.00005;
            this.camRotationXTarget = -mY * 0.0001;
        },

        setSize:function (width, height, offset) {
            this.renderer.setSize(width, height);

            this.composer.reset();

            this.perspCamera.aspect = width / height;
            this.updateCameraProjectionMatrix();

            this.orthoCamera.left = -width / 2;
            this.orthoCamera.right = width / 2;
            this.orthoCamera.top = -height / 2;
            this.orthoCamera.bottom = height / 2;
            this.orthoCamera.updateProjectionMatrix();

            this.offset = offset / height;
            if (this.firstPatternPlayed) {
                TweenLite.killTweensOf(this.uniformsPlanes.uOffset);
                this.uniformsPlanes.uOffset.value = this.offset;
            }

            this.width = width;
            this.height = height;
        }
    });
    return ThreeJSView;
});

