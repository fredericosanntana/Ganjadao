// routes/voteRoutes.js
const express = require("express");
const db = require("../db/database");
const router = express.Router();

// Lista votos do usuário
router.get("/", (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.redirect("/auth/login");
  const sql = `
    SELECT v.initiative_id, i.title, v.created_at
    FROM votes v
    JOIN initiatives i ON v.initiative_id = i.id
    WHERE v.user_id = ?
    ORDER BY v.created_at DESC
  `;
  db.all(sql, [user.id], (err, rows) => {
    if (err) return next(err);
    res.render("vote/index", { title: "Meus Votos", votes: rows });
  });
});

// Registra um voto
router.post("/:id", (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.redirect("/auth/login");
  const initiativeId = req.params.id;
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO votes (user_id, initiative_id, vote_credits, created_at)
    VALUES (?, ?, 1, datetime('now'))
  `);
  stmt.run(user.id, initiativeId, function(err) {
    if (err) return next(err);
    res.redirect(`/initiatives/${initiativeId}`);
  });
});

// Remove um voto
router.post("/:id/remove", (req, res, next) => {
  const user = req.session.user;
  if (!user) return res.redirect("/auth/login");
  const initiativeId = req.params.id;
  const stmt = db.prepare(`
    DELETE FROM votes WHERE user_id = ? AND initiative_id = ?
  `);
  stmt.run(user.id, initiativeId, function(err) {
    if (err) return next(err);
    res.redirect(`/initiatives/${initiativeId}`);
  });
});

module.exports = router;
