import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AlbumCard from "../../app/components/AlbumCard";
import { BrowserRouter } from "react-router-dom";

vi.mock("../../app/services/api", () => ({
  resolveMediaUrl: vi.fn(() => null), // retorna null → usa placeholder
}));

describe("AlbumCard Component", () => {

  const mockAlbum = {
    id: 10,
    title: "Mi Álbum de Prueba",
    cover_image: null,
    theme: "Fútbol",
    stickers_count: 120,
  };

  const renderCard = (album = mockAlbum) =>
    render(
      <BrowserRouter>
        <AlbumCard album={album} />
      </BrowserRouter>
    );

  it("renderiza el título del álbum", () => {
    renderCard();

    expect(screen.getByText("Mi Álbum de Prueba")).toBeInTheDocument();
  });

  it("muestra el tema y cantidad de stickers", () => {
    renderCard();

    expect(screen.getByText(/Fútbol · 120 stickers/)).toBeInTheDocument();
  });

  it("muestra el placeholder si no hay cover_image", () => {
    renderCard();

    const img = screen.getByRole("img");

    expect(img).toHaveAttribute(
      "src",
      "https://placehold.co/600x240?text=Album"
    );
  });

  it("genera el link correcto hacia el álbum", () => {
    renderCard();

    const link = screen.getByRole("link", { name: /Ver álbum/i });

    expect(link).toHaveAttribute("href", "/app/albums/10");
  });

  it("muestra 'Sin tema' cuando no hay tema", () => {
    const albumSinTema = {
      ...mockAlbum,
      theme: null,
    };

    renderCard(albumSinTema);

    expect(screen.getByText(/Sin tema · 120 stickers/)).toBeInTheDocument();
  });
});
