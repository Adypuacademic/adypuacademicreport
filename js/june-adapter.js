(function () {
  const SCHOOL_ALIASES = {
    'school of engineering': 'eng', 'soe': 'eng',
    'school of management': 'mgmt', 'som': 'mgmt',
    'school of law': 'law', 'sol': 'law',
    'school of design': 'design', 'sod': 'design',
    'school of science': 'science', 'sos': 'science',
    'school of architecture': 'arch',
    'school of hospitality and hotel management': 'hosp',
    'school of hospitality': 'hosp', 'sohm': 'hosp',
    'school of liberal arts': 'lib', 'sola': 'lib',
    'school of film and media': 'film', 'school of film & media': 'film', 'sofm': 'film',
    'phd': 'PHD',
    'total': 'TOTAL'
  };

  function normalizeSchool(raw) {
    if (raw === null || raw === undefined) return null;
    const key = String(raw).trim().toLowerCase();
    if (!key) return null;
    return SCHOOL_ALIASES[key] || null;
  }

  function formatCellDate(val) {
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return val ? String(val) : 'NA';
  }

  function detailStr(val) {
    return (val === null || val === undefined || val === '') ? 'NA' : String(val);
  }

  // Faculty-instructed override: raw sheet's Engineering subtotal (2254/659) undercounts
  // late-added admissions the office wants reflected. Update/remove per faculty guidance.
  const ADMISSIONS_OVERRIDE = { eng: { Target: 2558, Achieved: 775 } };

  function transformAdmissions(sheetRows) {
    const out = [];
    sheetRows.forEach(row => {
      const school = row[0];
      const intake = row[2];
      const target = row[3];
      const juneCumulative = row[8];
      if (school === null || school === undefined || String(school).trim() === '') return;
      if (target === null || target === undefined || String(target).trim() === '') return;
      const schoolId = normalizeSchool(school);
      if (!schoolId || schoolId === 'TOTAL') return;
      const override = ADMISSIONS_OVERRIDE[schoolId];
      out.push({
        SchoolId: schoolId,
        Activity: 'Admissions',
        Target: override ? override.Target : (target !== '' ? target : intake),
        Achieved: override ? override.Achieved : (juneCumulative || 0),
        DetailName: 'NA', DetailInfo: 'NA', DetailMeta: 'NA', DetailDate: 'NA'
      });
    });
    return out;
  }

  function transformPartners(sheetRows) {
    const out = [];
    let lastSchool = null, lastPartner = null;
    sheetRows.slice(1).forEach(row => {
      const school = row[0], partner = row[1], program = row[2];
      if (school !== null && school !== undefined && String(school).trim() !== '') lastSchool = school;
      if (partner !== null && partner !== undefined && String(partner).trim() !== '') lastPartner = partner;
      if (!program || /total/i.test(String(program))) return;
      const schoolId = normalizeSchool(lastSchool);
      if (!schoolId || schoolId === 'TOTAL') return;
      out.push({
        SchoolId: schoolId,
        Activity: 'Partners Admission MIS',
        Target: row[3] || 0,
        Achieved: row[5] || 0,
        DetailName: detailStr(lastPartner),
        DetailInfo: detailStr(program),
        DetailMeta: 'NA', DetailDate: 'NA'
      });
    });
    return out;
  }

  function transformPlacements(sheetRows) {
    const out = [];
    sheetRows.slice(1).forEach(row => {
      const schoolId = normalizeSchool(row[0]);
      if (!schoolId || schoolId === 'TOTAL') return;
      out.push({
        SchoolId: schoolId,
        Activity: 'Placements',
        Target: row[1] || 0,
        Achieved: 1,
        DetailName: detailStr(row[6]),
        DetailInfo: detailStr(row[3]),
        DetailMeta: detailStr(row[5]),
        DetailDate: 'NA'
      });
    });
    return out;
  }

  function transformStudentAchievement(sheetRows) {
    const out = [];
    sheetRows.slice(1).forEach(row => {
      const school = row[0], studentName = row[1];
      if (!studentName || String(studentName).trim() === '') return;
      const schoolId = normalizeSchool(school);
      if (!schoolId || schoolId === 'TOTAL') return;
      out.push({
        SchoolId: schoolId,
        Activity: 'Student Achievement',
        Target: 0,
        Achieved: 1,
        DetailName: detailStr(studentName),
        DetailInfo: detailStr(row[4]),
        DetailMeta: detailStr(row[5]),
        DetailDate: formatCellDate(row[6])
      });
    });
    return out;
  }

  function transformFacultyAchievement(sheetRows) {
    const out = [];
    sheetRows.slice(1).forEach(row => {
      const school = row[0], facultyName = row[1];
      if (!facultyName || String(facultyName).trim() === '') return;
      const schoolId = normalizeSchool(school);
      if (!schoolId || schoolId === 'TOTAL') return;
      out.push({
        SchoolId: schoolId,
        Activity: 'Faculty Achievement',
        Target: 0,
        Achieved: 1,
        DetailName: detailStr(facultyName),
        DetailInfo: detailStr(row[2]),
        DetailMeta: detailStr(row[6]),
        DetailDate: formatCellDate(row[5])
      });
    });
    return out;
  }

  function transformUniversityAchievement(sheetRows) {
    const out = [];
    sheetRows.slice(1).forEach(row => {
      const name = row[0];
      if (!name || String(name).trim() === '') return;
      out.push({
        SchoolId: 'exec',
        Activity: 'University Achievement',
        Target: 0,
        Achieved: 1,
        DetailName: detailStr(name),
        DetailInfo: detailStr(row[2]),
        DetailMeta: detailStr(row[3]),
        DetailDate: formatCellDate(row[5])
      });
    });
    return out;
  }

  function transformExaminationMIS(sheetRows) {
    const out = [];
    let totalAppeared = 0, totalPassed = 0;
    sheetRows.slice(1).forEach(row => {
      const school = row[0], appeared = row[3], resultPct = row[4];
      if (!school || appeared === null || appeared === undefined || isNaN(Number(appeared))) return;
      const schoolId = normalizeSchool(school);
      if (!schoolId || schoolId === 'TOTAL') return;
      const appearedNum = Number(appeared);
      out.push({
        SchoolId: schoolId,
        Activity: 'Examinations',
        Target: appearedNum,
        Achieved: appearedNum,
        DetailName: 'NA', DetailInfo: 'NA', DetailMeta: 'NA', DetailDate: 'NA'
      });
      totalAppeared += appearedNum;
      if (resultPct !== null && resultPct !== undefined && !isNaN(Number(resultPct))) {
        totalPassed += appearedNum * (Number(resultPct) / 100);
      }
    });
    totalPassed = Math.round(totalPassed * 10) / 10;
    out.push({ SchoolId: 'exec', Activity: 'Exam Appeared', Target: totalAppeared, Achieved: totalAppeared, DetailName: 'NA', DetailInfo: 'NA', DetailMeta: 'NA', DetailDate: 'NA' });
    out.push({ SchoolId: 'exec', Activity: 'Exam Passed', Target: totalPassed, Achieved: totalPassed, DetailName: 'NA', DetailInfo: 'NA', DetailMeta: 'NA', DetailDate: 'NA' });
    return out;
  }

  function buildJuneData(workbook) {
    const sheet = name => XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, raw: true });
    return [].concat(
      transformAdmissions(sheet('ADYPU Admission MIS')),
      transformPartners(sheet('Partners Admission MIS')),
      transformPlacements(sheet('Placement Internship')),
      transformStudentAchievement(sheet('Student Achievement & Activitie')),
      transformFacultyAchievement(sheet('Faculty Achievement & Activitie')),
      transformUniversityAchievement(sheet('University Acheivement and Acti')),
      transformExaminationMIS(sheet('Examination MIS'))
    );
  }

  window.JuneAdapter = {
    normalizeSchool, transformAdmissions, transformPartners, transformPlacements,
    transformStudentAchievement, transformFacultyAchievement, transformUniversityAchievement,
    transformExaminationMIS, buildJuneData
  };
})();
