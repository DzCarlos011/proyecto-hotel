const stripe = require("stripe")(
  "sk_test_51O2gfuJw0dovYyK3m2SlMxrxMN7lpDWb4axDqZYjnzP88GyYi1DybIVnc5MBlk79k0cCspo1VTLnXqfblAPVKtcs00btxDeuDC"
);
const express = require("express");
const app = express();

const endpointSecret =
  "whsec_a66797fa4ddaddc74dd8e72943f5b8410bde59437ecb13fc80f15b7414353886";
//const stripe = new Stripe('sk_test_51O2gfuJw0dovYyK3m2SlMxrxMN7lpDWb4axDqZYjnzP88GyYi1DybIVnc5MBlk79k0cCspo1VTLnXqfblAPVKtcs00btxDeuDC');

const session = require("express-session");

const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const verify = jwt.verify;
const JWT_SECRET = process.env.JWT_SECRET || "token.01010101";

app.use(cors());
app.use(express.json());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "hotel",
  port: "3309",
});

//-----------------------------------------------------------USUARIOS--------------------------------------------------------------//

app.post("/createUser", (req, res) => {
  const email = req.body.email;
  const contrasena = req.body.contrasena;
  const nombre = req.body.nombre;
  const apellido_p = req.body.apellido_p;
  const apellido_m = req.body.apellido_m;

  db.query(
    "INSERT INTO usuarios(email,contrasena,nombre,apellido_p,apellido_m) VALUES(?,?,?,?,?)",
    [email, contrasena, nombre, apellido_p, apellido_m],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/getUsers", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/getUser/:id", (req, res) => {
  const id_usuario = req.params.id_usuario;
  db.query(
    "SELECT * FROM usuarios WHERE id_usuario = ?",
    id_usuario,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

/*LOGIN*/
// Configura la sesión
app.post("/login", (req, res) => {
  const { email, contrasena } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ? AND contrasena = ?",
    [email, contrasena],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: "Error en la base de datos" });
      } else if (results.length === 0) {
        res.status(401).json({ error: "Credenciales incorrectas" });
      } else {
        const usuario = {
          email: email,
        };

        jwt.sign(
          { usuario },
          JWT_SECRET,
          { expiresIn: "1h" },
          (jwtErr, token) => {
            if (jwtErr) {
              res.status(500).json({ error: "Error al generar el token" });
            } else {
              res.json({ token });
            }
          }
        );
      }
    }
  );
});

app.get("/user", (req, res) => {
  const jwtByUser = req.headers.authorization || ""; // Obtiene el token del encabezado
  const jwt2 = jwtByUser.split(" ").pop();

  if (!jwt2) {
    return res.status(401).json({ error: "No has iniciado sesión" });
  }

  const isUser = verifyToken(jwt2);
  if (isUser) {
    const email = isUser.usuario.email;

    db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          // Manejo de errores
        } else if (result.length === 0) {
          res.status(401).json({ error: "Credenciales incorrectas" });
        } else {
          res.send(result);
        }
      }
    );
  } else {
    res.status(401).json({ error: "Token no válido" });
  }
});

/*
const checkJwt = (req, res, next) => {
    try {
      const jwtByUser = req.headers.authorization || "";
      const jwt = jwtByUser.split(" ").pop(); // 11111
      const isUser = verifyToken(`${jwt}`) = { id };
      if (!isUser) {
        res.status(401);
        res.send("NO_TIENES_UN_JWT_VALIDO");
      } else {
        req.user = isUser;
        next();
      }
    } catch (e) {
      console.log({ e });
      res.status(400);
      res.send("SESSION_NO_VALIDAD");
    }
  };

const JWT_SECRET = process.env.JWT_SECRET || "token.01010101";

const generateToken = (id) => {
  const jwt = sign({ id }, JWT_SECRET, {
    expiresIn: "2h",
  });
  return jwt;
};

*/
const verifyToken = (jwt) => {
  const isOk = verify(jwt, JWT_SECRET);
  return isOk;
};

