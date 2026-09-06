export interface ParsedTask {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';
  projectName: string | null;
  tags: string[];
  estimatedMinutes: number;
  isRecurring: boolean;
  recurrenceRule: { frequency: 'daily' | 'weekly' | 'monthly'; interval: number } | null;
}

export function parseNaturalLanguageTask(input: string): ParsedTask {
  let text = input.trim();
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE' = 'NONE';
  let projectName: string | null = null;
  const tags: string[] = [];
  let estimatedMinutes = 0;
  let isRecurring = false;
  let recurrenceRule: { frequency: 'daily' | 'weekly' | 'monthly'; interval: number } | null = null;

  const now = new Date();

  // 1. Priority detection: !high, !urgent, !med, !medium, !low, p1, p2, p3
  const highPriorityRegex = /\b(!high|!urgent|p1)\b/i;
  const medPriorityRegex = /\b(!med|!medium|p2)\b/i;
  const lowPriorityRegex = /\b(!low|p3)\b/i;

  if (highPriorityRegex.test(text)) {
    priority = 'HIGH';
    text = text.replace(highPriorityRegex, '');
  } else if (medPriorityRegex.test(text)) {
    priority = 'MEDIUM';
    text = text.replace(medPriorityRegex, '');
  } else if (lowPriorityRegex.test(text)) {
    priority = 'LOW';
    text = text.replace(lowPriorityRegex, '');
  }

  // 2. Estimated minutes: ~30m, ~1h, ~45min, 30mins
  const estMatch = text.match(/~(\d+)(m|min|h|hr)\b/i);
  if (estMatch) {
    const val = parseInt(estMatch[1], 10);
    const unit = estMatch[2].toLowerCase();
    estimatedMinutes = unit.startsWith('h') ? val * 60 : val;
    text = text.replace(estMatch[0], '');
  }

  // 3. Project detection: p:ProjectName or #Project (if camelCase or Capitalized)
  const projMatch = text.match(/\bp:([a-zA-Z0-9_-]+)/i);
  if (projMatch) {
    projectName = projMatch[1];
    text = text.replace(projMatch[0], '');
  }

  // 4. Tags detection: @tag or #tag
  const tagMatches = text.match(/[@#]([a-zA-Z0-9_-]+)/g);
  if (tagMatches) {
    for (const tag of tagMatches) {
      const cleanTag = tag.slice(1);
      if (tag.startsWith('#') && !projectName && cleanTag.length > 2 && /^[A-Z]/.test(cleanTag)) {
        // Likely a project like #Work
        projectName = cleanTag;
      } else {
        tags.push(cleanTag);
      }
      text = text.replace(tag, '');
    }
  }

  // 5. Recurrence detection: every day, daily, every week, weekly, every month, monthly
  const dailyRegex = /\b(every\s+day|daily)\b/i;
  const weeklyRegex = /\b(every\s+week|weekly)\b/i;
  const monthlyRegex = /\b(every\s+month|monthly)\b/i;

  if (dailyRegex.test(text)) {
    isRecurring = true;
    recurrenceRule = { frequency: 'daily', interval: 1 };
    text = text.replace(dailyRegex, '');
  } else if (weeklyRegex.test(text)) {
    isRecurring = true;
    recurrenceRule = { frequency: 'weekly', interval: 1 };
    text = text.replace(weeklyRegex, '');
  } else if (monthlyRegex.test(text)) {
    isRecurring = true;
    recurrenceRule = { frequency: 'monthly', interval: 1 };
    text = text.replace(monthlyRegex, '');
  }

  // 6. Time detection: "at 10am", "at 4:30pm", "10:30am", "15:00"
  const timeRegex = /\b(?:at\s+)?((?:1[0-2]|0?[1-9])(?::([0-5][0-9]))?\s*(am|pm))\b/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const rawTime = timeMatch[1].toLowerCase().replace(/\s+/g, '');
    const isPm = rawTime.includes('pm');
    const isAm = rawTime.includes('am');
    const timeWithoutPeriod = rawTime.replace(/am|pm/, '');
    const parts = timeWithoutPeriod.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;

    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;

    dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    text = text.replace(timeMatch[0], '');
  }

  // 7. Date detection: "today", "tonight", "tomorrow", "tmrw", "next [day]", "in X days", specific days
  const todayRegex = /\b(today|tonight)\b/i;
  const tomorrowRegex = /\b(tomorrow|tmrw)\b/i;
  const inDaysRegex = /\bin\s+(\d+)\s+days?\b/i;
  const daysMap: Record<string, number> = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };
  const nextDayRegex = new RegExp(`\\b(?:next\\s+)?(${Object.keys(daysMap).join('|')})\\b`, 'i');

  if (todayRegex.test(text)) {
    dueDate = now.toISOString().split('T')[0];
    text = text.replace(todayRegex, '');
  } else if (tomorrowRegex.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    dueDate = d.toISOString().split('T')[0];
    text = text.replace(tomorrowRegex, '');
  } else {
    const inDaysMatch = text.match(inDaysRegex);
    if (inDaysMatch) {
      const daysToAdd = parseInt(inDaysMatch[1], 10);
      const d = new Date(now);
      d.setDate(d.getDate() + daysToAdd);
      dueDate = d.toISOString().split('T')[0];
      text = text.replace(inDaysMatch[0], '');
    } else {
      const dayMatch = text.match(nextDayRegex);
      if (dayMatch) {
        const targetDay = daysMap[dayMatch[1].toLowerCase()];
        if (targetDay !== undefined) {
          const d = new Date(now);
          const currentDay = d.getDay();
          let diff = targetDay - currentDay;
          if (diff <= 0) diff += 7; // Next occurrence
          d.setDate(d.getDate() + diff);
          dueDate = d.toISOString().split('T')[0];
          text = text.replace(dayMatch[0], '');
        }
      }
    }
  }

  // Clean up remaining text: remove extra spaces and punctuation
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle || input.trim(),
    dueDate,
    dueTime,
    priority,
    projectName,
    tags,
    estimatedMinutes,
    isRecurring,
    recurrenceRule,
  };
}
