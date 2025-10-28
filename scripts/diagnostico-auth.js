#!/usr/bin/env node

// Script de diagnóstico para verificar el estado de autenticación y base de datos
// Ejecutar con: node scripts/diagnostico-auth.js

console.log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN Y BASE DE DATOS');
console.log('===============================================\n');

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

console.log('📊 1. VERIFICANDO DATOS EN LOCALSTORAGE:');
console.log('----------------------------------------');

// Verificar usuarios almacenados
const storedUsers = localStorage.getItem('satje_users');
if (storedUsers) {
  const users = JSON.parse(storedUsers);
  console.log(`✅ Usuarios encontrados: ${users.length}`);
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Activo: ${user.is_active}`);
  });
} else {
  console.log('❌ No se encontraron usuarios en localStorage');
}

console.log('\n📊 2. VERIFICANDO SESIÓN ACTUAL:');
console.log('--------------------------------');

const userSession = localStorage.getItem('satje_user_session');
if (userSession) {
  const session = JSON.parse(userSession);
  console.log(`✅ Sesión activa: ${session.name} (${session.email})`);
  console.log(`   Rol: ${session.role}`);
  console.log(`   Login: ${session.loginTime}`);
} else {
  console.log('❌ No hay sesión activa');
}

console.log('\n📊 3. VERIFICANDO CONTRASEÑAS:');
console.log('-------------------------------');

const userPasswords = localStorage.getItem('satje_user_passwords');
if (userPasswords) {
  const passwords = JSON.parse(userPasswords);
  console.log(`✅ Contraseñas almacenadas: ${passwords.length}`);
  passwords.forEach((pwd, index) => {
    console.log(`   ${index + 1}. Usuario: ${pwd.user_id} - Temporal: ${pwd.is_temporary}`);
  });
} else {
  console.log('❌ No se encontraron contraseñas almacenadas');
}

console.log('\n📊 4. VERIFICANDO LOGS DE ACTIVIDAD:');
console.log('------------------------------------');

const activityLogs = localStorage.getItem('satje_activity_logs');
if (activityLogs) {
  const logs = JSON.parse(activityLogs);
  console.log(`✅ Logs de actividad: ${logs.length}`);
  
  // Mostrar últimos 5 logs
  const recentLogs = logs.slice(-5);
  recentLogs.forEach((log, index) => {
    console.log(`   ${index + 1}. ${log.action} - ${log.user_name} - ${log.timestamp}`);
  });
} else {
  console.log('❌ No se encontraron logs de actividad');
}

console.log('\n📊 5. VERIFICANDO PROCESOS:');
console.log('----------------------------');

const processes = localStorage.getItem('satje_processes');
if (processes) {
  const processList = JSON.parse(processes);
  console.log(`✅ Procesos almacenados: ${processList.length}`);
} else {
  console.log('❌ No se encontraron procesos');
}

console.log('\n📊 6. VERIFICANDO ACTIVIDADES:');
console.log('-------------------------------');

const activities = localStorage.getItem('satje_activities');
if (activities) {
  const activityList = JSON.parse(activities);
  console.log(`✅ Actividades almacenadas: ${activityList.length}`);
} else {
  console.log('❌ No se encontraron actividades');
}

console.log('\n🔧 7. COMANDOS DE DIAGNÓSTICO:');
console.log('-------------------------------');
console.log('Para verificar en el navegador, abre la consola y ejecuta:');
console.log('');
console.log('// Ver todos los usuarios');
console.log('console.log(JSON.parse(localStorage.getItem("satje_users") || "[]"));');
console.log('');
console.log('// Ver sesión actual');
console.log('console.log(JSON.parse(localStorage.getItem("satje_user_session") || "null"));');
console.log('');
console.log('// Ver contraseñas');
console.log('console.log(JSON.parse(localStorage.getItem("satje_user_passwords") || "[]"));');
console.log('');
console.log('// Limpiar todo (¡CUIDADO!)');
console.log('localStorage.clear();');
console.log('');

console.log('\n✅ DIAGNÓSTICO COMPLETADO');
console.log('========================');
