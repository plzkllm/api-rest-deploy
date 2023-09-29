const express = require('express')  // require -> commonJS
const movies = require('./movies.json')
const crypto = require('node:crypto')
const z= require('zod')
const { validateMovie,validatePartialMovie } = require('./schemas/movies')
const cors = require('cors')
const ACEPTED_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:1234',
    'https://movies.com',
    'https://midu.dev'
]
const app = express() //creamos server
app.use(express.json())
app.use(cors({
    origin: (origin,callback) => {
        

        if(ACEPTED_ORIGINS.includes(origin)){
            return(callback(null,true))
        }

        if(!origin){
            return(callback(null,true))
        }

        return callback(new Error('Not allowed by CORS'))
    }
}
))

app.disable('x-powered-by') //deshabilitar 



app.get('/',(req,res)=>{
    // leer el query param de format
    // const format=req.query.format
    // if(format==='html')
    res.json({mensage:'Hola mundo'})
})
// Todos los recursos que sean movies se identifican con /movies
app.get('/movies', (req,res)=>{
    const origin = req.header('origin')
    // el navegador no envia el origin cuando
    // la peticion es del mismo origin, osea de la misma pagina

    if(ACEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }
    // el * acepta todo, pero se puede poenr la url especifica
    // de la que se acepta la peticion como
    const {genre} =req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g=>g.toLowerCase()===genre.toLowerCase()))
       return res.json(filteredMovies) 
    //    previamente se uso el metodo .includes()
    }
    // recuperamos desde la query, desde la request
    //podemos acceder a la query
    // en lquery tenemos un objeto donde estan tranformados
    // los query-params en un objeto
    res.json(movies)
})

app.get('/movies/:id',(req,res)=>{
    // una de las magias mas importantes
    // segmento dinamico, parametros de la url
    // path-to-regexp, significa en el path se puede poner regexp
    // peros son muy complicados, convierte el path en expresiones
    // regulares
    //se puede colocar expreciones como ab+cd, que indica que puede o no estar
    // o ab?cd -> abcd, acd
    // ab(cd)?e->abe, abcde 
    // las ids pueden cambiar, con la barra : le indicamos que le pasaremos
    // id
    const{id}=req.params
    const movie = movies.find(movie => movie.id=id)
    if (movie) return res.json(movie)

    res.status(404).json({message: 'Movie not found'})
    

})

app.post('/movies',(req, res) => {
   const result = validateMovie(req.body)

    // const {title, genre, year, director, duration, rate, poster
    // } = req.body
    // result.sucess ! negado
    if(result.error){
        console.log(result.error)
        return res.status(400).json({error : JSON.parse(result.error.message)})
    }
    // 400 vs 422, ambos son validos
    // if(!title || !genre || !year || !director){
    //     return  res.status(400).send('Faltan datos para crear el recurso');
    // }


    //en base de datos
    const newMovie={
        id: crypto.randomUUID(), //uuidv4
        ...result.data // no es lo mismo que req.body, el req esta sin validar
        // este result ya esta validado
        // title,
        // genre,
        // director,
        // year,
        // duration,
        // rate: rate ?? 0,
        // poster
        
        // ...req.body , peligroso 
    }
    // Esto no seria REST, porque estamos guardando el estado
    // de la app en memoria
    // se debe validar los datos


    movies.push(newMovie)

    res.status(201).json(newMovie) //actualizar la cache del cliente

})

app.delete('/movies/:id',(req,res)=>{
    const origin = req.header('origin')
    if(ACEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
    }

    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id ===id)

    if(movieIndex === -1){
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieIndex,1)

    return res.json({message: 'Movie deleted'})
})

app.patch('/movies/:id',(req,res)=>{

    
    const result = validatePartialMovie(req.body)
    if(!result.success) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const {id}= req.params
    const movieIndex = movies.findIndex(movie=>movie.id===id)
    
    if(movieIndex===-1) return res.status(404).json({message: "Movie not found"})
    
    const updateMovie = {...movies[movieIndex],...result.data}

    return res.json(updateMovie)

})

app.options('/movies/:id',(req,res)=>{
    const origin = req.header('origin')
    if(ACEPTED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE')
        
    }
    res.send(200)
})

const PORT = process.env.PORT ?? 1234

// las variables de entorno siempre son en mayuscula

// el despliegue usara la variable de entorno del proceso

app.listen(PORT, ()=>{
    console.log(`server listening on port http://localhost:${PORT}`)
})

// un endpoint es un path donde se tiene un recurso

// la notacion que se usa con : se transforma en regext, el problema
// puede ser hacer una mala regext, mejor usar path-yo-regetx