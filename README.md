## 📚 Documentation

# 🧮 IOTA On-chain Calculator dApp

This project is a simple decentralized application demonstrating how to deploy a **Move smart contract on the IOTA network**, interact with it through a **Next.js frontend**, and store calculation results on-chain as a persistent IOTA object.

The dApp allows users to input two numbers and an operator (`+`, `-`, `×`, `÷`).  
The calculation is executed **on-chain** by a Move contract, and the result is stored inside a `Calculation` object.

---

## 🚀 Features

### 🟪 Smart Contract (Move)
- Accepts two numbers (`a`, `b`) and an operator (`op`)
- Performs the arithmetic operation entirely on-chain
- Validates input (division by zero, underflow, invalid op)
- Stores results in a ** Calculation object **:
  - `a`
  - `b`
  - `op`
  - `result`
  - `owner` (transaction sender)

### 🟦 Frontend (Next.js)
- Clean UI for entering calculations
- Connects with **IOTA Wallet** using `@iota/dapp-kit`
- Executes Move contract with a signed transaction
- Displays:
  - Result of the calculation
  - Calculation object ID
  - Owner address
  - Transaction hash
- Supports session via URL hash  

## 📁 Project Structure

```
onchain-calculator/
│
├── move/
│ ├── Move.toml
│ └── sources/
│ └── onchain_calculator.move (Move smart contract)
│
├── hooks/
│ └── useContract.ts (Contract logic & wallet interaction)
│
├── components/
│ └── sample.tsx (Main UI component)
│
├── app/
│ └── page.tsx (Home page)
│
├── package.json
└── README.md
```


🛠 Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/<your-username>/onchain-calculator.git
cd onchain-calculator
2️⃣ Install dependencies
npm install
3️⃣ Deploy the Move contract (Testnet)
npm run iota-deploy
Select:
  testnet
  use existing wallet
After deployment, copy your PACKAGE_ID into:
hooks/useContract.ts
export const PACKAGE_ID = "YOUR_PACKAGE_ID";
4️⃣ Run the frontend
npm run dev
Open:👉 http://localhost:3000

🧪 How to Use the dApp
Step 1 — Enter calculation
Example:
A = 12
Operator = ×
B = 7
Step 2 — Click Calculate on-chain
Your IOTA Wallet will open → click Approve.
Step 3 — View results
Once the transaction is confirmed, the UI shows:
12 × 7 = 84
Calculation ID: 0x...
Owner: 0x...
Transaction confirmed!
## 📄 License

MIT
