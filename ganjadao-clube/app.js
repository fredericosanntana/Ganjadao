// ganjadao-clube/app.js
require("dotenv").config();
const express       = require("express");
const path          = require("path");
const bodyParser    = require("body-parser");
const session       = require("express-session");
const SQLiteStore   = require("connect-sqlite3")(session);
require("./db/database"); // inicializa o DB (sem exportar)

// Importa rotas como sub-app routers
const authRoutes         = require("./routes/authRoutes");
const mainRoutes         = require("./routes/mainRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const initiativeRoutes   = require("./routes/initiativeRoutes");
const voteRoutes         = require("./routes/voteRoutes");
const adminRoutes        = require("./routes/adminRoutes");

const app = express();

// Configuração do View Engine (EJS)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares estáticos e parsers
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Sessão com SQLite
app.use(session({
  store: new SQLiteStore({ db: "ganjadao.db", dir: path.join(__dirname, "db"), table: "sessions" }),
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Variáveis globais para views
app.use((req, res, next) => {
  res.locals.currentUser     = req.session.user;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin         = req.session.user && req.session.user.is_admin;
  next();
});

// Monta os routers como sub-apps
app.use("/auth",         authRoutes);
app.use("/",             mainRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/initiatives",  initiativeRoutes);
app.use("/vote",         voteRoutes);
app.use("/admin",        adminRoutes);

// 404 e 500
app.use((req, res) => {
  res.status(404).render("404", { title: "Página não encontrada" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500", { title: "Erro no servidor", error: err.message });
});

// Exporta o app para ser montado em mainApp
module.exports = app;
