import { useMutation } from "@tanstack/react-query";

export default function createClientQueryOptions() {
    const mutation = useMutation({
        mutationFn: (client: Client) => createClient(client)
    })


}