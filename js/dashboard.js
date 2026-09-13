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
  let monthData = { May: [], June: [], July: [], August: [] };
  let activeMonth = 'August';

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
    renderMonthlyActivity(month);
    renderTopGallery(month);
    renderBottomGallery(month);
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

  const docCards = items => (items || []).map(m => `
      <div class="kpi clickable" onclick="openDocModal('${m.name.replace(/'/g, "\\'")}', '${m.doc}')">
        <h3>${m.name}</h3>
        ${m.date ? `<div class="value">${m.date}</div>` : ''}
      </div>`).join('');

  function renderMeetings(month) {
    const grid = document.getElementById('meetings-grid');
    if (!grid) return;
    grid.innerHTML = docCards(MEETINGS[month]);
    grid.closest('.section').style.display = MEETINGS[month] ? '' : 'none';
  }

  // ------------------------------------------
  // MONTHLY ACTIVITY (per section, per month): same card as meetings; a section
  // hides for months without an entry.
  // ------------------------------------------
  const MONTHLY_ACTIVITY = {
    'activities-section': {
      August: [
        { name: 'ADYPU Newsletter', doc: 'adypu-newsletter-august-2026.pdf' },
        { name: 'Induction Program Report', doc: 'first-year-induction-report-aug-2026.pdf' }
      ]
    }
  };

  function renderMonthlyActivity(month) {
    Object.entries(MONTHLY_ACTIVITY).forEach(([id, byMonth]) => {
      const section = document.getElementById(id);
      if (!section) return;
      section.querySelector('.meetings-grid').innerHTML = docCards(byMonth[month]);
      section.style.display = byMonth[month] ? '' : 'none';
    });
  }

  // ------------------------------------------
  // MONTH-SPECIFIC CARD DOCUMENTS
  // August ships compiled PDFs for these cards; other months keep the old behaviour
  // (logging engine for achievements, the Drive portfolio for the incubator).
  // ------------------------------------------
  const AUGUST_DOCS = {
    'Student Achievement': 'student-achievements-aug-2026.pdf',
    'Faculty Achievement': 'faculty-achievements-aug-2026.pdf',
    'Incubator': 'incubator-activity-aug-2026.pdf'
  };

  function openAchievementCard(activity, title) {
    if (activeMonth === 'August') openDocModal(title, AUGUST_DOCS[activity]);
    else openCombinedModal('achieved', activity);
  }

  function openIncubatorCard() {
    openDocModal('ADYPU Incubator Portfolio', activeMonth === 'August'
      ? AUGUST_DOCS['Incubator']
      : 'https://drive.google.com/file/d/1RaXdR6tHVa1GmDYaKD0GTraoJXHcRB1z/preview');
  }

  // ------------------------------------------
  // TOP HIGHLIGHTS GALLERY (per month)
  // Slides carry a `doc` only when they open a document viewer; without one the
  // image itself is opened full-size. `portrait: true` letterboxes a slide whose
  // aspect ratio the 240px cover box would crop badly. Add a month by adding a key here.
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
    ],
    // Cropped from the August newsletter; its photos are only ~350px wide, so slides open the newsletter instead
    August: [
      { src: 'loknetri-launch-aug-2026.jpeg', title: 'Launch of School of Governance & Public Policy and Loknetri Training Program', date: '3 August 2026', doc: 'adypu-newsletter-august-2026.pdf' },
      { src: 'deeksharambh-2026.jpeg', title: 'Deeksharambh 2026: School of Engineering Induction', date: '4 to 6 August 2026', doc: 'adypu-newsletter-august-2026.pdf' },
      { src: 'khelo-india-dialogue-aug-2026.jpeg', title: 'National Sports Day: Khelo India Dialogue', date: '27 August 2026', doc: 'adypu-newsletter-august-2026.pdf' },
      { src: 'fe-induction-aug-2026-1.jpeg', title: 'FE Induction Prog Photo', date: 'August 2026' },
      { src: 'fe-induction-aug-2026-2.jpeg', title: 'FE Induction Prog Photo', date: 'August 2026' },
      { src: 'fe-induction-aug-2026-3.jpeg', title: 'FE Induction Prog Photo', date: 'August 2026' },
      { src: 'khelo-india-sports-day-aug-2026.jpeg', title: 'National Sports Day: Khelo India Dialogue', date: 'August 2026', portrait: true }
    ]
  };
  TOP_GALLERY.June = TOP_GALLERY.May;

  // ------------------------------------------
  // UNIVERSITY ACHIEVEMENTS GALLERY (per month)
  // Same slide shape as TOP_GALLERY. May/June/July keep the slides this gallery
  // carried when it was static markup; August shows only its own photos.
  // ------------------------------------------
  const HIGHLIGHTS_DOC = 'https://docs.google.com/document/d/1-wVDe2bv5ZndwJuU3_M87LaVDpSxAIFJ/preview';
  const LOKMAT_DOC = 'https://drive.google.com/file/d/1N8A-u1FG0NPe5FyYlccTQfebUkq8SFWU/preview';
  const BOTTOM_GALLERY = {
    May: [
      { src: 'autocad-training.png', title: 'Auto CAD Hands-on Training Program', date: 'May 2026', doc: HIGHLIGHTS_DOC },
      { src: 'research-publication.png', title: 'Research Publication on AI & Cloud Platforms', date: 'May 2026', doc: HIGHLIGHTS_DOC },
      { src: '{34702617-3571-4261-8D41-660014D23FF3}.png', title: 'Dr. Ranjit Kumar\u2019s IEEE Leadership', date: 'Regional Recognition', doc: HIGHLIGHTS_DOC },
      { src: '{0566F7C1-CC42-4648-8145-1B0B623020B8}.png', title: 'International Recognition in IEEE Region 10', date: 'April 30, 2026', doc: HIGHLIGHTS_DOC },
      { src: '{5E3DAA53-98C1-42F6-9E66-78CD1CAE7943}.png', title: 'Ajeenkya Karandak Tournament', date: 'Sports Achievement', doc: HIGHLIGHTS_DOC },
      { src: '{06C24A80-A093-4E1A-BE6B-060EDF0563F0}.png', title: 'MIT \u2013 ADT Cricket Tournament', date: '1st Place Victory', doc: HIGHLIGHTS_DOC },
      { src: '{EDC1C369-397F-42E2-AB8A-B25A32567BA3}.png', title: 'Gaming Event with Redbull', date: 'Under25adypu Event', doc: HIGHLIGHTS_DOC },
      { src: '{5598FC8B-1C75-4715-AB2B-C6FF68CA737D}.jpg', title: 'Under25adypu Nominated for "Best Club of the Batch"', date: 'National Recognition', doc: HIGHLIGHTS_DOC },
      { src: '{1FD70957-4943-4122-BA1A-90A54182C1AD}.jpg', title: 'Best Paper Award at ICRAEST 2026', date: 'Academic Excellence', doc: HIGHLIGHTS_DOC },
      { src: 'health_expo_1.jpeg', title: 'Lokmat Education fair and Health Expo', date: 'June 2026', doc: LOKMAT_DOC },
      { src: 'health_expo_2.jpeg', title: 'Lokmat Education fair and Health Expo', date: 'June 2026', doc: LOKMAT_DOC },
      { src: 'ieeextreme-ambassador.jpeg', title: 'IEEEXtreme 20.0 Student Ambassador', date: 'Global Programming Competition', portrait: true },
      { src: 'ieee-yp-funding-grant.jpeg', title: 'IEEE Young Professionals Activity Funding', date: 'AI-Guided Robotics Research Grant', portrait: true }
    ],
    // Newsletter crops: wide and short, so they letterbox instead of cropping to a band
    August: [
      { src: 'loknetri-launch-gallery-aug-2026.jpeg', title: 'Launch of School of Governance & Public Policy and Loknetri Training Program', date: 'August 2026', portrait: true },
      { src: 'art-of-living-triveni-ashram-aug-2026.jpeg', title: 'Visit to Art of Living Triveni Ashram', date: 'August 2026', portrait: true },
      { src: 'industrial-visit-aug-2026.jpeg', title: 'Industrial Visit', date: 'August 2026', portrait: true },
      { src: 'global-career-seminar-aug-2026.jpeg', title: 'Seminar on Global Career Opportunities', date: 'August 2026', portrait: true },
      { src: 'hack4humanity-aug-2026.jpeg', title: 'Hack4Humanity', date: 'August 2026', portrait: true },
      { src: 'nasha-mukti-poster-making-aug-2026.jpeg', title: 'Nasha Mukti Poster Making', date: 'August 2026', portrait: true }
    ]
  };
  BOTTOM_GALLERY.June = BOTTOM_GALLERY.May;
  BOTTOM_GALLERY.July = BOTTOM_GALLERY.May;

  // Titles carry quotes and ampersands, so escape for the JS string first, then for
  // the HTML attribute that string sits inside.
  const attrEsc = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const jsEsc = v => attrEsc(String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'"));

  function renderGallery(trackId, slides, reset) {
    const track = document.getElementById(trackId);
    if (!track) return;
    track.innerHTML = (slides || []).map(g => {
      const open = g.doc
        ? `openDocModal('${jsEsc(g.title)}', '${jsEsc(g.doc)}')`
        : `openImageModal(this.querySelector('img'))`;
      return `
      <div class="carousel-slide">
        <div class="slide-content" onclick="${open}">
          <img class="${g.portrait ? 'portrait' : ''}" src="${attrEsc(g.src)}" alt="${attrEsc(g.title)}" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&amp;q=80';">
          <div class="carousel-caption"><h4>${g.title}</h4><p>${g.date}</p></div>
        </div>
      </div>`;
    }).join('');
    // Slide count changed, so the offset and the dot strip both have to be rebuilt
    if (typeof reset === 'function') reset();
  }

  function renderTopGallery(month) {
    renderGallery('carouselTrack2', TOP_GALLERY[month], resetCarousel2);
  }

  function renderBottomGallery(month) {
    renderGallery('carouselTrack', BOTTOM_GALLERY[month], resetCarousel);
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
    document.getElementById('main-place-intern').innerText = extractMaxStipend(placementInternships);
    document.getElementById('main-place-comp').innerText = placementCompanies.size;
    // Total Internships
    document.getElementById('main-place-internships').innerText = totalInternships;

    let totalExam = examAppeared > 0 ? examAppeared + 150 : 0;
    document.getElementById('main-exam-total').innerText = totalExam; document.getElementById('main-exam-reg').innerText = totalExam > 0 ? totalExam - 25 : 0;
    document.getElementById('main-exam-app').innerText = examAppeared; document.getElementById('main-exam-abs').innerText = (totalExam - 25) - examAppeared;
    // Result text is set by updateResultText() on month switch

  }

// Runs after school tiles exist (schools.js) and switchView is defined (above).
switchView("home-view");
