"use client"
import React, { useEffect, useState, useOptimistic , useTransition} from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/services/localstorageServices/getAndSave";
import { HttpStatusText } from "@/enums/HttpStatusCodeAndStatus";
import ExpenseReport from "@/components/ExpenseReport";

interface SubExpense {
  _id: string;
  date: Date;
  isActive: boolean;
  totalAmount: number;
}

interface Member {
  _id: string;
  fullName: string;
  email: string;
  dp?: string;
}

interface SearchUser {
  _id: string;
  fullName: string;
  email: string;
}

interface Category {
  _id: string
  title: string
}

interface Item {
  _id: string
  name: string
  amount?: number // optional by design
}

const ExpenseDetailPage = () => {
  const params = useParams();
  const expenseId = params.id as string;
  const router = useRouter();

  // State for SubExpenses
  const [subExpenses, setSubExpenses] = useState<SubExpense[]>([]);
  const [subExpensesLoading, setSubExpensesLoading] = useState<boolean>(false);
  const [subExpensesError, setSubExpensesError] = useState<string>("");
  
  // State for Members
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState<boolean>(false);
  const [membersError, setMembersError] = useState<string>("");
  
  // State for Categories and Items
  const [selectedSubExpenseId, setSelectedSubExpenseId] = useState<string>("");
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  
  const [categories, setCategories] = useState<Category[]>([])
const [items, setItems] = useState<Record<string, Item[]>>({})

const [optimisticCategories, addOptimisticCategory] = useOptimistic(
  categories,
  (state, category: Category) => [...state, category]
)

const [optimisticItems, addOptimisticItem] = useOptimistic(
  items,
  (state, payload: { categoryId: string; item: Item }) => ({
    ...state,
    [payload.categoryId]: [
      ...(state[payload.categoryId] || []),
      payload.item
    ]
  })
)

const [isPending, startTransition] = useTransition()

  // Modal states
  const [isAddSubExpenseModalOpen, setIsAddSubExpenseModalOpen] = useState<boolean>(false);
  const [isEditSubExpenseModalOpen, setIsEditSubExpenseModalOpen] = useState<boolean>(false);
  const [isDeleteSubExpenseModalOpen, setIsDeleteSubExpenseModalOpen] = useState<boolean>(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState<boolean>(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState<boolean>(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState<boolean>(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState<boolean>(false);
  
  // Form states
  const [newSubExpense, setNewSubExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    isActive: true,
    totalAmount: 0
  });
  const [editSubExpense, setEditSubExpense] = useState<{
    _id: string;
    date: string;
    isActive: boolean;
    totalAmount: number;
  } | null>(null);
  const [deleteSubExpenseId, setDeleteSubExpenseId] = useState<string>("");
  const [deleteMemberId, setDeleteMemberId] = useState<string>("");
  
  // Category and Item states
  const [newCategoryTitle, setNewCategoryTitle] = useState<string>("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [newItem, setNewItem] = useState({ name: "", amount: 0 });
  const [editItem, setEditItem] = useState<Item & { categoryId: string } | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  
  // Member search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch SubExpenses
  const fetchSubExpenses = async () => {
    try {
      setSubExpensesLoading(true);
      setSubExpensesError("");
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUBEXPENSE}?expenseId=${expenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubExpenses(data.data || []);
      } else if (data.error === HttpStatusText.UNAUTHORIZED) {
        router.replace("/signin");
      } else {
        setSubExpensesError("Failed to fetch subexpenses!");
      }
    } catch (error) {
      setSubExpensesError("Failed to fetch subexpenses!");
    } finally {
      setSubExpensesLoading(false);
    }
  };

  // Fetch Members
  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError("");
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEMBER}?expenseId=${expenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMembers(data.data || []);
      } else if (data.error === HttpStatusText.UNAUTHORIZED) {
        router.replace("/signin");
      } else {
        setMembersError("Failed to fetch members!");
      }
    } catch (error) {
      setMembersError("Failed to fetch members!");
    } finally {
      setMembersLoading(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async (subExpenseId: string) => {
    try {
      setCategoriesLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CATEGORY}?subExpenseId=${subExpenseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const fetchedCategories = data.data || [];
        setCategories(fetchedCategories);
        
        // Fetch items for each category
        fetchedCategories.forEach((category: Category) => {
          fetchItems(category._id);
        });
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch Items
  const fetchItems = async (categoryId: string) => {
  try {
    const token = getToken()
    if (!token) return router.replace("/signin")

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ITEMS}?id=${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const json = await res.json()

    if (!json.success) return

    // 🔥 NORMALIZATION (MANDATORY)
    const normalized: Item[] = (json.data || []).map((doc: any) => ({
      _id: doc.item?._id ?? doc._id,
      name: doc.item?.name ?? "Unnamed item",
      amount:
        typeof doc.item?.amount === "number"
          ? doc.item.amount
          : undefined
    }))

    setItems(prev => ({
      ...prev,
      [categoryId]: normalized
    }))
  } catch (err) {
    console.error("fetchItems failed", err)
  }
}


  useEffect(() => {
    fetchSubExpenses();
    fetchMembers();
  }, [expenseId]);

  // Search users by email
  const searchUsers = async (query: string) => {
    if (!query.includes("@")) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SEARCH_BY_EMAIL}?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add SubExpense
  const handleAddSubExpense = async () => {
    if (newSubExpense.totalAmount < 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_SUBEXPENSE as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date(newSubExpense.date).getTime(),
          isActive: newSubExpense.isActive,
          totalAmount: newSubExpense.totalAmount,
          expenseId: expenseId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddSubExpenseModalOpen(false);
        setNewSubExpense({
          date: new Date().toISOString().split('T')[0],
          isActive: true,
          totalAmount: 0
        });
        await fetchSubExpenses();
      } else {
        alert("Failed to add subexpense!");
      }
    } catch (error) {
      alert("Failed to add subexpense!");
    } finally {
      setActionLoading(false);
    }
  };

  // Edit SubExpense
  const handleEditSubExpense = async () => {
    if (!editSubExpense) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUBEXPENSE}?id=${editSubExpense._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: new Date(editSubExpense.date).getTime(),
            isActive: editSubExpense.isActive,
            totalAmount: editSubExpense.totalAmount,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsEditSubExpenseModalOpen(false);
        setEditSubExpense(null);
        await fetchSubExpenses();
      } else {
        alert("Failed to update subexpense!");
      }
    } catch (error) {
      alert("Failed to update subexpense!");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete SubExpense
  const handleDeleteSubExpense = async () => {
    if (!deleteSubExpenseId) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUBEXPENSE}?id=${deleteSubExpenseId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteSubExpenseModalOpen(false);
        setDeleteSubExpenseId("");
        await fetchSubExpenses();
      } else {
        alert("Failed to delete subexpense!");
      }
    } catch (error) {
      alert("Failed to delete subexpense!");
    } finally {
      setActionLoading(false);
    }
  };

  // Add Member
  const handleAddMember = async () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_MEMBER as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          expenseId: expenseId,
          userId: selectedUser._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddMemberModalOpen(false);
        setSelectedUser(null);
        setSearchQuery("");
        setSearchResults([]);
        await fetchMembers();
      } else {
        alert(data.error || "Failed to add member!");
      }
    } catch (error) {
      alert("Failed to add member!");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deleteMemberId) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEMBER}?userId=${deleteMemberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteMemberModalOpen(false);
        setDeleteMemberId("");
        await fetchMembers();
      } else {
        alert("Failed to remove member!");
      }
    } catch (error) {
      alert("Failed to remove member!");
    } finally {
      setActionLoading(false);
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCategoryTitle.trim()) {
      alert("Please enter a category title");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const optimisticCat = { _id: tempId, title: newCategoryTitle };
    startTransition(() => {
  addOptimisticCategory(optimisticCat)
  })

    try {
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_CATEGORY as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subExpenseId: selectedSubExpenseId,
          title: newCategoryTitle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAddCategoryModalOpen(false);
        setNewCategoryTitle("");
        await fetchCategories(selectedSubExpenseId);
      } else {
        alert("Failed to add category!");
        await fetchCategories(selectedSubExpenseId);
      }
    } catch (error) {
      alert("Failed to add category!");
      await fetchCategories(selectedSubExpenseId);
    }
  };

  // Edit Category
  const handleEditCategory = async () => {
    if (!editCategory || !editCategory.title.trim()) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_CATEGORY as string, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _id: editCategory._id,
          title: editCategory.title,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditCategoryModalOpen(false);
        setEditCategory(null);
        await fetchCategories(selectedSubExpenseId);
      } else {
        alert("Failed to update category!");
      }
    } catch (error) {
      alert("Failed to update category!");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CATEGORY}?id=${deleteCategoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteCategoryModalOpen(false);
        setDeleteCategoryId("");
        await fetchCategories(selectedSubExpenseId);
      } else {
        alert("Failed to delete category!");
      }
    } catch (error) {
      alert("Failed to delete category!");
    } finally {
      setActionLoading(false);
    }
  };

  // Add Item
  const handleAddItem = async (categoryId: string) => {
  if (!newItem.name.trim()) return alert("Item name required")

  const tempId = `temp-${Date.now()}`

  const optimisticItem: Item = {
    _id: tempId,
    name: newItem.name,
    amount: newItem.amount > 0 ? newItem.amount : undefined
  }

  startTransition(() => {
    addOptimisticItem({ categoryId, item: optimisticItem })
  })

  try {
    const token = getToken()
    if (!token) return router.replace("/signin")

    const res = await fetch(process.env.NEXT_PUBLIC_ITEMS!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        categoryId,
        item: {
          name: newItem.name,
          amount: newItem.amount
        }
      })
    })

    const data = await res.json()
    if (!data.success) throw new Error()

    await fetchItems(categoryId)
    setNewItem({ name: "", amount: 0 })
  } catch {
    await fetchItems(categoryId) // rollback
  }
}


  // Edit Item
  const handleEditItem = async () => {
    if (!editItem || !editItem.name.trim() || editItem?.amount && editItem?.amount <= 0) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(process.env.NEXT_PUBLIC_ITEMS as string, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: editItem._id,
          name: editItem.name,
          amount: editItem.amount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditItemModalOpen(false);
        const categoryId = editItem.categoryId;
        setEditItem(null);
        await fetchItems(categoryId);
      } else {
        alert("Failed to update item!");
      }
    } catch (error) {
      alert("Failed to update item!");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deleteItemId) return;

    try {
      setActionLoading(true);
      const token = getToken();

      if (!token) {
        router.replace("/signin");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ITEMS}?id=${deleteItemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsDeleteItemModalOpen(false);
        setDeleteItemId("");
        await fetchCategories(selectedSubExpenseId);
      } else {
        alert("Failed to delete item!");
      }
    } catch (error) {
      alert("Failed to delete item!");
    } finally {
      setActionLoading(false);
    }
  };

  // Open category modal for a subexpense
  const openCategoryModal = (subExpenseId: string) => {
    setSelectedSubExpenseId(subExpenseId);
    setIsCategoryModalOpen(true);
    fetchCategories(subExpenseId);
  };

  const openEditSubExpenseModal = (subExpense: SubExpense) => {
    setEditSubExpense({
      _id: subExpense._id,
      date: new Date(subExpense.date).toISOString().split('T')[0],
      isActive: subExpense.isActive,
      totalAmount: subExpense.totalAmount,
    });
    setIsEditSubExpenseModalOpen(true);
  };

  const openDeleteSubExpenseModal = (id: string) => {
    setDeleteSubExpenseId(id);
    setIsDeleteSubExpenseModalOpen(true);
  };

  const openDeleteMemberModal = (id: string) => {
    setDeleteMemberId(id);
    setIsDeleteMemberModalOpen(true);
  };

  // Handle quick add item (creates default category if none exists)
  const handleQuickAddItem = async (subExpenseId: string) => {
    setSelectedSubExpenseId(subExpenseId);
    await fetchCategories(subExpenseId);
    
    // Check if categories exist
    const token = getToken();
    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CATEGORY}?subExpenseId=${subExpenseId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.success && (!data.data || data.data.length === 0)) {
      // Create default category
      const createResponse = await fetch(process.env.NEXT_PUBLIC_CATEGORY as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subExpenseId: subExpenseId,
          title: "Category 1",
        }),
      });

      const createData = await createResponse.json();
      
      if (createData.success) {
        setCategories([createData.data]);
        setSelectedCategoryId(createData.data._id);
      }
    } else if (data.success && data.data.length > 0) {
      setCategories(data.data);
      setSelectedCategoryId(data.data[0]._id);
    }
    
    setIsAddItemModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <ExpenseReport/>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Expenses
          </button>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Expense Details</h1>
          <p className="text-blue-700">Manage subexpenses, members, categories, and items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SubExpenses Section - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-blue-50">
                <h2 className="text-2xl font-bold text-blue-900">SubExpenses</h2>
                <button
                  onClick={() => setIsAddSubExpenseModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add SubExpense
                </button>
              </div>

              <div className="p-6">
                {subExpensesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Loading subexpenses...</p>
                  </div>
                ) : subExpensesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{subExpensesError}</p>
                  </div>
                ) : subExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block bg-blue-100 p-6 rounded-full mb-4">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">No SubExpenses</h3>
                    <p className="text-gray-600">Add your first subexpense to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subExpenses.map((subExpense) => (
                      <div
                        key={subExpense._id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
                        onClick={() => openCategoryModal(subExpense._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-bold text-blue-900">
                                ₹{subExpense.totalAmount.toLocaleString()}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  subExpense.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {subExpense.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(subExpense.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">Click to view categories & items →</p>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditSubExpenseModal(subExpense)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteSubExpenseModal(subExpense._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Members Section - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-blue-50">
                <h2 className="text-2xl font-bold text-blue-900">Members</h2>
                <button
                  onClick={() => setIsAddMemberModalOpen(true)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {membersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600 text-sm">Loading members...</p>
                  </div>
                ) : membersError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 text-sm">{membersError}</p>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-block bg-blue-100 p-4 rounded-full mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">No Members</h3>
                    <p className="text-xs text-gray-600">Add members to collaborate.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            {member.dp ? (
                              <img
                                src={member.dp}
                                alt={member.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-sm">
                                {member.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {member.fullName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openDeleteMemberModal(member._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category & Items Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-blue-50">
              <h2 className="text-2xl font-bold text-blue-900">Categories & Items</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Add Category
                </button>
                <button
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setCategories([]);
                    setItems({});
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {categoriesLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
              ) : optimisticCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block bg-blue-100 p-6 rounded-full mb-4">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">No Categories</h3>
                  <p className="text-gray-600">Add your first category to organize items.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {optimisticCategories.map((category) => (
                    <div key={category._id} className="border-2 border-gray-200 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-blue-900">{category.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategoryId(category._id);
                              setIsAddItemModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            + Add Item
                          </button>
                          <button
                            onClick={() => {
                              setEditCategory(category);
                              setIsEditCategoryModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setDeleteCategoryId(category._id);
                              setIsDeleteCategoryModalOpen(true);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-2">
                        {(optimisticItems[category._id] || []).length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No items in this category</p>
                        ) : (
                          (optimisticItems[category._id] || []).map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-blue-600">{typeof item.amount === "number"
          ? `₹${item.amount.toLocaleString()}`
          : "not provided"} </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditItem({ ...item, categoryId: category._id });
                                    setIsEditItemModalOpen(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteItemId(item._id);
                                    setIsDeleteItemModalOpen(true);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All previous modals (SubExpense Add/Edit/Delete, Member Add/Delete) remain the same */}
      {/* I'll include them in the next part of the file */}

      {/* Add SubExpense Modal */}
      {isAddSubExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Add SubExpense</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newSubExpense.date}
                  onChange={(e) => setNewSubExpense({ ...newSubExpense, date: e.target.value })}
                  className="w-full px-4 py-2 text-zinc-950 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                <input
                  type="number"
                  value={newSubExpense.totalAmount}
                  onChange={(e) => setNewSubExpense({ ...newSubExpense, totalAmount: Number(e.target.value) })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border text-zinc-950 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newSubExpense.isActive}
                  onChange={(e) => setNewSubExpense({ ...newSubExpense, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddSubExpenseModalOpen(false);
                  setNewSubExpense({
                    date: new Date().toISOString().split('T')[0],
                    isActive: true,
                    totalAmount: 0
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubExpense}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  "Add SubExpense"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit SubExpense Modal */}
      {isEditSubExpenseModalOpen && editSubExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Edit SubExpense</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editSubExpense.date}
                  onChange={(e) => setEditSubExpense({ ...editSubExpense, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                <input
                  type="number"
                  value={editSubExpense.totalAmount}
                  onChange={(e) => setEditSubExpense({ ...editSubExpense, totalAmount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editSubExpense.isActive}
                  onChange={(e) => setEditSubExpense({ ...editSubExpense, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsEditSubExpenseModalOpen(false);
                  setEditSubExpense(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubExpense}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  "Update SubExpense"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete SubExpense Modal */}
      {isDeleteSubExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-red-700">Delete SubExpense</h2>
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
              <p className="text-gray-700">Are you sure you want to delete this subexpense?</p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteSubExpenseModalOpen(false);
                  setDeleteSubExpenseId("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubExpense}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete SubExpense"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Add Member</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search by Email</label>
              <input
                type="email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                disabled={actionLoading}
              />
              
              {searchLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}
              
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedUser?._id === user._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </button>
                  ))}
                </div>
              )}
              
              {selectedUser && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Selected:</span> {selectedUser.fullName}
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddMemberModalOpen(false);
                  setSelectedUser(null);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading || !selectedUser}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Modal */}
      {isDeleteMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-red-700">Remove Member</h2>
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
              <p className="text-gray-700">Are you sure you want to remove this member from the expense?</p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteMemberModalOpen(false);
                  setDeleteMemberId("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMember}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Removing...
                  </>
                ) : (
                  "Remove Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Add Category</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Title</label>
              <input
                type="text"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                placeholder="Enter category title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setNewCategoryTitle("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && editCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Edit Category</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Title</label>
              <input
                type="text"
                value={editCategory.title}
                onChange={(e) => setEditCategory({...editCategory, title: e.target.value})}
                placeholder="Enter category title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={actionLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleEditCategory()}
              />
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsEditCategoryModalOpen(false);
                  setEditCategory(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {isDeleteCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-red-700">Delete Category</h2>
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
              <p className="text-gray-700">Are you sure you want to delete this category? All items in this category will also be deleted.</p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteCategoryModalOpen(false);
                  setDeleteCategoryId("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Add Item</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: Number(e.target.value) })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAddItemModalOpen(false);
                  setNewItem({ name: "", amount: 0 });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddItem(selectedCategoryId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditItemModalOpen && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-blue-900">Edit Item</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={editItem.amount}
                  onChange={(e) => setEditItem({ ...editItem, amount: Number(e.target.value) })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={actionLoading}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsEditItemModalOpen(false);
                  setEditItem(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  "Update Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Modal */}
      {isDeleteItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-2xl font-bold text-red-700">Delete Item</h2>
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
              <p className="text-gray-700">Are you sure you want to delete this item?</p>
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteItemModalOpen(false);
                  setDeleteItemId("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseDetailPage;