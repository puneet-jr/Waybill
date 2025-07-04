# FleetCheck Pro - Fleet Management System

A comprehensive fleet verification and management system built with React, Node.js, and MongoDB.

## 🚀 Features

- **Truck Verification**: Real-time truck and driver verification with mobile number validation
- **Fleet Management**: Add, manage, and track trucks with trip limits
- **Security System**: Automatic blocking after 4 failed verification attempts
- **Dashboard Analytics**: Real-time statistics and verification history
- **Excel Reports**: Download verification data and truck information
- **User Authentication**: Secure login system with JWT tokens

## 🏗️ Project Structure

```
Waybill/
├── client-app/          # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Authentication context
│   │   └── main.jsx     # App entry point
│   └── package.json
├── server-app/          # Node.js backend API
│   ├── controllers/     # API route handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # Express routes
│   ├── middleware/     # Authentication middleware
│   └── server.js       # Server entry point
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Router** - Navigation
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **xlsx** - Excel file generation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd Waybill
```

### 2. Backend Setup
```bash
cd server-app
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/fleetmanagement
JWT_SECRET=your-secret-key
PORT=5000" > .env

# Start server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client-app
npm install

# Start development server
npm run dev
```

## 🚀 Usage

### Default Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

### Core Workflows

#### 1. Add New Truck
1. Navigate to Fleet Management
2. Click "Add New Truck"
3. Enter truck details (each truck gets 4 trips by default)

#### 2. Verify Truck
1. Go to Truck Verification
2. Enter truck number and driver's mobile number
3. System validates and tracks attempts

#### 3. Security Features
- ✅ **4 trips per truck** (configurable in Truck model)
- ✅ **Auto-blocking after 4 failed attempts**
- ✅ **Mobile number verification**
- ✅ **Real-time attempt tracking**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Trucks
- `GET /api/trucks` - Get all trucks
- `POST /api/trucks` - Add new truck
- `PUT /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Verifications
- `POST /api/verifications/verify` - Verify truck
- `GET /api/verifications/stats` - Dashboard statistics
- `GET /api/verifications/daily` - Daily verifications
- `GET /api/verifications/download/all` - Download all data
- `GET /api/verifications/download/daily` - Download daily data

## 🔧 Configuration

### Truck Settings (in `server-app/models/Truck.js`)
```javascript
maxTrips: {
  type: Number,
  default: 4  // Change this to modify default trips
},
remainingTrips: {
  type: Number,
  default: 4  // Should match maxTrips
}
```

### Security Settings (in `server-app/controllers/verificationController.js`)
```javascript
if (truck.attempts >= 4) {  // Change limit here
  truck.isBlocked = true;
}
```

## 📈 Dashboard Metrics

- **Today's Verifications**: Daily verification count
- **Total Verifications**: All-time verification count  
- **Fleet Size**: Total number of trucks
- **Blocked Trucks**: Trucks blocked due to failed attempts

## 🛡️ Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for secure password storage
3. **Attempt Tracking**: Monitors failed verification attempts
4. **Auto-blocking**: Prevents unauthorized access after 4 failed attempts
5. **Trip Limits**: Controls truck usage with configurable trip limits

## 🔄 Development

### Adding New Features
1. **Backend**: Add routes in `routes/`, controllers in `controllers/`, models in `models/`
2. **Frontend**: Add components in `src/components/`, update routing in `App.jsx`

### Environment Variables
```env
# Server (.env in server-app/)
MONGODB_URI=mongodb://localhost:27017/fleetmanagement
JWT_SECRET=your-super-secret-jwt-key
PORT=5000

# Client (optional)
VITE_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Make sure MongoDB is running
   mongod --dbpath /path/to/data/directory
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   ```

3. **CORS Issues**
   - Ensure frontend runs on `http://localhost:5173`
   - Backend CORS is configured for this URL

## 📝 License

MIT License - see LICENSE file for details

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.