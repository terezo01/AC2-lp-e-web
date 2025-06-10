const fs = require('fs')
const path = require('path')
const express = require('express')
const { json } = require('body-parser')
const app = express()

const PORT = 3000

const tarefasPath = path.join(__dirname, "tarefas-escola.json")
const tarefasData = fs.readFileSync(tarefasPath, 'utf-8')
const tarefas = json.parse(tarefasData)

const indexHtml = fs.readFileSync(path.join(__dirname, "/html/index.html"))

function salvarDados() {
    fs.writeFileSync(tarefasData, JSON.stringify(tarefas, null, 2))
}

app.get("/", (req, res) => {
    res.sendFile(indexHtml)
})

app.post("/adicionar-tarefa", (req, res) => {
    const { nome, desc, disciplina } = req.body

    if (tarefas.find(tarefa => tarefa.nomeTarefa.toLowerCase() === nome.toLowerCase)) {
        alert("Não foi possivel adicionar essa nova tarefa")
        return
    }

    novaTarefa = { nomeTarefa: nome, descricaoTarefa: desc, disciplinaTarefa: disciplina }

    tarefas.push(novaTarefa)
    salvarDados()

    res.sendFile(indexHtml)

})

app.post("/acoes", (req, res) => {
    const { nomeTarefa, remover, alterar } = req.body

    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase());

    if (remover) {

        if (tarefaIndex === -1) {
            alert("Tarefa não pode ser deletada")
            return;
        }
        else {
            tarefas.splice(tarefaIndex, 1);
            salvarDados();
        }
    }
    else if (alterar) {
        const alterarHtml = fs.readFileSync(path.join(__dirname, "/html/alterar.html"))

        alterarHtml.nome.value(tarefas[tarefaIndex].nomeTarefa)
        alterarHtml.desc.value(tarefas[tarefaIndex].descricaoTarefa)
        alterarHtml.disciplina.value(tarefas[tarefaIndex].disciplinaTarefa)

        res.send(alterarHtml)


    }
})