/**
 * @author alteredq / http://alteredqualia.com/
 * @author mr.doob / http://mrdoob.com/
 */

var Detector = {

	canvas: !! window.CanvasRenderingContext2D,
	webgl: ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )(),
	workers: !! window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,

	getWebGLErrorMessage: function () {

		var element = document.createElement( 'div' );
		element.id = 'webgl-error-message';
		element.style.fontFamily = 'Cuprum';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'left';
		element.style.background = '#000';
		element.style.color = '#fff';
		element.style.padding = '1.5em';
		element.style.width = '350px';
		element.style.margin = '10px 0 0';

		if ( ! this.webgl ) {

			element.innerHTML = [
				'SIXTYFPS.COM.AU <br /><br /><br />',
                '<p style="background-color: #fff; color: #000000; padding: 0 5px">THIS WEBSITE HEAVILY RELIES ON WEBGL AND GPU ACCELERATION.</p><br /><br />',
                'PLEASE USE <a href="https://www.google.com/intl/en_uk/chrome/browser/" style="color:#fff">GOOGLE CHROME</a> TO VIEW IT AND MAKE SURE YOUR GRAPHICS CARD SUPPORTS <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#fff">WEBGL</a>.<br />'
				//'FIND OUT HOW TO GET IT <a href="http://get.webgl.org/" style="color:#fff">HERE</a>.'
			].join( '\n' );

		}

		return element;

	},

	addGetWebGLMessage: function ( parameters ) {

		var parent, id, element;

		parameters = parameters || {};

		parent = parameters.parent !== undefined ? parameters.parent : document.body;
		id = parameters.id !== undefined ? parameters.id : 'oldie';

		element = Detector.getWebGLErrorMessage();
		element.id = id;

		parent.appendChild( element );

	}

};
