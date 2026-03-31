import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Plus, Users, DollarSign, CheckCircle2 } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlementOverview, setSettlementOverview] = useState(null);
  const [settlementError, setSettlementError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    split_type: 'equal'
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [settlingKey, setSettlingKey] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.allSettled([
        api.get(`/api/groups/${groupId}`),
        api.get(`/api/expenses/group/${groupId}`),
        api.get(`/api/expenses/balances/group/${groupId}`),
        api.get(`/api/settlements/group/${groupId}`)
      ]);

      if (groupRes.status !== 'fulfilled' || expensesRes.status !== 'fulfilled' || balancesRes.status !== 'fulfilled') {
        throw new Error('Failed to load core group data');
      }

      setGroup(groupRes.value.data);
      setExpenses(expensesRes.value.data);
      setBalances(balancesRes.value.data);

      if (settlementsRes.status === 'fulfilled') {
        setSettlementOverview(settlementsRes.value.data);
        setSettlementError('');
      } else {
        setSettlementOverview(null);
        const statusCode = settlementsRes.reason?.response?.status;
        const backendMessage = settlementsRes.reason?.response?.data?.error;
        setSettlementError(
          backendMessage ||
          (statusCode === 403
            ? 'Settlement data is unavailable for this group right now.'
            : 'Unable to load settlement suggestions right now.')
        );
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const handleRecordSettlement = async (suggestion) => {
    const settlementKey = `${suggestion.payer_id}-${suggestion.payee_id}-${suggestion.amount}`;
    setSettlingKey(settlementKey);
    try {
      await api.post(`/api/settlements/group/${groupId}/record`, {
        payer_id: suggestion.payer_id,
        payee_id: suggestion.payee_id,
        amount: suggestion.amount,
      });
      fetchGroupData();
    } catch (error) {
      console.error('Error recording settlement:', error);
      alert(error.response?.data?.error || 'Failed to record settlement');
    } finally {
      setSettlingKey('');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/expenses/', {
        ...expenseData,
        amount: parseFloat(expenseData.amount),
        group_id: groupId
      });
      setShowExpenseModal(false);
      setExpenseData({ description: '', amount: '', split_type: 'equal' });
      fetchGroupData();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/groups/${groupId}/members/${memberEmail}`);
      setShowMemberModal(false);
      setMemberEmail('');
      fetchGroupData();
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.detail || 'Failed to add member');
    }
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-500 mt-2">{group.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Members</h2>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div key={member.user_id} className="flex items-center p-2 bg-gray-50 rounded">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-700">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Balances</h2>
              {balances && (
                <div className="space-y-2">
                  {balances.balances?.map((balance) => (
                    <div key={balance.user_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">{balance.user_name}</span>
                      <span className={`text-sm font-semibold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(balance.balance).toFixed(2)} {balance.balance >= 0 ? 'gets back' : 'owes'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="w-5 h-5 text-emerald-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Settle Up</h2>
              </div>
              {settlementError ? (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {settlementError}
                </p>
              ) : settlementOverview?.suggestions?.length ? (
                <div className="space-y-3">
                  {settlementOverview.suggestions.map((suggestion) => {
                    const settlementKey = `${suggestion.payer_id}-${suggestion.payee_id}-${suggestion.amount}`;
                    return (
                      <div
                        key={settlementKey}
                        className="border border-emerald-100 bg-emerald-50 rounded-lg p-4"
                      >
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">{suggestion.payer_name}</span>
                          {' '}pays{' '}
                          <span className="font-semibold">{suggestion.payee_name}</span>
                          {' '}to settle up.
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-emerald-700">
                            ${suggestion.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRecordSettlement(suggestion)}
                            disabled={settlingKey === settlementKey}
                            className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {settlingKey === settlementKey ? 'Recording...' : 'Mark Settled'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Everyone is settled up right now.</p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Settlement History</h2>
              {settlementOverview?.completed_settlements?.length ? (
                <div className="space-y-3">
                  {settlementOverview.completed_settlements.map((settlement) => (
                    <div key={settlement.settlement_id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-800">
                        <span className="font-semibold">{settlement.payer_name}</span>
                        {' '}paid{' '}
                        <span className="font-semibold">{settlement.payee_name}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-900">
                          ${settlement.amount.toFixed(2)}
                        </span>
                        <span className="text-gray-500">
                          {new Date(settlement.settled_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No settlements recorded yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Expenses</h2>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-3">
              {expenses
                .filter((expense) =>
                  expense.description.toLowerCase().includes(expenseSearch.toLowerCase())
                )
                .map((expense) => (
                <div key={expense.expense_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{expense.description}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Split: {expense.split_type} | {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.paid_by_name && (
                        <p className="text-sm text-indigo-600 mt-1">
                          Paid by {expense.paid_by_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.filter((e) =>
                e.description.toLowerCase().includes(expenseSearch.toLowerCase())
              ).length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {expenseSearch ? 'No expenses match your search' : 'No expenses yet'}
                </p>
              )}
            </div>
          </div>

          {showExpenseModal && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <form onSubmit={handleAddExpense}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Expense</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <input
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            value={expenseData.description}
                            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Split Type</label>
                          <select
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                            value={expenseData.split_type}
                            onChange={(e) => setExpenseData({ ...expenseData, split_type: e.target.value })}
                          >
                            <option value="equal">Equal Split</option>
                            <option value="percentage">Percentage Split</option>
                            <option value="exact">Exact Amount</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowExpenseModal(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showMemberModal && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <form onSubmit={handleAddMember}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add Member</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Email</label>
                        <input
                          type="email"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMemberModal(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
