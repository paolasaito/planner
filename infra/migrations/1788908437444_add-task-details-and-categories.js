exports.up = (pgm) => {
  pgm.createTable("categories", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // No FK, following the same convention as `tasks.user_id`.
    user_id: {
      type: "uuid",
      notNull: true,
    },

    name: {
      type: "varchar(60)",
      notNull: true,
    },

    // Hex color, e.g. #a47dab
    color: {
      type: "varchar(7)",
      notNull: true,
    },

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

  pgm.addColumns("tasks", {
    time: {
      type: "time",
    },

    is_urgent: {
      type: "boolean",
      notNull: true,
      default: false,
    },

    // No FK, same convention as `tasks.user_id`.
    category_id: {
      type: "uuid",
    },
  });
};

exports.down = false;
