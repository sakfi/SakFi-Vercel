import Layout from '../components/Layout'
import Head from 'next/head'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import siteConfig from '../../config/site.config'
import Navbar from '../components/Navbar'
import FileListing from '../components/FileListing'
import Footer from '../components/Footer'
import Breadcrumb from '../components/Breadcrumb'
import SwitchLayout from '../components/SwitchLayout'

export default function LegacyHome() {
  return (
    <Layout>
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
        <Head>
          <title>{siteConfig.title}</title>
        </Head>

        <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
          <Navbar />
          <div className="mx-auto w-full max-w-5xl py-4 sm:p-4">
            <nav className="mb-4 flex items-center justify-between px-4 sm:px-0 sm:pl-1">
              <Breadcrumb />
              <SwitchLayout />
            </nav>
            <FileListing />
          </div>
        </main>

        <Footer />
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
