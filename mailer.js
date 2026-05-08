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
    from: 'LogiControl <onboarding@resend.dev>',
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
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;background:white;border-radius:8px;overflow:hidden">
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Cliente</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid #f3f4f6">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">RUC</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Origen</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.punto_partida}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Destino</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.punto_llegada}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Fecha Traslado</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.fecha_traslado}</td></tr>
            <tr><td style="padding:10px 12px;color:#666">N° Carga</td><td style="padding:10px 12px">${guia.numero_carga}</td></tr>
          </table>
          <h3 style="color:#111">Productos a transportar</h3>
          <table style="width:100%;border-collapse:collapse;background:white">
            <thead>
              <tr style="background:#DC2626;color:white">
                <th style="padding:10px;border:1px solid #b91c1c">N°</th>
                <th style="padding:10px;border:1px solid #b91c1c">Código</th>
                <th style="padding:10px;border:1px solid #b91c1c">Descripción</th>
                <th style="padding:10px;border:1px solid #b91c1c">Unidad</th>
                <th style="padding:10px;border:1px solid #b91c1c">Cantidad</th>
              </tr>
            </thead>
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
  await resend.emails.send({
    from: 'LogiControl <onboarding@resend.dev>',
    to: process.env.MAIL_AUXILIAR,
    subject: `✅ Proceso Completado — Guía ${guia.numero_guia}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#16a34a;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">✅ Proceso Completado</h1>
          <p style="color:#bbf7d0;margin:6px 0 0">IMPEMAR GROUP — Canal Moderno</p>
        </div>
        <div style="padding:24px;background:#f9fafb">
          <h2 style="color:#111;margin-top:0">Guía N° ${guia.numero_guia}</h2>
          <p style="color:#374151">El despacho ha sido <strong>recepcionado exitosamente</strong> por el cliente.</p>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden">
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Cliente</td><td style="padding:10px 12px;font-weight:bold;border-bottom:1px solid #f3f4f6">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">RUC</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding:10px 12px;color:#666;border-bottom:1px solid #f3f4f6">Destino</td><td style="padding:10px 12px;border-bottom:1px solid #f3f4f6">${guia.punto_llegada}</td></tr>
            <tr><td style="padding:10px 12px;color:#666">Estado</td><td style="padding:10px 12px;color:#16a34a;font-weight:bold">✅ RECEPCIONADO</td></tr>
          </table>
        </div>
        <div style="background:#16a34a;padding:16px;text-align:center">
          <p style="color:white;margin:0;font-size:12px">LogiControl v1.0 — SENATI 2026</p>
        </div>
      </div>
    `,
  });
}

module.exports = { enviarCorreoSupervisor, enviarCorreoAuxiliar };