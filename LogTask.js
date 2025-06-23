// utils/taskLogger.js
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'task-log.txt');

export function logTaskCompletion(task) {
  const logMessage = `[${new Date().toISOString()}] Task Completed: "${task.title}" (ID: ${task._id})\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to log task completion:', err);
    }
  });
}

export default logTaskCompletion;