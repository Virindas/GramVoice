import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export class ExcelLoadReporter {
  constructor(reportDir = './reports') {
    this.reportDir = reportDir;
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
  }

  async generateReport(summary, timeline) {
    const reportPath = path.join(this.reportDir, 'gramvoice_load_test_report.xlsx');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Antigravity Load Tester';
    workbook.created = new Date();

    const thinBorder = {
      top: { style: 'thin', color: { argb: 'D1D5DB' } },
      left: { style: 'thin', color: { argb: 'D1D5DB' } },
      bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
      right: { style: 'thin', color: { argb: 'D1D5DB' } }
    };

    // ----------------------------------------------------
    // SHEET 1: DASHBOARD
    // ----------------------------------------------------
    const dashSheet = workbook.addWorksheet('Dashboard');
    dashSheet.views = [{ showGridLines: true }];

    // Title Block
    dashSheet.mergeCells('B2:G3');
    const titleCell = dashSheet.getCell('B2');
    titleCell.value = 'GramVoice Baseline Load Test Analysis';
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0F172A' } // Very Dark Slate
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Metric Summary Labels
    const metrics = [
      ['Target URL', summary.targetUrl, '0284C7'],
      ['Simulated Concurrency (VU)', summary.concurrency, '3B82F6'],
      ['Execution Duration', `${summary.duration}s`, '10B981'],
      ['Total Requests Sent', summary.totalRequests, '6366F1'],
      ['Average Requests/Sec (RPS)', summary.avgRps.toFixed(2), 'F59E0B'],
      ['Successful Requests', summary.successRequests, '10B981'],
      ['Failed Requests (Errors)', summary.failRequests, 'EF4444'],
      ['Overall Success Rate', `${summary.successRate.toFixed(2)}%`, '8B5CF6'],
      ['Average Response Time (Latency)', `${summary.avgLatency.toFixed(1)}ms`, '6B7280'],
      ['Min Response Time', `${summary.minLatency}ms`, '10B981'],
      ['Max Response Time', `${summary.maxLatency}ms`, 'EF4444']
    ];

    let rowIdx = 6;
    metrics.forEach(([label, value, colorHex]) => {
      const labelCell = dashSheet.getCell(`B${rowIdx}`);
      const valCell = dashSheet.getCell(`C${rowIdx}`);

      labelCell.value = label;
      labelCell.font = { name: 'Arial', size: 11, bold: true };
      labelCell.border = thinBorder;
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8FAFC' }
      };

      valCell.value = value;
      valCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: colorHex } };
      valCell.border = thinBorder;
      valCell.alignment = { horizontal: 'right' };

      rowIdx++;
    });

    // Descriptive Summary text
    dashSheet.mergeCells('E6:G10');
    const descCell = dashSheet.getCell('E6');
    descCell.value = "Load Testing Summary Notes:\n\n" +
      "This test validates system throughput and API latency under stress. " +
      "A constant pool of 300 virtual users made back-to-back requests to the platform for 1 full minute. " +
      "Low average latency (< 500ms) indicates healthy routing performance, while error rates reflect database connection thresholds.";
    descCell.font = { name: 'Arial', size: 10, italic: true };
    descCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    descCell.border = thinBorder;

    // ----------------------------------------------------
    // SHEET 2: TIMELINE ANALYSIS
    // ----------------------------------------------------
    const timeSheet = workbook.addWorksheet('Timeline Timeline');
    timeSheet.views = [{ showGridLines: true }];

    const headers = [
      'Second Offset',
      'Target Users',
      'Requests Sent',
      'Successful Requests',
      'Failed Requests',
      'Average Latency (ms)',
      'Min Latency (ms)',
      'Max Latency (ms)',
      'Success Rate (%)'
    ];

    timeSheet.addRow([]); // Blank line
    const headerRow = timeSheet.addRow(headers);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F766E' } // Teal Header
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = thinBorder;
    });

    timeline.forEach(row => {
      const dataRow = timeSheet.addRow([
        `+${row.second}s`,
        row.users,
        row.requests,
        row.success,
        row.fail,
        Math.round(row.avgLatency),
        row.minLatency,
        row.maxLatency,
        parseFloat(row.successRate.toFixed(1))
      ]);

      dataRow.height = 20;
      dataRow.eachCell((cell, colIdx) => {
        cell.font = { name: 'Arial', size: 10 };
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        
        if (colIdx === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Arial', size: 10, bold: true };
        }

        // Highlight high failures
        if (colIdx === 5 && row.fail > 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FEE2E2' }
          };
          cell.font = { name: 'Arial', size: 10, color: { argb: '991B1B' }, bold: true };
        }
      });
    });

    // Auto-fit Column widths
    timeSheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell({ includeEmpty: false }, (cell) => {
        const valStr = cell.value ? cell.value.toString() : '';
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      column.width = Math.max(maxLen + 4, 12);
    });

    // Write to disk with locked-file fallback
    try {
      await workbook.xlsx.writeFile(reportPath);
      console.log(`Load report successfully generated at: ${reportPath}`);
      return reportPath;
    } catch (writeErr) {
      if (writeErr.code === 'EBUSY') {
        const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        const altPath = path.join(this.reportDir, `gramvoice_load_test_report_${timestamp}.xlsx`);
        console.warn(`\n⚠️ Primary load report locked (EBUSY). Saving to alternative path: ${altPath}`);
        await workbook.xlsx.writeFile(altPath);
        return altPath;
      }
      throw writeErr;
    }
  }
}
