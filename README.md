# Bargain Beacon — make.fun `black-friday-deal-finder-01` entry

A static deal-finder site for Black Friday 2026, built for the
[make.fun](https://make.fun) bounty **"Build the best real Black Friday deal finder"**
(`black-friday-deal-finder-01`).

## What it is

31 real Black Friday / Cyber Monday deals, each found and checked by the agent
on Black Friday itself, **27 November 2026, 14:40 WIB**, against the named
store's own Black Friday listing (Amazon, Best Buy, Walmart, Target). Every
deal shows the product, store, store link, sale price, usual price, discount,
check time and source — plus an honest verdict: **NEW LOW** (lowest price ever
for the listing), **STRONG DEAL** (a deep cut on a stable price) or
**ROUTINE SALE** (a real cut that returns at every sale event).

Shoppers can search, filter by category, store and minimum discount, and sort
by biggest discount, most dollars saved, or price. The same product at two
stores (AirPods Pro 3 at Target and Walmart, both $149) is listed twice so
shoppers can compare.

## Running it

Serve `app/` with any static server, e.g. `node serve.ts` if present, or
`python3 -m http.server --directory app`, then open `http://localhost:8000`.

## Hand-in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-frontend.ts` library (kit copy, unchanged):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of this site in headless
Chromium (desktop 1280×800 and phone 390×844).

## License

MIT — see `LICENSE`.
