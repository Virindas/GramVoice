import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class ExcelReporter {
  constructor(reportDir = './reports') {
    this.reportDir = reportDir;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  }

  async generateReport(results) {
    const reportPath = path.join(this.reportDir, 'gramvoice_mobile_screens_report.xlsx');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Appium Screen Runner';
    workbook.created = new Date();

    const thinBorder = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } }
    };

    // Calculate metrics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const skippedTests = results.filter(r => r.status === 'SKIPPED').length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    // ----------------------------------------------------
    // TAB 1: SUMMARY
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.views = [{ showGridLines: true }];

    // Title Block
    summarySheet.mergeCells('B2:G3');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = 'GramVoice Mobile App Screen Test Summary';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '3730A3' } // Indigo-800
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Write Summary Information
    const summaryLabels = [
      ['Total Mobile Test Cases', totalTests, '3B82F6'],
      ['Passed Screens Tests', passedTests, '10B981'],
      ['Failed Screens Tests', failedTests, 'EF4444'],
      ['Skipped Screens Tests', skippedTests, 'F59E0B'],
      ['Overall Success Rate', `${passRate.toFixed(2)}%`, '8B5CF6'],
      ['Total Run Duration', `${(totalDuration / 1000).toFixed(2)}s`, '6B7280']
    ];

    let rowIdx = 6;
    summaryLabels.forEach(([label, value, colorHex]) => {
      const labelCell = summarySheet.getCell(`B${rowIdx}`);
      const valCell = summarySheet.getCell(`C${rowIdx}`);

      labelCell.value = label;
      labelCell.font = { name: 'Arial', size: 11, bold: true };
      labelCell.border = thinBorder;
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };

      valCell.value = value;
      valCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: colorHex } };
      valCell.border = thinBorder;
      valCell.alignment = { horizontal: 'right' };

      rowIdx++;
    });

    // Category Breakdown Table
    summarySheet.mergeCells('E6:G6');
    const categoryHeader = summarySheet.getCell('E6');
    categoryHeader.value = 'Category Breakdown';
    categoryHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    categoryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F46E5' } };
    categoryHeader.alignment = { horizontal: 'center' };

    const categories = [...new Set(results.map(r => r.category))];
    let catRow = 7;
    categories.forEach(cat => {
      const catTests = results.filter(r => r.category === cat);
      const catPass = catTests.filter(r => r.status === 'PASS').length;
      
      summarySheet.getCell(`E${catRow}`).value = cat;
      summarySheet.getCell(`E${catRow}`).border = thinBorder;
      summarySheet.getCell(`F${catRow}`).value = `${catPass} / ${catTests.length} Passed`;
      summarySheet.getCell(`F${catRow}`).border = thinBorder;
      summarySheet.getCell(`G${catRow}`).value = `${((catPass/catTests.length)*100).toFixed(0)}%`;
      summarySheet.getCell(`G${catRow}`).border = thinBorder;
      summarySheet.getCell(`G${catRow}`).alignment = { horizontal: 'right' };
      catRow++;
    });

    // ----------------------------------------------------
    // TAB 2: DETAILS
    // ----------------------------------------------------
    const detailSheet = workbook.addWorksheet('Details');
    detailSheet.views = [{ showGridLines: true }];

    const headers = [
      'Test Case ID', 
      'Category', 
      'Test Title', 
      'Action Steps', 
      'Expected Outcome', 
      'Status', 
      'Duration (ms)', 
      'Error Context'
    ];

    detailSheet.addRow([]); // Blank first row
    const headerRow = detailSheet.addRow(headers);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F46E5' } // Indigo Header
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });

    // Write Data Rows
    results.forEach(test => {
      const row = detailSheet.addRow([
        test.id,
        test.category,
        test.name,
        test.steps,
        test.expected,
        test.status,
        test.duration || 0,
        test.error || ''
      ]);

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', wrapText: true };

        if (colNumber === 1 || colNumber === 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Color status cells
        if (colNumber === 6) {
          if (test.status === 'PASS') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'D1FAE5' } // Soft Green
            };
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '065F46' } };
          } else if (test.status === 'FAIL') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FEE2E2' } // Soft Red
            };
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '991B1B' } };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FEF3C7' } // Soft Amber
            };
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: '92400E' } };
          }
        }
      });
    });

    // Auto-fit Columns (width constraints)
    detailSheet.columns.forEach((column, index) => {
      if (index === 0) return;
      let maxLen = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : '';
        const lines = valStr.split('\n');
        lines.forEach(line => {
          if (line.length > maxLen) maxLen = line.length;
        });
      });
      column.width = Math.min(Math.max(maxLen + 4, 10), 45);
    });

    // Write file with lock resilience
    try {
      await workbook.xlsx.writeFile(reportPath);
      console.log(`Mobile screens Excel report successfully generated at: ${reportPath}`);
      return reportPath;
    } catch (writeErr) {
      if (writeErr.code === 'EBUSY') {
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const altPath = path.join(this.reportDir, `gramvoice_mobile_screens_report_${timestamp}.xlsx`);
        console.warn(`\n⚠️ Primary report file was locked (EBUSY). Saving to alternative path: ${altPath}`);
        await workbook.xlsx.writeFile(altPath);
        return altPath;
      }
      throw writeErr;
    }
  }
}
