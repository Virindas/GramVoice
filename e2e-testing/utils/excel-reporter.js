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
    const reportPath = path.join(this.reportDir, 'gramvoice_test_report.xlsx');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Antigravity E2E Runner';
    workbook.created = new Date();

    // ----------------------------------------------------
    // SHEET 1: SUMMARY
    // ----------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary Dashboard');
    summarySheet.views = [{ showGridLines: true }];

    // Style helper for borders
    const thinBorder = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } }
    };

    // Add Title Block
    summarySheet.mergeCells('B2:G3');
    const titleCell = summarySheet.getCell('B2');
    titleCell.value = 'GramVoice Citizen grievance portal - End-to-End Test Execution Report';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E293B' } // Dark Slate Blue
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Calculate metrics
    const totalTests = results.length;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    const skippedTests = results.filter(r => r.status === 'SKIPPED').length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

    // Write Summary Information
    const summaryLabels = [
      ['Total Test Cases Run', totalTests, '3B82F6'], // Blue
      ['Passed Test Cases', passedTests, '10B981'],    // Green
      ['Failed Test Cases', failedTests, 'EF4444'],    // Red
      ['Skipped Test Cases', skippedTests, 'F59E0B'],  // Amber
      ['Pass Rate (%)', `${passRate.toFixed(2)}%`, '8B5CF6'], // Purple
      ['Total Duration', `${(totalDuration / 1000).toFixed(2)}s`, '6B7280'] // Gray
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
        fgColor: { argb: 'F3F4F6' }
      };

      valCell.value = value;
      valCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: colorHex } };
      valCell.border = thinBorder;
      valCell.alignment = { horizontal: 'right' };

      rowIdx++;
    });

    // Write Platform breakdown
    summarySheet.mergeCells('E6:G6');
    const platformHeader = summarySheet.getCell('E6');
    platformHeader.value = 'Platform Breakdown';
    platformHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    platformHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    platformHeader.alignment = { horizontal: 'center' };

    const webTotal = results.filter(r => r.platform === 'Web').length;
    const webPass = results.filter(r => r.platform === 'Web' && r.status === 'PASS').length;
    const mobTotal = results.filter(r => r.platform === 'Mobile').length;
    const mobPass = results.filter(r => r.platform === 'Mobile' && r.status === 'PASS').length;

    // Web Row
    summarySheet.getCell('E7').value = 'Web (Selenium)';
    summarySheet.getCell('E7').font = { name: 'Arial', bold: true };
    summarySheet.getCell('E7').border = thinBorder;
    summarySheet.getCell('F7').value = `${webPass} / ${webTotal} Passed`;
    summarySheet.getCell('F7').border = thinBorder;
    summarySheet.getCell('G7').value = webTotal > 0 ? `${((webPass/webTotal)*100).toFixed(1)}%` : '0%';
    summarySheet.getCell('G7').border = thinBorder;
    summarySheet.getCell('G7').alignment = { horizontal: 'right' };

    // Mobile Row
    summarySheet.getCell('E8').value = 'Mobile (Appium)';
    summarySheet.getCell('E8').font = { name: 'Arial', bold: true };
    summarySheet.getCell('E8').border = thinBorder;
    summarySheet.getCell('F8').value = `${mobPass} / ${mobTotal} Passed`;
    summarySheet.getCell('F8').border = thinBorder;
    summarySheet.getCell('G8').value = mobTotal > 0 ? `${((mobPass/mobTotal)*100).toFixed(1)}%` : '0%';
    summarySheet.getCell('G8').border = thinBorder;
    summarySheet.getCell('G8').alignment = { horizontal: 'right' };

    // Category Breakdown Table
    summarySheet.mergeCells('E11:G11');
    const categoryHeader = summarySheet.getCell('E11');
    categoryHeader.value = 'Category Breakdown';
    categoryHeader.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    categoryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '334155' } };
    categoryHeader.alignment = { horizontal: 'center' };

    const categories = [...new Set(results.map(r => r.category))];
    let catRow = 12;
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
    // SHEET 2: DETAILED RESULTS
    // ----------------------------------------------------
    const detailSheet = workbook.addWorksheet('Detailed Results');
    detailSheet.views = [{ showGridLines: true }];

    // Headers
    const headers = [
      'Test Case ID', 
      'Platform', 
      'Category', 
      'Test Title', 
      'Test Steps', 
      'Expected Outcome', 
      'Status', 
      'Duration (ms)', 
      'Error Logs / Context'
    ];

    detailSheet.addRow([]); // Blank first row
    const headerRow = detailSheet.addRow(headers);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '2563EB' } // Royal Blue Header
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });

    // Write Data Rows
    results.forEach(test => {
      const row = detailSheet.addRow([
        test.id,
        test.platform,
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

        // Column formatting
        if (colNumber === 1 || colNumber === 2 || colNumber === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 8) {
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }

        // Color status cells
        if (colNumber === 7) {
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
      if (index === 0) return; // Skip spacing column
      let maxLen = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : '';
        // If it's a multiline cell, find the longest line
        const lines = valStr.split('\n');
        lines.forEach(line => {
          if (line.length > maxLen) maxLen = line.length;
        });
      });
      // Cap column width to keep readable
      column.width = Math.min(Math.max(maxLen + 4, 10), 45);
    });

    // Write to file
    try {
      await workbook.xlsx.writeFile(reportPath);
      console.log(`Excel report successfully generated at: ${reportPath}`);
      return reportPath;
    } catch (writeErr) {
      if (writeErr.code === 'EBUSY') {
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const altPath = path.join(this.reportDir, `gramvoice_test_report_${timestamp}.xlsx`);
        console.warn(`\n⚠️ Primary report file was locked (EBUSY). Saving to alternative path: ${altPath}`);
        await workbook.xlsx.writeFile(altPath);
        return altPath;
      }
      throw writeErr;
    }
  }
}
