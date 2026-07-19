# AuraCart

AuraCart is a full-stack E-Commerce web application developed using the MERN Stack (MongoDB, Express.js, React.js and Node.js). The application allows users to browse products, manage their cart and wishlist, place orders, and provides an admin dashboard to manage the store.

## Features

### User Features
- User Registration and Login
- Email OTP Verification
- Forgot Password using OTP
- JWT Authentication
- Product Search
- Product Categories
- Product Filters and Sorting
- Product Details Page
- Shopping Cart
- Wishlist
- Checkout
- Cash on Delivery (COD)
- Order History
- User Profile Management
- Responsive Design

### Admin Features
- Secure Admin Login
- Admin Dashboard
- Product Management (Add, Edit, Delete)
- Category Management
- Order Management
- User Management
- Dashboard Statistics

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer
- Cloudinary

## Project Structure

```
AuraCart/
│
├── backend/
├── frontend/
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/sania026/AuraCart.git
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Future Enhancements

- Online Payment Integration
- Product Recommendation System
- Sales Analytics
- Multi-Vendor Support
- Mobile Application

## Author

**Sania Kumari**

B.Tech (Computer Science)