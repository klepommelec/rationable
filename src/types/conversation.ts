
export interface IConversationQuestion {
  id: string;
  type: 'text' | 'choice' | 'scale';
  question: string;
  placeholder?: string;
  choices?: string[];
  min?: number;
  max?: number;
  required: boolean;
}

export interface IConversationAnswer {
  questionId: string;
  answer: string;
}

export interface IConversationResponse {
  questions: IConversationQuestion[];
  estimatedTime: string;
}
