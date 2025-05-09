const bcrypt = require("bcryptjs");
const db = require("../db/database");

// Função auxiliar para buscar usuário por email ou username
const findUserByEmailOrUsername = (identifier, callback) => {
    const query = `SELECT * FROM users WHERE email = ? OR username = ?`;
    db.get(query, [identifier, identifier], callback);
};

// Função auxiliar para criar créditos de voto para novo usuário
const createUserVoteCredits = (userId, callback) => {
    const insertCreditsQuery = `INSERT INTO user_vote_credits (user_id, total_credits) VALUES (?, ?)`;
    // 100 créditos iniciais por padrão, certifique-se que a tabela user_vote_credits existe
    db.run(insertCreditsQuery, [userId, 100], function(err) {
        if (err) {
            console.error("Erro ao criar créditos de voto para o usuário inicial: " + userId, err.message);
        }
        callback(err);
    });
};

exports.getRegisterPage = (req, res) => {
    res.render("auth/register", { title: "Registrar - GanjaDAO", errors: [], formData: {}, messages: {} });
};

exports.registerUser = (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    let errors = [];

    if (!username || !email || !password || !confirm_password) {
        errors.push({ msg: "Por favor, preencha todos os campos." });
    }

    if (password !== confirm_password) {
        errors.push({ msg: "As senhas não coincidem." });
    }

    if (password && password.length < 6) {
        errors.push({ msg: "A senha deve ter pelo menos 6 caracteres." });
    }

    if (errors.length > 0) {
        return res.render("auth/register", {
            title: "Registrar - GanjaDAO",
            errors,
            formData: { username, email },
            messages: {}
        });
    }

    findUserByEmailOrUsername(email, (err, row) => {
        if (err) {
            console.error("Erro ao buscar usuário (email):", err.message);
            errors.push({ msg: "Erro no servidor. Tente novamente mais tarde." });
            return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
        }
        if (row) {
            errors.push({ msg: "Este e-mail já está registrado." });
            return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
        }

        findUserByEmailOrUsername(username, (err, row) => {
            if (err) {
                console.error("Erro ao buscar usuário (username):", err.message);
                errors.push({ msg: "Erro no servidor. Tente novamente mais tarde." });
                return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
            }
            if (row) {
                errors.push({ msg: "Este nome de usuário já está em uso." });
                return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
            }

            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    console.error("Erro ao gerar salt: ", err.message);
                    errors.push({ msg: "Erro no servidor ao registrar. Tente novamente." });
                    return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
                }
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        console.error("Erro ao gerar hash: ", err.message);
                        errors.push({ msg: "Erro no servidor ao registrar. Tente novamente." });
                        return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
                    }
                    const insertUserQuery = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
                    db.run(insertUserQuery, [username, email, hash], function(err) {
                        if (err) {
                            console.error("Erro ao registrar usuário no DB:", err.message);
                            errors.push({ msg: "Erro ao registrar. Tente novamente." });
                            return res.render("auth/register", { title: "Registrar - GanjaDAO", errors, formData: { username, email }, messages: {} });
                        }
                        const userId = this.lastID;
                        createUserVoteCredits(userId, (creditErr) => {
                            if (creditErr) {
                                // Logar o erro, mas o registro do usuário principal foi bem-sucedido
                                console.error("Atenção: Usuário " + userId + " registrado, mas falha ao criar créditos de voto iniciais.");
                            }
                            res.redirect("/auth/login?registered=true");
                        });
                    });
                });
            });
        });
    });
};

exports.getLoginPage = (req, res) => {
    const messages = {};
    if (req.query.registered) {
        messages.success_msg = "Registro bem-sucedido! Faça o login para continuar.";
    }
    if (req.query.unauthorized) {
        messages.error_msg = "Você precisa estar logado para acessar esta página.";
    }
    if (req.query.admin_required) {
        messages.error_msg = "Acesso restrito a administradores.";
    }
    if (req.query.logged_out) {
        messages.success_msg = "Logout bem-sucedido.";
    }
    res.render("auth/login", { title: "Login - GanjaDAO", messages, formData: {} });
};

exports.loginUser = (req, res) => {
    const { identifier, password } = req.body; // 'identifier' pode ser username ou email
    let errors = [];

    if (!identifier || !password) {
        return res.render("auth/login", { title: "Login - GanjaDAO", messages: { error_msg: "Por favor, preencha todos os campos." }, formData: { identifier } });
    }

    findUserByEmailOrUsername(identifier, (err, user) => {
        if (err) {
            console.error("Erro ao buscar usuário no login:", err.message);
            return res.render("auth/login", { title: "Login - GanjaDAO", messages: { error_msg: "Erro no servidor. Tente novamente." }, formData: { identifier } });
        }
        if (!user) {
            return res.render("auth/login", { title: "Login - GanjaDAO", messages: { error_msg: "Usuário ou e-mail não encontrado." }, formData: { identifier } });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Erro ao comparar senhas: ", err.message);
                return res.render("auth/login", { title: "Login - GanjaDAO", messages: { error_msg: "Erro no servidor. Tente novamente." }, formData: { identifier } });
            }
            if (isMatch) {
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    is_admin: user.is_admin === 1 // SQLite BOOLEAN é 0 ou 1
                };
                if (user.is_admin === 1) {
                    res.redirect("/admin/dashboard");
                } else {
                    res.redirect("/clube/dashboard");
                }
            } else {
                return res.render("auth/login", { title: "Login - GanjaDAO", messages: { error_msg: "Senha incorreta." }, formData: { identifier } });
            }
        });
    });
};

exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Erro ao fazer logout:", err);
            // Mesmo com erro, tenta redirecionar
        }
        res.clearCookie("connect.sid"); // Nome padrão do cookie de sessão do express-session
        res.redirect("/auth/login?logged_out=true");
    });
};

