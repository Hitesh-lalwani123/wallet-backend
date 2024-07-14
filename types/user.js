const z = require('zod')

const signupSchema = z.object({
    username: z.string().email(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string()
})

module.exports = {
    signupSchema
}