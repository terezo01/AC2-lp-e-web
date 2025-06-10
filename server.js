const fs = require('fs')
const path = require('path')
const express = require('express')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const PORT = 3000

const tarefasPath = path.join(__dirname, "tarefas-escola.json")
const tarefasData = fs.readFileSync(tarefasPath, 'utf-8')
const tarefas = JSON.parse(tarefasData)

const indexHtml = path.join(__dirname, "/html/index.html")

function salvarDados() {
    fs.writeFileSync(tarefasData, JSON.stringify(tarefas, null, 2))

    tarefas.forEach(tarefa, index=>{
        
        tarefaTable +=`
        <tr>
            <td>${tarefa.nomeTarefa}</td>
            <td>${tarefa.descricaoTarefa}</td>
            <td>${tarefa.disciplinaTarefa}</td>
            <td>${index}</td> //input e nele vai ter o nome da tarefa de id para conseguir excluir dps mais facil
        </tr>
        `;
    
        const indexData = fs.readFileSync(indexHtml, 'utf-8');
        const html = indexData.replace('{{tarefaTable}}', tarefaTable);
        res.send(html);
    })


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

        alterarHtml.nomeTarefa.value(tarefas[tarefaIndex].nomeTarefa)
        alterarHtml.novaDescricaoTarefa.value(tarefas[tarefaIndex].descricaoTarefa)
        alterarHtml.novaDisciplinaTarefa.value(tarefas[tarefaIndex].disciplinaTarefa)

        res.send(alterarHtml)
    }
})

app.post("/alterar", (req, res)=>{
    const {nomeTarefa, novaDescricaoTarefa, novaDisciplinaTarefa} = req.body

    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.nomeTarefa.toLowerCase() === nomeTarefa.toLowerCase());

    if(tarefaIndex === -1){
        posPesquisa(res, "Carros não encontrados")
        return
    }

    tarefas[tarefaIndex].descricaoTarefa = novaDescricaoTarefa
    tarefas[tarefaIndex].disciplinaTarefa = novaDisciplinaTarefa

    salvarDados();

})



app.listen(PORT, () =>{
    console.log(`Servidor hosteando no http://localhost:${PORT}/`);
})