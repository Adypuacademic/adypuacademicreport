  // ==========================================
  // UNIFIED NEW REPORT GENERATION SYSTEM (NATIVE PRINT)
  // ==========================================

  function getExecutiveKPIs() {
      let adT = 0, adA = 0, partT = 0, partA = 0, plTotal = 0;
      let pkgs = [], interns = [];
      let execStu = 0, execFac = 0, execUni = 0;
      let examAppeared = 0, examPassed = 0;
      let companies = new Set();
      let totalInternships = 0;
      
      globalRawData.forEach(r => {
          if (r.SchoolId === 'exec') {
             if (r.Activity === 'Exam Appeared') examAppeared = cleanNum(r.Achieved);
             if (r.Activity === 'Exam Passed') examPassed = cleanNum(r.Achieved);
          } else if (r.SchoolId) {
              if (r.Activity === 'Admissions') { adT += cleanNum(r.Target); adA += cleanNum(r.Achieved); }
              if (r.Activity === 'Partners Admission MIS') { partT += cleanNum(r.Target); partA += cleanNum(r.Achieved); }
              if (r.Activity === 'Placements') {
                  if (cleanNum(r.Achieved) > 0) plTotal += 1;
                  if (r.DetailMeta && r.DetailMeta !== 'NA' && 
                      (r.DetailMeta.toLowerCase().includes('internship') || 
                       r.DetailMeta.toLowerCase().includes('stipend') ||
                       r.DetailMeta.match(/\d/))) {
                      totalInternships += 1;
                  }
                  if (r.DetailInfo && r.DetailInfo !== 'NA') pkgs.push(r.DetailInfo);
                  if (r.DetailMeta && r.DetailMeta !== 'NA' && r.DetailMeta.toLowerCase() !== 'internship cum ppo') interns.push(r.DetailMeta);
                  if (r.DetailName && r.DetailName !== 'NA') companies.add(r.DetailName.trim());
              }
              if (r.Activity === "Student Achievement") execStu++;
              if (r.Activity === "Faculty Achievement") execFac++;
              if (r.Activity === "University Achievement") execUni++;
          }
      });
      return {
          totalAdmissionsTarget: adT, 
          totalAdmissionsAchieved: adA,
          admissionsGap: Math.max(0, adT - adA),
          admissionsRate: adT > 0 ? ((adA / adT) * 100).toFixed(2) + '%' : '0.00%',
          partnersTarget: partT, 
          partnersAchieved: partA,
          partnersGap: Math.max(0, partT - partA),
          partnersRate: partT > 0 ? ((partA / partT) * 100).toFixed(2) + '%' : '0.00%',
          totalPlaced: plTotal,
          totalInternships: totalInternships,
          highestPackage: pkgs.length > 0 ? extractMaxPackage(pkgs) : "0",
          averagePackage: pkgs.length > 0 ? calculateAveragePackage(pkgs) : "0",
          highestInternship: interns.length > 0 ? extractMaxPackage(interns) : "0",
          totalCompanies: companies.size,
          examTotal: examAppeared > 0 ? examAppeared + 150 : 0,
          examReg: examAppeared > 0 ? (examAppeared + 150) - 25 : 0,
          examAppeared: examAppeared,
          examAbs: examAppeared > 0 ? ((examAppeared + 150) - 25) - examAppeared : 0,
          examProg: examAppeared > 0 ? "In Progress" : "-",
          execStu: 11, // Hardcoded to 11
          execFac: execFac,
          execUni: execUni
      };
  }

  function getSchoolData(activityStr) {
      let sch = {};
      Object.keys(schoolNameMap).forEach(k => sch[k] = { target: 0, achieved: 0 });
      globalRawData.forEach(r => {
          if (r.SchoolId !== 'exec' && r.Activity === activityStr && sch[r.SchoolId]) {
              sch[r.SchoolId].target += cleanNum(r.Target);
              sch[r.SchoolId].achieved += cleanNum(r.Achieved);
          }
      });
      let arr = [];
      Object.keys(sch).forEach(k => {
          let d = sch[k];
          if (d.target > 0 || d.achieved > 0) {
              let gap = Math.max(0, d.target - d.achieved);
              let pct = d.target > 0 ? (d.achieved * 100 / d.target).toFixed(1) + '%' : '0%';
              arr.push({ schoolId: k, school: schoolNameMap[k], target: d.target, achieved: d.achieved, gap: gap, percent: pct });
          }
      });
      return arr;
  }
  
  function getAdmissionsData() { return getSchoolData('Admissions'); }
  function getPartnersData() { return getSchoolData('Partners Admission MIS'); }

  function getPartnersDetailedData(schoolIdFilter = null) {
      let agg = {};
      globalRawData.forEach(r => {
          if (r.SchoolId !== 'exec' && r.Activity === 'Partners Admission MIS') {
              if (!schoolIdFilter || r.SchoolId === schoolIdFilter) {
                  let schoolName = schoolNameMap[r.SchoolId] || r.SchoolId;
                  let partnerName = r.DetailName || '-';
                  let key = schoolName + '___' + partnerName;
                  
                  if (!agg[key]) {
                      agg[key] = {
                          school: schoolName,
                          partner: partnerName,
                          target: 0,
                          achieved: 0
                      };
                  }
                  agg[key].target += cleanNum(r.Target);
                  agg[key].achieved += cleanNum(r.Achieved);
              }
          }
      });
      let arr = Object.values(agg);
      arr.sort((a, b) => a.school.localeCompare(b.school));
      return arr;
  }

  function getPlacementsData(schoolIdFilter = null) {
      let arr = [];
      globalRawData.forEach(r => {
          if (r.SchoolId !== 'exec' && r.Activity === 'Placements') {
              if (!schoolIdFilter || r.SchoolId === schoolIdFilter) {
                  arr.push({
                      school: schoolNameMap[r.SchoolId] || r.SchoolId,
                      company: r.DetailName || '-',
                      package: r.DetailInfo || '-',
                      stipend: r.DetailMeta || '-'
                  });
              }
          }
      });
      let validArr = [];
      arr.forEach(d => {
          if (!d.company || d.company.trim() === '' || d.company === 'NA') d.company = '-';
          if (!d.package || d.package.trim() === '' || d.package === 'NA') d.package = '-';
          if (!d.stipend || d.stipend.trim() === '' || d.stipend === 'NA') d.stipend = '-';
          
          if (d.school !== '---' && d.company !== '---' && d.package !== '-') {
              validArr.push(d);
          }
      });
      validArr.sort((a, b) => a.school.localeCompare(b.school));
      return validArr;
  }

  function getExamDetailedData() {
      let sch = {};
      Object.keys(schoolNameMap).forEach(k => sch[k] = { registered: 0, appeared: 0, passed: 0 });
      globalRawData.forEach(r => {
          if (r.SchoolId !== 'exec' && sch[r.SchoolId]) {
              if (r.Activity === 'Examinations' || r.Activity === 'Exam Appeared' || r.Activity === 'Examination MIS') {
                  sch[r.SchoolId].registered += cleanNum(r.Target);
                  sch[r.SchoolId].appeared += cleanNum(r.Achieved);
              }
              if (r.Activity === 'Exam Passed') {
                  sch[r.SchoolId].passed += cleanNum(r.Achieved);
              }
          }
      });
      let arr = [];
      Object.keys(sch).forEach(k => {
          let d = sch[k];
          if (d.registered > 0 || d.appeared > 0) {
              let absent = Math.max(0, d.registered - d.appeared);
              let passPct = d.appeared > 0 ? ((d.passed / d.appeared) * 100).toFixed(1) + '%' : '-';
              arr.push({ schoolId: k, school: schoolNameMap[k], registered: d.registered, appeared: d.appeared, absent: absent, passPct: passPct });
          }
      });
      return arr;
  }

  function getLogData(activityStr, limit = null, schoolIdFilter = null) {
      let arr = [];
      for (let r of globalRawData) {
          if (r.SchoolId !== 'exec' && r.Activity === activityStr) {
              if (!schoolIdFilter || r.SchoolId === schoolIdFilter) {
                  arr.push({
                      school: schoolNameMap[r.SchoolId] || r.SchoolId,
                      name: r.DetailName || '-',
                      detail: r.DetailInfo || '-',
                      meta: r.DetailMeta || '-',
                      date: r.DetailDate || '-'
                  });
              }
          }
          if (limit && arr.length >= limit) break;
      }
      return arr;
  }
  
  function getStudentAchievements(limit = null, schoolIdFilter = null) { return getLogData('Student Achievement', limit, schoolIdFilter); }
  function getFacultyAchievements(limit = null, schoolIdFilter = null) { return getLogData('Faculty Achievement', limit, schoolIdFilter); }
  function getUniversityAchievements() { return getLogData('University Achievement'); }

  function generateHtmlTableWithSummary(headers, rows) {
      if (!rows || rows.length === 0) return '';
      let html = '<table><thead><tr>';
      headers.forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';
      let tTarget = 0, tAchieved = 0, tGap = 0;
      rows.forEach(r => {
          html += `<tr><td>${r.school}</td><td>${r.target}</td><td>${r.achieved}</td><td>${r.gap}</td><td>${r.percent}</td></tr>`;
          tTarget += r.target;
          tAchieved += r.achieved;
          tGap += r.gap;
      });
      let tPct = tTarget > 0 ? ((tAchieved / tTarget) * 100).toFixed(1) + '%' : '0%';
      html += `<tr class="summary-row"><td>Total Summary</td><td>${tTarget}</td><td>${tAchieved}</td><td>${tGap}</td><td>${tPct}</td></tr>`;
      html += '</tbody></table>';
      return html;
  }

  function generateHtmlTable(headers, rows) {
      if (!rows || rows.length === 0) return '';
      let html = '<table><thead><tr>';
      headers.forEach(h => html += `<th>${h}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(r => {
          html += '<tr>';
          r.forEach(cell => html += `<td>${cell}</td>`);
          html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
  }

  function buildReportHTML(type, img1 = null, img2 = null) {
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      const baseStyle = `
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              padding: 20px; 
              background: white;
              color: #334155;
          }
          .header { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px; 
              border-bottom: 2px solid #C21B27; 
              padding-bottom: 10px;
          }
          .header-left h1 { color: #C21B27; font-size: 28px; margin-bottom: 4px; text-transform: uppercase; }
          .header-left .subtitle { font-size: 14px; font-weight: bold; }
          .header-right { text-align: right; font-size: 13px; color: #64748b; }
          .date { font-size: 13px; color: #64748b; text-align: right; }
          
          .row { display: flex; gap: 15px; margin-bottom: 15px; }
          .col { flex: 1; }
          
          .section-title { 
              background: #f1f5f9; 
              padding: 10px 15px; 
              margin: 25px 0 15px 0;
              font-size: 18px;
              font-weight: bold;
              color: #1e293b;
              border-left: 5px solid #C21B27;
              text-transform: uppercase;
          }
          
          .kpi-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px; }
          .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
          .kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 15px; }
          .kpi-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 15px; }
          
          .kpi-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 15px 10px;
              border-radius: 6px;
              text-align: center;
          }
          .kpi-value { font-size: 24px; font-weight: 800; color: #1e293b; }
          .kpi-label { font-size: 12px; color: #64748b; margin-top: 6px; text-transform: uppercase; font-weight: bold; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th { background: #e2e8f0; color: #1e293b; padding: 10px 12px; text-align: left; font-size: 13px; border: 1px solid #cbd5e1; }
          td { border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 12px; vertical-align: top; }
          tr:nth-child(even) { background: #f8fafc; }
          .summary-row { font-weight: bold; background: #e2e8f0 !important; color: #1e293b; }
          
          .page-break { page-break-after: always; }
          .cover-page { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
          .cover-title { font-size: 32px; color: #C21B27; border-bottom: 3px solid #C21B27; padding-bottom: 15px; margin-bottom: 20px; text-transform: uppercase; }
          
          .sub-heading { font-size: 16px; color: #334155; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; font-weight: bold; }
          
          .pdf-gallery { display: flex; flex-wrap: wrap; margin: -10px; }
          .pdf-gallery-item { width: calc(33.333% - 20px); margin: 10px; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; page-break-inside: avoid; text-align: center; background: #f8fafc; }
          .pdf-gallery-item img { width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px; background: #e2e8f0; }
          .pdf-gallery-item h4 { font-size: 13px; margin: 0 0 4px 0; color: #1e293b; font-weight: bold; }
          .pdf-gallery-item p { font-size: 12px; color: #64748b; margin: 0; }

          @media print {
              body { padding: 0; }
              .no-print { display: none; }
          }
      </style>`;

      let content = '';
      
      if (type === 'main') {
          if (img1 && img2) {
              content += `
                  <div class="cover-page" style="height: auto; min-height: 90vh; display: block; text-align: center; padding-top: 20px;">
                      <h2 style="color: #C21B27; margin-bottom: 20px; font-size: 24px; text-transform: uppercase;">Dashboard Snapshot – Page 1 of 2</h2>
                      <img src="${img1}" style="width: 100%; max-width: 1000px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                  </div>
                  <div class="page-break"></div>
                  <div class="cover-page" style="height: auto; min-height: 90vh; display: block; text-align: center; padding-top: 20px;">
                      <h2 style="color: #C21B27; margin-bottom: 20px; font-size: 24px; text-transform: uppercase;">Dashboard Snapshot – Page 2 of 2</h2>
                      <img src="${img2}" style="width: 100%; max-width: 1000px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                  </div>
                  <div class="page-break"></div>
              `;
          }

          const kpis = getExecutiveKPIs();
          const adm = getAdmissionsData();
          const part = getPartnersData();
          const partDetail = getPartnersDetailedData();
          const exam = getExamDetailedData();
          
          const monthlyHighlightsData = [
              { title: "Auto CAD Hands-on Training Program", category: "University", date: "May 2026" },
              { title: "Research Publication on AI & Cloud Platforms", category: "Faculty", date: "May 2026" },
              { title: "Dr. Ranjit Kumar’s IEEE Leadership", category: "Faculty", date: "Regional Recognition" },
              { title: "International Recognition in IEEE Region 10", category: "University", date: "April 30, 2026" },
              { title: "Ajeenkya Karandak Tournament", category: "Student", date: "Sports Achievement" },
              { title: "MIT – ADT Cricket Tournament", category: "Student", date: "1st Place Victory" },
              { title: "Gaming Event with Redbull", category: "Student", date: "Under25adypu Event" },
              { title: "Under25adypu Nominated for “Best Club of the Batch”", category: "Student", date: "National Recognition" },
              { title: "Best Paper Award at ICRAEST 2026", category: "Faculty", date: "Academic Excellence" }
          ];

          const galleryImagesData = [
              { src: 'autocad-training.png', title: 'Auto CAD Hands-on Training Program', subtitle: 'May 2026' },
              { src: 'research-publication.png', title: 'Research Publication on AI & Cloud Platforms', subtitle: 'May 2026' },
              { src: '{34702617-3571-4261-8D41-660014D23FF3}.png', title: 'Dr. Ranjit Kumar’s IEEE Leadership', subtitle: 'Regional Recognition' },
              { src: '{0566F7C1-CC42-4648-8145-1B0B623020B8}.png', title: 'International Recognition in IEEE Region 10', subtitle: 'April 30, 2026' },
              { src: '{5E3DAA53-98C1-42F6-9E66-78CD1CAE7943}.png', title: 'Ajeenkya Karandak Tournament', subtitle: 'Sports Achievement' },
              { src: '{06C24A80-A093-4E1A-BE6B-060EDF0563F0}.png', title: 'MIT – ADT Cricket Tournament', subtitle: '1st Place Victory' },
              { src: '{EDC1C369-397F-42E2-AB8A-B25A32567BA3}.png', title: 'Gaming Event with Redbull', subtitle: 'Under25adypu Event' },
              { src: '{5598FC8B-1C75-4715-AB2B-C6FF68CA737D}.jpg', title: 'Under25adypu Nominated', subtitle: 'National Recognition' },
              { src: '{1FD70957-4943-4122-BA1A-90A54182C1AD}.jpg', title: 'Best Paper Award at ICRAEST 2026', subtitle: 'Academic Excellence' },
              { src: 'health_expo_1.jpeg', title: 'Lokmat Education fair and Health Expo', subtitle: 'June 2026' },
              { src: 'health_expo_2.jpeg', title: 'Lokmat Education fair and Health Expo', subtitle: 'June 2026' }
          ];

          // Get result text based on current month
          let resultText = activeMonth === 'May' ? 'In Progress' : 'Declared';

          content += `
              <div class="header">
                  <div class="header-left">
                      <h1>AJEENKYA D Y PATIL UNIVERSITY</h1>
                      <div class="subtitle">Main Dashboard Report - ${activeMonth}</div>
                  </div>
                  <div class="header-right">
                      Generated: ${dateStr}
                  </div>
              </div>
              
              <div class="section-title">SECTION 1 – University Admissions Status</div>
              <div class="kpi-grid-4">
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalAdmissionsTarget}</div><div class="kpi-label">Target</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalAdmissionsAchieved}</div><div class="kpi-label">Achieved</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.admissionsGap}</div><div class="kpi-label">Gap</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.admissionsRate}</div><div class="kpi-label">Achievement Rate</div></div>
              </div>
              ${generateHtmlTableWithSummary(['School', 'Target', 'Achieved', 'Gap', 'Performance Rate'], adm.map(d => ({school: d.school, target: d.target, achieved: d.achieved, gap: d.gap, percent: d.percent})))}
              
              <div class="section-title">SECTION 2 – Partners Admission MIS</div>
              <div class="kpi-grid-4">
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersTarget}</div><div class="kpi-label">Target</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersAchieved}</div><div class="kpi-label">Achieved</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersGap}</div><div class="kpi-label">Gap</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersRate}</div><div class="kpi-label">Achievement Rate</div></div>
              </div>
              <h3 class="sub-heading">School Summary</h3>
              ${generateHtmlTableWithSummary(['School', 'Target', 'Achieved', 'Gap', 'Performance Rate'], part.map(d => ({school: d.school, target: d.target, achieved: d.achieved, gap: d.gap, percent: d.percent})))}
              
              <h3 class="sub-heading">Partner Detailed Breakdown</h3>
              ${generateHtmlTable(['School', 'Partner', 'Target', 'Achieved'], partDetail.map(d => [d.school, d.partner, d.target, d.achieved]))}
              
              <div class="page-break"></div>
              
              <div class="section-title">SECTION 3 – Placements Overview</div>
              <div class="kpi-grid-6">
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalPlaced}</div><div class="kpi-label">Total Students Placed</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.highestPackage}</div><div class="kpi-label">Highest Package</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.averagePackage}</div><div class="kpi-label">Average Package</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalInternships}</div><div class="kpi-label">Total Internships</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.highestInternship}</div><div class="kpi-label">Highest Stipend</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalCompanies}</div><div class="kpi-label">Total Companies Visited</div></div>
              </div>

              <div class="section-title">SECTION 4 – Examinations Overview</div>
              <div class="kpi-grid-5">
                  <div class="kpi-card"><div class="kpi-value">${kpis.examTotal}</div><div class="kpi-label">Total Students</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.examReg}</div><div class="kpi-label">Registered</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.examAppeared}</div><div class="kpi-label">Appeared</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.examAbs}</div><div class="kpi-label">Absent</div></div>
                  <div class="kpi-card"><div class="kpi-value">${resultText}</div><div class="kpi-label">Result</div></div>
              </div>
              ${generateHtmlTable(['School', 'Registered', 'Appeared', 'Absent', 'Pass %'], exam.map(d => [d.school, d.registered, d.appeared, d.absent, d.passPct]))}
              
              <div class="section-title">SECTION 5 – Summer Examinations Overview</div>
              <div class="kpi-grid-5">
                  <div class="kpi-card"><div class="kpi-value">1370</div><div class="kpi-label">Total Students</div></div>
                  <div class="kpi-card"><div class="kpi-value">1370</div><div class="kpi-label">Registered</div></div>
                  <div class="kpi-card"><div class="kpi-value">1348</div><div class="kpi-label">Appeared</div></div>
                  <div class="kpi-card"><div class="kpi-value">22</div><div class="kpi-label">Absent</div></div>
                  <div class="kpi-card"><div class="kpi-value">In Progress</div><div class="kpi-label">Result</div></div>
              </div>

              <div class="section-title">SECTION 6 – Executive Achievements</div>
              <div class="kpi-grid-2">
                  <div class="kpi-card"><div class="kpi-value">11</div><div class="kpi-label">Student Awards</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.execFac}</div><div class="kpi-label">Faculty Papers</div></div>
              </div>

              <div class="page-break"></div>
              
              <div class="section-title">SECTION 7 – Monthly Highlights – May 2026</div>
              ${generateHtmlTable(['Achievement Title', 'Category', 'Date'], monthlyHighlightsData.map(d => [d.title, d.category, d.date]))}
              
              <div class="page-break"></div>

              <div class="section-title">SECTION 8 – University Achievements Gallery</div>
              <div class="pdf-gallery">
                  ${galleryImagesData.map(img => `
                      <div class="pdf-gallery-item">
                          <img src="${img.src}" alt="${img.title}" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80';">
                          <h4>${img.title}</h4>
                          <p>${img.subtitle}</p>
                      </div>
                  `).join('')}
              </div>
          `;
      } else if (type === 'schoolwise') {
           content += `
              <div class="header">
                  <h1>AJEENKYA D Y PATIL UNIVERSITY</h1>
                  <div class="date">School Wise Report | Generated: ${dateStr}</div>
              </div>`;
              
           const schoolsKeys = Object.keys(schoolNameMap);
           schoolsKeys.forEach((k, idx) => {
               let adm = getAdmissionsData().find(a => a.schoolId === k) || {target:0, achieved:0, gap:0, percent:'0%'};
               let plc = getPlacementsData(k);
               let ach = getStudentAchievements(5, k);
               let partD = getPartnersDetailedData(k);
               
               content += `
                   <h2 style="color: #C21B27; margin: 20px 0 10px; font-size: 22px;">${schoolNameMap[k]}</h2>
                   
                   <div class="section-title">Admissions Performance</div>
                   ${generateHtmlTable(['Metric', 'Target', 'Achieved', 'Gap', '%'], [['Core Admissions', adm.target, adm.achieved, adm.gap, adm.percent]])}
                   
                   <div class="section-title">Partners Admission Breakdown</div>
                   ${generateHtmlTable(['Partner', 'Target', 'Achieved'], partD.map(d => [d.partner, d.target, d.achieved]))}
                   
                   <div class="section-title">Placements</div>
                   ${generateHtmlTable(['Company', 'Package', 'Stipend'], plc.map(d => [d.company, d.package, d.stipend]))}
                   
                   <div class="section-title">Top Achievements</div>
                   ${generateHtmlTable(['Name', 'Achievement', 'Date'], ach.map(d => [d.name, d.detail, d.date]))}
               `;
               
               if (idx < schoolsKeys.length - 1) {
                   content += `<div class="page-break"></div>`;
               }
           });
      } else if (type === 'complete') {
          const kpis = getExecutiveKPIs();
          const adm = getAdmissionsData();
          const part = getPartnersData();
          const partDetail = getPartnersDetailedData();
          const plc = getPlacementsData();
          const stu = getStudentAchievements();
          const fac = getFacultyAchievements();
          const uni = getUniversityAchievements();
          let resultText = activeMonth === 'May' ? 'In Progress' : 'Declared';
          
          content += `
              <div class="cover-page">
                  <h1 class="cover-title">ADYPU Complete University Report</h1>
                  <p style="font-size: 20px; color: #666; margin-bottom: 10px; font-weight: bold;">Academic Session 2026-2027</p>
                  <p style="font-size: 16px; color: #999;">Generated: ${dateStr}</p>
              </div>
              <div class="page-break"></div>
              
              <div class="header">
                  <h1>AJEENKYA D Y PATIL UNIVERSITY</h1>
                  <div class="date">Complete Report | Generated: ${dateStr}</div>
              </div>
              
              <div class="section-title">Executive Summary</div>
              <div class="kpi-grid-4">
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalAdmissionsTarget}</div><div class="kpi-label">Admissions Target</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalAdmissionsAchieved}</div><div class="kpi-label">Admissions Achieved</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersTarget}</div><div class="kpi-label">Partners Target</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.partnersAchieved}</div><div class="kpi-label">Partners Achieved</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.totalPlaced}</div><div class="kpi-label">Total Placed</div></div>
                  <div class="kpi-card"><div class="kpi-value">${kpis.highestPackage}</div><div class="kpi-label">Highest Package</div></div>
              </div>
              
              <div class="section-title">Complete Admissions summary</div>
              ${generateHtmlTable(['School', 'Target', 'Achieved', 'Gap', '%'], adm.map(d => [d.school, d.target, d.achieved, d.gap, d.percent]))}
              
              <div class="section-title">Complete Partners Admissions summary</div>
              ${generateHtmlTable(['School', 'Target', 'Achieved', 'Gap', '%'], part.map(d => [d.school, d.target, d.achieved, d.gap, d.percent]))}
              
              <div class="section-title">Detailed Partner Admissions</div>
              ${generateHtmlTable(['School', 'Partner', 'Target', 'Achieved'], partDetail.map(d => [d.school, d.partner, d.target, d.achieved]))}
              
              <div class="section-title">Complete Placements summary</div>
              ${generateHtmlTable(['School', 'Company', 'Package', 'Stipend'], plc.map(d => [d.school, d.company, d.package, d.stipend]))}
              
              <div class="page-break"></div>
              
              <div class="section-title">Complete Student Achievements</div>
              ${generateHtmlTable(['School', 'Student', 'Achievement', 'Date'], stu.map(d => [d.school, d.name, d.detail, d.date]))}
              
              <div class="section-title">Complete Faculty Achievements</div>
              ${generateHtmlTable(['School', 'Faculty', 'Achievement', 'Date'], fac.map(d => [d.school, d.name, d.detail, d.date]))}
              
              <div class="section-title">Complete University Achievements</div>
              ${generateHtmlTable(['Name', 'Event', 'Role', 'Date'], uni.map(d => [d.name, d.detail, d.meta, d.date]))}
              
              <div class="section-title">Summer Examinations</div>
              <div class="kpi-grid-5">
                  <div class="kpi-card"><div class="kpi-value">1370</div><div class="kpi-label">Total Students</div></div>
                  <div class="kpi-card"><div class="kpi-value">1370</div><div class="kpi-label">Registered</div></div>
                  <div class="kpi-card"><div class="kpi-value">1348</div><div class="kpi-label">Appeared</div></div>
                  <div class="kpi-card"><div class="kpi-value">22</div><div class="kpi-label">Absent</div></div>
                  <div class="kpi-card"><div class="kpi-value">In Progress</div><div class="kpi-label">Result</div></div>
              </div>
              
              <div class="section-title">Risk Summary</div>
              <ul>
                  <li style="margin-bottom: 8px; font-size: 13px;"><strong>Admissions Risk:</strong> High priority intervention required to close the current intake gap.</li>
                  <li style="margin-bottom: 8px; font-size: 13px;"><strong>Research & Patents:</strong> Publication, patent, and MoU activity should be accelerated this cycle.</li>
                  <li style="margin-bottom: 8px; font-size: 13px;"><strong>Student Engagement:</strong> Events, student participation, and campus engagement remain healthy.</li>
              </ul>
              
              <div class="section-title">Final Recommendations</div>
              <p style="font-size: 13px; margin-bottom: 5px;">1. Target marketing efforts on schools with high gap percentage.</p>
              <p style="font-size: 13px; margin-bottom: 5px;">2. Accelerate placement drives for underperforming sectors.</p>
              <p style="font-size: 13px; margin-bottom: 5px;">3. Increase documentation of university-level research initiatives.</p>
          `;
      }

      content += '<div class="footer" style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; font-weight: bold;">Confidential - Internal Use Only | ADYPU Strategic Command Center</div>';
      
      return `<!DOCTYPE html><html><head><title>ADYPU Report</title>${baseStyle}</head><body>${content}</body></html>`;
  }

  async function generatePDFReport(type) {
      if (!globalRawData || globalRawData.length === 0) {
          alert('Please upload CSV data first');
          return;
      }

      let page1Img = null;
      let page2Img = null;

      if (type === 'main') {
          const btnLinks = document.querySelectorAll('.sidebar-dropdown-content a');
          let targetBtn = null;
          let originalText = "";
          btnLinks.forEach(b => {
              if(b.getAttribute('onclick') === "generatePDFReport('main')") {
                  targetBtn = b;
                  originalText = b.innerText;
                  b.innerText = "Capturing Dashboard...";
              }
          });

          try {
              const offscreen = document.createElement('div');
              offscreen.className = 'main';
              offscreen.style.position = 'fixed';
              offscreen.style.top = '0';
              offscreen.style.left = '-9999px';
              offscreen.style.width = '1100px'; 
              offscreen.style.margin = '0';
              offscreen.style.padding = '0';
              offscreen.style.zIndex = '-100';

              // Get ALL sections from home-view, excluding those with data-html2canvas-ignore
              const allSections = document.querySelectorAll('#home-view .section');
              const pg1 = document.createElement('div');
              pg1.style.padding = '30px';
              pg1.style.background = 'var(--bg)';
              
              // Add header
              const liveHeader = document.querySelector('.dashboard-header');
              if (liveHeader) pg1.appendChild(liveHeader.cloneNode(true));
              
              // Add all non-ignored sections to pg1 (will be split across pages by the PDF)
              allSections.forEach(section => {
                  // Skip sections with data-html2canvas-ignore attribute
                  if (!section.hasAttribute('data-html2canvas-ignore')) {
                      pg1.appendChild(section.cloneNode(true));
                  }
              });

              // We only need one page now since all sections are included
              offscreen.appendChild(pg1);
              document.body.appendChild(offscreen);

              await new Promise(r => setTimeout(r, 100));

              const canvas1 = await html2canvas(pg1, { scale: 2, useCORS: true, backgroundColor: '#f8fafc', logging: false, height: pg1.scrollHeight });
              page1Img = canvas1.toDataURL('image/jpeg', 0.9);

              document.body.removeChild(offscreen);
          } catch (e) {
              console.error("Failed to capture dashboard screenshots:", e);
          } finally {
              if (targetBtn) targetBtn.innerText = originalText;
          }
      }
      
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '1100px';
      iframe.style.height = '800px';
      document.body.appendChild(iframe);
      
      const html = buildReportHTML(type, page1Img, null);
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
      
      setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          
          setTimeout(() => {
              if(document.body.contains(iframe)) {
                 document.body.removeChild(iframe);
              }
          }, 1000);
      }, 500);
  }

  function generateExcelReport() {
      if (!globalRawData || globalRawData.length === 0) { alert("Please upload Master CSV file first."); return; }
      const wb = XLSX.utils.book_new();

      let adT=0, adA=0, partT=0, partA=0, plT=0, plA=0, exApp=0, exPass=0, uni=0, stu=0, fac=0;
      globalRawData.forEach(r => {
          if(r.SchoolId==='exec') { 
              if(r.Activity==='Exam Appeared') exApp=cleanNum(r.Achieved); 
              if(r.Activity==='Exam Passed') exPass=cleanNum(r.Achieved); 
          }
          else {
              let t=cleanNum(r.Target), a=cleanNum(r.Achieved);
              if(r.Activity==='Admissions') { adT+=t; adA+=a; }
              if(r.Activity==='Partners Admission MIS') { partT+=t; partA+=a; }
              if(r.Activity==='Placements') { plT+=t; plA+=a; }
              if(r.Activity==='University Achievement') uni++; 
              if(r.Activity==='Student Achievement') stu++; 
              if(r.Activity==='Faculty Achievement') fac++;
          }
      });

      let execJson = [{
          "Admissions Target": adT, "Admissions Achieved": adA,
          "Partners Target": partT, "Partners Achieved": partA,
          "Placements Eligible": plT, "Placements Placed": plA,
          "Exam Appeared": exApp, "Exam Passed": exPass,
          "Univ Achievements": uni, "Student Awards": 11, // Hardcoded to 11
          "Faculty Papers": fac
      }];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(execJson), "Executive KPIs");

      let schAdm = [], schPart = [];
      let schData = {};
      Object.keys(schoolNameMap).forEach(k => schData[k] = {aT:0, aA:0, pT:0, pA:0});
      globalRawData.forEach(r => {
          if(r.SchoolId !== 'exec' && schData[r.SchoolId]) {
              if(r.Activity === 'Admissions') { schData[r.SchoolId].aT+=cleanNum(r.Target); schData[r.SchoolId].aA+=cleanNum(r.Achieved); }
              if(r.Activity === 'Partners Admission MIS') { schData[r.SchoolId].pT+=cleanNum(r.Target); schData[r.SchoolId].pA+=cleanNum(r.Achieved); }
          }
      });
      Object.keys(schData).forEach(k => {
          let d = schData[k];
          schAdm.push({ "School": schoolNameMap[k], "Target": d.aT, "Achieved": d.aA, "Gap": Math.max(0, d.aT-d.aA), "%": d.aT>0?(d.aA*100/d.aT).toFixed(1)+'%':'0%' });
          if(d.pT > 0 || d.pA > 0) schPart.push({ "School": schoolNameMap[k], "Target": d.pT, "Achieved": d.pA, "Gap": Math.max(0, d.pT-d.pA), "%": d.pT>0?(d.pA*100/d.pT).toFixed(1)+'%':'0%' });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(schAdm), "School Admissions");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(schPart), "Partners Admissions");

      let excelPartnerDetails = getPartnersDetailedData().map(d => ({
          "School": d.school,
          "Partner": d.partner,
          "Target": d.target,
          "Achieved": d.achieved
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(excelPartnerDetails), "Partner Details");

      const getList = (act) => globalRawData.filter(r => r.Activity === act && r.SchoolId!=='exec').map(r => ({
          "School": schoolNameMap[r.SchoolId]||r.SchoolId, "Detail 1": r.DetailName, "Detail 2": r.DetailInfo, "Detail 3": r.DetailMeta, "Date": r.DetailDate
      }));

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getList('Placements')), "Placements");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getList('Student Achievement')), "Student Achievements");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(getList('Faculty Achievement')), "Faculty Achievements");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(globalRawData.filter(r => r.Activity === 'University Achievement').map(r => ({ "Name": r.DetailName, "Event": r.DetailInfo, "Role": r.DetailMeta, "Date": r.DetailDate }))), "University Achievements");

      XLSX.writeFile(wb, `ADYPU_Master_Data_${new Date().toLocaleDateString().replace(/\//g,'-')}.xlsx`);
  }
