import { formatDate } from '../utils/date'

function MoveTimeline({ moveOutDate, moveInDate }) {
  if (!moveOutDate || !moveInDate) {
    return (
      <section className="timeline">
        <p>Move dates haven't been set yet.</p>
      </section>
    )
  }

  const out = new Date(moveOutDate)
  const in_ = new Date(moveInDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const total = in_ - out
  const elapsed = today - out
  const percent = total <= 0 ? 100 : Math.min(100, Math.max(0, (elapsed / total) * 100))

  return (
    <section className="timeline">
      <div className="timeline-bar">
        <div className="timeline-fill" style={{ width: `${percent}%` }} />
        <div className="timeline-marker" style={{ left: `${percent}%` }} title="Today" />
      </div>
      <div className="timeline-labels">
        <span>
          Move Out
          <br />
          {formatDate(moveOutDate)}
        </span>
        <span className="timeline-percent">{Math.round(percent)}% through your move</span>
        <span>
          Move In
          <br />
          {formatDate(moveInDate)}
        </span>
      </div>
    </section>
  )
}

export default MoveTimeline
