// src/pages/Chatbot/chatbotService.js (or src/features/Chatbot/chatbotService.js)

const rules = [
  {
    question: "What is the dress code policy?",
    answer: "Employees are expected to wear business casual attire from Monday to Thursday and smart casual on Fridays."
  },
  {
    question: "How many annual leave days do I get?",
    answer: "Full-time staff are entitled to 14 days of annual leave per year."
  },
  {
    question: "What is the procedure for sick leave?",
    answer: "Submit your medical certificate to HR via email within 2 days of absence."
  },
  {
    question: "What are the working hours?",
    answer: "Standard working hours are 9:00 AM to 6:00 PM, Monday to Friday."
  },
  {
    question: "How do I request time off?",
    answer: "Submit a leave request through the HR portal at least 2 weeks in advance."
  },
  {
    question: "What is the remote work policy?",
    answer: "Employees can work remotely up to 2 days per week with manager approval."
  },
  // Add more handbook FAQs here
];

export function getChatbotResponse(userInput) {
  const lowerInput = userInput.toLowerCase();

  // Check for exact matches first
  for (let rule of rules) {
    if (lowerInput.includes(rule.question.toLowerCase())) {
      return rule.answer;
    }
  }

  // Check for keyword matches
  for (let rule of rules) {
    const keywords = rule.question.toLowerCase().split(' ');
    if (keywords.some(keyword => keyword.length > 3 && lowerInput.includes(keyword))) {
      return rule.answer;
    }
  }

  // Check for partial matches (first few words)
  for (let rule of rules) {
    const firstWords = rule.question.toLowerCase().split(' ').slice(0, 3).join(' ');
    if (lowerInput.includes(firstWords)) {
      return rule.answer;
    }
  }

  return "Sorry, I couldn't find that in the handbook. Please contact HR for more details or try asking about dress code, annual leave, sick leave, working hours, time off requests, or remote work policy.";
}