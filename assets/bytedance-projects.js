(() => {
  const sectionTitle = "TIKTOKでの制作物";

  const projects = [
    {
      id: "byte-01",
      image: "media/xingtuqicheLOGO1.png",
      title: "星図自動車",
      pages: ["media/xingtu1.png", "media/xingtu2.png"],
    },
    {
      id: "byte-02",
      image: "media/H5LOGO.png",
      title: "H5ページデザインツール",
      pages: ["media/H51.png", "media/H52.png"],
    },
  ];

  function closeProject(view) {
    document.body.style.overflow = "";
    document.removeEventListener("keydown", view._closeOnEscape);
    view.remove();
  }

  function setupBookMagnifier() {
    const supportsMouseMagnifier = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    if (!supportsMouseMagnifier.matches) return;

    const magnifier = document.createElement("div");
    magnifier.className = "book-magnifier";
    magnifier.setAttribute("aria-hidden", "true");
    document.body.append(magnifier);

    const hideMagnifier = () => magnifier.classList.remove("is-visible");
    let lastMouseEvent;

    const updateMagnifier = (event) => {
      const page = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest(".book-page");
      const image = page?.querySelector("img");
      const bookShell = page?.closest(".book-shell");
      if (
        !image ||
        !image.complete ||
        !image.naturalWidth ||
        bookShell?.querySelector(".book-flip-sheet")
      ) {
        hideMagnifier();
        return;
      }

      const imageBounds = image.getBoundingClientRect();
      const lensSize = 180;
      const magnification = 2.25;
      const pointerX = event.clientX - imageBounds.left;
      const pointerY = event.clientY - imageBounds.top;

      magnifier.style.left = `${event.clientX - lensSize / 2}px`;
      magnifier.style.top = `${event.clientY - lensSize / 2}px`;
      magnifier.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
      magnifier.style.backgroundSize = `${imageBounds.width * magnification}px ${imageBounds.height * magnification}px`;
      magnifier.style.backgroundPosition = `${lensSize / 2 - pointerX * magnification}px ${lensSize / 2 - pointerY * magnification}px`;
      magnifier.classList.add("is-visible");
    };

    document.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      lastMouseEvent = event;
      updateMagnifier(event);
    });

    document.addEventListener("pointerout", (event) => {
      if (event.pointerType !== "mouse") return;

      const page = event.target.closest(".book-page");
      if (page && !page.contains(event.relatedTarget)) hideMagnifier();
    });

    document.addEventListener(
      "animationstart",
      (event) => {
        if (event.target.matches?.(".book-flip-sheet")) hideMagnifier();
      },
      true,
    );

    document.addEventListener(
      "animationend",
      (event) => {
        if (!event.target.matches?.(".book-flip-sheet") || !lastMouseEvent) return;

        window.requestAnimationFrame(() => updateMagnifier(lastMouseEvent));
      },
      true,
    );

    const flipObserver = new MutationObserver((mutations) => {
      const flipSheetChanged = mutations.some((mutation) =>
        [...mutation.addedNodes, ...mutation.removedNodes].some(
          (node) => node.nodeType === Node.ELEMENT_NODE && node.classList.contains("book-flip-sheet"),
        ),
      );
      if (!flipSheetChanged || !lastMouseEvent) return;

      window.requestAnimationFrame(() => updateMagnifier(lastMouseEvent));
    });

    flipObserver.observe(document.body, { childList: true, subtree: true });
  }

  function openProject(project) {
    const existing = document.querySelector(".bytedance-project-view");
    if (existing) closeProject(existing);

    const view = document.createElement("div");
    view.className = "project-view bytedance-project-view";
    view.setAttribute("role", "dialog");
    view.setAttribute("aria-modal", "true");
    view.setAttribute("aria-label", project.title);
    view.innerHTML = `
      <button class="close-button" type="button" aria-label="Close project">×</button>
      <article class="project-page project-page--kanji">
        <section class="book-stage" aria-label="${project.title} book preview">
          <span class="book-title">「${project.title}」</span>
          <div class="book-shell">
            <div class="book-spread">
              <figure class="book-page book-page--left">
                <img src="${project.pages[0]}" alt="${project.title} left page" draggable="false" decoding="async">
              </figure>
              <figure class="book-page book-page--right">
                <img src="${project.pages[1]}" alt="${project.title} right page" draggable="false" decoding="async">
              </figure>
            </div>
          </div>
        </section>
        <div class="related-strip related-strip--logos">
          ${projects
            .filter((relatedProject) => relatedProject.id !== project.id)
            .map(
              (relatedProject) => `
                <img
                  class="related-logo"
                  src="${relatedProject.image}"
                  alt="${relatedProject.title} related preview"
                  data-project-id="${relatedProject.id}"
                  tabindex="0"
                  role="button"
                >`,
            )
            .join("")}
        </div>
      </article>
    `;

    const close = () => closeProject(view);
    view.querySelector(".close-button").addEventListener("click", close);
    view.querySelectorAll(".related-logo").forEach((relatedLogo) => {
      const relatedProject = projects.find(
        (item) => item.id === relatedLogo.dataset.projectId,
      );
      const openRelatedProject = () => openProject(relatedProject);

      relatedLogo.addEventListener("click", openRelatedProject);
      relatedLogo.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openRelatedProject();
        }
      });
    });
    view._closeOnEscape = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", view._closeOnEscape);
    document.body.style.overflow = "hidden";
    document.body.append(view);
  }

  function updateByteDanceCards() {
    const cards = document.querySelectorAll("#bytedance .sticker-loop-card");
    if (!cards.length) {
      window.setTimeout(updateByteDanceCards, 50);
      return;
    }

    updateSectionTitle();
    cards.forEach((card, index) => {
      const project = projects[index % projects.length];
      const image = card.querySelector("img");
      const logoSize = index % projects.length === 0 ? "92%" : "60%";
      image.src = project.image;
      image.alt = project.title;
      image.style.width = logoSize;
      image.style.height = logoSize;
      image.style.transform =
        index % projects.length === 1 ? "translateY(-28px)" : "";
      card.style.transform = "translateZ(0)";
      card.setAttribute("aria-label", `Open ${project.title}`);
      card.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openProject(project);
      });
    });
  }

  function updateSectionTitle() {
    const section = document.querySelector("#bytedance");
    if (!section) return;

    const heading = section.querySelector("h2");
    if (heading) heading.textContent = sectionTitle;

    const logoLoop = section.querySelector('[role="region"]');
    if (logoLoop) logoLoop.setAttribute("aria-label", `${sectionTitle} logo loop`);

    document
      .querySelectorAll('a[href="#bytedance"]')
      .forEach(updateNavigationLink);
  }

  function updateNavigationLink(link) {
    const textNode = Array.from(link.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE,
    );

    if (textNode) {
      textNode.nodeValue = sectionTitle;
    } else {
      link.prepend(document.createTextNode(sectionTitle));
    }
  }

  const navigationLabelObserver = new MutationObserver(() => {
    const navigationLink = document.querySelector('a[href="#bytedance"]');
    if (!navigationLink) return;

    updateNavigationLink(navigationLink);
    navigationLabelObserver.disconnect();
  });

  navigationLabelObserver.observe(document.body, { childList: true, subtree: true });

  updateByteDanceCards();
  setupBookMagnifier();
})();
