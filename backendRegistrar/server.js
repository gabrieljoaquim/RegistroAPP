const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Configuración de SQL Server
const config = {
  server: 'DANINO\\SQLEXPRESS',
  database: 'budget_app',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
    encrypt: false  // Add this line
  },
  driver: 'msnodesqlv8',
  connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=DANINO\\SQLEXPRESS;Database=budget_app;Trusted_Connection=yes;Encrypt=no;TrustServerCertificate=yes;'
};

// Remove the test connection block since we already have connectDB()
// sql.connect(config)
//   .then(pool => {...})
//   .then(result => {...})
//   .catch(err => {...});

// Pool de conexión global
let pool;
async function connectDB() {
  try {
    pool = await sql.connect(config);
    console.log('Connected to database');
    // Test query
    const result = await pool.request().query('SELECT @@VERSION');
    console.log('SQL Server version:', result.recordset[0]);
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}
connectDB();

// Auth endpoints adaptados para SQL Server
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query('INSERT INTO users (email, password) VALUES (@email, @password)');
    
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    
    if (!result.recordset[0]) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.recordset[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret');
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budget endpoints
app.get('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT * FROM budgets WHERE user_id = @userId ORDER BY created_at DESC');
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', authenticateToken, async (req, res) => {
  try {
    const budget = req.body;
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('clientName', sql.VarChar, budget.clientName)
      .input('materialsTotal', sql.Decimal(10,2), budget.materialsTotal)
      .input('operationalTotal', sql.Decimal(10,2), budget.operationalTotal)
      .input('administrativeCost', sql.Decimal(10,2), budget.administrativeCost)
      .input('subtotal', sql.Decimal(10,2), budget.subtotal)
      .input('iva', sql.Decimal(10,2), budget.iva)
      .input('grandTotal', sql.Decimal(10,2), budget.grandTotal)
      .query(`
        INSERT INTO budgets (user_id, client_name, materials_total, operational_total, 
        administrative_cost, subtotal, iva, grand_total) 
        VALUES (@userId, @clientName, @materialsTotal, @operationalTotal, 
        @administrativeCost, @subtotal, @iva, @grandTotal);
        SELECT SCOPE_IDENTITY() AS id;
      `);
    
    res.json({ id: result.recordset[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Company Data endpoints
app.get('/api/company-data', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .query('SELECT * FROM company_data WHERE user_id = @userId');
    
    res.json(result.recordset[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/company-data', authenticateToken, upload.single('logo'), async (req, res) => {
  try {
    const companyData = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.request()
      .input('userId', sql.Int, req.user.userId)
      .input('companyName', sql.VarChar, companyData.companyName)
      .input('slogan', sql.VarChar, companyData.slogan)
      .input('phone', sql.VarChar, companyData.phone)
      .input('email', sql.VarChar, companyData.email)
      .input('address', sql.VarChar, companyData.address)
      .input('logoPath', sql.VarChar, logoPath)
      .input('thankYouMessage', sql.VarChar, companyData.thankYouMessage)
      .query(`
        MERGE company_data AS target
        USING (SELECT @userId as user_id) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET 
            company_name = @companyName,
            slogan = @slogan,
            phone = @phone,
            email = @email,
            address = @address,
            logo_path = COALESCE(@logoPath, logo_path),
            thank_you_message = @thankYouMessage
        WHEN NOT MATCHED THEN
          INSERT (user_id, company_name, slogan, phone, email, address, logo_path, thank_you_message)
          VALUES (@userId, @companyName, @slogan, @phone, @email, @address, @logoPath, @thankYouMessage);
      `);
    
    res.json({ message: 'Company data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budget Items endpoints
app.get('/api/budgets/:budgetId/items', authenticateToken, async (req, res) => {
  try {
    const result = await pool.request()
      .input('budgetId', sql.Int, req.params.budgetId)
      .query('SELECT * FROM budget_items WHERE budget_id = @budgetId');
    
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets/:budgetId/items', authenticateToken, async (req, res) => {
  try {
    const items = req.body;
    const budgetId = req.params.budgetId;

    // First, delete existing items
    await pool.request()
      .input('budgetId', sql.Int, budgetId)
      .query('DELETE FROM budget_items WHERE budget_id = @budgetId');

    // Then insert new items
    for (const item of items) {
      await pool.request()
        .input('budgetId', sql.Int, budgetId)
        .input('description', sql.VarChar, item.description)
        .input('quantity', sql.Int, item.quantity)
        .input('unitPrice', sql.Decimal(10,2), item.unitPrice)
        .input('total', sql.Decimal(10,2), item.total)
        .query(`
          INSERT INTO budget_items (budget_id, description, quantity, unit_price, total)
          VALUES (@budgetId, @description, @quantity, @unitPrice, @total)
        `);
    }
    
    res.json({ message: 'Budget items saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});