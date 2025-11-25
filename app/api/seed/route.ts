import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
    // Create admin client at runtime to ensure env vars are read correctly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    console.log('Supabase URL:', supabaseUrl)
    console.log('Service Role Key (first 50 chars):', supabaseServiceRoleKey?.substring(0, 50))

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    try {
        const processes = [
            {
                numero_causa: '17230-2025-00001',
                actor: 'Juan Pérez',
                cedula_actor: '1712345678',
                correo_actor: 'juan.perez@email.com',
                abogado_actor: 'Dr. Carlos Rodríguez',
                correo_abogado_actor: 'abogado@satje.com',
                demandado: 'Empresa X',
                cedula_demandado: '1798765432001',
                materia: 'Civil',
                asunto: 'Cobro de Dinero',
                lugar: 'Quito',
                estado: 'activo',
                fecha_creacion: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString()
            },
            {
                numero_causa: '17230-2025-00002',
                actor: 'María López',
                cedula_actor: '1711223344',
                correo_actor: 'maria.lopez@email.com',
                demandado: 'Pedro Sánchez',
                cedula_demandado: '1755667788',
                abogado_demandado: 'Dr. Carlos Rodríguez',
                correo_abogado_demandado: 'abogado@satje.com',
                materia: 'Laboral',
                asunto: 'Despido Intempestivo',
                lugar: 'Guayaquil',
                estado: 'activo',
                fecha_creacion: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString()
            },
            {
                numero_causa: '17230-2025-00003',
                actor: 'Inmobiliaria Y',
                cedula_actor: '1790011223001',
                correo_actor: 'contacto@inmobiliaria.com',
                demandado: 'Roberto Gómez',
                cedula_demandado: '1788990011',
                materia: 'Inquilinato',
                asunto: 'Terminación de Contrato',
                lugar: 'Cuenca',
                estado: 'activo',
                abogado_actor: 'Dra. Ana Silva',
                correo_abogado_actor: 'ana.silva@email.com',
                fecha_creacion: new Date().toISOString(),
                fecha_actualizacion: new Date().toISOString()
            }
        ]

        // Insert processes using supabaseAdmin (bypasses RLS)
        for (const process of processes) {
            const { data: procesoData, error: procesoError } = await supabaseAdmin
                .from('procesos')
                .insert([process])
                .select()
                .single()

            if (procesoError) throw procesoError

            // Create expediente for each process
            const { error: expError } = await supabaseAdmin
                .from('expedientes')
                .insert([{
                    proceso_id: procesoData.id,
                    numero_expediente: 1,
                    instancia: 'primera',
                    estado: 'activo',
                    fecha_creacion: new Date().toISOString()
                }])

            if (expError) throw expError
        }

        return NextResponse.json({ success: true, message: '¡3 Procesos creados exitosamente!' })
    } catch (error: any) {
        console.error('Error seeding data:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
