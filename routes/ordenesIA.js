const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { enviarCorreoSupervisor } = require('../mailer');

// Clientes del canal moderno que simulamos
const CLIENTES = [
  { nombre: 'TIENDAS TAMBO S.A.C.', ruc: '20563529378', destino: 'AV. JAVIER PRADO ESTE 6210 LA MOLINA LIMA' },
  { nombre: 'PLAZA VEA S.A.C.', ruc: '20508565934', destino: 'AV. ANGAMOS ESTE 2805 SURQUILLO LIMA' },
  { nombre: 'TOTTUS S.A.', ruc: '20511599567', destino: 'AV. UNIVERSITARIA 6284 LOS OLIVOS LIMA' },
  { nombre: 'MASS S.A.C.', ruc: '20601233488', destino: 'AV. COLONIAL 879 LIMA CERCADO' },
  { nombre: 'METRO S.A.', ruc: '20109072177', destino: 'AV. BENAVIDES 3866 MIRAFLORES LIMA' },
];

// Productos reales de Arca Continental
const PRODUCTOS = [
  { codigo: '0895', descripcion: 'TP CC RF + IK 2.0 PFM 3LTX2', unidad: 'BX' },
  { codigo: '6179', descripcion: 'CC PET 1LX8 RF', unidad: 'BX' },
  { codigo: '2559', descripcion: 'SAN LUIS SG PFM 1LX8 TP', unidad: 'BX' },
  { codigo: '0989', descripcion: 'SAN LUIS SG PET 750MLX15 S/P', unidad: 'BX' },
  { codigo: '0863', descripcion: 'SL EXPRIM LIMON PET 625MLX15', unidad: 'BX' },
  { codigo: '5826', descripcion: 'SL EXP ARANDANO PET 625MLX15', unidad: 'BX' },
  { codigo: '0848', descripcion: 'SL EXPRIM MARACU C/G 625MLX15', unidad: 'BX' },
  { codigo: '0270', descripcion: 'INCA KOLA SA PET 600ML X12', unidad: 'BX' },
  { codigo: '2019', descripcion: 'COCA COLA SA PET 600ML X12', unidad: 'BX' },
  { codigo: '0691', descripcion: 'FANTA NARANJA PET 500MLX12 RF', unidad: 'BX' },
  { codigo: '0964', descripcion: 'FDV FR TROPIC PUN PET 500MLX12', unidad: 'BX' },
  { codigo: '0301', descripcion: 'COCA COLA PT 300MLX6-CRCG', unidad: 'BX' },
  { codigo: '2037', descripcion: 'INCA KOLA PT 300MLX6-CRCG', unidad: 'BX' },
  { codigo: '5205', descripcion: 'FRUGOS BEBIDA DZ PET 300MLX06', unidad: 'BX' },
  { codigo: '5164', descripcion: 'FRG BEB MZ TBA 235ML 4X6 PACKS', unidad: 'BX' },
  { codigo: '0020', descripcion: 'PW MORA 600 PET*6 RF HF', unidad: 'BX' },
];

// Función para número aleatorio entre min y max
function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para generar número de guía
function generarNumeroGuia() {
  const num = String(aleatorio(10000, 99999));
  return `T931-000${num}`;
}

// Función para generar número de carga
function generarNumeroCarga() {
  const letras = ['A', 'B', 'C', 'D'];
  return `610${aleatorio(1, 4)}${letras[aleatorio(0, 3)]}`;
}

// POST - Generar orden automática con IA
router.post('/generar', async (req, res) => {
  try {
    // Seleccionar cliente aleatorio
    const cliente = CLIENTES[aleatorio(0, CLIENTES.length - 1)];

    // Seleccionar entre 5 y 10 productos aleatorios
    const cantidadProductos = aleatorio(5, 10);
    const productosSeleccionados = [...PRODUCTOS]
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidadProductos)
      .map(p => ({
        ...p,
        cantidad_programada: aleatorio(1, 3)
      }));

    // Obtener operadores y vehículos disponibles
    const { data: operadores } = await supabase
      .from('operadores')
      .select('id')
      .eq('activo', true)
      .eq('rol', 'chofer');

    const { data: vehiculos } = await supabase
      .from('vehiculos')
      .select('id')
      .eq('disponible', true);

    const operador = operadores && operadores.length > 0
      ? operadores[aleatorio(0, operadores.length - 1)]
      : null;

    const vehiculo = vehiculos && vehiculos.length > 0
      ? vehiculos[aleatorio(0, vehiculos.length - 1)]
      : null;

    const hoy = new Date().toISOString().split('T')[0];

    // Crear la guía en la base de datos
    const guiaData = {
      numero_guia: generarNumeroGuia(),
      numero_carga: generarNumeroCarga(),
      fecha_emision: hoy,
      fecha_traslado: hoy,
      punto_partida: 'CAR. PERALVILLO 3220 PAN.NORTE LIMA HUAURA HUACHO',
      punto_llegada: cliente.destino,
      cliente_nombre: cliente.nombre,
      cliente_ruc: cliente.ruc,
      motivo_traslado: 'VENTA',
      operador_id: operador?.id || null,
      vehiculo_id: vehiculo?.id || null,
      estado: 'pendiente',
    };

    const { data: guia, error } = await supabase
      .from('guias_remision')
      .insert(guiaData)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Insertar los items
    const itemsConGuia = productosSeleccionados.map(p => ({
      guia_id: guia.id,
      codigo_bien: p.codigo,
      descripcion: p.descripcion,
      unidad_medida: p.unidad,
      cantidad_programada: p.cantidad_programada,
    }));

    await supabase.from('guia_items').insert(itemsConGuia);

    // Enviar correo al supervisor
    try {
      await enviarCorreoSupervisor({
        ...guia, items: productosSeleccionados.map(p => ({
          codigo_bien: p.codigo,
          descripcion: p.descripcion,
          unidad_medida: p.unidad,
          cantidad_programada: p.cantidad_programada,
        }))
      });
      console.log('Correo enviado exitosamente');
    } catch (mailError) {
      console.error('Error enviando correo DETALLE:', JSON.stringify(mailError, Object.getOwnPropertyNames(mailError)));
    }

    res.json({
      mensaje: 'Orden generada automáticamente',
      guia: { ...guia, items: productosSeleccionados },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;