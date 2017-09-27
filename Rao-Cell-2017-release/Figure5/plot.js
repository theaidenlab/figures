$(document).ready(function() {

	var color_scale_1 = [
						"rgb(183,183,216)", 
						"rgb(134,173,134)", 
						"rgb(199,197,84)", 
						"rgb(190,121,78)",
						"rgb(204,126,123)",
						"rgb(234,84,85)"
						];
	var color_scale_2 = [
						"rgb(255,230,230)", 
						"rgb(255,204,204)", 
						"rgb(255,153,153)", 
						"rgb(255,128,128)",
						"rgb(255,77,77)",
						"rgb(255,26,26)"
						]

	var color_params_5d = [[0, 2, 3, 5, 6, 8, 9], color_scale_1,[1, 1, 1, 1, 1, 1]]
	var color_params_5e = [[0, 2, 4, 6, 8, 10, 12], color_scale_1,[1, 1, 1, 1, 1, 1]]
	var color_params_5c = [[0, 5, 10, 20, 50, 300, 10000], color_scale_2,[1, 1, 1, 1, 1, 1]]
	// plot_3d("https://theaidenlab.github.io/figures/Rao-Cell-2017-release/Figure5/data/treated_chr6_triples%2Bquads_without_close_1Mb.cube.txt", "5c_div", color_params_5c)
	plot_3d("https://theaidenlab.github.io/figures/Rao-Cell-2017-release/Figure5/data/treated_triples%2Bquads_without_close_intrachrom_3900000_300000.cube.txt", "5e_div", color_params_5e)
	plot_3d("https://theaidenlab.github.io/figures/Rao-Cell-2017-release/Figure5/data/untreated_triples%2Bquads_without_close_intrachrom_3900000_300000.cube.txt", "5d_div", color_params_5d)


	function plot_3d(file_url, container_area, color_params){
		var container;
		var camera, controls, scene, renderer;
		var resourceContent;
		var isLargeFile;

		if (file_url == "https://theaidenlab.github.io/figures/Rao-Cell-2017-release/Figure5/data/treated_chr6_triples%2Bquads_without_close_1Mb.cube.txt"){
			isLargeFile = true
		}else{
			isLargeFile = false
		}

		$.ajax({
	        url: file_url,
	        async: false,   
	        cache: false,   
	        success: function( data, textStatus, jqXHR ) {
	            resourceContent = data; 

	        }
    	});
	    

    	var cube_coordinates = [];
	    var cube_count = [];
	    var max_dimension = 0;
		try {				
    		
    		var lines = resourceContent.split('\n');
	        var length = lines.length;
	    
	        for(var i = 0; i < length-1; i++){
	    		var parts = lines[i].split("	")
				var a = parseInt(parts[0])
	    		var b = parseInt(parts[1])
	    		var c = parseInt(parts[2])
				const coordinate = [a, b, c]
				if (a > max_dimension){max_dimension = a}
				if (b > max_dimension){max_dimension = b}
				if (c > max_dimension){max_dimension = c}
				cube_coordinates.push(coordinate)
	            cube_count.push(parseInt(parts[3]))
			}
	    }
	    
	    catch(err) {
	    	$("#invalid_file_warning").css("display", "block");
	    	return;
	    }
		
	    init(color_params, cube_coordinates, cube_count, max_dimension, container_area);
		animate();


		function init(color_params, cube_coordinates, cube_count, max, container_area) {

			//set up the scene, camera and light for the visualization
			container = document.getElementById(container_area);

			camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.z = 1000;
			scene = new THREE.Scene();
			//scene.add( new THREE.AmbientLight( 0x555555 ) );
			var light = new THREE.SpotLight( 0xffffff, 1 );
			light.position.set( 0, 500, 2000 );
			scene.add( light );
			var geometry = new THREE.Geometry(),
			materials = [];
			defaultMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors, shininess: 0	} );

			var mid_offset = Math.floor(max/2);
			var scale_val = Math.floor(600/max);
			var geom = new THREE.BoxGeometry( 1, 1, 1 );
			var matrix = new THREE.Matrix4();
			var quaternion = new THREE.Quaternion();
			var material_idx = 0;
			for ( var i = 0; i < cube_count.length; i ++ ) {
				var position = new THREE.Vector3();
				position.x = (cube_coordinates[i][0]-mid_offset) * scale_val;
				position.y = (cube_coordinates[i][1]-mid_offset) * scale_val;
				position.z = (cube_coordinates[i][2]-mid_offset) * scale_val;

				var scale = new THREE.Vector3();
				scale.x = scale_val;
				scale.y = scale_val;
				scale.z = scale_val;
				matrix.compose( position, quaternion, scale );

				var color_str;
				var opacity_val;
				var color_range = color_params[0];
				var colors = color_params[1];
				var opacity = color_params[2];
				for (j = 0; j < color_range.length; j++){
						if (color_range[j] >= (cube_count[i])){
							color_str = colors[j-1];
							break;
						}
					}
				function applyVertexColors( g, c ) {
						g.faces.forEach( function( f ) {
							var n = ( f instanceof THREE.Face3 ) ? 3 : 4;
							for( var j = 0; j < n; j ++ ) {
								f.vertexColors[ j ] = c;
							}
						} );
					}
				var geom_color = new THREE.Color(color_str)
				if (isLargeFile){
					applyVertexColors( geom, geom_color );
					geometry.merge( geom, matrix);
				} else {
					var scale_end = color_range[color_range.length-1]
					opacity_val = Math.min(0.454, (parseInt((cube_count[i]-1)/(scale_end/6))*0.2)+0.1);
					var geo_material = new THREE.MeshBasicMaterial({ color: geom_color, transparent:true, depthWrite: false, depthTest: false, opacity: opacity_val});
					for ( var idx = 0; idx < 6; idx ++ ) {
						material_idx = material_idx + 1
						materials.push(geo_material)
					}

					geometry.merge( geom, matrix, material_idx-6);
				}
			
			}

			if (isLargeFile){
				var drawnObject = new THREE.Mesh( geometry, defaultMaterial );
			} else {
				var drawnObject = new THREE.Mesh( geometry, new THREE.MultiMaterial(materials) );
			}
			scene.add( drawnObject );
			var gridXZ = new THREE.GridHelper((max+1) * scale_val, max+1);
			// gridXZ.setColors( new THREE.Color(0x006600), new THREE.Color(0x006600) );
			gridXZ.position.set( 0,-((max+1) * scale_val)/2 ,0 );
			scene.add(gridXZ);
			
			var gridXY = new THREE.GridHelper((max+1) * scale_val, max+1);
			gridXY.position.set( 0,0,-((max+1) * scale_val)/2 );
			gridXY.rotation.x = Math.PI/2;
			// gridXY.setColors( new THREE.Color(0x000066), new THREE.Color(0x000066) );
			scene.add(gridXY);
			
			var gridYZ = new THREE.GridHelper((max+1) * scale_val, max+1);
			gridYZ.position.set( -((max+1) * scale_val)/2,0,0 );
			gridYZ.rotation.z = Math.PI/2;
			// gridYZ.setColors( new THREE.Color(0x660000), new THREE.Color(0x660000) );
			scene.add(gridYZ);

			//adding axes label to the grid
			var labels = ['-1.95Mb', "0", '+1.95Mb'];

			var x_axis = makeTextSprite("Up", "rgb(128, 0, 0)");
				x_axis.position.set(6*scale_val-((max-2) * scale_val)/2, -((max+4) * scale_val)/2, ((max+1) * scale_val)/2);
				scene.add( x_axis );
			for (idx = 0; idx< 3; idx++){
				var spritey = makeTextSprite(labels[idx], "rgb(128, 0, 0)");
				spritey.position.set(idx*6*scale_val-((max-2) * scale_val)/2, -((max+2) * scale_val)/2, ((max+1) * scale_val)/2);
				scene.add( spritey );
			};

			var y_axis = makeTextSprite("Middle", "rgb(0, 0, 179)");
				y_axis.position.set(-(max * scale_val)/2, 5*scale_val-(max * scale_val)/2, ((max+2) * scale_val)/2);
				scene.add(y_axis);
			for (idx = 0; idx< 3; idx++){
				var label1 = makeTextSprite(labels[idx], "rgb(0, 0, 179)");
				label1.position.set(-(max * scale_val)/2, idx*6*scale_val-(max * scale_val)/2, ((max+2) * scale_val)/2);
				scene.add(label1);
			}

			var z_axis = makeTextSprite("Down", "rgb(45, 134, 89)");
				z_axis.position.set(((max+3) * scale_val)/2, -((max+4) * scale_val)/2, -6*scale_val+((max-1)* scale_val)/2);
				scene.add(z_axis);
			for (idx = 0; idx< 3; idx++){
				var spritey = makeTextSprite(labels[idx], "rgb(45, 134, 89)");
				spritey.position.set(((max+3) * scale_val)/2, -((max+2) * scale_val)/2, -idx*6*scale_val+((max-1)* scale_val)/2);
				scene.add( spritey );
			};

			renderer = new THREE.WebGLRenderer( { antialias: true } );
			var bg_color = new THREE.Color("rgb(242, 242, 242)")
			renderer.setClearColor( bg_color );
			renderer.setPixelRatio( window.devicePixelRatio );
			var height = $(window).height();//gets height from device
			var width = $(window).width(); //gets width from device
			renderer.setSize( 0.6 * window.innerWidth, 0.7 * window.innerHeight);
			renderer.sortObjects = false;
			container.appendChild( renderer.domElement );

			window.addEventListener( 'resize', onWindowResize, false );

			function onWindowResize(){

			    camera.aspect = (0.6 * window.innerWidth) / (0.7 * window.innerHeight);
			    camera.updateProjectionMatrix();

			    renderer.setSize( 0.6 * window.innerWidth, 0.7 * window.innerHeight );

			}

			controls = new THREE.TrackballControls( camera, renderer.domElement );
			controls.rotateSpeed = 1.0;
			controls.zoomSpeed = 1.2;
			controls.panSpeed = 0.8;
			controls.noZoom = false;
			controls.noPan = false;
			controls.staticMoving = true;
			controls.dynamicDampingFactor = 0.3;
		}



		function animate() {
			requestAnimationFrame( animate );
			render();
		}

		function render() {
			controls.update();
			renderer.render( scene, camera );
			
		}
	}

	function makeTextSprite(message, color) {
	  var fontface = 'Helvetica';
	  var fontsize = 70;
	  var canvas = document.createElement('canvas');
	  var context = canvas.getContext('2d');
	  context.font = fontsize + "px " + fontface;

	  // get size data (height depends only on font size)
	  var metrics = context.measureText(message);
	  var textWidth = metrics.width;

	  // text color
	  context.fillStyle = color;
	  context.fillText(message, 0, fontsize);

	  // canvas contents will be used for a texture
	  var texture = new THREE.Texture(canvas)
	  texture.minFilter = THREE.LinearFilter;
	  texture.needsUpdate = true;

	  var spriteMaterial = new THREE.SpriteMaterial({
	      map: texture,
	      useScreenCoordinates: false
	  });
	  var sprite = new THREE.Sprite(spriteMaterial);
	  sprite.scale.set(100, 50, 1.0);
	  return sprite;
	}

})
