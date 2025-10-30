import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

export const generateResult = async (prompt, retries = 2) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.`,
  });

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};
