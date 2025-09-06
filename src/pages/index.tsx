import Layout from '../components/Layout'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type Folder = {
  name: string
  icon: string
  size: string
  updated: string
  href: string
}

// Convert size in bytes → human readable string
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

// Parse size back into number (for sorting)
function parseSize(size: string) {
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = size.match(/([\d.]+)\s?(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  const [_, num, unit] = match
  return parseFloat(num) * (units[unit.toUpperCase()] || 1)
}

// Pick icons based on folder name
function getIconForFolder(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('movie')) return '🎬'
  if (lower.includes('series')) return '📺'
  if (lower.includes('tutorial')) return '📖'
  if (lower.includes('book') || lower.includes('pdf')) return '📚'
  if (lower.includes('bba')) return '🎓'
  if (lower.includes('pgd')) return '🧾'
  return '📁'
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch live data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api?path=/') // adjust if your API differs
        const data = await res.json()

        const mapped: Folder[] = data.folder.value
          .filter((item: any) => item.folder) // only folders
          .map((item: any) => ({
            name: item.name,
            icon: getIconForFolder(item.name),
            size: formatSize(item.size),
            updated: item.lastModifiedDateTime
              ? new Date(item.lastModifiedDateTime).toISOString().slice(0, 10)
              : '',
            href: '/' + encodeURIComponent(item.name),
          }))

        setFolders(mapped)
      } catch (e) {
        console.error('Failed to load folder data', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Filter + sort folders
  const filteredFolders = useMemo(() => {
    let result = folders.filter(folder =>
      folder.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )

    result.sort((a, b) => {
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

    return result
  }, [folders, debouncedSearch, sortBy, sortOrder])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
        <Head>
          <title>DaRk World</title>
          <meta
            name="description"
            content="Private media library for movies, tutorials, and PDF books."
          />
        </Head>

        {/* Header */}
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

        {/* Search + sort controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <input
            type="text"
            placeholder="Search folders..."
            className="w-full sm:w-1/2 rounded-md bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="flex space-x-2">
            {['name', 'size', 'updated'].map(key => (
              <button
                key={key}
                onClick={() => {
                  setSortBy(key as 'name' | 'size' | 'updated')
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

        {/* Folder Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-gray-400">Loading folders…</p>
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
                {filteredFolders.map(folder => (
                  <tr
                    key={folder.name}
                    className="border-b border-gray-800 hover:bg-gray-800 transition duration-300 ease-in-out"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={folder.href}
                        className="flex items-center space-x-2 font-medium text-white hover:underline"
                      >
                        <span className="text-xl">{folder.icon}</span>
                        <span className="text-base sm:text-lg">{folder.name}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{folder.updated}</td>
                    <td className="px-4 py-3 text-gray-400">{folder.size}</td>
                    <td className="px-4 py-3 space-x-4 text-lg text-gray-400">
                      <a href={folder.href} className="inline-block p-2" title="Copy Link">
                        🔗
                      </a>
                      <a href={folder.href} className="inline-block p-2" title="Download">
                        ⬇️
                      </a>
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
