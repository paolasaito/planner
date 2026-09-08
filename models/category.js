import database from "infra/database.js";
import { NotFoundError } from "infra/errors.js";

async function create({ userId, name, color }) {
  const newCategory = await runInsertQuery({ userId, name, color });
  return newCategory;

  async function runInsertQuery({ userId, name, color }) {
    const results = await database.query({
      text: `
        INSERT INTO
          categories (user_id, name, color)
        VALUES
          ($1, $2, $3)
        RETURNING
          *
      ;`,
      values: [userId, name, color],
    });

    return results.rows[0];
  }
}

async function findAllByUserId(userId) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        categories
      WHERE
        user_id = $1
      ORDER BY
        created_at ASC
    ;`,
    values: [userId],
  });

  return results.rows;
}

async function findOneById(id) {
  const results = await database.query({
    text: `
      SELECT
        *
      FROM
        categories
      WHERE
        id = $1
      LIMIT
        1
    ;`,
    values: [id],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "A categoria informada não foi encontrada no sistema.",
      action: "Verifique se o id está digitado corretamente.",
    });
  }

  return results.rows[0];
}

const category = {
  create,
  findAllByUserId,
  findOneById,
};

export default category;
