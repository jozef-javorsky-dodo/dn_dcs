import "@std/dotenv/load";

import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import jsx from "lume/plugins/jsx_preact.ts";
import mdx from "lume/plugins/mdx.ts";
import ogImages from "lume/plugins/og_images.ts";
import postcss from "lume/plugins/postcss.ts";
import redirects from "lume/plugins/redirects.ts";
import search from "lume/plugins/search.ts";
import sitemap from "lume/plugins/sitemap.ts";

import tw from "tailwindcss";
import tailwindConfig from "./tailwind.config.js";

import Prism from "./prism.ts";

import title from "https://deno.land/x/lume_markdown_plugins@v0.7.0/title.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";
import { CSS as GFM_CSS } from "https://jsr.io/@deno/gfm/0.8.2/style.ts";
import { log } from "lume/core/utils/log.ts";
import anchor from "npm:markdown-it-anchor@9";
import admonitionPlugin from "./markdown-it/admonition.ts";
import codeblockCopyPlugin from "./markdown-it/codeblock-copy.ts";
import codeblockTitlePlugin from "./markdown-it/codeblock-title.ts";
import relativeLinksPlugin from "./markdown-it/relative-path.ts";
import replacerPlugin from "./markdown-it/replacer.ts";
import apiDocumentContentTypeMiddleware from "./middleware/apiDocContentType.ts";
import createRoutingMiddleware from "./middleware/functionRoutes.ts";
import createGAMiddleware from "./middleware/googleAnalytics.ts";
import redirectsMiddleware, {
  toFileAndInMemory,
} from "./middleware/redirects.ts";
import { cliNow } from "./timeUtils.ts";

const site = lume(
  {
    location: new URL("https://docs.deno.com"),
    caseSensitiveUrls: true,
    emptyDest: false,
    server: {
      middlewares: [
        redirectsMiddleware,
        createRoutingMiddleware(),
        createGAMiddleware({
          addr: { transport: "tcp", hostname: "localhost", port: 3000 },
        }),
        apiDocumentContentTypeMiddleware,
      ],
      page404: "/404/",
    },
    watcher: {
      ignore: ["/.git", "/.github", "/.vscode"],
      debounce: 1_000,
    },
  },
  {
    markdown: {
      plugins: [
        replacerPlugin,
        admonitionPlugin,
        codeblockCopyPlugin,
        codeblockTitlePlugin,
        [
          anchor,
          {
            permalink: anchor.permalink.linkInsideHeader({
              symbol:
                `<span class="sr-only">Jump to heading</span><span aria-hidden="true" class="anchor-end">#</span>`,
              placement: "after",
            }),
            getTokensText(tokens: { type: string; content: string }[]) {
              return tokens
                .filter((t) => ["text", "code_inline"].includes(t.type))
                .map((t) => t.content.replaceAll(/ \([0-9/]+?\)/g, ""))
                .join("")
                .trim();
            },
          },
        ],
        relativeLinksPlugin,
      ],
      options: {
        linkify: true,
        langPrefix: "highlight notranslate language-",
        highlight: (code, lang) => {
          if (!lang || !Prism.languages[lang]) {
            return code;
          }
          const result = Prism.highlight(code, Prism.languages[lang], lang);
          return result || code;
        },
      },
    },
  },
);

// ignore some folders that have their own build tasks
// site.ignore("styleguide");

site.copy("static", ".");
site.copy("timeUtils.ts");
site.copy("subhosting/api/images");
site.copy("deploy/docs-images");
site.copy("deploy/images");
site.copy("deploy/kv/manual/images");
site.copy("deploy/tutorials/images");
site.copy("deploy/kv/tutorials/images");
site.copy("runtime/fundamentals/images");
site.copy("runtime/getting_started/images");
site.copy("runtime/reference/images");
site.copy("runtime/contributing/images");
site.copy("examples/tutorials/images");
site.copy("deploy/manual/images");
site.copy("deploy/early-access/images");
site.copy("deno.json");
site.copy("go.json");
site.copy("oldurls.json");
site.copy("server.ts");
site.copy("middleware");
site.copy("examples/scripts");
site.copy(".env");

