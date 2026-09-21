import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import * as THREE from 'three/webgpu';
import { color, lights } from 'three/tsl';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './About.css';

class CustomLightingModel extends THREE.LightingModel {
  direct({ lightColor, reflectedLight }) {
    reflectedLight.directDiffuse.addAssign(lightColor);
  }
}

const About = () => {
  const headlineRef = useRef(null);
  const containerRef = useRef(null);

  // Text Animation Effect
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!headlineRef.current) return;
      gsap.set(headlineRef.current, { opacity: 1 });
      const headlineSplit = new SplitType(headlineRef.current, {
        types: 'words',
        wordClass: 'word'
      });
      gsap.from(headlineSplit.words, {
        y: -100,
        opacity: 0,
        rotation: "random(-80, 80)",
        stagger: 0.1,
        duration: 1,
        ease: "back"
      });
    });
  }, []);

  // Three.js Background Effect
  useEffect(() => {
    if (!containerRef.current) return;

    let camera, scene, renderer;
    let light1, light2, light3;

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.z = 1.5;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const sphereGeometry = new THREE.SphereGeometry(0.02, 16, 8);

    const addLight = (hexColor) => {
      const material = new THREE.NodeMaterial();
      material.colorNode = color(hexColor);
      material.lightsNode = lights(); // ignore scene lights

      const mesh = new THREE.Mesh(sphereGeometry, material);
      const light = new THREE.PointLight(hexColor, 0.1, 1);
      light.add(mesh);
      scene.add(light);
      return light;
    };

    light1 = addLight(0xffaa00);
    light2 = addLight(0x0040ff);
    light3 = addLight(0x80ff80);

    const allLightsNode = lights([light1, light2, light3]);

    const points = [];
    for (let i = 0; i < 500000; i++) {
      const point = new THREE.Vector3().random().subScalar(0.5).multiplyScalar(3);
      points.push(point);
    }

    const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
    const materialPoints = new THREE.PointsNodeMaterial();

    const lightingModel = new CustomLightingModel();
    const lightingModelContext = allLightsNode.context({ lightingModel });

    materialPoints.lightsNode = lightingModelContext;

    const pointCloud = new THREE.Points(geometryPoints, materialPoints);
    scene.add(pointCloud);

    renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0;
    controls.maxDistance = 4;

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      const time = Date.now() * 0.001;
      const scale = 0.5;

      light1.position.x = Math.sin(time * 0.7) * scale;
      light1.position.y = Math.cos(time * 0.5) * scale;
      light1.position.z = Math.cos(time * 0.3) * scale;

      light2.position.x = Math.cos(time * 0.3) * scale;
      light2.position.y = Math.sin(time * 0.5) * scale;
      light2.position.z = Math.sin(time * 0.7) * scale;

      light3.position.x = Math.sin(time * 0.7) * scale;
      light3.position.y = Math.cos(time * 0.3) * scale;
      light3.position.z = Math.sin(time * 0.5) * scale;

      scene.rotation.y = time * 0.1;
      renderer.render(scene, camera);
    };

    renderer.setAnimationLoop(animate);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.setAnimationLoop(null);
      if (renderer && renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      if (renderer && typeof renderer.dispose === 'function') {
        renderer.dispose();
      }
      geometryPoints.dispose();
      materialPoints.dispose();
      sphereGeometry.dispose();
    };
  }, []);

  return (
    <div className="about-page">
      <div 
        ref={containerRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: -1,
          overflow: 'hidden'
        }} 
      />
      <div className="container" style={{ pointerEvents: 'none' }}>
        <h2 ref={headlineRef}>
          Welcome to your verse, where you can recreate the scenerios, the moments, the profiles according to your taste
        </h2>
      </div>
    </div>
  );
};

export default About;
