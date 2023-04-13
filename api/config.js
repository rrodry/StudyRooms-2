const PORT = process.env.PORT || 3001
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || "QSLJnS1Qrhc6PHw8z5UB"
const DB_HOST = process.env.DB_HOST || "containers-us-west-1.railway.app"
const BD_NAME = process.env.BD_NAME || "railway"
const BD_PORT = process.env.BD_PORT || 6023



module.exports = { 
    PORT ,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    BD_NAME,
    BD_PORT,
}