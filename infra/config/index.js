import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from infra/config/.env
dotenv.config({ path: path.resolve(process.cwd(), 'infra/config/.env') });
const config = {
    api: {
        port: Number(process.env.API_PORT) || 3000,
    },
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,
        databaseUrl: process.env.DATABASE_URL,
    },
};
export default config;
//# sourceMappingURL=index.js.map