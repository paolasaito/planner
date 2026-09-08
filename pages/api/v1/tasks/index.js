import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import task from "models/task.js";
import category from "models/category.js";
import authorization from "models/authorization.js";
import date from "infra/date.js";
import { ValidationError, ForbiddenError } from "infra/errors.js";

const VALID_RECURRENCES = ["daily", "weekly", "monthly"];
const MAX_OCCURRENCES = 400;

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:task"), getHandler);
router.post(controller.canRequest("create:task"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const { startDate, endDate } = request.query;

  const tasks =
    startDate && endDate
      ? await task.findAllByUserIdAndDateRange(
          userTryingToGet.id,
          startDate,
          endDate,
        )
      : await task.findAllByUserIdAndDate(
          userTryingToGet.id,
          request.query.date || date.getTodayInBrazil(),
        );

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:task",
    tasks,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const {
    title,
    date: taskDate,
    time,
    isUrgent,
    categoryId,
    recurrence,
    repeatUntil,
  } = request.body;

  if (!title || !title.trim()) {
    throw new ValidationError({
      message: "O título da tarefa é obrigatório.",
      action: "Informe um título para a tarefa.",
    });
  }

  if (categoryId) {
    const categoryFound = await category.findOneById(categoryId);

    if (categoryFound.user_id !== userTryingToPost.id) {
      throw new ForbiddenError({
        message: "Você não possui permissão para usar esta categoria.",
        action: "Verifique se a categoria pertence ao seu usuário.",
      });
    }
  }

  const startDate = taskDate || date.getTodayInBrazil();
  const occurrenceDates = buildOccurrenceDates(
    startDate,
    recurrence,
    repeatUntil,
  );

  const createdTasks = await task.createMany(
    occurrenceDates.map((occurrenceDate) => ({
      userId: userTryingToPost.id,
      title: title.trim(),
      date: occurrenceDate,
      time: time || null,
      isUrgent: Boolean(isUrgent),
      categoryId: categoryId || null,
    })),
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:task",
    createdTasks,
  );

  return response.status(201).json(secureOutputValues);
}

function buildOccurrenceDates(startDate, recurrence, repeatUntil) {
  if (!recurrence) {
    return [startDate];
  }

  if (!VALID_RECURRENCES.includes(recurrence)) {
    throw new ValidationError({
      message: "A repetição informada é inválida.",
      action: "Escolha entre repetição diária, semanal ou mensal.",
    });
  }

  if (!repeatUntil) {
    throw new ValidationError({
      message: "A data de término da repetição é obrigatória.",
      action: "Escolha até quando a tarefa deve se repetir.",
    });
  }

  if (repeatUntil < startDate) {
    throw new ValidationError({
      message:
        "A data de término da repetição não pode ser anterior à data da tarefa.",
      action: "Escolha uma data de término posterior à data da tarefa.",
    });
  }

  const occurrenceDates = date.generateOccurrenceDates(
    startDate,
    recurrence,
    repeatUntil,
  );

  if (occurrenceDates.length > MAX_OCCURRENCES) {
    throw new ValidationError({
      message: "O período de repetição é muito longo.",
      action: "Escolha uma data de término mais próxima.",
    });
  }

  return occurrenceDates;
}
