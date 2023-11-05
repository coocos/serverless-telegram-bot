import { handler } from "./webhook";
import ChatRepository from "../repository/chatRepository";
import { APIGatewayProxyEventV2 } from "aws-lambda";

jest.spyOn(ChatRepository.prototype, "add").mockImplementation();
jest.spyOn(ChatRepository.prototype, "remove").mockImplementation();

function createApiGatewayProxyEvent(
  body: Record<string, any>
): APIGatewayProxyEventV2 {
  return {
    version: "2.0",
    routeKey: "$efault",
    rawPath: "/my/path",
    rawQueryString: "parameter1=value1&parameter2=value",
    headers: {
      Host: "id.execute-api.region.amazonaws.com",
      "User-Agent": "PostmanRuntime/7.26.8",
      "X-Forwarded-For": "123.123.123.123",
      "X-Forwarded-Port": "443",
      "X-Forwarded-Proto": "https",
    },
    requestContext: {
      accountId: "123456789012",
      apiId: "api-id",
      domainName: "id.execute-api.region.amazonaws.com",
      domainPrefix: "id",
      http: {
        method: "GET",
        path: "/my/path",
        protocol: "HTTP/1.1",
        sourceIp: "123.123.123.123",
        userAgent: "PostmanRuntime/7.26.8",
      },
      requestId: "id",
      routeKey: "$default",
      stage: "$default",
      time: "12/Mar/2020:19:03:58 +0000",
      timeEpoch: 1583348638390,
    },
    body: JSON.stringify(body),
    isBase64Encoded: false,
  };
}

describe("Webhook lambda", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("handles adding bot to group", async () => {
    const addedToGroupEvent = {
      update_id: 123456789,
      my_chat_member: {
        chat: {
          id: -123456789,
          title: "Test group",
          type: "group",
        },
        from: {
          id: 1234567890,
          is_bot: false,
          first_name: "John",
          last_name: "Smith",
          language_code: "en",
        },
        date: 1699116622,
        old_chat_member: {
          user: {
            id: 1122334455,
            is_bot: true,
            first_name: "Testbot",
            username: "TestBot",
          },
          status: "left",
        },
        new_chat_member: {
          user: {
            id: 1122334455,
            is_bot: true,
            first_name: "Testbot",
            username: "TestBot",
          },
          status: "member",
        },
      },
    };

    const response = await handler(
      createApiGatewayProxyEvent(addedToGroupEvent)
    );

    expect(ChatRepository.prototype.add).toHaveBeenCalledWith(-123456789);
    expect(response.statusCode).toBe(200);
  });

  test("handles removing bot from group", async () => {
    const removedFromGroupEvent = {
      update_id: 123456789,
      my_chat_member: {
        chat: {
          id: -123456789,
          title: "Test group",
          type: "group",
        },
        from: {
          id: 1234567890,
          is_bot: false,
          first_name: "John",
          last_name: "Smith",
          language_code: "en",
        },
        date: 1699116622,
        old_chat_member: {
          user: {
            id: 1122334455,
            is_bot: true,
            first_name: "Testbot",
            username: "TestBot",
          },
          status: "member",
        },
        new_chat_member: {
          user: {
            id: 1122334455,
            is_bot: true,
            first_name: "Testbot",
            username: "TestBot",
          },
          status: "left",
        },
      },
    };

    const response = await handler(
      createApiGatewayProxyEvent(removedFromGroupEvent)
    );

    expect(ChatRepository.prototype.remove).toHaveBeenCalledWith(-123456789);
    expect(response.statusCode).toBe(200);
  });
});
