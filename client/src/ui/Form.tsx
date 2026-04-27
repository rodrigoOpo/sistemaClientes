"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clientSchema } from "@/validations/clientSchema"
import { useMutation } from "@tanstack/react-query"
import { createClient } from "@/app/api"
import { Client } from "@/validations/clientSchema"

type Props = {}

const Form = (props: Props) => {

    const {register, handleSubmit} = useForm({
        resolver: zodResolver(clientSchema)
    })

    const {mutate} = useMutation({
      mutationFn: (client: Client) => createClient(client)
    })

    const onSubmit = (client: Client) => {
      mutate(client)
    }

  return (
    <>
    <form
    onSubmit={handleSubmit(onSubmit)}
    className='bg-black text-white border rounded-2xl border-gray-500 flex flex-col gap-4 items-center mt-20 mx-10 py-20 md:mt-20 md:mx-90 md:p-8'>
        <input type="text" id="name" className='px-5 py-1 rounded-xl hover:border hover:border-mauve-500 bg-mauve-950'
        placeholder="name"
        {...register('name')}/>


        <input type="email" id="email" className='px-5 py-1 rounded-xl hover:border hover:border-mauve-500 bg-mauve-950'
        placeholder="email"
        {...register('email')}/>


        <input type="tel" id="phone" className='px-5 py-1 rounded-xl hover:border hover:border-mauve-500 bg-mauve-950'
        placeholder="phone number"
        {...register('phone')}/>

        <button
        type='submit'
        className='bg-black border border-mauve-600 rounded-2xl px-3 py-1 hover:bg-mauve-900'>
            submit
        </button>
    </form>
    </>
  )
}

export default Form