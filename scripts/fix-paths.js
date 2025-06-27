const fs = require("fs");
const path = require("path");

// Caminho para o index.html gerado pelo Next.js
const indexPath = path.join(__dirname, "..", "out", "index.html");

fs.readFile(indexPath, "utf8", (err, data) => {
  if (err) {
    console.error("Erro ao ler index.html:", err);
    process.exit(1);
  }

  // Corrige caminhos do Next.js: /_next -> ./_next
  let updatedContent = data.replace(/\/_next/g, "./_next");

  // Corrige caminhos de imagens e outros arquivos estáticos que começam com / (exceto /_next)
  updatedContent = updatedContent.replace(
    /(src|href)=["']\/(?!_next)([^"']+)["']/g,
    '$1="./$2"'
  );

  fs.writeFile(indexPath, updatedContent, "utf8", (err) => {
    if (err) {
      console.error("Erro ao escrever index.html:", err);
      process.exit(1);
    } else {
      console.log("Caminhos corrigidos com sucesso.");
    }
  });
});
