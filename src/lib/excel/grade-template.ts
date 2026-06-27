import ExcelJS from "exceljs";

export async function createGradeImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ORATRACK";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Grades");
  sheet.columns = [
    { header: "LRN", key: "lrn", width: 18 },
    { header: "Subject Code", key: "subjectCode", width: 18 },
    { header: "Period Code", key: "periodCode", width: 16 },
    { header: "Grade", key: "grade", width: 12 },
    { header: "Remarks", key: "remarks", width: 40 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF166534" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  for (let row = 2; row <= 500; row += 1) {
    sheet.getCell(`D${row}`).dataValidation = {
      type: "decimal",
      operator: "between",
      allowBlank: false,
      formulae: [0, 100],
      showErrorMessage: true,
      errorTitle: "Invalid grade",
      error: "Grade must be between 0 and 100.",
    };
  }

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [{ width: 96 }];
  [
    "Temporary ORATRACK grade import template.",
    "Do not change the column headers in the Grades sheet.",
    "Use learner LRN values from ORATRACK after learners are registered.",
    "Subject Code and Period Code must match configured database values.",
    "Imports should always be reviewed before saving records.",
  ].forEach((line, index) => {
    instructions.getCell(index + 1, 1).value = line;
  });

  return workbook.xlsx.writeBuffer();
}
