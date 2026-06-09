import type { MetadataRoute } from "next";

const BASE = "https://kitfolio.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/json-formatter", "/css-gradient", "/character-counter"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
