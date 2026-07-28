import { formatDate } from '../utils/date'

const GROUP_ORDER = ['Due This Week', 'Due Next 2 Weeks', 'Due This Month', 'Coming Up']

function groupTasks(tasks) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groups = {
    'Due This Week': [],
    'Due Next 2 Weeks': [],
    'Due This Month': [],
    'Coming Up': [],
  }

  for (const task of tasks) {
    if (!task.due_date) {
      groups['Coming Up'].push(task)
      continue
    }

    const due = new Date(task.due_date)
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) groups['Due This Week'].push(task)
    else if (diffDays <= 14) groups['Due Next 2 Weeks'].push(task)
    else if (diffDays <= 30) groups['Due This Month'].push(task)
    else groups['Coming Up'].push(task)
  }

  return groups
}

function TaskChecklist({ tasks }) {
  if (tasks.length === 0) {
    return (
      <section className="checklist">
        <p>No tasks yet.</p>
      </section>
    )
  }

  const groups = groupTasks(tasks)

  return (
    <section className="checklist">
      {GROUP_ORDER.map((groupName) => {
        const groupTasks = groups[groupName]
        if (groupTasks.length === 0) return null

        return (
          <div key={groupName} className="checklist-group">
            <h2>{groupName}</h2>
            <ul>
              {groupTasks.map((task) => (
                <li
                  key={task.id}
                  className={task.status === 'completed' ? 'task-item completed' : 'task-item'}
                >
                  <input type="checkbox" checked={task.status === 'completed'} readOnly />
                  <span className="task-name">{task.task_name}</span>
                  {task.category && <span className="task-category">{task.category}</span>}
                  {task.due_date && <span className="task-due">{formatDate(task.due_date)}</span>}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}

export default TaskChecklist
