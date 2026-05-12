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
  const productosHTML = (guia.items || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : 'white'}">
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${i + 1}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${item.codigo_bien}</td>
      <td style="padding:8px;border:1px solid #e5e7eb">${item.descripcion}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${item.unidad_medida}</td>
      <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${item.cantidad_programada}</td>
    </tr>
  `).join('');

  await resend.emails.send({
    from: 'LogiControl <noreply@logicontrol-erp.lat>',
    to: process.env.MAIL_AUXILIAR,
    subject: `✅ Recepción Confirmada — Guía ${guia.numero_guia}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:750px;margin:auto;border:1px solid #d1d5db">

        <!-- ENCABEZADO -->
        <div style="background:#16a34a;padding:20px;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">✅ Recepción Confirmada</h1>
          <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px">IMPEMAR GROUP — Canal Moderno</p>
        </div>

        <!-- GUÍA DE REMISIÓN -->
        <div style="padding:20px;background:white;border-bottom:2px solid #e5e7eb">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div>
              <h2 style="margin:0;font-size:16px;color:#111">GUÍA DE REMISIÓN ELECTRÓNICA</h2>
              <h3 style="margin:4px 0 0;font-size:18px;color:#16a34a;font-family:monospace">${guia.numero_guia}</h3>
            </div>
            <div style="text-align:right;font-size:12px;color:#666">
              <p style="margin:0">N° Carga: <strong>${guia.numero_carga}</strong></p>
              <p style="margin:4px 0 0">Fecha: <strong>${guia.fecha_traslado}</strong></p>
              <p style="margin:4px 0 0">Estado: <strong style="color:#16a34a">RECEPCIONADO</strong></p>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px">
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold;width:140px">Emisor</td>
              <td style="padding:8px">AC COMERCIAL DEL PERU S.A.C. — RUC: 20603138831</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Punto de Partida</td>
              <td style="padding:8px">${guia.punto_partida}</td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold">Punto de Llegada</td>
              <td style="padding:8px">${guia.punto_llegada}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Cliente</td>
              <td style="padding:8px"><strong>${guia.cliente_nombre}</strong></td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold">RUC Cliente</td>
              <td style="padding:8px">${guia.cliente_ruc}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Motivo</td>
              <td style="padding:8px">${guia.motivo_traslado}</td>
            </tr>
          </table>

          <!-- BIENES A TRANSPORTAR -->
          <h3 style="font-size:13px;margin:0 0 8px;text-transform:uppercase;color:#374151">Bienes Transportados</h3>
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#16a34a;color:white">
                <th style="padding:8px;text-align:center">N°</th>
                <th style="padding:8px">Código</th>
                <th style="padding:8px">Descripción</th>
                <th style="padding:8px;text-align:center">Unidad</th>
                <th style="padding:8px;text-align:center">Cantidad</th>
              </tr>
            </thead>
            <tbody>${productosHTML}</tbody>
          </table>
        </div>

        <!-- TICKET DE RECEPCIÓN -->
        <div style="padding:20px;background:#f9fafb;border-bottom:2px solid #e5e7eb">
          <h2 style="font-size:15px;margin:0 0 12px;color:#111;text-align:center">TICKET DE RECEPCIÓN</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr>
              <td style="padding:8px;font-weight:bold;width:160px">N° Guía</td>
              <td style="padding:8px;font-family:monospace">${guia.numero_guia}</td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold">Proveedor</td>
              <td style="padding:8px">IMPEMAR GROUP</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Cliente</td>
              <td style="padding:8px">${guia.cliente_nombre}</td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold">Fecha Recepción</td>
              <td style="padding:8px">${new Date().toLocaleDateString('es-PE')}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold">Estado</td>
              <td style="padding:8px;color:#16a34a;font-weight:bold">✅ RECIBIDO — EN SEÑAL DE CONFORMIDAD</td>
            </tr>
            <tr style="background:#f3f4f6">
              <td style="padding:8px;font-weight:bold">Total Productos</td>
              <td style="padding:8px;font-weight:bold">${(guia.items || []).length} líneas</td>
            </tr>
          </table>
        </div>

        <!-- PIE -->
        <div style="background:#16a34a;padding:16px;text-align:center">
          <p style="color:white;margin:0;font-size:12px">LogiControl v1.0 — IMPEMAR GROUP — SENATI 2026</p>
          <p style="color:#bbf7d0;margin:4px 0 0;font-size:11px">Este correo fue generado automáticamente al confirmar la recepción</p>
        </div>
      </div>
    `,
  });
}

module.exports = { enviarCorreoSupervisor, enviarCorreoAuxiliar };