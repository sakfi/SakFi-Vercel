// src/pages/[...path].tsx

import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useEffect, useMemo, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

type Item = {
  name: string
  icon: string
  size: string
  updated: string
  href: string
  isFolder: boolean
}

/* ---------- helpers ---------- */

// bytes → human readable
function formatSize(bytes: number): string {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let num = bytes
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024
    i++
  }
  return `${num.toFixed(2)} ${units[i]}`
}

// "12.3 GB" → number (for sorting)
function parseSize(size: string) {
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = size.match(/([\d.]+)\s?(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  const [, num, unit] = match
  return parseFloat(num) * (units[unit.toUpperCase() as keyof typeof units] || 1)
}

// pick icons
function getIcon(name: string, isFolder: boolean): string {
  const lower = name.toLowerCase()
  if (isFolder) {
    if (lower.includes('movie')) return '🎬'
    if (lower.includes('series')) return '📺'
    if (lower.includes('tutorial')) return '📖'
    if (lower.includes('book') || lower.includes('pdf')) return '📚'
    return '📁'
  } else {
    if (lower.endsWith('.mp4') || lower.endsWith('.mkv') || lower.endsWith('.avi')) return '🎞️'
    if (lower.endsWith('.mp3') || lower.endsWith('.flac') || lower.endsWith('.wav')) return '🎵'
    if (lower.endsWith('.pdf')) return '📄'
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z')) return '🗜️'
    return '📄'
  }
}

/* ---------- page component ---------- */

export default function ModernFolderPage() {
  const router = useRouter()
  const parts = Array.isArray(router.query.path) ? router.query.path : []
  const currentPath = '/' + (parts?.map(p => decodeURIComponent(p)).join('/') || '')

  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // fetch live listing for this path
  useEffect(() => {
    if (!router.isReady) return
    async function fetchData() {
      try {
        const res = await fetch(`/api?path=${encodeURIComponent(currentPath)}`)
        const data = await res.json()

        // your API returns { folder: { value: [...] } }
        const raw = (data?.folder?.value ?? data?.value ?? []) as any[]

        const mapped: Item[] = raw.map(item => ({
          name: item.name,
          icon: getIcon(item.name, !!item.folder),
          size: item.size ? formatSize(item.size) : '—',
          updated: item.lastModifiedDateTime
            ? new Date(item.lastModifiedDateTime).toISOString().slice(0, 10)
            : '',
          href: `${currentPath}/${encodeURIComponent(item.name)}`,
          isFolder: !!item.folder,
        }))

        setItems(mapped)
      } catch (e) {
        console.error('Failed to load folder data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [router.isReady, currentPath])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  // filter + sort
  const filteredItems = useMemo(() => {
    const result = items
      .filter(it => it.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      .sort((a, b) => {
        let valA: number | string = a[sortBy]
        let valB: number | string = b[sortBy]
        if (sortBy === 'size') {
          valA = parseSize(a.size)
          valB = parseSize(b.size)
        } else if (sortBy === 'updated') {
          valA = new Date(a.updated).getTime()
          valB = new Date(b.updated).getTime()
        }
        return ((valA > valB ? 1 : -1) * (sortOrder === 'asc' ? 1 : -1))
      })

    // optional: folders first
    result.sort((a, b) => (a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1))
    return result
  }, [items, debouncedSearch, sortBy, sortOrder])

  // legacy link for same path
  const legacyHref = `/legacy${currentPath === '/' ? '' : currentPath}`

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 sm:px-6 lg:px-8 py-6">
        <Head>
          <title>DaRk World – {currentPath}</title>
        </Head>

        {/* header (matches modern home) */}
        <div className="relative mb-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
          <div className="sm:absolute sm:left-0">
            <Image loading="lazy" src="/icons/64.png" alt="Logo" width={40} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">DaRk World</h1>
          <div className="sm:absolute sm:right-0">
            <Link href={legacyHref} legacyBehavior passHref>
              <a className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 transition">
                <Image src="/icons/64.png" alt="Legacy" width={20} height={20} />
                <span>Legacy View</span>
              </a>
            </Link>
          </div>
        </div>

        {/* search + sort controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search items..."
            className="w-full sm:w-1/2 rounded-md bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex space-x-2">
            {(['name', 'size', 'updated'] as const).map(key => (
              <button
                key={key}
                onClick={() => {
                  setSortBy(key)
                  setSortOrder(o => (sortBy === key && o === 'asc' ? 'desc' : 'asc'))
                }}
                className={`px-4 py-2 min-w-[44px] text-sm sm:text-base rounded ${
                  sortBy === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                } hover:bg-blue-500`}
              >
                Sort by {key}
              </button>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-400">Loading items…</p>
          ) : (
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Last Modified</th>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.href} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="px-4 py-3">
                      <a
                        href={item.href}
                        className="flex items-center space-x-2 font-medium text-white hover:underline"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-base sm:text-lg">{item.name}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{item.updated}</td>
                    <td className="px-4 py-3 text-gray-400">{item.size}</td>
                    <td className="px-4 py-3 space-x-4 text-lg text-gray-400">
                      <a href={item.href} className="inline-block p-2" title="Copy Link">🔗</a>
                      {!item.isFolder && (
                        <a href={item.href} className="inline-block p-2" title="Download">⬇️</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}

/* ---------- i18n SSR (keeps your legacy setup happy) ---------- */
export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
