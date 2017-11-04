// TODO fetch data properly
//fetch('./out.json').then(response => response.json()).then(defineComponents);
function defineComponents(TEST_DATA) {
	/**
	 * Path following component
	 */
	AFRAME.registerComponent('onpath', {
	  tick: function (time, timedelta) {
			let point = TEST_DATA[this.currentpoint];
			point.duration = .5;
		
			this.delta += timedelta;
			this.heartdelta += timedelta;
			if (this.heartdelta > (60/point.bpm)*1000) {
				let heart = this.el.querySelector('#heart');
				heart.emit("heart0");
				this.heartdelta = 0;
			}
			if(this.delta >= point.duration*1000) {
				let s = this.el.querySelector('#status');
				s.setAttribute("text", "value:" + "BPM: " + point.bpm + "\tElevation: "+ Math.round(point.y*100)/100.0 + " m");
				this.delta = 0;
				this.currentpoint += 1;
				if (this.currentpoint >= TEST_DATA.length) {
					this.currentpoint = 0;
					this.prevPoint = {"x": 0, "y": 0, "z": 0};
					this.el.setAttribute("position", "0 0 0");
					return;
				}
				this.prevPoint = {"x": point.x, "y": point.y, "z": point.z}
				this.el.setAttribute("position", {"x": point.x, "y": point.y, "z": point.z});
				return;
			}
		
			// Update position to move towards next point at set speed.
			let position = this.el.getAttribute("position");
			let newpos = {
				"x": position.x + timedelta*((point.x - this.prevPoint.x)/(point.duration*1000)),
				"y": position.y + timedelta*((point.y - this.prevPoint.y)/(point.duration*1000)),
				"z": position.z + timedelta*((point.z - this.prevPoint.z)/(point.duration*1000))
			}
			this.el.setAttribute("position", newpos);
	  },
	
		init: function () {
			this.currentpoint = 1610;
			this.delta = 0;
			this.prevPoint = TEST_DATA[1610];
			this.heartdelta = 0;
		}
	});

	/**
	 * Path creation component
	 */
	AFRAME.registerComponent('roadway', {
		init: function() {
			let zanchor = 4;
			let width = 3;
			let point = {"x": 0, "y": 0, "z": 0};
			for (i = 0; i < TEST_DATA.length; i++) {
				let next = TEST_DATA[i];
				console.log(next);
				let v = new THREE.Vector3(point.x - next.x, point.y - next.y, point.z - next.z);
				v.cross(new THREE.Vector3(0, 1, 0));
				// TODO Check for zero vector (vertical movement)
				v.normalize();
			
				v.multiplyScalar(width/2);
			
				let v0 = new THREE.Vector3(point.x + v.x, point.y + v.y, point.z + v.z);
				let v1 = new THREE.Vector3(point.x - v.x, point.y - v.y, point.z - v.z);
				let v2 = new THREE.Vector3(next.x - v.x, next.y - v.y, next.z - v.z);
				let v3 = new THREE.Vector3(next.x + v.x, next.y + v.y, next.z + v.z);
			
				var geometry = new THREE.Geometry();
				geometry.vertices.push(v0, v1, v2, v3);
				geometry.faces.push( new THREE.Face3( 0, 1, 3 ) );
				geometry.faces.push( new THREE.Face3( 1, 2, 3 ) );
				geometry.faces.push( new THREE.Face3( 3,1,0 ) );
				geometry.faces.push( new THREE.Face3( 3,2,1 ) );
				geometry.elementsNeedUpdate = true;
				

				var material = new THREE.MeshBasicMaterial( {color: 0x00000 + (0xffFFFF/TEST_DATA.length)*i} );
				var mesh = new THREE.Mesh( geometry, material );
				this.el.setObject3D("yeah" + i, mesh);
			
				point = next;
			}
		}
	});

	function createPlane(position, rotation) {
		var el = document.createElement('a-plane');
		el.setAttribute("color", "#FF0000");
		el.setAttribute("width", 1);
		el.setAttribute("height", 1);
		el.setAttribute("position", position);
		el.setAttribute("rotation", rotation);
		return el;
	}
}

defineComponents(TEST_DATA);