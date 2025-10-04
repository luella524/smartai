import React, { ReactNode } from 'react';

interface LayoutProps {
  header: ReactNode;
  calendar: ReactNode;
  content?: ReactNode;
  sidebar: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, calendar, content, sidebar }) => {
  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden">
      {header}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-3/4 p-4 flex flex-col overflow-hidden">
          <div className="flex-grow flex flex-col min-h-0">
            {calendar}
          </div>
          {content && (
            <div className="overflow-auto mt-4">
              {content}
            </div>
          )}
        </div>
        <div className="w-full md:w-1/4 p-4 bg-muted overflow-auto">
          {sidebar}
        </div>
      </div>
    </div>
  );
};

export default Layout;
