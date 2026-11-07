import 'dotenv/config'

export default {
  schema: './src/infra/db/schemas.js',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL
  }
}
