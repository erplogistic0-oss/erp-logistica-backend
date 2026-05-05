const puppeteer = require('puppeteer');

async function generarPDFGuia(guia) {
  const productosHTML = (guia.guia_items || guia.items || []).map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.codigo_bien || ''}</td>
      <td>${item.descripcion || ''}</td>
      <td>${item.unidad_medida || 'BX'}</td>
      <td>BX</td>
      <td>${item.cantidad_programada || 0}.0000</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #000; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
        .logo-section { width: 40%; }
        .logo-title { font-size: 13px; font-weight: bold; }
        .doc-section { width: 55%; border: 2px solid #000; padding: 10px; text-align: center; }
        .doc-title { font-size: 14px; font-weight: bold; }
        .doc-subtitle { font-size: 12px; font-weight: bold; }
        .doc-number { font-size: 16px; font-weight: bold; color: #000; }
        .section { margin: 8px 0; border: 1px solid #000; padding: 8px; }
        .section-title { font-weight: bold; background: #ddd; padding: 3px 6px; margin: -8px -8px 6px -8px; }
        .row { display: flex; margin: 3px 0; }
        .label { color: #555; min-width: 140px; }
        .value { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #333; color: white; padding: 6px; text-align: center; font-size: 10px; }
        td { border: 1px solid #ccc; padding: 5px; text-align: center; font-size: 10px; }
        tr:nth-child(even) { background: #f5f5f5; }
        .footer { margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; font-size: 10px; color: #555; text-align: center; }
        .ruc { font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-section">
          <div class="logo-title">AC COMERCIAL DEL PERU S.A.C.</div>
          <div>JR. CAJAMARCA NRO. 371 LIMA - LIMA - RIMAC LIMA</div>
          <div>PUNTO DE EMISION: CAR. PERALVILLO 3220 (PAN.NORTE) LIMA HUAURA HUACHO</div>
          <div>Fecha y hora de emisión: ${new Date().toLocaleDateString('es-PE')}</div>
        </div>
        <div class="doc-section">
          <div class="ruc">R.U.C. N° 20603138831</div>
          <div class="doc-title">GUÍA DE REMISIÓN</div>
          <div class="doc-subtitle">ELECTRÓNICA REMITENTE</div>
          <div class="doc-number">${guia.numero_guia}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">DATOS DE ENVÍO</div>
        <div class="row"><span class="label">N° Carga:</span><span class="value">${guia.numero_carga || ''}</span></div>
        <div class="row"><span class="label">Fecha de Traslado:</span><span class="value">${guia.fecha_traslado || ''}</span></div>
        <div class="row"><span class="label">Punto de Partida:</span><span class="value">${guia.punto_partida || ''}</span></div>
        <div class="row"><span class="label">Punto de Llegada:</span><span class="value">${guia.punto_llegada || ''}</span></div>
        <div class="row"><span class="label">Motivo de Traslado:</span><span class="value">VENTA</span></div>
      </div>

      <div class="section">
        <div class="section-title">DATOS DEL DESTINATARIO</div>
        <div class="row"><span class="label">Razón Social:</span><span class="value">${guia.cliente_nombre || ''}</span></div>
        <div class="row"><span class="label">RUC:</span><span class="value">${guia.cliente_ruc || ''}</span></div>
      </div>

      <div class="section">
        <div class="section-title">BIENES POR TRANSPORTAR</div>
        <table>
          <thead>
            <tr>
              <th>N°</th>
              <th>CÓDIGO DEL BIEN</th>
              <th>DESCRIPCIÓN</th>
              <th>UNIDAD</th>
              <th>CAJA-UNID</th>
              <th>CANTIDAD</th>
            </tr>
          </thead>
          <tbody>${productosHTML}</tbody>
        </table>
      </div>

      <div class="footer">
        LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ 
    format: 'A4', 
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' } 
  });
  await browser.close();
  return pdf;
}

module.exports = { generarPDFGuia };