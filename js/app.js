/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',

    'views/markerview',
    'views/threejsview',
    'views/navitemview',
    'views/infoview',

    'models/markermodel',
    'models/linesmodel',
    'models/navitemmodel',
    'models/cameramodel',
    'models/infomodel',

    'collections/markerscollection',
    'collections/navitemscollection',

    'router'
], function ($, _, Backbone, MarkerView, ThreeJSView, NavItemView, InfoView, MarkerModel, LinesModel, NavItemModel, CameraModel, InfoModel, MarkersCollection, NavItemsCollection, Router) {

    var AppView = Backbone.View.extend({
        el:$('body'),
        pagesTotal:14,

        raphael:null,
        window:null,
        wrapper:null,

        MIN_WIDTH:1100,
        MIN_HEIGHT:600,

        initialize:function () {
            this.init();
        },
        init:function () {
            $('body').append([
                '<div id=wrapper>',
                '<div id=webglContainer></div>',
                '<div id=staticHTML></div>',
                '<div id=svgContainer></div>',
                '<div id=interactiveHTML></div>',
                '</div>'
            ].join('\n')
            );

            this.wrapper = $('#wrapper');

            this.cameraModel = new CameraModel();

            //MarkersCollection.bind('add', this.addMarker);
            for (var i = 0; i < this.pagesTotal + 1; i++) {
                var markerModel = new MarkerModel({id:i});
                MarkersCollection.add(markerModel);
            }
            markerModel.type = 'intro';


            //raphael bit
            this.raphael = Raphael("svgContainer", this.MIN_WIDTH, this.MIN_HEIGHT);
            for (var i = 0; i < this.pagesTotal; i++) {
                var navItemModel = new NavItemModel({id:i, cameraModel:this.cameraModel});
                var navItemView = new NavItemView({model:navItemModel, raphael:this.raphael});
                navItemView.render();
                NavItemsCollection.add(navItemModel);
            }


            //webgl bit
            this.threeDModel = new LinesModel();
            this.threeDView = new ThreeJSView({model:this.threeDModel});
            $('#webglContainer').append(this.threeDView.render());


            // static html bit
            var infoModel = new InfoModel();
            this.infoView = new InfoView({model:infoModel});
            $('#staticHTML').append(this.infoView.renderStatic());


            // interactive html
            $('#interactiveHTML').append(this.infoView.renderInteractive());
            this.infoView.init();

            Router.injectCamera(this.cameraModel, infoModel);

            this.window = $(window);
            this.window.bind("resize.app", _.bind(this.resize, this));
            this.window.bind("mousemove", _.bind(this.onDocumentMouseMove, this));

            this.resize();
            this.infoView.kickIt();

            Backbone.history.start();
        },
        initFBLike:function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
            fjs.parentNode.insertBefore(js, fjs);
        },
        resize:function () {
            this.width = this.window.innerWidth();
            this.height = this.window.innerHeight();

            if (this.width < this.MIN_WIDTH) this.width = this.MIN_WIDTH;
            if (this.height < this.MIN_HEIGHT) this.height = this.MIN_HEIGHT;

            this.raphael.setSize(this.width, this.height);
            this.infoView.setSize(this.width, this.height);
            this.threeDView.setSize(this.width, this.height, this.infoView.infoHeight / 2.5);
            this.cameraModel.setSize(this.width, this.height);

            NavItemsCollection.setSize(this.width, this.height, this.infoView.infoHeight / 6);

            this.wrapper.css({'width':this.width + 'px', 'height':this.height + 'px'});

        },
        onDocumentMouseMove:function (event) {
            var mX = event.pageX - this.width / 2;
            var mY = event.pageY - this.height / 2;

            this.threeDView.mouseMove(mX, mY)
            this.threeDModel.mouseMove(mX, mY)
            this.cameraModel.mouseMove(mX, mY)
        },

        addMarker:function (model) {
            var markerView = new MarkerView({model:model});
            $('body').append(markerView.render().el);

            var tempUrl = {
                '0':'http://modular.local/psd/s12.png',
                '1':'http://modular.local/psd/s1.png',
                '2':'http://modular.local/psd/s2.png',
                '3':'http://modular.local/psd/s3.png',
                '4':'http://modular.local/psd/s4.png',
                '5':'http://modular.local/psd/s5.png',
                '6':'http://modular.local/psd/s6.png',
                '7':'http://modular.local/psd/s7.png',
                '8':'http://modular.local/psd/s8.png',
                '9':'http://modular.local/psd/s9.png',
                '10':'http://modular.local/psd/s10.png',
                '11':'http://modular.local/psd/s11.png',
                '12':'http://modular.local/psd/s0.png',
                '13':'http://modular.local/psd/s12.png',
                '14':'http://modular.local/psd/square.jpg'
            }
            model.set({templateImageUrl:tempUrl[model.id]});
        }
    });

    return new AppView;
});