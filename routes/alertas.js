const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar alertas no resueltas
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('alertas')
    .select(`*, despachos(numero_orden, vehiculos(placa))`)
    .eq('resuelta', false)
    .order('creado_en', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT - Marcar alerta como resuelta
router.put('/:id/resolver', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('alertas')
    .update({ resuelta: true })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;
