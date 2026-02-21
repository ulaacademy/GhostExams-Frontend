"use client";
// 📌 components/ui/card.js

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn("bg-white shadow-md rounded-lg p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn("border-b pb-2 mb-2 font-bold text-lg", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "", ...props }) => {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h2 className={cn("text-xl font-semibold", className)} {...props}>
      {children}
    </h2>
  );
};
