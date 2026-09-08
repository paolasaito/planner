import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import category from "models/category.js";
import authorization from "models/authorization.js";
import { ValidationError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:category"), getHandler);
router.post(controller.canRequest("create:category"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;

  const categories = await category.findAllByUserId(userTryingToGet.id);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:category",
    categories,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const { name, color } = request.body;

  if (!name || !name.trim()) {
    throw new ValidationError({
      message: "O nome da categoria é obrigatório.",
      action: "Informe um nome para a categoria.",
    });
  }

  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw new ValidationError({
      message: "A cor da categoria é inválida.",
      action: "Escolha uma cor para a categoria.",
    });
  }

  const newCategory = await category.create({
    userId: userTryingToPost.id,
    name: name.trim(),
    color,
  });

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:category",
    newCategory,
  );

  return response.status(201).json(secureOutputValues);
}
