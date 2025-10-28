"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

// Importar Leaflet dinamicamente para evitar erros de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Obra {
  id: string
  endereco: string
  endereco_obra?: string
  cidade_obra?: string
  estado_obra?: string
  codigo?: number
}

interface ObraLocationMapProps {
  obras: Obra[]
}

interface ObraLocation extends Obra {
  lat: number
  lng: number
}

export function ObraLocationMap({ obras }: ObraLocationMapProps) {
  const [obrasComLocalizacao, setObrasComLocalizacao] = useState<ObraLocation[]>([])
  const [isLoading, setIsLoading] = useState(obras.length > 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (obras.length === 0) return

    const geocodeObras = async () => {
      try {
        const obrasGeocodificadas: ObraLocation[] = []

        for (const obra of obras) {
          const endereco = obra.endereco_obra || obra.endereco
          const cidade = obra.cidade_obra || ''
          const estado = obra.estado_obra || ''
          
          if (!endereco) continue

          // Construir query de endereço completo
          const query = `${endereco}, ${cidade}, ${estado}, Brasil`
            .replace(/\s+/g, ' ')
            .trim()

          try {
            // Usar Nominatim (OpenStreetMap) para geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
              {
                headers: {
                  'User-Agent': 'LA-Engenharia-CRM/1.0'
                }
              }
            )

            const data = await response.json()

            if (data && data.length > 0) {
              obrasGeocodificadas.push({
                ...obra,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              })
            }

            // Respeitar rate limit do Nominatim (1 req/s)
            await new Promise(resolve => setTimeout(resolve, 1000))
          } catch {
            // Silenciar erros de geocoding individual
          }
        }

        setObrasComLocalizacao(obrasGeocodificadas)
        setIsLoading(false)
      } catch {
        setError('Erro ao carregar localizações')
        setIsLoading(false)
      }
    }

    geocodeObras()
  }, [obras])

  // Calcular centro do mapa baseado nas obras
  const mapCenter = obrasComLocalizacao.length > 0
    ? {
        lat: obrasComLocalizacao.reduce((sum, obra) => sum + obra.lat, 0) / obrasComLocalizacao.length,
        lng: obrasComLocalizacao.reduce((sum, obra) => sum + obra.lng, 0) / obrasComLocalizacao.length
      }
    : { lat: -15.7939, lng: -47.8828 } // Brasília como fallback

  if (isLoading) {
    return (
      <Card className="border-2 border-[#F5C800]/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg uppercase">
            <MapPin className="h-5 w-5 text-[#F5C800]" />
            LOCALIZAÇÃO DAS OBRAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5C800] mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando localizações...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || obrasComLocalizacao.length === 0) {
    return (
      <Card className="border-2 border-[#F5C800]/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg uppercase">
            <MapPin className="h-5 w-5 text-[#F5C800]" />
            LOCALIZAÇÃO DAS OBRAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {error || 'Nenhuma obra com localização disponível'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#F5C800]/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg uppercase">
          <MapPin className="h-5 w-5 text-[#F5C800]" />
          LOCALIZAÇÃO DAS OBRAS
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {obrasComLocalizacao.length} obra(s) mapeada(s)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg overflow-hidden border-2 border-[#F5C800]/20">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {obrasComLocalizacao.map((obra) => (
              <Marker key={obra.id} position={[obra.lat, obra.lng]}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-[#1E1E1E]">
                      Obra #{String(obra.codigo || 0).padStart(3, '0')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {obra.endereco_obra || obra.endereco}
                    </p>
                    {obra.cidade_obra && (
                      <p className="text-xs text-gray-500 mt-1">
                        {obra.cidade_obra} - {obra.estado_obra}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
