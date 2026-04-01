const pickFirst = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const normalizeIdValue = (value) => {
  if (value && typeof value === "object") {
    return pickFirst(value._id, value.id, value.studentId);
  }
  return value;
};

export const getStudentName = (student = {}) =>
  pickFirst(student.name, student.studentName, student.fullName, "Student");

export const getStudentUniqueId = (student = {}) =>
  pickFirst(
    student.username,
    student.studentCode,
    student.roll,
    student.rollNo,
    student.rollNumber,
    student.admissionNo,
    student.admissionNumber,
    normalizeIdValue(student.studentId),
    student._id,
    student.id
  );

export const getStudentSection = (student = {}) =>
  pickFirst(student.section, student.sectionName, student.sec);

export const formatStudentDisplay = (student = {}) => {
  const name = getStudentName(student);
  const uniqueId = getStudentUniqueId(student) || "-";
  const section = getStudentSection(student) || "-";
  return `${name} • ID: ${uniqueId} • Section: ${section}`;
};
