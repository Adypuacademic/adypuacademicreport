  // ------------------------------------------
  // AUTO-LOAD EXCEL/CSV LOGIC (MULTI-SHEET)
  // ------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_MONTH = 'August';

    // May ships as a pre-flattened sheet; June onward are raw chairman reports
    // normalised by JuneAdapter. Add a month by appending one entry here, a tab in
    // index.html, an option in both compare dropdowns, and its columns in june-adapter.js.
    const SOURCES = [
      { month: 'May', file: 'ADYPU_Master_Dashboard_Data_MultiSheet.xlsx', raw: false },
      { month: 'June', file: 'ADYPU_Master_Dashboard_Data_June_2026.xlsx', raw: true },
      { month: 'July', file: 'ADYPU_Master_Dashboard_Data_July_2026.xlsx', raw: true },
      { month: 'August', file: 'ADYPU_Master_Dashboard_Data_August_2026.xlsx', raw: true }
    ];

    const fetchWorkbook = filename =>
      fetch(filename)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok for ' + filename);
          return response.arrayBuffer();
        })
        .then(data => XLSX.read(data, { type: 'array' }));

    const flattenSheets = workbook => {
      let combined = [];
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        combined = combined.concat(XLSX.utils.sheet_to_json(worksheet, { raw: false }));
      });
      return combined;
    };

    const render = () => {
      const month = monthData[DEFAULT_MONTH].length > 0
        ? DEFAULT_MONTH
        : Object.keys(monthData).find(m => monthData[m].length > 0);
      if (!month) {
        console.warn('No month data available.');
        return;
      }
      globalRawData = monthData[month];
      activeMonth = month;
      updateDashboard(globalRawData);
      updateSchoolTiles(globalRawData);
      document.querySelectorAll('.month-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.month === month);
      });
      // Don't auto-set dropdowns - keep them blank
      updateResultText(month);
      renderMeetings(month);
      renderMonthlyActivity(month);
      renderTopGallery(month);
    };

    Promise.all(SOURCES.map(source =>
      fetchWorkbook(source.file)
        .then(workbook => {
          monthData[source.month] = source.raw
            ? JuneAdapter.buildMonthData(workbook, source.month)
            : flattenSheets(workbook);
          console.log('Successfully loaded: ' + source.file);
        })
        .catch(error => console.warn(source.month + ' data not available.', error))
    )).then(render);
  });
