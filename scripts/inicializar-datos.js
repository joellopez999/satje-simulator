#!/usr/bin/env node

// Script para inicializar datos por defecto en el sistema
// Ejecutar con: node scripts/inicializar-datos.js

console.log('🚀 INICIALIZANDO DATOS DEL SISTEMA');
console.log('==================================\n');

// Simular localStorage para Node.js
const localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// Simular el entorno del navegador
global.localStorage = localStorage;

console.log('📊 1. CREANDO USUARIOS POR DEFECTO:');
console.log('---------------------------------');

const defaultUsers = [
  {
    id: '1',
    name: 'Administrador del Sistema',
    email: 'admin@satje.ec',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Dr. Juan Pérez',
    email: 'juez@satje.ec',
    role: 'juez',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Lic. María González',
    email: 'secretario@satje.ec',
    role: 'secretario',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Abg. Carlos López',
    email: 'abogado@satje.ec',
    role: 'abogado',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

localStorage.setItem('satje_users', JSON.stringify(defaultUsers));
console.log(`✅ ${defaultUsers.length} usuarios creados`);

console.log('\n📊 2. CREANDO CONTRASEÑAS POR DEFECTO:');
console.log('--------------------------------------');

const defaultPasswords = [
  {
    user_id: '1',
    password: 'admin123',
    is_temporary: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: '2',
    password: 'juez123',
    is_temporary: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: '3',
    password: 'secretario123',
    is_temporary: false,
    created_at: new Date().toISOString()
  },
  {
    user_id: '4',
    password: 'abogado123',
    is_temporary: false,
    created_at: new Date().toISOString()
  }
];

localStorage.setItem('satje_user_passwords', JSON.stringify(defaultPasswords));
console.log(`✅ ${defaultPasswords.length} contraseñas creadas`);

console.log('\n📊 3. INICIALIZANDO ARRAYS VACÍOS:');
console.log('----------------------------------');

localStorage.setItem('satje_processes', JSON.stringify([]));
localStorage.setItem('satje_activities', JSON.stringify([]));
localStorage.setItem('satje_activity_logs', JSON.stringify([]));

console.log('✅ Arrays de procesos, actividades y logs inicializados');

console.log('\n📊 4. VERIFICANDO INICIALIZACIÓN:');
console.log('---------------------------------');

const users = JSON.parse(localStorage.getItem('satje_users'));
const passwords = JSON.parse(localStorage.getItem('satje_user_passwords'));
const processes = JSON.parse(localStorage.getItem('satje_processes'));

console.log(`✅ Usuarios: ${users.length}`);
console.log(`✅ Contraseñas: ${passwords.length}`);
console.log(`✅ Procesos: ${processes.length}`);

console.log('\n📋 CREDENCIALES DE ACCESO:');
console.log('==========================');
console.log('Admin: admin@satje.ec / admin123');
console.log('Juez: juez@satje.ec / juez123');
console.log('Secretario: secretario@satje.ec / secretario123');
console.log('Abogado: abogado@satje.ec / abogado123');

console.log('\n✅ INICIALIZACIÓN COMPLETADA');
console.log('============================');
console.log('Ahora puedes iniciar sesión con cualquiera de las credenciales anteriores.');
