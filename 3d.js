const THRESHOLD = 15;

function handleHover(card, e) {
  const { clientX, clientY, currentTarget } = e;
  const { clientWidth, clientHeight } = currentTarget;
  const offsetLeft = currentTarget.getBoundingClientRect().left;
  const offsetTop = currentTarget.getBoundingClientRect().top;

	const horizontal = (clientX - offsetLeft) / clientWidth;
  const vertical = (clientY - offsetTop) / clientHeight;
  const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2);
  const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2);

  card.style.transform = `perspective(${e.currentTarget.clientWidth}px) rotateY(${-rotateX}deg) rotateX(${-rotateY}deg)`;
}

function resetStyles(card, e) {
  card.style.transform = `perspective(${e.currentTarget.clientWidth}px) rotateX(0deg) rotateY(0deg)`;
}

for (let card of document.querySelectorAll('.link-card')){
  card.addEventListener('mousemove', e => handleHover(card, e));
  card.addEventListener('mouseleave', e => resetStyles(card, e));

  if (!window.matchMedia('(prefers-reduced-motion)').matches) {
    card.addEventListener('mousemove', e => handleHover(card, e));
    card.addEventListener('mouseleave', e => resetStyles(card, e));
  }
}