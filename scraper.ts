// const electronPkg = require("electron");
import { request } from "obsidian";

function blank(text: string): boolean {
  return text === undefined || text === null || text === "";
}

function notBlank(text: string): boolean {
  return !blank(text);
}

// async wrapper to load a url and settle on load finish or fail
async function load(window: any, url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    window.webContents.on("did-finish-load", (event: any) => resolve(event));
    window.webContents.on("did-fail-load", (event: any) => reject(event));
    window.loadURL(url);
  });
}

// async function electronGetPageTitle(url: string): Promise<string> {
//   const { remote } = electronPkg;
//   const { BrowserWindow } = remote;

//   try {
//     const window = new BrowserWindow({
//       width: 1000,
//       height: 600,
//       webPreferences: {
//         webSecurity: false,
//         nodeIntegration: true,
//         images: false,
//       },
//       show: false,
//     });

//     await load(window, url);

//     try {
//       const title = window.webContents.getTitle();
//       window.destroy();

//       if (notBlank(title)) {
//         return title;
//       } else {
//         return url;
//       }
//     } catch (ex) {
//       return url;
//     }
//   } catch (ex) {
//     console.error(ex);
//     return "Site Unreachable";
//   }
// }

async function nonElectronGetPageTitle(url: string): Promise<string> {
  try {
    const html = await request({ url });

    const doc = new DOMParser().parseFromString(html, "text/html");
    const title = doc.querySelectorAll("title")[0];

    if (title == null || blank(title?.innerText)) {
      // If site is javascript based and has a no-title attribute when unloaded, use it.
      var noTitle = title?.getAttr("no-title");
      if (notBlank(noTitle)) {
        return noTitle;
      }

      // Otherwise if the site has no title/requires javascript simply return Title Unknown
      return url;
    }

    return title.innerText;
  } catch (ex) {
    console.error(ex);

    return "Site Unreachable";
  }
}

export default async function getPageTitle(url: string): Promise<string> {
  // If we're on Desktop use the Electron scraper
  if (!(url.startsWith("http") || url.startsWith("https"))) {
    url = "https://" + url;
  }
  return nonElectronGetPageTitle(url);

  // if (electronPkg != null) {
  //   return electronGetPageTitle(url);
  // } else {
  //   return nonElectronGetPageTitle(url);
  // }
}
