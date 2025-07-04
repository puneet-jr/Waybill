import Truck from '../models/Truck.js';
import Verification from '../models/Verification.js';
import { utils, write } from 'xlsx';

export async function verifyTruck(req, res) {
  try {
    const { truckNumber, mobileNumber } = req.body;
    
    const truck = await Truck.findOne({ truckNumber: truckNumber.toUpperCase() });
    
    if (!truck) {
      return res.status(404).json({
        exists: false,
        message: 'Truck not found in database'
      });
    }

    // Check if truck is blocked
    if (truck.isBlocked) {
      await Verification.create({
        truckNumber: truck.truckNumber,
        driverPhone: mobileNumber,
        status: 'blocked',
        message: 'Truck is blocked due to multiple failed attempts',
        attemptNumber: truck.attempts,
        verifiedBy: req.user.id
      });

      return res.status(403).json({
        exists: true,
        allowed: false,
        blocked: true,
        message: 'Truck is blocked due to multiple failed verification attempts',
        truck
      });
    }

    // Check mobile number match
    if (truck.driverPhone !== mobileNumber) {
      truck.attempts += 1;
      
      if (truck.attempts >= 4) {
        truck.isBlocked = true;
      }
      
      await truck.save();

      await Verification.create({
        truckNumber: truck.truckNumber,
        driverPhone: mobileNumber,
        status: truck.isBlocked ? 'blocked' : 'failed',
        message: `Mobile number mismatch. Attempts: ${truck.attempts}/4`,
        attemptNumber: truck.attempts,
        verifiedBy: req.user.id
      });

      return res.status(400).json({
        exists: true,
        allowed: false,
        blocked: truck.isBlocked,
        message: truck.isBlocked 
          ? 'Truck blocked after 4 failed attempts' 
          : `Mobile number mismatch. Attempts: ${truck.attempts}/4`,
        truck
      });
    }

    // Reset attempts on successful match
    truck.attempts = 0;

    // Check remaining trips
    if (truck.remainingTrips <= 0) {
      await Verification.create({
        truckNumber: truck.truckNumber,
        driverPhone: mobileNumber,
        status: 'no_trips',
        message: 'No remaining trips allowed',
        attemptNumber: truck.attempts,
        verifiedBy: req.user.id
      });

      return res.status(403).json({
        exists: true,
        allowed: false,
        message: 'Truck exists but has no remaining trips allowed',
        truck
      });
    }

    // Successful verification
    truck.remainingTrips -= 1;
    truck.lastVerification = new Date();
    await truck.save();

    await Verification.create({
      truckNumber: truck.truckNumber,
      driverPhone: mobileNumber,
      status: 'verified',
      message: `Truck verified successfully. Remaining trips: ${truck.remainingTrips}`,
      attemptNumber: truck.attempts,
      verifiedBy: req.user.id
    });

    res.json({
      exists: true,
      allowed: true,
      message: `Truck verified successfully! Remaining trips: ${truck.remainingTrips}`,
      truck
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getVerificationHistory(req, res) {
  try {
    const verifications = await Verification.find()
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getDailyVerifications(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const verifications = await Verification.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('verifiedBy', 'username').sort({ createdAt: -1 });

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalTrucks,
      blockedTrucks,
      dailyVerifications,
      totalVerifications
    ] = await Promise.all([
      Truck.countDocuments(),
      Truck.countDocuments({ isBlocked: true }),
      Verification.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Verification.countDocuments()
    ]);

    res.json({
      totalTrucks,
      blockedTrucks,
      dailyVerifications,
      totalVerifications
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadAllVerifications(req, res) {
  try {
    const verifications = await Verification.find()
      .populate('verifiedBy', 'username')
      .sort({ createdAt: -1 });
    
    const data = verifications.map(verification => ({
      'Truck Number': verification.truckNumber,
      'Driver Phone': verification.driverPhone,
      'Status': verification.status.toUpperCase(),
      'Message': verification.message,
      'Attempt Number': verification.attemptNumber,
      'Verified By': verification.verifiedBy?.username || 'Unknown',
      'Verification Date': new Date(verification.createdAt).toLocaleString()
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'All Verifications');

    const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=all-verifications-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadDailyVerifications(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const verifications = await Verification.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).populate('verifiedBy', 'username').sort({ createdAt: -1 });

    const data = verifications.map(verification => ({
      'Truck Number': verification.truckNumber,
      'Driver Phone': verification.driverPhone,
      'Status': verification.status.toUpperCase(),
      'Message': verification.message,
      'Attempt Number': verification.attemptNumber,
      'Verified By': verification.verifiedBy?.username || 'Unknown',
      'Verification Time': new Date(verification.createdAt).toLocaleString()
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Daily Verifications');

    const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=daily-verifications-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
