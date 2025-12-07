import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PrivateRoute from "../../frontend-album/app/components/PrivateRoute";

const mockUseRequireAuth = vi.fn();

vi.mock("../../frontend-album/app/hooks/useRequireAuth", () => ({
  useRequireAuth: () => mockUseRequireAuth(),
}));

describe("PrivateRoute Component", () => {
  const MockChild = () => <div>Protected Content</div>;

  const renderPrivateRoute = () =>
    render(
      <BrowserRouter>
        <PrivateRoute>
          <MockChild />
        </PrivateRoute>
      </BrowserRouter>
    );

  it("muestra el contenido si el usuario esta autenticado", () => {
    mockUseRequireAuth.mockReturnValue("authenticated");

    renderPrivateRoute();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("muestra loading si el estado es loading", () => {
    mockUseRequireAuth.mockReturnValue("loading");

    renderPrivateRoute();

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("redirige si el usuario no esta autenticado", () => {
    mockUseRequireAuth.mockReturnValue("unauthenticated");

    renderPrivateRoute();

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});