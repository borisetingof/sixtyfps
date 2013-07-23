/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'models/markermodel'
], function($, _, Backbone, MarkerModel){
    var MarkersCollection = Backbone.Collection.extend({
        model: MarkerModel,

        initialize: function(){
            _.bindAll(this, 'anotherModelReady');
            this.bind('change:ready', this.anotherModelReady);
        },
        anotherModelReady:function(model, ready){
            this.count++;
            if(this.count == this.length) this.trigger('allModelsAreReady');
        },
        browse: function(id){
            for (var i = 0; i < this.length; i++) {
                if(this.models[i].get('active')==true) this.models[i].set({active:false});
            }
            this.models[id].set({active:true});
        }
    })
    return new MarkersCollection;
});


