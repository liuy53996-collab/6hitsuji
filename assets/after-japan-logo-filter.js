(() => {
  const removeInProgressLogo = () => {
    document
      .querySelectorAll("#after-japan .sticker-loop-card--4")
      .forEach((logo) => logo.remove());
  };

  const observer = new MutationObserver(removeInProgressLogo);
  observer.observe(document.body, { childList: true, subtree: true });
  removeInProgressLogo();
})();
