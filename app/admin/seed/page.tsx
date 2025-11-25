'use client'

import { useState } from 'react'

export default function SeedPage() {
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const generateData = async () => {
        setLoading(true)
        setStatus('Generando datos...')

        try {
            const response = await fetch('/api/seed', {
                method: 'POST'
            })

            const data = await response.json()

            if (data.success) {
                setStatus(data.message)
            } else {
                setStatus('Error al crear procesos: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            setStatus('Error al crear procesos: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Generador de Datos de Prueba</h1>
            <p className="mb-4">Este botón creará 3 procesos de ejemplo en Supabase.</p>
            <p className="mb-4 text-sm text-gray-600">
                1. 17230-2025-00001 (Civil) - Abogado Actor: abogado@satje.com<br />
                2. 17230-2025-00002 (Laboral) - Abogado Demandado: abogado@satje.com<br />
                3. 17230-2025-00003 (Inquilinato) - Otro abogado
            </p>

            <button
                onClick={generateData}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {loading ? 'Creando...' : 'Generar 3 Procesos'}
            </button>

            {status && (
                <div className={`mt-4 p-4 rounded ${status.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {status}
                </div>
            )}
        </div>
    )
}
