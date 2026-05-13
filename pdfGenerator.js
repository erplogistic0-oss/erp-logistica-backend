const PDFDocument = require('pdfkit');

function generarGuiaRemision(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ENCABEZADO IZQUIERDO
    doc.fontSize(11).font('Helvetica-Bold').text('AC COMERCIAL DEL PERU S.A.C.', 35, 35);
    doc.fontSize(7).font('Helvetica');
    doc.text('JR. CAJAMARCA NRO. 971 LIMA - LIMA - RIMAC RIMAC LIMA', 35, 48);
    doc.text('PUNTO DE EMISION: CAR. PERALVILLO 3220 (PAN.NORTE) LIMA', 35, 57);
    doc.text('HUAURA HUACHO', 35, 66);
    doc.text(`Fecha y hora de emisión: ${guia.fecha_emision || guia.fecha_traslado} 09:33:35`, 35, 75);

    // ENCABEZADO DERECHO
    doc.rect(370, 30, 190, 75).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text('R.U.C. N° 20603138831', 375, 38);
    doc.fontSize(11).text('GUÍA DE REMISIÓN', 375, 52);
    doc.text('ELECTRÓNICA REMITENTE', 375, 65);
    doc.fontSize(13).fillColor('#000').text(guia.numero_guia, 375, 80);
    doc.fillColor('black');

    // Código de barras simulado
    for (let i = 0; i < 80; i++) {
      const x = 375 + i * 2;
      const h = Math.random() > 0.5 ? 15 : 8;
      doc.rect(x, 32, 1, h).fill('black');
    }

    doc.moveTo(35, 112).lineTo(560, 112).stroke();

    // DATOS DE ENVÍO
    doc.fontSize(7).font('Helvetica-Bold').fillColor('black');
    doc.text('DATOS DE ENVÍO', 35, 118);
    doc.font('Helvetica');
    doc.text(`N° carga Basis/Transporte: ${guia.numero_carga}`, 35, 128);
    doc.text(`N° Carga Sipan/Entrega: R8L00${Math.floor(Math.random() * 999999)}`, 300, 128);
    doc.text(`Fecha de Inicio de Traslado: ${guia.fecha_traslado}`, 35, 138);
    doc.text(`Punto de Partida: ${guia.punto_partida}`, 300, 138);
    doc.text(`Fecha de entrega de bienes al transportista: ${guia.fecha_traslado}`, 35, 148);
    doc.text(`Punto de Llegada: ${guia.punto_llegada}`, 300, 148);
    doc.text(`Motivo de Traslado: ${guia.motivo_traslado}`, 35, 158);
    doc.text('Descripción de motivo de traslado "otros": ', 35, 168);

    doc.moveTo(35, 178).lineTo(560, 178).stroke();

    // DATOS DEL DESTINATARIO
    doc.font('Helvetica-Bold').text('DATOS DEL DESTINATARIO', 35, 184);
    doc.font('Helvetica');
    doc.text(`Tipo y Nro. Documento : RUC ${guia.cliente_ruc}`, 35, 194);
    doc.text(`Código de Cliente : 1290128`, 350, 194);
    doc.text(`Razón Social / Nombre Completo : ${guia.cliente_nombre}`, 35, 204);

    doc.moveTo(35, 214).lineTo(560, 214).stroke();

    // TABLA BIENES
    doc.font('Helvetica-Bold').text('BIENES POR TRANSPORTAR', 35, 220);

    // Encabezado tabla
    const tableTop = 232;
    doc.rect(35, tableTop, 525, 16).fill('#d1d5db');
    doc.fillColor('black').fontSize(6.5).font('Helvetica-Bold');
    doc.text('N°', 37, tableTop + 4, { width: 18, align: 'center' });
    doc.text('CÓDIGO\nDE BIEN', 56, tableTop + 2, { width: 40, align: 'center' });
    doc.text('CÓDIGO\nSUNAT', 97, tableTop + 2, { width: 40, align: 'center' });
    doc.text('PESO', 138, tableTop + 4, { width: 30, align: 'center' });
    doc.text('DESCRIPCIÓN DETALLADA', 169, tableTop + 4, { width: 185, align: 'center' });
    doc.text('UNIDAD\nDE MEDIDA', 355, tableTop + 2, { width: 50, align: 'center' });
    doc.text('CAJA-UNID', 406, tableTop + 4, { width: 55, align: 'center' });
    doc.text('CANTIDAD', 462, tableTop + 4, { width: 55, align: 'center' });

    // Líneas verticales encabezado
    [35, 55, 96, 137, 168, 354, 405, 461, 560].forEach(x => {
      doc.moveTo(x, tableTop).lineTo(x, tableTop + 16).stroke();
    });

    // Filas productos
    doc.font('Helvetica').fontSize(6.5);
    let y = tableTop + 16;
    const rowHeight = 14;

    items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(35, y, 525, rowHeight).fill('#f9fafb');
      doc.fillColor('black');
      doc.text(`${i + 1}`, 37, y + 3, { width: 18, align: 'center' });
      doc.text(item.codigo_bien || '', 57, y + 3, { width: 38 });
      doc.text('', 98, y + 3, { width: 38 });
      doc.text('', 139, y + 3, { width: 28 });
      doc.text(item.descripcion || '', 170, y + 3, { width: 183 });
      doc.text(item.unidad_medida || '', 356, y + 3, { width: 48, align: 'center' });
      doc.text(`${item.cantidad_programada}-`, 407, y + 3, { width: 53, align: 'center' });
      doc.text(`${item.cantidad_programada}.0000`, 463, y + 3, { width: 53, align: 'right' });

      [35, 55, 96, 137, 168, 354, 405, 461, 560].forEach(x => {
        doc.moveTo(x, y).lineTo(x, y + rowHeight).stroke('#e5e7eb');
      });
      y += rowHeight;
    });

    doc.rect(35, tableTop, 525, y - tableTop).stroke();

    // SELLO RECIBIDO
    const selloY = y + 30;
    doc.rect(380, selloY, 145, 55).stroke();
    doc.fontSize(8).font('Helvetica-Bold').text(guia.punto_llegada.split(' ').slice(0, 3).join(' ').toUpperCase(), 385, selloY + 5, { width: 135, align: 'center' });
    doc.fontSize(10).text('RECIBIDO', 385, selloY + 25, { width: 135, align: 'center' });
    doc.fontSize(7).font('Helvetica').text('No es señal de conformidad', 385, selloY + 38, { width: 135, align: 'center' });

    // PIE
    doc.fontSize(6).text('LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026', 35, 800, { align: 'center', width: 525 });

    doc.end();
  });
}

