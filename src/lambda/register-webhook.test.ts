import { handler } from "./register-webhook";
import { SSMClient } from "@aws-sdk/client-ssm";
import { MiniTelegramClient } from "../client/telegram";
import {
  CloudFormationCustomResourceCreateEvent,
  CloudFormationCustomResourceDeleteEvent,
} from "aws-lambda";

jest.mock("@aws-sdk/client-ssm");
jest.mock("../client/telegram");

describe("Webhook registration lambda", () => {
  beforeAll(() => {
    jest.spyOn(SSMClient.prototype, "send").mockImplementation(() =>
      Promise.resolve({
        Parameter: {
          Value: "token",
        },
      })
    );
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("sets webhook when custom resource is created", async () => {
    const event: CloudFormationCustomResourceCreateEvent = {
      RequestType: "Create",
      ResponseURL: "http://pre-signed-S3-url-for-response",
      StackId: "arn:aws:cloudformation:region:account-id:stack/stack-name/guid",
      ServiceToken: "arn:aws:lambda:region:account-id:function:function-name",
      RequestId: "880551b0-b7b4-4a4a-8313-dbd51863f36d",
      LogicalResourceId: "MyTestResource",
      ResourceType: "Custom::TestResource",
      ResourceProperties: {
        webhookUrl: "https://localhost/webhook",
        ServiceToken: "arn:aws:lambda:region:account-id:function:function-name",
      },
    };

    const response = await handler(event);

    expect(response).toEqual({
      PhysicalResourceId: "https://localhost/webhook",
    });
    expect(MiniTelegramClient).toHaveBeenCalledWith("token");
    expect(MiniTelegramClient.prototype.setWebhook).toHaveBeenCalledWith(
      "https://localhost/webhook"
    );
  });

  test("deletes webhook when custom resource is deleted", async () => {
    const event: CloudFormationCustomResourceDeleteEvent = {
      RequestType: "Delete",
      ResponseURL: "http://pre-signed-S3-url-for-response",
      StackId: "arn:aws:cloudformation:region:account-id:stack/stack-name/guid",
      ServiceToken: "arn:aws:lambda:region:account-id:function:function-name",
      RequestId: "880551b0-b7b4-4a4a-8313-dbd51863f36d",
      LogicalResourceId: "MyTestResource",
      ResourceType: "Custom::TestResource",
      PhysicalResourceId: "https://localhost/webhook",
      ResourceProperties: {
        webhookUrl: "https://localhost/webhook",
        ServiceToken: "arn:aws:lambda:region:account-id:function:function-name",
      },
    };

    const response = await handler(event);

    expect(response).toBe(undefined);
    expect(MiniTelegramClient).toHaveBeenCalledWith("token");
    expect(MiniTelegramClient.prototype.deleteWebhook).toHaveBeenCalled();
  });
});
