const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

const tarefasPath = path.join(__dirname, "tarefas-escola.json");
const tarefasData = fs.readFileSync(tarefasPath, "utf-8");
const tarefas = JSON.parse(tarefasData);

const indexHtml = path.join(__dirname, "/html/index.html");

function salvarDados() {
  fs.writeFileSync(tarefasData, JSON.stringify(tarefas, null, 2));
}

function gerarTabelaTarefas() {
  let tarefaTable = "";

  tarefas.forEach((tarefa, index) => {
    tarefaTable += `
      <tr>
        <td>${tarefa.nomeTarefa}</td>
        <td>${tarefa.descricaoTarefa}</td>
        <td>${tarefa.disciplinaTarefa}</td>
        <td>
          <form action="/remover" method="POST" style="display:inline;">
            <input type="hidden" name="index" value="${index}">
            <button type="submit">Remover</button>
          </form>
          <form action="/atualizar" method="GET" style="display:inline;">
            <input type="hidden" name="index" value="${index}">
            <button type="submit">Atualizar</button>
          </form>
        </td>
      </tr>
    `;
  });

  return tarefaTable;
}

app.get("/", (req, res) => {
  const indexData = fs.readFileSync(indexHtml, "utf-8");
  const tabela = gerarTabelaTarefas();
  const html = indexData.replace("{{tarefaTable}}", tabela);
  res.send(html);
});

app.post("/adicionar-tarefa", (req, res) => {
  const { nome, desc, disciplina } = req.body;

  if (
    tarefas.find(
      (tarefa) => tarefa.nomeTarefa.toLowerCase() === nome.toLowerCase
    )
  ) {
    alert("Não foi possivel adicionar essa nova tarefa");
    return;
  }

  novaTarefa = {
    nomeTarefa: nome,
    descricaoTarefa: desc,
    disciplinaTarefa: disciplina,
  };

  tarefas.push(novaTarefa);
  salvarDados();

  res.redirect("/");
});

app.post("/remover", (req, res) => {
  const index = parseInt(req.body.index);

  if (index < 0) {
    alert("Tarefa não pode ser deletada");
    return;
  } else {
    tarefas.splice(tarefaIndex, 1);
    salvarDados();

    res.redirect("/");
  }
});

app.get("/atualizar", (req, res) => {
  const tarefaIndex = parseInt(req.query.index);

  if (tarefaIndex < 0) {
    alert("Não foi possivel fazer isso");
  }

  const tarefa = tarefas[tarefaIndex];

  let alterarHtml = fs.readFileSync(
    path.join(__dirname, "/html/alterar.html"),
    "utf-8"
  );

  alterarHtml = alterarHtml
    .replace("{{nomeTarefa}}", tarefa.nomeTarefa)
    .replace("{{descricaoTarefa}}", tarefa.descricaoTarefa)
    .replace("{{disciplinaTarefa}}", tarefa.disciplinaTarefa);

  res.send(alterarHtml);
});

app.post("/alterar", (req, res) => {
  const { nomeTarefa, novaDescricaoTarefa, novaDisciplinaTarefa } = req.body;

  const tarefaIndex = tarefas.findIndex(
    (tarefa) => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase()
  );

  if (tarefaIndex < 0) {
    alert("tarefa não encontradas");
    return;
  }

  tarefas[tarefaIndex].descricaoTarefa = novaDescricaoTarefa;
  tarefas[tarefaIndex].disciplinaTarefa = novaDisciplinaTarefa;

  salvarDados();

  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Servidor hosteando no http://localhost:${PORT}/`);
});
