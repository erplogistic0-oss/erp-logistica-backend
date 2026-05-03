const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar productos activos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - Crear producto
router.post('/', async (req, res) => {
  const { codigo, nombre, unidad, peso_kg, precio_unitario, stock_actual } = req.body;
  const { data, error } = await supabase
    .from('productos')
    .insert([{ codigo, nombre, unidad, peso_kg, precio_unitario, stock_actual }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;