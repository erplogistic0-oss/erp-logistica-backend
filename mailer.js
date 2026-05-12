async function enviarCorreoAuxiliar(guia) {
  const { generarGuiaRemision, generarTicketRecepcion, generarFactura } = require('./pdfGenerator');

  const items = guia.items || [];

  // Generar los 3 PDFs
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
          <p style="color:#374151">El cliente <strong>${guia.cliente_nombre}</strong> ha confirmado la recepción de los productos.</p>
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
} async function enviarCorreoAuxiliar(guia) {
  const { generarGuiaRemision, generarTicketRecepcion, generarFactura } = require('./pdfGenerator');

  const items = guia.items || [];

  // Generar los 3 PDFs
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
          <p style="color:#374151">El cliente <strong>${guia.cliente_nombre}</strong> ha confirmado la recepción de los productos.</p>
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