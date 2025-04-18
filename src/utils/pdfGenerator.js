import * as pdfMake from "pdfmake/build/pdfmake";
import "pdfmake/build/vfs_fonts";

const documentStyles = {
  defaultStyle: {
    fontSize: 12,
    font: 'Roboto'  // Changed from Helvetica to Roboto (default pdfMake font)
  },
  styles: {
    header: {
      fontSize: 22,
      bold: true,
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    slogan: {
      fontSize: 14,
      italic: true,
      alignment: 'center'
    },
    subheader: {
      fontSize: 18,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    contactInfo: {
      fontSize: 11,
      margin: [0, 5, 0, 5]
    },
    thankYou: {
      fontSize: 12,
      italic: true,
      color: '#666666'
    }
  }
};

// Add fonts configuration
const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

export const generatePDF = async (budget) => {
  const companyData = JSON.parse(localStorage.getItem('pdf_company_data')) || {};

  const docDefinition = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],
    defaultStyle: documentStyles.defaultStyle,
    styles: documentStyles.styles,
    fonts: fonts,  // Add fonts configuration
    content: [
      // Header Section with Logo and Company Info
      {
        columns: [
          // Left column with logo
          companyData.logo && {
            image: companyData.logo,
            width: 80,
            margin: [0, 0, 10, 0]
          },
          // Right column with company info
          {
            stack: [
              { text: companyData.companyName || 'Company Name', style: 'header', margin: [0, 0, 0, 5] },
              { text: companyData.slogan || '', style: 'slogan', margin: [0, 0, 0, 5] },
              {
                text: [
                  `Tel: ${companyData.phone || ''}\n`,
                  `Email: ${companyData.email || ''}\n`,
                  `Dirección: ${companyData.address || ''}`
                ],
                style: 'contactInfo',
                alignment: 'center'
              }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },

      // Budget Title and Client
      { text: 'PRESUPUESTO', style: 'subheader', margin: [0, 0, 0, 10] },
      { text: `Cliente: ${budget.clientName}`, margin: [0, 0, 0, 20] },

      // Budget Items Table
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            ['Descripción', 'Cantidad', 'Total'],
            ...budget.items.map(item => [
              item.description,
              item.quantity.toString(),
              `$${item.total.toFixed(2)}`
            ])
          ]
        }
      },

      // Totals Section
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              body: [
                ['Subtotal Materiales:', `$${budget.materialsTotal.toFixed(2)}`],
                ['Mano de Obra:', `$${(Number(budget.operationalTotal) + Number(budget.administrativeCost)).toFixed(2)}`],
                ['Subtotal:', `$${(Number(budget.materialsTotal) + Number(budget.operationalTotal) + Number(budget.administrativeCost)).toFixed(2)}`],
                ['IVA (19%):', `$${budget.iva.toFixed(2)}`],
                ['Total Final:', `$${budget.grandTotal.toFixed(2)}`]
              ]
            },
            layout: 'noBorders',
            margin: [0, 20, 0, 20]
          }
        ]
      },

      // Footer with Date and Thank You Message
      {
        columns: [
          {
            text: `Fecha: ${new Date().toLocaleDateString()}`,
            alignment: 'left',
            width: '*'
          },
          companyData.thankYouMessage && {
            text: companyData.thankYouMessage,
            style: 'thankYou',
            alignment: 'right',
            width: '*'
          }
        ],
        margin: [0, 20, 0, 0]
      }
    ].filter(Boolean) // Remove null/undefined items
  };

  return pdfMake.createPdf(docDefinition);
};