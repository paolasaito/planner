import database from "infra/database.js";
import { NotFoundError } from "infra/errors.js";

async function create({ userId, title, date, time, isUrgent, categoryId }) {
  const newTask = await runInsertQuery({
    userId,
    title,
    date,
    time,
    isUrgent,
    categoryId,
  });
  return newTask;

  async function runInsertQuery({
    userId,
    title,
    date,
    time,
    isUrgent,
    categoryId,
  }) {
    const results = await database.query({
      text: `
        INSERT INTO
          tasks (user_id, title, date, time, is_urgent, category_id)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING
          *
      ;`,
      values: [
        userId,
        title,
        date,
        time || null,
        Boolean(isUrgent),
        categoryId || null,
      ],
    });

    return results.rows[0];
  }
}

async function createMany(taskInputValues) {
  const createdTasks = [];

  for (const taskInputValue of taskInputValues) {
    createdTasks.push(await create(taskInputValue));
  }

  return createdTasks;
}

async function findAllByUserIdAndDate(userId, date) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        tasks
      WHERE
        user_id = $1
        AND date = $2
      ORDER BY
        is_urgent DESC,
        (time IS NULL) ASC,
        time ASC,
        created_at ASC
    ;`,
    values: [userId, date],
  });

  return results.rows;
}

async function findAllByUserIdAndDateRange(userId, startDate, endDate) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        tasks
      WHERE
        user_id = $1
        AND date >= $2
        AND date <= $3
      ORDER BY
        date ASC,
        is_urgent DESC,
        (time IS NULL) ASC,
        time ASC,
        created_at ASC
    ;`,
    values: [userId, startDate, endDate],
  });

  return results.rows;
}

async function findOneById(id) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        tasks
      WHERE
        id = $1
      LIMIT
        1
    ;`,
    values: [id],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "A tarefa informada não foi encontrada no sistema.",
      action: "Verifique se o id está digitado corretamente.",
    });
  }

  return results.rows[0];
}

async function update(id, { title, date, time, isUrgent, categoryId }) {
  const results = await database.query({
    text: `
      UPDATE
        tasks
      SET
        title = $2,
        date = $3,
        time = $4,
        is_urgent = $5,
        category_id = $6,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
    ;`,
    values: [
      id,
      title,
      date,
      time || null,
      Boolean(isUrgent),
      categoryId || null,
    ],
  });

  return results.rows[0];
}

async function remove(id) {
  const results = await database.query({
    text: `
      DELETE FROM
        tasks
      WHERE
        id = $1
      RETURNING
        *
    ;`,
    values: [id],
  });

  return results.rows[0];
}

async function setCompleted(id, completed) {
  const results = await database.query({
    text: `
      UPDATE
        tasks
      SET
        completed_at = $2,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
    ;`,
    values: [id, completed ? new Date() : null],
  });

  return results.rows[0];
}

const task = {
  create,
  createMany,
  findAllByUserIdAndDate,
  findAllByUserIdAndDateRange,
  update,
  remove,
  findOneById,
  setCompleted,
};

export default task;
