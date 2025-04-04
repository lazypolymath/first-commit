(async () => {
  const tabContainerSelector =
    ".position-relative.header-wrapper.js-header-wrapper > header > div.AppHeader-localBar > nav > ul";

  const renderTab = async () => {
    const url = new URL(document.location.href);

    let pathname = url.pathname.substring(1);

    const segments = pathname.split("/");

    // We can be sure there are at-least two url segments because of the // @match property of the userscript.
    const author = segments[0].trim();
    const repositoryName = segments[1].trim();

    if (author === "" || repositoryName === "") {
      return;
    }

    const tabContainerEl = document.querySelector(tabContainerSelector);

    if (!tabContainerEl) {
      return;
    }

    const lastEl = tabContainerEl.querySelector("li:last-child");

    if (!lastEl) {
      return;
    }

    let response = await fetch(
      `https://api.github.com/repos/${author}/${repositoryName}/commits?per_page=1&page=1`
    );

    // https://github.com/khalidbelk/FirstCommitter/blob/main/server/githubApi.ts#L34
    const linkHeader = response.headers.get("link");

    const matches = /rel="next",\s\<(.*?)\>;\srel="last"/.exec(
      linkHeader || ""
    );

    if (!matches || !matches.length) {
      return;
    }

    const firstCommitURL = matches[1];

    response = await fetch(firstCommitURL);

    const json = await response.json();

    if (json && json.length && json[0].sha) {
      const data = json[0];

      const sha = data.sha;
      const commit = data.commit;

      const firstCommitTabEl = lastEl.cloneNode(true) as HTMLLIElement;
      firstCommitTabEl.querySelector("a")?.remove();

      const tabLinkEl = document.createElement("a");
      tabLinkEl.id = "first-commit-tab-link";
      tabLinkEl.title = `Message: ${commit.message} \nAuthor: ${
        commit.committer.name || "Anonymous"
      }\nDateTime: ${commit.committer.date}\nComments: ${commit.comment_count || 0}`;
      tabLinkEl.setAttribute(
        "class",
        lastEl.querySelector("a")?.getAttribute("class") || ""
      );
      tabLinkEl.href = `https://github.com/${author}/${repositoryName}/commit/${sha}`;
      tabLinkEl.innerHTML = `
      <svg aria-hidden="true" focusable="false" class="octicon octicon-history" viewBox="0 -2 20 20" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"></path></svg>
      <span data-content="First Commit">First Commit</span>
      `;

      tabContainerEl.append(tabLinkEl);
    }
  };

  const handleHistoryChange = async () => {
    setTimeout(async () => {
      if (document.querySelector("#first-commit-tab-link")) {
        return;
      }

      await renderTab();
    }, 1000);
  };

  (function (history) {
    const originalPushState = history.pushState;

    history.pushState = function (...args) {
      const result = originalPushState.apply(this, args);

      const pushStateEvent = new CustomEvent("pushState", {
        detail: { ...args },
      });

      window.dispatchEvent(pushStateEvent);

      return result;
    };
  })(window.history);

  window.addEventListener("popstate", handleHistoryChange);
  window.addEventListener("pushState", handleHistoryChange);

  await renderTab();
})();
