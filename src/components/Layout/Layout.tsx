import React, { ReactNode } from 'react';

interface LayoutProps {
  header: ReactNode;
  calendar: ReactNode;
  content?: ReactNode;
  sidebar: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, calendar, content, sidebar }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {header}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="w-full lg:w-2/3 p-6 flex flex-col overflow-hidden">
          <div className="flex-grow flex flex-col min-h-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 flex-grow">
              {calendar}
            </div>
          </div>
          {content && (
            <div className="overflow-auto mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                {content}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 p-6 space-y-6 overflow-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
            {sidebar}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
