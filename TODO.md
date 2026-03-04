# Dashboard Update Plan - Expense & Wallet Cards

## Task
Edit Dashboard.jsx to include:
1. Expense card showing total expenses
2. Wallet card showing remaining amount (Income - Expenses)

## Changes Required
- [x] Update Stats Cards grid in Dashboard.jsx
  - [x] Keep: Health Score card
  - [x] Keep: Income card
  - [x] Replace: Savings → Expense Card (shows total expenses)
  - [x] Replace: Trust Score → Wallet Balance Card (shows remaining amount)

## Data Source
- Backend provides `spendingSummary.total` for expenses
- Backend provides `walletBalance` for remaining amount (Income - Expenses)

## Implementation - COMPLETED
- Expense Card: Display total expenses from `dashboardData?.spendingSummary?.total`
- Wallet Card: Display remaining amount from `dashboardData?.walletBalance`
- Wallet shows green when positive, red when negative (overdrawn)
