# MoTA DBIM Kit (code)

The reusable DBIM/GIGW components of the tribal.gov.in pilot, packaged for other MoTA portals.

**Documentation is kept outside the code**, in
[`docs/Component-Kit/`](../../docs/Component-Kit/README.md): how to use the
kit, the component list and approval status, the changelog, and the integration guides for
ASP.NET, PHP and static sites.

| Path | Contents |
|---|---|
| `src/css/`, `src/js/` | Sources; the pilot site imports them directly |
| `dist/` | The built kit that a portal copies (`npm run kit:build`) |
| `templates/`, `examples/` | Header, footer, dialogs, chat assistant and page shell in English and Hindi, and the gallery; generated from the built pilot |
| `build.mjs`, `extract.mjs` | Kit build: bundles the CSS and JS and cuts the templates out of the pilot build |
| `test.mjs` | Kit UAT suite |

Build and test from the repository root:

```bash
npm run build        # the pilot site first
npm run kit:build    # dist/, templates/, examples/
npm run kit:test     # evidence → docs/Evidence/uat-kit/
```
