  // ==========================================
  // RESPONSIVE 3-COLUMN CAROUSEL LOGIC (GALLERY 1)
  // ==========================================
  let currentSlide = 0;
  // Counted from the DOM so adding a slide to index.html needs no JS change
  const totalSlides = () => document.querySelectorAll('#carouselTrack .carousel-slide').length;
  let slideInterval;
  let resumeTimeout;
  let isPlaying = true;
  
  function getItemsPerPage() {
      const wrapper = document.getElementById('carouselWrapper');
      if(!wrapper) return 3;
      return parseInt(getComputedStyle(wrapper).getPropertyValue('--items-per-page')) || 3;
  }
  
  function updateCarousel() {
      const track = document.getElementById('carouselTrack');
      if(!track) return;
      const itemsPerPage = getItemsPerPage();
      const maxIndex = totalSlides() - itemsPerPage;
      
      if (currentSlide > maxIndex) currentSlide = 0;
      if (currentSlide < 0) currentSlide = maxIndex;
      
      const slideElement = document.querySelector('#carouselTrack .carousel-slide');
      if(slideElement) {
        const slideWidth = slideElement.getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      }
      updateDots(maxIndex);
  }
  
  function updateDots(maxIndex) {
      const dotsContainer = document.getElementById('carouselDots');
      if(!dotsContainer) return;
      
      if(dotsContainer.children.length !== (maxIndex + 1)) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i <= maxIndex; i++) {
              const dot = document.createElement('button');
              dot.className = 'dot-btn';
              dot.onclick = () => goToSlide(i);
              dotsContainer.appendChild(dot);
          }
      }
      
      Array.from(dotsContainer.children).forEach((dot, index) => {
          dot.className = index === currentSlide ? 'dot-btn active' : 'dot-btn';
      });
  }
  
  function moveSlide(step) {
      const maxIndex = totalSlides() - getItemsPerPage();
      currentSlide += step;
      if (currentSlide > maxIndex) currentSlide = 0;
      if (currentSlide < 0) currentSlide = maxIndex;
      
      updateCarousel();
      pauseForInteraction();
  }
  
  function goToSlide(index) {
      currentSlide = index;
      updateCarousel();
      pauseForInteraction();
  }
  
  function autoSlide() {
      const maxIndex = totalSlides() - getItemsPerPage();
      currentSlide++;
      if(currentSlide > maxIndex) currentSlide = 0;
      updateCarousel();
  }
  
  function startAutoplay() {
      const playBtn = document.getElementById('playPauseBtn');
      if(!playBtn) return;
      if(slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(autoSlide, 3500); 
      playBtn.innerText = '⏸';
      isPlaying = true;
  }
  
  function stopAutoplay() {
      const playBtn = document.getElementById('playPauseBtn');
      if(!playBtn) return;
      clearInterval(slideInterval);
      playBtn.innerText = '⏵';
      isPlaying = false;
  }
  
  function togglePlayPause() {
      isPlaying ? stopAutoplay() : startAutoplay();
  }
  
  function pauseForInteraction() {
      if(!isPlaying) return;
      clearInterval(slideInterval);
      clearTimeout(resumeTimeout);
      const playBtn = document.getElementById('playPauseBtn');
      if(playBtn) playBtn.innerText = '⏵';
      resumeTimeout = setTimeout(() => {
          if(isPlaying) startAutoplay();
      }, 6000); 
  }

  // ==========================================
  // RESPONSIVE 3-COLUMN CAROUSEL LOGIC (GALLERY 2)
  // ==========================================
  let currentSlide2 = 0;
  const totalSlides2 = () => document.querySelectorAll('#carouselTrack2 .carousel-slide').length;
  let slideInterval2;
  let resumeTimeout2;
  let isPlaying2 = true;
  
  function getItemsPerPage2() {
      const wrapper = document.getElementById('carouselWrapper2');
      if(!wrapper) return 3;
      return parseInt(getComputedStyle(wrapper).getPropertyValue('--items-per-page')) || 3;
  }
  
  function updateCarousel2() {
      const track = document.getElementById('carouselTrack2');
      if(!track) return;
      const itemsPerPage = getItemsPerPage2();
      const maxIndex = Math.max(0, totalSlides2() - itemsPerPage);
      
      if (currentSlide2 > maxIndex) currentSlide2 = 0;
      if (currentSlide2 < 0) currentSlide2 = maxIndex;
      
      const slideElement = document.querySelector('#carouselTrack2 .carousel-slide');
      if(slideElement) {
        const slideWidth = slideElement.getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentSlide2 * slideWidth}px)`;
      }
      updateDots2(maxIndex);
  }
  
  function updateDots2(maxIndex) {
      const dotsContainer = document.getElementById('carouselDots2');
      if(!dotsContainer) return;
      
      if(dotsContainer.children.length !== (maxIndex + 1)) {
          dotsContainer.innerHTML = '';
          for (let i = 0; i <= maxIndex; i++) {
              const dot = document.createElement('button');
              dot.className = 'dot-btn';
              dot.onclick = () => goToSlide2(i);
              dotsContainer.appendChild(dot);
          }
      }
      
      Array.from(dotsContainer.children).forEach((dot, index) => {
          dot.className = index === currentSlide2 ? 'dot-btn active' : 'dot-btn';
      });
  }
  
  function moveSlide2(step) {
      const maxIndex = Math.max(0, totalSlides2() - getItemsPerPage2());
      currentSlide2 += step;
      if (currentSlide2 > maxIndex) currentSlide2 = 0;
      if (currentSlide2 < 0) currentSlide2 = maxIndex;
      
      updateCarousel2();
      pauseForInteraction2();
  }
  
  function goToSlide2(index) {
      currentSlide2 = index;
      updateCarousel2();
      pauseForInteraction2();
  }
  
  function autoSlide2() {
      const maxIndex = Math.max(0, totalSlides2() - getItemsPerPage2());
      currentSlide2++;
      if(currentSlide2 > maxIndex) currentSlide2 = 0;
      updateCarousel2();
  }
  
  function startAutoplay2() {
      const playBtn = document.getElementById('playPauseBtn2');
      if(!playBtn) return;
      if(slideInterval2) clearInterval(slideInterval2);
      slideInterval2 = setInterval(autoSlide2, 3500); 
      playBtn.innerText = '⏸';
      isPlaying2 = true;
  }
  
  function stopAutoplay2() {
      const playBtn = document.getElementById('playPauseBtn2');
      if(!playBtn) return;
      clearInterval(slideInterval2);
      playBtn.innerText = '⏵';
      isPlaying2 = false;
  }
  
  function togglePlayPause2() {
      isPlaying2 ? stopAutoplay2() : startAutoplay2();
  }

  // Gallery 2 is re-rendered per month, so the slide count changes under us.
  // Drop the dots to force a rebuild and rewind to the first slide.
  function resetCarousel2() {
      currentSlide2 = 0;
      const dots = document.getElementById('carouselDots2');
      if (dots) dots.innerHTML = '';
      updateCarousel2();
  }
  
  function pauseForInteraction2() {
      if(!isPlaying2) return;
      clearInterval(slideInterval2);
      clearTimeout(resumeTimeout2);
      const playBtn = document.getElementById('playPauseBtn2');
      if(playBtn) playBtn.innerText = '⏵';
      resumeTimeout2 = setTimeout(() => {
          if(isPlaying2) startAutoplay2();
      }, 6000); 
  }

  // Shared Resize Event
  window.addEventListener('resize', () => {
      currentSlide = 0; 
      updateCarousel();
      currentSlide2 = 0;
      updateCarousel2();
  });
  
  setTimeout(() => {
    updateCarousel();
    startAutoplay();
    updateCarousel2();
    startAutoplay2();
  }, 100);
