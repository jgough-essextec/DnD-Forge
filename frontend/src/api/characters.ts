import { api } from '@/lib/api'
import type { Character, CharacterSummary, CreateCharacterData } from '@/types/character'

/**
 * Fetch all characters for the current user (gallery view).
 */
export async function getCharacters(): Promise<CharacterSummary[]> {
  const response = await api.get<CharacterSummary[]>('/characters/')
  return response.data
}

/**
 * Fetch a single character by ID (full detail).
 */
export async function getCharacter(id: string): Promise<Character> {
  const response = await api.get<Character>(`/characters/${id}/`)
  return response.data
}

/**
 * Create a new character.
 */
export async function createCharacter(data: CreateCharacterData): Promise<Character> {
  const response = await api.post<Character>('/characters/', data)
  return response.data
}

/**
 * Partially update an existing character.
 */
export async function updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
  const response = await api.patch<Character>(`/characters/${id}/`, data)
  return response.data
}

/**
 * Delete a character by ID.
 */
export async function deleteCharacter(id: string): Promise<void> {
  await api.delete(`/characters/${id}/`)
}

/**
 * Export a character as a downloadable JSON file.
 * Triggers a browser download of the JSON file.
 */
export async function exportCharacter(id: string): Promise<void> {
  const response = await api.get(`/characters/${id}/export/`, {
    responseType: 'blob',
  })

  // Extract filename from Content-Disposition header if available
  const disposition = response.headers['content-disposition'] as string | undefined
  let filename = 'character.json'
  if (disposition) {
    const match = disposition.match(/filename="?([^";\n]+)"?/)
    if (match) {
      filename = match[1]
    }
  }

  // Create a blob URL and trigger browser download
  const blob = new Blob([response.data as BlobPart], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export a character as a downloadable PDF file.
 * Calls the server-side WeasyPrint endpoint and returns the PDF blob.
 */
export async function exportCharacterPDF(id: string): Promise<Blob> {
  const response = await api.get(`/characters/${id}/pdf/`, {
    responseType: 'blob',
  })

  return new Blob([response.data as BlobPart], { type: 'application/pdf' })
}

/**
 * Extract the filename from a Content-Disposition header.
 * Falls back to 'character_sheet.pdf' if the header is missing or unparseable.
 */
export function extractPDFFilename(contentDisposition: string | undefined): string {
  if (!contentDisposition) return 'character_sheet.pdf'
  const match = contentDisposition.match(/filename="?([^";\n]+)"?/)
  return match ? match[1] : 'character_sheet.pdf'
}

/** Response shape for the import endpoint. */
export interface ImportCharacterResponse {
  character: Character
  warnings: string[]
}

/**
 * Import a character from a JSON file.
 * Sends as multipart/form-data with the file field.
 */
export async function importCharacter(file: File): Promise<ImportCharacterResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<ImportCharacterResponse>('/characters/import/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/** Response shape for the share endpoint. */
export interface ShareCharacterResponse {
  token: string
  url: string
  expires_at: string
}

/**
 * Generate or retrieve a share token for a character.
 */
export async function shareCharacter(id: string): Promise<ShareCharacterResponse> {
  const response = await api.get<ShareCharacterResponse>(`/characters/${id}/share/`)
  return response.data
}

/** The shape of shared character data returned by the public endpoint. */
export interface SharedCharacterData {
  formatVersion: string
  appVersion: string
  exportedAt: string
  character: Record<string, unknown>
}

/**
 * Fetch a shared character by its share token. Public endpoint, no auth required.
 */
export async function getSharedCharacter(token: string): Promise<SharedCharacterData> {
  const response = await api.get<SharedCharacterData>(`/shared/${token}/`)
  return response.data
}
