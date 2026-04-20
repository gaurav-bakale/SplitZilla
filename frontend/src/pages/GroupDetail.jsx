import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Reveal from '../components/Reveal';
import api from '../api/axios';
import {
  Plus, Users, CheckCircle2, Search, ArrowRight, WalletCards, Activity,
  Orbit, TimerReset, Loader, Trash2, Coins, Receipt,
  Clock, UserPlus, Sparkles, Banknote, ScrollText, FileSignature
} from 'lucide-react';

const Modal = ({ open, onClose, children, maxWidth = 'max-w-2xl' }) =>
  !open ? null : (
    <div className="fixed inset-0 z-40 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`paper-card relative w-full ${maxWidth} overflow-hidden p-0`}>
          <div className="paper-tape" />
          {children}
        </div>
      </div>
    </div>
  );

// Module-level constants so they don't recreate on every render
const fieldCls = "block w-full rounded-xl border border-ink/15 bg-paper-50/70 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-terracotta focus:ring-4 focus:ring-terracotta/15";
const labelCls = "label-etched";

// Extracted so typing only re-renders this component, not the whole page
const AddExpenseModal = ({ open, onClose, groupId, members, onSuccess }) => {
  const [data, setData] = useState({
    description: '', amount: '', split_type: 'equal',
    category: 'GENERAL', is_recurring: false, frequency: 'MONTHLY'
  });
  const [memberValues, setMemberValues] = useState({});

  const setMemberValue = (userId, val) =>
    setMemberValues(p => ({ ...p, [userId]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description: data.description, amount: parseFloat(data.amount),
        split_type: data.split_type, category: data.category, group_id: groupId
      };
      if (data.split_type === 'percentage') {
        const pcts = {};
        members.forEach(m => { pcts[m.user_id] = parseFloat(memberValues[m.user_id] || 0); });
        const total = Object.values(pcts).reduce((s, v) => s + v, 0);
        if (Math.abs(total - 100) > 0.01) { alert(`Percentages must sum to 100 (currently ${total.toFixed(1)})`); return; }
        payload.percentages = pcts;
      } else if (data.split_type === 'exact') {
        const exacts = {};
        members.forEach(m => { exacts[m.user_id] = parseFloat(memberValues[m.user_id] || 0); });
        const total = Object.values(exacts).reduce((s, v) => s + v, 0);
        const amt = parseFloat(data.amount);
        if (Math.abs(total - amt) > 0.01) { alert(`Exact amounts must sum to ${amt.toFixed(2)} (currently ${total.toFixed(2)})`); return; }
        payload.exact_amounts = exacts;
      }
      if (data.is_recurring) {
        await api.post('/api/expenses/recurring/', {
          description: data.description, amount: parseFloat(data.amount),
          split_type: data.split_type, category: data.category,
          frequency: data.frequency, group_id: groupId, run_immediately: true
        });
      } else {
        await api.post('/api/expenses/', payload);
      }
      setData({ description: '', amount: '', split_type: 'equal', category: 'GENERAL', is_recurring: false, frequency: 'MONTHLY' });
      setMemberValues({});
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add expense');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="px-8 pt-10 pb-6">
          <p className="eyebrow">New entry</p>
          <h3 className="editorial mt-3">Add an expense.</h3>
          <div className="mt-6 space-y-5">
            <div>
              <label className={labelCls}>Description</label>
              <input
                type="text"
                required
                className={fieldCls}
                value={data.description}
                onChange={(e) => { const v = e.target.value; setData(p => ({ ...p, description: v })); }}
              />
            </div>
            <div>
              <label className={labelCls}>Amount</label>
              <input
                type="number"
                step="0.01"
                required
                className={fieldCls}
                value={data.amount}
                onChange={(e) => { const v = e.target.value; setData(p => ({ ...p, amount: v })); }}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Category</label>
                <select className={fieldCls} value={data.category}
                  onChange={(e) => { const v = e.target.value; setData(p => ({ ...p, category: v })); }}>
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
                <label className={labelCls}>Split type</label>
                <select className={fieldCls} value={data.split_type}
                  onChange={(e) => { const v = e.target.value; setData(p => ({ ...p, split_type: v })); }}>
                  <option value="equal">Equal</option>
                  <option value="percentage">Percentage</option>
                  <option value="exact">Exact</option>
                </select>
              </div>
            </div>
            {(data.split_type === 'percentage' || data.split_type === 'exact') && members.length > 0 && (
              <div className="rounded-2xl border border-ink/10 bg-paper-50/60 p-4 space-y-3">
                <p className={labelCls}>
                  {data.split_type === 'percentage' ? 'Percentage per member (must sum to 100)' : 'Exact amount per member'}
                </p>
                {members.map(m => (
                  <div key={m.user_id} className="flex items-center gap-3">
                    <span className="w-28 truncate text-sm text-ink-soft">{m.name}</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={data.split_type === 'percentage' ? '%' : '$'}
                      value={memberValues[m.user_id] ?? ''}
                      onChange={(e) => { const v = e.target.value; setMemberValue(m.user_id, v); }}
                      className={`${fieldCls} flex-1`}
                    />
                  </div>
                ))}
                {data.split_type === 'percentage' && (
                  <p className="text-xs text-ink-mute">
                    Total: {members.reduce((s, m) => s + parseFloat(memberValues[m.user_id] || 0), 0).toFixed(1)}%
                  </p>
                )}
                {data.split_type === 'exact' && data.amount && (
                  <p className="text-xs text-ink-mute">
                    Total: ${members.reduce((s, m) => s + parseFloat(memberValues[m.user_id] || 0), 0).toFixed(2)} / ${parseFloat(data.amount || 0).toFixed(2)}
                  </p>
                )}
              </div>
            )}
            <div className="rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
              <label className="flex items-center gap-3 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={data.is_recurring}
                  onChange={(e) => { const v = e.target.checked; setData(p => ({ ...p, is_recurring: v })); }}
                  className="h-4 w-4 rounded border-ink/30 text-terracotta focus:ring-terracotta/40"
                />
                A recurring entry, kindly scheduled
              </label>
              {data.is_recurring && (
                <div className="mt-4">
                  <label className={labelCls}>Frequency</label>
                  <select className={fieldCls} value={data.frequency}
                    onChange={(e) => { const v = e.target.value; setData(p => ({ ...p, frequency: v })); }}>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  <p className="mt-2 text-xs text-ink-mute">The first entry posts now; future ones arrive on schedule.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-ink/10 bg-paper-200/40 px-8 py-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-ink">Save entry</button>
        </div>
      </form>
    </Modal>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlementOverview, setSettlementOverview] = useState(null);
  const [settlementError, setSettlementError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [friends, setFriends] = useState([]);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [payingSettlementId, setPayingSettlementId] = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});
  const [exportOpen, setExportOpen] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('ALL');

  useEffect(() => { if (groupId) fetchGroupData(); }, [groupId]);

  useEffect(() => {
    if (showMemberModal) {
      api.get('/api/users/friends').then((r) => setFriends(r.data)).catch(() => setFriends([]));
    }
  }, [showMemberModal]);

  const fetchGroupData = async () => {
    setPageLoading(true);
    setPageError('');
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes, activityRes] = await Promise.allSettled([
        api.get(`/api/groups/${groupId}`),
        api.get(`/api/expenses/group/${groupId}`),
        api.get(`/api/expenses/balances/group/${groupId}`),
        api.get(`/api/settlements/group/${groupId}`),
        api.get(`/api/activity/group/${groupId}`)
      ]);
      const activityData = activityRes.status === 'fulfilled' ? activityRes.value.data : [];
      setActivities(Array.isArray(activityData) ? activityData : []);
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
      alert(error.response?.data?.error || 'Failed to create settlement plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  const handleRecordPayment = async (settlement) => {
    const rawAmount = paymentInputs[settlement.settlement_id] ?? settlement.outstanding_amount;
    const amount = parseFloat(rawAmount);
    if (!amount || amount <= 0) { alert('Enter a payment amount greater than 0'); return; }
    setPayingSettlementId(settlement.settlement_id);
    try {
      await api.post(`/api/settlements/group/${groupId}/${settlement.settlement_id}/payments`, { amount });
      setPaymentInputs((c) => ({ ...c, [settlement.settlement_id]: '' }));
      await fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to record payment');
    } finally {
      setPayingSettlementId('');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedFriends.size) { alert('Please select at least one friend'); return; }
    try {
      const emails = [...selectedFriends]
        .map((id) => friends.find((f) => f.user_id === id)?.email)
        .filter(Boolean);
      if (!emails.length) { alert('Could not resolve selected friends'); return; }
      for (const email of emails) {
        await api.post(`/api/groups/${groupId}/members/${encodeURIComponent(email)}`);
      }
      setShowMemberModal(false);
      setSelectedFriends(new Set());
      fetchGroupData();
    } catch (error) {
      alert(error.response?.data?.detail || error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleDeleteGroup = async () => {
    const name = group?.name || 'this group';
    const confirmed = window.confirm(
      `Delete "${name}"? This removes the group, every expense, every settlement, and the chronicle — permanently. This cannot be undone.`
    );
    if (!confirmed) return;
    setDeletingGroup(true);
    try {
      await api.delete(`/api/groups/${groupId}`);
      navigate('/groups');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete group');
      setDeletingGroup(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await api.get(`/api/expenses/group/${groupId}/export`, {
        params: { format },
        responseType: 'blob',
      });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ext = format === 'markdown' ? 'md' : format;
      a.href = url;
      a.download = `${group?.name || 'expenses'}-expenses.${ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export expenses');
    } finally {
      setExportOpen(false);
    }
  };

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;
  const activeSettlements = settlementOverview?.active_settlements || [];
  const recommendedPlan = settlementOverview?.recommended_plan || settlementOverview?.suggestions || [];
  const settlementMetrics = settlementOverview?.metrics || {};

  // Build a map of user_name → balance for settled expense detection
  const payerBalanceMap = {};
  (balances?.balances || []).forEach(b => { payerBalanceMap[b.user_name] = b.balance; });
  const groupFullySettled = settlementMetrics.total_outstanding === 0 && (settlementOverview?.completed_settlements?.length > 0);

  if (pageLoading && !group) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="paper-card p-10 text-ink-mute">Turning the page…</div>
        </div>
      </div>
    );
  }

  if (pageError && !group) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="paper-card border-terracotta/30 p-10 text-terracotta-600">{pageError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-[-8rem] h-[32rem] w-[32rem] rounded-full bg-sage/12 blur-3xl" />
        <div className="absolute top-[30%] right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-terracotta/10 blur-3xl" />
      </div>

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 text-ink-mute">
            <span className="h-px w-10 bg-ink-mute/50" />
            <span className="eyebrow">Feature · group page</span>
          </div>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h1 className="display drop-ornament">
                <em className="italic text-terracotta">{group.name}</em>
              </h1>
              <p className="hand mt-3 text-3xl text-ink-soft">— the shared page.</p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
                {group.description || 'Track shared expenses, review balances, and manage settlements — all in one calm ledger.'}
              </p>
              {/* Add expense + delete group */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="btn-terracotta"
                >
                  <Plus className="h-4 w-4" />
                  Add expense
                </button>
                <button
                  type="button"
                  onClick={handleDeleteGroup}
                  disabled={deletingGroup}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper-50/70 px-4 py-2 text-sm text-ink-soft transition hover:border-terracotta hover:text-terracotta disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingGroup ? 'Deleting…' : 'Delete group'}
                </button>
              </div>
            </div>
            <div className="grid gap-4 self-end">
              <div className="paper-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Members</p>
                    <p className="editorial mt-2 tabular-nums">{group.members?.length || 0}</p>
                  </div>
                  <Users className="h-5 w-5 text-terracotta" />
                </div>
              </div>
              <div className="paper-card p-5 tilt-right">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Entries tracked</p>
                    <p className="editorial mt-2 tabular-nums">{expenses.length}</p>
                  </div>
                  <Activity className="h-5 w-5 text-ink-soft" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Reveal delay={80}>
            <section className="paper-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Section 01</p>
                  <h2 className="editorial mt-2 text-2xl">Members</h2>
                  <p className="mt-1 text-sm text-ink-mute">People on this page.</p>
                </div>
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="rounded-full border border-ink/15 bg-paper-50 p-2.5 text-terracotta transition hover:border-terracotta hover:bg-terracotta-50"
                  title="Invite member"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="rule-dashed mt-5" />
              <ul className="mt-4 space-y-2">
                {group.members?.map((member) => (
                  <li key={member.user_id} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper-50/60 px-3 py-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 bg-paper-50 font-serif text-xs italic text-terracotta">
                      {member.name?.[0]?.toUpperCase() || '·'}
                    </span>
                    <span className="text-sm text-ink-soft">{member.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal delay={140} className="lg:col-span-2">
            <section className="paper-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Section 02</p>
                  <h2 className="editorial mt-2 text-2xl">Balances</h2>
                  <p className="mt-1 text-sm text-ink-mute">Who&rsquo;s ahead, who owes — plainly.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                  <Coins className="h-4 w-4 text-terracotta" />
                </span>
              </div>
              <div className="rule-dashed mt-5" />
              {balances && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {balances.balances?.map((balance) => {
                    const positive = balance.balance >= 0;
                    return (
                      <li key={balance.user_id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${positive ? 'border-sage/30 bg-sage/5' : 'border-terracotta/25 bg-terracotta-50/40'}`}>
                        <span className="text-sm font-medium text-ink">{balance.user_name}</span>
                        <span className={`text-sm font-semibold tabular-nums ${positive ? 'text-sage-500' : 'text-terracotta-600'}`}>
                          ${Math.abs(balance.balance).toFixed(2)} <span className="font-normal text-ink-mute">{positive ? 'gets back' : 'owes'}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <section className="paper-card mt-12 p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="eyebrow">Section 03 · Orchestration</p>
                <h2 className="editorial mt-2">Settle, gently.</h2>
                <p className="mt-2 max-w-xl text-sm text-ink-mute">Generate transfer plans, record partial payments, and track reimbursements until the group is closed out.</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                <Orbit className="h-5 w-5 text-terracotta" />
              </span>
            </div>

            {settlementError ? (
              <p className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-sm text-ink-soft">{settlementError}</p>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
                    <p className="eyebrow">Open transfers</p>
                    <p className="editorial mt-2 tabular-nums">{settlementMetrics.open_transfers || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
                    <p className="eyebrow">Outstanding</p>
                    <p className="editorial mt-2 tabular-nums">{formatCurrency(settlementMetrics.total_outstanding)}</p>
                  </div>
                  <div className="rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
                    <p className="eyebrow">Paid through</p>
                    <p className="editorial mt-2 tabular-nums">{formatCurrency(settlementMetrics.total_paid)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/10 bg-paper-50/40 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-ink">Recommended transfer plan</h3>
                      <p className="mt-2 text-sm text-ink-mute">
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
                      className="btn-terracotta disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creatingPlan ? <Loader className="h-4 w-4 animate-spin" /> : <TimerReset className="h-4 w-4" />}
                      {creatingPlan ? 'Drafting…' : 'Generate plan'}
                    </button>
                  </div>

                  {recommendedPlan.length > 0 ? (
                    <div className="mt-5 space-y-2">
                      {recommendedPlan.map((s) => (
                        <div key={`${s.payer_id}-${s.payee_id}-${s.amount}`} className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper-50 px-4 py-3">
                          <p className="text-sm text-ink">
                            <span className="font-semibold">{s.payer_name}</span>
                            <span className="mx-2 text-ink-mute">→</span>
                            <span className="font-semibold">{s.payee_name}</span>
                          </p>
                          <span className="font-serif text-base tabular-nums">{formatCurrency(s.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-ink-mute">Everything is already reconciled or covered by active transfers.</p>
                  )}
                </div>

                <div className="rounded-2xl border border-ink/10 bg-paper-50/40 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-ink">Active reimbursements</h3>
                      <p className="mt-2 text-sm text-ink-mute">Track payment progress against each orchestrated transfer.</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                      <WalletCards className="h-4 w-4 text-terracotta" />
                    </span>
                  </div>

                  {activeSettlements.length ? (
                    <div className="mt-5 space-y-4">
                      {activeSettlements.map((settlement) => (
                        <div key={settlement.settlement_id} className="rounded-xl border border-ink/10 bg-paper-50 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-sm text-ink">
                                <span className="font-semibold">{settlement.payer_name}</span>
                                <span className="mx-2 text-ink-mute">→</span>
                                <span className="font-semibold">{settlement.payee_name}</span>
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="paper-stamp">{settlement.status}</span>
                                <span className="paper-stamp">Planned {formatCurrency(settlement.amount)}</span>
                                <span className="paper-stamp">Paid {formatCurrency(settlement.paid_amount)}</span>
                                <span className="paper-stamp">Due {formatCurrency(settlement.outstanding_amount)}</span>
                              </div>
                            </div>
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between text-xs text-ink-mute">
                                <span>Progress</span>
                                <span className="tabular-nums">{Number(settlement.progress_percent).toFixed(0)}%</span>
                              </div>
                              <div className="mt-2 h-2 rounded-full bg-paper-200">
                                <div
                                  className="h-2 rounded-full bg-terracotta transition-all"
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
                              onChange={(e) => setPaymentInputs((c) => ({ ...c, [settlement.settlement_id]: e.target.value }))}
                              className={`${fieldCls} md:max-w-[200px]`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRecordPayment(settlement)}
                              disabled={payingSettlementId === settlement.settlement_id}
                              className="btn-ink disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {payingSettlementId === settlement.settlement_id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              {payingSettlementId === settlement.settlement_id ? 'Recording…' : 'Record payment'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-ink-mute">No active reimbursement plan yet.</p>
                  )}
                </div>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={200}>
          <section className="paper-card mt-8 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Section 04 · History</p>
                <h2 className="editorial mt-2">Settlements, filed.</h2>
                <p className="mt-2 text-sm text-ink-mute">Recorded payment completions inside this group.</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper-50">
                <WalletCards className="h-4 w-4 text-terracotta" />
              </span>
            </div>
            <div className="rule-dashed mt-5" />
            {settlementOverview?.completed_settlements?.length ? (
              <ul className="mt-5 grid gap-2 md:grid-cols-2">
                {settlementOverview.completed_settlements.map((s) => (
                  <li key={s.settlement_id} className="rounded-xl border border-ink/10 bg-paper-50/70 p-4">
                    <p className="text-sm text-ink">
                      <span className="font-semibold">{s.payer_name}</span>
                      <span className="mx-2 text-ink-mute">paid</span>
                      <span className="font-semibold">{s.payee_name}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-serif text-base tabular-nums">{formatCurrency(s.amount)}</span>
                      <span className="uppercase tracking-[0.22em] text-ink-mute">
                        {new Date(s.settled_at).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-ink-mute">No settlements recorded yet.</p>
            )}
          </section>
        </Reveal>

        <Reveal delay={240}>
          <section className="paper-card mt-8 p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="eyebrow">Section 05 · Ledger</p>
                <h2 className="editorial mt-2">Every entry, kept.</h2>
                <p className="mt-2 max-w-xl text-sm text-ink-mute">Search and review every spend event tied to this group.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setExportOpen((v) => !v)}
                    className="btn-ghost"
                  >
                    <Receipt className="h-4 w-4" />
                    Export
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-ink/10 bg-paper-50 shadow-paper">
                      {['csv', 'json', 'markdown'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => handleExport(fmt)}
                          className="block w-full px-4 py-2.5 text-left text-sm text-ink-soft transition hover:bg-paper-200/60"
                        >
                          as {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="btn-terracotta"
                >
                  <Plus className="h-4 w-4" />
                  Add expense
                </button>
              </div>
            </div>

            <div className="relative mt-6">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mute" />
              <input
                type="text"
                placeholder="Search expenses…"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className={`${fieldCls} pl-11`}
              />
            </div>

            <ul className="mt-5 space-y-3">
              {expenses
                .filter((e) => e.description.toLowerCase().includes(expenseSearch.toLowerCase()))
                .map((expense, i) => {
                  const payerBalance = payerBalanceMap[expense.paid_by_name];
                  const isSettled = groupFullySettled || (expense.paid_by_name && typeof payerBalance === 'number' && payerBalance >= 0);
                  return (
                    <li key={expense.expense_id} className={`rounded-2xl border bg-paper-50/60 p-5 transition ${isSettled ? 'border-sage/40' : 'border-ink/10'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className="mt-1 font-serif text-sm italic text-ink-mute tabular-nums">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-serif text-xl text-ink">{expense.description}</h3>
                              {isSettled && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-sage/40 bg-sage/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-sage-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  settled
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-mute">
                              <span className="paper-stamp">{expense.split_type}</span>
                              <span className="paper-stamp">{expense.category}</span>
                              <span className="uppercase tracking-[0.2em]">{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                            {expense.paid_by_name && (
                              <p className="mt-2 text-sm text-terracotta">Paid by {expense.paid_by_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-2xl tabular-nums">${expense.amount.toFixed(2)}</p>
                          <ArrowRight className="ml-auto mt-2 h-4 w-4 text-ink-mute" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              {expenses.filter((e) => e.description.toLowerCase().includes(expenseSearch.toLowerCase())).length === 0 && (
                <li className="rounded-2xl border border-dashed border-ink/15 bg-paper-50/40 py-10 text-center text-sm text-ink-mute">
                  {expenseSearch ? 'No expenses match your search.' : 'No expenses yet — the page is pleasantly blank.'}
                </li>
              )}
            </ul>
          </section>
        </Reveal>

        {/* Chronicle section — no Reveal wrapper so it's always visible */}
        <section className="paper-card mt-8 p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Section 06 · Chronicle</p>
              <h2 className="editorial mt-2">The group's diary.</h2>
              <p className="mt-2 max-w-xl text-sm text-ink-mute">
                Every move — entries, invitations, settlements — kept in order, newest first.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { k: 'ALL', label: 'all' },
                { k: 'EXPENSE_ADDED', label: 'expenses' },
                { k: 'MEMBER_ADDED', label: 'members' },
                { k: 'SETTLEMENT_RECORDED', label: 'settlements' },
                { k: 'PAYMENT_RECORDED', label: 'payments' },
              ].map((f) => (
                <button
                  key={f.k}
                  type="button"
                  onClick={() => setActivityFilter(f.k)}
                  className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.2em] transition ${
                    activityFilter === f.k
                      ? 'bg-ink text-paper-50'
                      : 'border border-ink/15 text-ink-mute hover:text-ink hover:border-ink/30'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rule-dashed mt-6" />

          {(() => {
            const filtered = activities.filter(
              (a) => activityFilter === 'ALL' || a.activity_type === activityFilter
            );
            if (filtered.length === 0) {
              return (
                <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-paper-50/40 py-12 text-center">
                  <ScrollText className="mx-auto h-6 w-6 text-ink-mute" />
                  <p className="hand mt-3 text-2xl text-terracotta">the page is quiet</p>
                  <p className="mt-1 text-sm text-ink-mute">
                    {activityFilter === 'ALL' ? 'Nothing to chronicle yet.' : `No ${activityFilter.replace(/_/g, ' ').toLowerCase()} events yet.`}
                  </p>
                </div>
              );
            }
            const iconFor = (type) => {
              switch (type) {
                case 'EXPENSE_ADDED': return Coins;
                case 'MEMBER_ADDED': return UserPlus;
                case 'GROUP_CREATED': return Sparkles;
                case 'SETTLEMENT_RECORDED': return Banknote;
                case 'SETTLEMENT_PLAN_CREATED': return FileSignature;
                case 'PAYMENT_RECORDED': return CheckCircle2;
                default: return Activity;
              }
            };
            const labelFor = (type) => (type || '').replace(/_/g, ' ').toLowerCase();
            const fmt = (iso) => {
              try {
                const d = new Date(iso);
                return d.toLocaleString(undefined, {
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: '2-digit'
                });
              } catch { return ''; }
            };
            return (
              <ol className="mt-6 relative">
                <span className="pointer-events-none absolute left-[19px] top-2 bottom-2 w-px bg-ink/10" />
                {filtered.map((a) => {
                  const Icon = iconFor(a.activity_type);
                  return (
                    <li key={a.activity_id} className="relative flex gap-5 pb-6 last:pb-0">
                      <span className="relative z-10 flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/15 bg-paper-50 shadow-paper">
                        <Icon className="h-4 w-4 text-terracotta" />
                      </span>
                      <div className="min-w-0 flex-1 rounded-2xl border border-ink/10 bg-paper-50/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="eyebrow text-terracotta-600">{labelFor(a.activity_type)}</p>
                          <span className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-mute">
                            <Clock className="h-3 w-3" />
                            {fmt(a.created_at)}
                          </span>
                        </div>
                        <p className="mt-1.5 font-serif text-lg text-ink">{a.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-mute">
                          {a.user_name && <span>by {a.user_name}</span>}
                          {typeof a.amount === 'number' && (
                            <span className="paper-stamp tabular-nums">${a.amount.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            );
          })()}
        </section>
      </main>

      <AddExpenseModal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        groupId={groupId}
        members={group?.members || []}
        onSuccess={fetchGroupData}
      />

      <Modal open={showMemberModal} onClose={() => { setShowMemberModal(false); setSelectedFriends(new Set()); }} maxWidth="max-w-xl">
        <form onSubmit={handleAddMember}>
          <div className="px-8 pt-10 pb-6">
            <p className="eyebrow">Invitation</p>
            <h3 className="editorial mt-3">Add members.</h3>
            <div className="mt-6">
              <p className={labelCls}>Select from your friends</p>
              {(() => {
                const memberEmails = new Set((group?.members || []).map((m) => (m.email || '').toLowerCase()));
                const available = friends.filter((f) => !memberEmails.has((f.email || '').toLowerCase()));
                if (!available.length) {
                  return (
                    <p className="mt-3 rounded-xl border border-dashed border-ink/15 p-4 text-sm text-ink-mute">
                      No friends available to add — they may already be in the group, or you haven't added any friends yet.
                    </p>
                  );
                }
                return (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {available.map((f) => {
                      const selected = selectedFriends.has(f.user_id);
                      return (
                        <button
                          key={f.user_id}
                          type="button"
                          onClick={() => setSelectedFriends(prev => {
                            const next = new Set(prev);
                            selected ? next.delete(f.user_id) : next.add(f.user_id);
                            return next;
                          })}
                          className={`paper-stamp transition hover:border-terracotta hover:text-terracotta ${
                            selected ? 'border-terracotta bg-terracotta-50 text-terracotta' : ''
                          }`}
                        >
                          <span className="font-serif italic">{f.name}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-ink/10 bg-paper-200/40 px-8 py-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => { setShowMemberModal(false); setSelectedFriends(new Set()); }} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={!selectedFriends.size} className="btn-ink disabled:cursor-not-allowed disabled:opacity-50">
              Add {selectedFriends.size > 0 ? selectedFriends.size : ''} {selectedFriends.size === 1 ? 'member' : 'members'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroupDetail;
