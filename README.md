# AuraCart - Premium MERN E-Commerce Platform

AuraCart is a modern, responsive, premium MERN (MongoDB, Express, React, Node.js) E-commerce application featuring native SVG analytics charts, AI-powered smart search suggestion routes, in-app notifications/email transactional alerts, coupons checkout verification, and interactive user profile modules.

---

## 🚀 Key Features

### 1. Customer Authentication & OTP Center
* **Email Verification via OTP:** Registering users receive a 6-digit verification code. Accounts remain unverified until OTP check-ins succeed.
* **OTP Resend Action:** A 60-second cooldown timer prevents abuse of resend triggers.
* **Eye Toggles on Passwords:** Eye icons to hide/show password entries on Register, Login, Reset, and Profile panels.
* **Forgot Password flow:** Password resetting uses transaction email OTP security checks.

### 2. AI Search & Recommendation Widgets
* **Autocomplete Suggestions:** Debounced header input searching categories and product titles as the user types.
* **Trending Collections:** A tabbed layout showcasing Best Sellers (order quantity aggregates), New Arrivals (latest dates), Top Rated (ratings count), and Featured items.
* **Recommended for You:** A personalized recommendation slider querying purchases category history.
* **Frequently Bought Together:** Bundle packages displaying products often ordered with the current item, a total price sum, and a single-click "Add Bundle to Cart" button.
* **Recently Viewed Shelf:** Persistent tracking of items explored by the user.

### 3. Real-Time In-App & Email Alerts
* **Transactional Email dispatches:** SMTP notifications generated on signup, verification, password resetting, ordering, shipping, and cancellations.
* **In-App Notification Center:** A Navbar Bell dropdown listing paginated user alerts with read toggles.
* **Admin Warning triggers:** Low inventory alerts (< 5 units) and order inflow notifications.

### 4. Admin Management Center
* **Interactive SVG Charts:** Sales Trend line-charts and Order Volume bar-charts displaying statistics for the last 7 days.
* **Inventory Control indicators:** Out-of-Stock and Low-Stock warning badges.
* **Cloudinary Multi-file uploads:** Image preview thumbnails with individual deletion buttons in forms.

### 5. Checkout & Invoice Tools
* **Coupon verification:** Validate promo coupons against minimum purchase and expiry criteria.
* **PDF Invoice download:** Print layout styles mapping clean invoices.
* **Cart Reordering:** Quickly add items from previous orders back to the cart.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, React Router DOM, Axios, Lucide Icons, Vanilla CSS
* **Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT, Nodemailer, Cloudinary, Razorpay SDK

---

## ⚙️ Environment Variables Setup

Create a `.env` file inside the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
NODE_ENV=development
```

---

## 💻 Running Locally

### 1. Database Seeding
Insert 20 realistic electronic test products:
```bash
cd backend
npm run seed
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Start Frontend Client
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` to explore.

---

## ⚠️ Known Limitations
1. **Mock Emails Fallback:** If Gmail SMTP variables (`EMAIL_USER`, `EMAIL_PASS`) are missing in the `.env` file, the backend prints OTP verification numbers and email bodies straight to the server console log terminal rather than throwing an exception.
2. **Local Loopback DNS IP:** The frontend uses loopback IP `127.0.0.1:5000` rather than `localhost:5000` to bypass Windows DNS connection drops.
