import { Client, clientSchema } from "@/validations/clientSchema"

export const createClient = async (client: Omit<Client, "_id">) => {
    const options = {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(client)
    }

    console.log("URL REAL:", 'https://sistemaclientes-7ulo.onrender.com/clients/');
    console.log("ENV:", process.env.NEXT_PUBLIC_API_URL);
    
    const res = await fetch('https://sistemaclientes-7ulo.onrender.com/clients/', options)
    const data = await res.json()
    return clientSchema.parse(data)

}