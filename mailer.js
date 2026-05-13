const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarCorreoSupervisor(guia) {
  const productosHTML = guia.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : 'white'}">
      <td style="padding:8px;border:1px solid #e5e7eb">${i + 1}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${item.codigo_bien}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${item.descripcion}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${item.unidad_medida}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${item.cantidad_programada}</td>
    </tr>
  `).join('');

  await resend.emails.send({
    from: 'LogiControl <noreply@logicontrol-erp.lat>',
    to: process.env.MAIL_USER,
    subject: `📦 Nueva Orden de Carga — ${guia.numero_guia}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#DC2626;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">🚛 LogiControl</h1>
          <p style="color:#fca5a5;margin:6px 0 0">IMPEMAR GROUP — Nueva Orden de Carga</p>
        </div>
        <div style="padding:24px;background:#f9fafb">
          <h2 style="color:#111;margin-top:0">Guía N° ${guia.numero_guia}</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:white">
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Cliente</td><td style="padding:10px;font-weight:bold;border-bottom:1px solid #f3f4f6">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">RUC</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Origen</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.punto_partida}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Destino</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.punto_llegada}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Fecha</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.fecha_traslado}</td></tr>
            <tr><td style="padding:10px;color:#666">N° Carga</td><td style="padding:10px">${guia.numero_carga}</td></tr>
          </table>
          <h3>Productos</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr style="background:#DC2626;color:white">
              <th style="padding:8px">N°</th>
              <th style="padding:8px">Código</th>
              <th style="padding:8px">Descripción</th>
              <th style="padding:8px">Unidad</th>
              <th style="padding:8px">Cantidad</th>
            </tr></thead>
            <tbody>${productosHTML}</tbody>
          </table>
        </div>
        <div style="background:#DC2626;padding:16px;text-align:center">
          <p style="color:white;margin:0;font-size:12px">LogiControl v1.0 — SENATI 2026</p>
        </div>
      </div>
    `,
  });
}

async function enviarCorreoAuxiliar(guia) {
  const { generarGuiaRemision, generarTicketRecepcion, generarFactura } = require('./pdfGenerator');

  const items = guia.items || [];

  const [pdfGuia, pdfTicket, pdfFactura] = await Promise.all([
    generarGuiaRemision(guia, items),
    generarTicketRecepcion(guia, items),
    generarFactura(guia, items),
  ]);

  await resend.emails.send({
    from: 'LogiControl <noreply@logicontrol-erp.lat>',
    to: process.env.MAIL_AUXILIAR,
    subject: `✅ Recepción Confirmada — Guía ${guia.numero_guia}`,
    attachments: [
      {
        filename: `Guia-Remision-${guia.numero_guia}.pdf`,
        content: pdfGuia.toString('base64'),
      },
      {
        filename: `Ticket-Recepcion-${guia.numero_guia}.pdf`,
        content: pdfTicket.toString('base64'),
      },
      {
        filename: `Factura-${guia.numero_guia}.pdf`,
        content: pdfFactura.toString('base64'),
      },
    ],
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#16a34a;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">✅ Recepción Confirmada</h1>
          <p style="color:#bbf7d0;margin:4px 0 0">IMPEMAR GROUP — Canal Moderno</p>
        </div>
        <div style="padding:24px;background:#f9fafb">
          <h2 style="color:#111;margin-top:0">Guía N° ${guia.numero_guia}</h2>
          <p style="color:#374151">El cliente <strong>${guia.cliente_nombre}</strong> ha confirmado la recepción.</p>
          <table style="width:100%;border-collapse:collapse;background:white;margin-top:16px">
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Cliente</td><td style="padding:10px;font-weight:bold;border-bottom:1px solid #f3f4f6">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">RUC</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Destino</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.punto_llegada}</td></tr>
            <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Fecha</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia.fecha_traslado}</td></tr>
            <tr><td style="padding:10px;color:#666">Estado</td><td style="padding:10px;color:#16a34a;font-weight:bold">✅ RECEPCIONADO</td></tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">
            <p style="margin:0;color:#15803d;font-size:13px">📎 Se adjuntan 3 documentos:</p>
            <ul style="margin:8px 0 0;padding-left:20px;color:#15803d;font-size:13px">
              <li>Guía de Remisión Electrónica</li>
              <li>Ticket de Recepción</li>
              <li>Factura Electrónica</li>
            </ul>
          </div>
        </div>
        <div style="background:#16a34a;padding:12px;text-align:center">
          <p style="color:white;margin:0;font-size:12px">LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026</p>
        </div>
      </div>
    `,
  });
}

module.exports = { enviarCorreoSupervisor, enviarCorreoAuxiliar };