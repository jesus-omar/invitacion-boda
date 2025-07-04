const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // ← Esto es crucial para que funcione fetch con JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Función para mostrar mensaje con redirección
function mostrarMensaje(res, mensaje, redireccion) {
  const plantilla = fs.readFileSync(path.join(__dirname, 'views', 'mensaje.html'), 'utf8');
  const contenido = plantilla
    .replace('{{MENSAJE}}', mensaje)
    .replace('{{REDIRECCION}}', redireccion);
  res.send(contenido);
}

app.use(cookieParser());

function verificarAcceso(req, res, next) {
  const codigo = req.cookies.codigo_invitado;
  if (!codigo) {
    return res.redirect('/');
  }

  const raw = fs.readFileSync(path.join(__dirname, 'data', 'invitados.json'), 'utf8');
  const invitados = JSON.parse(raw);
  const invitado = invitados.find(i => i.codigo === codigo);

  if (!invitado) {
    return res.redirect('/');
  }

  // Se permite el acceso
  next();
}



// Rutas protegidas
app.get('/verificacion', verificarAcceso, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'verificacion.html'));
});

app.get('/invitacion', verificarAcceso, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'invitacion.html'));
});


// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// POST para verificar código
app.post('/verificar', express.json(), (req, res) => {
  const { codigo } = req.body;

  try {
    const raw = fs.readFileSync(path.join(__dirname, 'data', 'invitados.json'), 'utf8');
    const invitados = JSON.parse(raw);
    const invitado = invitados.find(i => i.codigo === codigo);

    if (invitado) {
      res.json({ ok: true, invitado });
    } else {
      res.json({ ok: false });
    }
  } catch (err) {
    console.error('Error leyendo invitados:', err);
    res.status(500).json({ ok: false, error: 'Error interno del servidor.' });
  }
});
// POST para confirmar asistencia
app.post('/confirmar', express.json(), (req, res) => {
  const { codigo } = req.body;
  const ruta = path.join(__dirname, 'data', 'invitados.json');

  try {
    const raw = fs.readFileSync(ruta, 'utf8');
    const invitados = JSON.parse(raw);
    const index = invitados.findIndex(i => i.codigo === codigo);

    if (index === -1) {
      return mostrarMensaje(res, 'Invitado no válido.', '/invitacion');
    }

    invitados[index].confirmado = true;
    fs.writeFileSync(ruta, JSON.stringify(invitados, null, 2));

    mostrarMensaje(res, `Gracias por confirmar, ${invitados[index].nombre}!`, '/invitacion');
  } catch (err) {
    console.error('Error confirmando:', err);
    res.status(500).send('Error interno del servidor.');
  }
});
// Middleware de autenticación para admin
function verificarAdmin(req, res, next) {
  if (req.cookies.admin === 'true') {
    return next();
  }
  return res.redirect('/');
}

// Ruta del panel
app.get('/admin', verificarAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// API para obtener todos los invitados
app.get('/api/invitados', verificarAdmin, (req, res) => {
  const raw = fs.readFileSync(path.join(__dirname, 'data', 'invitados.json'), 'utf8');
  res.json(JSON.parse(raw));
});

// API para actualizar mesa
app.put('/api/invitados/:codigo', verificarAdmin, (req, res) => {
  const { codigo } = req.params;
  const { mesa } = req.body;
  const ruta = path.join(__dirname, 'data', 'invitados.json');
  const raw = fs.readFileSync(ruta, 'utf8');
  const invitados = JSON.parse(raw);
  const index = invitados.findIndex(i => i.codigo === codigo);

  if (index === -1) return res.status(404).send('Invitado no encontrado');

  invitados[index].mesa = mesa;
  fs.writeFileSync(ruta, JSON.stringify(invitados, null, 2));
  res.sendStatus(200);
});
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/admin-login', (req, res) => {
  const { clave } = req.body;
  if (clave === 'Hola1969') {
    res.cookie('admin', 'true');
    res.redirect('/admin');
  } else {
    res.send('<script>alert("Contraseña incorrecta"); window.location.href="/admin-login"</script>');
  }
});

// Iniciar servidor
app.listen(port, host, () => {
  console.log(`Servidor escuchando en http://${host}:${port}`);
});
