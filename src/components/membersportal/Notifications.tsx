import { FaBell as Bell } from 'react-icons/fa';

const Notifications = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-primary-800">Notifications</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Mark all as read
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          <div className="p-4 bg-blue-50">
            <div className="flex items-start gap-3">
              <div className="bg-primary-100 p-2 rounded-full">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">New message from Dr. Njeri</h4>
                <p className="text-sm text-gray-600">"Thanks for your question about the PET1 training. We've extended the deadline..."</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">2 hours ago</span>
                  <button className="text-xs text-primary-600 hover:text-primary-700">View</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* More notification items... */}
        </div>
        
        <div className="p-4 border-t border-gray-100">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium w-full text-center">
            View All Notifications
          </button>
        </div>
      </div>
    );
  };
  
  export default Notifications;