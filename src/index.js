import e, { Express } from "express";
import cors from "cors";
const app = express();
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(cors("*"));

app.get("/", (req, res) => {
  res.status(200).send("Recados-API");
});
const usuarios = [];

//Criar usuario

app.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;
  const saltRounds = 10;
  if (nome === "" || email === "" || senha === "") {
    return res.status(400).send("Preencha todos os campos");
  }
  const validarUsuario = usuarios.find((usuario) => usuario.email === email);
  if (validarUsuario) {
    return res.status(400).send("Usuario ja existe");
  } else {
    let id = Math.floor(Math.random() * 999999);
    let senha = await bcrypt.hash(senha, saltRounds);
    let usuario = { id, nome, email, senha: [] };
    usuarios.push(usuario);
    return res.status(200).send("Usuario cadastrado com sucesso");
  }
});

//Logar usuario

app.get("/usuarios", (req, res) => {
  return res.status(200).send(usuarios);
});

app.post("/usuarios/login", async (req, res) => {
  const { email, senha } = req.body;
  const usuario = usuarios.find((usuario) => usuario.email === email);
  if (!usuario) {
    return res.status(400).send("Usuario nao existe");
  } else {
    const validarSenha = await bcrypt.compare(senha, usuario.senha);
    if (!validarSenha) {
      return res.status(400).send("Senha incorreta");
    } else {
      return res.status(200).send("Usuario logado com sucesso");
    }
  }
});

//Criar recado

app.post("/usuarios/:id/recado", (req, res) => {
  const novoRecado = req.body;
  let recadoCriado = {
    id: Math.floor(Math.random() * 999999),
    titulo: novoRecado.titulo,
    descricao: novoRecado.descricao,
  };

  const id = req.params.id;
  const idUsuario = usuarios.findIndex((usuario) => usuario.id === id);
  usuarios[idUsuario].recado.push(recadoCriado);
  return res.status(200).send("Recado criado com sucesso");
});

//Listar recados

app.get("/usuarios/:id/recado", (req, res) => {
  const usuarioId = parseInt(req.params.id);
  const usuario = usuarios.find((usuario) => usuario.id === usuarioId);

  if (!usuario) {
    return res.status(400).send("Usuario nao encontrado");
  } else {
    const page = req.query.page || 1;
    const pages = Math.ceil(usuario.recado.length / 5);
    const indice = (page - 1) * 5;
    const aux = [...usuario.recado];
    const result = aux.slice(indice, indice + 5);

    return res
      .status(200)
      .send({ total: usuario.recado.length, recados: result, page, pages });
  }
});

//Atualizar recado

app.put("/usuarios/:id/recado/:idDoRecado", (req, res) => {
  const idDoUsuario = parseInt(req.params.id);
  const idDoRecado = parseInt(req.params.idDoRecado);
  const usuario = usuarios.find(
    (usuario) => usuario.id === Number(idDoUsuario)
  );
  const recado = usuario.recado.find(
    (recado) => recado.id === Number(idDoRecado)
  );

  if (!recado) {
    return res.status(400).send("Recado nao encontrado");
  } else if (usuario === undefined && recado === recado) {
    return res.status(400).send("Usuario nao encontrado");
  } else {
    recado.titulo = req.body.titulo;
    recado.descricao = req.body.descricao;

    res.status(200).send("Recado atualizado com sucesso");
  }
});

//Deletar recado

app.delete("/usuarios/:id/recado/:idRecado", (req, res) => {
  const id = parseInt(req.params.id);
  const idDoRecado = parseInt(req.params.idDoRecado);
  const indexUsuario = usuarios.findIndex((usuario) => usuario.id === id);

  if (indexUsuario < 0) {
    res.status(400).send("Usuario nao encontrado");
    return;
  }

  const indexDoRecado = usuarios[indexUsuario].recado.findIndex(
    (recado) => recado.id === idDoRecado
  );
  if (indexDoRecado < 0) {
    res.status(400).send("Recado nao encontrado");
    return;
  }
  usuarios[indexUsuario].recado.splice(indexDoRecado, 1);
  return res.status(200).send("Recado deletado com sucesso");
});

//Teste servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
