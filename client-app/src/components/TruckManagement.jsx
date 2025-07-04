import { useState, useEffect } from 'react'
import axios from 'axios'

const TruckManagement = () => {
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false)
  const [showDateModal, setShowDateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    truckNumber: '',
    driverName: '',
    driverPhone: ''
  })

  useEffect(() => {
    fetchTrucks()
  }, [])

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trucks')
      setTrucks(response.data)
    } catch (error) {
      console.error('Error fetching trucks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/trucks', formData)
      setShowAddModal(false)
      setFormData({ truckNumber: '', driverName: '', driverPhone: '' })
      fetchTrucks()
    } catch (error) {
      console.error('Error adding truck:', error)
    }
  }

  const downloadData = async (type, date = null) => {
    try {
      let url = `http://localhost:5000/api/trucks/download/${type}`
      if (type === 'date' && date) {
        url = `http://localhost:5000/api/trucks/download/date/${date}`
      }
      
      const response = await axios.get(url, {
        responseType: 'blob'
      })
      
      let filename
      if (type === 'all') {
        filename = `all-trucks-${new Date().toISOString().split('T')[0]}.xlsx`
      } else if (type === 'daily') {
        filename = `daily-trucks-${new Date().toISOString().split('T')[0]}.xlsx`
      } else if (type === 'date') {
        filename = `trucks-${date}.xlsx`
      }
      
      // Create blob URL and trigger download
      const url2 = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url2
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url2)
      
      setShowDownloadDropdown(false)
    } catch (error) {
      console.error('Error downloading data:', error)
    }
  }

  const handleDateDownload = () => {
    if (selectedDate) {
      downloadData('date', selectedDate)
      setShowDateModal(false)
      setSelectedDate('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your fleet and download reports</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Excel</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showDownloadDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border">
                <div className="py-1">
                  <button
                    onClick={() => downloadData('all')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download All Trucks
                  </button>
                  <button
                    onClick={() => downloadData('daily')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download Today's Trucks
                  </button>
                  <button
                    onClick={() => {
                      setShowDateModal(true)
                      setShowDownloadDropdown(false)
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Download by Specific Date
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add New Truck
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Truck Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining Trips</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Verification</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trucks.map((truck) => (
                <tr key={truck._id} className="table-row">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {truck.truckNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.driverName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.driverPhone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {truck.remainingTrips}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`status-badge ${
                      truck.isBlocked ? 'status-error' :
                      truck.remainingTrips > 0 ? 'status-success' : 'status-warning'
                    }`}>
                      {truck.isBlocked ? 'Blocked' :
                       truck.remainingTrips > 0 ? 'Active' : 'No Trips'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {truck.lastVerification ? new Date(truck.lastVerification).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date for Download</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={handleDateDownload}
                  disabled={!selectedDate}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowDateModal(false)
                    setSelectedDate('')
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Truck</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Truck Number</label>
                <input
                  type="text"
                  value={formData.truckNumber}
                  onChange={(e) => setFormData({...formData, truckNumber: e.target.value.toUpperCase()})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone</label>
                <input
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({...formData, driverPhone: e.target.value})}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">Add Truck</button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TruckManagement
