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
