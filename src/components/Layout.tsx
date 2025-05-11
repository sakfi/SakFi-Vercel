
import Head from 'next/head'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <Head>
        <title>DaRk World</title>
        <meta name="description" content="Private file index and media sharing site" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {children}
    </div>
  )
}
