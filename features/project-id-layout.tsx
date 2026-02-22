import { Navbar } from "./navbar";

export const ProjectIdLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};