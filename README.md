# 🚀 Bingwa Sokoni - Automated Safaricom Package Selling System

A modern, offline-first React application for selling Safaricom data bundles, SMS packages, and call minutes with M-PESA integration.

![Bingwa Sokoni](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React)                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────┐  │
│  │ Home    │  │ Packages │  │ Orders  │  │ Profile/Wallet   │  │
│  │ Screen  │  │ Browser  │  │ History │  │ Management       │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └────────┬─────────┘  │
│       │            │             │                 │            │
│  ┌────▼────────────▼─────────────▼─────────────────▼────────┐  │
│  │                    OFFLINE QUEUE                          │  │
│  │  • IndexedDB Storage  • Auto-sync on reconnect           │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │            BACKEND SERVER               │
         │  ┌────────────────────────────────────┐│
         │  │     Express.js REST API            ││
         │  │  • /api/packages                   ││
         │  │  • /api/orders                     ││
         │  │  • /api/payments                   ││
         │  │  • /api/users                      ││
         │  └──────────────┬─────────────────────┘│
         │                 │                       │
         │  ┌──────────────▼─────────────────────┐│
         │  │         MySQL Database              ││
         │  │  • users, packages, orders          ││
         │  │  • payments, transaction_logs       ││
         │  └─────────────────────────────────────┘│
         └────────────────────┬────────────────────┘
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │                EXTERNAL SERVICES                   │
    │                                                    │
    │  ┌──────────────┐        ┌───────────────────┐   │
    │  │ M-PESA       │        │ Safaricom Bundle  │   │
    │  │ Daraja API   │        │ Delivery API      │   │
    │  │ (STK Push)   │        │ (Partner API)     │   │
    │  └──────────────┘        └───────────────────┘   │
    └───────────────────────────────────────────────────┘
```

## ✨ Features

### 📱 Mobile-First Design
- Responsive UI that adapts from mobile to desktop
- Bottom navigation on mobile, sidebar on desktop
- Touch-optimized gradient package cards
- Smooth animations with Framer Motion

### 🔌 Offline-First Architecture
- Full functionality without internet connection
- Orders queue locally when offline
- Automatic sync when connection restored
- Network status indicator

### 💳 M-PESA Integration
- STK Push for seamless payments
- No PIN capture - redirects to SIM Toolkit
- Real-time payment status tracking
- Automatic retry on failure

### 📦 Package Categories
- **Data Deals**: Daily, weekly, monthly data bundles
- **Tunukiwa**: Special offers and promotions
- **SMS Bundles**: Messaging packages
- **Call Minutes**: Voice packages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd "Bingwa Sokoni"
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE bingwa_sokoni;"
   
   # Run migrations
   npm run migrate
   
   # Seed packages data
   npm run seed
   ```

6. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm start
   ```

## 🔧 Configuration

### Frontend Environment (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

### Backend Environment (backend/.env)
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bingwa_sokoni

# M-PESA Daraja API
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/callback
```

## 📁 Project Structure

```
Bingwa Sokoni/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.js
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── BottomNav.js
│   │   ├── purchase/
│   │   │   └── PurchaseModal.js
│   │   └── ui/
│   │       ├── Button.js
│   │       ├── Modal.js
│   │       ├── PackageCard.js
│   │       ├── Toast.js
│   │       ├── OrderStatusChip.js
│   │       └── NetworkStatusBadge.js
│   ├── context/
│   │   ├── NetworkContext.js
│   │   └── ThemeContext.js
│   ├── data/
│   │   ├── packages.js
│   │   └── constants.js
│   ├── hooks/
│   │   └── useApi.js
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── DealsPage.js
│   │   ├── OrdersPage.js
│   │   ├── WalletPage.js
│   │   └── ProfilePage.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   └── orderStore.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   ├── index.js
│   └── routes.js
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   ├── routes/
│   │   │   ├── orders.js
│   │   │   ├── packages.js
│   │   │   ├── payments.js
│   │   │   └── users.js
│   │   ├── services/
│   │   │   ├── mpesa.js
│   │   │   └── bundleDelivery.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## 🛠️ API Endpoints

### Packages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/packages` | List all packages |
| GET | `/api/packages/:id` | Get single package |
| GET | `/api/packages/category/:category` | Get by category |
| GET | `/api/packages/featured` | Get featured packages |
| GET | `/api/packages/categories` | List categories |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/phone/:phone` | Get orders by phone |
| PATCH | `/api/orders/:id` | Update order |
| POST | `/api/orders/sync` | Sync offline orders |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/initiate` | Initiate STK Push |
| POST | `/api/payments/callback` | M-PESA callback |
| GET | `/api/payments/:id/status` | Get payment status |
| POST | `/api/payments/:id/query` | Query M-PESA status |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register/login user |
| GET | `/api/users/:id` | Get user profile |
| PATCH | `/api/users/:id` | Update profile |
| GET | `/api/users/:id/orders` | Get user orders |
| GET | `/api/users/:id/stats` | Get user statistics |

## 💡 Usage Flow

1. **Browse Packages**: User opens app and browses available packages
2. **Select Package**: Taps on a package card to see details
3. **Enter Phone**: Enters recipient phone number
4. **Confirm Purchase**: Reviews order summary
5. **Pay via M-PESA**: 
   - If online: STK Push sent to phone
   - If offline: Order queued for later
6. **Complete Payment**: User enters M-PESA PIN on SIM Toolkit
7. **Receive Bundle**: Bundle delivered automatically after payment

## 🔒 Security

- Helmet.js for HTTP headers
- Rate limiting (100 requests/15 min)
- CORS protection
- Input validation with Joi
- SQL injection prevention (parameterized queries)
- No sensitive data in frontend

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy build/ folder
```

### Backend (Railway/Render/VPS)
```bash
cd backend
npm start
```

### Database (PlanetScale/AWS RDS)
Run migrations on production database

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Support

For support, email support@bingwasokoni.co.ke or call +254 XXX XXX XXX

---

Built with ❤️ for Kenya 🇰🇪
"# Bingwa-Sokoni-App" 
