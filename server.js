const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

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
    let descricaoTruncada = truncarDescricao(tarefa.descricaoTarefa, 200);

    tarefaTable += `
      <tr>
        <td><a href="/mostrar-tarefa/${tarefa.nomeTarefa}">${tarefa.nomeTarefa}</a></td>
        <td>${descricaoTruncada}</td>
        <td>${tarefa.disciplinaTarefa}</td>
        <td>
          <form action="/remover" method="GET" style="display:inline;">
            <input type="hidden" name="index" value="${index}"> 
            <button type="submit" class="btn btn-sm btn-outline-danger me-1">Remover</button>
          </form>
                
          <form action="/atualizar" method="GET" style="display:inline;">
            <input type="hidden" name="index" value="${index}"> 
            <button type="submit" class="btn btn-sm btn-outline-secondary">Atualizar</button>
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
  return tarefas.find(
    (tarefa) => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase()
  );
}

function buscarTarefaPorCategoria(categoria) {
  let tarefaTable = "";

  tarefas.forEach((tarefa, indexReal) => {
    if (
      tarefa.disciplinaTarefa &&
      tarefa.disciplinaTarefa.toLowerCase() === categoria.toLowerCase()
    ) {
      let descricaoTruncada = truncarDescricao(tarefa.descricaoTarefa, 200);

      tarefaTable += `
        <tr>
          <td><a href="/mostrar-tarefa/${tarefa.nomeTarefa}">${tarefa.nomeTarefa}</a></td>
          <td>${descricaoTruncada}</td>
          <td>${tarefa.disciplinaTarefa}</td>
          <td>
            <form action="/remover" method="GET" style="display:inline;">
              <input type="hidden" name="index" value="${indexReal}"> 
              <button type="submit" class="btn btn-sm btn-outline-danger me-1">Remover</button>
            </form>
                
            <form action="/atualizar" method="GET" style="display:inline;">
              <input type="hidden" name="index" value="${indexReal}"> 
              <button type="submit" class="btn btn-sm btn-outline-secondary">Atualizar</button>
            </form>
          </td>
        </tr>
      `;
    }
  });

  if (tarefaTable === "") {
    return `<tr><td colspan="4">Nenhuma tarefa encontrada para a categoria "${categoria}"</td></tr>`;
  }

  return tarefaTable;
}

function buscarTarefaPorCategoriaOutros() {
  let tarefaTable = "";
  const categorias = [
    "português",
    "matemática",
    "ciências",
    "história",
    "geografia",
    "inglês",
  ];

  tarefas.forEach((tarefa, indexReal) => {
    if (
      tarefa.disciplinaTarefa &&
      categorias.includes(tarefa.disciplinaTarefa.toLowerCase())
    ) {
      return;
    }

    let descricaoTruncada = truncarDescricao(tarefa.descricaoTarefa, 200);

    tarefaTable += `
      <tr>
        <td><a href="/mostrar-tarefa/${tarefa.nomeTarefa}">${tarefa.nomeTarefa}</a></td>
        <td>${descricaoTruncada}</td>
        <td>${tarefa.disciplinaTarefa}</td>
        <td>
          <form action="/remover" method="GET" style="display:inline;">
            <input type="hidden" name="index" value="${indexReal}"> 
            <button type="submit" class="btn btn-sm btn-outline-danger me-1">Remover</button>
          </form>
              
          <form action="/atualizar" method="GET" style="display:inline;">
            <input type="hidden" name="index" value="${indexReal}"> 
            <button type="submit" class="btn btn-sm btn-outline-secondary">Atualizar</button>
          </form>
        </td>
      </tr>
    `;
  });

  if (tarefaTable === "") {
    return `<tr><td colspan="4">Nenhuma tarefa encontrada para a categoria "Outros"</td></tr>`;
  }

  return tarefaTable;
}

app.get("/", (req, res) => {
  const indexData = fs.readFileSync(indexHtml, "utf-8");
  const tabela = gerarTabelaTarefas();
  const html = indexData.replace("{{tarefaTable}}", tabela);
  res.send(html);
});

app.get("/mostrar-tarefa/:nome", (req, res) => {
  const nome = req.params.nome;

  let tarefaEncontrada = buscarTarefaPorNome(nome);

  if (tarefaEncontrada) {
    const tarefaEncontradaPath = path.join(__dirname, "/html/tarefa.html");
    const tarefaEncontradaData = fs.readFileSync(tarefaEncontradaPath, "utf-8");
    const htmlTarefaEncontrada = tarefaEncontradaData.replace(
      "{{tarefaEncontrada}}",
      `
      <div class="card">
        <div class="card-header">
          <strong>${tarefaEncontrada.nomeTarefa}</strong>
        </div>
        <div class="card-body">
          <h5 class="card-title"><strong>Descrição: </strong> ${tarefaEncontrada.descricaoTarefa}</h5>
          <h5 class="card-title "><strong>Disciplina: </strong> ${tarefaEncontrada.disciplinaTarefa}</h5>
        </div>
      </div>`
    );
    res.send(htmlTarefaEncontrada);
  } else {
    console.log("Não foi possivel acessar");
  }
});

app.get("/adicionar", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/adicionar.html"));
});

app.post("/adicionar", (req, res) => {
  const {
    nomeTarefa,
    descricaoTarefa,
    disciplinaTarefa,
    disciplinaTarefaEscrita,
  } = req.body;

  if (
    tarefas.find(
      (tarefa) => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase
    )
  ) {
    console.log("Não foi possivel adicionar essa nova tarefa");
  }

  if (disciplinaTarefa === "Outros") {
    if (disciplinaTarefaEscrita) {
      novaTarefa = {
        nomeTarefa: nomeTarefa,
        descricaoTarefa: descricaoTarefa,
        disciplinaTarefa: disciplinaTarefaEscrita,
      };
    } else {
      novaTarefa = {
        nomeTarefa: nomeTarefa,
        descricaoTarefa: descricaoTarefa,
        disciplinaTarefa: "Outros",
      };
    }
  } else {
    novaTarefa = {
      nomeTarefa: nomeTarefa,
      descricaoTarefa: descricaoTarefa,
      disciplinaTarefa: disciplinaTarefa,
    };
  }

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

app.get("/remover-page", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/remover.html"));
});

app.post("/remover", (req, res) => {
  const nomeTarefaRemover = req.body.nomeTarefaRemover;

  const tarefaIndex = tarefas.findIndex(
    (tarefa) =>
      tarefa.nomeTarefa &&
      tarefa.nomeTarefa.toLowerCase() === nomeTarefaRemover.toLowerCase()
  );

  if (tarefaIndex < 0) {
    console.log("Não foi possivel achar a tarefa");
  } else {
    tarefas.splice(tarefaIndex, 1);
    salvarDados();
  }

  res.redirect("/");
});

app.get("/atualizar", (req, res) => {
  const index = parseInt(req.query.index);

  if (index < 0) {
    console.log("Não foi possivel fazer isso");
    return;
  }

  const tarefa = tarefas[index];

  let atualizarHtml = fs.readFileSync(
    path.join(__dirname, "/html/atualizar.html"),
    "utf-8"
  );

  atualizarHtml = atualizarHtml.replace(
    'value=""',
    `value="${tarefas[index].nomeTarefa}"`
  );

  res.send(atualizarHtml);
});

app.get("/atualizar-page", (req, res) => {
  res.sendFile(path.join(__dirname, "/html/atualizar.html"));
});

app.post("/atualizar", (req, res) => {
  const {
    nomeTarefa,
    novaDescricaoTarefa,
    novaDisciplinaTarefa,
    disciplinaTarefaEscrita,
  } = req.body;

  const tarefaIndex = tarefas.findIndex(
    tarefa => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase()
  );

  if (tarefaIndex < 0) {
    console.log("tarefa não encontradas");
  }
  
  tarefas[tarefaIndex].descricaoTarefa = novaDescricaoTarefa;

  if (novaDisciplinaTarefa === "Outros") {
    if (disciplinaTarefaEscrita) {
      tarefas[tarefaIndex].disciplinaTarefa = disciplinaTarefaEscrita;
    } else {
      tarefas[tarefaIndex].disciplinaTarefa = "Outros";
    }
  } else if (novaDisciplinaTarefa !== "Outros") {
    tarefas[tarefaIndex].disciplinaTarefa = novaDisciplinaTarefa;
  }

  salvarDados();

  res.redirect("/");
});

app.post("/filtrar", (req, res) => {
  const escolha = req.body.escolha;

  if (escolha === "Todas") {
    const indexData = fs.readFileSync(indexHtml, "utf-8");
    const tabela = gerarTabelaTarefas();
    const html = indexData.replace("{{tarefaTable}}", tabela);
    res.send(html);
    return;
  } else if (escolha === "Outros") {
    const indexData = fs.readFileSync(indexHtml, "utf-8");
    const tabela = buscarTarefaPorCategoriaOutros();
    const html = indexData.replace("{{tarefaTable}}", tabela);
    res.send(html);
    return;
  }

  const tabela = buscarTarefaPorCategoria(escolha);
  const html = fs
    .readFileSync(indexHtml, "utf-8")
    .replace("{{tarefaTable}}", tabela);
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Servidor hosteando no http://localhost:${PORT}/`);
});
