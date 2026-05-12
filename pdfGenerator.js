const PDFDocument = require('pdfkit');

function generarGuiaRemision(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ENCABEZADO
    doc.fontSize(10).text('AC COMERCIAL DEL PERU S.A.C.', 40, 40, { align: 'left' });
    doc.fontSize(8).text('JR. CAJAMARCA NRO. 971 LIMA - LIMA - RIMAC', 40, 52);
    doc.text('PUNTO DE EMISION: CAR. PERALVILLO 3220 (PAN.NORTE) LIMA', 40, 62);

    doc.fontSize(10).font('Helvetica-Bold').text('R.U.C. N° 20603138831', 400, 40, { align: 'right' });
    doc.fontSize(12).text('GUÍA DE REMISIÓN', 400, 55, { align: 'right' });
    doc.text('ELECTRÓNICA REMITENTE', 400, 70, { align: 'right' });
    doc.fontSize(14).fillColor('#16a34a').text(guia.numero_guia, 400, 88, { align: 'right' });
    doc.fillColor('black');

    doc.moveTo(40, 110).lineTo(555, 110).stroke();

    // DATOS DE ENVÍO
    doc.fontSize(8).font('Helvetica-Bold').text('DATOS DE ENVÍO', 40, 118);
    doc.font('Helvetica');
    doc.text(`N° Carga Basis/Transporte: ${guia.numero_carga}`, 40, 130);
    doc.text(`Fecha de Inicio de Traslado: ${guia.fecha_traslado}`, 40, 142);
    doc.text(`Fecha de entrega al transportista: ${guia.fecha_traslado}`, 40, 154);
    doc.text(`Motivo de Traslado: ${guia.motivo_traslado}`, 40, 166);

    doc.text(`Punto de Partida: ${guia.punto_partida}`, 280, 130);
    doc.text(`Punto de Llegada: ${guia.punto_llegada}`, 280, 142);

    doc.moveTo(40, 182).lineTo(555, 182).stroke();

    // DATOS DEL DESTINATARIO
    doc.font('Helvetica-Bold').text('DATOS DEL DESTINATARIO', 40, 190);
    doc.font('Helvetica');
    doc.text(`Tipo y Nro. Documento: RUC ${guia.cliente_ruc}`, 40, 202);
    doc.text(`Razón Social / Nombre Completo: ${guia.cliente_nombre}`, 40, 214);

    doc.moveTo(40, 228).lineTo(555, 228).stroke();

    // BIENES POR TRANSPORTAR
    doc.font('Helvetica-Bold').text('BIENES POR TRANSPORTAR', 40, 236);

    // Encabezado tabla
    const colWidths = [25, 55, 60, 0, 200, 60, 60, 60];
    const colX = [40, 65, 120, 180, 180, 380, 440, 495];
    const tableY = 250;

    doc.rect(40, tableY, 515, 18).fill('#e5e7eb');
    doc.fillColor('black').fontSize(7).font('Helvetica-Bold');
    ['N°', 'CÓD. BIEN', 'CÓD. SUNAT', '', 'DESCRIPCIÓN DETALLADA', 'UNIDAD', 'CAJA-UNI', 'CANTIDAD'].forEach((h, i) => {
      if (h) doc.text(h, colX[i], tableY + 5, { width: colWidths[i] || 195, align: 'center' });
    });

    // Filas
    doc.font('Helvetica').fontSize(7);
    let y = tableY + 18;
    items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(40, y, 515, 16).fill('#f9fafb');
      doc.fillColor('black');
      doc.text(`${i + 1}`, colX[0], y + 4, { width: 20, align: 'center' });
      doc.text(item.codigo_bien || '', colX[1], y + 4, { width: 50 });
      doc.text('', colX[2], y + 4);
      doc.text(item.descripcion || '', colX[4], y + 4, { width: 195 });
      doc.text(item.unidad_medida || '', colX[5], y + 4, { width: 55, align: 'center' });
      doc.text(`1-`, colX[6], y + 4, { width: 50, align: 'center' });
      doc.text(`${item.cantidad_programada}.0000`, colX[7], y + 4, { width: 55, align: 'right' });
      y += 16;
    });

    doc.moveTo(40, y + 10).lineTo(555, y + 10).stroke();

    // SELLO
    doc.fontSize(9).font('Helvetica-Bold').text('RECIBIDO', 400, y + 20);
    doc.font('Helvetica').fontSize(8).text('No es señal de conformidad', 385, y + 32);
    doc.rect(380, y + 15, 140, 40).stroke();

    // PIE
    doc.fontSize(7).text(`LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026`, 40, 780, { align: 'center', width: 515 });

    doc.end();
  });
}

