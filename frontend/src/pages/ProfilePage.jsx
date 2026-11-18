import { useEffect, useState } from 'react'
import { getMyProfile } from '../services/profilesService'
import Card from '../components/ui/Card'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile()
        setProfile(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) return <p className="text-center mt-10 font-bold">Cargando perfil...</p>
  if (error) return <p className="text-center mt-10 text-red-600 font-bold">Error: {error}</p>

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12">
      <Card>
        <h1 className="text-3xl font-black mb-6">Mi Perfil</h1>
        <div className="space-y-4 font-medium">
          <p><strong>Nombre:</strong> {profile.name || 'Sin nombre'}</p>
          <p><strong>Rol:</strong> {profile.role}</p>
          <p><strong>Miembro desde:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        </div>
      </Card>
    </main>
  )
}

export default ProfilePage