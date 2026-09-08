import { InternalServerError } from "infra/errors.js";

const availableFeatures = [
  // USER
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  // SESSION
  "create:session",
  "read:session",

  // ACTIVATION_TOKEN
  "read:activation_token",

  // TASK
  "create:task",
  "read:task",
  "update:task",
  "delete:task",

  // CATEGORY
  "create:category",
  "read:category",

  // MIGRATIONS
  "create:migration",
  "read:migration",

  // STATUS
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  if (["update:task", "delete:task"].includes(feature) && resource) {
    authorized = false;

    if (user.id === resource.user_id) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature === "read:user") {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        email: resource.email,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      token: resource.token,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
      used_at: resource.used_at,
    };
  }

  if (feature === "read:task") {
    const filterTask = (task) => ({
      id: task.id,
      title: task.title,
      date:
        task.date instanceof Date
          ? task.date.toISOString().slice(0, 10)
          : task.date,
      time: task.time || null,
      is_urgent: task.is_urgent,
      category_id: task.category_id,
      completed_at: task.completed_at
        ? new Date(task.completed_at).toISOString()
        : null,
      created_at: new Date(task.created_at).toISOString(),
      updated_at: new Date(task.updated_at).toISOString(),
    });

    return Array.isArray(resource)
      ? resource.map(filterTask)
      : filterTask(resource);
  }

  if (feature === "read:category") {
    const filterCategory = (category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      created_at: new Date(category.created_at).toISOString(),
      updated_at: new Date(category.updated_at).toISOString(),
    });

    return Array.isArray(resource)
      ? resource.map(filterCategory)
      : filterCategory(resource);
  }

  if (feature === "read:migration") {
    return resource.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    const output = {
      updated_at: resource.updated_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
        },
      },
    };

    if (can(user, "read:status:all")) {
      output.dependencies.database.version =
        resource.dependencies.database.version;
    }

    return output;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer `user` no model `authorization`",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "É necessário fornecer uma `feature` conhecida no model `authorization`",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      cause: "É necessário fornecer um `resource` no `filterOutput`",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
