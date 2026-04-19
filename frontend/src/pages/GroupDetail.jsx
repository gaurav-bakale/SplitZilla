import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { Plus, Users, DollarSign, CheckCircle2, Search, ArrowRight, WalletCards, Activity, Orbit, TimerReset, Loader, ShieldAlert, Trash2 } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlementOverview, setSettlementOverview] = useState(null);
  const [exceptionRules, setExceptionRules] = useState([]);
  const [settlementError, setSettlementError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    split_type: 'equal',
    category: 'GENERAL',
    is_recurring: false,
    frequency: 'MONTHLY'
  });
  const [ruleData, setRuleData] = useState({
    name: '',
    description: '',
    rule_type: 'EXCLUDE_MEMBER',
    target_member_id: '',
    applies_to_category: '',
    value: '',
    priority: 100,
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
      const [groupRes, expensesRes, balancesRes, settlementsRes, rulesRes] = await Promise.allSettled([
        api.get(`/api/groups/${groupId}`),
        api.get(`/api/expenses/group/${groupId}`),
        api.get(`/api/expenses/balances/group/${groupId}`),
        api.get(`/api/settlements/group/${groupId}`),
        api.get(`/api/groups/${groupId}/exception-rules`)
      ]);

      if (groupRes.status !== 'fulfilled' || expensesRes.status !== 'fulfilled' || balancesRes.status !== 'fulfilled') {
        throw new Error('Failed to load core group data');
      }

      setGroup(groupRes.value.data);
      setExpenses(expensesRes.value.data);
      setBalances(balancesRes.value.data);
      setExceptionRules(rulesRes.status === 'fulfilled' ? rulesRes.value.data : []);

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
      if (expenseData.is_recurring) {
        await api.post('/api/expenses/recurring/', {
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          split_type: expenseData.split_type,
          category: expenseData.category,
          frequency: expenseData.frequency,
          group_id: groupId,
          run_immediately: true
        });
      } else {
        await api.post('/api/expenses/', {
          description: expenseData.description,
          amount: parseFloat(expenseData.amount),
          split_type: expenseData.split_type,
          category: expenseData.category,
          group_id: groupId
        });
      }
      setShowExpenseModal(false);
      setExpenseData({ description: '', amount: '', split_type: 'equal', category: 'GENERAL', is_recurring: false, frequency: 'MONTHLY' });
      fetchGroupData();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert(error.response?.data?.error || 'Failed to add expense');
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

  const handleAddRule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/groups/${groupId}/exception-rules`, {
        ...ruleData,
        value: ruleData.value === '' ? null : parseFloat(ruleData.value),
        priority: parseInt(ruleData.priority, 10),
        applies_to_category: ruleData.applies_to_category || null,
      });
      setShowRuleModal(false);
      setRuleData({
        name: '',
        description: '',
        rule_type: 'EXCLUDE_MEMBER',
        target_member_id: '',
        applies_to_category: '',
        value: '',
        priority: 100,
      });
      fetchGroupData();
    } catch (error) {
      console.error('Error adding exception rule:', error);
      alert(error.response?.data?.error || 'Failed to add exception rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.delete(`/api/groups/${groupId}/exception-rules/${ruleId}`);
      fetchGroupData();
    } catch (error) {
      console.error('Error deleting exception rule:', error);
      alert(error.response?.data?.error || 'Failed to delete exception rule');
    }
  };

  if (pageLoading && !group) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-card-md">
            Loading group workspace...
          </div>
        </div>
      </div>
    );
  }

  if (pageError && !group) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-red-900 shadow-card-md">
            {pageError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-card-md">
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                  Group
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  {group.name}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  {group.description || 'Track shared expenses, review balances, and manage settlements.'}
                </p>
              </div>

              <div className="grid gap-4 self-end">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Members Online</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-900">{group.members?.length || 0}</p>
                    </div>
                    <Users className="h-5 w-5 text-primary-700" />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Expense Feed</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{expenses.length} records tracked</p>
                    </div>
                    <Activity className="h-5 w-5 text-slate-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Members</h2>
                  <p className="mt-2 text-sm text-slate-600">People in this group.</p>
                </div>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="rounded-lg border border-slate-300 bg-white p-3 text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {group.members?.map((member) => (
                  <div key={member.user_id} className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <Users className="mr-3 h-4 w-4 text-primary-700" />
                    <span className="text-sm text-slate-800">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Balances</h2>
                  <p className="mt-2 text-sm text-slate-600">See who owes, who is ahead, and where the group stands.</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-primary-700">
                  <DollarSign className="h-5 w-5" />
                </span>
              </div>
              {balances && (
                <div className="space-y-2">
                  {balances.balances?.map((balance) => (
                    <div key={balance.user_id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <span className="text-sm font-medium text-slate-800">{balance.user_name}</span>
                      <span className={`text-sm font-semibold ${balance.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        ${Math.abs(balance.balance).toFixed(2)} {balance.balance >= 0 ? 'gets back' : 'owes'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Settlement Orchestration</h2>
                  <p className="mt-2 text-sm text-slate-600">Generate transfer plans, record partial payments, and track reimbursements until the group is closed out.</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-primary-700">
                  <Orbit className="h-5 w-5" />
                </span>
              </div>
              {settlementError ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  {settlementError}
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Open Transfers</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{settlementMetrics.open_transfers || 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Outstanding</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(settlementMetrics.total_outstanding)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Paid Through</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(settlementMetrics.total_paid)}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Recommended transfer plan</h3>
                        <p className="mt-2 text-sm text-slate-600">
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
                        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm text-slate-900">
                                <span className="font-semibold">{suggestion.payer_name}</span>
                                {' '}pays{' '}
                                <span className="font-semibold">{suggestion.payee_name}</span>
                              </p>
                              <span className="text-sm font-semibold text-slate-800">{formatCurrency(suggestion.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-slate-600">Everything is already reconciled or covered by active transfers.</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Active reimbursements</h3>
                        <p className="mt-2 text-sm text-slate-600">Track payment progress against each orchestrated transfer.</p>
                      </div>
                      <span className="rounded-lg border border-slate-200 bg-white p-3 text-primary-700">
                        <WalletCards className="h-5 w-5" />
                      </span>
                    </div>

                    {activeSettlements.length ? (
                      <div className="mt-5 space-y-4">
                        {activeSettlements.map((settlement) => (
                          <div key={settlement.settlement_id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-sm text-slate-900">
                                  <span className="font-semibold">{settlement.payer_name}</span>
                                  {' '}pays{' '}
                                  <span className="font-semibold">{settlement.payee_name}</span>
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                  <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 uppercase tracking-wide text-primary-700">
                                    {settlement.status}
                                  </span>
                                  <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1">
                                    Planned {formatCurrency(settlement.amount)}
                                  </span>
                                  <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1">
                                    Paid {formatCurrency(settlement.paid_amount)}
                                  </span>
                                  <span className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1">
                                    Outstanding {formatCurrency(settlement.outstanding_amount)}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full max-w-xs">
                                <div className="flex items-center justify-between text-xs text-slate-600">
                                  <span>Progress</span>
                                  <span>{Number(settlement.progress_percent).toFixed(0)}%</span>
                                </div>
                                <div className="mt-2 h-2 rounded-full bg-slate-200">
                                  <div
                                    className="h-2 rounded-lg bg-primary-600 transition-all"
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
                                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 md:max-w-[200px]"
                              />
                              <button
                                type="button"
                                onClick={() => handleRecordPayment(settlement)}
                                disabled={payingSettlementId === settlement.settlement_id}
                                className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <p className="mt-5 text-sm text-slate-600">No active reimbursement plan yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Settlement History</h2>
                  <p className="mt-2 text-sm text-slate-600">Recorded payment completions inside this group.</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-primary-700">
                  <WalletCards className="h-5 w-5" />
                </span>
              </div>
              {settlementOverview?.completed_settlements?.length ? (
                <div className="space-y-3">
                  {settlementOverview.completed_settlements.map((settlement) => (
                    <div key={settlement.settlement_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{settlement.payer_name}</span>
                        {' '}paid{' '}
                        <span className="font-semibold">{settlement.payee_name}</span>
                      </p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900">
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
                <p className="text-slate-600">No settlements recorded yet.</p>
              )}
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Exception Rules Engine</h2>
                <p className="mt-2 text-sm text-slate-600">Build smart split exceptions like exclusions, fixed shares, and caps for this group.</p>
              </div>
              <button
                onClick={() => setShowRuleModal(true)}
                className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Add Rule
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {exceptionRules.map((rule) => (
                <div key={rule.rule_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{rule.name}</p>
                      <p className="mt-2 text-xs uppercase tracking-wide text-primary-700">{rule.rule_type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.rule_id)}
                      className="rounded-full border border-slate-300 p-2 text-slate-600 transition hover:border-rose-400/30 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>Target: <span className="text-slate-800">{rule.target_member_name || 'Unknown member'}</span></p>
                    <p>Category: <span className="text-slate-800">{rule.applies_to_category || 'Any'}</span></p>
                    {rule.value !== null && rule.value !== undefined && (
                      <p>Value: <span className="text-slate-800">{rule.value}</span></p>
                    )}
                    <p>Priority: <span className="text-slate-800">{rule.priority}</span></p>
                    {rule.description && <p className="pt-2 text-xs leading-6 text-slate-500">{rule.description}</p>}
                  </div>
                </div>
              ))}
              {exceptionRules.length === 0 && (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  No exception rules yet. Add one to make shared expenses behave more like real life.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card-md">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Expenses</h2>
                <p className="mt-2 text-sm text-slate-600">Search and review every spend event tied to this group.</p>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
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
                className="w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="space-y-3">
              {expenses
                .filter((expense) =>
                  expense.description.toLowerCase().includes(expenseSearch.toLowerCase())
                )
                .map((expense) => (
                <div key={expense.expense_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">{expense.description}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Split: {expense.split_type} | Category: {expense.category} | {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.paid_by_name && (
                        <p className="mt-1 text-sm text-primary-700">
                          Paid by {expense.paid_by_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">${expense.amount.toFixed(2)}</p>
                      <ArrowRight className="ml-auto mt-3 h-4 w-4 text-primary-700" />
                    </div>
                  </div>
                  {expense.applied_rule_summaries?.length > 0 && (
                    <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50/90 p-3">
                      <p className="text-xs uppercase tracking-wide text-primary-700">Applied Exception Rules</p>
                      <div className="mt-2 space-y-1">
                        {expense.applied_rule_summaries.map((summary, index) => (
                          <p key={`${expense.expense_id}-rule-${index}`} className="text-sm text-slate-700">
                            {summary}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {expenses.filter((e) =>
                e.description.toLowerCase().includes(expenseSearch.toLowerCase())
              ).length === 0 && (
                <p className="py-8 text-center text-slate-600">
                  {expenseSearch ? 'No expenses match your search' : 'No expenses yet'}
                </p>
              )}
            </div>
          </div>

          {showExpenseModal && (
            <div className="fixed inset-0 z-40 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div
                  className="absolute inset-0 bg-slate-900/40"
                  onClick={() => setShowExpenseModal(false)}
                />
                <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-md">
                  <form onSubmit={handleAddExpense}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6">
                        <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-4 py-1 text-xs uppercase tracking-wide text-primary-700">
                          New Expense
                        </span>
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                          Add expense
                        </h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Description</label>
                          <input
                            type="text"
                            required
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={expenseData.description}
                            onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={expenseData.amount}
                            onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Category</label>
                          <select
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={expenseData.category}
                            onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                          >
                            <option value="GENERAL">General</option>
                            <option value="FOOD">Food</option>
                            <option value="ACCOMMODATION">Accommodation</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="ENTERTAINMENT">Entertainment</option>
                            <option value="UTILITIES">Utilities</option>
                            <option value="SHOPPING">Shopping</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Split Type</label>
                          <select
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={expenseData.split_type}
                            onChange={(e) => setExpenseData({ ...expenseData, split_type: e.target.value })}
                          >
                            <option value="equal">Equal Split</option>
                            <option value="percentage">Percentage Split</option>
                            <option value="exact">Exact Amount</option>
                          </select>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                          <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                            <input
                              type="checkbox"
                              checked={expenseData.is_recurring}
                              onChange={(e) => setExpenseData({ ...expenseData, is_recurring: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            Make this a recurring expense
                          </label>
                          {expenseData.is_recurring && (
                            <div className="mt-4">
                              <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Frequency</label>
                              <select
                                className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                                value={expenseData.frequency}
                                onChange={(e) => setExpenseData({ ...expenseData, frequency: e.target.value })}
                              >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                                <option value="MONTHLY">Monthly</option>
                              </select>
                              <p className="mt-2 text-xs text-slate-500">The first expense posts now; future ones are scheduled automatically.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                      >
                        Save expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowExpenseModal(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {showRuleModal && (
            <div className="fixed inset-0 z-40 overflow-y-auto">
              <div className="flex min-h-screen items-center justify-center px-4 py-10">
                <div
                  className="absolute inset-0 bg-slate-900/40"
                  onClick={() => setShowRuleModal(false)}
                />
                <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-md">
                  <form onSubmit={handleAddRule}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6">
                        <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-4 py-1 text-xs uppercase tracking-wide text-primary-700">
                          Exception Rule
                        </span>
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                          Add smart split rule
                        </h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Rule Name</label>
                          <input
                            type="text"
                            required
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={ruleData.name}
                            onChange={(e) => setRuleData({ ...ruleData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Rule Type</label>
                          <select
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={ruleData.rule_type}
                            onChange={(e) => setRuleData({ ...ruleData, rule_type: e.target.value })}
                          >
                            <option value="EXCLUDE_MEMBER">Exclude member</option>
                            <option value="FIXED_AMOUNT">Fixed amount</option>
                            <option value="FIXED_PERCENTAGE">Fixed percentage</option>
                            <option value="CAP_AMOUNT">Cap amount</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Target Member</label>
                          <select
                            required
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={ruleData.target_member_id}
                            onChange={(e) => setRuleData({ ...ruleData, target_member_id: e.target.value })}
                          >
                            <option value="">Select a member</option>
                            {group?.members?.map((member) => (
                              <option key={member.user_id} value={member.user_id}>{member.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Category Scope</label>
                            <select
                              className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              value={ruleData.applies_to_category}
                              onChange={(e) => setRuleData({ ...ruleData, applies_to_category: e.target.value })}
                            >
                              <option value="">Any category</option>
                              <option value="GENERAL">General</option>
                              <option value="FOOD">Food</option>
                              <option value="ACCOMMODATION">Accommodation</option>
                              <option value="TRANSPORT">Transport</option>
                              <option value="ENTERTAINMENT">Entertainment</option>
                              <option value="UTILITIES">Utilities</option>
                              <option value="SHOPPING">Shopping</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Priority</label>
                            <input
                              type="number"
                              className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              value={ruleData.priority}
                              onChange={(e) => setRuleData({ ...ruleData, priority: e.target.value })}
                            />
                          </div>
                        </div>
                        {ruleData.rule_type !== 'EXCLUDE_MEMBER' && (
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Rule Value</label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                              value={ruleData.value}
                              onChange={(e) => setRuleData({ ...ruleData, value: e.target.value })}
                            />
                          </div>
                        )}
                        <div>
                          <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Description</label>
                          <textarea
                            rows="3"
                            className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            value={ruleData.description}
                            onChange={(e) => setRuleData({ ...ruleData, description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                      >
                        Save rule
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRuleModal(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
                  className="absolute inset-0 bg-slate-900/40"
                  onClick={() => setShowMemberModal(false)}
                />
                <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-md">
                  <form onSubmit={handleAddMember}>
                    <div className="relative px-6 pb-6 pt-7 sm:px-8 sm:pb-8">
                      <div className="mb-6">
                        <span className="inline-flex items-center rounded-md border border-primary-200 bg-primary-50 px-4 py-1 text-xs uppercase tracking-wide text-primary-700">
                          Invite Member
                        </span>
                        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                          Add member
                        </h3>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wide text-slate-600">Member Email</label>
                        <input
                          type="email"
                          required
                          className="block w-full rounded-lg border border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="relative flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                      >
                        Add member
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMemberModal(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
