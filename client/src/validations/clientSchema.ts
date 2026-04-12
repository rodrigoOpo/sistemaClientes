import { z } from 'zod'

export const clientSchema = z.object({
    name: z.string(),
    email: z.email({
        message: "Please enter a valid email"
    }),
    phone: z.string()
})