const express = require("express");
const db = require("../db/database");
const router = express.Router();

// Middleware: restringe apenas a administradores
router.use((req, res, next) => {
  if (!req.session.user || !req.session.user.is_admin) {
    return res.status(403).render("403", { title: "Acesso negado" });
  }
  next();
});

// Dashboard administrativo
router.get("/", (req, res) => {
  res.render("admin/dashboard", { title: "Painel de Administração" });
});

// Usuários
router.get("/users", (req, res, next) => {
  db.all(
    "SELECT id, username, is_admin, created_at FROM users ORDER BY created_at DESC",
    [],
    (err, users) => {
      if (err) return next(err);
      res.render("admin/users", { title: "Gerenciar Usuários", users });
    }
  );
});

// Alterar permissão de admin
router.post("/users/:id/toggle-admin", (req, res, next) => {
  const userId = req.params.id;
  db.get(
    "SELECT is_admin FROM users WHERE id = ?",
    [userId],
    (err, row) => {
      if (err) return next(err);
      const newRole = row.is_admin ? 0 : 1;
      db.run(
        "UPDATE users SET is_admin = ? WHERE id = ?",
        [newRole, userId],
        err => {
          if (err) return next(err);
          res.redirect("/admin/users");
        }
      );
    }
  );
});

// Excluir usuário
router.post("/users/:id/delete", (req, res, next) => {
  const userId = req.params.id;
  db.run(
    "DELETE FROM users WHERE id = ?",
    [userId],
    err => {
      if (err) return next(err);
      res.redirect("/admin/users");
    }
  );
});

// Assinaturas
router.get("/subscriptions", (req, res, next) => {
  db.all(
    "SELECT * FROM subscriptions ORDER BY started_at DESC",
    [],
    (err, subs) => {
      if (err) return next(err);
      res.render("admin/subscriptions", { title: "Gerenciar Assinaturas", subscriptions: subs });
    }
  );
});

// Cancelar assinatura
router.post("/subscriptions/:id/cancel", (req, res, next) => {
  const id = req.params.id;
  db.run(
    "UPDATE subscriptions SET status = 'canceled', canceled_at = datetime('now') WHERE id = ?",
    [id],
    err => {
      if (err) return next(err);
      res.redirect("/admin/subscriptions");
    }
  );
});

// Iniciativas
router.get("/initiatives", (req, res, next) => {
  const sql = `
    SELECT i.id, i.title, u.username AS author, i.created_at
    FROM initiatives i
    JOIN users u ON i.user_id = u.id
    ORDER BY i.created_at DESC`;
  db.all(sql, [], (err, inits) => {
    if (err) return next(err);
    res.render("admin/initiatives", { title: "Gerenciar Iniciativas", initiatives: inits });
  });
});

// Deletar iniciativa
router.post("/initiatives/:id/delete", (req, res, next) => {
  const id = req.params.id;
  db.run(
    "DELETE FROM initiatives WHERE id = ?",
    [id],
    err => {
      if (err) return next(err);
      res.redirect("/admin/initiatives");
    }
  );
});

// Votos
router.get("/votes", (req, res, next) => {
  const sql = `
    SELECT v.user_id, u.username, v.initiative_id, i.title, v.created_at
    FROM votes v
    JOIN users u ON v.user_id = u.id
    JOIN initiatives i ON v.initiative_id = i.id
    ORDER BY v.created_at DESC`;
  db.all(sql, [], (err, votes) => {
    if (err) return next(err);
    res.render("admin/votes", { title: "Gerenciar Votos", votes });
  });
});

// Remover voto
router.post("/votes/:userId/:initiativeId/remove", (req, res, next) => {
  const { userId, initiativeId } = req.params;
  db.run(
    "DELETE FROM votes WHERE user_id = ? AND initiative_id = ?",
    [userId, initiativeId],
    err => {
      if (err) return next(err);
      res.redirect("/admin/votes");
    }
  );
});

module.exports = router;