function generarTicketRecepcion(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // ENCABEZADO
    doc.fontSize(16).font('Helvetica-Bold').text('Ticket de Recepcion', { align: 'center' });
    doc.moveDown(0.3);
    doc.moveTo(35, doc.y).lineTo(560, doc.y).lineWidth(1.5).stroke();
    doc.moveDown(0.5);

    // DATOS PRINCIPALES
    const ocNum = `200${Math.floor(Math.random() * 9999999).toString().padStart(7, '0')}`;
    const recNum = Math.floor(Math.random() * 9999).toString();

    const datos = [
      ['# O/C', ocNum],
      ['Proveedor', 'PROV473 AC COMERCIAL DEL PERU SA'],
      ['Estado', 'A'],
      ['Moneda', 'SOLES'],
      ['No Guía', guia.numero_guia],
      ['#Recepcion', recNum],
      ['Fecha Recepcion', `${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')}`],
      ['Tienda #', 'B07'],
      ['Asociado', guia.operadores?.nombre || 'OPERADOR IMPEMAR'],
    ];

    doc.fontSize(9);
    datos.forEach(([label, value]) => {
      const yPos = doc.y;
      doc.font('Helvetica-Bold').text(`${label}:`, 35, yPos, { width: 120, continued: false });
      doc.font('Helvetica').text(value, 160, yPos);
    });

    doc.moveDown(0.5);
    doc.moveTo(35, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.3);

    // TABLA PRODUCTOS
    const tableTop = doc.y;
    doc.rect(35, tableTop, 525, 16).fill('#e5e7eb');
    doc.fillColor('black').fontSize(8).font('Helvetica-Bold');
    doc.text('Estilo', 37, tableTop + 4, { width: 80 });
    doc.text('Descripcion Producto 1', 120, tableTop + 4, { width: 300 });
    doc.text('Qty', 460, tableTop + 4, { width: 60, align: 'right' });

    let y = tableTop + 16;
    let totalQty = 0;
    doc.font('Helvetica').fontSize(8);

    items.forEach((item, i) => {
      if (i % 2 === 0) doc.rect(35, y, 525, 14).fill('#f9fafb');
      doc.fillColor('black');
      doc.text(item.codigo_bien || '', 37, y + 2, { width: 78 });
      doc.text(item.descripcion || '', 120, y + 2, { width: 298 });
      doc.text(`${item.cantidad_programada}.00`, 460, y + 2, { width: 60, align: 'right' });
      totalQty += item.cantidad_programada;
      y += 14;
    });

    doc.rect(35, tableTop, 525, y - tableTop).stroke();

    // TOTALES
    y += 10;
    doc.moveTo(35, y).lineTo(560, y).stroke();
    y += 8;
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Totales:', 37, y, { width: 400 });
    doc.text(`${totalQty}`, 460, y, { width: 60, align: 'right' });

    y += 20;
    const igv = (totalQty * 15 * 0.18).toFixed(2);
    const total = (totalQty * 15 * 1.18).toFixed(2);
    doc.font('Helvetica');
    doc.text(`Total Inc. IGV:`, 37, y);
    doc.font('Helvetica-Bold').text(`S/ ${total}`, 460, y, { width: 60, align: 'right' });

    // SELLO
    y += 30;
    doc.rect(350, y, 170, 55).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text(guia.punto_llegada.split(' ').slice(0, 3).join(' ').toUpperCase(), 355, y + 5, { width: 160, align: 'center' });
    doc.fontSize(11).text('RECIBIDO', 355, y + 22, { width: 160, align: 'center' });
    doc.fontSize(7).font('Helvetica').text('No es señal de conformidad', 355, y + 36, { width: 160, align: 'center' });

    doc.fontSize(6).text('LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026', 35, 800, { align: 'center', width: 525 });

    doc.end();
  });
}

