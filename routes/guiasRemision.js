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
  const { data, error } = await supabase
    .from('guias_remision')
    .update({ estado })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});


module.exports = router;