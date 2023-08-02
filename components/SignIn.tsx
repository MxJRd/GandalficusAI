import { useUser } from "@auth0/nextjs-auth0/client"
import CommonButton from "./common/CommonButton"

export default function SignIn() {
  const { user, isLoading, error } = useUser()
  if(isLoading) return <div>Loading...</div>
  if(error) return <div>{error.message}</div>

  return (
      <div>
        { !!user && (
          <CommonButton border='none'>
            <a href={'/api/auth/logout'}>Logout</a>
          </CommonButton>
          )
        }
        { !user && (
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
  )
}
