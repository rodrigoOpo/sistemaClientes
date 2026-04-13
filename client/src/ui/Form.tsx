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
    className='bg-gray-800 text-gray-300 flex flex-col gap-4 items-center mt-20 mx-60 rounded-2xl p-8'>
        <label htmlFor="name">name</label>
        <input type="text" id="name" className='rounded-xl hover:bg-gray-700'
        {...register('name')}/>

        <label htmlFor="email">email</label>
        <input type="email" id="email" className='rounded-xl hover:bg-gray-700'
        {...register('email')}/>

        <label htmlFor="phone">phone</label>
        <input type="tel" id="phone" className='rounded-xl hover:bg-gray-700'
        {...register('phone')}/>

        <button
        type='submit'
        className='bg-gray-700 hover:bg-gray-600 font-bold py-1 px-2 rounded-xl'>
            submit
        </button>
    </form>
    </>
  )
}

export default Form