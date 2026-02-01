"use client"
import { HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";
import { expenseGetInterfaces, expenseInterFaceGetResponse, Pagination } from "@/interfaces/ApiReponses/v1/expense/expenseInterfaces";
import { getToken } from "@/services/localstorageServices/getAndSave";
import { useRouter } from "next/navigation";
import React, { useEffect, useState }  from "react";

const HomePage = ()=>{
  const [expenses, setExpenses] = useState<expenseInterFaceGetResponse[]>([])
  const [isLoading,setIsLoading] = useState<boolean>(false)
  const [pagination, setPagination] = useState<Pagination>({
    page:1,
    limit:20,
    totalDocumentCount:0
  })
  const [error, setError] = useState<string>("")
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [newExpenseTitle, setNewExpenseTitle] = useState<string>("")
  const [editExpense, setEditExpense] = useState<{_id: string, title: string} | null>(null)
  const [deleteExpenseId, setDeleteExpenseId] = useState<string>("")
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  
  const router = useRouter()
  
  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      setError("")
      const token = getToken()

      if(!token){
        router.replace("/signin")
        return 
      }
      const response = await fetch(process.env.NEXT_PUBLIC_EXPENSE as string,{
        method:"GET",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${token}`
        }
      })
      const data:expenseGetInterfaces = await response.json()
      if(data.success && data.pagination){
        setExpenses(data.data)
        setPagination(data.pagination)
      }else if(data.error == HttpStatusText.UNAUTHORIZED ){
        router.replace('/signin')
      } else if(!data.success){
        setError("Failed to fetch data!")
      } 
    } catch (error) {
      setError("Failed to fetch data!")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    fetchExpenses()
  },[])

  const handleAddExpense = async () => {
    if(!newExpenseTitle.trim()) {
      alert("Please enter a title")
      return
    }

    try {
      setActionLoading(true)
      const token = getToken()

      if(!token){
        router.replace("/signin")
        return 
      }

      const response = await fetch(process.env.NEXT_PUBLIC_EXPENSE as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newExpenseTitle })
      })

      const data = await response.json()

      if(data.success) {
        setIsAddModalOpen(false)
        setNewExpenseTitle("")
        await fetchExpenses()
      } else if(data.error == HttpStatusText.UNAUTHORIZED) {
        router.replace('/signin')
      } else {
        alert("Failed to add expense!")
      }
    } catch (error) {
      alert("Failed to add expense!")
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditExpense = async () => {
    if(!editExpense || !editExpense.title.trim()) {
      alert("Please enter a title")
      return
    }

    try {
      setActionLoading(true)
      const token = getToken()

      if(!token){
        router.replace("/signin")
        return 
      }

      const response = await fetch(process.env.NEXT_PUBLIC_EXPENSE as string, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          _id: editExpense._id, 
          title: editExpense.title 
        })
      })

      const data = await response.json()

      if(data.success) {
        setIsEditModalOpen(false)
        setEditExpense(null)
        await fetchExpenses()
      } else if(data.error == HttpStatusText.UNAUTHORIZED) {
        router.replace('/signin')
      } else {
        alert("Failed to update expense!")
      }
    } catch (error) {
      alert("Failed to update expense!")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteExpense = async () => {
    if(!deleteExpenseId) return

    try {
      setActionLoading(true)
      const token = getToken()

      if(!token){
        router.replace("/signin")
        return 
      }

      const response = await fetch(process.env.NEXT_PUBLIC_EXPENSE as string, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ _id: deleteExpenseId })
      })

      const data = await response.json()

      if(data.success) {
        setIsDeleteModalOpen(false)
        setDeleteExpenseId("")
        await fetchExpenses()
      } else if(data.error == HttpStatusText.UNAUTHORIZED) {
        router.replace('/signin')
      } else {
        alert("Failed to delete expense!")
      }
    } catch (error) {
      alert("Failed to delete expense!")
    } finally {
      setActionLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/expenses/${id}`)
  }

  const openEditModal = (expense: expenseInterFaceGetResponse) => {
    setEditExpense({ _id: expense._id, title: expense.title })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (id: string) => {
    setDeleteExpenseId(id)
    setIsDeleteModalOpen(true)
  }

  if(isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-blue-900 font-medium">Loading expenses...</p>
        </div>
      </div>
    )
  }

  if(error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="bg-white border-l-4 border-red-500 p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-red-700 font-bold text-lg mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchExpenses}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Expense Records</h1>
            <p className="text-blue-700">Manage and track your expense records</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-blue-900">{expenses.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expense Cards Grid */}
        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block bg-blue-100 p-6 rounded-full mb-4">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-900 mb-2">No Expenses Found</h3>
            <p className="text-gray-600 mb-4">Start by creating your first expense record.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenses.map((expense, index) => (
              <div 
                key={expense._id} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border-t-4 border-blue-600"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-900 mb-1">
                        {expense.title}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {expense._id}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => openEditModal(expense)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(expense._id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">
                      Record #{index + 1}
                    </span>
                    <button
                      onClick={() => handleViewDetails(expense._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex items-center gap-2 font-medium text-sm"
                    >
                      <span>Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {expenses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {pagination.page} • Showing {expenses.length} of {pagination.totalDocumentCount || expenses.length} records
            </p>
            <p className="text-sm text-blue-600 font-medium">
              Limit: {pagination.limit} per page
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Add New Expense</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title
              </label>
              <input
                type="text"
                value={newExpenseTitle}
                onChange={(e) => setNewExpenseTitle(e.target.value)}
                placeholder="Enter expense title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={actionLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleAddExpense()}
              />
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setNewExpenseTitle("")
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  'Add Expense'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Edit Expense</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Title
              </label>
              <input
                type="text"
                value={editExpense.title}
                onChange={(e) => setEditExpense({...editExpense, title: e.target.value})}
                placeholder="Enter expense title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={actionLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleEditExpense()}
              />
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditExpense(null)
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditExpense}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  'Update Expense'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-red-700">Delete Expense</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Are you sure?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-gray-700">
                Are you sure you want to delete this expense? All associated data will be permanently removed.
              </p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeleteExpenseId("")
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage