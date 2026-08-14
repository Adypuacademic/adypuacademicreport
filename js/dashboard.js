  // ==========================================
  // SIDEBAR & VIEW NAVIGATION
  // ==========================================
  function switchView(viewId) {
    document.querySelectorAll('.tab-content').forEach(view => view.style.display = 'none');
    const activeView = document.getElementById(viewId);
    if (activeView) activeView.style.display = 'block';
    
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const targetId = 'nav-' + (viewId === 'home-view' ? 'home' : viewId);
    const activeLink = document.getElementById(targetId);
    if(activeLink) activeLink.classList.add('active');
    
    if(viewId === 'home-view') {
        setTimeout(() => {
            updateCarousel();
            updateCarousel2();
        }, 50);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // ==========================================
  // MASTER DASHBOARD DATA ENGINE
  // ==========================================

  let activePieChart = null;
  let globalRawData = [];
  let currentMonthData = [];
  let monthData = { May: [], June: [], July: [] };
  let activeMonth = 'July';

  Chart.register(ChartDataLabels);
  // ------------------------------------------
  // MONTH SWITCHING LOGIC
  // ------------------------------------------
  function switchMonth(month) {
    document.querySelectorAll('.month-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.month === month);
    });
    activeMonth = month;
    if ((monthData[month] || []).length > 0) {
      globalRawData = monthData[month];
    } else {
      // fallback: use whatever data is available
      const loaded = Object.keys(monthData).find(m => monthData[m].length > 0);
      if (loaded) globalRawData = monthData[loaded];
    }
    // Update comparison dropdowns to reflect current selection (but keep placeholder option)
    // Only set if they have values selected
    if (document.getElementById('compareMonth1').value === '') {
      // Don't auto-set, keep as is
    }
    updateDashboard(globalRawData);
    updateSchoolTiles(globalRawData);

    // Update Result text based on month
    updateResultText(month);
    renderMeetings(month);
    renderTopGallery(month);
  }

  // ------------------------------------------
  // STATUTORY & ACADEMIC MEETINGS (per month)
  // ------------------------------------------
  const MEETINGS_DOC = 'https://drive.google.com/file/d/1a8i54F4Tz3M_XX8dpmYmdANlu9NMGj9K/preview';
  const MEETINGS = {
    May: [
      { name: 'Board of Studies (BoS)', date: '24/04/2026', doc: MEETINGS_DOC },
      { name: 'Academic Council', date: '25/05/2026', doc: MEETINGS_DOC },
      { name: 'Meeting with Knowledge Partner(s)', date: '25/05/2026', doc: MEETINGS_DOC },
      { name: 'IQAC Meeting for NAAC/NBA Accreditation', date: '24/06/2026', doc: MEETINGS_DOC },
      { name: 'Budget Planning', date: '24/06/2026', doc: MEETINGS_DOC },
      { name: 'Centre of Excellence (CoE) Planning', date: '25/06/2026', doc: MEETINGS_DOC }
    ],
    July: [
      { name: 'Board of Examinations Meeting (BOE)', date: '15/07/2026', doc: 'boe-meeting-notice-agenda.pdf' }
    ]
  };
  MEETINGS.June = MEETINGS.May;

  function renderMeetings(month) {
    const grid = document.getElementById('meetings-grid');
    if (!grid) return;
    grid.innerHTML = (MEETINGS[month] || []).map(m => `
      <div class="kpi clickable" onclick="openDocModal('${m.name.replace(/'/g, "\\'")}', '${m.doc}')">
        <h3>${m.name}</h3>
        <div class="value">${m.date}</div>
      </div>`).join('');
  }

  // ------------------------------------------
  // TOP HIGHLIGHTS GALLERY (per month)
  // Slides carry a `doc` only when they open a document viewer; without one the
  // image itself is opened full-size. Add a month by adding a key here.
  // ------------------------------------------
  const TOP_GALLERY = {
    May: [
      { src: '{5C6CE9FC-5251-46A4-9607-085D23687C3A}.jpg', title: 'Times Higher Education (THE) Sustainability Rankings 2026', date: 'June 2026', doc: 'https://drive.google.com/file/d/1N8A-u1FG0NPe5FyYlccTQfebUkq8SFWU/preview' },
      { src: 'igauge certificate.jpeg', title: 'IGAUGE Certificate', date: 'June 2026' },
      { src: 'igauge ranking.jpeg', title: 'IGAUGE Ranking', date: 'June 2026' },
      { src: 'Lokmat edu fair.jpeg', title: 'Lokmat Education fair and Health Expo', date: 'June 2026' }
    ],
    July: [
      { src: 'gallery-aug-2026.jpeg', title: 'Pune Education Conclave 2026', date: 'August 2026' },
      { src: 'web-tech-bootcamp-july-2026.jpeg', title: 'Web Technology Bootcamp Workshop', date: 'July 2026' },
      { src: 'hack4humanity-winner.jpeg', title: '1st Prize — Hack4Humanity Hackathon', date: 'AI for Societal Good Track' }
    ]
  };
  TOP_GALLERY.June = TOP_GALLERY.May;

  function renderTopGallery(month) {
    const track = document.getElementById('carouselTrack2');
    if (!track) return;
    const esc = s => String(s).replace(/'/g, "\\'");
    track.innerHTML = (TOP_GALLERY[month] || []).map(g => {
      const open = g.doc
        ? `openDocModal('${esc(g.title)}', '${g.doc}')`
        : `openImageModal(this.querySelector('img'))`;
      return `
      <div class="carousel-slide">
        <div class="slide-content" onclick="${open}">
          <img src="${g.src}" alt="${g.title}" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80';">
          <div class="carousel-caption"><h4>${g.title}</h4><p>${g.date}</p></div>
        </div>
      </div>`;
    }).join('');
    // Slide count changed, so the offset and the dot strip both have to be rebuilt
    if (typeof resetCarousel2 === 'function') resetCarousel2();
  }

  // ------------------------------------------
  // UPDATE RESULT TEXT BASED ON MONTH
  // ------------------------------------------
  function updateResultText(month) {
    const resultEl = document.getElementById('main-exam-prog');
    resultEl.innerText = month === 'May' ? 'In Progress' : 'Declared';
  }

  // ------------------------------------------
  // COMPARE MONTHS FEATURE - UPDATED WITH VALIDATION
  // ------------------------------------------
  function compareMonths() {
    const m1 = document.getElementById('compareMonth1').value;
    const m2 = document.getElementById('compareMonth2').value;
    
    // Check if both months are selected
    if (m1 === '' || m2 === '') {
      alert('Please select two different months to compare.');
      return;
    }
    
    if (m1 === m2) {
      alert('Please select two different months to compare.');
      return;
    }
    
    let data1 = monthData[m1] || [];
    let data2 = monthData[m2] || [];
    if (data1.length === 0 || data2.length === 0) {
      alert('Data for one or both months is not loaded. Please ensure both selected months are available.');
      return;
    }
    // Build comparison display in a modal
    const modal = document.getElementById('combinedModal');
    document.getElementById('modalTitle').innerText = `Comparison: ${m1} vs ${m2}`;
    switchModalTab('detail');
    const tableWrap = document.getElementById('modalTableWrapper');
    tableWrap.style.display = 'block';
    
    // Compute summary per school for each month
    let summary1 = getSchoolSummary(data1);
    let summary2 = getSchoolSummary(data2);
    let allSchools = new Set([...Object.keys(summary1), ...Object.keys(summary2)]);
    let html = `<table class="detail-table"><thead><tr><th>School</th><th>${m1} Target</th><th>${m1} Achieved</th><th>${m1} Gap</th><th>${m1} %</th><th>${m2} Target</th><th>${m2} Achieved</th><th>${m2} Gap</th><th>${m2} %</th></tr></thead><tbody>`;
    let totals1 = {target:0, achieved:0, gap:0};
    let totals2 = {target:0, achieved:0, gap:0};
    allSchools.forEach(school => {
      let s1 = summary1[school] || {target:0, achieved:0, gap:0, percent:'0%'};
      let s2 = summary2[school] || {target:0, achieved:0, gap:0, percent:'0%'};
      totals1.target += s1.target; totals1.achieved += s1.achieved; totals1.gap += s1.gap;
      totals2.target += s2.target; totals2.achieved += s2.achieved; totals2.gap += s2.gap;
      html += `<tr><td><b>${school}</b></td><td>${s1.target}</td><td>${s1.achieved}</td><td>${s1.gap}</td><td>${s1.percent}</td><td>${s2.target}</td><td>${s2.achieved}</td><td>${s2.gap}</td><td>${s2.percent}</td></tr>`;
    });
    let pct1 = totals1.target > 0 ? ((totals1.achieved/totals1.target)*100).toFixed(1)+'%' : '0%';
    let pct2 = totals2.target > 0 ? ((totals2.achieved/totals2.target)*100).toFixed(1)+'%' : '0%';
    html += `<tr class="summary-row"><td>Total</td><td>${totals1.target}</td><td>${totals1.achieved}</td><td>${totals1.gap}</td><td>${pct1}</td><td>${totals2.target}</td><td>${totals2.achieved}</td><td>${totals2.gap}</td><td>${pct2}</td></tr>`;
    html += '</tbody></table>';
    tableWrap.innerHTML = html;
    document.getElementById('modal-content-detail').classList.add('active');
    document.getElementById('modal-content-chart').classList.remove('active');
    document.getElementById('btn-tab-detail').classList.add('active');
    document.getElementById('btn-tab-chart').classList.remove('active');
    modal.style.display = 'block';
  }

  function getSchoolSummary(data) {
    let summary = {};
    data.forEach(row => {
      if (row.SchoolId && row.SchoolId !== 'exec' && row.Activity === 'Admissions') {
        let name = schoolNameMap[row.SchoolId] || row.SchoolId;
        if (!summary[name]) summary[name] = {target:0, achieved:0, gap:0, percent:'0%'};
        summary[name].target += cleanNum(row.Target);
        summary[name].achieved += cleanNum(row.Achieved);
      }
    });
    Object.keys(summary).forEach(key => {
      let s = summary[key];
      s.gap = Math.max(0, s.target - s.achieved);
      s.percent = s.target > 0 ? ((s.achieved/s.target)*100).toFixed(1)+'%' : '0%';
    });
    return summary;
  }
  function updateSchoolTiles(data) {
    // Update school tiles with aggregated data
    let schoolAgg = {};
    Object.keys(schoolNameMap).forEach(k => schoolAgg[k] = {});

    data.forEach(row => {
      let target = cleanNum(row.Target), achieved = cleanNum(row.Achieved);
      if (row.SchoolId !== "exec" && row.SchoolId) {
          if (!schoolAgg[row.SchoolId]) schoolAgg[row.SchoolId] = {};
          if (!schoolAgg[row.SchoolId][row.Activity]) {
              schoolAgg[row.SchoolId][row.Activity] = { target: 0, achieved: 0 };
          }
          schoolAgg[row.SchoolId][row.Activity].target += target;
          schoolAgg[row.SchoolId][row.Activity].achieved += achieved;
      }
    });

    Object.keys(schoolAgg).forEach(schId => {
        const schoolDiv = document.getElementById(schId);
        if (schoolDiv) {
            const activities = schoolDiv.querySelectorAll('.activity');
            activities.forEach(activityDiv => {
                const actName = activityDiv.querySelector('h4').innerText.trim();
                if (schoolAgg[schId][actName]) {
                    const t = schoolAgg[schId][actName].target;
                    const a = schoolAgg[schId][actName].achieved;
                    const gap = Math.max(0, t - a);
                    const perfPercentage = t === 0 ? 0 : ((a / t) * 100);
                    
                    const metrics = activityDiv.querySelectorAll('.metric strong');
                    if(metrics.length >= 3) { metrics[0].innerText = t; metrics[1].innerText = a; metrics[2].innerText = gap; }
                    const spans = activityDiv.querySelectorAll('div[style*="justify-content:space-between"] span');
                    if(spans.length>1) spans[1].innerText = perfPercentage.toFixed(1) + '%';
                    
                    const progBar = activityDiv.querySelector('.progress span');
                    if(progBar) progBar.style.width = Math.min(perfPercentage, 100) + '%';

                    const bars = activityDiv.querySelectorAll('.mini-chart .bar');
                    if(bars.length >= 3) {
                        const maxVal = Math.max(t, gap);
                        const scale = maxVal === 0 ? 0 : 50 / maxVal; 
                        bars[0].style.height = Math.max((t * scale), 5) + 'px';
                        bars[1].style.height = Math.max((a * scale), 5) + 'px';
                        bars[2].style.height = Math.max((gap * scale), 5) + 'px';
                        bars[2].style.background = gap === 0 ? "#cbd5e1" : "linear-gradient(180deg,#94a3b8,#64748b)";
                    }

                    const statBadge = activityDiv.querySelector('.status');
                    if(statBadge) {
                       if (perfPercentage >= 80) { statBadge.className = 'status low'; statBadge.innerHTML = svgSuccess + 'On Track'; }
                       else if (perfPercentage >= 40) { statBadge.className = 'status medium'; statBadge.innerHTML = svgWarn + 'Monitor'; }
                       else { statBadge.className = 'status high'; statBadge.innerHTML = svgDanger + 'High Risk'; }
                    }
                }
            });
        }
    });
  }

  function updateDashboard(data) {
    let globalTarget = 0, globalAchieved = 0, partnersTarget = 0, partnersAchieved = 0;
    let execPlacementsPl = 0, examAppeared = 0, examPassed = 0;
    let execStu = 0, execFac = 0;
    let totalInternships = 0;

    let placementPackages = [];
    let placementInternships = [];
    let placementCompanies = new Set();
    
    let schoolAgg = {};
    Object.keys(schoolNameMap).forEach(k => schoolAgg[k] = {});

    data.forEach(row => {
      let target = cleanNum(row.Target), achieved = cleanNum(row.Achieved);

      if (row.SchoolId === "exec") {
          if (row.Activity === "Exam Appeared") examAppeared = achieved;
          if (row.Activity === "Exam Passed") examPassed = achieved;
      }
      
      if (row.SchoolId !== "exec" && row.SchoolId) {
          if (!schoolAgg[row.SchoolId]) schoolAgg[row.SchoolId] = {};
          if (!schoolAgg[row.SchoolId][row.Activity]) {
              schoolAgg[row.SchoolId][row.Activity] = { target: 0, achieved: 0 };
          }
          schoolAgg[row.SchoolId][row.Activity].target += target;
          schoolAgg[row.SchoolId][row.Activity].achieved += achieved;

          if (row.Activity === "Placements") {
              if (achieved > 0 && !isNaN(achieved)) execPlacementsPl += 1;
              // Count internships (rows with DetailMeta containing "Internship" or stipend value)
              if (row.DetailMeta && row.DetailMeta.trim() !== "NA" && 
                  (row.DetailMeta.toLowerCase().includes('internship') || 
                   row.DetailMeta.toLowerCase().includes('stipend') ||
                   row.DetailMeta.match(/\d/))) {
                  totalInternships += 1;
              }
              if (row.DetailInfo && row.DetailInfo.trim() !== "NA") {
                  placementPackages.push(row.DetailInfo);
              }
              if (row.DetailMeta && row.DetailMeta.trim() !== "NA" && row.DetailMeta.toLowerCase() !== "internship cum ppo") {
                  placementInternships.push(row.DetailMeta);
              }
              if (row.DetailName && row.DetailName.trim() !== "NA") {
                  placementCompanies.add(row.DetailName.trim());
              }
          }

          if (row.Activity === "Student Achievement") execStu += 1;
          if (row.Activity === "Faculty Achievement") execFac += 1;
      }
    });

    Object.keys(schoolAgg).forEach(schId => {
        if (schoolAgg[schId]["Admissions"]) {
            globalTarget += schoolAgg[schId]["Admissions"].target;
            globalAchieved += schoolAgg[schId]["Admissions"].achieved;
        }
        if (schoolAgg[schId]["Partners Admission MIS"]) {
            partnersTarget += schoolAgg[schId]["Partners Admission MIS"].target;
            partnersAchieved += schoolAgg[schId]["Partners Admission MIS"].achieved;
        }
    });

    // Update school tiles
    updateSchoolTiles(data);

    if (globalTarget > 0) {
      document.getElementById('global-target').innerText = globalTarget; document.getElementById('global-achieved').innerText = globalAchieved;
      document.getElementById('global-gap').innerText = Math.max(0, globalTarget - globalAchieved); document.getElementById('global-perf').innerText = ((globalAchieved / globalTarget) * 100).toFixed(2) + '%';
    }
    if (partnersTarget > 0) {
      document.getElementById('partners-target').innerText = partnersTarget; document.getElementById('partners-achieved').innerText = partnersAchieved;
      document.getElementById('partners-gap').innerText = Math.max(0, partnersTarget - partnersAchieved); document.getElementById('partners-perf').innerText = ((partnersAchieved / partnersTarget) * 100).toFixed(2) + '%';
    }

    document.getElementById('main-place-placed').innerText = execPlacementsPl;
    document.getElementById('main-place-high').innerText = placementPackages.length > 0 ? extractMaxPackage(placementPackages) : "0";
    document.getElementById('main-place-avg').innerText = placementPackages.length > 0 ? calculateAveragePackage(placementPackages) : "0";
    document.getElementById('main-place-intern').innerText = placementInternships.length > 0 ? extractMaxPackage(placementInternships) : "0";
    document.getElementById('main-place-comp').innerText = placementCompanies.size;
    // Total Internships
    document.getElementById('main-place-internships').innerText = totalInternships;

    let totalExam = examAppeared > 0 ? examAppeared + 150 : 0;
    document.getElementById('main-exam-total').innerText = totalExam; document.getElementById('main-exam-reg').innerText = totalExam > 0 ? totalExam - 25 : 0;
    document.getElementById('main-exam-app').innerText = examAppeared; document.getElementById('main-exam-abs').innerText = (totalExam - 25) - examAppeared;
    // Result text is set by updateResultText() on month switch

    // Student Awards hardcoded to 11
    document.getElementById('exec-stu').innerText = 11; 
    document.getElementById('exec-fac').innerText = execFac;
  }

// Runs after school tiles exist (schools.js) and switchView is defined (above).
switchView("home-view");
