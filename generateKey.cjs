const crypto = require('crypto')
const os = require('os')

const SECRET = 'ETONAM_PLUS_SECRET_2025_CAFINEL'
const SECRET_RECOVERY = 'GESTFACT_RECOVERY_2025_CAFINEL'

function genererCle(machineId) {
  const hash = crypto.createHmac('sha256', SECRET)
    .update(machineId)
    .digest('hex')
    .toUpperCase()
    .slice(0, 20)
  return `${hash.slice(0,5)}-${hash.slice(5,10)}-${hash.slice(10,15)}-${hash.slice(15,20)}`
}

function genererCodeRecuperation(machineId) {
  const hash = crypto.createHmac('sha256', SECRET_RECOVERY)
    .update(machineId + '-RESET')
    .digest('hex')
    .toUpperCase()
    .slice(0, 16)
  return `RST-${hash.slice(0,4)}-${hash.slice(4,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}`
}

const action = process.argv[2]
const machineId = process.argv[3]

if (!machineId) {
  console.log('Usage:')
  console.log('  Clé licence  : node generateKey.cjs licence <machineId>')
  console.log('  Récupération : node generateKey.cjs recovery <machineId>')
} else if (action === 'licence') {
  console.log('Clé licence:', genererCle(machineId))
} else if (action === 'recovery') {
  console.log('Code récupération:', genererCodeRecuperation(machineId))
} else {
  console.log('Action inconnue. Utilisez "licence" ou "recovery"')
}
