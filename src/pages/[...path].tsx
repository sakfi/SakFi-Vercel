import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function ModernFolderPage() {
  const router = useRouter()
  const parts = Array.isArray(router.query.path) ? router.query.path : []
  const currentPath = '/' + (parts?.map(p => decodeURIComponent(p)).join('/') || '')

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 sm:px-6 lg:px-8 py-6">
        <Head>
          <title>DaRk World – {currentPath || '/'}</title>
        </Head>

        {/* Header (same look as home) */}
        <div className="relative mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="sm:absolute sm:left-0">
            <Image loading="lazy" src="/icons/64.png" alt="Logo" width={40} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">DaRk World</h1>
          <div className="sm:absolute sm:right-0">
            <Link href="/legacy" legacyBehavior passHref>
              <a className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 transition">
                <Image src="/icons/64.png" alt="Legacy" width={20} height={20} />
                <span>Legacy View</span>
              </a>
            </Link>
          </div>
        </div>

        {/* Placeholder content */}
        <div className="rounded-xl border border-gray-800 bg-black/30 p-6">
          <p className="text-lg font-semibold">Modern folder page (Step 1)</p>
          <p className="mt-2 text-gray-300">
            Current path: <span className="font-mono">{currentPath || '/'}</span>
          </p>
          <p className="mt-4 text-gray-400">
            If you see this after clicking a folder, routing is correct. Next we’ll add the live listing here.
          </p>
          <div className="mt-6">
            <Link href="/" className="underline text-blue-400 hover:text-blue-300">← Back to Home</Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
