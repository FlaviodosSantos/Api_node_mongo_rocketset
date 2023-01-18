const express = require('express')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

require('./controllers/authController')(app)
require('./controllers/projectController')(app)

app.get('/teste', (req, res)=>{
    res.status(200).send({message: "testando rota"})
    console.log("testando")
})

app.listen(3000, () => {
    console.log("servidor rodando na porta 3000")
})