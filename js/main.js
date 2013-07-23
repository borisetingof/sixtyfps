/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
require.config({
  paths: {
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min',
    backbone: 'libs/backbone/backbone-optamd3-min',
    gsap: 'libs/gsap/TweenLite.min',
    bezier: 'libs/gsap/plugins/BezierPlugin.min',
    stats: 'libs/utils/Stats',
    text: 'libs/require/text'
  }
});
require([
  'app'
], function(App){
});
