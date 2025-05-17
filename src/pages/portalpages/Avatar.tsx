interface AvatarProps {
    user: { 
      firstName: string; 
      lastName: string; 
      profileImage: string | null 
    };
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
  
  const Avatar = ({ user, size = "md" }: AvatarProps) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-lg"
    };
    
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    
    return (
      <div className={`rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center ${sizeClasses[size]}`}>
        {user.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  };
  
  export default Avatar;