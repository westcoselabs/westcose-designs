/** Curved CSS paper surface. The original article remains the semantic content. */
export function createFlexiblePage(page: HTMLElement) {
  const front = page.querySelector<HTMLElement>(".wc-refined-sketchbook__page-front");
  if (!front) return null;
  const surface = document.createElement("div");
  surface.className = "wc-page-flex";
  surface.setAttribute("aria-hidden", "true");
  surface.inert = true;
  const count = 14;
  const strips = Array.from({ length: count }, () => {
    const strip = document.createElement("div");
    strip.className = "wc-page-flex__strip";
    const face = document.createElement("div");
    face.className = "wc-page-flex__face";
    const copy = front.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    face.append(copy);
    const back = document.createElement("div");
    back.className = "wc-page-flex__back";
    strip.append(face, back);
    surface.append(strip);
    return { strip, copy };
  });
  page.append(surface);
  const measure = () => {
    const width = page.offsetWidth;
    strips.forEach(({ strip, copy }, i) => {
      strip.style.width = `${width / count + .5}px`;
      copy.style.width = `${width}px`;
      copy.style.height = `${page.offsetHeight}px`;
      copy.style.left = `${-i * width / count}px`;
    });
    return width / count;
  };
  let segment = measure();
  return {
    measure() { segment = measure(); },
    render(turn: number) {
      const turning = turn > .001 && turn < .999;
      page.dataset.turning = String(turning);
      let x = 0, z = 0;
      const bend = Math.sin(turn * Math.PI) * .95;
      strips.forEach(({ strip }, i) => {
        const angle = ((i + .5) / count - .5) * bend;
        strip.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${angle}rad)`;
        strip.style.setProperty("--wc-curl-shade", String(Math.abs(Math.sin(angle)) * .14));
        x += Math.cos(angle) * segment;
        z -= Math.sin(angle) * segment;
      });
    },
    dispose() { surface.remove(); delete page.dataset.turning; },
  };
}
