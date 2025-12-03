import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../../app/components/Navbar";
import { BrowserRouter } from "react-router-dom";

// ---- MOCKS ----

// Mock de zustand store
vi.mock("../../app/store/useUserStore", () => {
  return {
    useUserStore: (selector: any) =>
      selector({
        user: { username: "Jorge", first_name: "Jorge", avatar: null },
        token: "FAKE_TOKEN",
        logout: vi.fn(),
        fetchProfile: vi.fn(),
        loadingProfile: false,
      }),
  };
});

// Mock de API logout
vi.mock("../../app/services/api", () => ({
  AuthAPI: {
    logout: vi.fn().mockResolvedValue(true),
  },
  resolveMediaUrl: () => null,
}));

// Mock de useToast
vi.mock("../../app/ui/ToastProvider", () => ({
  useToast: () => ({
    success: vi.fn(),
  }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual: any = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---- HELPERS ----
const renderNavbar = () =>
  render(
    <BrowserRouter>
      <Navbar />
    </BrowserRouter>
  );

// ---- TESTS ----
describe("Navbar Component", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("renderiza los enlaces principales cuando hay token y usuario", () => {
    renderNavbar();

    expect(screen.getByText("BadgeUp")).toBeInTheDocument();
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Mis Álbumes")).toBeInTheDocument();
    expect(screen.getByText("Ranking")).toBeInTheDocument();
    expect(screen.getByText("Mapa")).toBeInTheDocument();
    expect(screen.getByText("Amigos")).toBeInTheDocument();
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();
  });

  it("muestra el nombre del usuario en el navbar", () => {
    renderNavbar();
    expect(screen.getByText("Jorge")).toBeInTheDocument();
  });

  it("ejecuta logout y navega al hacer click en 'Salir'", async () => {
    renderNavbar();

    const btnSalir = screen.getByRole("button", { name: /Salir/i });
    fireEvent.click(btnSalir);

    // Verifica que navigate("/") fue llamado
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("no renderiza el navbar si no hay token", () => {
    // Reescribimos temporalmente el mock
    vi.mock("../../app/store/useUserStore", () => {
      return {
        useUserStore: (selector: any) =>
          selector({
            user: null,
            token: null,
            logout: vi.fn(),
            fetchProfile: vi.fn(),
            loadingProfile: false,
          }),
      };
    });

    const { container } = renderNavbar();
    expect(container.firstChild).toBeNull();
  });
});
