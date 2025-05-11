import Layout from '../components/Layout'
import Image from 'next/image'
import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'

type Folder = {
  name: string
  icon: string
  size: string
  updated: string
  href: string
}

function parseSize(size: string) {
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
  const match = size.match(/([\d.]+)\s?(B|KB|MB|GB|TB)/i)
  if (!match) return 0
  const [_, num, unit] = match
  return parseFloat(num) * (units[unit.toUpperCase()] || 1)
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updated'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const folders: Folder[] = useMemo(() => [
    { name: 'BBA DOCS', icon: '🎓', size: '1.24 GB', updated: '2025-03-11', href: '/BBA DOCS' },
    { name: 'Latest Movies (Hall Print)', icon: '🎬', size: '49.9 GB', updated: '2025-01-11', href: '/Latest Movies (Hall Print)' },
    { name: 'Movies', icon: '🎥', size: '740 GB', updated: '2024-12-02', href: '/Movies' },
    { name: 'PDF Books', icon: '📚', size: '85.8 GB', updated: '2025-02-03', href: '/PDF Books' },
    { name: 'PGD-GB Batch 2', icon: '🧾', size: '496 MB', updated: '2024-12-10', href: '/PGD-GB Batch 2' },
    { name: 'Series', icon: '📺', size: '2.86 TB', updated: '2024-12-02', href: '/Series' },
    { name: 'Tutorials', icon: '📖', size: '184 GB', updated: '2025-01-06', href: '/Tutorials' },
  ], [])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6 animate-fade-in">
        <Head>
          <title>DaRk World</title>
          <meta name="description" content="Private media library for movies, tutorials, and PDF books." />
        </Head>

        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute left-0">
            <Image loading="lazy" src="/icons/64.png" alt="Logo" width={40} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-white">DaRk World</h1>
          <div className="absolute right-0">
            <a
              href="/legacy"
              className="inline-flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500 transition"
            >
              <Image src="/icons/64.png" alt="Legacy" width={20} height={20} />
              <span>Legacy View</span>
            </a>
          </div>
        </div>

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
                className={`px-3 py-1 rounded ${
                  sortBy === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                } hover:bg-blue-500`}
              >
                Sort by {key}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
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
                    <a href={folder.href} className="flex items-center space-x-2 font-medium text-white hover:underline">
                      <span className="text-xl">{folder.icon}</span>
                      <span>{folder.name}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{folder.updated}</td>
                  <td className="px-4 py-3 text-gray-400">{folder.size}</td>
                  <td className="px-4 py-3 space-x-4 text-lg text-gray-400">
                    <a href={folder.href}><span title="Copy Link">🔗</span></a>
                    <a href={folder.href}><span title="Download">⬇️</span></a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
