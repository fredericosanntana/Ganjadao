const express = require("express");
const router = express.Router();

// Placeholder para rotas de iniciativas
router.get("/", (req, res) => {
    if (!req.session.user) return res.redirect("/auth/login?unauthorized=true");
    res.send("Página de Iniciativas e Votação (em desenvolvimento)");
});

module.exports = router;

