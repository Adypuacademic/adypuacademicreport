    // ==========================================
    // HARDCODED STUDENT AWARDS DATA (11 awards)
    // ==========================================
    const hardcodedStudentAwards = [
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Diksha Patil', DetailInfo: 'Food Technology II Year', DetailMeta: 'Certification - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Jayesh Jadhav', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Eeba Mubarak', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Certification - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Swaralee Prabhawalkar', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Siya Jahagirdar', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Certification - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Shweta Shelke', DetailInfo: 'M. Tech Biotech I Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Natasha Bhangale', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Aashi Goswami', DetailInfo: 'Biotechnology II Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Lokesh Redekar', DetailInfo: 'SOE Final Year', DetailMeta: 'Certification - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Tanisha Bellay', DetailInfo: 'SOE Final Year', DetailMeta: 'Elite - Knowledge enhancement', DetailDate: '' },
      { SchoolId: 'eng', Activity: 'Student Achievement', DetailName: 'Alolika Mahanag', DetailInfo: 'SOE Final Year', DetailMeta: 'Elite-Silver - Knowledge enhancement', DetailDate: '' }
    ];

    // ==========================================
    // Build School views dynamically
    // ==========================================
    const activitiesList = ["Admissions", "Placements", "Research", "Publications", "Patents", "Faculty Achievement", "Student Achievement", "Events", "Rankings", "Accreditation", "MoUs", "Industry Connect", "Media Visibility", "Sports", "NSS", "Innovation", "Strategic Initiatives"];
    const schools = [
        { id: 'eng', name: 'School of Engineering' }, 
        { id: 'mgmt', name: 'School of Management' },
        { id: 'law', name: 'School of Law' }, 
        { id: 'design', name: 'School of Design' },
        { id: 'science', name: 'School of Science' }, 
        { id: 'arch', name: 'School of Architecture' },
        { id: 'hosp', name: 'School of Hospitality' }, 
        { id: 'lib', name: 'School of Liberal Arts' },
        { id: 'film', name: 'School of Film & Media' },
        { id: 'SOD', name: 'School of Design' },
        { id: 'SOHM', name: 'School of Hospitality' },
        { id: 'SOS', name: 'School of Science' },
        { id: 'SOFM', name: 'School of Film & Media' }
    ];

    const svgDanger = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#ef4444" stroke="none"/></svg>`;
    const svgWarn = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="3" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="#f59e0b" stroke="none"/></svg>`;
    const svgSuccess = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 6-6"/></svg>`;

  const schoolNameMap = {
    'eng': 'Engineering', 
    'mgmt': 'Management', 
    'law': 'Law', 
    'design': 'Design',
    'science': 'Science', 
    'arch': 'Architecture', 
    'hosp': 'Hospitality',
    'lib': 'Liberal Arts', 
    'film': 'Film & Media',
    'SOD': 'Design',
    'SOHM': 'Hospitality', 
    'SOS': 'Science',
    'SOFM': 'Film & Media',
    'TOTAL': 'Total',
    'PHD': 'PhD'
  };

  const chartColors = ['#C21B27', '#f59e0b', '#1e293b', '#64748b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];

  function cleanNum(val) {
      if(val === undefined || val === null) return 0;
      if (typeof val === 'string') {
          let lower = val.toLowerCase();
          if (lower.includes('in process') || lower.includes('pending') || lower.includes('na')) {
              return 0;
          }
          let cleaned = val.replace(/[^0-9.]/g, '');
          if (cleaned === '') return 0;
          let parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
      }
      let parsed = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
  }

  function extractMaxPackage(stringArr) {
      let max = 0;
      let maxStr = "0";
      stringArr.forEach(str => {
          if(str && typeof str === 'string') {
              let match = str.match(/(\d+(\.\d+)?)/); 
              if(match && match[0]) {
                  let num = parseFloat(match[0]);
                  if(num > max) {
                      max = num;
                      maxStr = str;
                  }
              }
          }
      });
      return maxStr;
  }
  
  function calculateAveragePackage(stringArr) {
      let sum = 0;
      let count = 0;
      stringArr.forEach(str => {
          if(str && typeof str === 'string') {
              let match = str.match(/(\d+(\.\d+)?)/);
              if(match && match[0]) {
                  sum += parseFloat(match[0]);
                  count++;
              }
          }
      });
      return count > 0 ? (sum / count).toFixed(2) + " LPA" : "0";
  }
