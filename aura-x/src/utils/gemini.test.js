import { describe, expect, it } from "vitest";
import { buildGeminiRequest } from "./gemini";

describe("buildGeminiRequest", () => {
  it("builds a Gemini request with study context and the API key", () => {
    const result = buildGeminiRequest({
      apiKey: "test-key",
      userMessage: "Help me plan revision for analytics",
      history: [
        { role: "user", text: "Say hi" },
        { role: "assistant", text: "Hi there!" },
      ],
      data: {
        semester: { name: "Fall 2026" },
        subjects: [{ name: "Statistics" }],
        assignments: [
          { title: "Analytics quiz", dueDate: "2026-09-02", status: "pending" },
        ],
      },
    });

    expect(result.url).toContain(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    );
    expect(result.payload.contents).toHaveLength(3);
    expect(result.payload.contents[0].role).toBe("user");
    expect(result.payload.contents[2].parts[0].text).toContain(
      "Help me plan revision for analytics",
    );
    expect(result.payload.contents[2].parts[0].text).toContain("Statistics");
  });
});
