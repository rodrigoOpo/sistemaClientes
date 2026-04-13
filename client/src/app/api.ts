import { Client, clientSchema } from "@/validations/clientSchema"

export const createClient = async (client: Omit<Client, "_id">) => {
    const options = {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(client)
    }

    const res = await fetch('http://localhost:8000/clients', options)
    const data = await res.json()
    return clientSchema.parse(data)

}