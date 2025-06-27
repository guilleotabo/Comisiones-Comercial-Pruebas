import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Chart from 'chart.js/auto';

export class PDFGenerator {
  constructor() {
    this.doc = null;
    this.pageHeight = 297;
    this.pageWidth = 210;
    this.margin = 20;
    this.currentY = this.margin;
    this.colors = {
      primary: [0, 109, 119],
      secondary: [131, 197, 190],
      success: [76, 175, 80],
      danger: [244, 67, 54],
      warning: [255, 167, 38],
      dark: [33, 33, 33],
      gray: [117, 117, 117]
    };
  }

  async generatePDF(data) {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.doc.setProperties({
      title: `Comisión ${data.comercial.nombre} - ${data.periodo}`,
      subject: 'Liquidación de Comisiones',
      author: 'SERSA SAECA',
      keywords: 'comisiones, comercial, liquidación',
      creator: 'Sistema de Comisiones v1.0'
    });

    await this.addHeader(data);
    this.addExecutiveSummary(data);
    await this.addVisualComposition(data);
    this.addVolumeDetails(data);
    this.addCalculationDetails(data);
    this.addMultiplierDetails(data);
    this.addFooter(data);

    return this.doc.output('blob');
  }

  async addHeader(data) {
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.margin, this.margin, 170, 40, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SERSA SAECA', this.margin + 10, this.margin + 15);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('LIQUIDACIÓN DE COMISIONES', this.margin + 10, this.margin + 25);
    this.doc.setFontSize(14);
    this.doc.text(data.periodo, this.margin + 10, this.margin + 35);
    this.currentY = this.margin + 50;

    this.doc.setTextColor(...this.colors.dark);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DATOS DEL COMERCIAL', this.margin, this.currentY);
    this.currentY += 7;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Nombre: ${data.comercial.nombre}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Perfil: ${data.comercial.perfil}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text(`Fecha de generación: ${new Date().toLocaleString('es-PY')}`, this.margin, this.currentY);
    this.currentY += 7;
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  addExecutiveSummary(data) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('RESUMEN EJECUTIVO', this.margin, this.currentY);
    this.currentY += 10;

    const kpis = [
      { label: 'NIVEL ALCANZADO', value: data.nivel, color: this.colors.primary },
      { label: 'SUBTOTAL', value: this.formatMoney(data.subtotal), color: this.colors.secondary },
      { label: 'MULTIPLICADOR', value: (data.multiplicador * 100).toFixed(1) + '%', color: this.colors.warning },
      { label: 'COMISIÓN TOTAL', value: this.formatMoney(data.total), color: this.colors.success }
    ];

    const boxWidth = 40;
    const boxHeight = 25;
    const spacing = 5;
    let boxX = this.margin;

    kpis.forEach(kpi => {
      this.doc.setFillColor(...kpi.color);
      this.doc.roundedRect(boxX, this.currentY, boxWidth, boxHeight, 3, 3, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text(kpi.label, boxX + boxWidth / 2, this.currentY + 8, { align: 'center' });
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(kpi.value, boxX + boxWidth / 2, this.currentY + 17, { align: 'center' });
      boxX += boxWidth + spacing;
    });

    this.currentY += boxHeight + 15;
  }

  async addVisualComposition(data) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('COMPOSICIÓN DE LA COMISIÓN', this.margin, this.currentY);
    this.currentY += 10;

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const chartData = {
      labels: ['Base', 'Carrera', 'Interno', 'Externo', 'Recuperado', 'Cantidad', 'Equipo'],
      datasets: [{
        data: [data.desglose.base, data.desglose.carrera, data.desglose.interno, data.desglose.externo, data.desglose.recuperado, data.desglose.cantidad, data.desglose.equipo],
        backgroundColor: ['#006D77', '#83C5BE', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#795548']
      }]
    };

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });

