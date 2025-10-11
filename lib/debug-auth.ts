// Utilidades de debugging para autenticación
export const debugAuth = {
  // Verificar estado de localStorage
  checkLocalStorage: () => {
    console.log('=== DEBUG AUTH - LocalStorage ===')
    console.log('satje_user_session:', localStorage.getItem('satje_user_session'))
    console.log('satje_users:', localStorage.getItem('satje_users'))
    console.log('satje_user_passwords:', localStorage.getItem('satje_user_passwords'))
    console.log('satje_activity_logs:', localStorage.getItem('satje_activity_logs'))
  },

  // Verificar usuarios disponibles
  checkUsers: () => {
    console.log('=== DEBUG AUTH - Usuarios ===')
    try {
      const users = JSON.parse(localStorage.getItem('satje_users') || '[]')
      console.log('Usuarios almacenados:', users)
      
      const passwords = JSON.parse(localStorage.getItem('satje_user_passwords') || '[]')
      console.log('Contraseñas almacenadas:', passwords)
      
      return { users, passwords }
    } catch (error) {
      console.error('Error al verificar usuarios:', error)
      return { users: [], passwords: [] }
    }
  },

  // Limpiar datos de autenticación
  clearAuth: () => {
    console.log('=== DEBUG AUTH - Limpiando datos ===')
    localStorage.removeItem('satje_user_session')
    localStorage.removeItem('satje_users')
    localStorage.removeItem('satje_user_passwords')
    localStorage.removeItem('satje_activity_logs')
    console.log('Datos de autenticación limpiados')
  },

  // Inicializar usuarios de prueba
  initTestUsers: () => {
    console.log('=== DEBUG AUTH - Inicializando usuarios de prueba ===')
    
    const testUsers = [
      {
        id: 'admin-001',
        email: 'admin@satje.com',
        name: 'Administrador SATJE',
        role: 'admin',
        created_at: new Date().toISOString()
      },
      {
        id: 'juez-001',
        email: 'juez@satje.com',
        name: 'Dr. Juan Pérez',
        role: 'juez',
        created_at: new Date().toISOString()
      },
      {
        id: 'secretario-001',
        email: 'secretario@satje.com',
        name: 'Lic. María González',
        role: 'secretario',
        created_at: new Date().toISOString()
      },
      {
        id: 'abogado-001',
        email: 'abogado@satje.com',
        name: 'Dr. Carlos Rodríguez',
        role: 'abogado',
        created_at: new Date().toISOString()
      }
    ]

    const testPasswords = [
      {
        id: 'pwd-admin-001',
        user_id: 'admin-001',
        password: 'admin123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'pwd-juez-001',
        user_id: 'juez-001',
        password: 'juez123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'pwd-secretario-001',
        user_id: 'secretario-001',
        password: 'secretario123',
        is_temporary: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'pwd-abogado-001',
        user_id: 'abogado-001',
        password: 'abogado123',
        is_temporary: false,
        created_at: new Date().toISOString()
      }
    ]

    localStorage.setItem('satje_users', JSON.stringify(testUsers))
    localStorage.setItem('satje_user_passwords', JSON.stringify(testPasswords))
    
    console.log('Usuarios de prueba inicializados:', testUsers)
    console.log('Contraseñas de prueba inicializadas:', testPasswords)
  },

  // Verificar navegador y características
  checkBrowser: () => {
    console.log('=== DEBUG AUTH - Navegador ===')
    console.log('User Agent:', navigator.userAgent)
    console.log('Platform:', navigator.platform)
    console.log('Cookie Enabled:', navigator.cookieEnabled)
    console.log('LocalStorage Available:', typeof Storage !== 'undefined')
    console.log('LocalStorage Support:', (() => {
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        return true
      } catch (e) {
        return false
      }
    })())
  },

  // Probar login manual
  testLogin: (email: string, password: string) => {
    console.log('=== DEBUG AUTH - Probando login ===')
    console.log('Email:', email)
    console.log('Password:', password)
    
    try {
      const users = JSON.parse(localStorage.getItem('satje_users') || '[]')
      const passwords = JSON.parse(localStorage.getItem('satje_user_passwords') || '[]')
      
      const user = users.find((u: any) => u.email === email)
      console.log('Usuario encontrado:', user)
      
      if (user) {
        const userPassword = passwords.find((p: any) => p.user_id === user.id)
        console.log('Contraseña del usuario:', userPassword)
        
        if (userPassword && userPassword.password === password) {
          console.log('✅ Login válido')
          return true
        } else {
          console.log('❌ Contraseña incorrecta')
          return false
        }
      } else {
        console.log('❌ Usuario no encontrado')
        return false
      }
    } catch (error) {
      console.error('Error en test login:', error)
      return false
    }
  }
}

// Función global para debugging en consola
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth
  console.log('🔧 Debug Auth disponible en window.debugAuth')
  console.log('Comandos disponibles:')
  console.log('- debugAuth.checkLocalStorage()')
  console.log('- debugAuth.checkUsers()')
  console.log('- debugAuth.clearAuth()')
  console.log('- debugAuth.initTestUsers()')
  console.log('- debugAuth.checkBrowser()')
  console.log('- debugAuth.testLogin("admin@satje.com", "admin123")')
}