site.use(
  redirects({
    output: toFileAndInMemory,
  }),
);

site.use(search());
site.use(jsx());
site.use(mdx());

site.use(
  postcss({
    plugins: [tw(tailwindConfig)],
  }),
);

site.use(
  esbuild({
    extensions: [".client.ts", ".client.js"],
    options: {
      minify: false,
      splitting: true,
    },
  }),
);

site.use(toc({ anchor: false }));
site.use(title());
site.use(sitemap());

site.addEventListener("afterBuild", async () => {
  // Write GFM CSS
  Deno.writeTextFileSync(site.dest("gfm.css"), GFM_CSS);

  // Generate LLMs documentation files directly to _site directory
  if (Deno.env.get("BUILD_TYPE") == "FULL") {
    try {
      const { default: generateModule } = await import(
        "./generate_llms_files.ts"
      );
      const { collectFiles, generateLlmsTxt, generateLlmsFullTxt } =
        generateModule;

      log.info("Generating LLM-friendly documentation files...");

      const files = await collectFiles();
      log.info(`Collected ${files.length} documentation files for LLMs`);

      // Generate llms.txt
      const llmsTxt = generateLlmsTxt(files);
      Deno.writeTextFileSync(site.dest("llms.txt"), llmsTxt);
      log.info("Generated llms.txt in site root");

      // Generate llms-full.txt
      const llmsFullTxt = generateLlmsFullTxt(files);
      Deno.writeTextFileSync(site.dest("llms-full.txt"), llmsFullTxt);
      log.info("Generated llms-full.txt in site root");
    } catch (error) {
      log.error("Error generating LLMs files:", error);
    }
  }
});

site.copy("reference_gen/gen/deno/page.css", "/api/deno/page.css");
site.copy("reference_gen/gen/deno/styles.css", "/api/deno/styles.css");
site.copy("reference_gen/gen/deno/script.js", "/api/deno/script.js");

site.copy("reference_gen/gen/web/page.css", "/api/web/page.css");
site.copy("reference_gen/gen/web/styles.css", "/api/web/styles.css");
site.copy("reference_gen/gen/web/script.js", "/api/web/script.js");

site.copy("reference_gen/gen/node/page.css", "/api/node/page.css");
site.copy("reference_gen/gen/node/styles.css", "/api/node/styles.css");
site.copy("reference_gen/gen/node/script.js", "/api/node/script.js");

site.ignore(
  "old",
  "README.md",
  (path) => path.match(/\/reference_gen.*.ts/) !== null,
  (path) => path.includes("/reference_gen/node_modules"),
  (path) => path.includes("/reference_gen/node_descriptions"),
  (path) => path.includes("/lint/rules/"),
  // "deploy",
  // "runtime",
  // "subhosting",
  // "404",
);

// the default layout if no other layout is specified
site.data("layout", "doc.tsx");

// Do more expensive operations if we're building the full site
if (Deno.env.get("BUILD_TYPE") == "FULL") {
  // Use Lume's built in date function to get the last modified date of the file
  // site.data("date", "Git Last Modified");;

  // Generate Open Graph images
  site.data("openGraphLayout", "/open_graph/default.jsx");
  site.use(
    ogImages({
      satori: {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Courier",
            style: "normal",
            data: await Deno.readFile(
              "./static/fonts/courier/CourierPrime-Regular.ttf",
            ),
          },
          {
            name: "Inter",
            weight: 400,
            style: "normal",
            data: await Deno.readFile(
              "./static/fonts/inter/hacked/Inter-Regular-hacked.woff",
            ),
          },
          {
            name: "Inter",
            weight: 700,
            style: "normal",
            data: await Deno.readFile(
              "./static/fonts/inter/hacked/Inter-SemiBold-hacked.woff",
            ),
          },
        ],
      },
      cache: false,
    }),
  );
}

site.scopedUpdates(
  (path) => path == "/overrides.css",
  (path) => /\.(js|ts)$/.test(path),
  (path) => path.startsWith("/api/deno/"),
);

site.addEventListener("afterStartServer", () => {
  log.warn(
    `${cliNow()} Server available at <green>http://localhost:3000</green>`,
  );
});

export default site;
