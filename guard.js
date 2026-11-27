(function () {
  if (window.top !== window.self) {
    try {
      window.top.location = window.self.location.href;
    } catch (error) {
      document.documentElement.style.display = "none";
    }
  }
})();
