import ExcelJS from "exceljs";

export async function createLearnerImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ORATRACK";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Learners");
  sheet.columns = [
    { header: "LRN", key: "lrn", width: 18 },
    { header: "First Name", key: "firstName", width: 20 },
    { header: "Middle Name", key: "middleName", width: 20 },
    { header: "Last Name", key: "lastName", width: 20 },
    { header: "Extension Name", key: "extensionName", width: 16 },
    { header: "Sex", key: "sex", width: 12 },
    { header: "Birth Date", key: "birthDate", width: 16 },
    { header: "Address", key: "address", width: 36 },
    { header: "School Year", key: "schoolYear", width: 18 },
    { header: "Grade Level", key: "gradeLevel", width: 16 },
    { header: "Section", key: "section", width: 20 },
    { header: "Enrolled On", key: "enrolledOn", width: 16 },
    { header: "Guardian Name", key: "guardianName", width: 24 },
    { header: "Guardian Relationship", key: "guardianRelationship", width: 22 },
    { header: "Guardian Phone", key: "guardianPhone", width: 18 },
    { header: "Guardian Email", key: "guardianEmail", width: 26 },
    { header: "Guardian Address", key: "guardianAddress", width: 36 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0B2447" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  for (let row = 2; row <= 500; row += 1) {
    sheet.getCell(`F${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"female,male"'],
      showErrorMessage: true,
      errorTitle: "Invalid sex",
      error: "Sex must be female or male.",
    };
    sheet.getCell(`G${row}`).numFmt = "yyyy-mm-dd";
    sheet.getCell(`L${row}`).numFmt = "yyyy-mm-dd";
  }

  sheet.addRow({
    lrn: "990000000001",
    firstName: "Juan",
    middleName: "Santos",
    lastName: "Dela Cruz",
    sex: "male",
    birthDate: "2018-06-12",
    address: "Purok 3, Balili, La Trinidad, Benguet",
    schoolYear: "SY 2026-2027",
    gradeLevel: "Grade 1",
    section: "Narra",
    enrolledOn: "2026-06-01",
    guardianName: "Maria Dela Cruz",
    guardianRelationship: "Mother",
    guardianPhone: "09170000000",
    guardianEmail: "guardian@example.com",
    guardianAddress: "Purok 3, Balili, La Trinidad, Benguet",
  });

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [{ width: 118 }];
  [
    "ORATRACK learner import template.",
    "Do not change the Learners sheet column headers.",
    "Required columns: LRN, First Name, Last Name, Sex, Birth Date, School Year, Grade Level.",
    "Optional Section must match an existing section name for the selected school year and grade level.",
    "Birth Date and Enrolled On should use yyyy-mm-dd.",
    "Sex must be female or male.",
    "If a guardian name is provided, ORATRACK will create or update the primary guardian for that learner.",
  ].forEach((line, index) => {
    instructions.getCell(index + 1, 1).value = line;
  });

  return workbook.xlsx.writeBuffer();
}
