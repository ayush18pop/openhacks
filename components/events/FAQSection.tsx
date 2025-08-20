'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../retroui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => (
  <div className="border-b border-border py-4">
    <button
      className="w-full flex justify-between items-center text-left"
      onClick={onClick}
      aria-expanded={isOpen}
    >
      <h3 className="text-lg font-medium">{question}</h3>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
    {isOpen && (
      <div className="mt-2 text-muted-foreground">
        <p>{answer}</p>
      </div>
    )}
  </div>
);

interface FAQSectionProps {
  faqs: Array<{ question: string; answer: string }>;
  className?: string;
}

export default function FAQSection({ faqs, className = '' }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
