const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

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

// Crear guía con items
router.post('/', async (req, res) => {
  const { items, ...guia } = req.body;
  const { data, error } = await supabase
    .from('guias_remision')
    .insert(guia)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  if (items && items.length > 0) {
    const itemsConGuia = items.map(i => ({ ...i, guia_id: data.id }));
    await supabase.from('guia_items').insert(itemsConGuia);
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

// Confirmar recepción de items
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
    .update({ estado: 'recibido' })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;