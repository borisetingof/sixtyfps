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


    var InfoView = Backbone.View.extend({

        lettersPool:['A', 'B', 'C', 'D'],
        top:'-133px',
        middle:'-33px',
        bottom:'67px',
        logoHeight:40,
        sideMargin:50,
        arrowWidth:29,
        arrowHeight:46,
        infoWidth:900,
        infoHeight:230,
        introWrapperHeight:34,
        introWrapperWidth:230,
        bestHeight:22,
        introBgWidth:370,
        introBgHeight:140,
        vegetationWidth:76,
        ft:true,
        oldId:-1,

        initialize:function () {
            _.bindAll(this, 'updateInfo');
            _.bindAll(this, 'runAnimation');
            _.bindAll(this, 'updateTextField');
            _.bindAll(this, 'completeTextField');
            _.bindAll(this, 'repositionLogo');
            _.bindAll(this, 'animateSecondLogo');
            _.bindAll(this, 'leftOver');
            _.bindAll(this, 'rightOver');
            _.bindAll(this, 'leftArrowClick');
            _.bindAll(this, 'rightArrowClick');
            _.bindAll(this, 'meOver');
            _.bindAll(this, 'meOut');
            _.bindAll(this, 'introOver');
            _.bindAll(this, 'introOut');
            _.bindAll(this, 'introClick');
            _.bindAll(this, 'removeIntro');
            _.bindAll(this, 'viewOver');
            _.bindAll(this, 'viewOut');
            _.bindAll(this, 'viewClick');
            this.model.bind('change:id', this.updateInfo);

            this.stats = new Stats();
        },
        enterFrame:function () {
            var fps = this.stats.update();
            if (fps > 0) this.el_vegetation_p.html(fps);
            window.requestAnimationFrame(this.enterFrame);
        },
        calculateOffsets:function () {
            var dateW = this.el_date.width();
            var descW = this.el_desc_measurer.width();
            var titleW = this.el_two.width();
            this.titlePos = (this.infoWidth - titleW) / 2 + 'px';
            this.logoPos = (this.infoWidth + titleW) / 2;

            this.el_two.css({left:this.titlePos});


            var off = (this.viewurl) ? 50 : 0;

            this.el_description.css({left:(this.infoWidth - descW) / 2 - off + 'px'});
            this.el_view.css({left:(this.infoWidth - descW) / 2 + descW + 8 - off + 'px'});
            this.el_date.css({left:(this.infoWidth - titleW) / 2 - dateW + 'px'});
            this.el_resp.css({left:(this.infoWidth - titleW) / 2 - 87 + 'px'});
        },
        repositionLogo:function () {
            this.el_logoWrapper.css({left:this.logoPos + 'px'});
            this.animateSecondLogo();
        },
        animateSecondLogo:function () {
            this.el_logoTwo.animate({top:'0'}, 200);
        },
        runAnimation:function (animationPull) {
            for (var i = 0; i < animationPull.length; i++) {
                this.animate(animationPull[i]);
            }
        },
        animate:function (animation) {
            $(animation.id).html('');
            $(animation.id).css({visibility:'visible'});

            animation.progressiveString = [];
            var addition = '';
            for (var i = 0; i < animation.string.length; i++) {
                for (var j = 0; j < this.lettersPool.length; j++) {
                    animation.progressiveString.push(addition + this.lettersPool[j]);
                }
                addition += animation.string.charAt(i).toUpperCase();
            }
            animation.progressiveString.push(addition);
            animation.progressiveString = animation.progressiveString;

            TweenLite.to(animation, animation.time, {tween:animation.progressiveString.length, delay:animation.delay, onUpdate:this.updateTextField, onUpdateParams:[animation], onComplete:this.completeTextField, onCompleteParams:[animation], ease:Quad.easeOut});
        },
        completeTextField:function (animation) {
            animation.id.html(animation.progressiveString[animation.progressiveString.length - 1]);
        },
        updateTextField:function (animation) {
            animation.id.html(animation.progressiveString[Math.ceil(animation.tween)]);
        },
        updateInfo:function (model, id) {
            var data = this.model.info[id];

            this.el_date.css({visibility:'hidden'});
            this.el_date_p.html(data.date.toUpperCase());

            this.el_desc_measurer.html(data.description.toUpperCase());

            this.viewurl = data.url;
            if(this.viewurl!='') {
                this.el_view.css({display:'block'});
                this.el_view_p_top.css({'border-bottom-color':data.color, 'color':data.color})
            }
            else {
                this.el_view.css({display:'none'});
            }
            this.el_view_p_bottom.html(data.view.toUpperCase());

            for (var i = 0; i < 4; i++) {
                this['el_l' + i + 'p'].html('');
            }

            if (!this.ft) {
                this.el_one_h1.html(this.oldTitle.toUpperCase());
                this.el_one.css({top:this.middle, left:this.titlePos});
                this.el_logoOne.css({'background-position':'0px -' + this.oldId * this.logoHeight + 'px', top:'0'});
            }

            this.el_two.css('top', this.bottom);
            this.el_two_h1.html(data.title.toUpperCase());
            this.el_logoTwo.css({'background-position':'0px -' + id * this.logoHeight + 'px', top:this.logoHeight + 'px'});


            this.el_one.animate({top:this.top}, 400);
            this.el_two.animate({top:this.middle}, 400);
            this.el_logoOne.animate({top:'-' + this.logoHeight + 'px'}, 200, null, this.repositionLogo);

            if (this.viewAnimation) TweenLite.killTweensOf(this.viewAnimation);
            this.el_view_p_top.html('');
            this.viewAnimation = {'id':this.el_view_p_top, 'string':data.view, time:1, tween:0, delay:1};
            this.animate(this.viewAnimation);

            var animationPull = [
                {'id':this.el_date_p, 'string':data.date, time:1, tween:0, delay:0},
                {'id':this.el_description_p, 'string':data.description, time:1, tween:0, delay:0},
                {'id':this.el_respTitle, 'string':'RESPONSIBILITIES', time:1, tween:0, delay:0}
            ]
            if (this.ft) {
                this.el_me.css({display:'block'})
                animationPull.push({'id':this.el_me_a, 'string':'BORIS ETINGOF', time:1, tween:0, delay:0});
            }
            for (i = 0; i < data.resp.length; i++) {
                animationPull.push({'id':this['el_l' + i + 'p'], 'string':data.resp[i], time:1, tween:0, delay:i * 0.15})
            }

            this.calculateOffsets();
            this.runAnimation(animationPull);
            this.checkArrows(id);

            this.ft = false;
            this.oldId = id;
            this.oldTitle = this.model.info[id].title;
        },
        checkArrows:function (id) {
            if (id == 0) this.hideLeftArrow();
            else {
                if (this.oldId == 0) this.showLeftArrow();
            }
            if (id == this.model.info.length - 1) this.hideRightArrow();
            else {
                if (this.oldId == this.model.info.length - 1 || this.oldId == -1) this.showRightArrow();
            }
        },
        renderInteractive:function () {
            var code = [
                '<div class=intro>',
                '<div class=introBgWrapper><div class=bg></div></div>',
                '<div class=introWrapper>',
                '<div class=be><p></p></div>',
                '<div class=start><p>START</p></div>',
                '</div>',
                '<div class=best><p></p></div>',
                '<div class=introClicker></div>',
                '</div>',
                '<div class=me><p class=leftbr>[</p><a class=name href="mailto:boris.etingof@gmail.com"></a><p class=rightbr>]</p></div>',
                '<div class="vegetationWrapper"><div class=vegetation><p></p></div></div>',
                '<div class=leftArrowWrapper><div class=leftArrow></div></div>',
                '<div class=rightArrowWrapper><div class=rightArrow></div></div>',
                '<p class=chromeLabel>THIS IS A <br />CHROME EXPERIMENT</p>'
            ].join('\n');
            return code;

        },
        renderStatic:function () {
            var code = [
                '<div class=blackbg></div>',
                '<div class=info>',
                '<p class=desc_measurer></p>',
                '<div class=date><p></p></div>',
                '<div class=titleWrapper>',
                '<div id=one><h1></h1></div>',
                '<div id=two><h1></h1></div>',
                '</div>',
                '<div class=logoWrapper><div id="logoOne"></div><div id="logoTwo"></div></div>',
                '<div class=description><p></p></div>',
                '<div class=view><p class=view_top></p><p class=view_bottom></p></div>',
                '<div class=resp>',
                '<p class=respTitle></p>',
                '<ul>',
                '<li class="l0"><p></p></li>',
                '<li class="l1"><p></p></li>',
                '<li class="l2"><p></p></li>',
                '<li class="l3"><p></p></li>',
                '</ul>',
                '</div>',
                '</div>'
            ].join('\n');

            return code;
        },
        init:function () {
            //shortcuts
            this.el_be = $('.be');
            this.el_be_p = $('.be p');
            this.el_best = $('.best');
            this.el_best_p = $('.best p');
            this.el_description = $(".description");
            this.el_description_p = $(".description p");
            this.el_date = $(".date");
            this.el_date_p = $(".date p");
            this.el_intro = $('.intro');
            this.el_info = $('.info');
            this.el_introWrapper = $('.introWrapper');
            this.el_introClicker = $('.introClicker');
            this.el_introbg = $('.bg');
            this.el_introBgWrapper = $('.introBgWrapper');
            this.el_leftArrowWrapper = $('.leftArrowWrapper');
            this.el_leftArrow = $('.leftArrow');
            this.el_logoOne = $("#logoOne");
            this.el_logoTwo = $("#logoTwo");
            this.el_logoWrapper = $(".logoWrapper");
            this.el_l0p = $(".l0 p");
            this.el_l1p = $(".l1 p");
            this.el_l2p = $(".l2 p");
            this.el_l3p = $(".l3 p");
            this.el_me = $('.me');
            this.el_vegetation = $('.vegetation');
            this.el_vegetationWrapper = $('.vegetationWrapper');
            this.el_vegetation_p = $('.vegetation p');
            this.el_me_a = $('.me a.name');
            this.el_one = $("#one");
            this.el_one_h1 = $("#one h1");
            this.el_resp = $(".resp");
            this.el_respTitle = $(".respTitle");
            this.el_rightArrow = $('.rightArrow');
            this.el_rightArrowWrapper = $('.rightArrowWrapper');
            this.el_start = $('.start');
            this.el_two = $("#two");
            this.el_two_h1 = $("#two h1");
            this.el_blackbg = $(".blackbg");
            this.el_view = $(".view");
            this.el_view_p_top = $(".view_top");
            this.el_view_p_bottom = $(".view_bottom");
            this.el_desc_measurer = $(".desc_measurer");
            this.el_chrome = $(".chromeLabel");
            this.el_fblike = $(".fblike");


            if (navigator.userAgent.indexOf("Firefox") != -1) {
                this.el_blackbg.css({display:'block'});
            }

            this.el_leftArrowWrapper.hide();
            this.el_rightArrowWrapper.hide();

            this.el_leftArrowWrapper.mouseover(this.leftOver);
            this.el_rightArrowWrapper.mouseover(this.rightOver);

            this.el_leftArrowWrapper.click(this.leftArrowClick);
            this.el_rightArrowWrapper.click(this.rightArrowClick);

            this.el_me.mouseenter(this.meOver);
            this.el_me.mouseleave(this.meOut);

            this.el_view.mouseenter(this.viewOver);
            this.el_view.mouseleave(this.viewOut);
            this.el_view.click(this.viewClick);

            _.bindAll(this, 'enterFrame');
            this.enterFrame();

        },
        viewClick:function () {
            this.el_view_p_top.stop();
            this.el_view_p_bottom.stop();

            this.el_view_p_top.css({top:'0'});
            this.el_view_p_bottom.css({top:'24px'});

            window.open(this.viewurl,'_blank');
        },
        viewOver:function () {
            this.el_view_p_top.stop();
            this.el_view_p_bottom.stop();

            this.el_view_p_top.animate({top:'-24px'}, 200);
            this.el_view_p_bottom.animate({top:'0'}, 200);
        },
        viewOut:function () {
            this.el_view_p_top.stop();
            this.el_view_p_bottom.stop();

            this.el_view_p_top.animate({top:'0'}, 200);
            this.el_view_p_bottom.animate({top:'24px'}, 200);
        },
        setSize:function (width, height) {
            this.width = width;

            this.el_leftArrowWrapper.css({top:(height - this.arrowHeight) / 2 - this.infoHeight / 7 + 'px', left:this.sideMargin + 'px'});
            this.el_rightArrowWrapper.css({top:(height - this.arrowHeight) / 2 - this.infoHeight / 7 + 'px', left:width - this.sideMargin - this.arrowWidth + 'px'});

            this.el_blackbg.css({top:height - this.infoHeight - 30 + 'px', width:width + 'px'});
            this.el_vegetationWrapper.css({top:height - this.infoHeight + 111 + 'px', left:this.width - 147 + 'px'});

            this.el_me.css({top:height - this.infoHeight + 6 + 'px', left:this.sideMargin + 7 + 'px'});
            this.el_chrome.css({top:height - this.infoHeight + 146 + 'px', left:this.sideMargin - 12 + 'px'});

            this.el_info.css({top:height - this.infoHeight + 'px', left:(width - this.infoWidth) / 2 + 'px'});

            this.el_introWrapper.css({top:(height - this.introWrapperHeight) / 2 + 'px', left:(width - this.introWrapperWidth) / 2 + 'px'});
            this.el_best.css({top:(height - this.bestHeight) / 2 + 'px', left:width / 2 + 127 + 'px'});

            this.el_introBgWrapper.css({top:Math.round((height - this.introBgHeight) / 2) + 'px', left:Math.round((width - this.introBgWidth) / 2) + 'px'});
            this.el_introClicker.css({top:Math.round((height - this.introBgHeight) / 2) + 'px', left:Math.round((width - this.introBgWidth) / 2) + 'px'});
        },
        kickIt:function () {
            this.el_introClicker.mouseenter(this.introOver);
            this.el_introClicker.mouseleave(this.introOut);
            this.el_introClicker.mousedown(this.introClick);

            var animationPull = [
                {'id':this.el_be_p, 'string':'BORIS ETINGOF', time:1, tween:0, delay:0},
                {'id':this.el_best_p, 'string':'BEST OF 2008—2013', time:1, tween:0, delay:0}
            ];

            this.runAnimation(animationPull);
            this.el_chrome.fadeIn(400);
            this.el_fblike.css({left:37 + 'px'});
        },
        introClick:function () {
            this.el_introClicker.unbind();

            this.el_introBgWrapper.append('<img class=blur src="img/blur.jpg" width="200" height="200"><div class=dottedbg></div>');
            var blur = $('.blur');
            blur.css({width:'1px', height:'1px', top:'70px', left:'185px'});
            blur.animate({width:'500px', height:'500px', top:'-180px', left:'-65px'}, 300);
            this.el_start.fadeOut(200, null, this.removeIntro);
        },
        removeIntro:function () {
            this.el_intro.remove();
            this.el_vegetation.delay(1500).fadeIn(500);

            Router.toIntro();
        },
        introOver:function () {
            this.el_be.stop();
            this.el_start.stop();
            this.el_introbg.stop();
            this.el_best_p.stop();

            this.el_be.animate({'top':'-' + this.introWrapperHeight + 'px'}, 300);
            this.el_start.animate({'top':'0'}, 300);
            this.el_introbg.css({'left':'-650px'}, 300);
            this.el_introbg.animate({'left':'-140px'}, 300);
            this.el_best_p.animate({'top':this.bestHeight + 'px'}, 150);
        },
        introOut:function () {
            this.el_be.stop();
            this.el_start.stop();
            this.el_introbg.stop();
            this.el_best_p.stop();

            this.el_be.animate({'top':'0'}, 300);
            this.el_start.animate({'top':this.introWrapperHeight + 'px'}, 300);
            this.el_introbg.animate({'left':'370px'}, 300);
            this.el_best_p.animate({'top':0}, 300);
        },
        meOver:function () {
            if (this.meAnimation) TweenLite.killTweensOf(this.meAnimation);
            this.el_me.css({width:'170px'});
            this.meAnimation = {'id':this.el_me_a, 'string':'BORIS.ETINGOF@GMAIL.COM', time:1, tween:0, delay:0};
            this.animate(this.meAnimation);
        },
        meOut:function () {
            if (this.meAnimation) TweenLite.killTweensOf(this.meAnimation);
            this.el_me.css({width:'100px'});
            this.meAnimation = {'id':this.el_me_a, 'string':'BORIS ETINGOF', time:1, tween:0, delay:0};
            this.animate(this.meAnimation);
        },
        leftArrowClick:function () {
            Router.showPrevious();
        },
        rightArrowClick:function () {
            Router.showNext();
        },
        leftOver:function () {
            this.el_leftArrow.css({'left':'0'});
            this.el_leftArrow.animate({'left':'-' + this.arrowWidth * 2 + 'px'}, 300);
        },
        rightOver:function () {
            this.el_rightArrow.css({'right':'0'});
            this.el_rightArrow.animate({'right':'-' + this.arrowWidth * 2 + 'px'}, 300);
        },
        hideLeftArrow:function () {
            this.el_leftArrowWrapper.animate({'left':'-' + this.arrowWidth + 'px'}, 300, function () {
                $('.leftArrowWrapper').hide()
            });
        },
        hideRightArrow:function () {
            this.el_rightArrowWrapper.animate({'left':this.width + 'px'}, 300, function () {
                $('.rightArrowWrapper').hide()
            });
        },
        showLeftArrow:function () {
            this.el_leftArrowWrapper.css({'left':'-' + this.arrowWidth + 'px'});
            this.el_leftArrowWrapper.show();
            this.el_leftArrowWrapper.animate({left:this.sideMargin + 'px'}, 300);
        },
        showRightArrow:function () {
            this.el_rightArrowWrapper.css({'left':this.width + 'px'});
            this.el_rightArrowWrapper.show();
            this.el_rightArrowWrapper.animate({left:this.width - this.sideMargin - this.arrowWidth + 'px'}, 300);
        }

    });
    return InfoView;
});
