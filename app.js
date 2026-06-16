/* ----------------------------------------------------
   editkaro.in Portfolio Interactivity & Motion Engine
   Libraries: Lenis, GSAP, ScrollTrigger
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom out-quint momentum
    smoothWheel: true,
    smoothTouch: false,
  });

  // Sync scroll with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  
  gsap.ticker.lagSmoothing(0);

  // 2. Character-Level Text Split (Programmatic)
  const headlineEl = document.getElementById('hero-headline-text');
  if (headlineEl) {
    const rawText = headlineEl.textContent.trim();
    headlineEl.innerHTML = '';
    
    // Split by words, then wrap each letter inside spans to prevent line-wrapping bugs
    const words = rawText.split(' ');
    words.forEach((word, wordIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'char-wrapper';
      
      const characters = word.split('');
      characters.forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'reveal-char';
        
        // Handle italic formatting indicator if desired (e.g. style keyword "shape")
        if (word === 'shape') {
          charSpan.classList.add('font-italic');
        }
        
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });
      
      headlineEl.appendChild(wordSpan);
      
      // Re-insert spaces between word wrappers
      if (wordIdx < words.length - 1) {
        headlineEl.appendChild(document.createTextNode(' '));
      }
    });
  }

  // 3. Preloader Counter & SVG Morphing Exit (Minimal Typography Style)
  const counterVal = { value: 0 };
  const preloaderWords = ["rhythm", "pacing", "contrast", "depth", "editkaro."];
  const counterNumEl = document.querySelector('.counter-num');
  const preloaderWordEl = document.querySelector('.preloader-active-word');
  let lastWordIdx = -1;
  
  // Session storage check to prevent preloader showing on every page navigation
  const sessionVisited = sessionStorage.getItem('editkaro_preloader_played');
  
  if (sessionVisited) {
    const preloaderEl = document.querySelector('.preloader');
    if (preloaderEl) {
      preloaderEl.style.display = 'none';
    }
    triggerHeroEntrance(true); // Fast load mode
  } else {
    const preloaderTween = gsap.to(counterVal, {
      value: 100,
      duration: 3.2,
      ease: "power2.out",
      onUpdate: () => {
        const currentVal = Math.round(counterVal.value);
        if (counterNumEl) counterNumEl.innerText = currentVal < 10 ? `0${currentVal}` : currentVal;
        
        const wordIdx = Math.min(Math.floor((currentVal / 100) * preloaderWords.length), preloaderWords.length - 1);
        
        if (wordIdx !== lastWordIdx && preloaderWordEl) {
          lastWordIdx = wordIdx;
          const nextWord = preloaderWords[wordIdx];
          
          // Dynamic Slide & Fade shift animation for words
          gsap.timeline()
            .to(preloaderWordEl, {
              y: -20,
              opacity: 0,
              duration: 0.18,
              ease: "power2.in",
              onComplete: () => {
                preloaderWordEl.innerText = nextWord;
                
                // Apply branding custom styles (italic/gradient) to the final word 'editkaro.'
                if (nextWord === 'editkaro.') {
                  preloaderWordEl.classList.add('font-italic');
                } else {
                  preloaderWordEl.classList.remove('font-italic');
                }
                
                gsap.set(preloaderWordEl, { y: 20 });
              }
            })
            .to(preloaderWordEl, {
              y: 0,
              opacity: 1,
              duration: 0.3,
              ease: "power2.out"
            });
        }
      },
      onComplete: () => {
        const curvePath = document.querySelector('.preloader-slider-svg path');
        sessionStorage.setItem('editkaro_preloader_played', 'true');
        
        gsap.timeline()
          .to(curvePath, {
            attr: { d: "M0,0 C30,0 70,0 100,0 L100,100 L0,100 Z" },
            duration: 0.6,
            ease: "power2.inOut"
          })
          .to(".preloader", {
            y: "-100%",
            duration: 0.8,
            ease: "power4.inOut",
            onComplete: () => {
              const preloaderEl = document.querySelector('.preloader');
              if (preloaderEl) preloaderEl.style.display = 'none';
              triggerHeroEntrance(false);
            }
          }, "-=0.2");
      }
    });
  }

  // 4. Hero Entrance Animations (Character-Level stagger reveal)
  function triggerHeroEntrance(isFast = false) {
    const durationMultiplier = isFast ? 0.3 : 1.0;
    const staggerTime = isFast ? 0.003 : 0.015;
    
    // Stagger character fades and slides
    gsap.to(".reveal-char", {
      y: "0%",
      duration: 1.0 * durationMultiplier,
      stagger: staggerTime,
      ease: "power4.out"
    });

    // Reveal subtext & primary CTA button
    gsap.fromTo([".hero-subtext", ".hero-cta-group"], 
      { opacity: isFast ? 1 : 0, y: isFast ? 0 : 24 },
      { opacity: 1, y: 0, duration: 1 * durationMultiplier, stagger: isFast ? 0 : 0.1, ease: "power3.out" }
    );

    // Zoom and settle hero video reel
    gsap.fromTo(".hero-reel-outer",
      { scale: isFast ? 1 : 0.82, opacity: isFast ? 1 : 0 },
      { scale: 1, opacity: 1, duration: 1.6 * durationMultiplier, ease: "power4.out" }
    );
  }

  // 5. Magnetic Interactive Elements
  const magneticEls = document.querySelectorAll('.btn-magnetic, .filter-pill, .slide-nav-btn');
  
  magneticEls.forEach(elem => {
    elem.addEventListener('mousemove', (e) => {
      const bound = elem.getBoundingClientRect();
      const elemX = e.clientX - bound.left - (bound.width / 2);
      const elemY = e.clientY - bound.top - (bound.height / 2);
      
      gsap.to(elem, {
        x: elemX * 0.38,
        y: elemY * 0.38,
        duration: 0.3,
        ease: "power2.out"
      });
      
      const icon = elem.querySelector('.btn-icon');
      if (icon) {
        gsap.to(icon, {
          x: elemX * 0.2,
          y: elemY * 0.2,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    elem.addEventListener('mouseleave', () => {
      gsap.to(elem, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)"
      });
      const icon = elem.querySelector('.btn-icon');
      if (icon) {
        gsap.to(icon, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)"
        });
      }
    });
  });

  // 6. Custom cursor trail follower & Bento Card Mouse-tracking spotlights
  const customCursor = document.querySelector('.custom-cursor');
  const bentoCards = document.querySelectorAll('.bento-card');

  // Always track cursor position for fluid transitions
  document.addEventListener('mousemove', (e) => {
    gsap.to(customCursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out"
    });
  });

  bentoCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(customCursor, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(customCursor, {
        opacity: 0,
        scale: 0.1,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    // Track mouse position within each card for the spotlight gradient effects
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 7. Portfolio Category Filter Actions
  const filterPills = document.querySelectorAll('.filter-pill');
  
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      
      const filterTag = pill.getAttribute('data-filter');
      
      gsap.to(bentoCards, {
        opacity: 0,
        scale: 0.85,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          bentoCards.forEach(card => {
            if (filterTag === 'all' || card.classList.contains(filterTag)) {
              card.style.display = 'block';
              gsap.to(card, {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "power3.out"
              });
            } else {
              card.style.display = 'none';
            }
          });
          ScrollTrigger.refresh();
        }
      });
    });
  });

  // 8. Color Grading Interactive Slider (Controlled only by mouse movement/hover and touch)
  const gradingSlider = document.getElementById('grading-slider');
  const rawOverlay = document.querySelector('.slider-image-raw');
  const dragHandle = document.querySelector('.slider-drag-handle');

  if (gradingSlider && rawOverlay && dragHandle) {
    function moveSlider(clientX) {
      const sliderRect = gradingSlider.getBoundingClientRect();
      let xOffset = clientX - sliderRect.left;
      
      if (xOffset < 0) xOffset = 0;
      if (xOffset > sliderRect.width) xOffset = sliderRect.width;
      
      const sliderPercentage = (xOffset / sliderRect.width) * 100;
      
      rawOverlay.style.width = `${sliderPercentage}%`;
      dragHandle.style.left = `${sliderPercentage}%`;
    }

    // Controlled only by mouse movement / hover and touch
    gradingSlider.addEventListener('mousemove', (e) => {
      moveSlider(e.clientX);
    });

    gradingSlider.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        moveSlider(e.touches[0].clientX);
      }
    });
  }

  // 9. Fullscreen Video Lightbox Controller
  const videoLightbox = document.querySelector('.video-lightbox');
  const lightboxPlayer = document.querySelector('.lightbox-player');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (videoLightbox && lightboxPlayer && lightboxClose) {
    bentoCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetVideo = card.getAttribute('data-video');
        if (targetVideo) {
          lightboxPlayer.src = targetVideo;
          videoLightbox.classList.add('active');
          videoLightbox.setAttribute('aria-hidden', 'false');
          lenis.stop();
          lightboxPlayer.play();
        }
      });
    });

    lightboxClose.addEventListener('click', () => {
      videoLightbox.classList.remove('active');
      videoLightbox.setAttribute('aria-hidden', 'true');
      lightboxPlayer.pause();
      lightboxPlayer.src = '';
      lenis.start();
    });
  }

  // 10. Workflow Steps Accordion Toggle
  const steps = document.querySelectorAll('.workflow-step');
  
  steps.forEach(step => {
    step.addEventListener('click', () => {
      const activeState = step.classList.contains('active');
      steps.forEach(s => s.classList.remove('active'));
      
      if (!activeState) {
        step.classList.add('active');
      }
    });
  });

  // 11. Testimonial slideshow paging logic
  const slides = document.querySelectorAll('.testimonial-quote-box');
  const dots = document.querySelectorAll('.slide-dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (slides.length > 0 && dots.length > 0 && prevBtn && nextBtn) {
    let currentSlide = 0;
    let slideTimer;

    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      
      slides[index].classList.add('active');
      dots[index].classList.add('active');
      currentSlide = index;
    }

    function nextSlide() {
      const nextIdx = (currentSlide + 1) % slides.length;
      showSlide(nextIdx);
    }

    function prevSlide() {
      const prevIdx = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(prevIdx);
    }

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetSlideInterval();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetSlideInterval();
    });

    dots.forEach((dot, dotIdx) => {
      dot.addEventListener('click', () => {
        showSlide(dotIdx);
        resetSlideInterval();
      });
    });

    function startSlideInterval() {
      slideTimer = setInterval(nextSlide, 7000); // auto-rotate quotes every 7s
    }

    function resetSlideInterval() {
      clearInterval(slideTimer);
      startSlideInterval();
    }

    // Start testimonials timeline
    startSlideInterval();
  }

  // 12. Infinite stats marquee hover pause
  const statsMarquee = document.querySelector('.stats-marquee-content');
  if (statsMarquee) {
    statsMarquee.addEventListener('mouseenter', () => {
      statsMarquee.style.animationPlayState = 'paused';
    });
    statsMarquee.addEventListener('mouseleave', () => {
      statsMarquee.style.animationPlayState = 'running';
    });
  }

  // 13. Mobile Menu Overlay Toggle
  const menuBtn = document.querySelector('.nav-hamburger');
  const menuOverlay = document.querySelector('.mobile-menu-overlay');

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      
      if (menuOverlay.classList.contains('active')) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });

    document.querySelectorAll('.mobile-nav-item, .mobile-cta').forEach(item => {
      item.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        lenis.start();
      });
    });
  }

  // 14. ScrollTrigger reveals for sections
  if (document.getElementById('portfolio-grid')) {
    gsap.from(".bento-card", {
      scrollTrigger: {
        trigger: "#portfolio-grid",
        start: "top 80%",
      },
      opacity: 0,
      scale: 0.9,
      y: 50,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out"
    });
  }

  if (document.querySelector('.workflow-accordion')) {
    gsap.from(".workflow-step", {
      scrollTrigger: {
        trigger: ".workflow-accordion",
        start: "top 80%",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out"
    });
  }

  // 15. UI/UX Pro Max: 3D Bento Card Tilt Micro-physics
  bentoCards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation angles based on cursor offset from card center
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6; // max 6 degrees
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      
      gsap.to(inner, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power3.out"
      });
    });
  });

  // 16. UI/UX Pro Max: Interactive Creative LUT presets switcher
  const gradedImg = document.querySelector('.slider-image-graded img');
  const lutButtons = document.querySelectorAll('.lut-btn');
  const labelGraded = document.querySelector('.label-graded');
  if (gradedImg && lutButtons.length > 0) {
    // Apply default class
    gradedImg.classList.add('lut-cinema');
    
    lutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        lutButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const lut = btn.getAttribute('data-lut');
        // Reset and apply new LUT class
        gradedImg.className = '';
        gradedImg.classList.add(`lut-${lut}`);

        // Update label text dynamically
        if (labelGraded) {
          labelGraded.textContent = btn.textContent.toUpperCase();
        }
      });
    });
  }

  // --- UI/UX Pro Max: Interactive Constellation Background Canvas ---
  const canvas = document.getElementById('bg-particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let particles = [];
    const particleCount = 70;
    let mouse = { x: null, y: null, targetX: null, targetY: null };
    
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
    
    document.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
      mouse.targetX = null;
      mouse.targetY = null;
    });
    
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 0.5;
        this.baseVx = this.vx;
        this.baseVy = this.vy;
      }
      
      update() {
        // Drift
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off walls
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
        
        // Mouse repulsion & smooth return
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2.5;
            this.y += Math.sin(angle) * force * 2.5;
          }
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      }
    }
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      
      // Interpolate mouse coordinates for fluid trailing
      if (mouse.targetX !== null && mouse.targetY !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
      } else {
        mouse.x = null;
        mouse.y = null;
      }
      
      // Draw particles & connect lines
      particles.forEach((p, index) => {
        p.update();
        p.draw();
        
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Fade line alpha based on distance
            const alpha = (100 - dist) / 100 * 0.12;
            
            // Color connection lines based on screen side
            if (p.x < width / 2) {
              ctx.strokeStyle = `rgba(244, 63, 94, ${alpha})`; // rose accent left side
            } else {
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; // indigo accent right side
            }
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // --- UI/UX Pro Max: Hero HUD Timecode & Audio Engine ---
  const timecodeEl = document.getElementById('hero-hud-timecode');
  const hudAudioBars = document.querySelectorAll('.hud-audio-bar');
  if (timecodeEl) {
    let frameCount = 0;
    
    function updateHUD() {
      frameCount++;
      
      // Convert frames to timecode format (24 fps)
      let totalSeconds = Math.floor(frameCount / 24);
      let frames = frameCount % 24;
      let seconds = totalSeconds % 60;
      let minutes = Math.floor(totalSeconds / 60) % 60;
      let hours = Math.floor(totalSeconds / 3600) % 24;
      
      const pad = (n) => String(n).padStart(2, '0');
      timecodeEl.innerText = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
      
      // Random audio spectrum jumps
      hudAudioBars.forEach(bar => {
        const scale = Math.random() * 1.5 + 0.3;
        bar.style.transform = `scaleX(${scale})`;
      });
      
      requestAnimationFrame(updateHUD);
    }
    updateHUD();
  }

  // --- UI/UX Pro Max: Bento Card Upgraded Overlays ---
  // Card 1 Sparkline Pulse Follower
  const sparklineCard = document.getElementById('work-1');
  const sparklinePath = document.getElementById('sparkline-path');
  const sparklineNode = document.querySelector('.sparkline-pulse-node');
  if (sparklineCard && sparklinePath && sparklineNode) {
    const pathLength = sparklinePath.getTotalLength();
    let sparklineTween = null;
    
    // Position initial node at 0
    const startPoint = sparklinePath.getPointAtLength(0);
    sparklineNode.setAttribute('cx', startPoint.x);
    sparklineNode.setAttribute('cy', startPoint.y);
    
    sparklineCard.addEventListener('mouseenter', () => {
      const tracker = { progress: 0 };
      if (sparklineTween) sparklineTween.kill();
      
      sparklineTween = gsap.to(tracker, {
        progress: 1,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => {
          const pt = sparklinePath.getPointAtLength(tracker.progress * pathLength);
          sparklineNode.setAttribute('cx', pt.x);
          sparklineNode.setAttribute('cy', pt.y);
        }
      });
    });
  }

  // Card 2 Typewriter Dialogue Ticker
  const docuCard = document.getElementById('work-2');
  const dialogueTextEl = document.getElementById('work-2-dialogue');
  if (docuCard && dialogueTextEl) {
    const phraseText = '"In the heart of the wild, editing shapes destiny..."';
    let dialogueInterval;
    
    docuCard.addEventListener('mouseenter', () => {
      let charIdx = 0;
      dialogueTextEl.textContent = '';
      clearInterval(dialogueInterval);
      dialogueInterval = setInterval(() => {
        if (charIdx < phraseText.length) {
          dialogueTextEl.textContent += phraseText[charIdx];
          charIdx++;
        } else {
          clearInterval(dialogueInterval);
        }
      }, 35);
    });
    
    docuCard.addEventListener('mouseleave', () => {
      clearInterval(dialogueInterval);
      dialogueTextEl.textContent = '"In the heart of the wild..."';
    });
  }

  // --- UI/UX Pro Max: Intake Project Scope Calculator ---
  const volumeSlider = document.getElementById('videos-volume');
  const volumeValDisplay = document.getElementById('videos-volume-val');
  const toneCards = document.querySelectorAll('.tone-card');
  const selectedToneInput = document.getElementById('selected-tone');
  const priceDisplay = document.getElementById('estimator-price-val');
  
  if (volumeSlider && priceDisplay) {
    const basePrice = 200;
    
    function calculateQuote() {
      const volume = parseInt(volumeSlider.value);
      const toneCard = document.querySelector('.tone-card.active');
      const multiplier = parseFloat(toneCard.getAttribute('data-multiplier'));
      
      const total = Math.round(volume * basePrice * multiplier);
      
      // Update displays
      volumeValDisplay.textContent = `${volume} Videos`;
      
      // Smoothly count up to the new price using GSAP
      const currentPriceText = priceDisplay.textContent.replace('$', '').replace(',', '');
      const currentVal = parseInt(currentPriceText) || 0;
      
      const priceObject = { value: currentVal };
      gsap.to(priceObject, {
        value: total,
        duration: 0.6,
        ease: "power2.out",
        onUpdate: () => {
          priceDisplay.textContent = `$${Math.round(priceObject.value).toLocaleString()}`;
        }
      });
    }
    
    volumeSlider.addEventListener('input', calculateQuote);
    
    toneCards.forEach(card => {
      card.addEventListener('click', () => {
        toneCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedToneInput.value = card.getAttribute('data-tone');
        calculateQuote();
      });
    });
    
    // Initial call
    calculateQuote();
  }

  // --- UI/UX Pro Max: Video Stream Load Indicator Handler ---
  const heroVideo = document.querySelector('.hero-reel-video');
  const videoLoader = document.querySelector('.video-loading-indicator');
  if (heroVideo && videoLoader) {
    if (!heroVideo.paused) {
      videoLoader.style.opacity = '0';
      videoLoader.style.pointerEvents = 'none';
      videoLoader.style.display = 'none';
    }
    
    heroVideo.addEventListener('playing', () => {
      gsap.to(videoLoader, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          videoLoader.style.display = 'none';
        }
      });
    });
  }

  // --- UI/UX Pro Max: Form Submission & Google Sheets Integration Pipelines ---
  
  // Configuration Config
  const FORM_CONFIG = {
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycby1c2xnNtDKVXI4CGnW2qXw4vRIvPRqq9C7w4mjkXa23b_-cSeDHs05h7cOJ9WXsWH_bg/exec' // Paste your deployed Google Apps Script URL here
  };

  // Helper function to send post request (Non-blocking background runner)
  async function submitFormData(payload) {
    if (FORM_CONFIG.GOOGLE_SHEETS_URL) {
      try {
        await fetch(FORM_CONFIG.GOOGLE_SHEETS_URL, {
          method: 'POST',
          mode: 'no-cors', // Bypass CORS restrictions for Google Apps Script redirects
          headers: {
            'Content-Type': 'text/plain' // Simple request type prevents OPTIONS preflight blocking
          },
          body: JSON.stringify(payload)
        });
        console.log('Post request dispatched to Google Sheets.');
        return true;
      } catch (err) {
        console.warn('Google Sheet Sync failed, falling back to Local Storage:', err);
      }
    }
    return false;
  }

  // 1. Email Collector Newsletter form
  const newsletterForm = document.getElementById('newsletter-subscription-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('newsletter-email');
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const btnText = submitBtn.querySelector('.btn-text');
      
      if (!emailInput || !submitBtn) return;
      
      const emailValue = emailInput.value.trim();
      
      // Disable input while submitting
      emailInput.disabled = true;
      submitBtn.style.pointerEvents = 'none';
      if (btnText) btnText.textContent = 'Subscribing...';
      
      const payload = {
        formType: 'newsletter',
        email: emailValue
      };
      
      // Perform background sync to Google Sheets (non-blocking)
      submitFormData(payload).then(isSynced => {
        // Store in LocalStorage as fallback/demo cache with sync status
        let cachedEmails = JSON.parse(localStorage.getItem('editkaro_newsletter_emails')) || [];
        cachedEmails.push({
          email: emailValue,
          timestamp: new Date().toISOString(),
          synced: isSynced
        });
        localStorage.setItem('editkaro_newsletter_emails', JSON.stringify(cachedEmails));
      });
      
      // Success micro-interaction animation runs INSTANTLY (Optimistic UI)
      gsap.to(submitBtn, {
        backgroundColor: 'rgba(244, 63, 94, 0.9)', // flash rose color on success
        duration: 0.4,
        onComplete: () => {
          if (btnText) btnText.textContent = 'Subscribed!';
          emailInput.value = '';
          emailInput.placeholder = 'THANK YOU FOR SUBSCRIBING!';
          
          // Reset button back to normal after 3 seconds
          setTimeout(() => {
            emailInput.disabled = false;
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.style.backgroundColor = '';
            if (btnText) btnText.textContent = 'Join Us';
            emailInput.placeholder = 'Enter your email address';
          }, 3000);
        }
      });
    });
  }

  // 2. Project Intake form
  const intakeForm = document.getElementById('project-intake');
  const toastModal = document.getElementById('submission-toast');
  const closeToastBtn = document.getElementById('close-toast-btn');
  
  if (intakeForm && toastModal) {
    intakeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const categorySelect = document.getElementById('category');
      const categoryText = categorySelect.options[categorySelect.selectedIndex].text;
      const volume = document.getElementById('videos-volume').value;
      const toneInput = document.getElementById('selected-tone').value;
      const details = document.getElementById('details').value.trim();
      const priceVal = document.getElementById('estimator-price-val').textContent;
      
      const submitBtn = intakeForm.querySelector('button[type="submit"]');
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      
      if (submitBtn) {
        submitBtn.style.pointerEvents = 'none';
        if (btnText) btnText.textContent = 'Syncing...';
      }
      
      const payload = {
        formType: 'intake',
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        category: categoryText,
        volume: `${volume} Videos`,
        style: toneInput.toUpperCase(),
        details: details,
        estimatedPrice: priceVal
      };
      
      // Perform background sync to Google Sheets (non-blocking)
      submitFormData(payload).then(isSynced => {
        // Store in LocalStorage as fallback/demo cache with sync status
        let cachedInquiries = JSON.parse(localStorage.getItem('editkaro_project_inquiries')) || [];
        cachedInquiries.push({
          ...payload,
          timestamp: new Date().toISOString(),
          synced: isSynced
        });
        localStorage.setItem('editkaro_project_inquiries', JSON.stringify(cachedInquiries));
      });
      
      // Populate and trigger success toast preview INSTANTLY (Optimistic UI)
      document.getElementById('toast-name').textContent = `${firstName} ${lastName}`;
      document.getElementById('toast-email').textContent = email;
      document.getElementById('toast-phone').textContent = phone;
      document.getElementById('toast-volume').textContent = `${volume} Videos`;
      document.getElementById('toast-tone').textContent = toneInput.toUpperCase();
      document.getElementById('toast-quote').textContent = priceVal;
      
      // Add active state to slide in the modal
      toastModal.classList.add('active');
      toastModal.setAttribute('aria-hidden', 'false');
      if (window.lenis) window.lenis.stop();
      
      // Reset form
      intakeForm.reset();
      if (submitBtn) {
        submitBtn.style.pointerEvents = 'auto';
        if (btnText) btnText.textContent = 'Submit Inquiry';
      }
      
      // Trigger update to reset quote counter displays
      const volumeSlider = document.getElementById('videos-volume');
      if (volumeSlider) {
        const event = new Event('input');
        volumeSlider.dispatchEvent(event);
      }
    });
  }
  
  if (closeToastBtn && toastModal) {
    closeToastBtn.addEventListener('click', () => {
      toastModal.classList.remove('active');
      toastModal.setAttribute('aria-hidden', 'true');
      if (window.lenis) window.lenis.start();
    });
  }

});
