(function () {
  function normalizeSpaces(value) {
    return String(value || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  }

  function isAnchorId(value) {
    return /^\d+-\d+$/.test(String(value || ""));
  }

  function hasClass(el, className) {
    if (!el) return false;
    if (el.classList) return el.classList.contains(className);
    return new RegExp("(^|\\s)" + className + "(\\s|$)").test(el.className || "");
  }

  function addClass(el, className) {
    if (!el) return;
    if (el.classList) {
      el.classList.add(className);
      return;
    }
    if (!hasClass(el, className)) el.className = (el.className ? el.className + " " : "") + className;
  }

  function closestTag(el, tagName) {
    var node = el;
    var target = String(tagName || "").toUpperCase();
    while (node && node.nodeType === 1) {
      if (node.tagName === target) return node;
      node = node.parentNode;
    }
    return null;
  }

  function getAnchorLabel(anchor) {
    var tr = closestTag(anchor, "tr");
    if (tr) {
      var text = normalizeSpaces(tr.textContent || tr.innerText || "");
      if (text) return text;
    }

    var parent = anchor && anchor.parentNode;
    if (parent && parent.nodeType === 1) {
      var parentText = normalizeSpaces(parent.textContent || parent.innerText || "");
      if (parentText) return parentText;
    }

    return (anchor && (anchor.id || anchor.name)) || "Secao";
  }

  function clampLabel(label) {
    var value = String(label || "");
    if (value.length <= 80) return value;
    return value.substring(0, 77) + "...";
  }

  function cleanDocTitle(title) {
    var value = normalizeSpaces(title || "");
    value = value.replace(/^[^-]+-\s*APS\s*-\s*/i, "");
    value = normalizeSpaces(value);
    return value || "Documentacao";
  }

  function parseActivityLabel(raw) {
    var value = normalizeSpaces(raw || "");
    var match = value.match(/^(\d{1,3})\s*Atividade\s*:\s*(.+)$/i);
    if (!match) match = value.match(/^(\d{1,3})\s+-\s+(.+)$/i);
    if (!match) return null;

    var num = match[1];
    var parsedNum = parseInt(num, 10);
    var badge = isNaN(parsedNum) ? num : String(parsedNum);
    var text = normalizeSpaces(match[2] || "");
    if (!text) return null;
    text = normalizeSpaces(text.replace(/\b(Finalidade|Artefatos|Papel|Ferramentas|Passos)\b[\s\S]*$/i, ""));
    if (/^\d+$/.test(text)) return null;

    return { badge: badge, text: text };
  }

  function markActivityTables(contentRoot) {
    var cells = contentRoot.querySelectorAll(
      'td[style*="background:#99CCFF"], td[style*="background: #99CCFF"], td[style*="background-color:#99CCFF"], td[style*="background-color: #99CCFF"]'
    );
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var table = closestTag(cell, "table");
      if (!table) continue;
      addClass(table, "pds-activityTable");
    }
  }

  function buildToc(contentRoot) {
    var anchors = contentRoot.querySelectorAll("a[name], a[id]");
    var items = [];
    var seen = {};
    var i;

    for (i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      if (!a) continue;
      var anchorId = a.getAttribute("id") || "";
      var anchorName = a.getAttribute("name") || "";
      var key = anchorId || anchorName;
      if (!key || !isAnchorId(key) || seen[key]) continue;

      if (!anchorId && anchorName) a.setAttribute("id", anchorName);

      var labelRaw = getAnchorLabel(a);
        var parsed = parseActivityLabel(labelRaw);
        if (!parsed) continue;

      seen[key] = true;
      items.push({ id: key, badge: parsed.badge, label: clampLabel(parsed.text) });
    }

    return items;
  }

  function setActiveTocItem(sidebar) {
    var links = sidebar.querySelectorAll('a[href^="#"]');
    if (!links || links.length === 0) return;

    var entries = [];
    var i;
    for (i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") continue;
      var id = href.substring(1);
      if (!id) continue;
      var anchor = document.getElementById(id);
      if (!anchor) continue;
      entries.push({ id: id, link: link, anchor: anchor });
    }

    if (entries.length === 0) return;

    function getDocScrollTop() {
      return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function getPageTop(el) {
      if (!el) return 0;
      if (el.getBoundingClientRect) return el.getBoundingClientRect().top + getDocScrollTop();
      return el.offsetTop || 0;
    }

    function clearActive() {
      for (i = 0; i < entries.length; i++) {
        if (entries[i].link && entries[i].link.classList) entries[i].link.classList.remove("pds-active");
        else if (entries[i].link) entries[i].link.className = (entries[i].link.className || "").replace(/\bpds-active\b/g, "");
      }
    }

    function setActive(index) {
      if (index < 0 || index >= entries.length) return;
      var link = entries[index].link;
      if (!link) return;
      if (link.classList) link.classList.add("pds-active");
      else link.className = normalizeSpaces((link.className || "") + " pds-active");
    }

    function updateActive() {
      var scrollY = getDocScrollTop() + 120;
      var activeIndex = -1;

      for (i = 0; i < entries.length; i++) {
        if (getPageTop(entries[i].anchor) <= scrollY) activeIndex = i;
      }

      clearActive();
      setActive(activeIndex);
    }

    if (window.addEventListener) window.addEventListener("scroll", updateActive);
    else if (window.attachEvent) window.attachEvent("onscroll", updateActive);
    updateActive();
  }

  function enhance() {
    var body = document.body;
    if (!body || !hasClass(body, "pds-doc")) return;

    var shell = document.createElement("div");
    shell.className = "pds-shell";

    var sidebar = document.createElement("aside");
    sidebar.className = "pds-sidebar";

    var sidebarTitle = document.createElement("span");
    sidebarTitle.className = "pds-sidebarTitle";
    sidebarTitle.appendChild(document.createTextNode("CONTEUDO"));
    sidebar.appendChild(sidebarTitle);

    var main = document.createElement("main");
    main.className = "pds-main";

    var topbar = document.createElement("div");
    topbar.className = "pds-topbar";

    var back = document.createElement("a");
    back.className = "pds-back";
    back.href = "../PDS_01.htm";
    back.target = "_top";
    back.rel = "noopener noreferrer";
    back.appendChild(document.createTextNode("Voltar ao PDS"));

    var title = document.createElement("p");
    title.className = "pds-title";
    title.appendChild(document.createTextNode(cleanDocTitle(document.title)));

    topbar.appendChild(back);
    topbar.appendChild(title);

    var content = document.createElement("div");
    content.className = "pds-content";

    while (body.firstChild) {
      content.appendChild(body.firstChild);
    }

    markActivityTables(content);

    var tocItems = buildToc(content);
    if (tocItems.length > 0) {
      var ul = document.createElement("ul");
      ul.className = "pds-toc";
      for (var i = 0; i < tocItems.length; i++) {
        var item = tocItems[i];
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + item.id;
        var badge = document.createElement("span");
        badge.className = "pds-stepBadge";
        badge.appendChild(document.createTextNode(item.badge));

        var text = document.createElement("span");
        text.className = "pds-stepText";
        text.appendChild(document.createTextNode(item.label));

        a.appendChild(badge);
        a.appendChild(text);
        li.appendChild(a);
        ul.appendChild(li);
      }
      sidebar.appendChild(ul);
      setActiveTocItem(sidebar);
    } else {
      var empty = document.createElement("div");
      empty.style.color = "var(--pds-muted)";
      empty.style.fontSize = "14px";
      empty.appendChild(document.createTextNode("Sem indice nesta pagina."));
      sidebar.appendChild(empty);
    }

    main.appendChild(topbar);
    main.appendChild(content);

    shell.appendChild(sidebar);
    shell.appendChild(main);
    body.appendChild(shell);
    addClass(body, "pds-doc-enhanced");
  }

  if (document.readyState === "loading") {
    if (document.addEventListener) document.addEventListener("DOMContentLoaded", enhance);
    else if (document.attachEvent) document.attachEvent("onreadystatechange", enhance);
  } else {
    enhance();
  }
})();

