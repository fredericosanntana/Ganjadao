const express = require("express");
const router = express.Router();

// Placeholder para rotas de assinatura
router.get("/", (req, res) => {
    if (!req.session.user) return res.redirect("/auth/login?unauthorized=true");
    res.send("Página de Assinatura (em desenvolvimento)");
});

module.exports = router;

