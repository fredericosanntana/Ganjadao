const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rota para exibir o formulário de registro
router.get("/register", authController.getRegisterPage);

// Rota para processar o registro de um novo usuário
router.post("/register", authController.registerUser);

// Rota para exibir o formulário de login
router.get("/login", authController.getLoginPage);

// Rota para processar o login do usuário
router.post("/login", authController.loginUser);

// Rota para logout do usuário
router.get("/logout", authController.logoutUser);

module.exports = router;

