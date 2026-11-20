// Svelte action shared by all themes: handles clicks on the `#tag` buttons
// rendered inside memo HTML, and marks the currently selected tag as `.active`.
type TagLinkOptions = {
  selected: string | null;
  onSelect: (tag: string) => void;
};

export function tagLinks(node: HTMLElement, options: TagLinkOptions) {
  let current = options;

  const mark = () => {
    node.querySelectorAll<HTMLElement>('.tag-link').forEach((el) => {
      el.classList.toggle('active', !!current.selected && el.dataset.tag === current.selected);
    });
  };

  const onClick = (event: MouseEvent) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>('.tag-link');
    if (!el || !node.contains(el)) return;
    event.preventDefault();
    const tag = el.dataset.tag;
    if (tag) current.onSelect(tag);
  };

  // Memos are added when loading more or filtering: keep `.active` in sync
  const observer = new MutationObserver(mark);
  observer.observe(node, { childList: true, subtree: true });
  node.addEventListener('click', onClick);
  mark();

  return {
    update(next: TagLinkOptions) {
      current = next;
      mark();
    },
    destroy() {
      observer.disconnect();
      node.removeEventListener('click', onClick);
    },
  };
}