function generarFactura(guia, items) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 35, size: 'A4' });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // Código de barras simulado
    for (let i = 0; i < 100; i++) {
      const x = 300 + i * 2;
      const h = Math.random() > 0.5 ? 18 : 9;
      doc.rect(x, 30, 1, h).fill('black');
    }

    // ENCABEZADO IZQUIERDO
    doc.fontSize(7).font('Helvetica').fillColor('black');
    doc.text('AC COMERCIAL DEL PERU S.A.C.', 35, 35);
    doc.text('JR. CAJAMARCA NRO. 971 LIMA - LIMA - RIMAC - RIMAC - LIMA', 35, 45);
    doc.text('PUNTO DE EMISION: CAR. PERALVILLO 3220 (PAN.NORTE) LIMA HUAURA HUACHO', 35, 55);

    // ENCABEZADO DERECHO
    doc.rect(370, 55, 190, 65).stroke();
    doc.fontSize(9).font('Helvetica-Bold').text('R.U.C. 20603138831', 375, 60);
    doc.fontSize(11).text('FACTURA ELECTRONICA', 375, 73);
    doc.fontSize(10).text(`F107    N° ${Math.floor(Math.random() * 99999).toString().padStart(8, '0')}`, 375, 88);
    doc.fontSize(7).font('Helvetica');
    doc.text(`CODIGO: 1290128`, 375, 103);
    doc.text(`Doc. Identidad: RUC${guia.cliente_ruc}`, 375, 113);

    doc.moveTo(35, 125).lineTo(560, 125).stroke();

    // DATOS CLIENTE
    doc.fontSize(7);
    doc.font('Helvetica-Bold').text('CLIENTE:', 35, 130, { continued: true });
    doc.font('Helvetica').text(` ${guia.cliente_nombre}`, { continued: false });
    doc.text(`Dirección: ${guia.punto_llegada}`, 35, 140);
    doc.text(`Fecha Emisión: ${guia.fecha_traslado}`, 350, 130);
    doc.text(`Forma de Pago: CREDITO`, 350, 140);

    // TABLA TRANSPORTISTA
    const transpY = 155;
    doc.rect(35, transpY, 525, 14).fill('#e5e7eb');
    doc.fillColor('black').fontSize(6).font('Helvetica-Bold');
    ['TRANSPORTISTA', 'RUC TRANSP', 'COBRADOR', 'CANAL DEL CLIENTE', 'NUM. BASIS', 'CARGA BASIS', 'NUMERO INTERNO'].forEach((h, i) => {
      doc.text(h, 37 + i * 75, transpY + 3, { width: 73 });
    });

    doc.rect(35, transpY + 14, 525, 14).fill('#f9fafb');
    doc.fillColor('black').font('Helvetica').fontSize(6);
    const transpData = ['JUAN GUALBERTO PEÑA SALE', '20593983985', '04029', '80 CUENTA CLAVES', `RIFO${Math.floor(Math.random() * 9999999)}`, guia.numero_carga, `000${Math.floor(Math.random() * 99999)}`];
    transpData.forEach((d, i) => {
      doc.text(d, 37 + i * 75, transpY + 17, { width: 73 });
    });

    // TABLA PEDIDO
    const pedY = transpY + 32;
    doc.rect(35, pedY, 525, 14).fill('#e5e7eb');
    doc.fillColor('black').fontSize(6).font('Helvetica-Bold');
    ['PEDIDO', 'VENDEDOR', 'ZONA', 'RUTA', 'SEG.', 'UBC.', 'ORDEN DE COMPRA', 'FECHA VENCIMIENTO', 'FECHA DE COMPRA'].forEach((h, i) => {
      doc.text(h, 37 + i * 58, pedY + 3, { width: 56 });
    });

    doc.rect(35, pedY + 14, 525, 14).fill('#f9fafb');
    doc.fillColor('black').font('Helvetica').fontSize(6);
    const pedData = ['31139', '4810', 'RUTA IE IXAA-TE', '01', '18', '005 010', `200${Math.floor(Math.random() * 9999999)}`, guia.fecha_traslado, guia.fecha_traslado];
    pedData.forEach((d, i) => {
      doc.text(d, 37 + i * 58, pedY + 17, { width: 56 });
    });

    doc.moveTo(35, pedY + 32).lineTo(560, pedY + 32).stroke();

    // TABLA PRODUCTOS
    const prodY = pedY + 36;
    doc.rect(35, prodY, 525, 14).fill('#e5e7eb');
    doc.fillColor('black').fontSize(6.5).font('Helvetica-Bold');
    doc.text('DESCRIPCION DEL ARTICULO', 37, prodY + 3, { width: 185 });
    doc.text('CAJAS-UNI', 223, prodY + 3, { width: 55, align: 'center' });
    doc.text('PRECIO', 279, prodY + 3, { width: 45, align: 'right' });
    doc.text('DSCTO%', 325, prodY + 3, { width: 40, align: 'right' });
    doc.text('DSCTO S/.', 366, prodY + 3, { width: 45, align: 'right' });
    doc.text('DESCUENTO', 412, prodY + 3, { width: 50, align: 'right' });
    doc.text('PRECIO TOTAL', 463, prodY + 3, { width: 90, align: 'right' });

    doc.font('Helvetica').fontSize(6.5);
    let y = prodY + 14;
    let subtotal = 0;

    items.forEach((item, i) => {
      const precio = (Math.random() * 15 + 8).toFixed(2);
      const precioTotal = (parseFloat(precio) * item.cantidad_programada).toFixed(2);
      subtotal += parseFloat(precioTotal);
      if (i % 2 === 0) doc.rect(35, y, 525, 13).fill('#f9fafb');
      doc.fillColor('black');
      doc.text(item.descripcion || '', 37, y + 2, { width: 183 });
      doc.text(`${item.cantidad_programada}-`, 223, y + 2, { width: 55, align: 'center' });
      doc.text(precio, 279, y + 2, { width: 45, align: 'right' });
      doc.text('.00', 325, y + 2, { width: 40, align: 'right' });
      doc.text('.00', 366, y + 2, { width: 45, align: 'right' });
      doc.text('.00', 412, y + 2, { width: 50, align: 'right' });
      doc.text(precioTotal, 463, y + 2, { width: 90, align: 'right' });
      y += 13;
    });

    doc.rect(35, prodY, 525, y - prodY).stroke();

    // TOTALES
    y += 10;
    const igv = (subtotal * 0.18).toFixed(2);
    const total = (subtotal + parseFloat(igv)).toFixed(2);

    doc.moveTo(35, y).lineTo(560, y).stroke();
    y += 8;
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text(`I.G.V.`, 35, y); doc.font('Helvetica').text(`${igv}`, 100, y);
    doc.font('Helvetica-Bold').text('OP. GRATUITAS', 320, y); doc.font('Helvetica').text(`S/ 0.00`, 480, y, { width: 70, align: 'right' });
    y += 12;
    doc.font('Helvetica-Bold').text('I.S.C.', 35, y); doc.font('Helvetica').text('0.00', 100, y);
    doc.font('Helvetica-Bold').text('OP. EXONERADAS', 320, y); doc.font('Helvetica').text(`S/ 0.00`, 480, y, { width: 70, align: 'right' });
    y += 12;
    doc.font('Helvetica-Bold').text('OP. GRAVADAS', 320, y); doc.font('Helvetica').text(`S/ ${subtotal.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
    y += 12;
    doc.font('Helvetica-Bold').text('I.G.V.', 320, y); doc.font('Helvetica').text(`S/ ${igv}`, 480, y, { width: 70, align: 'right' });
    y += 12;
    doc.font('Helvetica-Bold').text('IMPORTE TOTAL', 320, y); doc.font('Helvetica').text(`S/ ${total}`, 480, y, { width: 70, align: 'right' });

    // SELLO
    const selloX = 170;
    const selloY2 = y - 40;
    doc.rect(selloX, selloY2, 120, 50).stroke();
    doc.fontSize(8).font('Helvetica-Bold').text(guia.punto_llegada.split(' ').slice(0, 2).join(' ').toUpperCase(), selloX + 5, selloY2 + 5, { width: 110, align: 'center' });
    doc.fontSize(10).text('RECIBIDO', selloX + 5, selloY2 + 22, { width: 110, align: 'center' });
    doc.fontSize(6).font('Helvetica').text('No es señal de conformidad', selloX + 5, selloY2 + 36, { width: 110, align: 'center' });

    // PIE
    y += 20;
    doc.fontSize(7).font('Helvetica');
    doc.text(`SOLO EFECTIVO. GUIA:${guia.numero_guia}`, 35, y);
    doc.text(`MONTO REFERENCIAL: S/ ${total}`, 35, y + 10);
    doc.moveDown(0.5);
    doc.fontSize(6.5);
    doc.text('SERVICIO DE ATENCION AL CLIENTE TELEFONO:0800-1-4000', { align: 'center' });
    doc.text('DISTRIBUIDOR AUTORIZADO DE ARCA CONTINENTAL LINDLEY S.A.', { align: 'center' });
    doc.fontSize(6).text('LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026', 35, 800, { align: 'center', width: 525 });

    doc.end();
  });
}

module.exports = { generarGuiaRemision, generarTicketRecepcion, generarFactura };