import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';

const sequences = [
  { name: 'gta_landing', frames: 231 },
  { name: 'bar', frames: 240 },
  { name: 'gym', frames: 240 },
  { name: 'strip_club', frames: 240 }
];

const phrases = [
  "NEON. NOISE. NO RULES.",
  "THE CITY NEVER SLEEPS.",
  "AFTER DARK, EVERYTHING CHANGES.",
  "LIGHTS ON. WORLD OFF.",
  "WELCOME TO YOUR SIDE OF THE CITY.",
  "THE NIGHT HAS A NEW OWNER.",
  "CREATE THE VIBE. OWN THE NIGHT.",
  "YOUR STORY STARTS AFTER DARK.",
  "NO MAP. NO RULES. JUST VIBES."
];

const totalFrames = sequences.reduce((acc, seq) => acc + seq.frames, 0);

const getImageUrl = (seqName, frameIndex) => {
  const paddedIndex = frameIndex.toString().padStart(3, '0');
  return `/assets/${seqName}/ezgif-frame-${paddedIndex}.jpg`;
};

const drawImageCover = (ctx, img, canvas) => {
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    img, 
    0, 0, img.width, img.height,
    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
  );
};

const ScrollSequence = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textRefs = useRef([]);
  const masterTl = useRef(null);

  // Clear refs on each render to prevent stale nodes in strict mode
  textRefs.current = [];

  // Text Animation Effect (Scroll Driven)
  useEffect(() => {
    if (textRefs.current.length === 0) return;
    
    // Reveal paragraphs and split text
    gsap.set(textRefs.current, { opacity: 1 });
    const splits = textRefs.current.map(el => new SplitType(el, { types: 'chars' }));
    
    // Create a master GSAP timeline tied to scroll
    masterTl.current = gsap.timeline({ paused: true });

    splits.forEach((split, index) => {
      const phraseTl = gsap.timeline();
      
      // Force hide all characters initially
      gsap.set(split.chars, { opacity: 0, y: 30 });

      // Animate letters IN
      phraseTl.to(split.chars, {
        opacity: 1, 
        y: 0,
        stagger: 0.1, 
        duration: 1,
        ease: "power2.out"
      });
      
      // Hold the phrase on screen
      phraseTl.to({}, { duration: 1.5 });
      
      // Animate letters OUT
      phraseTl.to(split.chars, {
        opacity: 0,
        y: -30,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.in"
      });

      masterTl.current.add(phraseTl);
    });
    
    // Initialize to 0
    masterTl.current.progress(0);

    return () => {
      if (masterTl.current) masterTl.current.kill();
      splits.forEach(split => split.revert());
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to window inner size
    canvas.width = document.documentElement.clientWidth;
    canvas.height = window.innerHeight;

    const imageCache = new Array(totalFrames);

    let currentGlobalFrame = 0;

    // Load first image immediately to render
    const firstImg = new Image();
    firstImg.src = getImageUrl(sequences[0].name, 1);
    firstImg.onload = () => {
      drawImageCover(ctx, firstImg, canvas);
      imageCache[0] = firstImg;
    };

    // Preload the rest asynchronously
    let frameCounter = 0;
    for (let s = 0; s < sequences.length; s++) {
      const seq = sequences[s];
      for (let f = 1; f <= seq.frames; f++) {
        const globalIndex = frameCounter++;
        if (globalIndex === 0) continue; // Already loading first frame
        
        const img = new Image();
        img.src = getImageUrl(seq.name, f);
        img.onload = () => {
          imageCache[globalIndex] = img;
        };
      }
    }

    const handleScroll = () => {
      const html = document.documentElement;
      const scrollTop = html.scrollTop;
      const maxScrollTop = html.scrollHeight - window.innerHeight;
      
      const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
      
      // Update image frame
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(scrollFraction * totalFrames)
      );

      requestAnimationFrame(() => {
        if (imageCache[frameIndex]) {
          drawImageCover(ctx, imageCache[frameIndex], canvas);
        }
        // Update master text timeline
        if (masterTl.current) {
          masterTl.current.progress(scrollFraction);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // Handle resize
    const handleResize = () => {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = window.innerHeight;
      
      const html = document.documentElement;
      const scrollFraction = Math.max(0, Math.min(1, html.scrollTop / (Math.max(1, html.scrollHeight - window.innerHeight))));
      
      const frameIndex = Math.min(totalFrames - 1, Math.floor(scrollFraction * totalFrames));
      if (imageCache[frameIndex]) {
        drawImageCover(ctx, imageCache[frameIndex], canvas);
      }
      
      if (masterTl.current) {
        masterTl.current.progress(scrollFraction);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="scroll-container" ref={containerRef}>
      <div className="sticky-wrapper">
        <canvas ref={canvasRef}></canvas>
        <div className="phrase-overlay">
          {phrases.map((phrase, idx) => (
            <p key={idx} ref={(el) => (textRefs.current[idx] = el)}>
              {phrase}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollSequence;
