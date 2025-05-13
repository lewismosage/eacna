import React from 'react';

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  container?: boolean;
  id?: string;
  background?: 'white' | 'light' | 'primary' | 'secondary' | 'accent';
} & React.HTMLAttributes<HTMLElement>;

const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  container = true,
  id,
  background = 'white',
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (background) {
      case 'white':
        return 'bg-white';
      case 'light':
        return 'bg-gray-50';
      case 'primary':
        return 'bg-primary-50 text-primary-900';
      case 'secondary':
        return 'bg-secondary-50 text-secondary-900';
      case 'accent':
        return 'bg-accent-50 text-primary-900';
      default:
        return 'bg-white';
    }
  };

  return (
    <section
      id={id}
      className={`py-12 md:py-16 lg:py-20 ${getBackgroundColor()} ${className}`}
      {...props}
    >
      {container ? <div className="container-custom">{children}</div> : children}
    </section>
  );
};

export default Section;