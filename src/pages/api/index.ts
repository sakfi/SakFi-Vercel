import { posix as pathPosix } from 'path'

import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'
import { compareHashedToken } from '../../utils/protectedRouteHandler'
import { runCorsMiddleware } from './raw'

// Static tokens provided by the user
const staticAccessToken = "your_access_token_here"; // Replace with your actual access token

const basePath = pathPosix.resolve('/', siteConfig.baseDirectory)

/**
 * Encode the path of the file relative to the base directory
 *
 * @param path Relative path of the file to the base directory
 * @returns Absolute path of the file inside OneDrive
 */
export function encodePath(path: string): string {
  let encodedPath = pathPosix.join(basePath, path)
  if (encodedPath === '/' || encodedPath === '') {
    return ''
  }
  encodedPath = encodedPath.replace(/\/$/, '')
  return `:${encodeURIComponent(encodedPath)}`
}

/**
 * Fetch the access token from static tokens provided
 *
 * @returns Access token for OneDrive API
 */
export async function getAccessToken(): Promise<string> {
  console.log('Using static access token.')
  return staticAccessToken
}

/**
 * Match protected routes in site config to get path to required auth token
 * @param path Path cleaned in advance
 * @returns Path to required auth token. If not required, return empty string.
 */
export function getAuthTokenPath(path: string) {
  path = path.toLowerCase() + '/'
  const protectedRoutes = siteConfig.protectedRoutes as string[]
  let authTokenPath = ''
  for (let r of protectedRoutes) {
    if (typeof r !== 'string') continue
    r = r.toLowerCase().replace(/\/$/, '') + '/'
    if (path.startsWith(r)) {
      authTokenPath = `${r}.password`
      break
    }
  }
  return authTokenPath
}

/**
 * Handles protected route authentication
 */
export async function checkAuthRoute(
  cleanPath: string,
  accessToken: string,
  odTokenHeader: string
): Promise<{ code: 200 | 401 | 404 | 500; message: string }> {
  const authTokenPath = getAuthTokenPath(cleanPath)

  if (authTokenPath === '') {
    return { code: 200, message: '' }
  }

  try {
    const token = await axios.get(`${apiConfig.driveApi}/root${encodePath(authTokenPath)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: '@microsoft.graph.downloadUrl,file',
      },
    })

    const odProtectedToken = await axios.get(token.data['@microsoft.graph.downloadUrl'])

    if (
      !compareHashedToken({
        odTokenHeader: odTokenHeader,
        dotPassword: odProtectedToken.data.toString(),
      })
    ) {
      return { code: 401, message: 'Password required.' }
    }
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return { code: 404, message: "You didn't set a password." }
    } else {
      return { code: 500, message: 'Internal server error.' }
    }
  }

  return { code: 200, message: 'Authenticated.' }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    res.status(200).send('Tokens are static and cannot be updated dynamically.')
    return
  }

  const { path = '/', raw = false, next = '', sort = '' } = req.query

  res.setHeader('Cache-Control', apiConfig.cacheControlHeader)

  if (path === '[...path]') {
    res.status(400).json({ error: 'No path specified.' })
    return
  }
  if (typeof path !== 'string') {
    res.status(400).json({ error: 'Path query invalid.' })
    return
  }

  const cleanPath = pathPosix.resolve('/', pathPosix.normalize(path)).replace(/\/$/, '')

  if (typeof sort !== 'string') {
    res.status(400).json({ error: 'Sort query invalid.' })
    return
  }

  const accessToken = await getAccessToken()

  if (!accessToken) {
    res.status(403).json({ error: 'No access token.' })
    return
  }

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, req.headers['od-protected-token'] as string)
  if (code !== 200) {
    res.status(code).json({ error: message })
    return
  }

  if (message !== '') {
    res.setHeader('Cache-Control', 'no-cache')
  }

  const requestPath = encodePath(cleanPath)
  const requestUrl = `${apiConfig.driveApi}/root${requestPath}`
  const isRoot = requestPath === ''

  if (raw) {
    await runCorsMiddleware(req, res)
    res.setHeader('Cache-Control', 'no-cache')

    const { data } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: 'id,@microsoft.graph.downloadUrl',
      },
    })

    if ('@microsoft.graph.downloadUrl' in data) {
      res.redirect(data['@microsoft.graph.downloadUrl'])
    } else {
      res.status(404).json({ error: 'No download url found.' })
    }
    return
  }

  try {
    const { data: identityData } = await axios.get(requestUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        select: 'name,size,id,lastModifiedDateTime,folder,file,video,image',
      },
    })

    if ('folder' in identityData) {
      const { data: folderData } = await axios.get(`${requestUrl}${isRoot ? '' : ':'}/children`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ...{
            select: 'name,size,id,lastModifiedDateTime,folder,file,video,image',
            $top: siteConfig.maxItems,
          },
          ...(next ? { $skipToken: next } : {}),
          ...(sort ? { $orderby: sort } : {}),
        },
      })

      const nextPage = folderData['@odata.nextLink']
        ? folderData['@odata.nextLink'].match(/&\$skiptoken=(.+)/i)[1]
        : null

      if (nextPage) {
        res.status(200).json({ folder: folderData, next: nextPage })
      } else {
        res.status(200).json({ folder: folderData })
      }
      return
    }
    res.status(200).json({ file: identityData })
    return
  } catch (error: any) {
    res.status(error?.response?.code ?? 500).json({ error: error?.response?.data ?? 'Internal server error.' })
    return
  }
}
