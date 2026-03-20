import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const tablesToClear = [
  'budget',
  'transactions',
  'periods',
  'categories',
  'accounts'
]

async function clearDomainTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.')
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })

  const client = await pool.connect()

  try {
    console.log(`Clearing remote tables: ${tablesToClear.join(', ')}`)

    await client.query('BEGIN')
    await client.query(`TRUNCATE TABLE ${tablesToClear.join(', ')} RESTART IDENTITY CASCADE`)
    await client.query('COMMIT')

    console.log('Remote domain tables cleared successfully.')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Failed to clear remote domain tables.')
    console.error(error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

clearDomainTables()
