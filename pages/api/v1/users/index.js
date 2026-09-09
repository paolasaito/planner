import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const userInputValues = request.body;
  const createdUser = await user.create(userInputValues);

  const activatedUser = await user.setFeatures(createdUser.id, [
    "create:session",
    "read:session",
    "update:user",
    "create:task",
    "read:task",
    "update:task",
    "delete:task",
    "create:category",
    "read:category",
    "update:category",
    "delete:category",
  ]);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    activatedUser,
  );

  return response.status(201).json(secureOutputValues);
}
