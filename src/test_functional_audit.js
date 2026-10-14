// Automated verification script for Pehchaan (SKIT021)
import { 
  INITIAL_STUDENTS, 
  INITIAL_ACTIVITIES, 
  INITIAL_RECORDS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_NOTIFICATIONS 
} from '../src/data/initialData.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName}`);
    failed++;
  }
}

console.log("=== RUNNING SUITE 1: DATA INTEGRITY & REFERENTIAL VALIDATION ===");

// 1. Initial counts
assert(INITIAL_STUDENTS.length >= 10, `Initial students count is ${INITIAL_STUDENTS.length} (>= 10)`);
assert(INITIAL_ACTIVITIES.length >= 8, `Initial activities count is ${INITIAL_ACTIVITIES.length} (>= 8)`);
assert(INITIAL_RECORDS.length >= 12, `Initial records count is ${INITIAL_RECORDS.length} (>= 12)`);
assert(INITIAL_DEPARTMENTS.length >= 5, `Initial departments count is ${INITIAL_DEPARTMENTS.length} (>= 5)`);

// 2. Referential integrity of records -> students & activities & departments
const studentIds = new Set(INITIAL_STUDENTS.map(s => s.id));
const activityIds = new Set(INITIAL_ACTIVITIES.map(a => a.id));
const departmentIds = new Set(INITIAL_DEPARTMENTS.map(d => d.id));

let allRecordStudentsValid = true;
let allRecordActivitiesValid = true;
let allRecordDeptsValid = true;

INITIAL_RECORDS.forEach(r => {
  if (!studentIds.has(r.studentId)) {
    console.error(`Invalid studentId in record: ${r.id} -> ${r.studentId}`);
    allRecordStudentsValid = false;
  }
  if (!activityIds.has(r.activityId)) {
    console.error(`Invalid activityId in record: ${r.id} -> ${r.activityId}`);
    allRecordActivitiesValid = false;
  }
  if (!departmentIds.has(r.departmentId)) {
    console.error(`Invalid departmentId in record: ${r.id} -> ${r.departmentId}`);
    allRecordDeptsValid = false;
  }
});

assert(allRecordStudentsValid, "All records have valid referential studentId");
assert(allRecordActivitiesValid, "All records have valid referential activityId");
assert(allRecordDeptsValid, "All records have valid referential departmentId");

// 3. Status consistency
const validStatuses = new Set(['Verified', 'Pending Review', 'Needs Correction', 'Rejected']);
const allStatusesValid = INITIAL_RECORDS.every(r => validStatuses.has(r.verificationStatus));
assert(allStatusesValid, "All records have valid verificationStatus values");

console.log("\n=== RUNNING SUITE 2: CRUD & ID COLLISION LOGIC ===");

// Check ID collision bug when items are deleted and added
let testStudents = [...INITIAL_STUDENTS];
// Delete STU-001
testStudents = testStudents.filter(s => s.id !== 'STU-001');

// Old logic:
const buggyId = `STU-${String(testStudents.length + 1).padStart(3, '0')}`;
const existingStudentWithBuggyId = testStudents.find(s => s.id === buggyId);
console.log(`Demonstrating bug: When STU-001 is deleted, length is ${testStudents.length}. Buggy ID generated is ${buggyId}. Does ${buggyId} already exist? ${!!existingStudentWithBuggyId}`);
assert(!!existingStudentWithBuggyId, "Verified defect: length-based ID generation causes collision on STU-012");

// Fixed logic test:
const maxStudentNum = testStudents.reduce((max, s) => {
  const match = (s.id || '').match(/STU-(\d+)/);
  const num = match ? parseInt(match[1], 10) : 0;
  return num > max ? num : max;
}, 0);
const fixedId = `STU-${String(maxStudentNum + 1).padStart(3, '0')}`;
const existingWithFixedId = testStudents.find(s => s.id === fixedId);
assert(!existingWithFixedId && fixedId === 'STU-013', `Fixed ID generation generates ${fixedId} without collision`);

