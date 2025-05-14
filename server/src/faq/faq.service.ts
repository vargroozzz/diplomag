import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

// PLACEHOLDER: Replace this with your actual FAQ data source (e.g., load from JSON, database)
const FAQ_DATA = [
  {
    question: "Як зареєструватися на платформі?",
    answer: "Для реєстрації натисніть кнопку 'Зареєструватися' у верхньому правому куті сторінки та заповніть необхідні поля: ім'я користувача, електронну пошту та пароль. Після цього ви отримаєте лист для верифікації email."
  },
  {
    question: "Як додати вулик на карту?",
    answer: "Перейдіть на сторінку 'Карта', натисніть кнопку 'Додати Вулик', клікніть на карті у місці бажаного розташування, заповніть назву та нотатки у діалоговому вікні та збережіть."
  },
  {
    question: "What is the capital of France?", // Example of an off-topic question
    answer: "I can only answer questions about the Beekeepers Community Platform based on the provided FAQ."
  }
];

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);
  private openai: OpenAI | null = null; // Initialize as null

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn(
        'OPENAI_API_KEY is not configured. FAQ service will use placeholder responses or may not work fully.',
      );
    }
  }

  async answerQuestion(userQuestion: string): Promise<string> {
    if (!this.openai) {
      this.logger.warn('OpenAI client not initialized. Returning placeholder response.');
      return 'Вибачте, сервіс FAQ наразі недоступний через відсутність конфігурації API ключа.';
    }

    const faqContext = FAQ_DATA.map(
      (item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`,
    ).join('\n\n');

    const systemMessage = `Ви є корисним асистентом для платформи "Beekeepers Community Platform". Ваше завдання - відповідати на питання користувачів, базуючись ВИКЛЮЧНО на наданому контексті з ЧаПи (Часто Задаваних Питань). Якщо відповіді немає в контексті, чітко вкажіть, що ви не можете надати відповідь на основі наявної інформації. Не вигадуйте відповіді. Будьте коротким та чітким. Відповідайте українською мовою.`;

    // For a more robust solution with many FAQs, implement semantic search here
    // to find the top_k most relevant FAQs to include in the prompt context.
    // For now, we include all FAQs if the total prompt length allows.

    const promptContent = `Наданий контекст з ЧаПи:
    --- BEGIN FAQ CONTEXT ---
    ${faqContext}
    --- END FAQ CONTEXT ---
    
    Питання користувача: ${userQuestion}
    
    Відповідь (базуючись тільки на наданому контексті ЧаПи):`;

    try {
      this.logger.debug(`Sending prompt to OpenAI for question: "${userQuestion}"`);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Consider gpt-3.5-turbo-0125 or gpt-4o if available
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: promptContent },
        ],
        temperature: 0.2, // Lower for more factual answers
        max_tokens: 200, // Max length of the generated answer
      });

      const answer = completion.choices[0]?.message?.content?.trim() || 'Вибачте, не вдалося обробити запит до ШІ.';
      this.logger.debug(`LLM Answer: ${answer}`);
      return answer;
    } catch (error: any) {
      this.logger.error('Error calling OpenAI API:', error.message);
      if (error.response) {
        this.logger.error('OpenAI API Error Response:', error.response.data);
      }
      return 'Вибачте, сталася помилка під час взаємодії з сервісом ШІ.';
    }
  }
} 