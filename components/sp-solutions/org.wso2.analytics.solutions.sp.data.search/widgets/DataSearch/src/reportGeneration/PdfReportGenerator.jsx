/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */
import Jspdf from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import DateFormat from 'dateformat';

const pdfTableStyles =  {
    startY: 60,
    styles: {
        fontSize: 6,
        rowHeight: 15,
        lineColor: [255, 255, 255],
        lineWidth: 1,
        overflow: 'linebreak',
    },
    columnStyles: { 1: { columnWidth: 'auto' } },
    headerStyles: { fillColor: [201, 202, 197], textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [240, 236, 224] },
    bodyStyles: { fillColor: [255, 255, 255] },
    margin: { top: 50, bottom: 30 }
};

export default class PdfReportGenerator {
    static createTablePdf(element,themeName,title,description) {
        const pdf = new Jspdf('p', 'pt');
        const tableData = PdfReportGenerator.getTableData(pdf, element, themeName);
        const totalPagesExp = '{total_pages_count_string}';
        // HEADER
        var pdfInfo = 'Generated on : ' + DateFormat(new Date(), 'dd/mm/yyyy, h:MM TT');
        pdf.setFontSize(10);
        pdf.text(pdfInfo, 40, 15 );

        //Title
        pdf.setFontSize(16);
        pdf.setFontStyle('normal');
        pdf.text(title, 40, 40);

        //Description
        pdf.setFontSize(13);
        pdf.setFontStyle('normal');
        pdf.text(description, 40, 55);

        var pageContent = function (data) {
            // FOOTER
            var str = "Page " + data.pageCount;
            if (typeof pdf.putTotalPages === 'function') {
                str = str + " of " + totalPagesExp;
            }
            pdf.setFontSize(10);
            var pageHeight = pdf.internal.pageSize.height || pdf.internal.pageSize.getHeight();
            pdf.text(str, data.settings.margin.left, pageHeight  - 10);
        };

        const tableStyles = pdfTableStyles;
        tableStyles.addPageContent = pageContent;
        pdf.autoTable(tableData.columnData, tableData.rowData, tableStyles);

        if (typeof pdf.putTotalPages === 'function') {
            pdf.putTotalPages(totalPagesExp);
        }
        pdf.save("report.pdf");
    }

    static createChartPdf(element,title,description) {
        html2canvas(element)
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new Jspdf('l','pt','a4');

                //Add Date and Time Info
                var pdfInfo = 'Generated on : ' + DateFormat(new Date(), 'dd/mm/yyyy, h:MM TT');
                pdf.setFontSize(12);
                pdf.text(pdfInfo, 15, 25 );

                //Add Title
                pdf.setFontSize(18);
                pdf.setFontStyle('normal');
                pdf.text(title, 15, 55);

                //Add Description
                pdf.setFontSize(13);
                pdf.setFontStyle('normal');
                pdf.text(description, 15, 75);

                const resizeDimensions = PdfReportGenerator.getImageResizeDimensions(canvas, pdf);
                if (!(canvas instanceof HTMLCanvasElement)) {
                    canvas = canvas.imageData;
                }
                const xPosition = (pdf.internal.pageSize.getWidth() - resizeDimensions.width) / 2;
                let yPosition = (pdf.internal.pageSize.getHeight() - resizeDimensions.height
                    - 120) / 2;
                if (yPosition < 120) {
                    yPosition += 120;
                }
                pdf.addImage(canvas, 'PNG', xPosition, yPosition, resizeDimensions.width, resizeDimensions.height);
                pdf.save("report.pdf");
            });
    }

    static getTableData(pdf, element, themeName) {
        const colData = PdfReportGenerator.getColumnData(element);
        const rowData = PdfReportGenerator.getRowData(element, colData.length, themeName);
        return { columnData: colData, rowData };
    }

    static getRowData(element, columnCount, themeName) {
        let rowDivs;
        if (themeName === 'dark') {
            rowDivs = element.getElementsByClassName('cell-data');
        } else {
            rowDivs = element.getElementsByTagName('span');
        }

        const rowNum = rowDivs.length / columnCount;
        const rowData = [];

        for (let i = 0; i < rowNum; i++) {
            const row = [];
            for (let j = 0; j < columnCount; j++) {
                row.push(rowDivs[(columnCount * i) + j].innerText);
            }
            rowData.push(row);
        }
        return rowData;
    }

    static getColumnData(element) {
        const colDivs = element.getElementsByClassName('rt-resizable-header-content');
        const colData = [];
        const colNum = colDivs.length;

        for (let i = 0; i < colNum; i++) {
            colData.push(colDivs[i].innerHTML);
        }
        return colData;
    }

    /**
     * Resize an image
     * @private
     * @param {object} canvas canvas containing the image to be resized
     * @param {object} pdf Jspdf object
     * @returns {{width: *, height: *}} returns the image resize height and width
     */
    static getImageResizeDimensions(canvas, pdf) {
        let printHeight = canvas.height;
        let printWidth = canvas.width;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight() - 120;
        const k = Math.max(printWidth / pageWidth, printHeight / pageHeight);

        while ((Math.round(pageWidth) < Math.round(printWidth)) || (Math.round(pageHeight) < Math.round(printHeight))) {
            if (k < 1) {
                printHeight *= k;
                printWidth *= k;
            } else {
                printHeight /= k;
                printWidth /= k;
            }
        }
        return { width: Math.round(printWidth), height: Math.round(printHeight) };
    }
}
