import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Plus, Users, DollarSign, CheckCircle2, Search, ArrowRight, WalletCards, Activity, Orbit } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlementOverview, setSettlementOverview] = useState(null);
  const [settlementError, setSettlementError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
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
    setPageLoading(true);
    setPageError('');
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
      setPageError('Unable to load this group right now.');
    } finally {
      setPageLoading(false);
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

  if (pageLoading && !group) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-8 text-slate-400 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            Loading group workspace...
          </div>
        </div>
      </div>
    );
  }

  if (pageError && !group) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-100 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            {pageError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_72%_18%,rgba(168,85,247,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                  Group Workspace
                </span>
                <h1 className="mt-6 font-['Orbitron'] text-4xl font-bold uppercase tracking-[0.12em] text-slate-50 sm:text-5xl">
                  {group.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  {group.description || 'Track shared expenses, guide settlements, and monitor every move inside this group orbit.'}
                </p>
              </div>

              <div className="grid gap-4 self-end">
                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Members Online</p>
                      <p className="mt-2 font-['Orbitron'] text-3xl font-bold text-slate-100">{group.members?.length || 0}</p>
                    </div>
                    <Users className="h-5 w-5 text-cyan-300" />
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/45 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expense Feed</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">{expenses.length} records tracked</p>
                    </div>
                    <Activity className="h-5 w-5 text-fuchsia-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Members</h2>
                  <p className="mt-2 text-sm text-slate-400">Everyone currently inside this expense orbit.</p>
                </div>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300 transition hover:border-cyan-400/40 hover:text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div key={member.user_id} className="flex items-center rounded-2xl border border-cyan-400/10 bg-slate-950/35 p-3">
                    <Users className="mr-3 h-4 w-4 text-cyan-300" />
                    <span className="text-sm text-slate-200">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Balances</h2>
                  <p className="mt-2 text-sm text-slate-400">See who owes, who is ahead, and where the group stands.</p>
                </div>
                <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  <DollarSign className="h-5 w-5" />
                </span>
              </div>
              {balances && (
                <div className="space-y-2">
                  {balances.balances?.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between rounded-2xl border border-cyan-400/10 bg-slate-950/35 p-4">
                      <span className="text-sm font-medium text-slate-200">{balance.user_name}</span>
                      <span className={`text-sm font-semibold ${balance.balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        ${Math.abs(balance.balance).toFixed(2)} {balance.balance >= 0 ? 'gets back' : 'owes'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Settle Up</h2>
                  <p className="mt-2 text-sm text-slate-400">Minimal payment paths to bring everyone back to zero.</p>
                </div>
                <span className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                  <Orbit className="h-5 w-5" />
                </span>
              </div>
              {settlementError ? (
                <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  {settlementError}
                </p>
              ) : settlementOverview?.suggestions?.length ? (
                <div className="space-y-3">
                  {settlementOverview.suggestions.map((suggestion) => {
                    const settlementKey = `${suggestion.payer_id}-${suggestion.payee_id}-${suggestion.amount}`;
                    return (
                      <div
                        key={settlementKey}
                        className="rounded-[1.5rem] border border-emerald-400/15 bg-emerald-400/10 p-4"
                      >
                        <p className="text-sm text-slate-100">
                          <span className="font-semibold">{suggestion.payer_name}</span>
                          {' '}pays{' '}
                          <span className="font-semibold">{suggestion.payee_name}</span>
                          {' '}to settle up.
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-emerald-300">
                            ${suggestion.amount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRecordSettlement(suggestion)}
                            disabled={settlingKey === settlementKey}
                            className="inline-flex items-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
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
                <p className="text-slate-400">Everyone is settled up right now.</p>
              )}
            </div>

            <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Settlement History</h2>
                  <p className="mt-2 text-sm text-slate-400">Recorded payment completions inside this group.</p>
                </div>
                <span className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-3 text-fuchsia-300">
                  <WalletCards className="h-5 w-5" />
                </span>
              </div>
              {settlementOverview?.completed_settlements?.length ? (
                <div className="space-y-3">
                  {settlementOverview.completed_settlements.map((settlement) => (
                    <div key={settlement.settlement_id} className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/35 p-4">
                      <p className="text-sm text-slate-100">
                        <span className="font-semibold">{settlement.payer_name}</span>
                        {' '}paid{' '}
                        <span className="font-semibold">{settlement.payee_name}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-100">
                          ${settlement.amount.toFixed(2)}
                        </span>
                        <span className="text-slate-500">
                          {new Date(settlement.settled_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No settlements recorded yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-400/10 bg-slate-900/60 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-['Orbitron'] text-xl font-bold uppercase tracking-[0.12em] text-slate-100">Expenses</h2>
                <p className="mt-2 text-sm text-slate-400">Search and review every spend event tied to this group.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full rounded-2xl border border-cyan-400/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
            <div className="space-y-3">
              {expenses
                .filter((expense) =>
                  expense.description.toLowerCase().includes(expenseSearch.toLowerCase())
                )
                .map((expense) => (
                <div key={expense.expense_id} className="rounded-[1.5rem] border border-cyan-400/10 bg-slate-950/35 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-slate-100">{expense.description}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Split: {expense.split_type} | {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.paid_by_name && (
                        <p className="mt-1 text-sm text-cyan-300">
                          Paid by {expense.paid_by_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-100">${expense.amount.toFixed(2)}</p>
                      <ArrowRight className="ml-auto mt-3 h-4 w-4 text-cyan-300" />
                    </div>
                  </div>
                </div>
              ))}
              {expenses.filter((e) =>
                e.description.toLowerCase().includes(expenseSearch.toLowerCase())
              ).length === 0 && (
                <p className="py-8 text-center text-slate-400">
                  {expenseSearch ? 'No expenses match your search' : 'No expenses yet'}
                </p>
              )}
            </div>
          </div>

          {showExpenseModal && (
            <div className="fixed inset-0 z-40 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setShowExpenseModal(false)}
                />
                <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-900/90 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
                  <form onSubmit={handleAddExpense}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6">
                        <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                          New Expense
                        </span>
                        <h3 className="mt-5 font-['Orbitron'] text-2xl font-bold uppercase tracking-[0.12em] text-slate-100">
                          Add Expense Event
                        </h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Description</label>
                          <input
                            type="text"
                            required
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            value={expenseData.description}
                            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Split Type</label>
                          <select
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
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
                    <div className="relative flex flex-col-reverse gap-3 border-t border-cyan-400/10 bg-slate-950/60 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowExpenseModal(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
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
            <div className="fixed inset-0 z-40 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setShowMemberModal(false)}
                />
                <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-900/90 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(92,225,230,0.06),transparent_35%,rgba(168,85,247,0.08)_70%,transparent)]" />
                  <form onSubmit={handleAddMember}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6">
                        <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-cyan-300">
                          Invite Member
                        </span>
                        <h3 className="mt-5 font-['Orbitron'] text-2xl font-bold uppercase tracking-[0.12em] text-slate-100">
                          Expand The Group
                        </h3>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">Member Email</label>
                        <input
                          type="email"
                          required
                          className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="relative flex flex-col-reverse gap-3 border-t border-cyan-400/10 bg-slate-950/60 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-cyan-300"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMemberModal(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
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