function generarTicketRecepcion(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ENCABEZADO
    doc.fontSize(16).font('Helvetica-Bold').text('Ticket de Recepcion', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // DATOS
    const datos = [
      ['# O/C', `200${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}`],
      ['Proveedor', 'PROV473 AC COMERCIAL DEL PERU S.A.'],
      ['Estado', 'A'],
      ['Moneda', 'SOLES'],
      ['No Guía', guia.numero_guia],
      ['# Recepcion', Math.floor(Math.random() * 9999).toString()],
      ['Fecha Recepcion', new Date().toLocaleDateString('es-PE')],
      ['Tienda #', 'B07'],
    ];

    doc.fontSize(9).font('Helvetica');
    datos.forEach(([label, value]) => {
      doc.font('Helvetica-Bold').text(`${label}:`, 40, doc.y, { continued: true, width: 150 });
      doc.font('Helvetica').text(` ${value}`);
    });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    // TABLA PRODUCTOS
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Estilo', 40, doc.y, { width: 150, continued: true });
    doc.text('Descripcion Producto', 190, doc.y, { width: 250, continued: true });
    doc.text('Qty', 440, doc.y, { width: 60, align: 'right' });

    doc.moveTo(40, doc.y + 2).lineTo(555, doc.y + 2).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(8);
    items.forEach(item => {
      const y = doc.y;
      doc.text(item.codigo_bien || '', 40, y, { width: 145, continued: true });
      doc.text(item.descripcion || '', 190, y, { width: 245, continued: true });
      doc.text(`${item.cantidad_programada}.00`, 440, y, { width: 60, align: 'right' });
    });

    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').fontSize(9);
    doc.text(`Totales:`, 40, doc.y, { continued: true, width: 390 });
    doc.text(`${items.length}`, 440, doc.y, { width: 60, align: 'right' });

    doc.moveDown(1);
    doc.rect(350, doc.y, 160, 50).stroke();
    doc.fontSize(10).font('Helvetica-Bold').text('RECIBIDO', 360, doc.y + 10);
    doc.fontSize(8).font('Helvetica').text('No es señal de conformidad', 355, doc.y + 25);

    doc.fontSize(7).text(`LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026`, 40, 780, { align: 'center', width: 515 });

    doc.end();
  });
}

