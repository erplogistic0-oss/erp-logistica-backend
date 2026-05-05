const nodemailer = require('nodemailer');

console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS existe:', !!process.env.MAIL_PASS);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function enviarCorreoSupervisor(guia) {
  const productosHTML = guia.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.codigo_bien}</td>
      <td>${item.descripcion}</td>
      <td>${item.unidad_medida}</td>
      <td>${item.cantidad_programada}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"LogiControl - IMPEMAR GROUP" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: `📦 Nueva Orden de Carga — ${guia.numero_guia}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚛 LogiControl</h1>
          <p style="color: #fca5a5; margin: 5px 0;">IMPEMAR GROUP — Nueva Orden de Carga</p>
        </div>
        <div style="padding: 24px; background: #f9fafb;">
          <h2 style="color: #111;">Guía N° ${guia.numero_guia}</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px; color: #666;">Cliente:</td><td style="padding: 6px; font-weight: bold;">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding: 6px; color: #666;">RUC:</td><td style="padding: 6px;">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Origen:</td><td style="padding: 6px;">${guia.punto_partida}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Destino:</td><td style="padding: 6px;">${guia.punto_llegada}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Fecha Traslado:</td><td style="padding: 6px;">${guia.fecha_traslado}</td></tr>
            <tr><td style="padding: 6px; color: #666;">N° Carga:</td><td style="padding: 6px;">${guia.numero_carga}</td></tr>
          </table>
          <h3 style="color: #111;">Productos a transportar</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #DC2626; color: white;">
                <th style="padding: 8px;">N°</th>
                <th style="padding: 8px;">Código</th>
                <th style="padding: 8px;">Descripción</th>
                <th style="padding: 8px;">Unidad</th>
                <th style="padding: 8px;">Cantidad</th>
              </tr>
            </thead>
            <tbody>${productosHTML}</tbody>
          </table>
        </div>
        <div style="background: #DC2626; padding: 12px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">LogiControl v1.0 — SENATI 2026</p>
        </div>
      </div>
    `,
  });
}

async function enviarCorreoAuxiliar(guia) {
  await transporter.sendMail({
    from: `"LogiControl - IMPEMAR GROUP" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_AUXILIAR,
    subject: `✅ Proceso Completado — Guía ${guia.numero_guia}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto;">
        <div style="background: #16a34a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Proceso Completado</h1>
          <p style="color: #bbf7d0; margin: 5px 0;">IMPEMAR GROUP — Canal Moderno</p>
        </div>
        <div style="padding: 24px; background: #f9fafb;">
          <h2 style="color: #111;">Guía N° ${guia.numero_guia}</h2>
          <p style="color: #374151;">El siguiente despacho ha sido <strong>recepcionado exitosamente</strong> por el cliente.</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr><td style="padding: 6px; color: #666;">Cliente:</td><td style="padding: 6px; font-weight: bold;">${guia.cliente_nombre}</td></tr>
            <tr><td style="padding: 6px; color: #666;">RUC:</td><td style="padding: 6px;">${guia.cliente_ruc}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Origen:</td><td style="padding: 6px;">${guia.punto_partida}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Destino:</td><td style="padding: 6px;">${guia.punto_llegada}</td></tr>
            <tr><td style="padding: 6px; color: #666;">Estado:</td><td style="padding: 6px; color: #16a34a; font-weight: bold;">✅ RECEPCIONADO</td></tr>
          </table>
          <p style="color: #6b7280; font-size: 13px;">Este correo es generado automáticamente por LogiControl.</p>
        </div>
        <div style="background: #16a34a; padding: 12px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">LogiControl v1.0 — SENATI 2026</p>
        </div>
      </div>
    `,
  });
}

module.exports = { enviarCorreoSupervisor, enviarCorreoAuxiliar };