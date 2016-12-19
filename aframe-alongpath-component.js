/*

Testing http://jsbin.com/fifamun/edit?html,output

Example of syntax
          <a-entity
              id="sph"
              geometry="primitive:sphere; radius:0.5"
              material="color:red"
              position="0 0 -5"
              alongpath__0="path:0,0,-5 3,3,-10 5,-3,-10 0,0,-5; closed:false; dur:2000; debug:true; trigger:test1;"
              alongpath__1="path:0,0,-5 3,5,-3 5,5,-7 0,0,-3 0,0,-5; closed:false; dur:4000; trigger:test2;"></a-entity>
        </a-scene>

	setTimeout( function() { document.getElementById("sph").emit("test1"); } , 1000);
	setTimeout( function() { document.getElementById("sph").emit("test2"); } , 3000); 
*/


(function() {
'use strict';

var alongpathComp = {
  multiple: true,
  schema: {
    path     : { default: ''    },
    closed   : { default: false },
    dur      : { default: 1000  },
    trigger  : { default: ''    },
    debug    : { default: false },
    visualdebug    : { default: false },
  },

  init: function() {
      var closed = this.data.closed;
      var visualdebug = this.data.visualdebug;
      var debug = this.data.debug;
      if (debug) console.log("base component name: ", this.name,
                "; HTML attribute name: ", this.attrName,
                "; name of the instance: ", this.id,
                "; data: ", this.data);

      var attrName = this.attrName;
      var ent = this.el;
      var d = this.data;
      var trigger = this.data.trigger;
     //not the usual Aframe format... x0 y0 z0, x1 y1 z1
      var points = d.path.split(' ').map(function(p) {
          p = p.split(','); 
          return new THREE.Vector3(
              parseFloat(p[0]),
              parseFloat(p[1]),
              parseFloat(p[2])
          );
      });

      if (visualdebug){
	scene = document.querySelector('a-scene');
	var red = 50*Math.random();
	var green = 50*Math.random();
	var blue = 50*Math.random();
	console.log("debug color : ", red, green, blue);
	for (var p=0; p < points.length; p++){
		var debugPathPoint = document.createElement("a-torus");
		debugPathPoint.setAttribute("position",points[p]);
		//TODO fix : doesn't take into account the relative position of the element
		debugPathPoint.setAttribute("segments-tubular",8);
		debugPathPoint.setAttribute("scale","0.2 0.2 0.2");
		red += (250 - 50) / (points.length * 2);
		green += (250 - 50) / (points.length * 2);
		blue += (250 - 50) / (points.length * 2);
		var rgb = blue | (green << 8) | (red << 16);
		var hexcolor = '#' + (0x1000000 + rgb).toString(16).slice(1)
			debugPathPoint.setAttribute("material","color: " + hexcolor) + ";";
		scene.appendChild(debugPathPoint);
	}
		
      }
      var curve = new THREE['CatmullRomCurve3'](points);
      if (closed) curve.closed = true;
      var paused = (trigger.length>0) ? true : false;
      ent.addEventListener('pausingPath', function(e){
        // not that it WILL skip frames! 
        // pausing, unpausing is not straightforward since there can be 
        // several pauses that need to be added up to stay sync.
	      paused = true;
	      if (debug) console.log('pausing event caught');
	      });
      ent.addEventListener('unpausingPath', function(e){
	      paused = false;
	      if (debug) console.log('unpausing event caught');
	      onFrame();
	      });
      var startingNow = false;
      ent.addEventListener(trigger, function(e){
	      paused = false;
	      startingNow = true;
	      if (debug) console.log(trigger + " event caught for " + attrName + " of " + ent.id);
	      onFrame();
	      });
      var startingOffset = 0;
      var requestedAnimation = false;
      var onFrame = function onFrame(t) {
	      if (!paused){
		      if (startingNow && typeof t !== 'undefined'){
			      startingNow = false;
			      startingOffset = t;
		      }
		      requestedAnimation = window.requestAnimationFrame(onFrame);
		      t = (t - startingOffset) % d.dur;
		      var i = t / d.dur;
		      try {
			      var p = curve.getPoint(i);
			      ent.setAttribute('position', p);
				if ((!closed) && (i>0.99)){
					window.cancelAnimationFrame(requestedAnimation);
					if (debug) console.log('stopped animation ' + trigger + " for " + attrName + " of " + ent.id);
					// assume we don't loop anymore by default
				}
		      } catch (ex) {}
	      }
      };

      onFrame();

      ent.addEventListener('clearingPreviousPath', function(e){
	      if (debug) console.log('clearingPreviousPath event caught');
	      window.cancelAnimationFrame(requestedAnimation);
	      });

  },

  remove: function() {}
};

AFRAME.registerComponent('alongpath', alongpathComp);

})();
