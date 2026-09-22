import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import SplitType from 'split-type';
import { Flip } from 'gsap/Flip';
import { IoArrowBack } from 'react-icons/io5';
import { FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';

import franklinImg from '../../assets/Franklin.png';
import lamarImg from '../../assets/Lamar.png';
import michaelImg from '../../assets/Michael.png';
import trevorImg from '../../assets/Trevor.png';
import mapImg from '../../assets/map.jpg';
import nightLifeImg from '../../assets/night_life.jpg';
import ImageEditor from '@unlayer/react-image-editor';
import EditorSidebar, { TOOL_NAMES } from './EditorSidebar';

gsap.registerPlugin(Flip);

const Explore = ({ isPlaying, togglePlay }) => {
  const mountRef = useRef(null);
  const textRef = useRef(null);
  const [showCards, setShowCards] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);

  // Editor Sidebar state
  const [theme, setTheme] = useState('dark');
  const [locale, setLocale] = useState('en');
  const [dock, setDock] = useState('right');
  const [tools, setTools] = useState(() => 
    Object.fromEntries(TOOL_NAMES.map((tool) => [tool, true]))
  );
  const [currentImage, setCurrentImage] = useState(null);
  const editorRef = useRef(null);

  const cardsData = [
    { 
      title: "Enhance your character", image: lamarImg, seedImage: lamarImg,
      defaultTools: { crop: true, filter: true, text: true, draw: true, stickers: true, frame: true, resize: false, shapes: false }
    },
    { 
      title: "Live your night life", image: michaelImg, seedImage: nightLifeImg,
      defaultTools: { crop: true, filter: true, text: true, shapes: true, stickers: true, frame: true, resize: false, draw: false }
    },
    { 
      title: "Craft your Socials", image: trevorImg, seedImage: trevorImg,
      defaultTools: { crop: true, filter: true, text: true, stickers: true, frame: true, resize: false, draw: false, shapes: false }
    },
    { 
      title: "Customize your map", image: franklinImg, seedImage: mapImg,
      defaultTools: { crop: true, draw: true, text: true, shapes: true, stickers: true, resize: false, filter: false, frame: false }
    }
  ];

  const handleCardClick = (index) => {
    if (activeCard !== null) return;
    const state = Flip.getState(".card");
    flushSync(() => {
      setActiveCard(index);
      setCurrentImage(cardsData[index].seedImage);
      setTools(cardsData[index].defaultTools);
    });
    window.dispatchEvent(new CustomEvent('footer-visible', { detail: true }));
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      absolute: true,
      zIndex: 50
    });
  };

  const handleBackClick = (e) => {
    e.stopPropagation();
    const state = Flip.getState(".card");
    flushSync(() => {
      setActiveCard(null);
    });
    window.dispatchEvent(new CustomEvent('footer-visible', { detail: false }));
    Flip.from(state, {
      duration: 0.6,
      ease: "power2.inOut",
      absolute: true,
      zIndex: 50
    });
  };

  useEffect(() => {
    if (!textRef.current) return;

    // Split text into characters
    const split = new SplitType(textRef.current, { types: 'chars' });

    // Initial state: hidden and slightly below
    gsap.set(split.chars, { opacity: 0, y: 50 });

    const tl = gsap.timeline();

    // Animate in character by character
    tl.to(split.chars, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out"
    })
    // Wait for 1.5 seconds, then disappear
    .to(split.chars, {
      opacity: 0,
      y: -50,
      duration: 0.8,
      stagger: 0.02,
      ease: "power3.in",
      delay: 1.5,
      onComplete: () => {
        setShowCards(true);
      }
    });

    return () => {
      tl.kill();
      split.revert();
    };
  }, []);

  useEffect(() => {
    if (showCards) {
      // Animate the cards entering the screen
      gsap.fromTo(
        ".card",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, [showCards]);

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
        pointerEvents: showCards ? 'auto' : 'none', // Allow interacting with cards
        color: 'white',
        textShadow: '0 4px 20px rgba(0,0,0,0.8)'
      }}>
        {!showCards && (
          <h1 ref={textRef} style={{ fontSize: '5rem', letterSpacing: '0.1em', margin: 0, fontWeight: 800, textAlign: 'center', textTransform: 'uppercase' }}>
            Visualize Your Taste
          </h1>
        )}

        {showCards && (
          <div className="cards-container">
            {cardsData.map((card, index) => {
              const isActive = activeCard === index;
              const isHidden = activeCard !== null && activeCard !== index;

              return (
                <div 
                  key={index} 
                  className={`card ${isActive ? 'full-screen' : ''}`}
                  onClick={() => isActive ? null : handleCardClick(index)}
                  style={{ 
                    opacity: isHidden ? 0 : 1,
                    pointerEvents: isHidden ? 'none' : 'auto'
                  }}
                >
                  <img className="card-bg" src={card.image} alt={card.title} />

                  {isActive ? (
                    <div className="card-inner-expanded">
                      {/* Standard floating buttons when not maximized */}
                      <div style={{ 
                        position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '1.5rem', zIndex: 60, 
                        opacity: isEditorMaximized ? 0 : 1, pointerEvents: isEditorMaximized ? 'none' : 'auto', transition: 'all 0.3s ease' 
                      }}>
                        <button className="back-btn" style={{ position: 'relative', top: 0, left: 0 }} onClick={handleBackClick}>
                          <IoArrowBack size={30} />
                        </button>
                        <button className="back-btn" style={{ position: 'relative', top: 0, left: 0 }} onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                          {isPlaying ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
                        </button>
                        <button className="back-btn" style={{ position: 'relative', top: 0, left: 0 }} onClick={(e) => { e.stopPropagation(); setIsEditorMaximized(true); }}>
                          <FaExpand size={24} />
                        </button>
                      </div>

                      {/* Small minimize button when maximized */}
                      <button 
                        style={{ 
                          position: 'absolute', top: '12px', left: '150px', width: '32px', height: '32px', zIndex: 70,
                          opacity: isEditorMaximized ? 1 : 0, pointerEvents: isEditorMaximized ? 'auto' : 'none', transition: 'all 0.3s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#a0a0a0', cursor: 'pointer'
                        }} 
                        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}
                        onClick={(e) => { e.stopPropagation(); setIsEditorMaximized(false); }}
                      >
                        <FaCompress size={18} />
                      </button>

                      <div className="editor-container" style={{ 
                        position: 'absolute', 
                        inset: isEditorMaximized ? '0' : '120px 20px 20px 20px', 
                        zIndex: 50, 
                        borderRadius: isEditorMaximized ? '0' : '20px', 
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'row',
                        background: 'rgba(11, 15, 25, 0.9)',
                      }}>
                        <EditorSidebar 
                          theme={theme}
                          onThemeChange={setTheme}
                          locale={locale}
                          onLocaleChange={setLocale}
                          dock={dock}
                          onDockChange={setDock}
                          tools={tools}
                          onToolToggle={(tool) => setTools((prev) => ({ ...prev, [tool]: !prev[tool] }))}
                          onResetImage={() => setCurrentImage(card.seedImage)}
                          onUploadImage={(file) => {
                            const reader = new FileReader();
                            reader.onload = () => setCurrentImage(reader.result);
                            reader.readAsDataURL(file);
                          }}
                        />
                        <ImageEditor
                          ref={editorRef}
                          image={currentImage || card.seedImage}
                          options={{ 
                            theme,
                            locale,
                            features: { imageEditor: { dock, tools } }
                          }}
                          style={{ flex: 1, width: '100%', height: '100%', minHeight: '100%' }}
                          onSave={({ dataUrl }) => {
                            setPreviewImage(dataUrl);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <h3 className="card-title">{card.title}</h3>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewImage && (
        <div className="preview-overlay">
          <img src={previewImage} alt="Preview" style={{ maxWidth: '90%', maxHeight: '75vh', borderRadius: '15px', objectFit: 'contain', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} />
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <a 
              href={previewImage} 
              download="gta_verse_custom.png" 
              className="action-btn download-btn"
            >
              Download
            </a>
            <button 
              className="action-btn back-btn-alt" 
              onClick={() => setPreviewImage(null)}
            >
              Back to Editor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
