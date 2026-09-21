import React, { useEffect, useRef } from 'react';

const sequences = [
  { name: 'gta_landing', frames: 231 },
  { name: 'bar', frames: 240 },
  { name: 'gym', frames: 240 },
  { name: 'strip_club', frames: 240 }
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to window inner size
    canvas.width = window.innerWidth;
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
      
      const scrollFraction = scrollTop / maxScrollTop;
      const frameIndex = Math.min(
        totalFrames - 1,
        Math.floor(scrollFraction * totalFrames)
      );

      requestAnimationFrame(() => {
        if (imageCache[frameIndex]) {
          drawImageCover(ctx, imageCache[frameIndex], canvas);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const html = document.documentElement;
      const scrollFraction = html.scrollTop / (Math.max(1, html.scrollHeight - window.innerHeight));
      const frameIndex = Math.min(totalFrames - 1, Math.floor(scrollFraction * totalFrames));
      if (imageCache[frameIndex]) {
        drawImageCover(ctx, imageCache[frameIndex], canvas);
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
      </div>
    </div>
  );
};

export default ScrollSequence;
