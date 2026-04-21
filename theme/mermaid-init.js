// Mermaid diagram rendering for mdBook
(function () {
  var script = document.createElement("script");
  script.src =
    "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  script.onload = function () {
    var theme = document.documentElement.classList.contains("navy") ||
                document.documentElement.classList.contains("coal") ||
                document.documentElement.classList.contains("ayu")
      ? "dark"
      : "default";

    mermaid.initialize({ startOnLoad: false, theme: theme });

    document.querySelectorAll("pre code.language-mermaid").forEach(function (el) {
      var pre = el.parentElement;
      var container = document.createElement("div");
      container.className = "mermaid";
      container.textContent = el.textContent;
      pre.parentElement.replaceChild(container, pre);
    });

    mermaid.run();
  };
  document.head.appendChild(script);
})();
