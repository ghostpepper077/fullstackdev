const rules = [
  {
    question: "Hello",
    answer: "Hello! How can I assist you today?"
  },
  {
    question: "Thank you",
    answer: "You're welcome! If you have any more questions, feel free to ask."
  },
  {
    question: "dress code policy?",
    answer: "Employees are expected to wear business casual attire from Monday to Thursday and smart casual on Fridays."
  },
  {
    question: "leave days",
    answer: "Full-time staff are entitled to 14 days of annual leave per year."
  },
  {
    question: "sick leave",
    answer: "Submit your medical certificate to HR via email within 2 days of absence."
  },
  {
    question: "working hours",
    answer: "Standard working hours are 9:00 AM to 6:00 PM, Monday to Friday."
  },
  {
    question: "time off",
    answer: "Submit a leave request through the HR portal at least 2 weeks in advance."
  },
  {
    question: "remote work policy",
    answer: "Employees can work remotely up to 2 days per week with manager approval."
  },

];

export function getChatbotResponse(userInput) {
  const lowerInput = userInput.toLowerCase();

  
  for (let rule of rules) {
    if (lowerInput.includes(rule.question.toLowerCase())) {
      return rule.answer;
    }
  }

  
  for (let rule of rules) {
    const keywords = rule.question.toLowerCase().split(' ');
    if (keywords.some(keyword => keyword.length > 3 && lowerInput.includes(keyword))) {
      return rule.answer;
    }
  }


  for (let rule of rules) {
    const firstWords = rule.question.toLowerCase().split(' ').slice(0, 3).join(' ');
    if (lowerInput.includes(firstWords)) {
      return rule.answer;
    }
  }

  return "Sorry, I couldn't find that in the handbook. Please contact HR for more details or try asking about dress code, annual leave, sick leave, working hours, time off requests, or remote work policy.";
}