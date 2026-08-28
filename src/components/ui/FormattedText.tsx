import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  if (!text) return null;
  
  return (
    <span className={className}>
      {text.split(/(\n|<br\s*\/?>|<\/br>)/i).map((part, i) => {
        if (part === '\n' || /<br\s*\/?>|<\/br>/i.test(part)) {
          return <br key={i} />;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
};
