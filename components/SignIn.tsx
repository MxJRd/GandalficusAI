import { useUser } from "@auth0/nextjs-auth0/client"
import CommonButton from "./common/CommonButton"
import Head from "next/head"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHatWizard } from "@fortawesome/free-solid-svg-icons"

export default function SignIn() {
  const { user, isLoading, error } = useUser()
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>

  return (
    <section className='flex min-h-screen flex-col items-center justify-center p-24 bg-gray-800 text-white'>
      <Head>
        <title>Gandalficus -- Login or Signup</title>
      </Head>
        <div>
          <FontAwesomeIcon icon={faHatWizard} className='text-6xl text-blue-500 mb-3' />
        </div>
        <h1 className='text-4xl font-bold'>
          Welcome to Gandalficus
        </h1>
        <p className='text-lg mt-2'>Log in with your account to continue.</p>
        <div className='mt-4 flex justify-center gap-4'>
        {!user && (
          <>
            <CommonButton border='none'>
              <a href='/api/auth/login' className=''>Login</a>
            </CommonButton>
            <CommonButton border='none'>
              <a href='/api/auth/signup' className=''>Signup</a>
            </CommonButton>
          </>
        )
        }
      </div>
    </section>
  )
}
