## Initial setup

#### Install pnpm globally

```
npm i -g pnpm
```

#### Install node modules

```
pnpm i --frozen-lockfile
```

## Run in dev mode

```
pnpm dev
```

## Build android app

```
pnpm build-android
```

## Generate docs

```
pnpm doc
```

-> Visit http://localhost:1234

## Format project

```
pnpm format
```

## Validating project

```
pnpm validate
```

## Test components

#### Without UI

```
pnpm test
```

#### With UI

```
pnpm test:ui
```

## Generate dependency graph

```
pnpm visualize
```