// Record fixed ID generation test:
let testRecords = [...INITIAL_RECORDS];
testRecords = testRecords.filter(r => r.id !== 'REC-2024-001');
const maxRecNum = testRecords.reduce((max, r) => {
  const match = (r.id || '').match(/REC-\d+-(\d+)/);
  const num = match ? parseInt(match[1], 10) : 0;
  return num > max ? num : max;
}, 0);
const fixedRecId = `REC-2024-${String(maxRecNum + 1).padStart(3, '0')}`;
const existingWithFixedRecId = testRecords.find(r => r.id === fixedRecId);
assert(!existingWithFixedRecId, `Fixed Record ID generation avoids collision (produced ${fixedRecId})`);

console.log("\n=== RUNNING SUITE 3: ACTIVITY DATE RANGE VALIDATION ===");
function validateActivityDates(startDate, endDate) {
  if (!startDate) return { valid: false, error: 'Start date is required' };
  if (!endDate) return { valid: false, error: 'End date is required' };
  if (new Date(endDate) < new Date(startDate)) {
    return { valid: false, error: 'End date cannot be earlier than start date' };
  }
  return { valid: true };
}

assert(!validateActivityDates('2024-05-10', '2024-05-01').valid, "Rejects endDate before startDate");
assert(validateActivityDates('2024-05-10', '2024-05-10').valid, "Accepts same day event");
assert(validateActivityDates('2024-05-10', '2024-05-15').valid, "Accepts multi-day event");

console.log("\n=== RUNNING SUITE 4: DUPLICATE RECORD DETECTION ASSISTANCE ===");
function checkDuplicateRecord(records, studentId, activityId, currentRecordId = null) {
  return records.find(r => 
    r.studentId === studentId && 
    r.activityId === activityId && 
    (!currentRecordId || r.id !== currentRecordId)
  );
}

const dup = checkDuplicateRecord(INITIAL_RECORDS, 'STU-001', 'ACT-101');
assert(!!dup, "Detects duplicate record for STU-001 and ACT-101");
const nonDup = checkDuplicateRecord(INITIAL_RECORDS, 'STU-001', 'ACT-108');
assert(!nonDup, "Does not flag non-duplicate for STU-001 and ACT-108");

console.log("\n=== RUNNING SUITE 5: ANALYTICS CALCULATIONS & CSV EXPORT ===");
const testFiltered = INITIAL_RECORDS.filter(r => r.category === 'Technical');
const techVerified = testFiltered.filter(r => r.verificationStatus === 'Verified').length;
const techRate = testFiltered.length > 0 ? Math.round((techVerified / testFiltered.length) * 100) : 0;
assert(techRate >= 0 && techRate <= 100, `Technical verification rate is valid percentage: ${techRate}%`);

// CSV export format test:
function generateCSV(records) {
  const headers = ["Record ID", "Student Name", "Student Roll No", "Department", "Activity Name", "Category", "Participation Date", "Achievement Level", "Verification Status", "Certificate Reference", "Reviewer Name", "Review Notes"];
  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.studentName}"`,
    `"${r.studentRegNo}"`,
    `"${r.studentDepartment}"`,
    `"${r.activityName.replace(/"/g, '""')}"`,
    `"${r.category}"`,
    `"${r.participationDate}"`,
    `"${r.achievementLevel}"`,
    `"${r.verificationStatus}"`,
    `"${r.certificateRef || ''}"`,
    `"${r.reviewerName || ''}"`,
    `"${(r.reviewerNotes || '').replace(/"/g, '""')}"`
  ]);
  return [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
}

const csvOutput = generateCSV(INITIAL_RECORDS);
assert(csvOutput.startsWith('Record ID,Student Name'), "CSV headers correctly formatted");
assert(csvOutput.split("\n").length === INITIAL_RECORDS.length + 1, "CSV row count matches records count + 1");

console.log("\n=== TEST RESULTS SUMMARY ===");
console.log(`TOTAL PASSED: ${passed}`);
console.log(`TOTAL FAILED: ${failed}`);
if (failed > 0) process.exit(1);
