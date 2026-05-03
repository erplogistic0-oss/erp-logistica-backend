const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET - Listar vehículos disponibles
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('vehiculos')
    .select('*')
    .order('placa');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST - Crear vehículo
router.post('/', async (req, res) => {
  const { placa, tipo, capacidad_kg } = req.body;
  const { data, error } = await supabase
    .from('vehiculos')
    .insert([{ placa, tipo, capacidad_kg }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

module.exports = router;
