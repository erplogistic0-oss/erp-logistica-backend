const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// POST - Agregar producto a un despacho
router.post('/', async (req, res) => {
  const { despacho_id, producto_id, cantidad_esperada } = req.body;
  const { data, error } = await supabase
    .from('despacho_productos')
    .insert([{ despacho_id, producto_id, cantidad_esperada, cantidad_confirmada: 0 }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// PUT - Confirmar cantidad de un producto (el asistente lo usa)
router.put('/:id/confirmar', async (req, res) => {
  const { id } = req.params;
  const { cantidad_confirmada } = req.body;

  // 1. Actualizar la cantidad confirmada
  const { data, error } = await supabase
    .from('despacho_productos')
    .update({ cantidad_confirmada, confirmado: true })
    .eq('id', id)
    .select(`*, productos(nombre), despachos(id)`)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // 2. Si hay diferencia, crear alerta automática
  if (cantidad_confirmada !== data.cantidad_esperada) {
    const tipo = cantidad_confirmada < data.cantidad_esperada ? 'faltante' : 'excedente';
    const diferencia = Math.abs(data.cantidad_esperada - cantidad_confirmada);
    const mensaje = `${data.productos.nombre}: se esperaban ${data.cantidad_esperada} pero se confirmaron ${cantidad_confirmada} (diferencia: ${diferencia})`;

    await supabase.from('alertas').insert([{
      despacho_id: data.despachos.id,
      tipo,
      mensaje
    }]);
  }

  res.json({ mensaje: 'Confirmado', data });
});

module.exports = router;
