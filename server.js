const express = require("express");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });

let orders = [];
const SECRET = "maxwell_secret";

// LOGIN
app.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "1234") {
    const token = jwt.sign({ user }, SECRET);
    return res.send({ token });
  }

  res.send({});
});

// AUTH
function auth(req, res, next) {
  try {
    jwt.verify(req.headers.authorization, SECRET);
    next();
  } catch {
    res.status(401).send("Unauthorized");
  }
}

// CREATE ORDER
app.post("/order", upload.single("proof"), (req, res) => {
  const payload = JSON.parse(req.body.payload);

  const order = {
    ...payload,
    id: Date.now(),
    status: "Pending",
    proof: req.file ? req.file.path : null,
  };

  orders.push(order);

  res.send({ success: true });
});

// GET ORDERS
app.get("/orders", auth, (req, res) => {
  res.send(orders);
});

// UPDATE STATUS
app.post("/update-status", auth, (req, res) => {
  const { id, status } = req.body;

  orders = orders.map((o) =>
    o.id === id ? { ...o, status } : o
  );

  res.send({ success: true });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});