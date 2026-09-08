import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import task from "models/task.js";
import category from "models/category.js";
import authorization from "models/authorization.js";
import { ForbiddenError, ValidationError } from "infra/errors.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("update:task"), patchHandler);
router.delete(controller.canRequest("delete:task"), deleteHandler);

export default router.handler(controller.errorHandlers);

async function deleteHandler(request, response) {
  const userTryingToDelete = request.context.user;
  const taskId = request.query.id;

  const taskFound = await task.findOneById(taskId);

  if (!authorization.can(userTryingToDelete, "delete:task", taskFound)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para excluir esta tarefa.",
      action: "Verifique se esta tarefa pertence ao seu usuário.",
    });
  }

  const deletedTask = await task.remove(taskId);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:task",
    deletedTask,
  );

  return response.status(200).json(secureOutputValues);
}

async function patchHandler(request, response) {
  const userTryingToPatch = request.context.user;
  const taskId = request.query.id;

  const taskFound = await task.findOneById(taskId);

  if (!authorization.can(userTryingToPatch, "update:task", taskFound)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para editar esta tarefa.",
      action: "Verifique se esta tarefa pertence ao seu usuário.",
    });
  }

  const updatedTask =
    "completed" in request.body
      ? await task.setCompleted(taskId, Boolean(request.body.completed))
      : await updateTaskValues(taskFound, request.body, userTryingToPatch);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:task",
    updatedTask,
  );

  return response.status(200).json(secureOutputValues);
}

async function updateTaskValues(taskFound, inputValues, userTryingToPatch) {
  const title =
    "title" in inputValues ? String(inputValues.title || "") : taskFound.title;

  if (!title.trim()) {
    throw new ValidationError({
      message: "O título da tarefa é obrigatório.",
      action: "Informe um título para a tarefa.",
    });
  }

  const categoryId =
    "categoryId" in inputValues
      ? inputValues.categoryId || null
      : taskFound.category_id;

  if (categoryId) {
    const categoryFound = await category.findOneById(categoryId);

    if (categoryFound.user_id !== userTryingToPatch.id) {
      throw new ForbiddenError({
        message: "Você não possui permissão para usar esta categoria.",
        action: "Verifique se a categoria pertence ao seu usuário.",
      });
    }
  }

  return await task.update(taskFound.id, {
    title: title.trim(),
    date: "date" in inputValues ? inputValues.date : taskFound.date,
    time: "time" in inputValues ? inputValues.time : taskFound.time,
    isUrgent:
      "isUrgent" in inputValues ? inputValues.isUrgent : taskFound.is_urgent,
    categoryId,
  });
}
