  // ------------------------------------------
  // AUTO-LOAD EXCEL/CSV LOGIC (MULTI-SHEET)
  // ------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    const loadDataFile = (filename, callback) => {
      return fetch(filename)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok for ' + filename);
          return response.arrayBuffer();
        })
        .then(data => {
          const workbook = XLSX.read(data, { type: 'array' });
          let combined = [];
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            combined = combined.concat(sheetData);
          });
          callback(combined);
          console.log("Successfully loaded: " + filename);
          return true;
        });
    };

    // Load both May and June data in parallel
    let mayLoaded = false, juneLoaded = false;
    const checkBothLoaded = () => {
      if (mayLoaded && juneLoaded) {
        // Default to June
        globalRawData = juneData;
        activeMonth = 'June';
        updateDashboard(globalRawData);
        updateSchoolTiles(globalRawData);
        // Highlight June tab
        document.querySelectorAll('.month-tab').forEach(tab => {
          tab.classList.toggle('active', tab.dataset.month === 'June');
        });
        // Don't auto-set dropdowns - keep them blank
        updateResultText('June');
      }
    };

    loadDataFile('ADYPU_Master_Dashboard_Data_MultiSheet.xlsx', (data) => {
      mayData = data;
      mayLoaded = true;
      checkBothLoaded();
    }).catch(error => {
      console.log('Could not load May data, trying backup...', error);
      loadDataFile('ADYPU_Master_Dashboard_Data_MultiSheet.xlsx', (data) => {
        mayData = data;
        mayLoaded = true;
        checkBothLoaded();
      }).catch(e => console.warn('May data not available.', e));
    });

    loadDataFile('Dashboard_Ready_June_2026.xlsx', (data) => {
      juneData = data;
      juneLoaded = true;
      checkBothLoaded();
    }).catch(error => {
      console.log('Could not load June data, trying backup...', error);
      loadDataFile('ADYPU_Master_Dashboard_Data_June_2026.xlsx', (data) => {
        juneData = data;
        juneLoaded = true;
        checkBothLoaded();
      }).catch(e => console.warn('June data not available.', e));
    });
  });
