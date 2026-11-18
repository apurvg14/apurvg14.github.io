(function () {
  if (window.top !== window.self) {
    try {
      window.top.location = window.self.location.href;
    } catch (error) {
      document.documentElement.style.display = "none";
    }
  }
  var theme = null;
  try {
    theme = localStorage.getItem("theme");
  } catch (error) {
    theme = null;
  }
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
})();
