import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportToPDF = (dashboard, expenses, income, username) => {
  try {
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Smart Expense Tracker', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Financial Report', 105, 30, { align: 'center' });
    
    yPosition = 50;
    
    // User Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generated for: ${username}`, 15, yPosition);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 15, yPosition + 6);
    
    yPosition += 20;
    
    // Financial Summary
    doc.setFontSize(16);
    doc.setTextColor(102, 126, 234);
    doc.text('Financial Summary', 15, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    const summaryItems = [
      ['Total Income:', `₹${dashboard?.totalIncome?.toFixed(2) || '0.00'}`],
      ['Total Expenses:', `₹${dashboard?.totalExpenses?.toFixed(2) || '0.00'}`],
      ['Total Savings:', `₹${dashboard?.totalSavings?.toFixed(2) || '0.00'}`],
      ['Savings Rate:', `${dashboard?.savingsRate || '0'}%`]
    ];
    
    summaryItems.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Category-wise Spending
    if (dashboard?.categoryWiseSpending && Object.keys(dashboard.categoryWiseSpending).length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(102, 126, 234);
      doc.text('Category-wise Spending', 15, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      Object.entries(dashboard.categoryWiseSpending).forEach(([category, amount]) => {
        const percentage = ((amount / dashboard.totalExpenses) * 100).toFixed(1);
        doc.setFont(undefined, 'bold');
        doc.text(category, 20, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`₹${amount.toFixed(2)}`, 80, yPosition);
        doc.text(`(${percentage}%)`, 120, yPosition);
        yPosition += 7;
        
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });
      
      yPosition += 10;
    }
    
    // Recent Expenses
    if (expenses && expenses.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(102, 126, 234);
      doc.text('Recent Expenses', 15, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Header
      doc.setFont(undefined, 'bold');
      doc.text('Date', 15, yPosition);
      doc.text('Category', 45, yPosition);
      doc.text('Place', 80, yPosition);
      doc.text('Amount', 130, yPosition);
      
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      
      expenses.slice(0, 20).forEach(exp => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        const date = new Date(exp.date).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        });
        const place = (exp.place || 'N/A').substring(0, 15);
        
        doc.text(date, 15, yPosition);
        doc.text(exp.category, 45, yPosition);
        doc.text(place, 80, yPosition);
        doc.text(`₹${exp.amount.toFixed(2)}`, 130, yPosition);
        
        yPosition += 6;
      });
      
      yPosition += 10;
    }
    
    // Recent Income
    if (income && income.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(102, 126, 234);
      doc.text('Recent Income', 15, yPosition);
      
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Header
      doc.setFont(undefined, 'bold');
      doc.text('Date', 15, yPosition);
      doc.text('Source', 45, yPosition);
      doc.text('Amount', 100, yPosition);
      
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      
      income.slice(0, 15).forEach(inc => {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
        
        const date = new Date(inc.date).toLocaleDateString('en-IN', { 
          day: '2-digit', 
          month: 'short' 
        });
        
        doc.text(date, 15, yPosition);
        doc.text(inc.source, 45, yPosition);
        doc.text(`₹${inc.amount.toFixed(2)}`, 100, yPosition);
        
        yPosition += 6;
      });
    }
    
    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} • Smart Expense Tracker`,
        105,
        290,
        { align: 'center' }
      );
    }
    
    // Save
    const fileName = `expense-report-${new Date().getTime()}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw new Error(error.message || 'Failed to generate PDF');
  }
};

export const exportToExcel = (expenses, income, dashboard) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Smart Expense Tracker - Financial Report'],
      ['Generated:', new Date().toLocaleDateString('en-IN')],
      [''],
      ['Financial Summary'],
      ['Metric', 'Value'],
      ['Total Income', dashboard?.totalIncome || 0],
      ['Total Expenses', dashboard?.totalExpenses || 0],
      ['Total Savings', dashboard?.totalSavings || 0],
      ['Savings Rate', `${dashboard?.savingsRate || 0}%`],
      [''],
      ['Category-wise Spending'],
      ['Category', 'Amount', 'Percentage']
    ];
    
    if (dashboard?.categoryWiseSpending) {
      Object.entries(dashboard.categoryWiseSpending).forEach(([cat, amt]) => {
        const percentage = ((amt / dashboard.totalExpenses) * 100).toFixed(1);
        summaryData.push([cat, amt, `${percentage}%`]);
      });
    }
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Expenses Sheet
    if (expenses && expenses.length > 0) {
      const expensesData = expenses.map(exp => ({
        Date: new Date(exp.date).toLocaleDateString('en-IN'),
        Category: exp.category,
        Amount: exp.amount,
        Place: exp.place || '',
        Description: exp.description || ''
      }));
      
      const expensesSheet = XLSX.utils.json_to_sheet(expensesData);
      expensesSheet['!cols'] = [
        { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(wb, expensesSheet, 'Expenses');
    }
    
    // Income Sheet
    if (income && income.length > 0) {
      const incomeData = income.map(inc => ({
        Date: new Date(inc.date).toLocaleDateString('en-IN'),
        Source: inc.source,
        Amount: inc.amount,
        Description: inc.description || ''
      }));
      
      const incomeSheet = XLSX.utils.json_to_sheet(incomeData);
      incomeSheet['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, incomeSheet, 'Income');
    }
    
    const fileName = `expense-report-${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    throw new Error(error.message || 'Failed to generate Excel');
  }
};
