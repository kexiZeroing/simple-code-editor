import { ProjectIdLayout } from "@/features/project-id-layout";

const Layout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {

  return (
    <ProjectIdLayout>
      {children}
    </ProjectIdLayout>
  );
}
 
export default Layout;