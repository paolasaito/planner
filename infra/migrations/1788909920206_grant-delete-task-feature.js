// Backfills the feature for accounts created before task deletion existed.
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE
      users
    SET
      features = array_append(features, 'delete:task'),
      updated_at = timezone('utc', now())
    WHERE
      NOT ('delete:task' = ANY(features))
  ;`);
};

exports.down = false;
