import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLibrary } from "../../context/LibraryContext";
import { Card } from "../../styles/ui";
import { LibraryLoadState } from "../common/LibraryLoadState";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Content, Main, Shell } from "./layout.styles";

export const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status } = useLibrary();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Shell>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Main>
        <Header onMenu={() => setMenuOpen(true)} />
        <Content>
          {status === "ready" ? (
            <Outlet />
          ) : (
            <Card>
              <LibraryLoadState />
            </Card>
          )}
        </Content>
      </Main>
    </Shell>
  );
};
