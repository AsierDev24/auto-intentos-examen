import Database from '@tauri-apps/plugin-sql'
import type { ExamenGuardado, Pregunta } from '@/stores/useTestStore'

let dbPromise: Promise<Database> | null = null

async function database() {
  dbPromise ??= Database.load('sqlite:autoexamen.db')
    .then(async db => {
      await db.execute(`CREATE TABLE IF NOT EXISTS exams (id TEXT PRIMARY KEY, name TEXT NOT NULL, source TEXT, created_at TEXT NOT NULL)`)
      await db.execute(`CREATE TABLE IF NOT EXISTS questions (exam_id TEXT NOT NULL, question_id TEXT NOT NULL, statement TEXT NOT NULL, options TEXT NOT NULL, correct TEXT, status TEXT, warnings TEXT, PRIMARY KEY (exam_id, question_id))`)
      return db
    })
  return dbPromise
}

export async function persistExam(exam: ExamenGuardado): Promise<void> {
  const db = await database()
  await db.execute('INSERT OR REPLACE INTO exams (id, name, source, created_at) VALUES ($1, $2, $3, $4)', [exam.id, exam.nombre, exam.origen || null, exam.fecha])
  await db.execute('DELETE FROM questions WHERE exam_id = $1', [exam.id])
  for (const question of exam.preguntas) {
    await db.execute('INSERT INTO questions (exam_id, question_id, statement, options, correct, status, warnings) VALUES ($1, $2, $3, $4, $5, $6, $7)', [exam.id, question.id, question.enunciado, JSON.stringify(question.opciones), question.correcta || null, question.estado || null, JSON.stringify(question.advertencias || [])])
  }
}

export async function removeExam(id: string): Promise<void> {
  const db = await database(); await db.execute('DELETE FROM questions WHERE exam_id = $1', [id]); await db.execute('DELETE FROM exams WHERE id = $1', [id])
}

export async function migrateLibrary(exams: ExamenGuardado[]): Promise<void> {
  for (const exam of exams) await persistExam(exam)
}

export function asQuestion(row: any): Pregunta {
  return { id: row.question_id, enunciado: row.statement, opciones: JSON.parse(row.options), correcta: row.correct || undefined, estado: row.status || undefined, advertencias: JSON.parse(row.warnings || '[]') }
}
