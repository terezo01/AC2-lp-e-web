const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

const tarefasPath = path.join(__dirname, "tarefas-escola.json");
const tarefasData = fs.readFileSync(tarefasPath, "utf-8");
const tarefas = JSON.parse(tarefasData);

const indexHtml = path.join(__dirname, "/html/index.html");

function salvarDados() {
  fs.writeFileSync(tarefasPath, JSON.stringify(tarefas, null, 2));
}

function gerarTabelaTarefas() {
  let tarefaTable = "";

  tarefas.forEach((tarefa, index) => {

    let descricaoTruncada = truncarDescricao(tarefa.descricaoTarefa, 200)

    tarefaTable += `
      <tr>
        <td><a href="/mostrar-tarefa/${tarefa.nomeTarefa}">${tarefa.nomeTarefa}</a></td>
        <td>${descricaoTruncada}</td>
        <td>${tarefa.disciplinaTarefa}</td>
        <td>
          <form action="/remover" method="GET" style="display:inline;">
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

function truncarDescricao(desc, comprimentoMax) {
  if (desc.length > comprimentoMax) {
    return desc.slice(0, comprimentoMax) + "...";
  }
  return desc;
}

function buscarTarefaPorNome(nomeTarefa) {
  return tarefas.find(tarefa => tarefa.nome.toLowerCase() === nomeTarefa.toLowerCase())
}

function buscarTarefaPorCategoria(categoria) {
  let tarefaTable = "";

  tarefas.forEach((tarefa, indexReal) => { 
    if (tarefa.disciplinaTarefa.toLowerCase() === categoria.toLowerCase()) {

      let descricaoTruncada = truncarDescricao(tarefa.descricaoTarefa, 200);

      tarefaTable += `
        <tr>
          <td><a href="/mostrar-tarefa/${tarefa.nomeTarefa}">${tarefa.nomeTarefa}</a></td>
          <td>${descricaoTruncada}</td>
          <td>${tarefa.disciplinaTarefa}</td>
          <td>
            <form action="/remover" method="GET" style="display:inline;">
              <input type="hidden" name="index" value="${indexReal}"> 
              <button type="submit">Remover</button>
            </form>
            <form action="/atualizar" method="GET" style="display:inline;">
              <input type="hidden" name="index" value="${indexReal}"> 
              <button type="submit">Atualizar</button>
            </form>
          </td>
        </tr>
      `;
    }
  });

  if (tarefaTable === "") {
    return `<tr><td colspan="4">Nenhuma tarefa encontrada para a categoria "${categoria}"</td></tr>`;
  }

  return tarefaTable
}

app.get("/", (req, res) => {
  const indexData = fs.readFileSync(indexHtml, "utf-8");
  const tabela = gerarTabelaTarefas();
  const html = indexData.replace("{{tarefaTable}}", tabela);
  res.send(html);
});

app.get("/mostrar-tarefa/:nome", (req, res) => {
  const nome = req.params.nome

  let tarefaEncontrada = buscarTarefaPorNome(nome)

  if (tarefaEncontrada) {
    const tarefaEncontradaPath = path.join(__dirname, "/html/tarefa.html")
    const tarefaEncontradaData = fs.readFileSync(tarefaEncontradaPath, "utf-8")
    const htmlTarefaEncontrada = tarefaEncontradaData.replace(
      "{{tarefaEncontrada}}",
      `<div class="card-body"><p class="cardtext"><strong>Nome:</strong>${tarefaEncontrada.nomeTarefa}</p>
      <p class="cardtext"><strong>Categoria:</strong>${tarefaEncontrada.descricaoTarefa}</p>
      <p class="cardtext"><strong>Descrição:</strong>${tarefaEncontrada.disciplinaTarefa}</p> <br></div>`
    )
    res.send(htmlTarefaEncontrada)
  }
  else {
    console.log("Não foi possivel acessar")
  }
})

app.post("/adicionar-tarefa", (req, res) => {
  const { nomeTarefa, descricaoTarefa, disciplinaTarefa } = req.body;

  if (
    tarefas.find(
      (tarefa) => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase
    )
  ) {
    console.log("Não foi possivel adicionar essa nova tarefa");
  }

  novaTarefa = {
    nomeTarefa: nomeTarefa,
    descricaoTarefa: descricaoTarefa,
    disciplinaTarefa: disciplinaTarefa,
  };

  tarefas.push(novaTarefa);
  salvarDados();

  res.redirect("/");
});

app.get("/remover", (req, res) => {
  const index = parseInt(req.query.index);

  if (index < 0) {
    console.log("Tarefa não pode ser deletada");
  } else {
    tarefas.splice(index, 1);
    salvarDados();
  }
  res.redirect("/");
});

app.post("/remover", (req, res) => {
  const nomeTarefaRemover = req.body

  const tarefaIndex = tarefas.findIndex(tarefa => tarefa.nome.toLowerCase() === nomeTarefaRemover.toLowerCase())

  if (tarefaIndex < 0) {
    console.log("Não foi possivel achar a tarefa")
  }
  else {
    tarefas.splice(tarefaIndex, 1);
    salvarDados();
  }

  res.redirect("/");

})

app.get("/atualizar", (req, res) => {
  const index = parseInt(req.query.index);

  if (index < 0) {
    console.log("Não foi possivel fazer isso");
    return
  }

  const tarefa = tarefas[index];

  let atualizarHtml = fs.readFileSync(
    path.join(__dirname, "/html/atualizar.html"),
    "utf-8"
  );

  atualizarHtml = atualizarHtml
    .replace("{{nomeTarefa}}", tarefa.nomeTarefa)
    .replace("{{descricaoTarefa}}", tarefa.descricaoTarefa)
    .replace("{{disciplinaTarefa}}", tarefa.disciplinaTarefa);

  res.send(atualizarHtml);
});

app.post("/atualizar", (req, res) => {
  const { nomeTarefa, novaDescricaoTarefa, novaDisciplinaTarefa } = req.body;

  const tarefaIndex = tarefas.findIndex(
    (tarefa) => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase()
  );

  if (tarefaIndex < 0) {
    console.log("tarefa não encontradas");
  }

  tarefas[tarefaIndex].descricaoTarefa = novaDescricaoTarefa;
  tarefas[tarefaIndex].disciplinaTarefa = novaDisciplinaTarefa;

  salvarDados();

  res.redirect("/");
});

app.post("/filtrar", (req, res) => {
  const escolha = req.body.escolha

  if(escolha === "Todas"){
    const indexData = fs.readFileSync(indexHtml, "utf-8");
    const tabela = gerarTabelaTarefas();
    const html = indexData.replace("{{tarefaTable}}", tabela);
    res.send(html);
    return
  }

  const tabela = buscarTarefaPorCategoria(escolha)
  const html = fs.readFileSync(indexHtml, 'utf-8')
    .replace('{{tarefaTable}}', tabela);
  res.send(html);

})

app.listen(PORT, () => {
  console.log(`Servidor hosteando no http://localhost:${PORT}/`);
});
