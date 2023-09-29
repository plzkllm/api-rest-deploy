const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required. '
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5.5),
    poster:z.string().url({
        message : 'Poster must be a valid URL'
    }),
    genre: z.array(
    z.enum(['Action','Crime','Adventure','Comedy','Drama','Fantasy','Horror','Thriller','Sci-Fi']), 
    {
    required_error: 'Movie genre is required',
    invalid_type_error:'Genre must be an array of enum genre'
    })
    // podria ser z.enum().array()

}
)

function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object)
    // el partial, hace que todos o cada uno, lo hace
    // opcional, asi que aprovecha en hacer la validacion
    // si esta, pero si no esta no hay problema
}

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}