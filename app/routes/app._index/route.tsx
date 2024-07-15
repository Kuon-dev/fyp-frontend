import { DataTableLoadingComponent } from "@/components/dashboard/loading";
import { withRoleBasedRedirect } from "@/components/dashboard/role-redirect";

function Index() {
  return (
    <div>
      <DataTableLoadingComponent />
    </div>
  );
}

export default withRoleBasedRedirect(Index);
