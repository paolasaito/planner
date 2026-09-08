import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

const DEFAULT_FROM = "Resend <onboarding@resend.dev>";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: DEFAULT_FROM,
      to: "Paola <paola@email.com>",
      subject: "Teste de assunto",
      text: "Teste de corpo",
    });

    await email.send({
      from: DEFAULT_FROM,
      to: "Paola <paola@email.com>",
      subject: "Último email enviado",
      text: "Corpo do último email.",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<onboarding@resend.dev>");
    expect(lastEmail.recipients[0]).toBe("<paola@email.com>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe("Corpo do último email.\r\n");
  });
});
