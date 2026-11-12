  // ------------------------------------------
  // AUTO-LOAD EXCEL/CSV LOGIC (MULTI-SHEET)
  // ------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_MONTH = 'October';

    // May ships as a pre-flattened sheet; June onward are raw chairman reports
    // normalised by JuneAdapter. Add a month by appending one entry here, a tab in
    // index.html, an option in both compare dropdowns, and its columns in june-adapter.js.
    const SOURCES = [
      { month: 'May', file: 'assets/data/ADYPU_Master_Dashboard_Data_MultiSheet.xlsx', raw: false },
      { month: 'June', file: 'assets/data/ADYPU_Master_Dashboard_Data_June_2026.xlsx', raw: true },
      { month: 'July', file: 'assets/data/ADYPU_Master_Dashboard_Data_July_2026.xlsx', raw: true },
      { month: 'August', file: 'assets/data/ADYPU_Master_Dashboard_Data_August_2026.xlsx', raw: true },
      { month: 'September', file: 'assets/data/ADYPU_Master_Dashboard_Data_September_2026.xlsx', raw: true },
      { month: 'October', file: 'assets/data/ADYPU_Master_Dashboard_Data_October_2026.xlsx', raw: true }
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
      renderDashboard(globalRawData);
      updateSchoolTiles(globalRawData);
      document.querySelectorAll('.month-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.month === month);
      });
      // Don't auto-set dropdowns - keep them blank
      updateResultText(month);
      renderMeetings(month);
      renderMonthlyActivity(month);
      renderTopGallery(month);
      renderBottomGallery(month);
    };

    // The landing month is fetched and drawn first; every other month loads behind it.
    // monthLoads holds each pending month so a tab click or Compare waits for its data
    // instead of drawing another month's figures; a month drops out once it settles.
    const load = source => {
      const pending = fetchWorkbook(source.file)
        .then(workbook => {
          monthData[source.month] = source.raw
            ? JuneAdapter.buildMonthData(workbook, source.month)
            : flattenSheets(workbook);
          console.log('Successfully loaded: ' + source.file);
        })
        .catch(error => console.warn(source.month + ' data not available.', error))
        .finally(() => { delete monthLoads[source.month]; });
      monthLoads[source.month] = pending;
      return pending;
    };

    const first = SOURCES.find(s => s.month === DEFAULT_MONTH);
    const rest = SOURCES.filter(s => s !== first);
    (first ? load(first) : Promise.resolve())
      .then(() => {
        if (monthData[DEFAULT_MONTH].length > 0) {
          render();
          rest.forEach(load);
        } else {
          // Landing month failed: fall back to the old wait-for-everything path
          Promise.all(rest.map(load)).then(render);
        }
      });
  });
