import React from 'react'

type Props = {}

const Form = (props: Props) => {
  return (
    <form action='' 
    className='bg-gray-800 text-gray-300 flex flex-col gap-4 items-center mt-20 mx-60 rounded-2xl p-8'>
        <label htmlFor="name">name</label>
        <input type="text" id="name" name="name" className='rounded-xl hover:bg-gray-700'/>

        <label htmlFor="email">email</label>
        <input type="email" id="email" name="email" className='rounded-xl hover:bg-gray-700'/>

        <label htmlFor="phone">phone</label>
        <input type="tel" id="phone" name="phone" className='rounded-xl hover:bg-gray-700'/>

        <button
        type='submit'
        className='bg-gray-700 hover:bg-gray-600 font-bold py-1 px-2 rounded-xl'>
            submit
        </button>
    </form>
  )
}

export default Form