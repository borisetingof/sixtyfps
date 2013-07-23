/**
 * SIXTYFPS.COM.AU | Created by Boris Etingof, boris.etingof@gmail.com
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var InfoModel = Backbone.Model.extend({
        attributes:{
            id:-1
        },
        info:[
            {
                date:'APRIL 2013',
                title:'DEPEND',
                description:'Depend&reg; by Kimberly Clark. Re-skin and responsive design implementation. Radiant CMS integration.',
                resp:['HTML', 'CSS', 'JS', 'RADIANT'],
                logo:'',
                view:'view live',
                url:'http://www.depend.com.au/',
                color:'#5fe28d'
            },
            {
                date:'SEPTEMBER 2012',
                title:'QANTAS',
                description:'Interactive dynamic \'zoom and pan\' component for Qantas Find your face in the TVC online campaign.',
                resp:['FLASH', 'JS'],
                logo:'',
                view:'view live',
                url:'http://www.qantasyou.com/',
                color:'#ec373e'
            },
            {
                date:'NOVEMBER 2010',
                title:'REA',
                description:'Fresh Start Project. Socially integrated interactive 3d experience for realestate.com.au.',
                resp:['HTML', 'CSS', 'JS', 'FLASH'],
                logo:'',
                view:'view archive',
                url:'http://www.sixtyfps.com.au/showcase/freshstartproject/',
                color:'#ff5375'
            },
            {
                date:'OCTOBER 2011',
                title:'RIM',
                description:'2011 rugby world cup - Road to glory. MVC application with GPU accelerated video and Facebook connect integration.',
                resp:['HTML', 'CSS', 'JS', 'FLASH'],
                logo:'',
                view:'view archive',
                url:'http://www.sixtyfps.com.au/showcase/roadtoglory/',
                color:'#00c0ff'
            },
            {
                date:'JUNE 2011',
                title:'GUTSAN',
                description:'Graphic designer portfolio microsite. Static flash application developed with GAIA framework.',
                resp:['HTML', 'CSS', 'JS', 'FLASH'],
                logo:'',
                view:'view live',
                url:'http://nataliagutsan.com/',
                color:'#ea70de'
            },
            {
                date:'MARCH 2012',
                title:'FOXTEL',
                description:'Light version of foxtel.com.au built on top of NetBuiscits CMS delivers content across all mobile and connected devices.',
                resp:['HTML', 'CSS', 'JS'],
                logo:'',
                view:'view live',
                url:'http://m.foxtel.com.au/',
                color:'#f57a19'
            },
            {
                date:'JANUARY 2011',
                title:'S&S',
                description:'Saint & Sinner wines. Interactive promo site relying on GAIA framework with distributed content delivery.',
                resp:['HTML', 'CSS', 'JS', 'FLASH'],
                logo:'',
                view:'view live',
                url:'http://www.saintandsinner.com.au/',
                color:'#e2699b'
            },
            {
                date:'MAY 2012',
                title:'BT',
                description:'Interactive components for bt.com.au including exploded content experiences and superannuation planning visualiser.',
                resp:['HTML', 'CSS', 'FLASH'],
                logo:'',
                view:'view live',
                url:'http://www.bt.com.au/',
                color:'#80a3b7'
            },
            {
                date:'OCTOBER 2012',
                title:'A380',
                description:'Dynamic Facebook application for qantas. Leverages Facebook connect and ajax server side integration.',
                resp:['HTML', 'CSS', 'JS'],
                logo:'',
                view:'view live',
                url:'http://www.facebook.com/Qantas/app_502228899790028',
                color:'#ec373e'
            },
            {
                date:'DECEMBER 2009',
                title:'DIAGEO',
                description:'First/third person RPG online game. State pattern based media application merging graphics, audio, 3D and cinematic content.',
                resp:['FLASH'],
                logo:'',
                view:'case study',
                url:'http://www.amnesiarazorfish.com.au/our-work/smirnoff-mule/',
                color:'#ff3d62'
            },
            {
                date:'OCTOBER 2009',
                title:'NINEMSN',
                description:'Friend Magnet. Social networking promotional game. Features custom built physics engine and windows messenger integration.',
                resp:['FLASH', 'JS'],
                logo:'',
                view:'case study',
                url:'http://www.amnesiarazorfish.com.au/our-work/friend-magnet/',
                color:'#0097ea'
            },
            {
                date:'JANUARY 2008',
                title:'PEPSI',
                description:'Brand site developed in Papervision 3D bringing together 3d animations, audio and video content.',
                resp:['FLASH', 'JS'],
                logo:'',
                view:'case study',
                url:'http://www.amnesiarazorfish.com.au/our-work/pepsi-brand-site/',
                color:'#0088d4'
            },
            {
                date:'MAY 2010',
                title:'P&O',
                description:'Interactive components for pocruises.com.au including a-features, site gadgets and full screen video experiences.',
                resp:['FLASH'],
                logo:'',
                view:'view live',
                url:'http://www.pocruises.com.au/',
                color:'#1ca4e9'
            },
            {
                date:'AUGUST 2012',
                title:'QANTAS',
                description:'You are the reason we fly. Personalised banner ads with cookie based cross domain data transfer.',
                resp:['FLASH', 'JS'],
                logo:'',
                view:'press',
                url:'http://www.campaignbrief.com/2012/06/qantas-launches-first-phase-of.html',
                color:'#ec373e'
            }
        ],
        browse:function (id) {
            this.set({id:id});
        },
        initialize:function () {
        }
    })
    return InfoModel;
});