app.put("/updateUser", (req, res) => {
  const id_usuario = req.body.id_usuario;
  const email = req.body.email;
  const contrasena = req.body.contrasena;
  const nombre = req.body.nombre;
  const apellido_p = req.body.apellido_p;
  const apellido_m = req.body.apellido_m;

  db.query(
    "UPDATE usuarios SET email=?,contrasena=?,nombre=?,apellido_p=?,apellido_m=? WHERE id_usuario=?",
    [email, contrasena, nombre, apellido_p, apellido_m, id_usuario],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deleteUser/:id", (req, res) => {
  const id_usuario = req.params.id_usuario;

  db.query(
    "DELETE FROM usuarios WHERE id_usuario=?",
    id_usuario,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

//-----------------------------------------------------------HABITACIONES--------------------------------------------------------------//

app.post("/createRoom", (req, res) => {
  const tipo_de_habitacion = req.body.tipo_de_habitacion;
  const estado = req.body.estado;
  const precio = req.body.precio;

  db.query(
    "INSERT INTO habitaciones(tipo_de_habitacion,estado,precio) VALUES(?,?,?)",
    [tipo_de_habitacion, estado, precio],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/getRooms", (req, res) => {
  db.query("SELECT * FROM habitaciones", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/updateRoom", (req, res) => {
  const id_habitacion = req.body.id_habitacion;
  const tipo_de_habitacion = req.body.tipo_de_habitacion;
  const estado = req.body.estado;
  const precio = req.body.precio;

  db.query(
    "UPDATE habitaciones SET tipo_de_habitacion=?,estado=?,precio=? WHERE id_habitacion=?",
    [tipo_de_habitacion, estado, precio, id_habitacion],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deleteRoom/:id", (req, res) => {
  const id_habitacion = req.params.id_habitacion;

  db.query(
    "DELETE FROM habitaciones WHERE id_habitacion=?",
    id_habitacion,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

//-----------------------------------------------------------RESERVACIONES--------------------------------------------------------------//
app.post("/createReservation", async (req, res) => {
  const fecha_llegada = req.body.fecha_llegada;
  const fecha_salida = req.body.fecha_salida;
  const total_pago = req.body.total_pago;
  const token = 0;
  const id_usuario = 5;
  const id_habitacion = req.body.id_habitacion;

  db.query(
    "INSERT INTO reservaciones(fecha_llegada, fecha_salida, total_pago, token, id_usuario, id_habitacion) VALUES(?, ?, ?, ?, ?, ?)",
    [fecha_llegada, fecha_salida, total_pago, token, id_usuario, id_habitacion],
    (err, result) => {
      if (err) {
        console.log(err);
   
      } else {
  
      }
    }
  );
});

app.get("/getReservations", (req, res) => {
  db.query("SELECT * FROM reservaciones", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/create-checkout-session", async (req, res) => {
  const total_pago = req.body.total_pago;
  const id_usuario = req.body.id_usuario;
  const id_habitacion = req.body.id_habitacion;
  const fecha_llegada = req.body.fecha_llegada;
  const fecha_salida = req.body.fecha_salida;
  const token = 0;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: "Reservation",
            },
            currency: "usd",
            unit_amount: total_pago,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/",
      cancel_url: "http://localhost:5173/rooms",
      metadata: {
        id_usuario: id_usuario,
        id_habitacion: id_habitacion,
        fecha_llegada: fecha_llegada,
        fecha_salida: fecha_salida,
      },
    });
    return res.json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    let event = request.body;

    // Obtén los datos necesarios de la sesión de pago
    const fecha_llegada = event.data.object.metadata.fecha_llegada;
    const fecha_salida = event.data.object.metadata.fecha_salida;
    const total_pago = event.data.object.amount_total / 100; // Stripe expresa los montos en centavos
    const token = 0; // ¿De dónde proviene este token? Asegúrate de obtenerlo de la manera correcta
    const id_usuario = event.data.object.metadata.id_usuario;
    const id_habitacion = event.data.object.metadata.id_habitacion;

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`
        );
        // handlePaymentIntentSucceeded(paymentIntent);
        break;

      case "checkout.session.completed":
        const checkoutSession = event.data.object;
        const paymentIntentId = checkoutSession.payment_intent;
        const customerEmail = checkoutSession.customer_email;
        const amountPaid = checkoutSession.amount_total;

        // Inserta datos en la base de datos después de una compra exitosa
        db.query(
          "INSERT INTO reservaciones(fecha_llegada, fecha_salida, total_pago, token, id_usuario, id_habitacion) VALUES(?, ?, ?, ?, ?, ?)",
          [
            fecha_llegada,
            fecha_salida,
            total_pago,
            token,
            id_usuario,
            id_habitacion,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              response.status(500).json({
                message: "Error al insertar en la base de datos",
                error: err,
              });
            } else {
              console.log(result);
              response
                .status(200)
                .json({ message: "Successful Payment", result: result });
            }
          }
        );
        console.log(`checkoutSession for ${paymentIntentId} was successful!`);
        break;

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
        response.status(400).send(`Unexpected event type ${event.type}.`);
    }
  }
);

app.get("/success", (req, res) => res.send("succesful"));
app.get("/cancel", (req, res) => res.send("cancel"));

app.put("/updateReservation", (req, res) => {
  const id_reservacion = req.body.id_reservacion;
  const fecha_llegada = req.body.fecha_llegada;
  const fecha_salida = req.body.fecha_salida;
  const total_pago = req.body.total_pago;
  const token = 0;
  const id_usuario = req.body.id_usuario;
  const id_habitacion = req.body.id_habitacion;

  db.query(
    "UPDATE reservaciones SET fecha_llegada=?,fecha_salida=?, total_pago=?,token=?,id_usuario=?,id_habitacion=? WHERE id_reservacion=?",
    [
      fecha_llegada,
      fecha_salida,
      total_pago,
      token,
      id_usuario,
      id_habitacion,
      id_reservacion,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deleteReservation/:id", (req, res) => {
  const id_reservacion = req.params.id;

  db.query(
    "DELETE FROM reservaciones WHERE id_reservacion=?",
    id_reservacion,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.listen(3001, () => {
  console.log("Corriendo en el puerto 3001");
});
