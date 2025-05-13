import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
  toggleOpen?: () => void;
};

const AccordionItem = ({ title, children, isOpen = false, toggleOpen }: AccordionItemProps) => {
  return (
    <div className="border-b border-gray-200">
      <button
        className="flex items-center justify-between w-full py-4 px-1 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
        onClick={toggleOpen}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen opacity-100 pb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="prose max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

type AccordionProps = {
  items: {
    id: string | number;
    title: string;
    content: React.ReactNode;
  }[];
  allowMultiple?: boolean;
};

const Accordion = ({ items, allowMultiple = false }: AccordionProps) => {
  const [openItems, setOpenItems] = useState<(string | number)[]>([]);

  const toggleItem = (id: string | number) => {
    if (openItems.includes(id)) {
      setOpenItems(openItems.filter(item => item !== id));
    } else {
      if (allowMultiple) {
        setOpenItems([...openItems, id]);
      } else {
        setOpenItems([id]);
      }
    }
  };

  return (
    <div className="w-full rounded-lg">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          isOpen={openItems.includes(item.id)}
          toggleOpen={() => toggleItem(item.id)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

export default Accordion;