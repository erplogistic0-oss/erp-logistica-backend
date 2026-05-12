const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { enviarCorreoSupervisor, enviarCorreoAuxiliar } = require('../mailer');

// Listar todas las guías
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('guias_remision')
    .select('*, operadores(nombre), vehiculos(placa)')
    .order('creado_en', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Obtener una guía con sus items
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('guias_remision')
    .select('*, operadores(nombre), vehiculos(placa), guia_items(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Crear guía con items + enviar correo al supervisor
router.post('/', async (req, res) => {
  const { items, ...guia } = req.body;

  if (!guia.operador_id) guia.operador_id = null;
  if (!guia.vehiculo_id) guia.vehiculo_id = null;

  const { data, error } = await supabase
    .from('guias_remision')
    .insert(guia)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  if (items && items.length > 0) {
    const itemsConGuia = items.map((i) => ({ ...i, guia_id: data.id }));
    await supabase.from('guia_items').insert(itemsConGuia);
  }

  // Enviar correo al supervisor
  try {
    await enviarCorreoSupervisor({ ...data, items: items || [] });
  } catch (mailError) {
    console.error('Error enviando correo supervisor:', mailError.message);
  }

  res.json(data);
});

// Cambiar estado de la guía
router.put('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  const { data, error } = await supabase
    .from('guias_remision')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Confirmar recepción de items + enviar correo al auxiliar
router.put('/:id/recepcion', async (req, res) => {
  const { items } = req.body;

  for (const item of items) {
    await supabase
      .from('guia_items')
      .update({ cantidad_recibida: item.cantidad_recibida })
      .eq('id', item.id);
  }

  const { data, error } = await supabase
    .from('guias_remision')
    .update({ estado: 'recepcionado' })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  // Detectar discrepancias y crear alerta
  const discrepancias = items.filter(
    (i) => Number(i.cantidad_recibida) !== Number(i.cantidad_programada)
  );

  if (discrepancias.length > 0) {
    await supabase.from('alertas').insert({
      tipo: 'discrepancia_guia',
      mensaje: `Discrepancia en guía ${data.numero_guia}: ${discrepancias.length} producto(s) con cantidad diferente`,
      guia_id: req.params.id,
      resuelta: false,
    });
  }

  // Enviar correo al auxiliar
  try {
    await enviarCorreoAuxiliar(data);
  } catch (mailError) {
    console.error('Error enviando correo auxiliar:', mailError.message);
  }

  res.json(data);
});
// Cambiar estado con PATCH (usado por app Flutter del chofer)
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;

  // Si intenta pasar a en_ruta, verificar que no haya alertas sin resolver
  if (estado === 'en_ruta') {
    const { data: alertas } = await supabase
      .from('alertas')
      .select('id')
      .eq('guia_id', req.params.id)
      .eq('tipo', 'problema_carga')
      .eq('resuelta', false);

    if (alertas && alertas.length > 0) {
      return res.status(400).json({
        error: 'El supervisor debe resolver el problema antes de dar salida'
      });
    }
  }

  const { data, error } = await supabase
    .from('guias_remision')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
// Asignar chofer y vehículo
router.put('/:id/asignar', async (req, res) => {
  const { operador_id, vehiculo_id } = req.body;
  const { data, error } = await supabase
    .from('guias_remision')
    .update({ operador_id, vehiculo_id })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Reportar problema con la carga
router.post('/:id/problema', async (req, res) => {
  const { descripcion } = req.body;
  const { data: guia } = await supabase
    .from('guias_remision')
    .select('numero_guia, cliente_nombre, punto_llegada')
    .eq('id', req.params.id)
    .single();

  const { error } = await supabase.from('alertas').insert({
    tipo: 'problema_carga',
    mensaje: `Problema en carga guía ${guia?.numero_guia}: ${descripcion}`,
    guia_id: req.params.id,
    resuelta: false,
  });

  if (error) return res.status(500).json({ error: error.message });

  // Enviar correo al supervisor
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'LogiControl <noreply@logicontrol-erp.lat>',
      to: process.env.MAIL_USER,
      subject: `⚠️ Problema en carga — Guía ${guia?.numero_guia}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <div style="background:#DC2626;padding:20px;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">⚠️ Alerta de Problema en Carga</h1>
            <p style="color:#fca5a5;margin:4px 0 0">IMPEMAR GROUP — LogiControl</p>
          </div>
          <div style="padding:24px;background:#f9fafb">
            <h2 style="color:#111;margin-top:0">Guía N° ${guia?.numero_guia}</h2>
            <table style="width:100%;border-collapse:collapse;background:white">
              <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Cliente</td><td style="padding:10px;font-weight:bold;border-bottom:1px solid #f3f4f6">${guia?.cliente_nombre}</td></tr>
              <tr><td style="padding:10px;color:#666;border-bottom:1px solid #f3f4f6">Destino</td><td style="padding:10px;border-bottom:1px solid #f3f4f6">${guia?.punto_llegada}</td></tr>
              <tr><td style="padding:10px;color:#666">Problema reportado</td><td style="padding:10px;color:#DC2626;font-weight:bold">${descripcion}</td></tr>
            </table>
            <p style="color:#666;margin-top:16px;font-size:13px">El chofer ha reportado un problema con la carga. Por favor revise y tome acción.</p>
          </div>
          <div style="background:#DC2626;padding:12px;text-align:center">
            <p style="color:white;margin:0;font-size:12px">LogiControl v1.0 — SENATI 2026</p>
          </div>
        </div>
      `,
    });
  } catch (mailError) {
    console.error('Error enviando correo problema:', mailError.message);
  }

  res.json({ mensaje: 'Problema reportado al supervisor' });
});

// Ruta pública para confirmación del cliente
router.get('/:id/confirmacion', async (req, res) => {
  const { data, error } = await supabase
    .from('guias_remision')
    .select('*, guia_items(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (data.estado !== 'llego') {
    return res.status(400).json({ error: 'Esta guía no está disponible para confirmación' });
  }
  res.json(data);
});

// Confirmar recepción por el cliente
router.post('/:id/confirmar-cliente', async (req, res) => {
  const { ruc } = req.body;

  const { data: guia, error } = await supabase
    .from('guias_remision')
    .select('*, guia_items(*)')
    .eq('id', req.params.id)
    .single();

  if (error || !guia) return res.status(500).json({ error: 'Guía no encontrada' });
  if (guia.cliente_ruc !== ruc) return res.status(401).json({ error: 'RUC incorrecto' });
  if (guia.estado !== 'llego') return res.status(400).json({ error: 'Esta guía no está disponible para confirmación' });

  // Cambiar estado a recepcionado
  const { data: guiaActualizada } = await supabase
    .from('guias_remision')
    .update({ estado: 'recepcionado' })
    .eq('id', req.params.id)
    .select()
    .single();

  // Obtener items para el correo
  const { data: items } = await supabase
    .from('guia_items')
    .select('*')
    .eq('guia_id', req.params.id);

  // Enviar correo al auxiliar
  try {
    await enviarCorreoAuxiliar({ ...guiaActualizada, items: items || [] });
  } catch (mailError) {
    console.error('Error enviando correo auxiliar:', mailError.message);
  }

  res.json({ mensaje: 'Recepción confirmada exitosamente' });
});

module.exports = router;