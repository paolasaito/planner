import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import category from "models/category.js";
import authorization from "models/authorization.js";
import { ForbiddenError, ValidationError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("update:category"), patchHandler);
router.delete(controller.canRequest("delete:category"), deleteHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const userTryingToPatch = request.context.user;
  const categoryFound = await findOwnCategory(
    request.query.id,
    userTryingToPatch,
    "update:category",
  );

  const name =
    "name" in request.body
      ? String(request.body.name || "")
      : categoryFound.name;
  const color = "color" in request.body ? request.body.color : null;

  if (!name.trim()) {
    throw new ValidationError({
      message: "O nome da categoria é obrigatório.",
      action: "Informe um nome para a categoria.",
    });
  }

  if (color !== null && !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new ValidationError({
      message: "A cor da categoria é inválida.",
      action: "Escolha uma cor para a categoria.",
    });
  }

  const updatedCategory = await category.update(categoryFound.id, {
    name: name.trim(),
    color: color === null ? categoryFound.color : color,
  });

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:category",
    updatedCategory,
  );

  return response.status(200).json(secureOutputValues);
}

async function deleteHandler(request, response) {
  const userTryingToDelete = request.context.user;
  const categoryFound = await findOwnCategory(
    request.query.id,
    userTryingToDelete,
    "delete:category",
  );

  const deletedCategory = await category.remove(categoryFound.id);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:category",
    deletedCategory,
  );

  return response.status(200).json(secureOutputValues);
}

async function findOwnCategory(categoryId, user, feature) {
  const categoryFound = await category.findOneById(categoryId);

  if (!authorization.can(user, feature, categoryFound)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para alterar esta categoria.",
      action: "Verifique se a categoria pertence ao seu usuário.",
    });
  }

  return categoryFound;
}
