/**
 * Created by: Boris Etingof | boris.etingof@gmail.com | sixtyfps.com.au
 */

var step = 5,
    percTotal= 0,
    queue,
    prefix,
    preloader, counterInnerSmallLeft, counterInnerSmallRight, counterInnerLarge, fileTitle, fileProgress,
    currentTitle='',
    currentTitleStr='',
    currentTitleIndex=0;

window.onload = function(event){
    if (!Detector.webgl) {
        Detector.addGetWebGLMessage();
    }
    else {
        buildCounters();
        window.onresize = resize;
        resize(null);
        setCounters(0);
        setTimeout(showAndLoad, 1000);
    }
}

function showAndLoad(){
    load();
    preloader.style.opacity = 1;
}

function buildCounters(){
    document.getElementById('counterSmallLeft').innerHTML = create100ElList('small', 'counterInnerSmallLeft');
    document.getElementById('counterSmallRight').innerHTML = create100ElList('small', 'counterInnerSmallRight');
    document.getElementById('counterLarge').innerHTML = create100ElList('large', 'counterInnerLarge');

    preloader = document.getElementById('preloader');
    counterInnerSmallLeft = document.getElementById('counterInnerSmallLeft');
    counterInnerSmallRight = document.getElementById('counterInnerSmallRight');
    counterInnerLarge = document.getElementById('counterInnerLarge');
    fileTitle = document.getElementById('fileTitle');
    fileProgress = document.getElementById('fileProgress');

    if('WebkitTransform' in counterInnerSmallLeft.style) {
        prefix = 'WebkitTransform';
    }
    else if('MozTransform' in counterInnerSmallLeft.style){
        prefix = 'MozTransform';
    }
    else{
        prefix = 'transform';
    }

}
function create100ElList(size, id){
    var str='<ul id="' + id + '" class="progress-list ' + size + '">';
    var num= '';
    for(var i=0; i<101; i+=step){
        num = (i<10) ? '0' + i : i;
        str += '<li>' + num + '</li>';
    }
    str+='</ul>';
    return str;
}
function resize(event){
    var width = (window.innerWidth < 1100) ? 1100 : window.innerWidth;
    var height = (window.innerHeight < 600) ? 600 : window.innerHeight;
    preloader.style.left =  Math.round(width/2) + 'px';
    preloader.style.top =  Math.round(height/2) + 'px';
}

