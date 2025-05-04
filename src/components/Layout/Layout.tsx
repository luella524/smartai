
import React, { ReactNode } from 'react';

interface LayoutProps {
  header: ReactNode;
  calendar: ReactNode;
  content: ReactNode;
  sidebar: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, calendar, content, sidebar }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {header}
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-3/4 p-4">
          {calendar}
          {content}
        </div>
        <div className="w-full md:w-1/4 p-4 bg-muted">
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default Layout;
