import React from 'react'
import Link from "next/link";
import { Suspense } from "react";
import Loading from '../_components/Loading';
import InputForm from './_components/InputForm';
import { FaArrowLeft } from "react-icons/fa";

const loginPage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="w-full items-center mx-auto max-w-lg justify-center flex flex-col">
        <div className="py-5 gap-2 flex flex-col ">
         <Link
            href="/"
            className="my-12 group flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
            <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="ml-2 font-medium">Kembali</span>
          </Link>
          <h1 className="sm:text-3xl text-2xl font-bold ">
            <span className="bg-black dark:bg-wihte text-white dark:text-white px-2 rounded-lg">
              MyPorto
            </span>
            <span className="dark:text-white"> Masuk ke akun.</span>
          </h1>
        </div>
        <InputForm />
        <p className="mt-5 text-sm dark:text-white">Belum punya akun? <Link className="font-semibold underline" href="/register">Daftar gratis</Link></p>
      </div>
      </div>
    </Suspense>
  );
}

export default loginPage
