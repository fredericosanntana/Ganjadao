const express = require("express");
const router = express.Router();

// Rota principal (Home)
router.get("/", (req, res) => {
    // A lógica da home já está em app.js, mas podemos ter uma view específica se necessário
    res.render("index", { title: "GanjaDAO - Início" });
});

router.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/auth/login?unauthorized=true");
    }
    res.render("dashboard", { title: "Painel do Usuário", user: req.session.user });
});

module.exports = router;

