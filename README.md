# 📦 Inventory Management System

A full-stack web application for managing product inventory with CSV import/export, search, filtering, and real-time stock tracking.

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration
- 📝 **Product Management** - Add, edit, and delete products
- ✏️ **Inline Editing** - Quick updates directly in the table
- 📥 **CSV Import** - Bulk upload products from CSV files
- 📤 **CSV Export** - Download inventory as CSV
- 🔍 **Search & Filter** - Find products by name and category
- 📊 **Inventory History** - Track all stock changes with timestamps
- 🎨 **Stock Status** - Visual indicators (Green: In Stock, Red: Out of Stock)
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Technology Stack

**Frontend:**
- React.js
- React Router
- Axios
- React Toastify

**Backend:**
- Node.js
- Express.js
- SQLite3
- JWT Authentication
- bcrypt

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/LahariVanaja/inventory-management.git
cd inventory-management
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file in backend folder:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=24h
```

Start backend server:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Setup Frontend

Open new terminal:

```bash
cd frontend
npm install
```

Create `.env` file in frontend folder:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm start
```

Frontend opens at: `http://localhost:3000`

## 📱 How to Use

### First Time Setup

1. Open `http://localhost:3000`
2. Click **"Register here"**
3. Create your account
4. You'll be automatically logged in

### Add Products

**Option 1: Add Manually**
- Click **"+ Add New Product"**
- Fill in the form
- Click **"Create Product"**

**Option 2: Import CSV**
- Click **"Import CSV"**
- Select your CSV file
- Products are added instantly

### Edit Products

1. Click **"✏️ Edit"** on any product
2. Row becomes editable (turns yellow)
3. Make changes
4. Click **"✓ Save"**

### View History

- Click on any product row
- Sidebar opens showing all stock changes
- See who changed what and when

### Export Data

- Click **"📤 Export CSV"**
- CSV file downloads automatically
- Open in Excel or any spreadsheet app

## 📄 CSV File Format

Your CSV file must have these columns:

```csv
name,unit,category,brand,stock,status,image
Mouse,Piece,Electronics,Logitech,50,In Stock,
Keyboard,Piece,Electronics,HP,30,In Stock,
Monitor,Piece,Electronics,Samsung,20,In Stock,
```

**Required Fields:**
- name (must be unique)
- unit (e.g., Piece, Box, Kg)
- category (e.g., Electronics, Furniture)
- brand
- stock (number)

**Optional Fields:**
- status (auto-calculated if empty)
- image (URL to product image)

## 🎯 Features Demo

### Search Products
Type in the search bar to filter products by name in real-time.

### Filter by Category
Use the dropdown to show products from specific categories only.

### Stock Status
- 🟢 **Green badge** = In Stock (stock > 0)
- 🔴 **Red badge** = Out of Stock (stock = 0)

### Inventory History
Every time you change a product's stock:
- Old quantity → New quantity is recorded
- Timestamp is saved
- Your username is logged
- View complete history by clicking any product row

## 📁 Project Structure

```
inventory-management/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication
│   │   └── utils/          # CSV handlers
│   ├── database.js         # SQLite setup
│   ├── server.js           # Express app
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API calls
│   │   └── context/        # Auth context
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/search?name=query` - Search products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

### CSV Operations
- `POST /api/products/import` - Import CSV (auth required)
- `GET /api/products/export` - Export CSV

### History
- `GET /api/products/:id/history` - Get inventory history

### Utility
- `GET /api/products/categories` - Get all categories

## 🗄️ Database Schema

**users** - User accounts
```sql
id, username, email, password, created_at
```

**products** - Product inventory
```sql
id, name, unit, category, brand, stock, status, image, created_at, updated_at
```

**inventory_history** - Stock change logs
```sql
id, product_id, old_quantity, new_quantity, changed_by, change_date
```

## 🐛 Troubleshooting

**Backend won't start?**
- Check if port 5000 is free
- Verify `.env` file exists with correct values
- Run `npm install` again

**Frontend shows blank page?**
- Check browser console for errors
- Ensure backend is running first
- Verify `.env` has correct API URL



**"401 Unauthorized" errors?**
- Login again (token might be expired)
- Check if JWT_SECRET is set in backend `.env`

## 📸 Screenshots
<img width="1317" height="676" alt="image" src="https://github.com/user-attachments/assets/926a5476-f20f-4b81-a1f0-8a34f45216f0" />


### Login Page
User authentication with secure JWT tokens.

### Products Inventory
Clean table view with search, filter, and bulk actions.

### Add Product Modal
Quick form to add new products.

### Inline Editing
Edit products directly in the table.

### Inventory History
Track all stock changes with complete audit trail.

### CSV Import
Bulk upload products from spreadsheet.

## 🚀 Deployment
### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Netlify
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Add environment variable: `REACT_APP_API_BASE_URL`
6. Deploy

## 📝 Assignment Requirements Met

✅ Product search and filtering  
✅ Product table with all columns  
✅ Inline editing functionality  
✅ CSV import with duplicate checking  
✅ CSV export feature  
✅ Inventory history tracking  
✅ User authentication  
✅ Protected routes  
✅ Responsive design  
✅ Stock status indicators  

## 👨‍💻 Developer [Yarlagadda Lahari Prasanna]
Built with ❤️ for Skillwise Assignment

