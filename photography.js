(() => {
  const cards = [...document.querySelectorAll(".photo")];
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox || !cards.length) return;

  const image = document.querySelector("#lightbox-image");
  const title = document.querySelector("#lightbox-title");
  const date = document.querySelector("#lightbox-date");
  const caption = document.querySelector("#lightbox-caption");
  const post = document.querySelector("#lightbox-post");
  const current = document.querySelector("#lightbox-current");
  let index = 0;

  function show(next) {
    const card = cards[next];
    if (!card) return;
    index = next;
    image.src = card.dataset.image;
    image.alt = card.querySelector("img")?.alt || "";
    title.textContent = card.dataset.title;
    date.textContent = card.dataset.date;
    caption.textContent = card.dataset.caption;
    caption.hidden = !card.dataset.caption;
    post.href = card.dataset.post;
    current.textContent = String(next + 1);
    if (!lightbox.open) lightbox.showModal();
  }

  const move = (step) => show((index + step + cards.length) % cards.length);

  cards.forEach((card, i) => card.addEventListener("click", () => show(i)));
  document.querySelector(".lightbox-close")?.addEventListener("click", () => lightbox.close());
  document.querySelector(".lightbox-previous")?.addEventListener("click", () => move(-1));
  document.querySelector(".lightbox-next")?.addEventListener("click", () => move(1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
  });
})();
