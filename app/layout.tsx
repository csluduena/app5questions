import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Cuestionario de Deportes',
    description: 'Un cuestionario sobre tus preferencias deportivas',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={inter.className}>{children}</body>
        </html>
    )
}

