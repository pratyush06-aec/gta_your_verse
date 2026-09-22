import React, { useEffect, useRef } from 'react';
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const Explore = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer;
    let pointLight, pointLight2;
    let controls;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    async function init() {
      if (!mountRef.current) return;

      camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
      camera.position.set( 0, 10, 40 );

      scene = new THREE.Scene();
      scene.add( new THREE.AmbientLight( 0x111122, 3 ) );

      function createLight( color ) {
        const intensity = 200;

        const light = new THREE.PointLight( color, intensity, 20 );
        light.castShadow = true;
        light.shadow.bias = - 0.005; 
        light.shadow.mapSize.setScalar( 128 );
        light.shadow.radius = 10;

        let geometry = new THREE.SphereGeometry( 0.3, 12, 6 );
        let material = new THREE.MeshBasicMaterial( { color: color } );
        material.color.multiplyScalar( intensity );
        let sphere = new THREE.Mesh( geometry, material );
        light.add( sphere );

        const texture = new THREE.CanvasTexture( generateTexture() );
        texture.magFilter = THREE.NearestFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set( 1, 4.5 );

        geometry = new THREE.SphereGeometry( 2, 32, 8 );
        material = new THREE.MeshPhongNodeMaterial( {
          side: THREE.DoubleSide,
          alphaMap: texture,
          alphaTest: 0.5
        } );

        sphere = new THREE.Mesh( geometry, material );
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        light.add( sphere );

        return light;
      }

      pointLight = createLight( 0x0088ff );
      scene.add( pointLight );

      pointLight2 = createLight( 0xff8888 );
      scene.add( pointLight2 );

      // Increased width of the room from 30 to 50
      const geometry = new THREE.BoxGeometry( 50, 30, 30 );

      const material = new THREE.MeshPhongNodeMaterial( {
        color: 0xa0adaf,
        shininess: 10,
        specular: 0x111111,
        side: THREE.BackSide
      } );

      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.y = 10;
      mesh.receiveShadow = true;
      scene.add( mesh );

      renderer = new THREE.WebGPURenderer( { antialias: true, alpha: true } );
      renderer.setPixelRatio( window.devicePixelRatio );
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.setAnimationLoop( animate );
      renderer.shadowMap.enabled = true;
      
      if (mountRef.current) {
        mountRef.current.appendChild( renderer.domElement );
      }

      await renderer.init();

      controls = new OrbitControls( camera, renderer.domElement );
      controls.target.set( 0, 10, 0 );
      controls.update();

      window.addEventListener( 'resize', onWindowResize );
      window.addEventListener( 'mousemove', onMouseMove );
    }

    function onWindowResize() {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
      }
    }

    function onMouseMove( event ) {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function generateTexture() {
      const canvas = document.createElement( 'canvas' );
      canvas.width = 2;
      canvas.height = 2;

      const context = canvas.getContext( '2d' );
      context.fillStyle = 'white';
      context.fillRect( 0, 1, 2, 1 );

      return canvas;
    }

    function animate() {
      let time = performance.now() * 0.001;

      targetX += (mouseX * 20 - targetX) * 0.05;
      targetY += (mouseY * 10 - targetY) * 0.05;

      if (pointLight) {
        pointLight.position.x = targetX + Math.sin( time * 0.6 ) * 10;
        pointLight.position.y = targetY + 6 + Math.sin( time * 0.7 ) * 9;
        pointLight.position.z = Math.sin( time * 0.8 ) * 9;
        pointLight.rotation.x = time;
        pointLight.rotation.z = time;
      }

      time += 10000;

      if (pointLight2) {
        pointLight2.position.x = targetX + Math.sin( time * 0.6 ) * 10;
        pointLight2.position.y = targetY + 6 + Math.sin( time * 0.7 ) * 9;
        pointLight2.position.z = Math.sin( time * 0.8 ) * 9;
        pointLight2.rotation.x = time;
        pointLight2.rotation.z = time;
      }

      if (renderer && scene && camera) {
        renderer.render( scene, camera );
      }
    }

    init();

    return () => {
      window.removeEventListener( 'resize', onWindowResize );
      if (renderer) {
        renderer.setAnimationLoop(null);
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      if (controls) controls.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <div 
        ref={mountRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          zIndex: 0
        }} 
      />
      
      {/* Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none', // Allow interacting with the 3D scene through the text
        color: 'white',
        textShadow: '0 4px 20px rgba(0,0,0,0.8)'
      }}>
        <h1 style={{ fontSize: '5rem', letterSpacing: '0.2em', margin: 0, fontWeight: 800 }}>EXPLORE</h1>
        <p style={{ fontSize: '1.5rem', letterSpacing: '0.1em', opacity: 0.8 }}>Discover the unknown</p>
      </div>
    </div>
  );
};

export default Explore;
