import * as React from 'react'
import { AdminLayout } from '../../components/admin-layout'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Cell,
  Pie
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Download,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react'

// Dummy charts dataset
const ticketVolumeData = [
  { name: 'Water', count: 32, resolved: 28 },
  { name: 'Roads', count: 48, resolved: 36 },
  { name: 'Power', count: 18, resolved: 16 },
  { name: 'Trash', count: 28, resolved: 25 },
  { name: 'Agri', count: 15, resolved: 14 }
]

const resolutionTimelineData = [
  { week: 'Week 1', avgHrs: 8.5 },
  { week: 'Week 2', avgHrs: 7.2 },
  { week: 'Week 3', avgHrs: 6.4 },
  { week: 'Week 4', avgHrs: 5.8 },
  { week: 'Week 5', avgHrs: 4.2 }
]

const departmentEfficiencyData = [
  { name: 'Water Dept', value: 45, color: '#3b82f6' },
  { name: 'Grid Electrics', value: 20, color: '#f59e0b' },
  { name: 'Sanitation Team', value: 25, color: '#10b981' },
  { name: 'Road Crew', value: 10, color: '#ef4444' }
]

const wardIncidentHeatmap = [
  { ward: 'Ward 1', load: 'Low Load (5 cases)', rate: '100% Resolved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' },
  { ward: 'Ward 2', load: 'High Density (18 cases)', rate: '78% Active', color: 'text-red-400 bg-red-500/10 border-red-500/25 animate-pulse' },
  { ward: 'Ward 3', load: 'Medium Load (12 cases)', rate: '92% Resolved', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25' },
  { ward: 'Ward 4', load: 'Low Load (3 cases)', rate: '100% Resolved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25' }
]

export default function AdminAnalytics() {
  const [timePeriod, setTimePeriod] = React.useState('weekly')

  const handleDownloadReport = () => {
    alert(`Mock Panchayat Administration Reports PDF for Period [${timePeriod.toUpperCase()}] generated and downloaded successfully.`)
  }

  return (
    <AdminLayout title="Panchayat Governance Analytics Center">
      {/* Configuration toolbar */}
      <section className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest leading-none">Executive Report Deck</p>
          <h3 className="font-poppins font-extrabold text-sm text-slate-200">Periodical Governance Analytics</h3>
        </div>

        <div className="flex gap-2.5 text-xs font-bold text-slate-350 shrink-0">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 focus:outline-none cursor-pointer text-slate-300"
          >
            <option value="weekly">Weekly Analytics</option>
            <option value="monthly">Monthly Audit</option>
            <option value="yearly">Annual Performance</option>
          </select>

          <button
            onClick={handleDownloadReport}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-poppins font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Executive PDF
          </button>
        </div>
      </section>

      {/* Main double chart row */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Category ticket Volume Chart */}
        <div className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            Submitted vs Resolved Tickets
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={ticketVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" name="Submitted" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Timeline chart */}
        <div className="p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Average Resolution Speed (Hours)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="avgHrs" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Bottom split: Heatmaps, Department Load, and AI Insights */}
      <section className="grid gap-6 md:grid-cols-12">
        {/* Heatmaps listing */}
        <div className="md:col-span-4 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
            <Layers className="w-4 h-4 text-blue-500" />
            Ward Loading Density
          </h3>

          <div className="space-y-3 text-xs">
            {wardIncidentHeatmap.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-850 bg-slate-900/30"
              >
                <span className="font-bold text-slate-200">{item.ward}</span>
                <div className="text-right">
                  <p className="text-[10px] text-slate-200">{item.load}</p>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${item.color}`}>
                    {item.rate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department load shares */}
        <div className="md:col-span-4 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
              <Activity className="w-4 h-4 text-blue-500" />
              Department Load Share
            </h3>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentEfficiencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentEfficiencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-[9px] font-bold">
            {departmentEfficiencyData.map((dept, idx) => (
              <span key={idx} className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: dept.color }} />
                {dept.name} ({dept.value}%)
              </span>
            ))}
          </div>
        </div>

        {/* AI generated insights list */}
        <div className="md:col-span-4 p-5 rounded-3xl border border-slate-855 bg-slate-950/40 backdrop-blur-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900/60">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              AI Generated Governance Insights
            </h3>

            <div className="space-y-3 mt-4 text-[11px] leading-relaxed text-slate-200">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-bold text-slate-200">Transformer loads in Ward 2</span> are projected to drop due to automated coolants maintenance schedules.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-bold text-slate-200">Drinking water repairs</span> resolved 22% faster following ward-based crew routing optimization.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <p>
                  <span className="font-bold text-slate-200">Incident reports density</span> is highest on road categories. Priority asphalt grading recommended.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadReport}
            className="w-full py-2.5 mt-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-750 text-slate-200 font-poppins font-bold text-xs flex items-center justify-center gap-1"
          >
            Generate Performance Report
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}
