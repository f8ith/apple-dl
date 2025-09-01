// global CSS
import { createMutationObserver } from '@solid-primitives/mutation-observer';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import { getPanel, IPanelResult, showToast } from '@violentmonkey/ui';
// global CSS
import globalCss from './style.css';
// CSS modules
import styles, { stylesheet } from './style.module.css';

// Inject settings context menu
const body = document.body;
createMutationObserver(
  () => [body],
  { attributes: true, subtree: true },
  (e) => {
    e.forEach((element) => {
      const el = element.target as HTMLElement;
      if (el.nodeName === 'AMP-CONTEXTUAL-MENU-ITEM') {
        const div = el.parentElement;
        if (!div.hasAttribute('injected-apple-dl')) {
          const button = el.querySelector('button');

          if (button.title === 'Settings') {
            render(() => SettingsContextMenu(), div);
            div.setAttribute('injected-apple-dl', '');
          }
        }
      }
    });
  },
);

// Inject download buttons based on window location
function injectSearchPage() {
  var element = document.querySelector('[aria-label="Top Results"]');
}

addEventListener('detectnavigate', (_) => {
  onUrlChange;
});
onUrlChange();

function onUrlChange() {
  if (location.pathname.includes('album')) {
  } else if (location.pathname.includes('playlist')) {
  } else if (location.pathname.includes('search')) {
    injectSearchPage();
  }
}

function submitJob(url: string) {
  const appledl_url = localStorage.getItem('apple-dl-url');
  if (appledl_url) {
    GM_xmlhttpRequest({
      method: 'POST',
      url: appledl_url + '/api/submit_job',
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        url: url,
      }),
      onload: (response) => {
        const json = JSON.parse(response.responseText);
        if (json.status === 'ok') {
          showToast('apple-dl done', { theme: 'dark' });
        } else {
          showToast('apple-dl failed', { theme: 'dark' });
        }
      },
    });
  } else {
    console.error('apple-dl: no url configured');
  }
}

interface SettingsMenuProps {
  panel: IPanelResult;
}

function SettingsMenu(props: SettingsMenuProps) {
  const [url, setUrl] = createSignal(
    window.localStorage.getItem('apple-dl-url'),
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    window.localStorage.setItem('apple-dl-url', url());
    props.panel.hide();
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>apple-dl settings</h1>
        <div>
          <label for="url">apple-dl url</label>
          <input
            id="url"
            type="text"
            value={url()}
            onInput={(e) => setUrl(e.target.value)}
          />
        </div>
        <button type="submit">save</button>
      </form>
    </div>
  );
}

function SettingsContextMenu() {
  const [panelObj, setPanelObj] = createSignal<IPanelResult | null>(null);
  const onClick = () => {
    if (panelObj() != null) {
      panelObj().show();
      return;
    }
    // Let's create a movable panel using @violentmonkey/ui
    const panel = getPanel({
      theme: 'dark',
      // If shadowDOM is enabled for `getPanel` (by default), `style` will be injected to the shadow root.
      // Otherwise, it is roughly the same as `GM_addStyle(stylesheet)`.
      style: stylesheet,
    });
    Object.assign(panel.wrapper.style, {
      top: '50%',
      left: '50%',
      innerWidth: 300,
    });
    panel.setMovable(false);
    panel.show();
    render(() => SettingsMenu({ panel }), panel.body);
    setPanelObj(panel);
  };
  return (
    <amp-contextual-menu-item hydrated>
      <li class="contextual-menu-item">
        <button onClick={onClick} title="apple-dl settings">
          <span class="contextual-menu-item__option-wrapper">
            <span class="contextual-menu-item__option-text">
              apple-dl settings
            </span>
            <span class="contextual-menu-item__option-text contextual-menu-item__option-text--after"></span>
          </span>
        </button>
      </li>
    </amp-contextual-menu-item>
  );
}

interface AppleDlContextMenuProps {
  id: number;
  url: string;
}

function AppleDlContextMenu(props: AppleDlContextMenuProps) {
  const onClick = () => {
    console.log(props.url);
  };
  return (
    <amp-contextual-menu-item data-menu-id={`${props.id}`} hydrated>
      <li class="contextual-menu-item">
        <button onClick={onClick} title="Send to apple-dl">
          <span class="contextual-menu-item__option-wrapper">
            <span class="contextual-menu-item__option-text">
              Send to apple-dl
            </span>
            <span class="contextual-menu-item__option-text contextual-menu-item__option-text--after"></span>
          </span>
        </button>
      </li>
    </amp-contextual-menu-item>
  );
}

// Inject CSS
GM_addStyle(globalCss);

//function doForEachOnce(list, theFunc) {
//  list.forEach((i) => {
//    if (!i._is_processed) {
//      i._is_processed = true;
//      return theFunc(i);
//    } else {
//      return null;
//    }
//  });
//}

//setInterval(function () {
//  doForEachOnce(
//    Array.from(document.querySelectorAll('.contextual-menu__list')),
//    (i) => InjectMenuItem(i),
//  );
//}, 500);
//