    await new Promise(r => setTimeout(r, 100));
    const imgData = canvas.toDataURL('image/png');
    this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, 170, 60);
    this.currentY += 70;
    chart.destroy();
  }

  addVolumeDetails(data) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('DETALLE DE VOLÚMENES', this.margin, this.currentY);
    this.currentY += 10;

    const volumeHeaders = ['Concepto', 'Valor', 'Meta', 'Nivel', 'Cumplimiento'];
    const volumeData = [
      ['Monto Interno', this.formatMoney(data.volumenes.montoInterno), this.formatMoney(data.metas.montoInterno), data.niveles.interno || 'No alcanzado', this.getProgressBar(data.volumenes.montoInterno, data.metas.montoInterno)],
      ['Monto Externo', this.formatMoney(data.volumenes.montoExterno), this.formatMoney(data.metas.montoExterno), data.niveles.externo || 'No alcanzado', this.getProgressBar(data.volumenes.montoExterno, data.metas.montoExterno)],
      ['Recuperados +3M', this.formatMoney(data.volumenes.montoRecuperado), this.formatMoney(data.metas.montoRecuperado), data.niveles.recuperado || 'No alcanzado', this.getProgressBar(data.volumenes.montoRecuperado, data.metas.montoRecuperado)],
      ['Cantidad Desembolsos', data.volumenes.cantidad.toString(), data.metas.cantidad.toString(), data.niveles.cantidad || 'No alcanzado', this.getProgressBar(data.volumenes.cantidad, data.metas.cantidad)]
    ];

    this.doc.autoTable({
      head: [volumeHeaders],
      body: volumeData,
      startY: this.currentY,
      margin: { left: this.margin },
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: this.colors.primary, textColor: [255, 255, 255] },
      columnStyles: { 4: { cellWidth: 60 } }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  addCalculationDetails(data) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('CÁLCULO DETALLADO', this.margin, this.currentY);
    this.currentY += 10;

    const calcHeaders = ['Concepto', 'Monto (Gs)'];
    const calcData = [
      ['Base Fija', this.formatMoney(data.desglose.base)],
      ['Premio Carrera', this.formatMoney(data.desglose.carrera)],
      ['Premio Monto Interno', this.formatMoney(data.desglose.interno)],
      ['Premio Monto Externo', this.formatMoney(data.desglose.externo)],
      ['Premio Recuperados', this.formatMoney(data.desglose.recuperado)],
      ['Premio Cantidad', this.formatMoney(data.desglose.cantidad)],
      ['Premio Equipo', this.formatMoney(data.desglose.equipo)],
      ['', ''],
      ['SUBTOTAL', this.formatMoney(data.subtotal)],
      ['Multiplicador aplicado', (data.multiplicador * 100).toFixed(1) + '%'],
      ['', ''],
      ['COMISIÓN TOTAL', this.formatMoney(data.total)]
    ];

    this.doc.autoTable({
      head: [calcHeaders],
      body: calcData,
      startY: this.currentY,
      margin: { left: this.margin },
      theme: 'striped',
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: this.colors.primary, textColor: [255, 255, 255] },
      bodyStyles: { textColor: this.colors.dark },
      didParseCell: (tbl) => {
        if (tbl.row.index === 8 || tbl.row.index === 11) {
          tbl.cell.styles.fontStyle = 'bold';
          tbl.cell.styles.fontSize = 12;
          if (tbl.row.index === 11) {
            tbl.cell.styles.fillColor = this.colors.success;
            tbl.cell.styles.textColor = [255, 255, 255];
          }
        }
      }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  addMultiplierDetails(data) {
    if (this.currentY > 200) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('DETALLE DE MULTIPLICADORES', this.margin, this.currentY);
    this.currentY += 10;

    const multHeaders = ['Indicador', 'Valor', 'Multiplicador', 'Estado'];
    const multData = [
      ['Conversión', data.indicadores.conversion + '%', (data.multiplicadores.conversion * 100).toFixed(0) + '%', this.getMultStatus(data.multiplicadores.conversion)],
      ['Empatía/Mystery', data.indicadores.empatia + '%', (data.multiplicadores.empatia * 100).toFixed(0) + '%', this.getMultStatus(data.multiplicadores.empatia)],
      ['Proceso/CRM', data.indicadores.proceso + '%', (data.multiplicadores.proceso * 100).toFixed(0) + '%', this.getMultStatus(data.multiplicadores.proceso)],
      ['Mora', data.indicadores.mora + '%', (data.multiplicadores.mora * 100).toFixed(0) + '%', this.getMultStatus(data.multiplicadores.mora, true)]
    ];

    this.doc.autoTable({
      head: [multHeaders],
      body: multData,
      startY: this.currentY,
      margin: { left: this.margin },
      theme: 'grid',
      styles: { fontSize: 11, cellPadding: 4 },
      headStyles: { fillColor: this.colors.primary, textColor: [255, 255, 255] }
    });

    this.currentY = this.doc.lastAutoTable.finalY + 10;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Cálculo multiplicador total:', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.setFont('helvetica', 'normal');
    const formula = `${(data.multiplicadores.conversion * 100).toFixed(0)}% × ${(data.multiplicadores.empatia * 100).toFixed(0)}% × ${(data.multiplicadores.proceso * 100).toFixed(0)}% × ${(data.multiplicadores.mora * 100).toFixed(0)}% = ${(data.multiplicador * 100).toFixed(1)}%`;
    this.doc.text(formula, this.margin, this.currentY);
    this.currentY += 15;
  }

  addFooter() {
    this.currentY = this.pageHeight - 40;
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
    const verificationCode = this.generateVerificationCode();
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.gray);
    this.doc.text(`Código de verificación: ${verificationCode}`, this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('Este documento es un comprobante oficial de la liquidación de comisiones.', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('Sistema de Comisiones SERSA SAECA v1.0', this.margin, this.currentY);

    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(10);
      this.doc.setTextColor(...this.colors.gray);
      this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth - this.margin - 20, this.pageHeight - 10);
    }
  }

  formatMoney(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getProgressBar(current, target) {
    const percentage = Math.min((current / target) * 100, 100);
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage.toFixed(0)}%`;
  }

  getMultStatus(mult, inverse = false) {
    if (inverse) {
      if (mult >= 1) return '✅ Óptimo';
      if (mult >= 0.9) return '⚠️ Regular';
      return '❌ Crítico';
    }
    if (mult >= 0.9) return '✅ Óptimo';
    if (mult >= 0.7) return '⚠️ Regular';
    return '❌ Crítico';
  }

  generateVerificationCode() {
    const str = new Date().toISOString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash &= hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().substring(0, 8);
  }
}

export function setupPDFGeneration() {
  window.generateProfessionalPDF = async () => {
    try {
      const name = prompt('Nombre del comercial:') || 'Juan Pérez';
      const periodo = new Date().toLocaleDateString('es-PY', { month: 'long', year: 'numeric' }).toUpperCase();
      calcular();
      const total = parseInt(document.getElementById('comisionTotal').textContent.replace(/\D/g, ''), 10);
      const data = {
        comercial: { nombre: name, perfil: 'N/A' },
        periodo,
        nivel: '',
        subtotal: 0,
        multiplicador: 1,
        total,
        desglose: { base: 0, carrera: 0, interno: 0, externo: 0, recuperado: 0, cantidad: 0, equipo: 0 },
        volumenes: {
          montoInterno: parseMoney(document.getElementById('montoInterno').value) || 0,
          montoExterno: parseMoney(document.getElementById('montoExterno').value) || 0,
          montoRecuperado: parseMoney(document.getElementById('montoRecuperado').value) || 0,
          cantidad: Number(document.getElementById('cantidad').value) || 0
        },
        metas: {
          montoInterno: metas.montoInterno[2],
          montoExterno: metas.montoExterno[2],
          montoRecuperado: metas.montoRecuperado[2],
          cantidad: metas.cantidad[2]
        },
        niveles: { interno: 'Senior A', externo: 'Senior A', recuperado: 'Senior A', cantidad: 'Senior A' },
        llaves: {
          montos: Number(document.getElementById('cantidad').value) >= 6,
          semanal: Number(document.getElementById('menorSemana').value) >= 2
        },
        indicadores: {
          conversion: Number(document.getElementById('conv').value) || 0,
          empatia: Number(document.getElementById('emp').value) || 0,
          proceso: Number(document.getElementById('proc').value) || 0,
          mora: Number(document.getElementById('mora').value) || 0
        },
        multiplicadores: { conversion: 1, empatia: 1, proceso: 1, mora: 1 }
      };

      const generator = new PDFGenerator();
      const pdfBlob = await generator.generatePDF(data);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Comision_${name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
    }
  };
}
