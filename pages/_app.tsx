import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Head from 'next/head';
import { config } from '@fortawesome/fontawesome-svg-core' // removes styles from the icons that makes them too large
import '@fortawesome/fontawesome-svg-core/styles.css'
import { Outfit } from 'next/font/google'
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit'
})

config.autoAddCss = false // this rule overwrites our Tailwind.

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel='icon' href='favicon.png' />
      </Head>
      <UserProvider>
        <main className={`${outfit.variable} font-body`}>
          <Component {...pageProps} />
        </main>
      </UserProvider>
    </>
  )
}
