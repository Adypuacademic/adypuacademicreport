  // ==========================================
  // MOBILE SIDEBAR TOGGLE LOGIC
  // ==========================================
  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  }

  // Auto-close sidebar on mobile when navigating
  document.querySelectorAll('.sidebar a.nav-link, .sidebar-dropdown-content a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      }
    });
  });

  // ==========================================
  // MODAL LOGIC (KPI Data & Documents)
  // ==========================================
  

  function openCombinedModal(metricType, activityName) {
      if (!globalRawData || globalRawData.length === 0) { 
        alert("Please upload the data tracking document first."); 
        return; 
      }

      // Check if this is Student Achievement - use hardcoded data
      let useHardcodedData = (activityName === 'Student Achievement');
      
      switchModalTab('chart');
      document.getElementById('modalTitle').innerText = activityName + " Workspace Analysis";
      let tableWrap = document.getElementById('modalTableWrapper'), galleryGrid = document.getElementById('modalGalleryWrapper');
      tableWrap.style.display = "none"; galleryGrid.style.display = "none";

      let labels = [], datasetData = [];

      if (metricType === 'gallery') {
          switchModalTab('chart'); galleryGrid.style.display = "block";
          if (useHardcodedData) {
              hardcodedStudentAwards.forEach(row => {
                  let schoolName = schoolNameMap[row.SchoolId] || row.SchoolId;
                  labels.push(schoolName);
                  datasetData.push(1);
              });
          } else {
              globalRawData.forEach(row => {
                  if (row.Activity === activityName && row.SchoolId !== 'exec') { 
                      labels.push(schoolNameMap[row.SchoolId] || row.SchoolId); 
                      datasetData.push(1); 
                  }
              });
          }
          document.getElementById('galleryContainer').innerHTML = `
              <div class="gallery-item" onclick="alert('Opening details...')"><div style="height:140px; background:url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80') center/cover;"></div><div class="info"><div class="title">HPC Expert Summit</div><div class="date">May 14, 2026</div></div></div>
              <div class="gallery-item" onclick="alert('Opening details...')"><div style="height:140px; background:url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80') center/cover;"></div><div class="info"><div class="title">NAAC Reform Panel</div><div class="date">May 12, 2026</div></div></div>
          `;
      }

      if (metricType !== 'gallery') {
          tableWrap.style.display = "block";
          let hasDetails = ["University Achievement", "Student Achievement", "Faculty Achievement"].includes(activityName);
          let isPartners = (activityName === 'Partners Admission MIS');

          if (useHardcodedData) {
              // HARDCODED STUDENT AWARDS - 11 entries
              let html = `<table class="detail-table"><thead><tr><th style="width:15%;">School</th><th style="width:20%;">Student Name</th><th style="width:35%;">Program</th><th style="width:30%;">Achievement</th></tr></thead><tbody>`;
              hardcodedStudentAwards.forEach(row => {
                  let schoolName = schoolNameMap[row.SchoolId] || row.SchoolId;
                  labels.push(schoolName);
                  datasetData.push(1);
                  html += `<tr><td><b>${schoolName}</b></td><td>${row.DetailName||'-'}</td><td>${row.DetailInfo||'-'}</td><td>${row.DetailMeta||'-'}</td></tr>`;
              });
              html += `</tbody></table>`;
              tableWrap.innerHTML = html;
          } else if (hasDetails) {
              let html = `<table class="detail-table"><thead><tr><th style="width:15%;">School</th><th style="width:20%;">Name / Faculty</th><th style="width:35%;">Log Info</th><th style="width:15%;">Outcome</th><th style="width:15%;">Date</th></tr></thead><tbody>`;
              globalRawData.forEach(row => {
                  if (row.Activity === activityName && row.SchoolId !== 'exec') {
                      labels.push(schoolNameMap[row.SchoolId] || row.SchoolId); datasetData.push(1);
                      html += `<tr><td><b>${schoolNameMap[row.SchoolId] || row.SchoolId}</b></td><td>${row.DetailName||'-'}</td><td>${row.DetailInfo||'-'}</td><td>${row.DetailMeta||'-'}</td><td>${row.DetailDate||'-'}</td></tr>`;
                  }
              });
              tableWrap.innerHTML = html + `</tbody></table>`;
          } else if (isPartners) {
              let html = `<table class="detail-table"><thead><tr><th style="width:20%;">School</th><th style="width:20%;">Partner</th><th style="width:30%;">Program</th><th style="width:10%;">Target</th><th style="width:10%;">Achieved</th><th style="width:10%;">Gap</th></tr></thead><tbody>`;
              let agg = {};
              
              globalRawData.forEach(row => {
                  if (row.Activity === activityName && row.SchoolId !== 'exec') {
                      let sName = schoolNameMap[row.SchoolId] || row.SchoolId;
                      let t = cleanNum(row.Target), a = cleanNum(row.Achieved), g = Math.max(0, t - a);
                      
                      html += `<tr><td><b>${sName}</b></td><td>${row.DetailName||'-'}</td><td>${row.DetailInfo||'-'}</td><td>${t}</td><td>${a}</td><td>${g}</td></tr>`;
                      
                      if (!agg[sName]) agg[sName] = { target: 0, achieved: 0, gap: 0 };
                      agg[sName].target += t;
                      agg[sName].achieved += a;
                      agg[sName].gap += g;
                  }
              });
              tableWrap.innerHTML = html + `</tbody></table>`;
              
              Object.keys(agg).forEach(sName => {
                  labels.push(sName);
                  let val = metricType === 'target' ? agg[sName].target : metricType === 'gap' ? agg[sName].gap : agg[sName].achieved;
                  datasetData.push(val);
              });
          } else {
              let html = `<table class="detail-table"><thead><tr><th style="width:30%;">School</th><th>Target</th><th>Achieved</th><th>Gap</th><th>Perf Rate</th></tr></thead><tbody>`;
              let agg = {};
              globalRawData.forEach(row => {
                  if (row.Activity === activityName && row.SchoolId !== "exec" && schoolNameMap[row.SchoolId]) {
                      let sName = schoolNameMap[row.SchoolId];
                      if(!agg[sName]) agg[sName] = { t:0, a:0 };
                      agg[sName].t += cleanNum(row.Target);
                      agg[sName].a += cleanNum(row.Achieved);
                  }
              });
              Object.keys(agg).forEach(sName => {
                  let t = agg[sName].t, a = agg[sName].a, g = Math.max(0, t - a), pct = t===0?0:(a*100/t);
                  let val = metricType==='target'?t: metricType==='gap'?g : a;
                  if (val > 0) { datasetData.push(val); labels.push(sName); }
                  html += `<tr><td><b>${sName}</b></td><td>${t}</td><td>${a}</td><td>${g}</td><td><span style="color:var(--primary); font-weight:700;">${pct.toFixed(1)}%</span></td></tr>`;
              });
              tableWrap.innerHTML = html + `</tbody></table>`;
          }
      }

      let uLabels = [...new Set(labels)];
      let sData = uLabels.map((lbl, idx) => {
          if (useHardcodedData) {
              return hardcodedStudentAwards.filter(r => (schoolNameMap[r.SchoolId] || r.SchoolId) === lbl).length;
          }
          if (["University Achievement", "Student Achievement", "Faculty Achievement"].includes(activityName)) 
              return globalRawData.filter(r => r.Activity === activityName && schoolNameMap[r.SchoolId] === lbl).length;
          return datasetData[idx] || 0;
      });

      const ctx = document.getElementById('pieChartCanvas').getContext('2d');
      if (activePieChart) activePieChart.destroy();
      activePieChart = new Chart(ctx, {
          type: 'doughnut',
          data: { labels: uLabels.map((l, i) => l + ' : ' + sData[i]), datasets: [{ data: sData, backgroundColor: chartColors, borderWidth: 2, borderColor: '#fff' }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }, datalabels: { color: '#fff', font:{weight:'bold'}, formatter: (v, ctx) => { let sum=ctx.chart._metasets[0].total; return sum===0?'':((v*100/sum)>5?(v*100/sum).toFixed(1)+"%":''); } } } }
      });
      document.getElementById('combinedModal').style.display = 'block';
  }

  function closeCombinedModal() { document.getElementById('combinedModal').style.display = 'none'; }
  
  function switchModalTab(tabType) {
    document.querySelectorAll('.modal-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.modal-body-content').forEach(content => content.classList.remove('active'));
    if(tabType === 'chart') {
      document.getElementById('btn-tab-chart').classList.add('active');
      document.getElementById('modal-content-chart').classList.add('active');
    } else {
      document.getElementById('btn-tab-detail').classList.add('active');
      document.getElementById('modal-content-detail').classList.add('active');
    }
  }

  function openDocModal(title, url) {
      document.getElementById('docModalTitle').innerText = title;
      
      let cleanUrl = url.split('#')[0];
      let iframeUrl = cleanUrl;
      
      if (cleanUrl.includes('docs.google.com/document/d/')) {
          let baseUrl = cleanUrl.split('/edit')[0].split('/preview')[0];
          iframeUrl = baseUrl + '/preview';
      } else if (cleanUrl.includes('drive.google.com/file/d/')) {
          let fileId = cleanUrl.match(/\/d\/([^\/]+)/);
          if (fileId && fileId[1]) {
              iframeUrl = `https://drive.google.com/file/d/${fileId[1]}/preview`;
          }
      }

      document.getElementById('docModalIframe').src = iframeUrl;
      document.getElementById('docModalLink').href = cleanUrl; 
      document.getElementById('docModal').style.display = 'block';
  }
  
  function closeDocModal() {
      document.getElementById('docModal').style.display = 'none';
      document.getElementById('docModalIframe').src = '';
  }

  function openImageModal(imgEl) {
      const modal = document.getElementById('imageModal');
      const img = document.getElementById('imageModalImg');
      const title = document.getElementById('imageModalTitle');
      if (!imgEl) return;
      img.src = imgEl.currentSrc || imgEl.src;
      img.alt = imgEl.alt || '';
      title.innerText = imgEl.alt || 'Image View';
      modal.style.display = 'block';
  }

  function closeImageModal() {
      document.getElementById('imageModal').style.display = 'none';
      document.getElementById('imageModalImg').src = '';
  }

  window.onclick = function(event) {
      if (event.target == document.getElementById('combinedModal')) closeCombinedModal();
      if (event.target == document.getElementById('docModal')) closeDocModal();
      if (event.target == document.getElementById('imageModal')) closeImageModal();
      if (event.target == document.querySelector('.sidebar-overlay')) toggleSidebar();
  }
