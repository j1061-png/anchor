/* Applies the saved theme before first paint so there is no flash.
   Loaded synchronously from <head>; keep it tiny. */
(function () {
  try {
    var saved = localStorage.getItem("anchor-theme");
    var dark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var el = document.documentElement;
    el.classList.toggle("dark", dark);
    el.style.colorScheme = dark ? "dark" : "light";
  } catch {
    /* Private mode or storage disabled: fall back to light. */
  }
})();
