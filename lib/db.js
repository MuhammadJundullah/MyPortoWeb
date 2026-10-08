import { Pool } from "pg";

// local
// const pool = new Pool({
//   user: "admin",
//   host: "localhost",
//   database: "porto",
//   password: "",
//   port: 5432,
// });

// supabasej

// Prisma and the portfolio account store must use the same configured database.
// Prefer the standard connection URL, which preserves provider-specific options
// such as the Supabase/Neon pooler host and TLS mode.
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, max: 5 }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        max: 5,
      }
);

export default pool;
