import { Inter } from 'next/font/google'
import SignIn from '../components/SignIn'
import { getSession } from '@auth0/nextjs-auth0'
import { GetServerSidePropsContext } from 'next'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  return (
    <main className={`${inter.className}`}>
      <SignIn />
    </main>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => { // needs to be named such because NextJS things. Can also ONLY be used in NextJS PAGE components.
  const session = await getSession(ctx.req, ctx.res)

  if(!!session) {
    return {
      redirect: {
        destination: '/chat'
      }
    }
  }
  return {
    props: {}
  }
}
