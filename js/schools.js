// ==========================================
// Build School views dynamically
// Was three document.write() calls in a parser-blocking inline script.
// Now builds one string and drops it into #school-views.
// ==========================================
(function buildSchoolViews() {
  const container = document.getElementById('school-views');
  if (!container) return;

  let html = '';

  schools.forEach(school => {
    html += `
      <div class="school tab-content" id="${school.id}" style="display: none;">
        <div class="school-header">
          <div>
            <h2>${school.name}</h2>
            <div style="color:#64748b; font-size: 15px; margin-top: 5px;">17-activity performance dashboard</div>
          </div>
          <div class="badge"><span class="pulse"></span> Live Sync Active</div>
        </div>
        <div class="activity-grid">
      `;

    activitiesList.forEach(act => {
      html += `
          <div class="activity">
            <h4>${act}</h4>
            <div class="metric"><span>Target</span><strong>0</strong></div>
            <div class="metric"><span>Achieved</span><strong>0</strong></div>
            <div class="metric"><span>Gap</span><strong>0</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#64748b;margin:10px 0 6px">
              <span>Performance</span><span>0.0%</span>
            </div>
            <div class="progress"><span style="width:0%"></span></div>
            <div class="mini-chart">
              <div class="bar" style="height:10px" data-label="Target"></div>
              <div class="bar" style="height:10px" data-label="Achieved"></div>
              <div class="bar" style="height:50px;background:linear-gradient(180deg,#94a3b8,#64748b)" data-label="Gap"></div>
            </div>
            <div class="legend">
              <span><i class="target"></i>Target</span>
              <span><i class="achieved"></i>Achieved</span>
              <span><i class="gap"></i>Gap</span>
            </div>
            <div class="status high">${svgDanger} High Risk</div>
          </div>
        `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
})();
