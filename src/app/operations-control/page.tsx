'use client'

import * as React from 'react'
import { AdminLayout } from '../../components/admin-layout'
import {
  History,
  UserCheck,
  Plus
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { getUser } from '../../lib/auth'
import { toast } from 'sonner'

interface TelemetryMetric {
  id: string
  name: string
  health: number
  status: 'nominal' | 'warning' | 'critical'
  details: string
  teamLeader: string
}

interface WorkerTask {
  id: string
  team: string
  task: string
  priority: 'low' | 'medium' | 'high'
  workerCount: number
  assignedDate: string
  status: 'assigned' | 'in-progress' | 'completed'
}

const INITIAL_METRICS: TelemetryMetric[] = [
  { id: 'm-1', name: 'Water Pressure pipeline Ward 3', health: 98, status: 'nominal', details: 'Pressure checks at 4.2 bar. Full flow to central sector.', teamLeader: 'Jitendra Rawat' },
  { id: 'm-2', name: 'Ward 2 Grid transformer load', health: 65, status: 'warning', details: 'Transformer temperature logged at 82°C. Overload due to heat.', teamLeader: 'Sunil Verma' },
  { id: 'm-3', name: 'Village Central Sanitation Collector', health: 92, status: 'nominal', details: 'Waste collection vehicles dispatched. Wards 1-5 cleared.', teamLeader: 'Sita Ram' },
  { id: 'm-4', name: 'Primary School road repairs', health: 42, status: 'critical', details: 'Aggregate filling and grading required immediately.', teamLeader: 'Gaurav Das' }
]

export default function OperationsControl() {
  const [metrics, setMetrics] = React.useState<TelemetryMetric[]>(INITIAL_METRICS)
  const [tasks, setTasks] = React.useState<WorkerTask[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dispatcher form states
  const [targetTeam, setTargetTeam] = React.useState('Water Sanitation Dept')
  const [taskDescription, setTaskDescription] = React.useState('')
  const [taskPriority, setTaskPriority] = React.useState<'low' | 'medium' | 'high'>('medium')
  const [workerCount, setWorkerCount] = React.useState(2)

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*, users(*)')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      if (data) {
        const mapped = data.map((item: any) => {
          let statusVal: 'assigned' | 'in-progress' | 'completed' = 'assigned'
          const dbStatus = item.status?.toLowerCase()
          if (dbStatus === 'resolved' || dbStatus === 'completed') {
            statusVal = 'completed'
          } else if (dbStatus === 'in progress' || dbStatus === 'in-progress' || dbStatus === 'dispatched') {
            statusVal = 'in-progress'
          }

          const u = item.users
          return {
            id: item.id,
            team: item.assigned_team || 'Unassigned Team',
            task: `${item.type}: ${item.description}` + (u ? ` (Requested by ${u.name}, ${u.phone})` : ''),
            priority: 'medium' as const,
            workerCount: 2,
            assignedDate: new Date(item.created_at).toLocaleString(),
            status: statusVal
          }
        })
        setTasks(mapped)
      }
    } catch (err) {
      console.error('Error fetching operations requests:', err)
      toast.error('Failed to load operations task logs.')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadTasks()

    const channel = supabase
      .channel('service-requests-admin-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        () => {
          loadTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim()) return

    const session = getUser()

    try {
      const { error } = await supabase
        .from('service_requests')
        .insert([{
          user_id: session?.id,
          type: targetTeam,
          description: taskDescription,
          status: 'In Progress',
          assigned_team: targetTeam
        }])

      if (error) throw error

      setTaskDescription('')
      toast.success(`Task dispatched successfully to: ${targetTeam}`)
      
      // Simulating health metric improvement if water task dispatched
      if (targetTeam === 'Water Sanitation Dept') {
        setMetrics(prev =>
          prev.map(m =>
            m.id === 'm-1' ? { ...m, health: 100, status: 'nominal', details: 'Pressure checks at 4.5 bar. Gasket repair dispatch logged.' } : m
          )
        )
      }
      
      loadTasks()
    } catch (err) {
      console.error('Error dispatching service task:', err)
      toast.error('Failed to dispatch maintenance task.')
    }
  }

  const handleUpdateStatus = async (id: string, nextStatus: 'in-progress' | 'completed') => {
    const dbStatus = nextStatus === 'completed' ? 'Resolved' : 'In Progress'
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: dbStatus })
        .eq('id', id)

      if (error) throw error

      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, status: nextStatus } : t))
      )
      toast.success(`Task status updated to: ${nextStatus}`)
    } catch (err) {
      console.error('Error updating task status:', err)
      toast.error('Failed to update task status.')
    }
  }

  return (
    <AdminLayout title="Village Operations Control Center">
      {/* Telemetry metrics overview */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const isNominal = metric.status === 'nominal'
          const isWarning = metric.status === 'warning'

          return (
            <div
              key={metric.id}
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850/80 flex flex-col justify-between gap-4 shadow-lg shadow-black/10 relative overflow-hidden group"
            >
              {/* Outer status glow */}
              <div className={`absolute top-0 right-0 w-2 h-full ${
                isNominal ? 'bg-emerald-500' : isWarning ? 'bg-yellow-500' : 'bg-red-500'
              }`} />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-300">
                  <span>Health Metric</span>
                  <span className={`font-mono ${
                    isNominal ? 'text-emerald-400' : isWarning ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {metric.health}%
                  </span>
                </div>

                <h4 className="text-xs font-poppins font-extrabold text-slate-200 leading-tight">
                  {metric.name}
                </h4>
                <p className="text-[10px] text-slate-200 leading-relaxed truncate">
                  {metric.details}
                </p>
              </div>

              <div className="text-[9px] font-bold text-slate-300 pt-2 border-t border-slate-900/60 flex justify-between">
                <span>Staff Lead:</span>
                <span className="text-slate-200">{metric.teamLeader}</span>
              </div>
            </div>
          )
        })}
      </section>

      {/* Main Operations board split grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Dispatch Form panel */}
        <section className="md:col-span-5 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-900">
            <UserCheck className="w-4 h-4 text-blue-500" />
            Worker Dispatch & Task Board
          </h3>

          <form onSubmit={handleDispatchSubmit} className="space-y-3.5 text-xs">
            {/* Target team selection */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Assign Department Team</label>
              <select
                value={targetTeam}
                onChange={(e) => setTargetTeam(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="Water Sanitation Dept">Water Sanitation Dept</option>
                <option value="Grid Electricians">Grid Electricians</option>
                <option value="Village Cleaning Crew">Village Cleaning Crew</option>
                <option value="Road Maintenance Team">Road Maintenance Team</option>
              </select>
            </div>

            <div className="grid gap-4 grid-cols-2">
              {/* Task Priority selection */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide">Task Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e: any) => setTaskPriority(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {/* Workers count slider */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300 uppercase tracking-wide">Staff Dispatched</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={workerCount}
                  onChange={(e) => setWorkerCount(parseInt(e.target.value))}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Task descriptions */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-300 uppercase tracking-wide">Deployment Task Description</label>
              <textarea
                rows={3}
                required
                placeholder="Details of repair workflow, tools, or location..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-gray-400 focus:outline-none font-sans leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-poppins font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Dispatch Maintenance Task
            </button>
          </form>
        </section>

        {/* Worker Dispatch Board listings */}
        <section className="md:col-span-7 p-5 rounded-3xl border border-slate-850 bg-slate-950/40 backdrop-blur-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-900">
            <History className="w-4 h-4 text-blue-500" />
            Worker Dispatch Logs
          </h3>

          <div className="space-y-3.5">
            {loading ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/20 backdrop-blur-sm text-center text-gray-300 text-xs font-semibold">
                Loading operations task board...
              </div>
            ) : tasks.length > 0 ? (
              tasks.map((task) => {
                const isAssigned = task.status === 'assigned'
                const isInProgress = task.status === 'in-progress'
                const isCompleted = task.status === 'completed'

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 backdrop-blur-sm flex flex-col justify-between gap-3 text-xs leading-relaxed"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-poppins font-extrabold text-slate-200">
                          {task.team}
                        </h4>
                        <p className="text-[10px] text-slate-300 font-mono">
                          Dispatched: {task.workerCount} Staff • {task.assignedDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          task.priority === 'high' 
                            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {task.priority}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : isInProgress
                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-850/50">
                      {task.task}
                    </p>

                    {/* Actions to toggle task state */}
                    {!isCompleted && (
                      <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-2.5 text-[10px]">
                        {isAssigned && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                            className="py-1 px-2.5 rounded bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all cursor-pointer font-bold"
                          >
                            Mark in Progress
                          </button>
                        )}
                        {isInProgress && (
                          <button
                            onClick={() => handleUpdateStatus(task.id, 'completed')}
                            className="py-1 px-2.5 rounded bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all cursor-pointer font-bold"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-8 rounded-2xl border border-slate-850 bg-slate-950/20 backdrop-blur-sm text-center text-gray-300 text-xs font-semibold">
                No active operations dispatch tasks.
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}