function load(){
    queue = new createjs.LoadQueue();
    queue.onComplete = onComplete;
    queue.onProgress = onProgress;
    queue.onFileProgress = onFileProgress;
    queue.loadManifest([
        {title: "Raphael JS", id: "raphael", src:"js/libs/raphael/raphael-min.js"},
        {title: "Cuprum Regular JS", id: "CuprumRegular_400", src:"js/libs/fonts/CuprumRegular_400.font.js"},
        {title: "Three JS", id: "three", src:"js/libs/three/three.min.js"},
        {title: "Convolution Shader JS", id: "ConvolutionShader", src:"js/libs/three/shaders/ConvolutionShader.js"},
        {title: "Copy Shader JS", id: "CopyShader", src:"js/libs/three/shaders/CopyShader.js"},
        {title: "Vignette Shader JS", id: "VignetteShader", src:"js/libs/three/shaders/VignetteShader.js"},
        {title: "Effect Composer JS", id: "EffectComposer", src:"js/libs/three/postprocessing/EffectComposer.js"},
        {title: "Mask Pass", id: "MaskPass", src:"js/libs/three/postprocessing/MaskPass.js"},
        {title: "Render Pass JS", id: "RenderPass", src:"js/libs/three/postprocessing/RenderPass.js"},
        {title: "Shader Pass JS", id: "ShaderPass", src:"js/libs/three/postprocessing/ShaderPass.js"},
        {title: "Bloom Pass JS", id: "BloomPass", src:"js/libs/three/postprocessing/BloomPass.js"},
        {title: "Main JS", id:"ignore", src:"js/main.js"},
        {title: "App JS", id:"ignore", src:"js/app.js"},
        {title: "jQuery JS", id:"ignore", src:"js/libs/jquery/jquery-min.js"},
        {title: "Underscore JS", id:"ignore", src:"js/libs/underscore/underscore-min.js"},
        {title: "Markerview JS", id:"ignore", src:"js/views/markerview.js"},
        {title: "Threejsview JS", id:"ignore", src:"js/views/threejsview.js"},
        {title: "Navitemview JS", id:"ignore", src:"js/views/navitemview.js"},
        {title: "Backbone JS", id:"ignore", src:"js/libs/backbone/backbone-optamd3-min.js"},
        {title: "Infoview JS", id:"ignore", src:"js/views/infoview.js"},
        {title: "Linesmodel JS", id:"ignore", src:"js/models/linesmodel.js"},
        {title: "Navitemmodel JS", id:"ignore", src:"js/models/navitemmodel.js"},
        {title: "Cameramodel JS", id:"ignore", src:"js/models/cameramodel.js"},
        {title: "Markermodel JS", id:"ignore", src:"js/models/markermodel.js"},
        {title: "Infomodel JS", id:"ignore", src:"js/models/infomodel.js"},
        {title: "Markerscollection JS", id:"ignore", src:"js/collections/markerscollection.js"},
        {title: "Navitemscollection JS", id:"ignore", src:"js/collections/navitemscollection.js"},
        {title: "Router JS", id:"ignore", src:"js/router.js"},
        {title: "Stats JS", id:"ignore", src:"js/libs/utils/Stats.js"},
        {title: "TweenLite JS", id:"ignore", src:"js/libs/gsap/TweenLite.min.js"},
        {title: "BezierPlugin JS", id:"ignore", src:"js/libs/gsap/plugins/BezierPlugin.min.js"},
        {title: "Circle PNG", id:"ignore", src:"img/circle.png"},
        {title: "Blur PNG", id:"ignore", src:"img/blur.jpg"},
        {title: "Dottedbg PNG", id:"ignore", src:"img/dottedbg.png"},
        {title: "Chrome GIF", id:"ignore", src:"img/chrome.gif"},
        {title: "Require JS", id:"require", src:"js/libs/require/require.js"}
    ]);
}

function onProgress(event){
    var progress =  Math.round(event.loaded * 100);
    setCounters(progress);
}

function onFileProgress(event) {
    if(currentTitle != event.item.title){
        currentTitle = event.item.title;
        currentTitleStr += '<br/>' + currentTitle;
        fileTitle.innerHTML = currentTitleStr;
        currentTitleIndex++;
        fileTitle.style[prefix] = "translateY(" + (-currentTitleIndex*23) + "px)";
    }

    fileProgress.style.width = 280 * event.loaded + 'px';
}

function onComplete(event) {
    setCounters(100);
    setTimeout(run, 500);
}
function setCounters(progress){
    counterInnerSmallLeft.style[prefix] = "translateX(" + (-progress*100/step + 100) + "px)";
    counterInnerSmallRight.style[prefix] = "translateX(" + (-progress*100/step - 70) + "px)";
    if(percTotal != Math.round(progress/step)){
        percTotal = Math.round(progress/step);
        counterInnerLarge.style[prefix] = "translateX(" + (-percTotal*68) + "px)";
    }
}
function run(){
    var so = queue._scriptOrder;
    var results =  queue._loadedResults;
    var id;
    results['require'].setAttribute("data-main", "js/main");
    for(var i=0; i<so.length; i++){
        id =  so[i]['id'];
        if(id!='ignore'){
            document.body.appendChild(results[id]);
        }
    }
    window.onresize = null;
    queue.onProgress = null;
    queue.onFileProgress = null;
    queue.onComplete = null;
    queue.removeAll();
    queue.close();
    queue = null;
    preloader.parentNode.removeChild(preloader);
}