function generarFactura(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ENCABEZADO
    doc.fontSize(9).font('Helvetica').text('AC COMERCIAL DEL PERU S.A.C.', 40, 40);
    doc.text('JR. CAJAMARCA NRO. 971 LIMA - LIMA - RIMAC - RIMAC - LIMA');
    doc.text('PUNTO DE EMISION: CAR. PERALVILLO 3220 (PAN.NORTE) LIMA HUAURA HUACHO');

    doc.fontSize(10).font('Helvetica-Bold').text('R.U.C. 20603138831', 380, 40);
    doc.fontSize(12).text('FACTURA ELECTRONICA', 380, 54);
    doc.fontSize(11).text(`F107    N° ${Math.floor(Math.random() * 99999).toString().padStart(8, '0')}`, 380, 70);

    doc.moveTo(40, 100).lineTo(555, 100).stroke();

    // CLIENTE
    doc.fontSize(8).font('Helvetica-Bold').text('CLIENTE:', 40, 108);
    doc.font('Helvetica').text(`${guia.cliente_nombre}`, 90, 108);
    doc.text(`Dirección: ${guia.punto_llegada}`, 40, 120);
    doc.text(`Doc. Identidad: RUC${guia.cliente_ruc}`, 380, 108);
    doc.text(`Fecha Emisión: ${guia.fecha_traslado}`, 380, 120);
    doc.text(`Forma de Pago: CREDITO`, 380, 132);

    doc.moveTo(40, 145).lineTo(555, 145).stroke();

    // TABLA PRODUCTOS
    doc.rect(40, 148, 515, 16).fill('#e5e7eb');
    doc.fillColor('black').fontSize(7).font('Helvetica-Bold');
    doc.text('DESCRIPCION DEL ARTICULO', 42, 153, { width: 200 });
    doc.text('CAJAS-UNI', 245, 153, { width: 60, align: 'center' });
    doc.text('PRECIO', 308, 153, { width: 50, align: 'right' });
    doc.text('DSCTO%', 360, 153, { width: 45, align: 'right' });
    doc.text('DESCUENTO', 408, 153, { width: 55, align: 'right' });
    doc.text('PRECIO TOTAL', 465, 153, { width: 85, align: 'right' });

    doc.font('Helvetica').fontSize(7);
    let y = 164;
    let total = 0;
    items.forEach((item, i) => {
      const precio = (Math.random() * 20 + 8).toFixed(2);
      const precioTotal = (parseFloat(precio) * item.cantidad_programada).toFixed(2);
      total += parseFloat(precioTotal);
      if (i % 2 === 0) doc.rect(40, y, 515, 14).fill('#f9fafb');
      doc.fillColor('black');
      doc.text(item.descripcion || '', 42, y + 3, { width: 200 });
      doc.text(`${item.cantidad_programada}-`, 245, y + 3, { width: 60, align: 'center' });
      doc.text(precio, 308, y + 3, { width: 50, align: 'right' });
      doc.text('.00', 360, y + 3, { width: 45, align: 'right' });
      doc.text('.00', 408, y + 3, { width: 55, align: 'right' });
      doc.text(precioTotal, 465, y + 3, { width: 85, align: 'right' });
      y += 14;
    });

    doc.moveTo(40, y + 5).lineTo(555, y + 5).stroke();

    // TOTALES
    const igv = (total * 0.18).toFixed(2);
    const totalConIgv = (total + parseFloat(igv)).toFixed(2);

    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('OP. GRAVADAS', 380, y + 15, { width: 90 });
    doc.text(`S/ ${total.toFixed(2)}`, 470, y + 15, { width: 80, align: 'right' });
    doc.text('I.G.V.', 380, y + 27, { width: 90 });
    doc.text(`S/ ${igv}`, 470, y + 27, { width: 80, align: 'right' });
    doc.text('IMPORTE TOTAL', 380, y + 39, { width: 90 });
    doc.text(`S/ ${totalConIgv}`, 470, y + 39, { width: 80, align: 'right' });

    // SELLO
    doc.rect(310, y + 10, 55, 40).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text('RECIBIDO', 315, y + 20);
    doc.font('Helvetica').fontSize(7).text('No es señal de conformidad', 312, y + 32);

    // PIE
    doc.fontSize(7).font('Helvetica').text(`SOLO EFECTIVO. GUIA:${guia.numero_guia}`, 40, y + 65);
    doc.text(`MONTO REFERENCIAL: S/ ${totalConIgv}`, 40, y + 75);
    doc.moveDown(0.5);
    doc.text('DISTRIBUIDOR AUTORIZADO DE ARCA CONTINENTAL LINDLEY S.A.', { align: 'center' });
    doc.text(`LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026`, 40, 780, { align: 'center', width: 515 });

    doc.end();
  });
}

module.exports = { generarGuiaRemision, generarTicketRecepcion, generarFactura };