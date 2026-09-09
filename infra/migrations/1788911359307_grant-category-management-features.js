// Backfills the features for accounts created before category editing existed.
const NEW_FEATURES = ["update:category", "delete:category"];

exports.up = (pgm) => {
  NEW_FEATURES.forEach((feature) => {
    pgm.sql(`
      UPDATE
        users
      SET
        features = array_append(features, '${feature}'),
        updated_at = timezone('utc', now())
      WHERE
        NOT ('${feature}' = ANY(features))
    ;`);
  });
};

exports.down = false;
