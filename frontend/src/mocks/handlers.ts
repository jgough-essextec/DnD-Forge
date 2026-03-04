import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/characters/', () => {
    return HttpResponse.json([])
  }),
  http.get('/api/races/', () => {
    return HttpResponse.json([])
  }),
  http.get('/api/classes/', () => {
    return HttpResponse.json([])
  }),
]
