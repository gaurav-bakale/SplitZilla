import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Plus, Users, DollarSign, CheckCircle2, Search, ArrowRight, WalletCards, Activity, Orbit, TimerReset, Loader } from 'lucide-react';

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
  const [expenseSearch, setExpenseSearch] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [payingSettlementId, setPayingSettlementId] = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});

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

  const handleCreateSettlementPlan = async () => {
    setCreatingPlan(true);
    try {
      await api.post(`/api/settlements/group/${groupId}/plans`);
      await fetchGroupData();
    } catch (error) {
      console.error('Error creating settlement plan:', error);
      alert(error.response?.data?.error || 'Failed to create settlement plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleRecordPayment = async (settlement) => {
    const rawAmount = paymentInputs[settlement.settlement_id] ?? settlement.outstanding_amount;
    const amount = parseFloat(rawAmount);

    if (!amount || amount <= 0) {
      alert('Enter a payment amount greater than 0');
      return;
    }

    setPayingSettlementId(settlement.settlement_id);
    try {
      await api.post(`/api/settlements/group/${groupId}/${settlement.settlement_id}/payments`, {
        amount,
      });
      setPaymentInputs((current) => ({
        ...current,
        [settlement.settlement_id]: '',
      }));
      await fetchGroupData();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setPayingSettlementId('');
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

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  const activeSettlements = settlementOverview?.active_settlements || [];
  const recommendedPlan = settlementOverview?.recommended_plan || settlementOverview?.suggestions || [];
  const settlementMetrics = settlementOverview?.metrics || {};

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
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex items-center rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-sky-300">
                  Group
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
                  {group.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                  {group.description || 'Track shared expenses, review balances, and manage settlements.'}
                </p>
              </div>

              <div className="grid gap-4 self-end">
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Members Online</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-100">{group.members?.length || 0}</p>
                    </div>
                    <Users className="h-5 w-5 text-sky-300" />
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expense Feed</p>
                      <p className="mt-2 text-lg font-semibold text-slate-100">{expenses.length} records tracked</p>
                    </div>
                    <Activity className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Members</h2>
                  <p className="mt-2 text-sm text-slate-400">Everyone currently inside this expense orbit.</p>
                </div>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sky-300 transition hover:border-slate-600 hover:text-white"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div key={member.user_id} className="flex items-center rounded-2xl border border-slate-800 bg-slate-950 p-3">
                    <Users className="mr-3 h-4 w-4 text-sky-300" />
                    <span className="text-sm text-slate-200">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Balances</h2>
                  <p className="mt-2 text-sm text-slate-400">See who owes, who is ahead, and where the group stands.</p>
                </div>
                <span className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sky-300">
                  <DollarSign className="h-5 w-5" />
                </span>
              </div>
              {balances && (
                <div className="space-y-2">
                  {balances.balances?.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4">
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

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Settlement Orchestration</h2>
                  <p className="mt-2 text-sm text-slate-400">Generate transfer plans, record partial payments, and track reimbursements until the group is closed out.</p>
                </div>
                <span className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sky-300">
                  <Orbit className="h-5 w-5" />
                </span>
              </div>
              {settlementError ? (
                <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                  {settlementError}
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Open Transfers</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-100">{settlementMetrics.open_transfers || 0}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Outstanding</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-100">{formatCurrency(settlementMetrics.total_outstanding)}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Paid Through</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-100">{formatCurrency(settlementMetrics.total_paid)}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">Recommended transfer plan</h3>
                        <p className="mt-2 text-sm text-slate-400">
                          {activeSettlements.length
                            ? 'An active plan already exists. Continue recording payments until it is complete.'
                            : recommendedPlan.length
                              ? 'Generate the optimized transfer set below to start reimbursement tracking.'
                              : 'No additional transfer plan is needed right now.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateSettlementPlan}
                        disabled={creatingPlan || activeSettlements.length > 0 || !recommendedPlan.length}
                        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {creatingPlan ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <TimerReset className="mr-2 h-4 w-4" />}
                        {creatingPlan ? 'Generating...' : 'Generate Plan'}
                      </button>
                    </div>

                    {recommendedPlan.length > 0 ? (
                      <div className="mt-5 space-y-3">
                        {recommendedPlan.map((suggestion) => (
                          <div
                            key={`${suggestion.payer_id}-${suggestion.payee_id}-${suggestion.amount}`}
                            className="rounded-[1.25rem] border border-slate-800 bg-slate-900 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-slate-100">
                                <span className="font-semibold">{suggestion.payer_name}</span>
                                {' '}pays{' '}
                                <span className="font-semibold">{suggestion.payee_name}</span>
                              </p>
                              <span className="text-sm font-semibold text-slate-200">{formatCurrency(suggestion.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-slate-400">Everything is already reconciled or covered by active transfers.</p>
                    )}
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">Active reimbursements</h3>
                        <p className="mt-2 text-sm text-slate-400">Track payment progress against each orchestrated transfer.</p>
                      </div>
                      <span className="rounded-2xl border border-slate-800 bg-slate-900 p-3 text-sky-300">
                        <WalletCards className="h-5 w-5" />
                      </span>
                    </div>

                    {activeSettlements.length ? (
                      <div className="mt-5 space-y-4">
                        {activeSettlements.map((settlement) => (
                          <div key={settlement.settlement_id} className="rounded-[1.5rem] border border-slate-800 bg-slate-900 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm text-slate-100">
                                  <span className="font-semibold">{settlement.payer_name}</span>
                                  {' '}pays{' '}
                                  <span className="font-semibold">{settlement.payee_name}</span>
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 uppercase tracking-[0.18em] text-sky-300">
                                    {settlement.status}
                                  </span>
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                                    Planned {formatCurrency(settlement.amount)}
                                  </span>
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                                    Paid {formatCurrency(settlement.paid_amount)}
                                  </span>
                                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                                    Outstanding {formatCurrency(settlement.outstanding_amount)}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full max-w-xs">
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                  <span>Progress</span>
                                  <span>{Number(settlement.progress_percent).toFixed(0)}%</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-800">
                                  <div
                                    className="h-2 rounded-full bg-sky-400 transition-all"
                                    style={{ width: `${Math.min(Number(settlement.progress_percent) || 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={paymentInputs[settlement.settlement_id] ?? settlement.outstanding_amount}
                                onChange={(e) =>
                                  setPaymentInputs((current) => ({
                                    ...current,
                                    [settlement.settlement_id]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30 md:max-w-[200px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRecordPayment(settlement)}
                                disabled={payingSettlementId === settlement.settlement_id}
                                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {payingSettlementId === settlement.settlement_id ? (
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                {payingSettlementId === settlement.settlement_id ? 'Recording...' : 'Record Payment'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-slate-400">No active reimbursement plan yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Settlement History</h2>
                  <p className="mt-2 text-sm text-slate-400">Recorded payment completions inside this group.</p>
                </div>
                <span className="rounded-2xl border border-slate-800 bg-slate-950 p-3 text-sky-300">
                  <WalletCards className="h-5 w-5" />
                </span>
              </div>
              {settlementOverview?.completed_settlements?.length ? (
                <div className="space-y-3">
                  {settlementOverview.completed_settlements.map((settlement) => (
                    <div key={settlement.settlement_id} className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                      <p className="text-sm text-slate-100">
                        <span className="font-semibold">{settlement.payer_name}</span>
                        {' '}paid{' '}
                        <span className="font-semibold">{settlement.payee_name}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-100">
                          {formatCurrency(settlement.amount)}
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

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">Expenses</h2>
                <p className="mt-2 text-sm text-slate-400">Search and review every spend event tied to this group.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
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
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/30"
              />
            </div>
            <div className="space-y-3">
              {expenses
                .filter((expense) =>
                  expense.description.toLowerCase().includes(expenseSearch.toLowerCase())
                )
                .map((expense) => (
                <div key={expense.expense_id} className="rounded-[1.5rem] border border-slate-800 bg-slate-950 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-slate-100">{expense.description}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Split: {expense.split_type} | {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.paid_by_name && (
                        <p className="mt-1 text-sm text-sky-300">
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
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-100">
                          Add expense
                        </h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Description</label>
                          <input
                            type="text"
                            required
                            className="block w-full rounded-2xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-400/30"
                            value={expenseData.description}
                            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Amount</label>
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
                          <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Split Type</label>
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
                        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                      >
                        Save expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowExpenseModal(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
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
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-100">
                          Add member
                        </h3>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-400">Member Email</label>
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
                        className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                      >
                        Add member
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMemberModal(false)}
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800"
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
