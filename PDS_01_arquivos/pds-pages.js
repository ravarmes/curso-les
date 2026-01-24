(() => {
  const attachmentHrefRegex =
    /\.(docx?|xlsx?|xls|pod|asta|json|pdf)(?:[?#].*)?$/i;

  const markAttachmentLinks = () => {
    const links = document.querySelectorAll("a[href]");
    for (const link of links) {
      const rawHref = link.getAttribute("href");
      if (!rawHref) continue;
      if (!attachmentHrefRegex.test(rawHref)) continue;

      link.setAttribute("target", "_blank");

      const existingRel = (link.getAttribute("rel") || "").trim();
      const relParts = existingRel.length > 0 ? existingRel.split(/\s+/) : [];
      if (!relParts.includes("noopener")) relParts.push("noopener");
      link.setAttribute("rel", relParts.join(" ").trim());
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", markAttachmentLinks);
  } else {
    markAttachmentLinks();
  }
})();
