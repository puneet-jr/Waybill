import { useState } from 'react'
import axios from 'axios'

const TruckVerification = () => {
  const [formData, setFormData] = useState({ truckNumber: '', mobileNumber: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.post('http://localhost:5000/api/verifications/verify', formData)
      setResult(response.data)
    } catch (error) {
      setResult({
        exists: false,
        message: error.response?.data?.message || 'Verification failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Truck Verification</h1>
      
      <div className="card p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Truck Number
              </label>
              <input
                type="text"
                value={formData.truckNumber}
                onChange={(e) => setFormData({...formData, truckNumber: e.target.value.toUpperCase()})}
                className="input-field"
                placeholder="ABC123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="input-field"
                placeholder="10-digit mobile number"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Truck'}
          </button>
        </form>
      </div>

      {result && (
        <div className={`card p-6 border-2 ${
          result.allowed ? 'border-green-200 bg-green-50' : 
          result.blocked ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
        }`}>
          <h3 className="text-lg font-medium mb-2">Verification Result</h3>
          <p className="text-gray-700">{result.message}</p>
          
          {result.truck && (
            <div className="mt-4 p-4 bg-white rounded border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Truck Number</p>
                  <p className="font-medium">{result.truck.truckNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{result.truck.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Trips</p>
                  <p className="font-medium">{result.truck.remainingTrips}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Attempts</p>
                  <p className="font-medium">{result.truck.attempts}/4</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TruckVerification
