import Mustache from "mustache";

export async function renderTemplate(templatePath, userData = {}) {
  try {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error("Failed to fetch template");
    const template = await res.text();
    return Mustache.render(template, userData);
  } catch (err) {
    console.error("Error rendering template:", err);
    return "";
  }
}
