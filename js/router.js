/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/navitemscollection',
    'collections/markerscollection'
], function ($, _, Backbone, NavItemsCollection, MarkersCollection) {
    var Router = Backbone.Router.extend({
        cameraModel:null,
        infoModel:null,
        ft:true,
        id:-1,
        routes:{
            "project/:id":"showProject"
        },
        transitionIsOn: false,
        injectCamera:function (cameraModel, infoModel) {
            this.cameraModel = cameraModel;
            this.infoModel = infoModel;
        },
        showProject:function (id) {
        },
        browse:function (id) {
            if(this.id==id) return;
            this.id = id;

            if(this.ft) {
                this.ft = false;
                NavItemsCollection.showTheRest();
            }

            NavItemsCollection.browse(id);
            MarkersCollection.browse(id);

            this.cameraModel.move(NavItemsCollection.positionsX[id], NavItemsCollection.positionsY[id]);
            this.infoModel.browse(id);
        },
        showNext:function(){
            if(this.transitionIsOn) return;
            this.browse(this.id + 1);
        },
        showPrevious:function(){
            if(this.transitionIsOn) return;
            this.browse(this.id - 1);
        },
        toIntro:function(){
            MarkersCollection.browse(MarkersCollection.length-1);
        },
        showNav:function(){
            NavItemsCollection.showFirstTwoItems();
            this.cameraModel.introRotate((NavItemsCollection.positionsX[0] + NavItemsCollection.positionsX[1]) / 2, (NavItemsCollection.positionsY[0] + NavItemsCollection.positionsY[1]) / 2);
        },
        initialize:function () {
        }
    });
    return new Router;
});
