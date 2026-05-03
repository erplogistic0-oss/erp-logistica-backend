const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar todos los despachos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('despachos')
    .select(`
      *,
      operadores (nombre, telefono),
      vehiculos (placa, tipo)
    `)
    .order('fecha_despacho', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET - Ver un despacho con sus productos
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('despachos')
    .select(`
      *,
      operadores (nombre, telefono),
      vehiculos (placa, tipo),
      despacho_productos (
        *,
        productos (codigo, nombre, unidad)
      )
    `)
    .eq('id', id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - Crear nuevo despacho (orden de carga)
router.post('/', async (req, res) => {
  const { operador_id, vehiculo_id, fecha_despacho, numero_orden, observaciones } = req.body;
  const { data, error } = await supabase
    .from('despachos')
    .insert([{ operador_id, vehiculo_id, fecha_despacho, numero_orden, observaciones }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT - Actualizar estado del despacho
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const { data, error } = await supabase
    .from('despachos')
    .update({ estado, confirmado_en: estado === 'completado' ? new Date() : null })
    .eq('id', id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;
