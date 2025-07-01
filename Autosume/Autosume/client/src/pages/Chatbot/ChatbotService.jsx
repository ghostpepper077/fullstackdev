import rules from "./ChatbotConfig";

export function getChatbotResponse(userInput) {
  const lowerInput = userInput.toLowerCase();

  for (let rule of rules) {
    if (lowerInput.includes(rule.question.toLowerCase().slice(0, 5))) {
      return rule.answer;
    }
  }

  return "Sorry, I couldn't find that in the handbook. Please contact HR for more details.";
}