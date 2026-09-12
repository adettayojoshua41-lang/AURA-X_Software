export function buildGeminiRequest({
  apiKey,
  userMessage,
  history = [],
  data = {},
}) {
  const summary = {
    semester: data.semester?.name || "Not set",
    subjects: (data.subjects || []).map((subject) => ({
      name: subject.name,
      grade: subject.grade || "Unassigned",
      teacher: subject.teacher || "Not set",
    })),
    assignments: (data.assignments || []).map((assignment) => ({
      title: assignment.title,
      subjectId: assignment.subjectId || "General",
      dueDate: assignment.dueDate || "No due date",
      status: assignment.status || "pending",
    })),
    notes: (data.notes || []).slice(0, 5).map((note) => ({
      title: note.title || "Untitled note",
      text: note.text || "",
    })),
  };

  const contextText = `You are AURA-X, a helpful study assistant for a student workspace. Use the user's study context carefully and respond in a friendly, practical way.\n\nStudy context:\n${JSON.stringify(summary, null, 2)}\n\nFollow the same tone and structure as a focused academic assistant: suggest actionable plans, study priorities, and concise guidance. If the user asks to plan revision, prioritize deadlines and coursework. If they ask for generic help, keep the answer concise and useful.`;

  const contents = [
    ...history.flatMap((entry) => {
      const role = entry.role === "assistant" ? "model" : "user";
      return [{ role, parts: [{ text: entry.text || "" }] }];
    }),
    {
      role: "user",
      parts: [{ text: `${contextText}\n\nUser message:\n${userMessage}` }],
    },
  ];

  return {
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    payload: {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 700,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    },
  };
}
