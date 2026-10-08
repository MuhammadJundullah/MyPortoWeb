import React from 'react'
import { Suspense } from "react";
import Loading from '../_components/Loading';
import InputForm from './_components/InputForm'

const loginPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full items-center mx-auto max-w-lg justify-center flex flex-col">
        <div className="py-5 gap-2 flex flex-col ">
          <h1 className="sm:text-3xl text-2xl font-bold ">
            <span className="bg-black dark:bg-wihte text-white dark:text-white px-2 rounded-lg">
              MyPorto
            </span>
            <span className="dark:text-white"> Masuk ke akun.</span>
          </h1>
        </div>
        <InputForm />
        <p className="mt-5 text-sm dark:text-white">Belum punya akun? <a className="font-semibold underline" href="/register">Daftar gratis</a></p>
      </div>
    </Suspense>
  );
}

export default loginPage
