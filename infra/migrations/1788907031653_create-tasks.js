exports.up = (pgm) => {
  pgm.createTable("tasks", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // No FK, following the same convention as `sessions.user_id`.
    user_id: {
      type: "uuid",
      notNull: true,
    },

    title: {
      type: "varchar(255)",
      notNull: true,
    },

    // The day this task belongs to, in the user's local calendar date.
    date: {
      type: "date",
      notNull: true,
    },

    completed_at: {
      type: "timestamptz",
    },

    // Why timestamptz with timezone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc', now())"),
    },
  });

  pgm.createIndex("tasks", ["user_id", "date"]);
};

exports.down = false;
