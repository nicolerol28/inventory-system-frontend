import ExcelJS from "exceljs";

export async function exportToExcel(rows, columns, fileName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Datos");

  worksheet.columns = columns.map(({ header }) => ({ header, key: header }));

  rows.forEach((row) => {
    const rowData = {};
    columns.forEach(({ key, header }) => {
      rowData[header] = row[key] ?? "";
    });
    worksheet.addRow(rowData);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName + ".xlsx";
  a.click();
  URL.revokeObjectURL(url);
}
