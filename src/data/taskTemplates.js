import { addDays } from '../utils/date'

// Hardcoded starter task templates. offsetDays is relative to the anchor
// date (negative = before, positive = after). Not dynamic/AI-generated yet.
export const TASK_TEMPLATES = [
  { name: 'Schedule moving company or truck', category: 'logistics', anchor: 'move_out', offsetDays: -30 },
  { name: 'Submit mail forwarding with Canada Post', category: 'administrative', anchor: 'move_out', offsetDays: -21 },
  { name: 'Shop for home insurance on the new property', category: 'administrative', anchor: 'move_in', offsetDays: -35 },
  { name: 'Cancel or transfer utilities at the old address', category: 'utilities', anchor: 'move_out', offsetDays: -14 },
  { name: 'Set up utilities at the new address', category: 'utilities', anchor: 'move_in', offsetDays: -14 },
  { name: 'Schedule final walkthrough of the old property', category: 'logistics', anchor: 'move_out', offsetDays: -1 },
  { name: "Update driver's license and government ID", category: 'administrative', anchor: 'move_in', offsetDays: 14 },
  { name: 'Register kids at new school', category: 'administrative', anchor: 'move_in', offsetDays: -30, condition: 'kids' },
  { name: 'Transfer pet records to new address', category: 'administrative', anchor: 'move_in', offsetDays: -14, condition: 'pets' },
]

export function generateStarterTasks({ moveOutDate, moveInDate, hasKids, hasPets }) {
  return TASK_TEMPLATES.filter((template) => {
    if (template.condition === 'kids') return hasKids
    if (template.condition === 'pets') return hasPets
    return true
  }).map((template) => {
    const anchorDate = template.anchor === 'move_out' ? moveOutDate : moveInDate
    return {
      task_name: template.name,
      category: template.category,
      due_date: addDays(anchorDate, template.offsetDays),
      status: 'pending',
    }
  })
}
