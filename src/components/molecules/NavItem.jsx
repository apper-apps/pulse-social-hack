import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NavItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
          isActive 
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg" 
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      {({ isActive }) => (
        <>
          <ApperIcon 
            name={icon} 
            className={cn(
              "w-5 h-5 transition-all duration-200",
              isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
            )} 
          />
          <span className="font-medium">{label}</span>
          {badge && (
            <span className={cn(
              "ml-auto px-2 py-0.5 text-xs rounded-full",
              isActive 
                ? "bg-white/20 text-white" 
                : "bg-primary-100 text-primary-700"
            )}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

export default NavItem;