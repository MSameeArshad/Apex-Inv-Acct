# Inventory & Accounts System (MERN)

FMCG distributor Inventory + Accounts system. React/Vite/Tailwind frontend, Express/MongoDB backend.

## Features implemented
- JWT auth + role-based access control (Admin, Accountant, Inventory Manager, Salesman, Cashier, Viewer)
- 4-level Chart of Accounts (Group → Sub-Group → Ledger Head → Ledger)
- Item / Party / Godown masters, with Party NTN/STRN/Filer status
- Sale & Purchase with FIFO batch-wise stock costing (StockBatch + StockConsumption)
- Credit invoice WhatsApp confirmation (Meta WhatsApp Cloud API) with resend-on-failure
- Third Schedule (Pakistan FMCG Sales Tax) handling: MRP-based tax, no re-tax downstream, MRP-cap validation
- Sales Tax (Output/Input) and Withholding Tax ledgers + summary reports
- Voucher entry with balanced double-entry validation
- Fiscal Period closing: validates balanced vouchers, computes P&L, posts closing entry, locks the period
- Period-lock middleware blocking edits to closed-period transactions
- Reports: Trial Balance, Income Statement (P&L), Stock Valuation (FIFO), Sales Tax Summary, Withholding Statement, Receivables/Payables Aging
- Dashboard UI styled after the reference tile layout

## Structure
```
backend/   Express API (MongoDB via Mongoose)
frontend/  React (Vite) SPA
```

## Local setup

### Backend
```
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, WhatsApp creds
npm install
npm run seed               # creates default roles + admin user (admin@example.com / ChangeMe123!)
npm run dev
```

### Frontend
```
cd frontend
cp .env.example .env       # set VITE_API_URL to your backend URL
npm install
npm run dev
```

## Default login
After `npm run seed`: **admin@example.com / ChangeMe123!** — change this immediately after first login.

## Deployment (Vercel)
See DEPLOYMENT.md.
