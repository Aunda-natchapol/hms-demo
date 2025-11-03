import type { FC } from "react";
import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { ReactRouterAppProvider as AppProvider } from "@toolpad/core/react-router";
import { navigation, BRANDING } from "./constants/navigation";
import { Theme } from "./layout";
import PageContent from "./components/PageContent";

const App: FC = () => {
  return (
    <AppProvider
      navigation={navigation}
      branding={BRANDING}
      theme={Theme}
    >
      <DashboardLayout>
        <PageContent>
          <Outlet />
        </PageContent>
      </DashboardLayout>
    </AppProvider>
  );
};

export default App;
