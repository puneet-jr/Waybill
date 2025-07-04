import Truck from '../models/Truck.js';
import { utils, write } from 'xlsx';

export async function getAllTrucks(req, res) {
  try {
    const trucks = await Truck.find().sort({ createdAt: -1 });
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createTruck(req, res) {
  try {
    const { truckNumber, driverName, driverPhone } = req.body;
    
    const existingTruck = await Truck.findOne({ truckNumber: truckNumber.toUpperCase() });
    if (existingTruck) {
      return res.status(400).json({ message: 'Truck number already exists' });
    }

    const truck = await Truck.create({
      truckNumber: truckNumber.toUpperCase(),
      driverName,
      driverPhone
    });

    res.status(201).json(truck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getTruckById(req, res) {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }
    res.json(truck);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateTruck(req, res) {
  try {
    const truck = await Truck.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }
    
    res.json(truck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteTruck(req, res) {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) {
      return res.status(404).json({ message: 'Truck not found' });
    }
    res.json({ message: 'Truck deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadAllTrucks(req, res) {
  try {
    const trucks = await Truck.find().sort({ createdAt: -1 });
    
    const data = trucks.map(truck => ({
      'Truck Number': truck.truckNumber,
      'Driver Name': truck.driverName,
      'Driver Phone': truck.driverPhone,
      'Max Trips': truck.maxTrips,
      'Remaining Trips': truck.remainingTrips,
      'Attempts': truck.attempts,
      'Status': truck.isBlocked ? 'Blocked' : 'Active',
      'Last Verification': truck.lastVerification ? new Date(truck.lastVerification).toLocaleString() : 'Never',
      'Created Date': new Date(truck.createdAt).toLocaleString(),
      'Updated Date': new Date(truck.updatedAt).toLocaleString()
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'All Trucks');

    const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=all-trucks-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadDailyTrucks(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const trucks = await Truck.find({
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });
    
    const data = trucks.map(truck => ({
      'Truck Number': truck.truckNumber,
      'Driver Name': truck.driverName,
      'Driver Phone': truck.driverPhone,
      'Max Trips': truck.maxTrips,
      'Remaining Trips': truck.remainingTrips,
      'Attempts': truck.attempts,
      'Status': truck.isBlocked ? 'Blocked' : 'Active',
      'Last Verification': truck.lastVerification ? new Date(truck.lastVerification).toLocaleString() : 'Never',
      'Registered Time': new Date(truck.createdAt).toLocaleString()
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Daily Registered Trucks');

    const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=daily-trucks-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function downloadTrucksByDate(req, res) {
  try {
    const { date } = req.params;
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const trucks = await Truck.find({
      createdAt: { $gte: selectedDate, $lt: nextDay }
    }).sort({ createdAt: -1 });
    
    const data = trucks.map(truck => ({
      'Truck Number': truck.truckNumber,
      'Driver Name': truck.driverName,
      'Driver Phone': truck.driverPhone,
      'Max Trips': truck.maxTrips,
      'Remaining Trips': truck.remainingTrips,
      'Attempts': truck.attempts,
      'Status': truck.isBlocked ? 'Blocked' : 'Active',
      'Last Verification': truck.lastVerification ? new Date(truck.lastVerification).toLocaleString() : 'Never',
      'Registered Time': new Date(truck.createdAt).toLocaleString()
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `Trucks ${date}`);

    const buffer = write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename=trucks-${date}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
