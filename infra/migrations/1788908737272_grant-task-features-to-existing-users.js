// Accounts created before tasks/categories existed would get 403 on those
// endpoints, so backfill the features they are missing.
const NEW_FEATURES = [
  "create:task",
  "read:task",
  "update:task",
  "create:category",
  "read:category",
];

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
