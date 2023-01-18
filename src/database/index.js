const mongoose = require('mongoose')

//pra acabar com o erro "DeprecationWarning: Mongoose: the `strictQuery`"
mongoose.set("strictQuery", true)

mongoose.connect('mongodb://localhost:27017/myFirstDatabase?retryWrites=true&w=majority')
.then(()=>{console.log("banco de dados conectado")})

mongoose.Promise = global.Promise

module.exports = mongoose; 